# MechMind Security Implementation Checklist

**Version:** 1.0  
**Last Updated:** 2026-09-04  
**Purpose:** Implementation verification checklist for the MechMind security architecture. Each item must be verified before production deployment. Items marked with `[CRITICAL]` are blocking — the system must not go live without them.

---

## How to Use This Checklist

- Work through each section during implementation and pre-deployment review.
- For each item: mark `[x]` when verified, `[-]` when not applicable (with a note), `[!]` when deferred with a tracked issue.
- Items labeled `[CRITICAL]` are security-blocking. All others are strongly recommended.
- Re-run this checklist after any significant code change to authentication, authorization, or data access paths.

---

## 1. Authentication

- [ ] **[CRITICAL]** `POST /api/v1/auth/login` validates credentials against bcrypt hash — plaintext or MD5/SHA1 comparison is never used.
- [ ] **[CRITICAL]** bcrypt cost factor is set to 12 or higher in the password hashing configuration — verify with `bcrypt.gensalt(rounds=12)`.
- [ ] **[CRITICAL]** JWT access tokens have a maximum lifetime of 30 minutes — verify `ACCESS_TOKEN_EXPIRE_MINUTES=30` environment variable is respected.
- [ ] **[CRITICAL]** Refresh tokens are stored as bcrypt hashes in the database — the raw token value is never persisted.
- [ ] **[CRITICAL]** Refresh token rotation is implemented — each use of a refresh token issues a new refresh token and invalidates the old one.
- [ ] **[CRITICAL]** Refresh token reuse (replay) detection is implemented — using an already-rotated token invalidates the entire token family and terminates all sessions for that user.
- [ ] **[CRITICAL]** Refresh tokens are returned in `HttpOnly; Secure; SameSite=Strict` cookies — not in JSON response bodies.
- [ ] **[CRITICAL]** JWT signing secret (`JWT_SECRET_KEY`) is at least 256 bits of entropy — verify it is not a short or guessable string.
- [ ] Access tokens are stored in JavaScript memory only (not `localStorage`, not `sessionStorage`) — confirm in frontend code.
- [ ] Login response timing is uniform for valid and invalid usernames — no timing side-channel for username enumeration.
- [ ] Rate limiting on login endpoint: max 5 attempts per IP per minute, max 10 per username per 15 minutes — verify `slowapi` configuration.
- [ ] Account lockout triggers after 10 failed login attempts — verify lockout mechanism and unlock procedure.
- [ ] All existing sessions (refresh tokens) are invalidated on password change — verify the token family revocation logic.
- [ ] All existing sessions are invalidated on account deactivation — verify admin user deactivation flow.
- [ ] Login failure response body does not indicate whether the username or password was wrong (only generic "invalid credentials" message).
- [ ] `POST /api/v1/auth/logout` revokes the refresh token from the database — verify token is removed, not just cookie cleared on client.

---

## 2. Authorization

- [ ] **[CRITICAL]** Every API route that requires authentication uses `Depends(get_current_user)` or equivalent — no route is accidentally public.
- [ ] **[CRITICAL]** Every admin-only endpoint uses `Depends(require_role(["admin"]))` — verify the dependency is declared at the route level, not just inside the function.
- [ ] **[CRITICAL]** Every manager-or-admin endpoint uses `Depends(require_role(["admin", "manager"]))` — verify complete permission matrix is implemented.
- [ ] **[CRITICAL]** Role is sourced exclusively from the JWT claim — never from the request body, query parameter, or request header other than the JWT.
- [ ] **[CRITICAL]** Conversation queries filter by `user_id = current_user.id` at the database level — not just at the route level.
- [ ] Manual deletion requires admin role — verify `DELETE /api/v1/manuals/{id}` returns 403 for manager and technician JWTs.
- [ ] Cross-user resource access returns 404 (not 403) — existence of a resource is not confirmed to unauthorized users.
- [ ] All conversation IDs use UUIDv4 — no sequential integer IDs that enable enumeration.
- [ ] Integration test suite includes test cases for each role attempting to access each higher-privilege endpoint — tests assert 403 response.
- [ ] Manager's team-conversation access is scoped to their team — managers cannot access conversations of users outside their team.

---

## 3. Input Validation

- [ ] **[CRITICAL]** All request body schemas use `model_config = ConfigDict(extra='forbid')` — unknown fields return 422 validation error.
- [ ] **[CRITICAL]** Query text field has `max_length=1000` enforced at Pydantic schema level — oversized queries are rejected before reaching the LLM.
- [ ] **[CRITICAL]** All UUID fields are typed as `UUID4` in Pydantic schemas — non-UUID values fail validation before reaching database queries.
- [ ] All string fields have explicit `min_length` and `max_length` bounds — no unbounded string inputs accepted.
- [ ] Enumerated fields (sort order, status, role in admin operations) use Python `Enum` types — only declared values accepted.
- [ ] Numeric fields have `ge` and `le` bounds — no unbounded integer or float inputs.
- [ ] File upload `Content-Type` is validated — non-multipart requests to upload endpoint are rejected.
- [ ] JSON endpoint `Content-Type` is validated — non-JSON requests return 415 Unsupported Media Type.
- [ ] Validation error responses (422) return a generic error structure — internal Pydantic error details are not exposed in production.
- [ ] Query parameters are validated with the same strictness as request body fields — no unvalidated query string values reach database or LLM.

---

## 4. File Upload

- [ ] **[CRITICAL]** nginx `client_max_body_size` is set to `100m` — requests larger than 100MB are rejected at the proxy layer before reaching FastAPI.
- [ ] **[CRITICAL]** Magic byte validation is implemented — the first bytes of every uploaded file are checked for PDF signature (`%PDF-`) before processing.
- [ ] **[CRITICAL]** `python-magic` MIME type detection is used in addition to extension check — both must pass.
- [ ] **[CRITICAL]** Client-supplied filename is ignored — a server-generated UUID filename is always used for storage.
- [ ] Uploaded files are stored outside the web root — they cannot be accessed via direct HTTP URL.
- [ ] Uploaded files are never served directly to browsers — access is exclusively through the query/retrieval system.
- [ ] PDF processing runs in a subprocess with `ulimit` memory limit (512MB) and a timeout (60 seconds).
- [ ] Subprocess for PDF processing runs as a non-root, restricted user.
- [ ] PyMuPDF or pdfplumber is used for text extraction — libraries that do not execute PDF JavaScript.
- [ ] Rate limit on upload endpoint: max 5 uploads per user per hour — verify slowapi configuration.
- [ ] Failed upload jobs are logged with file hash, uploader user_id, and rejection reason.
- [ ] Staging directory is cleaned up after processing (success or failure) — no orphaned files accumulate.
- [ ] File decompressed/extracted text size is checked — jobs producing more than 50MB of extracted text are rejected.
- [ ] ClamAV integration is documented and stubbed (or active in production) — virus scan step exists in pipeline even if deferred.

---

## 5. LLM / RAG Security

- [ ] **[CRITICAL]** Retrieved chunks are wrapped in explicit XML-style delimiters (`<retrieved_context>`) in the LLM prompt — chunks are never injected directly into the prompt as undelimited text.
- [ ] **[CRITICAL]** System prompt explicitly instructs the model to treat `<retrieved_context>` as data, not instructions — and to refuse to follow any instructions found within it.
- [ ] **[CRITICAL]** LLM is instructed to return a structured JSON response with a defined schema — free-form text response mode is not used.
- [ ] **[CRITICAL]** Response JSON schema validation is enforced — if the model returns invalid JSON or a schema-nonconforming response, the request fails with an error (not passed through to client).
- [ ] Citation IDs in the LLM response are validated against the retrieved chunk IDs — any citation ID not in the retrieved set is flagged as phantom citation and the response is rejected.
- [ ] User query is wrapped in `<user_query>` delimiters — distinguished from system instructions and retrieved context.
- [ ] LLM response is screened for system prompt disclosure patterns before being sent to client.
- [ ] Conversation context retrieved for LLM prompt is filtered by `user_id` — no cross-user context leakage.
- [ ] LLM API key (`GEMINI_API_KEY`) is validated at application startup — startup fails with a clear error if the key is missing or malformed.
- [ ] Gemini API usage quota is configured in Google Cloud Console — hard cap prevents runaway billing.
- [ ] LLM call inputs and outputs are logged (with query truncated to 100 chars) for audit purposes.
- [ ] Ingestion pipeline includes a step that scans extracted text chunks for known prompt injection patterns — flagged chunks are quarantined for admin review before indexing.

---

## 6. API Security

- [ ] **[CRITICAL]** CORS `allow_origins` is set to an explicit list of allowed origins — `["*"]` is never used in production.
- [ ] **[CRITICAL]** `CORS_ORIGINS` environment variable is validated at startup — empty or wildcard value causes startup failure in production mode.
- [ ] Rate limiting middleware (`slowapi`) is active and backed by Redis — not an in-memory-only implementation.
- [ ] Per-IP and per-user rate limits are both implemented — per-user limits prevent multi-IP bypass.
- [ ] Rate limit counts are incremented before processing (not after) — burst attacks cannot exceed limits via concurrent requests.
- [ ] `X-Forwarded-For` header is only trusted from known proxy IPs — direct connections use socket IP.
- [ ] `OPTIONS` (preflight) requests return correct CORS headers — verify with a cross-origin tool.
- [ ] API endpoints do not accept session or auth information from URL query parameters — only Authorization header and cookies.
- [ ] Error responses in production do not include stack traces — only generic error messages and request IDs.
- [ ] API versioning is in place (`/api/v1/`) — future breaking changes can be introduced without breaking existing clients.
- [ ] Health check endpoint (`/health`) is public and returns minimal information — does not expose version, dependency status, or internal configuration.

---

## 7. Database Security

- [ ] **[CRITICAL]** Application database user has only `SELECT, INSERT, UPDATE, DELETE` on application tables — no `DROP`, `CREATE`, `TRUNCATE`, or system catalog access.
- [ ] **[CRITICAL]** Database credentials are stored in environment variables only — never in code or config files.
- [ ] PostgreSQL is not exposed on a public network interface — accessible only from within the Docker network.
- [ ] Database backups are encrypted at rest — verify backup tool configuration.
- [ ] Audit log table has INSERT-only permissions for the application user — `UPDATE` and `DELETE` are not granted.
- [ ] Connection pooling is configured with a maximum pool size — unbounded connections cannot exhaust database resources.
- [ ] PostgreSQL is configured with `log_connections = on` and `log_disconnections = on` — connection anomalies are logged.
- [ ] `pgvector` extension is installed in a dedicated schema — extension privileges are not granted to the application user.

---

## 8. Frontend Security

- [ ] **[CRITICAL]** `dangerouslySetInnerHTML` is never used with LLM-generated content — ESLint `no-danger` rule is enabled.
- [ ] **[CRITICAL]** Content Security Policy header is set with `script-src 'self'` — no `unsafe-inline` or `unsafe-eval` in script-src.
- [ ] `Strict-Transport-Security` header is set with `max-age=31536000` — HSTS is active in production.
- [ ] `X-Frame-Options: DENY` header is set — application cannot be embedded in iframes.
- [ ] `X-Content-Type-Options: nosniff` header is set — browser does not sniff MIME types.
- [ ] Markdown rendering (if used) uses DOMPurify sanitization with a restrictive allowlist.
- [ ] Access token is stored in JavaScript memory — not in `localStorage`, `sessionStorage`, or any persistent storage.
- [ ] Refresh token cookie is cleared on logout — `Set-Cookie` with empty value and `Max-Age=0` is sent by backend.
- [ ] Authentication state is cleared from all in-memory stores on token expiry or logout — no stale state.
- [ ] Frontend does not log sensitive data to the browser console in production — `console.log` statements are stripped in production build.
- [ ] Next.js `output: 'standalone'` is used — no development server dependencies in production image.
- [ ] Third-party dependencies are reviewed for known vulnerabilities via `npm audit` in CI.

---

## 9. Infrastructure Security

- [ ] **[CRITICAL]** Docker containers run as non-root users — verify `USER` directive in Dockerfiles.
- [ ] **[CRITICAL]** Production deployment uses TLS — nginx terminates SSL with a valid certificate.
- [ ] Container images are based on minimal base images (`python:3.11-slim`, `node:20-alpine`) — attack surface minimized.
- [ ] Docker image vulnerability scanning is part of CI pipeline — images are scanned before deployment.
- [ ] Docker networks are explicitly defined — services communicate only via named internal networks, not bridge default.
- [ ] Ports exposed to the host are minimal — only nginx (80/443) is exposed; database, Redis, and API are on internal network only.
- [ ] Docker volumes for persistent data (PostgreSQL, uploads) are not world-writable.
- [ ] Secrets in Docker Compose are passed via environment variables or Docker Secrets — never hardcoded in `docker-compose.yml`.

---

## 10. Secrets Management

- [ ] **[CRITICAL]** `.env` file is in `.gitignore` — verify that `git ls-files | grep '.env$'` returns nothing.
- [ ] **[CRITICAL]** `.env.example` contains only placeholder values — no real secrets — verify by code review.
- [ ] `detect-secrets` or equivalent pre-commit hook is installed and active — blocks commits containing secret patterns.
- [ ] CI pipeline includes secret scanning step — prevents secrets from entering the repository via CI.
- [ ] `JWT_SECRET_KEY` is at least 64 hex characters (256 bits) — generated with `openssl rand -hex 32` or equivalent.
- [ ] Gemini API key is configured with minimum required scopes — not a full-access API key.
- [ ] Gemini API usage alerts are configured — alert at 80% of quota and on unusual usage spikes.
- [ ] All `SecretStr` fields in Pydantic settings are used — confirm secrets do not appear in application logs or `str()` output.
- [ ] Credentials are rotated according to a defined schedule (JWT secret: annually, DB password: annually, API key: on staff change).

---

## 11. Logging and Monitoring

- [ ] **[CRITICAL]** Passwords, tokens, and API keys never appear in log output — verify with a test login and inspect logs for credential patterns.
- [ ] **[CRITICAL]** LLM API key never appears in logs — structlog processor strips fields matching `*_KEY`, `*_SECRET`, `*_PASSWORD`.
- [ ] All auth events are logged: `login_success`, `login_failure`, `token_refresh`, `logout`, `account_lockout`.
- [ ] All RAG pipeline stages are logged with timing: `embedding_generated`, `retrieval_completed`, `llm_called`, `response_generated`.
- [ ] Ingestion pipeline events are logged: `job_started`, `page_processed`, `chunk_created`, `job_completed`, `job_failed`.
- [ ] Disambiguation events are logged: `disambiguation_triggered`, `machine_selected`.
- [ ] Refusal events are logged: `evidence_insufficient`, `refusal_returned`.
- [ ] All logs include: `timestamp`, `level`, `service`, `request_id`, `user_id` (when authenticated), `action`.
- [ ] Log format is structured JSON (structlog) — not plaintext.
- [ ] Full query text is not logged — only the first 100 characters.
- [ ] Full LLM response is not logged — only metadata (confidence, citation count, response time).
- [ ] Personal data from manuals is not stored in log fields.
- [ ] Logs are shipped to an external log store (stdout → log aggregator) — not only stored on the application host.
- [ ] Alert rules are defined for: login failures exceeding threshold, error rate exceeding 5%, LLM API errors, disk usage exceeding 80%.
- [ ] Request IDs are propagated through the full request lifecycle (nginx → FastAPI → worker) — correlated in logs.
- [ ] Audit log table is append-only — no UPDATE or DELETE permissions for application user.

---

## Checklist Summary

| Section | Total Items | Critical Items |
|---------|------------|---------------|
| Authentication | 16 | 8 |
| Authorization | 10 | 5 |
| Input Validation | 10 | 4 |
| File Upload | 14 | 4 |
| LLM / RAG Security | 12 | 4 |
| API Security | 11 | 2 |
| Database Security | 8 | 2 |
| Frontend Security | 11 | 2 |
| Infrastructure Security | 8 | 2 |
| Secrets Management | 9 | 2 |
| Logging and Monitoring | 15 | 2 |
| **Total** | **124** | **37** |

---

## Pre-Deployment Gate Criteria

All `[CRITICAL]` items must be verified before any production deployment. Non-critical items must be tracked as known issues with assigned owners and target dates.

**Sign-off required from:**

- [ ] Lead Developer — code-level items verified
- [ ] Security Architect — threat model alignment verified
- [ ] DevOps Engineer — infrastructure items verified
- [ ] QA Lead — test coverage for security items verified
