# Troubleshooting API — MechMind

The troubleshooting endpoints are the core of MechMind. They accept error codes and symptom descriptions from factory floor technicians and return structured diagnostic answers grounded in the indexed machine manuals.

Two interaction models are supported:
- **Single-shot query** (`POST /query`): stateless, one question, one answer. No conversation history is maintained.
- **Conversation** (`POST /conversations`, `POST /conversations/{id}/messages`): multi-turn, context-aware. The system builds on previous questions and answers within the same session.

---

## Shared Response Type: `TroubleshootingResponse`

All endpoints that return an answer share this response structure. It is embedded in the standard response envelope under `data`.

```json
{
  "answer_type": "solution",
  "confidence_level": "HIGH",
  "evidence_score": 0.87,
  "machine_context": {
    "machine_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "machine_name": "Haas VF-2",
    "model": "VF-2",
    "manufacturer": "Haas Automation"
  },
  "structured_answer": {
    "error_meaning": "E101 indicates a spindle encoder communication fault. The CNC control has lost signal contact with the spindle feedback encoder, preventing closed-loop speed control.",
    "probable_causes": [
      "Damaged or disconnected encoder cable between spindle motor and control cabinet",
      "Faulty spindle encoder unit",
      "Contamination on encoder connector pins",
      "Electrical noise from nearby equipment interfering with encoder signal"
    ],
    "corrective_steps": [
      {
        "step_number": 1,
        "instruction": "Power down the machine completely using the main disconnect switch before inspecting any cabling.",
        "is_warning": true,
        "warning_text": "LOCKOUT/TAGOUT must be applied before opening any cabinet doors. Failure to do so is a safety violation."
      },
      {
        "step_number": 2,
        "instruction": "Locate the spindle encoder cable (marked SP-ENC on the cable label). Trace it from the spindle motor to connector J7 on the main servo amplifier board.",
        "is_warning": false,
        "warning_text": null
      },
      {
        "step_number": 3,
        "instruction": "Inspect the cable for visible damage, kinking, or pinch points caused by machine movement. Replace if damaged.",
        "is_warning": false,
        "warning_text": null
      },
      {
        "step_number": 4,
        "instruction": "Unplug and reconnect J7. Clean the connector pins with an electronics-safe contact cleaner. Reconnect and power on.",
        "is_warning": false,
        "warning_text": null
      },
      {
        "step_number": 5,
        "instruction": "If E101 persists after cable inspection, replace the spindle encoder unit per Section 7.4 of the Service Manual.",
        "is_warning": false,
        "warning_text": null
      }
    ],
    "summary": "E101 is a spindle encoder fault. Begin with cable inspection. If cabling is intact, replace the encoder unit."
  },
  "citations": [
    {
      "citation_index": 1,
      "manual_title": "Haas VF-2 Service Manual Rev 4.2",
      "manual_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "chunk_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "page_start": 142,
      "page_end": 144,
      "section_path": "Chapter 6 > Error Codes > E101",
      "excerpt": "E101 SPINDLE ENCODER FAULT: Indicates loss of feedback signal from spindle encoder. Check cable continuity at J7. See Section 7.4 for encoder replacement procedure.",
      "relevance_score": 0.94
    },
    {
      "citation_index": 2,
      "manual_title": "Haas VF-2 Service Manual Rev 4.2",
      "manual_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "chunk_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
      "page_start": 201,
      "page_end": 203,
      "section_path": "Chapter 7 > Component Replacement > Section 7.4 Spindle Encoder",
      "excerpt": "7.4 SPINDLE ENCODER REPLACEMENT: Apply LOTO before proceeding. Encoder part number HA-SE-2200 is required for VF-2 series. Expected replacement time: 45 minutes.",
      "relevance_score": 0.81
    }
  ],
  "follow_up_suggestions": [
    "How do I perform LOTO on the Haas VF-2?",
    "Where can I find spindle encoder part number HA-SE-2200?",
    "What does E102 mean on the Haas VF-2?"
  ],
  "retrieval_metadata": {
    "chunks_retrieved": 20,
    "chunks_after_rerank": 5,
    "retrieval_latency_ms": 87,
    "llm_latency_ms": 1240,
    "total_latency_ms": 1341,
    "embedding_model": "text-embedding-004",
    "llm_model": "gemini-1.5-pro"
  }
}
```

### `answer_type` Values

| Value | Meaning | UI Behavior |
|---|---|---|
| `solution` | A complete answer was found with sufficient evidence | Display `structured_answer` |
| `disambiguation_required` | The query matches error codes in multiple machines | Display `DisambiguationCard` |
| `insufficient_information` | Evidence score too low; no reliable answer can be formed | Display `RefusalMessage` |
| `clarification_needed` | The query is too vague to map to a specific error or symptom | Display clarification prompt |
| `error` | A pipeline failure occurred during processing | Display error state |

### `confidence_level` Thresholds

| Level | `evidence_score` Range | UI Indicator |
|---|---|---|
| `HIGH` | ≥ 0.75 | Green badge — proceed with confidence |
| `MEDIUM` | 0.50 – 0.74 | Amber badge — verify steps against manual |
| `LOW` | < 0.50 | Red badge — "Low confidence. Consult the full manual or a specialist." |

---

## POST /api/v1/query

Single-shot troubleshooting query. No conversation state is created or maintained. Appropriate for quick lookups where the technician does not need multi-turn follow-up.

**Authentication:** Required (technician or higher)
**Rate limit:** 60 requests per minute per user

### Request

```
POST /api/v1/query
Content-Type: application/json
Authorization: Bearer <access_token>
```

```json
{
  "query": "What does error E101 mean?",
  "machine_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "machine_name": null
}
```

#### Request Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `query` | string | Yes | The error code or symptom description. Min 3 chars, max 2000 chars. |
| `machine_id` | UUID \| null | No | If provided, retrieval is scoped exclusively to this machine's manuals |
| `machine_name` | string \| null | No | Fuzzy name lookup alternative to `machine_id`. Ignored if `machine_id` is set. |

If neither `machine_id` nor `machine_name` is provided, the system queries across all indexed manuals and may return a disambiguation response if the same error code appears in multiple machines.

### Response: Success — Solution Found

```
HTTP 200 OK
```

```json
{
  "success": true,
  "data": {
    "answer_type": "solution",
    "confidence_level": "HIGH",
    "evidence_score": 0.87,
    "machine_context": { ... },
    "structured_answer": { ... },
    "citations": [ ... ],
    "follow_up_suggestions": [ ... ],
    "retrieval_metadata": { ... }
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

See `TroubleshootingResponse` schema above for full field definitions.

### Response: Disambiguation Required

```
HTTP 200 OK
```

```json
{
  "success": true,
  "data": {
    "answer_type": "disambiguation_required",
    "confidence_level": null,
    "evidence_score": null,
    "machine_context": null,
    "structured_answer": null,
    "citations": [],
    "disambiguation": {
      "message": "Error code E101 was found in manuals for multiple machines. Select the machine you are working on to get the correct answer.",
      "candidates": [
        {
          "machine_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "machine_name": "Haas VF-2",
          "model": "VF-2",
          "manufacturer": "Haas Automation",
          "category": "CNC Milling",
          "snippet": "E101 SPINDLE ENCODER FAULT: Indicates loss of feedback signal from spindle encoder..."
        },
        {
          "machine_id": "f0e1d2c3-b4a5-9678-fedc-ba9876543210",
          "machine_name": "FANUC M-20iA",
          "model": "M-20iA",
          "manufacturer": "FANUC",
          "category": "Industrial Robot",
          "snippet": "E101 SERVO AMPLIFIER OVERLOAD: Axis 1 servo amplifier has exceeded thermal limits..."
        }
      ]
    },
    "follow_up_suggestions": [],
    "retrieval_metadata": { ... }
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

### Response: Insufficient Information

```
HTTP 200 OK
```

```json
{
  "success": true,
  "data": {
    "answer_type": "insufficient_information",
    "confidence_level": "LOW",
    "evidence_score": 0.21,
    "machine_context": { ... },
    "structured_answer": null,
    "citations": [],
    "refusal": {
      "reason": "The indexed manuals for this machine do not contain sufficient information to answer this query reliably.",
      "suggestions": [
        "Check that the correct machine is selected",
        "Try rephrasing the query with more specific symptoms",
        "Contact your system administrator to verify the service manual is indexed"
      ]
    },
    "follow_up_suggestions": [],
    "retrieval_metadata": { ... }
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `query` is empty, too short, or too long |
| 401 | `AUTH_TOKEN_EXPIRED` | Bearer token has expired |
| 401 | `AUTH_INVALID_CREDENTIALS` | Token is malformed or missing |
| 404 | `QUERY_MACHINE_NOT_FOUND` | `machine_id` does not exist in the database |
| 422 | `VALIDATION_ERROR` | Request body fails JSON schema validation |
| 500 | `LLM_UNAVAILABLE` | Gemini API is unreachable or returned an error |
| 500 | `EMBEDDING_UNAVAILABLE` | Embedding model failed to produce a vector |
| 503 | `LLM_UNAVAILABLE` | Downstream service unavailable |

---

## POST /api/v1/conversations

Create a new conversation thread. Optionally supply an initial query and machine context.

**Authentication:** Required (technician or higher)

### Request

```
POST /api/v1/conversations
Content-Type: application/json
Authorization: Bearer <access_token>
```

```json
{
  "machine_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "initial_query": "How do I clear error E101?"
}
```

#### Request Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `machine_id` | UUID \| null | No | Scopes the conversation to a specific machine |
| `initial_query` | string \| null | No | If provided, the first message is submitted immediately |

### Response

```
HTTP 201 Created
```

```json
{
  "success": true,
  "data": {
    "conversation_id": "e5f6a7b8-c9d0-1234-efab-567890123456",
    "session_id": "sess_a1b2c3d4e5f6a7b8",
    "title": "How do I clear error E101?",
    "machine_context": {
      "machine_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "machine_name": "Haas VF-2",
      "model": "VF-2",
      "manufacturer": "Haas Automation"
    },
    "initial_response": null
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

If `initial_query` was provided, `initial_response` contains a full `TroubleshootingResponse`. If not, `initial_response` is null and the conversation is ready to receive its first message.

### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 401 | `AUTH_TOKEN_EXPIRED` | Token expired |
| 404 | `QUERY_MACHINE_NOT_FOUND` | `machine_id` not found |
| 422 | `VALIDATION_ERROR` | Schema validation failure |

---

## POST /api/v1/conversations/{conversation_id}/messages

Send a follow-up message within an existing conversation. The conversation history (up to the last 10 turns) is included in the LLM prompt context, enabling the technician to ask follow-up questions without re-stating the error code or machine.

**Authentication:** Required (own conversation or admin)
**Rate limit:** 60 requests per minute per user

### Request

```
POST /api/v1/conversations/{conversation_id}/messages
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `conversation_id` | UUID | The conversation to post to |

```json
{
  "content": "What tools do I need to replace the spindle encoder?",
  "machine_id": null
}
```

#### Request Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `content` | string | Yes | The follow-up question. Min 3 chars, max 2000 chars. |
| `machine_id` | UUID \| null | No | Override machine context for this message. If null, the conversation's existing machine context is used. |

### Response

```
HTTP 200 OK
```

```json
{
  "success": true,
  "data": {
    "conversation_id": "e5f6a7b8-c9d0-1234-efab-567890123456",
    "message_id": "f6a7b8c9-d0e1-2345-fabc-678901234567",
    "answer_type": "solution",
    "confidence_level": "HIGH",
    "evidence_score": 0.91,
    "machine_context": { ... },
    "structured_answer": { ... },
    "citations": [ ... ],
    "follow_up_suggestions": [
      "How long does encoder replacement typically take?",
      "Is there a torque spec for the encoder mounting bolts?",
      "How do I verify the replacement encoder is working correctly?"
    ],
    "retrieval_metadata": { ... }
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `content` is empty or exceeds length limits |
| 401 | `AUTH_TOKEN_EXPIRED` | Token expired |
| 403 | `AUTH_INSUFFICIENT_PERMISSION` | Conversation belongs to another user (non-admin) |
| 404 | `CONVERSATION_NOT_FOUND` | `conversation_id` does not exist |
| 410 | `CONVERSATION_EXPIRED` | Session has expired (> 90 days since last message) |
| 500 | `LLM_UNAVAILABLE` | Gemini API failure |

---

## GET /api/v1/conversations/{conversation_id}/messages

Retrieve the message history for a conversation. Returns messages in chronological order.

**Authentication:** Required (own conversation or admin)

### Request

```
GET /api/v1/conversations/{conversation_id}/messages?cursor=<cursor>&limit=20
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `conversation_id` | UUID | The conversation to read |

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `cursor` | string | _(first page)_ | Pagination cursor from previous response |
| `limit` | integer | 20 | Messages per page. Max 50. |

### Response

```
HTTP 200 OK
```

```json
{
  "success": true,
  "data": {
    "conversation_id": "e5f6a7b8-c9d0-1234-efab-567890123456",
    "machine_context": {
      "machine_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "machine_name": "Haas VF-2",
      "model": "VF-2",
      "manufacturer": "Haas Automation"
    },
    "items": [
      {
        "message_id": "0a1b2c3d-4e5f-6789-0abc-def123456789",
        "role": "user",
        "content": "What does error E101 mean?",
        "answer_type": null,
        "confidence_level": null,
        "evidence_score": null,
        "citations": [],
        "created_at": "2026-09-04T08:15:00Z"
      },
      {
        "message_id": "1b2c3d4e-5f6a-7890-1bcd-ef2345678901",
        "role": "assistant",
        "content": "E101 indicates a spindle encoder communication fault...",
        "answer_type": "solution",
        "confidence_level": "HIGH",
        "evidence_score": 0.87,
        "citations": [
          {
            "citation_index": 1,
            "manual_title": "Haas VF-2 Service Manual Rev 4.2",
            "page_start": 142,
            "section_path": "Chapter 6 > Error Codes > E101",
            "excerpt": "E101 SPINDLE ENCODER FAULT..."
          }
        ],
        "created_at": "2026-09-04T08:15:02Z"
      }
    ],
    "cursor": "eyJpZCI6IjFiMmMzZDRlIiwiY3JlYXRlZF9hdCI6IjIwMjYifQ==",
    "has_more": false,
    "total_count": 2
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 401 | `AUTH_TOKEN_EXPIRED` | Token expired |
| 403 | `AUTH_INSUFFICIENT_PERMISSION` | Conversation belongs to another user |
| 404 | `CONVERSATION_NOT_FOUND` | `conversation_id` does not exist |

---

## POST /api/v1/conversations/{conversation_id}/disambiguate

Resolves a disambiguation state. After the system returns `answer_type = "disambiguation_required"`, the technician selects the correct machine from the candidate list. This endpoint re-runs the original query scoped to the selected machine.

**Authentication:** Required (own conversation or admin)

### Request

```
POST /api/v1/conversations/{conversation_id}/disambiguate
Content-Type: application/json
Authorization: Bearer <access_token>
```

```json
{
  "machine_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "original_message_id": "0a1b2c3d-4e5f-6789-0abc-def123456789"
}
```

#### Request Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `machine_id` | UUID | Yes | The machine the technician has selected from the disambiguation candidates |
| `original_message_id` | UUID | Yes | The message ID of the user query that triggered disambiguation. Used to retrieve the original query text for re-execution. |

### Response

```
HTTP 200 OK
```

The response is identical in structure to the `POST /conversations/{id}/messages` response — a full `TroubleshootingResponse` scoped to the selected machine. The conversation's `machine_id` is updated to the selected machine for all subsequent messages in this conversation.

```json
{
  "success": true,
  "data": {
    "conversation_id": "e5f6a7b8-c9d0-1234-efab-567890123456",
    "message_id": "2c3d4e5f-6a7b-8901-2cde-f34567890123",
    "answer_type": "solution",
    "confidence_level": "HIGH",
    "evidence_score": 0.87,
    "machine_context": {
      "machine_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "machine_name": "Haas VF-2",
      "model": "VF-2",
      "manufacturer": "Haas Automation"
    },
    "structured_answer": { ... },
    "citations": [ ... ],
    "follow_up_suggestions": [ ... ],
    "retrieval_metadata": { ... }
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `machine_id` or `original_message_id` missing or invalid UUID |
| 401 | `AUTH_TOKEN_EXPIRED` | Token expired |
| 403 | `AUTH_INSUFFICIENT_PERMISSION` | Conversation belongs to another user |
| 404 | `CONVERSATION_NOT_FOUND` | `conversation_id` does not exist |
| 404 | `QUERY_MACHINE_NOT_FOUND` | `machine_id` is not a known machine |
| 422 | `VALIDATION_ERROR` | `original_message_id` references a message that was not a disambiguation request |

---

## DELETE /api/v1/conversations/{conversation_id}

Archives (soft-deletes) a conversation. The conversation and its messages remain in the database for the 90-day retention window but are no longer returned in the active conversation list. The technician can only delete their own conversations; admins can delete any conversation.

**Authentication:** Required (own conversation or admin)

### Request

```
DELETE /api/v1/conversations/{conversation_id}
Authorization: Bearer <access_token>
```

### Response

```
HTTP 200 OK
```

```json
{
  "success": true,
  "data": {
    "conversation_id": "e5f6a7b8-c9d0-1234-efab-567890123456",
    "archived": true,
    "message": "Conversation archived successfully."
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 401 | `AUTH_TOKEN_EXPIRED` | Token expired |
| 403 | `AUTH_INSUFFICIENT_PERMISSION` | Conversation belongs to another user and caller is not admin |
| 404 | `CONVERSATION_NOT_FOUND` | `conversation_id` does not exist |

---

## GET /api/v1/conversations

List all conversations for the currently authenticated user, ordered by most recently updated.

**Authentication:** Required

### Request

```
GET /api/v1/conversations?cursor=<cursor>&limit=20&active_only=true
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `cursor` | string | _(first page)_ | Pagination cursor |
| `limit` | integer | 20 | Items per page. Max 50. |
| `active_only` | boolean | `true` | If `false`, includes archived conversations |

### Response

```
HTTP 200 OK
```

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "conversation_id": "e5f6a7b8-c9d0-1234-efab-567890123456",
        "title": "How do I clear error E101?",
        "machine_context": {
          "machine_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "machine_name": "Haas VF-2"
        },
        "is_active": true,
        "message_count": 4,
        "last_message_at": "2026-09-04T09:42:00Z",
        "created_at": "2026-09-04T08:15:00Z"
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
