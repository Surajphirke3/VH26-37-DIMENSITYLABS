# Document Management API — MechMind

Endpoints for uploading, managing, and monitoring machine manuals, and for managing machine records. Manual management endpoints require `manager` or `admin` role. Read operations are available to all authenticated users.

---

## Manual Endpoints

### POST /api/v1/manuals/upload

Upload a PDF manual and queue it for ingestion. The file is stored on the configured object store (local filesystem in development, S3-compatible in production) and an ingestion job is created. The endpoint returns immediately; processing happens asynchronously in the background.

**Authentication:** Required — `manager` or `admin` role
**Rate limit:** 10 uploads per hour per user
**Content-Type:** `multipart/form-data`

#### Request

```
POST /api/v1/manuals/upload
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
```

**Form Fields:**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `file` | File (binary) | Yes | PDF only, max 100 MB | The PDF manual file |
| `machine_id` | string (UUID) | Yes | Must exist in `machines` table | Machine this manual belongs to |
| `manual_type` | string | Yes | One of: `operator`, `service`, `parts`, `installation`, `other` | Classification of the manual |
| `title` | string | Yes | Max 500 chars | Human-readable title (e.g., "Haas VF-2 Service Manual Rev 4.2") |
| `version` | string | No | Max 50 chars | Manual version or revision (e.g., "Rev 4.2", "2024-03") |

#### Pre-upload Validation Steps

Before the file is written to storage, the API performs:

1. **MIME type check**: The uploaded file must have `Content-Type: application/pdf` and the first 5 bytes must be `%PDF-` (magic bytes verification).
2. **Size check**: Rejects files larger than 100 MB (`104,857,600` bytes).
3. **File hash computation**: SHA-256 hash of the file bytes is computed and checked against `manuals.file_hash`. If a match is found, the upload is rejected with `MANUAL_DUPLICATE`.
4. **Machine existence check**: `machine_id` must reference an active machine.

#### Response: Success

```
HTTP 201 Created
```

```json
{
  "success": true,
  "data": {
    "manual_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
    "title": "Haas VF-2 Service Manual Rev 4.2",
    "machine_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "machine_name": "Haas VF-2",
    "manual_type": "service",
    "version": "Rev 4.2",
    "file_size_bytes": 15728640,
    "original_filename": "haas_vf2_service_rev42.pdf",
    "processing_status": "pending",
    "ingestion_job_id": "e5f6a7b8-c9d0-1234-efab-567890123456",
    "created_at": "2026-09-04T10:00:00Z"
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

#### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 400 | `MANUAL_INVALID_FORMAT` | File is not a valid PDF (MIME type or magic bytes check failed) |
| 400 | `MANUAL_TOO_LARGE` | File exceeds 100 MB |
| 400 | `VALIDATION_ERROR` | Required fields missing or invalid |
| 401 | `AUTH_TOKEN_EXPIRED` | Token expired |
| 403 | `AUTH_INSUFFICIENT_PERMISSION` | Caller is a technician (role too low) |
| 404 | `QUERY_MACHINE_NOT_FOUND` | `machine_id` does not exist |
| 409 | `MANUAL_DUPLICATE` | File with identical SHA-256 hash is already indexed |
| 422 | `VALIDATION_ERROR` | Form field validation failure |

---

### GET /api/v1/manuals

List all manuals with optional filters.

**Authentication:** Required (any role)

#### Request

```
GET /api/v1/manuals?machine_id=<uuid>&status=completed&manual_type=service&cursor=<cursor>&limit=20
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `machine_id` | UUID | Filter by machine |
| `status` | string | Filter by `processing_status` (pending, processing, completed, failed, reprocessing) |
| `manual_type` | string | Filter by manual type |
| `cursor` | string | Pagination cursor |
| `limit` | integer | Items per page (default 20, max 100) |

#### Response

```
HTTP 200 OK
```

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "manual_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
        "machine_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "machine_name": "Haas VF-2",
        "title": "Haas VF-2 Service Manual Rev 4.2",
        "manual_type": "service",
        "version": "Rev 4.2",
        "language": "en",
        "file_size_bytes": 15728640,
        "page_count": 312,
        "processing_status": "completed",
        "chunk_count": 624,
        "created_at": "2026-09-04T10:00:00Z",
        "processing_completed_at": "2026-09-04T10:03:47Z"
      }
    ],
    "cursor": "...",
    "has_more": false,
    "total_count": 1
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

---

### GET /api/v1/manuals/{manual_id}

Retrieve full manual detail including processing status, chunk count, and latest ingestion job state.

**Authentication:** Required (any role)

#### Request

```
GET /api/v1/manuals/{manual_id}
Authorization: Bearer <access_token>
```

#### Response

```
HTTP 200 OK
```

```json
{
  "success": true,
  "data": {
    "manual_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
    "machine_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "machine_name": "Haas VF-2",
    "title": "Haas VF-2 Service Manual Rev 4.2",
    "manual_type": "service",
    "version": "Rev 4.2",
    "language": "en",
    "original_filename": "haas_vf2_service_rev42.pdf",
    "file_size_bytes": 15728640,
    "page_count": 312,
    "processing_status": "completed",
    "processing_error": null,
    "processing_started_at": "2026-09-04T10:00:05Z",
    "processing_completed_at": "2026-09-04T10:03:47Z",
    "chunk_count": 624,
    "created_by": {
      "user_id": "f6a7b8c9-d0e1-2345-fabc-678901234567",
      "full_name": "Admin User"
    },
    "created_at": "2026-09-04T10:00:00Z",
    "latest_ingestion_job": {
      "job_id": "e5f6a7b8-c9d0-1234-efab-567890123456",
      "status": "completed",
      "progress_pct": 100,
      "pages_processed": 312,
      "chunks_created": 624,
      "completed_at": "2026-09-04T10:03:47Z"
    }
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

#### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 401 | `AUTH_TOKEN_EXPIRED` | Token expired |
| 404 | `MANUAL_NOT_FOUND` | `manual_id` does not exist |

---

### DELETE /api/v1/manuals/{manual_id}

Permanently delete a manual and all its associated chunks, embeddings, and ingestion job records. This action is irreversible and requires admin role.

**Authentication:** Required — `admin` role only

The deletion workflow:
1. Soft-lock the manual (set status to `reprocessing` temporarily to block any concurrent ingestion).
2. Delete all chunks from the `chunks` table (triggers removal from vector index via cascade).
3. Remove the manual from the BM25 in-memory index.
4. Delete ingestion job records.
5. Delete the manual row.
6. Delete the file from object storage.

If the manual is currently in `processing` state, the delete is rejected with a 409 to prevent race conditions with the ingestion worker.

#### Request

```
DELETE /api/v1/manuals/{manual_id}
Authorization: Bearer <access_token>
```

#### Response

```
HTTP 200 OK
```

```json
{
  "success": true,
  "data": {
    "manual_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
    "deleted": true,
    "chunks_deleted": 624,
    "message": "Manual and all associated data permanently deleted."
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

#### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 401 | `AUTH_TOKEN_EXPIRED` | Token expired |
| 403 | `AUTH_INSUFFICIENT_PERMISSION` | Caller is not admin |
| 404 | `MANUAL_NOT_FOUND` | `manual_id` does not exist |
| 409 | `MANUAL_PROCESSING_FAILED` | Manual is currently being processed; retry after completion |

---

### POST /api/v1/manuals/{manual_id}/reindex

Trigger re-ingestion of an already-uploaded manual. Use this when the chunking strategy or embedding model has been updated, or when a previous ingestion failed. A new ingestion job is created; existing chunks are deleted at the start of the new ingestion run.

**Authentication:** Required — `admin` role only

#### Request

```
POST /api/v1/manuals/{manual_id}/reindex
Authorization: Bearer <access_token>
```

No request body required.

#### Response

```
HTTP 202 Accepted
```

```json
{
  "success": true,
  "data": {
    "manual_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
    "ingestion_job_id": "a7b8c9d0-e1f2-3456-abcd-ef1234567890",
    "processing_status": "reprocessing",
    "message": "Re-ingestion queued. Previous chunks will be replaced upon completion."
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

#### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 401 | `AUTH_TOKEN_EXPIRED` | Token expired |
| 403 | `AUTH_INSUFFICIENT_PERMISSION` | Caller is not admin |
| 404 | `MANUAL_NOT_FOUND` | `manual_id` does not exist |
| 409 | `MANUAL_PROCESSING_FAILED` | A job for this manual is already running |

---

### GET /api/v1/manuals/{manual_id}/status

Lightweight polling endpoint for monitoring ingestion progress. The frontend polls this endpoint every 3 seconds during ingestion and uses the response to update the `IngestProgressBar` component.

**Authentication:** Required (any role)

#### Request

```
GET /api/v1/manuals/{manual_id}/status
Authorization: Bearer <access_token>
```

#### Response

```
HTTP 200 OK
```

```json
{
  "success": true,
  "data": {
    "manual_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
    "processing_status": "processing",
    "ingestion_job": {
      "job_id": "e5f6a7b8-c9d0-1234-efab-567890123456",
      "status": "running",
      "progress_pct": 67,
      "pages_processed": 209,
      "total_pages": 312,
      "chunks_created": 418,
      "started_at": "2026-09-04T10:00:05Z",
      "completed_at": null,
      "error_message": null
    }
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

When `processing_status` is `completed` or `failed`, the frontend stops polling.

#### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 401 | `AUTH_TOKEN_EXPIRED` | Token expired |
| 404 | `MANUAL_NOT_FOUND` | `manual_id` does not exist |

---

## Machine Endpoints

### POST /api/v1/machines

Create a new machine record. Machine records must exist before manuals can be uploaded for them.

**Authentication:** Required — `manager` or `admin` role

#### Request

```
POST /api/v1/machines
Content-Type: application/json
Authorization: Bearer <access_token>
```

```json
{
  "name": "Haas VF-2",
  "model": "VF-2",
  "manufacturer": "Haas Automation",
  "category": "CNC Milling",
  "description": "Vertical machining center with 30x16x20 inch work envelope. Common in precision parts manufacturing."
}
```

#### Request Schema

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `name` | string | Yes | Max 255 chars | Machine name (e.g., "Haas VF-2") |
| `model` | string | No | Max 255 chars | Model number or designation |
| `manufacturer` | string | No | Max 255 chars | Manufacturer name |
| `category` | string | No | Max 100 chars | Machine category (e.g., "CNC Milling", "Industrial Robot", "Conveyor") |
| `description` | string | No | — | Free-text description for admin reference |

#### Response

```
HTTP 201 Created
```

```json
{
  "success": true,
  "data": {
    "machine_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Haas VF-2",
    "model": "VF-2",
    "manufacturer": "Haas Automation",
    "category": "CNC Milling",
    "description": "Vertical machining center with 30x16x20 inch work envelope.",
    "is_active": true,
    "manual_count": 0,
    "created_at": "2026-09-04T10:00:00Z"
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

#### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `name` is missing or exceeds length |
| 401 | `AUTH_TOKEN_EXPIRED` | Token expired |
| 403 | `AUTH_INSUFFICIENT_PERMISSION` | Caller is a technician |
| 409 | `VALIDATION_ERROR` | A machine with identical `name + model + manufacturer` already exists |
| 422 | `VALIDATION_ERROR` | JSON schema validation failure |

---

### GET /api/v1/machines

List all active machines.

**Authentication:** Required (any role)

#### Request

```
GET /api/v1/machines?category=CNC+Milling&cursor=<cursor>&limit=20
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `category` | string | Filter by category |
| `manufacturer` | string | Filter by manufacturer |
| `cursor` | string | Pagination cursor |
| `limit` | integer | Items per page (default 20, max 100) |

#### Response

```
HTTP 200 OK
```

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "machine_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Haas VF-2",
        "model": "VF-2",
        "manufacturer": "Haas Automation",
        "category": "CNC Milling",
        "is_active": true,
        "manual_count": 3,
        "indexed_manual_count": 3,
        "created_at": "2026-09-04T10:00:00Z"
      }
    ],
    "cursor": null,
    "has_more": false,
    "total_count": 1
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

---

### GET /api/v1/machines/{machine_id}

Retrieve machine detail including all associated manuals and their processing status.

**Authentication:** Required (any role)

#### Request

```
GET /api/v1/machines/{machine_id}
Authorization: Bearer <access_token>
```

#### Response

```
HTTP 200 OK
```

```json
{
  "success": true,
  "data": {
    "machine_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Haas VF-2",
    "model": "VF-2",
    "manufacturer": "Haas Automation",
    "category": "CNC Milling",
    "description": "Vertical machining center with 30x16x20 inch work envelope.",
    "is_active": true,
    "created_at": "2026-09-04T10:00:00Z",
    "manuals": [
      {
        "manual_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
        "title": "Haas VF-2 Service Manual Rev 4.2",
        "manual_type": "service",
        "version": "Rev 4.2",
        "processing_status": "completed",
        "chunk_count": 624,
        "page_count": 312,
        "created_at": "2026-09-04T10:00:00Z"
      },
      {
        "manual_id": "e5f6a7b8-c9d0-1234-efab-567890123456",
        "title": "Haas VF-2 Operator Manual",
        "manual_type": "operator",
        "version": "2023",
        "processing_status": "completed",
        "chunk_count": 384,
        "page_count": 192,
        "created_at": "2026-09-04T09:00:00Z"
      }
    ],
    "total_chunk_count": 1008
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

#### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 401 | `AUTH_TOKEN_EXPIRED` | Token expired |
| 404 | `QUERY_MACHINE_NOT_FOUND` | `machine_id` does not exist or machine is inactive |
