# MechMind Deployment Guide

**Version:** 1.0  
**Last Updated:** 2026-09-04

---

## Overview

This guide covers two deployment scenarios:

1. **Hackathon / Development Deployment** — Docker Compose on a single machine. Get the full stack running in under 15 minutes.
2. **Production Deployment Path** — Considerations and architecture for a production-grade deployment.

---

## Part 1: Hackathon Deployment (Docker Compose)

This deployment runs all six services on a single machine using Docker Compose. It is suitable for development, hackathons, demos, and small-scale internal use (< 50 concurrent users).

### 1.1 Prerequisites

| Requirement | Minimum Version | Verify With |
|-------------|----------------|-------------|
| Docker Engine | 24.0+ | `docker --version` |
| Docker Compose (plugin) | 2.20+ | `docker compose version` |
| Available RAM | 4GB free | `free -h` |
| Available Disk | 10GB free | `df -h` |
| Git | Any | `git --version` |
| Gemini API key | — | Obtain from Google AI Studio |

**Note:** Docker Compose V2 (`docker compose`) is required — not the legacy V1 (`docker-compose`). The plugin version is installed with Docker Desktop on Mac/Windows and with `apt install docker-compose-plugin` on Debian/Ubuntu.

---

### 1.2 Step 1 — Clone the Repository

```bash
git clone https://github.com/your-org/mechmind.git
cd mechmind
```

Verify the directory structure:

```
mechmind/
  docker-compose.yml
  Dockerfile.api
  frontend/
    Dockerfile.frontend
  nginx/
    nginx.conf
  src/
  alembic/
  scripts/
  .env.example
```

---

### 1.3 Step 2 — Configure Environment Variables

Copy the example environment file and fill in required values:

```bash
cp .env.example .env
```

Open `.env` in a text editor and set:

**Required values (must be changed from placeholder):**

```bash
# Your Google Gemini API key from https://aistudio.google.com/
GEMINI_API_KEY=AIzaSy...your-actual-key...

# Generate a strong JWT secret (run this command and paste the output):
# openssl rand -hex 32
JWT_SECRET_KEY=your-64-character-hex-string-here

# Database password — use any strong password
POSTGRES_PASSWORD=choose-a-strong-db-password

# Redis password — use any strong password
REDIS_PASSWORD=choose-a-strong-redis-password
REDIS_URL=redis://:choose-a-strong-redis-password@redis:6379/0
```

**Optional values (defaults work for local development):**

```bash
ENVIRONMENT=development
LOG_LEVEL=info
CORS_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Security note:** The `.env` file is in `.gitignore` and must never be committed. Verify this before pushing:

```bash
git check-ignore -v .env
# Expected output: .gitignore:.env
```

---

### 1.4 Step 3 — Build and Start the Stack

```bash
docker compose up --build
```

This command:
1. Builds the `api` Docker image from `Dockerfile.api`
2. Builds the `frontend` Docker image from `frontend/Dockerfile.frontend`
3. Pulls `pgvector/pgvector:pg16`, `redis:7-alpine`, and `nginx:alpine`
4. Creates networks `mechmind_public` and `mechmind_internal`
5. Creates volumes for PostgreSQL data, Redis data, and uploads
6. Starts all six services

**First build takes 3–8 minutes** (downloading base images and installing dependencies). Subsequent builds are faster due to layer caching.

**Expected healthy output:**

```
mechmind-db        | database system is ready to accept connections
mechmind-redis     | Ready to accept connections
mechmind-api       | INFO:     Application startup complete.
mechmind-api       | INFO:     Uvicorn running on http://0.0.0.0:8000
mechmind-frontend  | ready started server on 0.0.0.0:3000
mechmind-nginx     | ... nginx started
```

To run in the background (detached mode):

```bash
docker compose up --build -d
```

Check that all services are healthy:

```bash
docker compose ps
```

All services should show `(healthy)` in the STATUS column. If any service shows `(unhealthy)`, check its logs:

```bash
docker compose logs db          # Check PostgreSQL
docker compose logs api         # Check FastAPI
docker compose logs frontend    # Check Next.js
```

---

### 1.5 Step 4 — Run Database Migrations

With the stack running, apply the database schema:

```bash
docker compose exec api alembic upgrade head
```

**Expected output:**

```
INFO  [alembic.runtime.migration] Context impl PostgreSQLImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> a1b2c3d4e5f6, create users table
INFO  [alembic.runtime.migration] Running upgrade a1b2c3d4e5f6 -> b2c3d4e5f6a7, create manuals table
INFO  [alembic.runtime.migration] Running upgrade b2c3d4e5f6a7 -> c3d4e5f6a7b8, create chunks table with pgvector
INFO  [alembic.runtime.migration] Running upgrade c3d4e5f6a7b8 -> d4e5f6a7b8c9, create conversations table
INFO  [alembic.runtime.migration] Running upgrade d4e5f6a7b8c9 -> e5f6a7b8c9d0, create audit_logs table
```

If you see `FAILED`, check:

- Is the `db` container healthy? (`docker compose ps db`)
- Are the `POSTGRES_*` variables in `.env` correct?
- Does the database user have permission to create tables?

---

### 1.6 Step 5 — Seed Demo Data

Seed the database with demo user accounts and optionally load the test PDF manuals:

```bash
docker compose exec api python scripts/seed_demo.py
```

**This script creates:**

| Account | Email | Role | Password |
|---------|-------|------|----------|
| System Admin | `admin@mechmind.com` | admin | Printed to console after seeding |
| Plant Manager | `manager@mechmind.com` | manager | Printed to console after seeding |
| Floor Technician | `technician@mechmind.com` | technician | Printed to console after seeding |

**Important:** The seed script generates random passwords for the demo accounts (not fixed passwords) and prints them to the console after completion. Copy these passwords immediately — they are not stored in plaintext anywhere.

**Expected output:**

```
[seed_demo] Creating admin user...
[seed_demo] Creating manager user...
[seed_demo] Creating technician user...
[seed_demo] ✓ Users created

Demo Credentials:
  Admin:      admin@mechmind.com      / Abc123!xyz789...
  Manager:    manager@mechmind.com    / Def456!uvw012...
  Technician: technician@mechmind.com / Ghi789!rst345...

[seed_demo] To index sample manuals, run:
  docker compose exec api python scripts/seed_demo.py --with-manuals
```

To also seed the three synthetic test PDF manuals (Haas VF-2, Fanuc 0i-MF, KUKA KR6):

```bash
docker compose exec api python scripts/seed_demo.py --with-manuals
```

This runs the PDF generation and ingestion pipeline, which may take 2–3 minutes.

---

### 1.7 Step 6 — Access the Application

The application is accessible at:

| Service | URL |
|---------|-----|
| Frontend (main app) | http://localhost:3000 |
| API documentation (Swagger) | http://localhost:8000/docs |
| API documentation (ReDoc) | http://localhost:8000/redoc |
| API health check | http://localhost:8000/health |

Log in with the admin credentials printed by the seed script.

**First steps after login:**

1. Navigate to **Manual Management** to upload a PDF service manual.
2. Wait for ingestion to complete (status shown in the manual list).
3. Navigate to **Query** and ask a question about an error code in the uploaded manual.

---

### 1.8 Useful Management Commands

```bash
# View all service logs (follow mode)
docker compose logs -f

# View logs for a specific service
docker compose logs -f api
docker compose logs -f worker

# Check service health
docker compose ps

# Restart a specific service
docker compose restart api

# Stop all services (preserves data volumes)
docker compose down

# Stop all services and remove volumes (DESTRUCTIVE — deletes all data)
docker compose down -v

# Open a shell in the API container
docker compose exec api bash

# Open a PostgreSQL shell
docker compose exec db psql -U mechmind_app -d mechmind

# Check Redis
docker compose exec redis redis-cli -a "$REDIS_PASSWORD" ping

# Run database migrations
docker compose exec api alembic upgrade head

# Check current migration version
docker compose exec api alembic current

# Create a new migration after model changes
docker compose exec api alembic revision --autogenerate -m "describe the change"
```

---

### 1.9 Troubleshooting Common Issues

**API container fails to start with `Connection refused`:**
- The `db` or `redis` container may not be healthy yet. Wait 30 seconds and check `docker compose ps`.
- Verify `POSTGRES_PASSWORD` and `REDIS_PASSWORD` in `.env` match the values in `REDIS_URL`.

**"no module named src" error:**
- The Dockerfile may have failed to copy the `src/` directory. Run `docker compose build api --no-cache`.

**Frontend shows "Failed to fetch" errors:**
- Check that `NEXT_PUBLIC_API_URL` in `.env` is `http://localhost:3000/api` (not `http://api:8000`).
- The browser cannot reach the Docker internal hostname `api` — only the nginx-proxied URL works.

**PDF ingestion stays in "pending" status:**
- The worker container may be unhealthy. Check `docker compose logs worker`.
- Verify `GEMINI_API_KEY` is valid and has the Generative Language API enabled in Google Cloud.

**Gemini API errors (403 or quota exceeded):**
- Verify the API key is valid: `curl "https://generativelanguage.googleapis.com/v1/models?key=YOUR_KEY"`.
- Check that the Generative Language API is enabled in your Google Cloud project.
- Verify that billing is enabled if you are using a paid quota tier.

---

## Part 2: Production Deployment Considerations

The hackathon deployment (Docker Compose on a single machine) is not suitable for production use. This section describes the production architecture without prescribing a specific implementation — production deployment choices depend on the organization's cloud provider, compliance requirements, and operational practices.

### 2.1 Replace Local File Storage with Object Storage

The hackathon deployment stores uploaded PDFs in a Docker volume on the host machine. In production:

- Replace `UPLOAD_DIR` with object storage:  
  AWS S3, Google Cloud Storage, or Azure Blob Storage.
- The ingestion worker downloads PDFs from object storage, processes them in a secure temporary directory, then deletes the temp file.
- Object storage provides: durability (redundant copies), access control (IAM policies), audit trail (access logs), and scalability (no local disk constraints).
- Signed URLs for secure upload: the frontend requests a signed upload URL from the API, then the browser uploads directly to object storage — the PDF never passes through the API server.

### 2.2 Use Managed PostgreSQL

The Docker-based PostgreSQL instance has no automated backups, no high availability, and requires manual upgrade management. In production:

- **Google Cloud SQL for PostgreSQL** — fully managed, automated backups, point-in-time recovery, automated minor version upgrades, and pgvector extension support.
- **Amazon RDS for PostgreSQL** — same capabilities, pgvector supported from PostgreSQL 15+.
- **Neon** — serverless PostgreSQL with branching; pgvector supported.
- **Supabase** — managed PostgreSQL with pgvector built-in; simplifies setup.

Configure: automated daily backups with 30-day retention, read replicas for reporting queries if needed, VPC peering to keep database traffic off the public internet.

### 2.3 Add SSL via Certificate Management

The hackathon nginx config serves HTTP. In production:

- **Certbot (Let's Encrypt):** Free certificates, auto-renewal, integrates with nginx.
- **Managed load balancer:** AWS ALB, Google Cloud Load Balancer, or Cloudflare terminate SSL before traffic reaches the application — simpler certificate management, no certbot required.
- **Internal CA:** For factory-internal deployments where Let's Encrypt is not reachable, use an internal certificate authority with certificate pinning.
- HSTS must be enabled with `includeSubDomains` and a long `max-age` once SSL is confirmed working.

### 2.4 Container Orchestration for Scaling

Docker Compose on a single machine is a single point of failure. For production resilience:

**Kubernetes (recommended for production):**
- Deploy API and worker as separate `Deployment` objects with independent replica counts.
- API: 2–4 replicas behind a Kubernetes `Service` and `Ingress`.
- Worker: 2 replicas; scale based on ingestion queue depth (KEDA for queue-based autoscaling).
- Use `HorizontalPodAutoscaler` for API replicas based on CPU or request rate.
- Use Kubernetes `Secrets` (or sealed secrets / external-secrets operator) instead of `.env` files.
- Resource requests and limits on each pod to prevent one service from starving others.

**AWS ECS / Google Cloud Run (simpler alternative):**
- Serverless container execution — no cluster management.
- Good for the API tier (stateless).
- Worker tier may need ECS with task definitions for long-running processes.

### 2.5 Separate Worker Instances

In the hackathon deployment, the worker runs on the same host as the API and database. PDF processing is CPU and memory intensive. In production:

- Run worker containers on separate compute instances (larger machine type) or separate node pool in Kubernetes.
- Worker nodes do not need public internet access — communicate with the database and Redis via VPC-internal networking.
- Consider GPU-accelerated instances if embedding generation is moved in-house (rather than using Gemini embedding API).
- Worker job queue: Redis-based queue (current implementation) scales horizontally — multiple worker replicas consume from the same queue.

### 2.6 Redis High Availability

The hackathon Redis uses a single Alpine Redis instance with AOF persistence. In production:

- **Redis Sentinel:** Automatic failover for a single Redis primary.
- **Redis Cluster:** Sharded, horizontally scalable.
- **Managed service:** AWS ElastiCache, Google Cloud Memorystore, or Upstash — no operational overhead.
- Ensure persistence is configured correctly: AOF (`appendonly yes`) for data safety, or accept that rate-limit counters reset on restart (acceptable for rate limiting, not for job queue).

### 2.7 Monitoring and Alerting Stack

Production requires operational visibility beyond Docker logs:

- **Metrics:** Prometheus + Grafana, or managed alternatives (Datadog, New Relic). Expose FastAPI metrics via `prometheus-fastapi-instrumentator`.
- **Log aggregation:** Elasticsearch + Kibana (ELK), Grafana Loki, AWS CloudWatch, or Google Cloud Logging. Structured JSON logs (structlog) integrate cleanly.
- **Tracing:** OpenTelemetry with Jaeger or Tempo — trace requests through the full RAG pipeline.
- **Alerting:** PagerDuty, Opsgenie, or managed alerting from cloud provider. Alerts defined in the logging documentation (Section — Alert Rules).
- **Uptime monitoring:** External synthetic monitoring from a location outside the factory network to detect outages from the user's perspective.

### 2.8 CI/CD Pipeline

Production deployments should never be manual `docker compose up` operations:

- **CI (GitHub Actions / GitLab CI / Jenkins):** Run all tests (unit, integration, security, RAG evaluation) on every pull request. Block merge on test failure.
- **Image building:** Build and push Docker images to a container registry (Docker Hub, AWS ECR, Google Artifact Registry) on merge to main.
- **Deployment:** Automated deployment to staging environment after every merge to main. Promotion to production requires manual approval (or automated if all staging tests pass).
- **Secret management in CI:** Use GitHub Actions Secrets, AWS Secrets Manager, or HashiCorp Vault — never store secrets in repository or CI configuration files.
- **Database migrations:** Run `alembic upgrade head` as a Kubernetes Job or ECS task before the new application version starts receiving traffic (pre-deploy hook).
- **Rollback:** Container images are immutable and tagged with git SHA — rollback is `kubectl set image` or equivalent, pointing to the previous image tag.

### 2.9 Security Hardening for Production

Beyond the base security controls in the security documentation:

- **WAF (Web Application Firewall):** AWS WAF, Cloudflare WAF, or nginx ModSecurity to block common attack patterns before they reach the application.
- **DDoS protection:** Cloudflare, AWS Shield, or equivalent.
- **VPC isolation:** API, worker, database, and Redis all in a private VPC — only the load balancer has a public IP.
- **Container security scanning:** Scan all images in CI with Trivy, Snyk, or AWS ECR scanning before pushing to registry.
- **Secrets rotation:** Automate JWT secret and database password rotation via AWS Secrets Manager or HashiCorp Vault. Rotation invalidates all existing sessions — plan the maintenance window.
- **Audit log immutability:** Ship audit logs to an immutable store (AWS CloudTrail, Splunk, or a write-once S3 bucket with Object Lock).
- **Penetration testing:** Annual pentest by an external security firm before major releases.

---

## Quick Reference — Key URLs

After a successful hackathon deployment:

| URL | Description |
|-----|-------------|
| http://localhost:3000 | MechMind frontend application |
| http://localhost:3000/api/docs | Not applicable (docs served by API) |
| http://localhost:8000/docs | FastAPI Swagger interactive documentation |
| http://localhost:8000/health | API health check (JSON response) |
| http://localhost:8000/api/v1/auth/login | Login endpoint |

---

## Environment Checklist Before Going Live

Run through this checklist before presenting the hackathon deployment or deploying to any shared environment:

- [ ] `.env` file contains real `GEMINI_API_KEY`, `JWT_SECRET_KEY`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD`
- [ ] `JWT_SECRET_KEY` was generated with `openssl rand -hex 32` (not a short or guessable string)
- [ ] All six services show `(healthy)` in `docker compose ps`
- [ ] Database migrations have been applied: `alembic upgrade head` ran successfully
- [ ] Demo data has been seeded: `seed_demo.py` ran and printed credentials
- [ ] Frontend loads at http://localhost:3000 without errors
- [ ] Login works with the seeded admin credentials
- [ ] At least one PDF manual is indexed and queryable
- [ ] A test query returns an answer with at least one citation
- [ ] The disambiguation flow works for an ambiguous error code
- [ ] Docker logs show no error-level messages after a clean start
