# API Overview — MechMind

The MechMind backend exposes a RESTful HTTP API built with FastAPI. All endpoints are versioned under `/api/v1`. This document describes the API's structural conventions, authentication model, response envelope, error format, and rate limiting. Individual router documentation is in the adjacent files.

---

## Base URL

```
https://{host}/api/v1
```

During local development the default base URL is `http://localhost:8000/api/v1`. The API root (`GET /api/v1`) returns a version manifest including build SHA, environment name, and a list of active feature flags.

---

## Routers

| Prefix | File | Purpose |
|---|---|---|
| `/auth` | `authentication-api.md` | Registration, login, token refresh, profile |
| `/machines` | `document-api.md` | Machine CRUD — admin and read-only views |
| `/manuals` | `document-api.md` | Manual upload, processing status, deletion, reindex |
| `/query` | `troubleshooting-api.md` | Single-shot query (stateless, no conversation) |
| `/conversations` | `troubleshooting-api.md` | Multi-turn conversation management and messaging |
| `/admin` | _(admin-api.md)_ | User management, system stats, index health |
| `/health` | _(health-api.md)_ | Liveness and readiness probes |

FastAPI auto-generates an OpenAPI 3.1 specification at `GET /openapi.json` and serves interactive documentation at `GET /docs` (Swagger UI) and `GET /redoc`.

---

## Authentication

All endpoints except `POST /auth/login` and `GET /health/*` require authentication.

### Token Format

MechMind uses JSON Web Tokens (JWT) transmitted as Bearer tokens in the `Authorization` header.

```
Authorization: Bearer <access_token>
```

### Token Lifetimes

| Token | Lifetime | Storage |
|---|---|---|
| Access token | 30 minutes | Client memory only (never localStorage) |
| Refresh token | 7 days | HTTP-only secure cookie |

### Token Rotation

On every successful `POST /auth/refresh`, the server:
1. Validates the incoming refresh token.
2. Issues a new access token and a new refresh token.
3. Invalidates the old refresh token (stored in Redis as a revocation list).

This prevents refresh token replay attacks. A refresh token can only be used once.

### Role-Based Authorization

Endpoints declare their minimum required role. Roles are ordered: `technician` < `manager` < `admin`.

| Role | Capabilities |
|---|---|
| `technician` | Query, read conversations and manuals, read machines |
| `manager` | All technician capabilities + upload manuals, create machines |
| `admin` | All manager capabilities + delete manuals/machines, user management, reindex |

FastAPI dependency injection is used for authorization:

```python
# Example — applied per route
Depends(require_role("admin"))
Depends(require_role("manager"))
Depends(get_current_active_user)   # any authenticated user
```

---

## Global Response Envelope

Every response from the API, whether success or failure, is wrapped in a consistent envelope. This allows clients to parse a single structure without first checking the HTTP status code.

### Success Response

```json
{
  "success": true,
  "data": { },
  "error": null,
  "request_id": "7f3a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "timestamp": "2026-09-04T10:23:45.123Z"
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "QUERY_DISAMBIGUATION_REQUIRED",
    "message": "Error code E101 exists in multiple machines. Please select the correct machine.",
    "details": {
      "candidates": [
        { "machine_id": "...", "machine_name": "Haas VF-2", "snippet": "E101: Spindle encoder fault..." },
        { "machine_id": "...", "machine_name": "FANUC M-20iA", "snippet": "E101: Servo amplifier overload..." }
      ]
    }
  },
  "request_id": "9a8b7c6d-5e4f-3a2b-1c0d-ef1234567890",
  "timestamp": "2026-09-04T10:23:47.001Z"
}
```

### Envelope Fields

| Field | Type | Description |
|---|---|---|
| `success` | boolean | `true` for 2xx responses, `false` for 4xx/5xx |
| `data` | object \| array \| null | The response payload; `null` on error |
| `error` | object \| null | Error object; `null` on success |
| `error.code` | string | Machine-readable error code (see `error-handling.md`) |
| `error.message` | string | Human-readable, safe for display in the UI |
| `error.details` | object | Additional structured context; may be empty `{}` |
| `request_id` | string (UUID) | Echoed in every response; use for support tracing |
| `timestamp` | string (ISO 8601) | Server-side time the response was generated |

The `request_id` is generated at the beginning of each request by FastAPI middleware and attached to structured logs. When a technician reports a problem, the `request_id` from the UI allows exact log lookup.

---

## Pagination

List endpoints that may return large result sets use cursor-based pagination rather than offset-based pagination. Cursor-based pagination is stable under concurrent inserts.

### Request Parameters

```
GET /api/v1/manuals?cursor=<opaque_cursor>&limit=20
```

| Parameter | Default | Maximum | Description |
|---|---|---|---|
| `cursor` | _(absent = first page)_ | — | Opaque string returned by the previous page |
| `limit` | 20 | 100 | Number of items per page |

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "cursor": "eyJpZCI6IjEyMyIsImNyZWF0ZWRfYXQiOiIyMDI2In0=",
    "has_more": true,
    "total_count": 143
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

| Field | Description |
|---|---|
| `items` | Array of result objects for this page |
| `cursor` | Opaque string to pass as `?cursor=` for the next page; absent when `has_more = false` |
| `has_more` | Whether additional pages exist |
| `total_count` | Total number of matching records (for displaying "Showing 1–20 of 143") |

The cursor encodes the last item's `id` and `created_at` (or `updated_at`) as a base64 JSON blob. The server decodes it to construct a `WHERE (created_at, id) < ($1, $2)` clause, which is stable and uses the existing B-tree indexes.

---

## Versioning

MechMind uses URL path versioning.

| Version | Status | Base Path |
|---|---|---|
| v1 | Current | `/api/v1` |
| v2 | Planned | `/api/v2` |

When a breaking change is required (e.g., a field rename, a removed endpoint, a changed response structure), a new version prefix is introduced. Both versions run simultaneously during a migration window (minimum 3 months). Non-breaking additions (new optional fields, new endpoints) are made to the existing version without a version bump.

The `GET /api/v1` root endpoint includes a `deprecated: false` flag and a `sunset_date` field (null if not deprecated) so clients can detect upcoming version retirements.

---

## Rate Limiting

Rate limits are enforced at the API gateway layer using a token bucket algorithm. Limits are per authenticated user, keyed by `user_id` in Redis.

| Endpoint Group | Limit | Window | Scope |
|---|---|---|---|
| `POST /query` | 60 requests | 1 minute | Per user |
| `POST /conversations/*/messages` | 60 requests | 1 minute | Per user |
| `POST /manuals/upload` | 10 uploads | 1 hour | Per user |
| `POST /auth/login` | 10 attempts | 15 minutes | Per IP address |
| All other authenticated endpoints | 300 requests | 1 minute | Per user |

When a limit is exceeded the API responds with HTTP 429 and includes retry guidance:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded the query rate limit. Please wait before submitting another query.",
    "details": {
      "limit": 60,
      "window_seconds": 60,
      "retry_after_seconds": 23
    }
  },
  "request_id": "...",
  "timestamp": "..."
}
```

The response also includes standard rate limit headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1725443027
Retry-After: 23
```

---

## Request Tracing and Logging

Every inbound request passes through a logging middleware that:

1. Generates a `request_id` (UUID v4) and attaches it to `request.state`.
2. Injects the `request_id` into the structured log context for the duration of the request.
3. Logs: method, path, user_id (if authenticated), IP address, response status code, and total latency in ms.
4. Returns the `request_id` in the response envelope (see above) and as a response header: `X-Request-ID`.

Structured logs use JSON format and are shipped to the centralized log aggregator. The `request_id` in the UI error message is the primary handle for support triage.

---

## OpenAPI Specification

FastAPI generates and serves an OpenAPI 3.1 specification:

- Interactive Swagger UI: `GET /docs`
- ReDoc documentation: `GET /redoc`
- Raw JSON schema: `GET /openapi.json`

The frontend TypeScript API client is generated from `openapi.json` using `openapi-typescript-codegen`. This is run as part of the frontend build process so type definitions are always in sync with the backend contract.

---

## Health Endpoints

| Endpoint | Purpose | Auth Required |
|---|---|---|
| `GET /health/live` | Liveness probe — returns 200 if the process is running | No |
| `GET /health/ready` | Readiness probe — checks DB, Redis, Gemini API connectivity | No |
| `GET /health/detailed` | Full dependency status with latency | Yes (admin) |

The readiness probe is used by Kubernetes to gate traffic routing. It returns 503 if any critical dependency (PostgreSQL, Redis) is unreachable, even if the process itself is running.
