# MechMind Docker and Docker Compose Design

**Version:** 1.0  
**Last Updated:** 2026-09-04

---

## Overview

MechMind's Docker Compose configuration defines six services:

| Service | Image | Port | Role |
|---------|-------|------|------|
| `api` | Custom Python 3.11 | 8000 (internal) | FastAPI application |
| `frontend` | Custom Node 20 | 3000 (internal) | Next.js application |
| `db` | `pgvector/pgvector:pg16` | 5432 (internal) | PostgreSQL + pgvector |
| `redis` | `redis:7-alpine` | 6379 (internal) | Rate limit counters, job queue |
| `worker` | Same as `api` | None | Background ingestion worker |
| `nginx` | `nginx:alpine` | 80, 443 (host) | Reverse proxy, SSL termination |

Only nginx ports are exposed to the host network. All inter-service communication occurs on internal Docker networks.

---

## Network Design

```
[Host] :80, :443
    |
  [nginx]  — mechmind-public network
    |
  [api]    — mechmind-internal network
  [frontend]
    |
  [db]
  [redis]
  [worker]
```

Two networks are defined:

- **`mechmind-public`:** nginx, api, frontend — services that nginx proxies to
- **`mechmind-internal`:** api, worker, db, redis — services that should not be reachable from nginx directly

This ensures that db and redis are never directly reachable from the nginx container even if nginx is compromised.

---

## Dockerfiles

### API Dockerfile

```dockerfile
# Dockerfile.api
FROM python:3.11-slim AS base

# Install system dependencies (for psycopg2, python-magic, PyMuPDF)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmagic1 \
    libmupdf-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini ./

# Create non-root user
RUN useradd --create-home --shell /bin/bash mechmind
RUN mkdir -p /app/uploads && chown -R mechmind:mechmind /app/uploads
USER mechmind

EXPOSE 8000

# Default command — can be overridden for worker
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

### Frontend Dockerfile

```dockerfile
# Dockerfile.frontend
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build environment variables injected at build time (public vars only)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Next.js standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup --system nextjs && adduser --system --ingroup nextjs nextjs
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### nginx Configuration

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    # Logging
    log_format json_combined escape=json
        '{"time":"$time_iso8601",'
        '"method":"$request_method",'
        '"uri":"$request_uri",'
        '"status":$status,'
        '"duration_ms":$request_time,'
        '"request_id":"$request_id",'
        '"client_ip":"$remote_addr",'
        '"bytes_sent":$bytes_sent}';
    access_log /var/log/nginx/access.log json_combined;

    # File upload size limit
    client_max_body_size 100m;

    # Security headers (applied to all responses)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Request ID generation
    add_header X-Request-ID $request_id always;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=60r/m;

    upstream api_backend {
        server api:8000;
        keepalive 32;
    }

    upstream frontend_backend {
        server frontend:3000;
        keepalive 16;
    }

    server {
        listen 80;
        server_name _;

        # Redirect to HTTPS in production
        # In development, serve directly
        location / {
            proxy_pass http://frontend_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Request-ID $request_id;
        }

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Request-ID $request_id;
            proxy_read_timeout 120s;
        }

        location /api/v1/auth/login {
            limit_req zone=login burst=3 nodelay;
            proxy_pass http://api_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Request-ID $request_id;
        }
    }
}
```

---

## Docker Compose File

### Full Service Definitions

```yaml
# docker-compose.yml

name: mechmind

services:

  # ─────────────────────────────────────────────
  # PostgreSQL with pgvector extension
  # ─────────────────────────────────────────────
  db:
    image: pgvector/pgvector:pg16
    container_name: mechmind-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-mechmind}
      POSTGRES_USER: ${POSTGRES_USER:-mechmind_app}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/db/init.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
    networks:
      - mechmind-internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-mechmind_app} -d ${POSTGRES_DB:-mechmind}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    deploy:
      resources:
        limits:
          memory: 2g

  # ─────────────────────────────────────────────
  # Redis — rate limiting counters and job queue
  # ─────────────────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: mechmind-redis
    restart: unless-stopped
    command: >
      redis-server
      --appendonly yes
      --appendfsync everysec
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
      --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - mechmind-internal
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    deploy:
      resources:
        limits:
          memory: 512m

  # ─────────────────────────────────────────────
  # FastAPI backend
  # ─────────────────────────────────────────────
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: mechmind-api
    restart: unless-stopped
    command: ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
    environment:
      # Database
      POSTGRES_HOST: db
      POSTGRES_PORT: 5432
      POSTGRES_DB: ${POSTGRES_DB:-mechmind}
      POSTGRES_USER: ${POSTGRES_USER:-mechmind_app}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      # Redis
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      # LLM
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      # Authentication
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      JWT_ALGORITHM: ${JWT_ALGORITHM:-HS256}
      ACCESS_TOKEN_EXPIRE_MINUTES: ${ACCESS_TOKEN_EXPIRE_MINUTES:-30}
      REFRESH_TOKEN_EXPIRE_DAYS: ${REFRESH_TOKEN_EXPIRE_DAYS:-7}
      # Application
      ENVIRONMENT: ${ENVIRONMENT:-development}
      LOG_LEVEL: ${LOG_LEVEL:-info}
      MAX_UPLOAD_SIZE_MB: ${MAX_UPLOAD_SIZE_MB:-100}
      CORS_ORIGINS: ${CORS_ORIGINS:-http://localhost:3000}
      # Storage
      UPLOAD_DIR: ${UPLOAD_DIR:-/app/uploads}
    volumes:
      - upload_data:/app/uploads
    networks:
      - mechmind-internal
      - mechmind-public
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 1g

  # ─────────────────────────────────────────────
  # Next.js frontend
  # ─────────────────────────────────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:3000/api}
    container_name: mechmind-frontend
    restart: unless-stopped
    environment:
      NODE_ENV: ${ENVIRONMENT:-development}
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:3000/api}
      # Internal API URL used by Next.js server-side rendering (not the public URL)
      API_INTERNAL_URL: http://api:8000
    networks:
      - mechmind-internal
      - mechmind-public
    depends_on:
      api:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    deploy:
      resources:
        limits:
          memory: 512m

  # ─────────────────────────────────────────────
  # Background ingestion worker
  # ─────────────────────────────────────────────
  worker:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: mechmind-worker
    restart: unless-stopped
    # Override the default API command to run the worker
    command: ["python", "-m", "src.worker.ingestion_worker"]
    environment:
      # Same environment as api — worker shares the same codebase and config
      POSTGRES_HOST: db
      POSTGRES_PORT: 5432
      POSTGRES_DB: ${POSTGRES_DB:-mechmind}
      POSTGRES_USER: ${POSTGRES_USER:-mechmind_app}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      ENVIRONMENT: ${ENVIRONMENT:-development}
      LOG_LEVEL: ${LOG_LEVEL:-info}
      UPLOAD_DIR: ${UPLOAD_DIR:-/app/uploads}
      # Worker-specific settings
      WORKER_CONCURRENCY: ${WORKER_CONCURRENCY:-2}
      WORKER_PDF_TIMEOUT_SECONDS: ${WORKER_PDF_TIMEOUT_SECONDS:-60}
      WORKER_MAX_CHUNK_TOKENS: ${WORKER_MAX_CHUNK_TOKENS:-512}
      WORKER_CHUNK_OVERLAP_TOKENS: ${WORKER_CHUNK_OVERLAP_TOKENS:-64}
    volumes:
      - upload_data:/app/uploads
    networks:
      - mechmind-internal
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "python", "-c", "from src.worker.health import check_worker_health; check_worker_health()"]
      interval: 60s
      timeout: 15s
      retries: 3
      start_period: 30s
    deploy:
      resources:
        limits:
          memory: 1g
          # Worker processes PDFs which can be memory-intensive

  # ─────────────────────────────────────────────
  # nginx reverse proxy
  # ─────────────────────────────────────────────
  nginx:
    image: nginx:alpine
    container_name: mechmind-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro          # SSL certificates (production)
      - nginx_logs:/var/log/nginx
    networks:
      - mechmind-public
    depends_on:
      api:
        condition: service_healthy
      frontend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

# ─────────────────────────────────────────────
# Volumes
# ─────────────────────────────────────────────
volumes:
  postgres_data:
    name: mechmind_postgres_data
    driver: local
  redis_data:
    name: mechmind_redis_data
    driver: local
  upload_data:
    name: mechmind_upload_data
    driver: local
  nginx_logs:
    name: mechmind_nginx_logs
    driver: local

# ─────────────────────────────────────────────
# Networks
# ─────────────────────────────────────────────
networks:
  mechmind-public:
    name: mechmind_public
    driver: bridge
  mechmind-internal:
    name: mechmind_internal
    driver: bridge
    internal: true    # No external connectivity from this network
```

---

## Environment Variable Reference

### Complete Variable Listing

All variables are defined in `.env`. Copy `.env.example` to `.env` and fill in required values.

#### Database Group

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_HOST` | Yes | `db` | PostgreSQL hostname (Docker service name) |
| `POSTGRES_PORT` | No | `5432` | PostgreSQL port |
| `POSTGRES_DB` | No | `mechmind` | Database name |
| `POSTGRES_USER` | No | `mechmind_app` | Database user |
| `POSTGRES_PASSWORD` | **Required** | None | Database password — must be set |

#### Redis Group

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | Yes | None | Full Redis URL: `redis://:password@redis:6379/0` |
| `REDIS_PASSWORD` | **Required** | None | Redis authentication password |

#### LLM Group

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | **Required** | None | Google Gemini API key |

#### Authentication Group

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET_KEY` | **Required** | None | JWT signing secret — minimum 64 hex chars (256 bits) |
| `JWT_ALGORITHM` | No | `HS256` | JWT algorithm — `HS256` or `RS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `30` | Access token lifetime in minutes |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | `7` | Refresh token lifetime in days |

#### Application Group

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENVIRONMENT` | No | `development` | `development`, `staging`, or `production` |
| `LOG_LEVEL` | No | `info` | Logging level: `debug`, `info`, `warning`, `error` |
| `MAX_UPLOAD_SIZE_MB` | No | `100` | Maximum upload size in MB (also enforced in nginx) |
| `CORS_ORIGINS` | Yes | `http://localhost:3000` | Comma-separated list of allowed CORS origins |
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:3000/api` | Public API URL (used by browser) |

#### Storage Group

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `UPLOAD_DIR` | No | `/app/uploads` | Upload directory path inside container (dev) |

#### Worker Group

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WORKER_CONCURRENCY` | No | `2` | Number of concurrent ingestion jobs |
| `WORKER_PDF_TIMEOUT_SECONDS` | No | `60` | Maximum seconds for PDF processing |
| `WORKER_MAX_CHUNK_TOKENS` | No | `512` | Maximum tokens per chunk |
| `WORKER_CHUNK_OVERLAP_TOKENS` | No | `64` | Token overlap between adjacent chunks |

### .env.example

```bash
# MechMind Environment Configuration
# Copy this file to .env and fill in all required values.
# NEVER commit .env to version control.

# ── Database ────────────────────────────────────────
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_DB=mechmind
POSTGRES_USER=mechmind_app
POSTGRES_PASSWORD=change-this-strong-password

# ── Redis ────────────────────────────────────────────
REDIS_PASSWORD=change-this-redis-password
REDIS_URL=redis://:change-this-redis-password@redis:6379/0

# ── Google Gemini API ─────────────────────────────────
GEMINI_API_KEY=your-gemini-api-key-here

# ── Authentication ────────────────────────────────────
# Generate with: openssl rand -hex 32
JWT_SECRET_KEY=your-256-bit-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ── Application ───────────────────────────────────────
ENVIRONMENT=development
LOG_LEVEL=info
MAX_UPLOAD_SIZE_MB=100
CORS_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# ── Storage ───────────────────────────────────────────
UPLOAD_DIR=/app/uploads

# ── Worker ────────────────────────────────────────────
WORKER_CONCURRENCY=2
WORKER_PDF_TIMEOUT_SECONDS=60
WORKER_MAX_CHUNK_TOKENS=512
WORKER_CHUNK_OVERLAP_TOKENS=64
```

---

## Health Check Commands

| Service | Health Check Command | What It Checks |
|---------|---------------------|----------------|
| `db` | `pg_isready -U $POSTGRES_USER -d $POSTGRES_DB` | PostgreSQL accepting connections |
| `redis` | `redis-cli -a $REDIS_PASSWORD ping` | Redis responding to PING with PONG |
| `api` | `curl -f http://localhost:8000/health` | FastAPI `/health` endpoint returns 200 |
| `frontend` | `curl -f http://localhost:3000/api/health` | Next.js health route returns 200 |
| `worker` | `python -c "from src.worker.health import check_worker_health; check_worker_health()"` | Worker process is alive and connected to DB/Redis |
| `nginx` | `nginx -t` | nginx config is valid (does not test upstream connectivity) |

The `/health` endpoint in FastAPI returns:

```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "version": "1.0.0",
  "environment": "development"
}
```

If any dependency is unavailable, the status is `"degraded"` and the HTTP status code is 503.

---

## Override File for Testing

A `docker-compose.test.yml` override file is used for the test environment:

```yaml
# docker-compose.test.yml
# Usage: docker compose -f docker-compose.yml -f docker-compose.test.yml up

services:
  db:
    environment:
      POSTGRES_DB: mechmind_test
    # No persistent volume — test DB is ephemeral

  api:
    environment:
      ENVIRONMENT: test
      LOG_LEVEL: warning
      POSTGRES_DB: mechmind_test
    # Mount test scripts
    volumes:
      - ./tests:/app/tests:ro
      - ./scripts:/app/scripts:ro

  worker:
    environment:
      ENVIRONMENT: test
      POSTGRES_DB: mechmind_test

  # No nginx in test — direct port exposure
  nginx:
    profiles: ["disabled"]   # Not started in test compose

  api:
    ports:
      - "8000:8000"   # Expose API directly for test client

  frontend:
    ports:
      - "3000:3000"   # Expose frontend directly for Playwright
```
