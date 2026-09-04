# Error Handling — MechMind

MechMind uses a consistent, domain-prefixed error code system. Every error carries a machine-readable code, a user-safe message suitable for display in the UI, and a developer-facing explanation. The user-safe message never exposes stack traces, internal identifiers, database error text, or information that could aid an attacker.

---

## Error Response Format

All errors follow the global response envelope (see `api-overview.md`):

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "The email address or password is incorrect.",
    "details": {}
  },
  "request_id": "7f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "timestamp": "2026-09-04T10:23:47.001Z"
}
```

The `details` object is optional. When present, it carries structured additional context (e.g., field-level validation errors, disambiguation candidates). It is always safe to display. Sensitive internal details are recorded in server-side structured logs keyed by `request_id` but are never returned to the client.

---

## Error Code Reference

### AUTH Domain

#### AUTH_INVALID_CREDENTIALS

| Property | Value |
|---|---|
| HTTP Status | 401 Unauthorized |
| User-Facing Message | "The email address or password is incorrect." |
| Developer Notes | Either the email was not found in `users` or the bcrypt comparison failed. The same message is used for both cases to prevent email enumeration. `details` is always `{}`. |
| Recovery | User should re-enter credentials. If the user has forgotten their password, an admin must reset it via the admin panel. |

---

#### AUTH_TOKEN_EXPIRED

| Property | Value |
|---|---|
| HTTP Status | 401 Unauthorized |
| User-Facing Message | "Your session has expired. Please log in again." |
| Developer Notes | The JWT `exp` claim is in the past. This includes both access token expiry (30 min) and refresh token expiry (7 days). |
| Recovery | The frontend should silently attempt a token refresh via `POST /auth/refresh`. If that also fails, redirect to `/login`. |
| `details` Example | `{ "expired_at": "2026-09-04T10:00:00Z" }` |

---

#### AUTH_INSUFFICIENT_PERMISSION

| Property | Value |
|---|---|
| HTTP Status | 403 Forbidden |
| User-Facing Message | "You do not have permission to perform this action." |
| Developer Notes | The authenticated user's role is below the minimum required role for the endpoint. E.g., a `technician` calling `DELETE /manuals/{id}` which requires `admin`. Also returned when `is_active = false` and the user attempts login. |
| Recovery | Contact an administrator to upgrade the account role if the action is legitimate. |

---

### QUERY Domain

#### QUERY_INSUFFICIENT_EVIDENCE

| Property | Value |
|---|---|
| HTTP Status | 200 OK |
| User-Facing Message | "I couldn't find reliable information to answer this question from the available manuals." |
| Developer Notes | The evidence score from the reranker fell below the configured threshold (default: 0.40). This is a graceful refusal — not an HTTP error. The response `success` field is `true` and `answer_type` is `"insufficient_information"`. |
| Recovery | The user should try: selecting the correct machine, rephrasing with more specific symptoms, or contacting an admin to verify the manual is indexed. |
| `details` Example | `{ "evidence_score": 0.21, "threshold": 0.40, "suggestion": "Try selecting the specific machine model you are working on." }` |

---

#### QUERY_DISAMBIGUATION_REQUIRED

| Property | Value |
|---|---|
| HTTP Status | 200 OK |
| User-Facing Message | "This error code exists in multiple machines. Please select the machine you are working on." |
| Developer Notes | The query matched error codes in chunks belonging to two or more different machines and no `machine_id` was provided. This is a success response (HTTP 200) with `answer_type = "disambiguation_required"`. The `details` object includes the candidate machines. |
| Recovery | The UI displays a `DisambiguationCard` with machine options. The user selects one, and the frontend calls `POST /conversations/{id}/disambiguate`. |
| `details` Example | `{ "candidates": [ { "machine_id": "...", "machine_name": "Haas VF-2", "snippet": "E101 SPINDLE ENCODER FAULT..." }, { "machine_id": "...", "machine_name": "FANUC M-20iA", "snippet": "E101 SERVO AMPLIFIER OVERLOAD..." } ] }` |

---

#### QUERY_MACHINE_NOT_FOUND

| Property | Value |
|---|---|
| HTTP Status | 404 Not Found |
| User-Facing Message | "The selected machine was not found. Please choose a different machine." |
| Developer Notes | The `machine_id` UUID provided in the request does not exist in the `machines` table, or the machine has `is_active = false`. |
| Recovery | The frontend `MachineSelector` should refresh its machine list and prompt the user to re-select. |
| `details` Example | `{ "machine_id": "a1b2c3d4-..." }` |

---

### MANUAL Domain

#### MANUAL_NOT_FOUND

| Property | Value |
|---|---|
| HTTP Status | 404 Not Found |
| User-Facing Message | "The requested manual was not found." |
| Developer Notes | The `manual_id` does not exist in the `manuals` table. |
| Recovery | Refresh the manual list. The manual may have been deleted by an administrator. |

---

#### MANUAL_DUPLICATE

| Property | Value |
|---|---|
| HTTP Status | 409 Conflict |
| User-Facing Message | "This file has already been uploaded and indexed. Uploading the same file twice is not allowed." |
| Developer Notes | The SHA-256 hash of the uploaded file matches an existing `manuals.file_hash` entry. This applies even if the existing manual belongs to a different machine or has a different title. |
| Recovery | If the manual content is legitimately different (a new revision), the admin should delete the old manual first, then re-upload. If it is a true duplicate, no action is needed — the existing manual is already indexed. |
| `details` Example | `{ "existing_manual_id": "d4e5f6a7-...", "existing_title": "Haas VF-2 Service Manual Rev 4.2" }` |

---

#### MANUAL_INVALID_FORMAT

| Property | Value |
|---|---|
| HTTP Status | 400 Bad Request |
| User-Facing Message | "The uploaded file is not a valid PDF. Only PDF files are accepted." |
| Developer Notes | Either the `Content-Type` header is not `application/pdf`, or the first 5 bytes of the file are not `%PDF-` (PDF magic bytes). This check runs before the file is written to storage. |
| Recovery | The user should verify they selected the correct file. Word documents, image files, and other formats are not supported. |

---

#### MANUAL_TOO_LARGE

| Property | Value |
|---|---|
| HTTP Status | 400 Bad Request |
| User-Facing Message | "The uploaded file exceeds the 100 MB size limit." |
| Developer Notes | The file size in bytes exceeds `104,857,600`. Checked via `Content-Length` header first, then confirmed at the byte stream level. |
| Recovery | If the PDF is legitimately large, the admin should: (1) split the PDF into logical sections (e.g., one per chapter), or (2) request a limit increase from the platform team. |
| `details` Example | `{ "file_size_bytes": 125829120, "limit_bytes": 104857600 }` |

---

#### MANUAL_PROCESSING_FAILED

| Property | Value |
|---|---|
| HTTP Status | 500 Internal Server Error (for unexpected failures) / 409 Conflict (for state conflicts) |
| User-Facing Message | "Manual processing failed. An administrator can retry ingestion from the admin panel." |
| Developer Notes | Terminal ingestion failure recorded in `ingestion_jobs.error_message`. Common causes: corrupted PDF that pdfplumber cannot parse, embedding API timeout after all retries exhausted, out-of-memory during chunk creation. The detailed error is in `ingestion_jobs.error_message` and server logs. |
| Recovery | Admin should check the ingestion job error message via `GET /manuals/{id}/status`, address the root cause (e.g., fix the PDF, check embedding API status), then trigger reindex via `POST /manuals/{id}/reindex`. |
| `details` Example | `{ "ingestion_job_id": "e5f6a7b8-...", "error_summary": "PDF parsing failed: file is encrypted." }` |

---

### CONVERSATION Domain

#### CONVERSATION_NOT_FOUND

| Property | Value |
|---|---|
| HTTP Status | 404 Not Found |
| User-Facing Message | "This conversation was not found. It may have been deleted." |
| Developer Notes | The `conversation_id` does not exist in `conversations`, or it belongs to another user and the caller is not an admin. Identical response in both cases (no user enumeration). |
| Recovery | Return the user to the conversations list. |

---

#### CONVERSATION_EXPIRED

| Property | Value |
|---|---|
| HTTP Status | 410 Gone |
| User-Facing Message | "This conversation has expired and can no longer receive new messages. Start a new conversation." |
| Developer Notes | The conversation's `updated_at` is older than the 90-day retention window, or the conversation has been hard-deleted by the scheduled cleanup job but the client still holds the ID. |
| Recovery | The frontend should redirect to `POST /conversations` to start a new session. The expired conversation's history is no longer accessible. |

---

### LLM/Infrastructure Domain

#### LLM_UNAVAILABLE

| Property | Value |
|---|---|
| HTTP Status | 503 Service Unavailable |
| User-Facing Message | "The AI service is temporarily unavailable. Please try again in a moment." |
| Developer Notes | The Gemini API returned a 5xx error, a connection timeout, or the request was rate-limited at the API key level. The ingestion worker and query pipeline both retry with exponential backoff (3 attempts, 2s/4s/8s delays) before emitting this error. |
| Recovery | Frontend should display a non-blocking retry button and the `Retry-After` header value if present. If outage persists, the admin should check the Gemini API status dashboard and verify the API key quota. |
| `details` Example | `{ "retry_after_seconds": 30, "upstream_status": 503 }` |

---

#### EMBEDDING_UNAVAILABLE

| Property | Value |
|---|---|
| HTTP Status | 503 Service Unavailable |
| User-Facing Message | "The search service is temporarily unavailable. Please try again in a moment." |
| Developer Notes | The text-embedding-004 model API call failed after retries. Distinct from `LLM_UNAVAILABLE` because this affects the retrieval phase, not the generation phase. A query cannot proceed without embeddings. |
| Recovery | Same as `LLM_UNAVAILABLE`. Embedding and generation calls share the same upstream API (Google AI), so they tend to fail together. |

---

### Validation Domain

#### VALIDATION_ERROR

| Property | Value |
|---|---|
| HTTP Status | 422 Unprocessable Entity (JSON schema failure) / 400 Bad Request (semantic validation failure) |
| User-Facing Message | "One or more fields contain invalid values. Please correct the highlighted fields and try again." |
| Developer Notes | 422 is returned by FastAPI's Pydantic validation (missing required fields, wrong type, string too long). 400 is returned for semantic failures caught in business logic (e.g., passwords don't match, email already taken). |
| Recovery | The `details` object contains field-level errors: `{ "field_errors": { "password": "Must be at least 12 characters.", "email": "Already registered." } }`. The frontend maps these to inline field error messages. |
| `details` Example | `{ "field_errors": { "query": "Field required.", "machine_id": "Invalid UUID format." } }` |

---

## HTTP Status Code Usage Summary

| Status Code | Meaning in MechMind | When Used |
|---|---|---|
| 200 OK | Success (or graceful refusal) | Standard success, and also `disambiguation_required` / `insufficient_information` (which are success states, not errors) |
| 201 Created | Resource created | `POST /manuals/upload`, `POST /machines`, `POST /auth/register`, `POST /conversations` |
| 202 Accepted | Async job queued | `POST /manuals/{id}/reindex` |
| 400 Bad Request | Client data error | Semantic validation failures (business logic rejections) |
| 401 Unauthorized | Authentication failure | Missing token, expired token, wrong credentials |
| 403 Forbidden | Authorization failure | Insufficient role, deactivated account |
| 404 Not Found | Resource not found | Unknown IDs, deactivated resources |
| 409 Conflict | State conflict | Duplicate file hash, manual currently processing |
| 410 Gone | Resource permanently unavailable | Expired conversations |
| 422 Unprocessable Entity | Schema validation failure | FastAPI Pydantic errors |
| 429 Too Many Requests | Rate limit exceeded | Query/upload rate limits, login brute force protection |
| 500 Internal Server Error | Unexpected server error | Unhandled exceptions, unexpected infrastructure failures |
| 503 Service Unavailable | Upstream dependency down | Gemini API unavailable, Redis unavailable |

---

## Error Logging Policy

Every 5xx response generates a structured error log entry containing:

- `request_id` (echoed in the response envelope)
- `user_id` (if authenticated)
- `endpoint` (method + path)
- `error_code` (the `DOMAIN_ERROR_NAME` string)
- `exception_class` and `exception_message` (server-side only, never returned to client)
- `stack_trace` (server-side only)
- `duration_ms`

4xx errors are logged at the `WARNING` level with request context but without stack traces, except for 429 (rate limit) which is logged at `INFO` level to avoid log noise.

The `request_id` is the primary correlation handle for production incident investigation. Technicians and admins should be instructed to copy the `request_id` from the UI error display when reporting issues to support.
