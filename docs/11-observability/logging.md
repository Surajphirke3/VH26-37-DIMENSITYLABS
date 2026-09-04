# MechMind Structured Logging Design

**Version:** 1.0  
**Last Updated:** 2026-09-04  
**Library:** `structlog` (Python backend), `pino` or `winston` (optional frontend)

---

## Overview

MechMind uses structured JSON logging throughout the backend to enable:

- **Operational monitoring:** Pipeline stage timing, query success/failure rates, ingestion job status
- **Security auditing:** Authentication events, authorization failures, rate limit triggers
- **RAG quality monitoring:** Evidence scores, confidence levels, refusal rates, disambiguation events
- **Incident investigation:** Request correlation across service boundaries via `request_id`

All logs are emitted to stdout in JSON format, collected by Docker's logging driver, and shipped to an external log aggregation system (e.g., Elasticsearch, Loki, or CloudWatch Logs).

---

## Log Format

### Base Structure

Every log event, regardless of type, includes the following fields:

```json
{
  "timestamp": "2026-09-04T14:23:45.123Z",
  "level": "info",
  "service": "mechmind-api",
  "version": "1.0.0",
  "environment": "production",
  "request_id": "req-550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-uuid-v4-here",
  "action": "rag.query.completed",
  ...event-specific fields...
}
```

### Base Field Definitions

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `timestamp` | ISO 8601 string | Yes | UTC timestamp at log emission |
| `level` | string | Yes | `debug`, `info`, `warning`, `error`, `critical` |
| `service` | string | Yes | Service name: `mechmind-api`, `mechmind-worker`, `mechmind-frontend` |
| `version` | string | Yes | Application version from environment variable |
| `environment` | string | Yes | `development`, `staging`, `production` |
| `request_id` | UUID string | Yes | Per-request unique ID, propagated from nginx X-Request-ID header |
| `user_id` | UUID string or null | When authenticated | Authenticated user's ID; null for unauthenticated requests |
| `action` | string | Yes | Dot-separated event identifier (see event catalog below) |

### structlog Configuration

```python
import structlog
import logging

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        SecretRedactingProcessor(),     # Custom — see Security section
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
)
```

---

## What Must Never Appear in Logs

The following data categories are explicitly prohibited from appearing in any log output. The `SecretRedactingProcessor` enforces this automatically for known field names, and code review enforces it for ad-hoc log statements.

### Prohibited Data

| Data Category | Examples | Reason |
|--------------|---------|--------|
| Passwords | `password`, `new_password`, login form values | Credential theft |
| Authentication tokens | JWT access tokens, refresh tokens, API keys | Session hijacking, API abuse |
| API keys | `GEMINI_API_KEY`, `POSTGRES_PASSWORD` | Unauthorized API access |
| Full query text | User's complete query string | Privacy; queries may contain PII |
| Full LLM response | Complete generated answer text | Privacy; may contain PII from manuals |
| Personal data from manuals | Employee names, addresses, phone numbers | Privacy regulation compliance |
| Database connection strings | Full DSN with credentials | Credential exposure |
| Environment variable dumps | `os.environ` output | Mass credential exposure |

### SecretRedactingProcessor

```python
REDACTED_FIELDS = {
    "password", "new_password", "old_password",
    "access_token", "refresh_token",
    "gemini_api_key", "jwt_secret_key",
    "postgres_password", "redis_password",
    "authorization",  # Authorization header value
    "cookie",         # Cookie header value (contains refresh token)
    "api_key", "secret", "token",
}

TRUNCATED_FIELDS = {
    "query": 100,           # First 100 chars only
    "answer": 100,          # First 100 chars only
    "chunk_text": 200,      # First 200 chars only
}

class SecretRedactingProcessor:
    def __call__(self, logger, method, event_dict):
        for field in REDACTED_FIELDS:
            if field in event_dict:
                event_dict[field] = "[REDACTED]"
        for field, max_len in TRUNCATED_FIELDS.items():
            if field in event_dict and isinstance(event_dict[field], str):
                val = event_dict[field]
                if len(val) > max_len:
                    event_dict[field] = val[:max_len] + "...[truncated]"
        return event_dict
```

---

## Log Event Catalog

### 1. Request / Response Events

These events are emitted by FastAPI middleware for every HTTP request.

#### `http.request.received`

Emitted when a request arrives at the API.

```json
{
  "timestamp": "2026-09-04T14:23:44.950Z",
  "level": "info",
  "service": "mechmind-api",
  "request_id": "req-550e8400...",
  "user_id": null,
  "action": "http.request.received",
  "method": "POST",
  "path": "/api/v1/auth/login",
  "client_ip": "192.168.1.55",
  "user_agent": "Mozilla/5.0 ...",
  "content_length": 128
}
```

#### `http.response.sent`

Emitted after the response is sent.

```json
{
  "timestamp": "2026-09-04T14:23:45.123Z",
  "level": "info",
  "service": "mechmind-api",
  "request_id": "req-550e8400...",
  "user_id": "user-uuid",
  "action": "http.response.sent",
  "method": "POST",
  "path": "/api/v1/query",
  "status_code": 200,
  "duration_ms": 1847,
  "response_size_bytes": 2048
}
```

**Field definitions:**

| Field | Description |
|-------|-------------|
| `method` | HTTP method (GET, POST, etc.) |
| `path` | Request path (never includes query params that may contain sensitive data) |
| `status_code` | HTTP response status code |
| `duration_ms` | Request processing time in milliseconds |
| `client_ip` | Client IP address from trusted proxy header or socket |
| `content_length` | Request body size in bytes |

---

### 2. RAG Pipeline Events

These events are emitted at each stage of the query processing pipeline. Together they allow reconstruction of the full pipeline execution for any given request.

#### `rag.query.received`

```json
{
  "action": "rag.query.received",
  "request_id": "req-...",
  "user_id": "user-uuid",
  "conversation_id": "conv-uuid",
  "query_length": 47,
  "query_preview": "What is error E101?...[truncated]",
  "session_machine_id": "machine-haas-vf2",
  "query_type": "error_code_lookup",
  "error_codes_detected": ["E101"]
}
```

Note: `query_preview` contains only the first 100 characters. `query_length` provides the full length. The full query text is not logged.

#### `rag.embedding.generated`

```json
{
  "action": "rag.embedding.generated",
  "request_id": "req-...",
  "duration_ms": 145,
  "embedding_model": "text-embedding-004",
  "embedding_dimensions": 768
}
```

#### `rag.retrieval.completed`

```json
{
  "action": "rag.retrieval.completed",
  "request_id": "req-...",
  "duration_ms": 83,
  "chunks_retrieved": 5,
  "chunks_scoped_to_machine": true,
  "machine_scope": "machine-haas-vf2",
  "top_similarity_score": 0.924,
  "min_similarity_score": 0.701,
  "avg_similarity_score": 0.835,
  "unique_manuals_retrieved_from": 1
}
```

**Key fields:**

| Field | Description |
|-------|-------------|
| `chunks_retrieved` | Number of chunks returned by retrieval |
| `chunks_scoped_to_machine` | Whether retrieval was filtered by machine_id |
| `unique_manuals_retrieved_from` | Number of distinct manuals in retrieved chunks |
| `top_similarity_score` | Highest cosine similarity in retrieved set |
| `avg_similarity_score` | Average similarity score — proxy for retrieval confidence |

#### `rag.reranking.completed`

```json
{
  "action": "rag.reranking.completed",
  "request_id": "req-...",
  "duration_ms": 52,
  "chunks_before_rerank": 5,
  "chunks_after_rerank": 3,
  "reranker_model": "cross-encoder"
}
```

#### `rag.llm.called`

```json
{
  "action": "rag.llm.called",
  "request_id": "req-...",
  "llm_model": "gemini-2.0-flash",
  "context_chunks": 3,
  "context_tokens_estimate": 1847,
  "prompt_tokens_estimate": 2100,
  "conversation_turns_included": 2
}
```

Note: The actual prompt and context text are never logged. Only token count estimates and structural metadata.

#### `rag.response.generated`

```json
{
  "action": "rag.response.generated",
  "request_id": "req-...",
  "duration_ms": 2340,
  "llm_model": "gemini-2.0-flash",
  "response_tokens_estimate": 387,
  "total_duration_ms": 2602,
  "confidence": "high",
  "citation_count": 3,
  "phantom_citations_detected": 0,
  "requires_disambiguation": false,
  "machine_scope_verified": true,
  "answer_preview": "Error E101 on the Haas VF-2 indicates a...[truncated]"
}
```

**Key fields:**

| Field | Description |
|-------|-------------|
| `confidence` | high / medium / low |
| `citation_count` | Number of citations in the response |
| `phantom_citations_detected` | Number of citations not matching retrieved chunks (should always be 0) |
| `requires_disambiguation` | Whether the response is a disambiguation request |
| `machine_scope_verified` | Whether all citations are from the expected machine's manual |
| `total_duration_ms` | Full pipeline time from query received to response generated |

---

### 3. Ingestion Pipeline Events

Emitted by the background worker during PDF ingestion jobs.

#### `ingestion.job.started`

```json
{
  "action": "ingestion.job.started",
  "service": "mechmind-worker",
  "job_id": "job-uuid",
  "manual_id": "manual-uuid",
  "filename": "HaasVF2_Service_Manual.pdf",
  "file_size_bytes": 2048576,
  "uploaded_by_user_id": "user-uuid",
  "machine_id": "machine-haas-vf2"
}
```

#### `ingestion.page.processed`

```json
{
  "action": "ingestion.page.processed",
  "service": "mechmind-worker",
  "job_id": "job-uuid",
  "manual_id": "manual-uuid",
  "page_number": 7,
  "extracted_text_length": 3421,
  "chunks_created_from_page": 4
}
```

#### `ingestion.chunk.created`

```json
{
  "action": "ingestion.chunk.created",
  "service": "mechmind-worker",
  "job_id": "job-uuid",
  "chunk_id": "chunk-uuid",
  "manual_id": "manual-uuid",
  "page_number": 7,
  "section": "Section 4.1",
  "token_count": 312,
  "embedding_model": "text-embedding-004"
}
```

#### `ingestion.embedding.failed`

```json
{
  "action": "ingestion.embedding.failed",
  "level": "warning",
  "service": "mechmind-worker",
  "job_id": "job-uuid",
  "chunk_id": "chunk-uuid",
  "retry_attempt": 2,
  "error_type": "GeminiApiRateLimitError",
  "retry_after_seconds": 30
}
```

#### `ingestion.job.completed`

```json
{
  "action": "ingestion.job.completed",
  "service": "mechmind-worker",
  "job_id": "job-uuid",
  "manual_id": "manual-uuid",
  "filename": "HaasVF2_Service_Manual.pdf",
  "pages_processed": 12,
  "chunks_created": 47,
  "embeddings_stored": 47,
  "duration_seconds": 34.5,
  "status": "completed"
}
```

#### `ingestion.job.failed`

```json
{
  "action": "ingestion.job.failed",
  "level": "error",
  "service": "mechmind-worker",
  "job_id": "job-uuid",
  "manual_id": "manual-uuid",
  "filename": "HaasVF2_Service_Manual.pdf",
  "failure_reason": "pdf_parse_error",
  "error_message": "PyMuPDF failed to open file — may not be a valid PDF",
  "pages_processed_before_failure": 3,
  "duration_seconds": 5.2,
  "status": "failed"
}
```

---

### 4. Authentication Events

#### `auth.login.success`

```json
{
  "action": "auth.login.success",
  "user_id": "user-uuid",
  "email_domain": "factory.com",
  "client_ip": "192.168.1.55",
  "user_agent_hash": "sha256-hash-of-user-agent"
}
```

Note: Only the email domain (not full email) is logged. User agent is hashed for fingerprinting without logging the full string.

#### `auth.login.failure`

```json
{
  "action": "auth.login.failure",
  "level": "warning",
  "client_ip": "192.168.1.55",
  "failure_reason": "invalid_password",
  "attempt_count": 3,
  "lockout_triggered": false
}
```

Note: Username is never logged on login failure to prevent username enumeration via logs.

#### `auth.login.account_locked`

```json
{
  "action": "auth.login.account_locked",
  "level": "warning",
  "user_id": "user-uuid",
  "client_ip": "192.168.1.55",
  "failed_attempts": 10,
  "lockout_duration_minutes": 15
}
```

#### `auth.token.refresh`

```json
{
  "action": "auth.token.refresh",
  "user_id": "user-uuid",
  "client_ip": "192.168.1.55",
  "new_token_family": false
}
```

#### `auth.token.replay_detected`

```json
{
  "action": "auth.token.replay_detected",
  "level": "warning",
  "user_id": "user-uuid",
  "client_ip": "192.168.1.55",
  "action_taken": "token_family_revoked",
  "sessions_terminated": 3
}
```

#### `auth.logout`

```json
{
  "action": "auth.logout",
  "user_id": "user-uuid",
  "sessions_remaining": 0
}
```

---

### 5. Disambiguation Events

#### `rag.disambiguation.triggered`

```json
{
  "action": "rag.disambiguation.triggered",
  "request_id": "req-...",
  "user_id": "user-uuid",
  "conversation_id": "conv-uuid",
  "error_code": "E101",
  "matching_machine_count": 2,
  "matching_machines": ["machine-haas-vf2", "machine-fanuc-0imf"],
  "session_machine_id": null,
  "trigger_reason": "no_session_machine_id"
}
```

#### `rag.disambiguation.machine_selected`

```json
{
  "action": "rag.disambiguation.machine_selected",
  "request_id": "req-...",
  "user_id": "user-uuid",
  "conversation_id": "conv-uuid",
  "selected_machine_id": "machine-haas-vf2",
  "selected_machine_name": "Haas VF-2"
}
```

---

### 6. Refusal Events

#### `rag.refusal.evidence_insufficient`

```json
{
  "action": "rag.refusal.evidence_insufficient",
  "request_id": "req-...",
  "user_id": "user-uuid",
  "conversation_id": "conv-uuid",
  "query_preview": "What is error Z999?...[truncated]",
  "query_type": "error_code_lookup",
  "chunks_retrieved": 0,
  "top_similarity_score": 0.21,
  "confidence_threshold": 0.60,
  "machine_scope": "machine-haas-vf2"
}
```

#### `rag.refusal.machine_not_indexed`

```json
{
  "action": "rag.refusal.machine_not_indexed",
  "request_id": "req-...",
  "user_id": "user-uuid",
  "attempted_machine_name": "KUKA KR6",
  "fuzzy_match_found": false
}
```

---

### 7. Error Events

#### `error.unhandled_exception`

```json
{
  "action": "error.unhandled_exception",
  "level": "error",
  "request_id": "req-...",
  "user_id": "user-uuid",
  "exception_type": "DatabaseConnectionError",
  "exception_message": "Connection refused to postgres:5432",
  "stack_trace": "...",
  "path": "/api/v1/query",
  "method": "POST"
}
```

Note: Stack traces are included in backend logs for error investigation. Stack traces are **never** sent to the client — the client receives only a generic error message and the `request_id` for correlation.

#### `error.llm_api_failure`

```json
{
  "action": "error.llm_api_failure",
  "level": "error",
  "request_id": "req-...",
  "llm_model": "gemini-2.0-flash",
  "error_type": "GeminiApiQuotaExceeded",
  "http_status": 429,
  "retry_attempt": 3,
  "will_retry": false
}
```

#### `error.citation_phantom_detected`

```json
{
  "action": "error.citation_phantom_detected",
  "level": "warning",
  "request_id": "req-...",
  "user_id": "user-uuid",
  "phantom_chunk_ids": ["PHANTOM-9999"],
  "retrieved_chunk_count": 3,
  "action_taken": "response_rejected"
}
```

#### `security.authorization_denied`

```json
{
  "action": "security.authorization_denied",
  "level": "warning",
  "request_id": "req-...",
  "user_id": "user-uuid",
  "user_role": "technician",
  "required_role": "admin",
  "path": "/api/v1/manuals/upload",
  "method": "POST"
}
```

#### `security.rate_limit_exceeded`

```json
{
  "action": "security.rate_limit_exceeded",
  "level": "warning",
  "client_ip": "192.168.1.55",
  "user_id": "user-uuid",
  "path": "/api/v1/auth/login",
  "limit": "5/minute",
  "retry_after_seconds": 47
}
```

---

## Log Levels

| Level | When to Use | Examples |
|-------|-------------|---------|
| `DEBUG` | Development only — verbose internal state | Embedding vector values, raw chunk text, SQL queries |
| `INFO` | Normal operational events | Pipeline stage completions, successful auth, job completions |
| `WARNING` | Abnormal conditions that don't stop processing | Below-threshold confidence scores, retries, rate limit hits, phantom citations |
| `ERROR` | Exceptions that fail the current request | LLM API failures, database errors, unhandled exceptions |
| `CRITICAL` | System-level failures requiring immediate intervention | Database unavailable, worker crash, memory exhaustion |

**Log level by environment:**

| Environment | Default Level | Debug Logs |
|-------------|---------------|-----------|
| `development` | `DEBUG` | Yes — all internal state visible |
| `staging` | `INFO` | No — INFO and above only |
| `production` | `INFO` | No — controlled via `LOG_LEVEL` env var |

---

## Frontend Logging

The Next.js frontend emits a minimal set of logs:

- Client-side errors are caught by a global error boundary and sent to the backend via `POST /api/v1/client-errors` — never logged to browser console in production.
- The backend receives sanitized error reports (no stack traces, no user data in the payload).
- Browser console `console.log` statements are stripped by Next.js production build (`removeConsole: true` in `next.config.js`).

**Frontend errors must never include:**

- Access tokens (these are in memory — they should not appear in error contexts)
- User query text
- API response content

---

## Log Aggregation and Alerting

### Shipping

All services emit logs to stdout. Docker's logging driver captures stdout and forwards to the configured log shipper:

- **Development:** `json-file` driver — logs viewable with `docker compose logs -f`
- **Production:** `fluentd` or `awslogs` driver — logs shipped to centralized store

### Alert Rules

The following log patterns should trigger immediate alerts:

| Alert | Trigger Condition | Severity |
|-------|------------------|---------|
| Auth anomaly | >20 `auth.login.failure` from same IP in 5 minutes | High |
| Token replay | Any `auth.token.replay_detected` event | High |
| Phantom citation | Any `error.citation_phantom_detected` event | High |
| LLM quota | `error.llm_api_failure` with `error_type=GeminiApiQuotaExceeded` | Critical |
| Database down | `error.unhandled_exception` with `exception_type=DatabaseConnectionError` repeated 3 times | Critical |
| High error rate | > 5% of requests in any 5-minute window have `status_code >= 500` | High |
| Disk space | Alert from system monitoring when disk > 80% | Medium |

---

## Request ID Propagation

Every request gets a unique `request_id` at the nginx level (`$request_id` variable), forwarded as `X-Request-ID` header to FastAPI. FastAPI stores it in the structlog context for the lifetime of the request, so every log event within a request carries the same `request_id`.

The `request_id` is also returned to the client in the `X-Request-ID` response header. When a user reports an error, they can provide the request ID for exact log correlation.

```nginx
# nginx.conf
add_header X-Request-ID $request_id always;
proxy_set_header X-Request-ID $request_id;
```

```python
# FastAPI middleware
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid4()))
    with structlog.contextvars.bound_contextvars(request_id=request_id):
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
```
