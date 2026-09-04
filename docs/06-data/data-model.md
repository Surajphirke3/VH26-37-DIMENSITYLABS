# Data Model — MechMind

This document describes the logical relationships between entities, lifecycle state machines, data governance policies, and the rationale behind key design decisions.

---

## Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          ENTITY RELATIONSHIPS                            │
└──────────────────────────────────────────────────────────────────────────┘

users
 │  id (PK)
 │  email
 │  role
 │
 ├──────────────────────────────────────────────────────┐
 │  created_by (FK)                                     │ ON DELETE SET NULL
 │                                                      ▼
 │                                                  manuals
 │                                                   │  id (PK)
 │                                                   │  machine_id (FK) ──────────┐
 │                                                   │  processing_status          │
 │                                                   │  file_hash (UNIQUE)         │
 │  user_id (FK, SET NULL)                           │                             │
 ├──────────────────────────────────────────────────►│  ◄── ingestion_jobs         │
 │                                                   │       │  manual_id (FK)     │
 │  user_id (FK, SET NULL)                           │       │  status             │
 ├──────────────────────────────────────────────────►│       │  progress_pct       │
 │                                                   │       │                     │
conversations                                        │  ◄── chunks                │
 │  id (PK)                                          │       │  id (PK)            │
 │  user_id (FK, SET NULL)                           │       │  manual_id (FK)     │
 │  machine_id (FK, SET NULL)                        │       │  machine_id (FK) ───┤ (denorm.)
 │  session_id                                       │       │  embedding          │
 │                                                   │       │  error_codes[]      │
 └──────► messages                                   │       │                     │
           │  id (PK)                                │       └─────────────────────┤
           │  conversation_id (FK)                   │                             │
           │  role                                   └─────────────────────────►  │
           │  answer_type                                                          │
           │  confidence_level                                               machines
           │                                                                  │  id (PK)
           └──────► citations                                                 │  name
                     │  id (PK)                                               │  model
                     │  message_id (FK)                                       │  manufacturer
                     │  chunk_id (FK, SET NULL)                               │  category
                     │  citation_index                                        │  is_active
                     │  is_phantom
                     │
audit_logs
 │  id (PK)
 │  user_id (FK, SET NULL)
 │  action
 │  resource_type
 │  resource_id
 │  details (JSONB)
```

### Cardinality Summary

| Relationship | Type | Notes |
|---|---|---|
| machines → manuals | 1 : many | One machine may have operator, service, and parts manuals |
| manuals → chunks | 1 : many | A 200-page manual typically produces 400–800 chunks |
| manuals → ingestion_jobs | 1 : many | Re-indexing creates a new job; history is preserved |
| chunks → citations | 1 : many | A single chunk may be cited in multiple answers |
| conversations → messages | 1 : many | Ordered by `created_at ASC` |
| messages → citations | 1 : many | Each [1], [2] reference is one citation row |
| users → conversations | 1 : many | A technician may have many sessions |
| users → audit_logs | 1 : many | Every authenticated action is logged |

---

## Manual Lifecycle

A manual moves through the following states from the moment it is uploaded until its chunks are available for retrieval.

```
                        ┌─────────────────────────────────────────────────────┐
                        │                  MANUAL LIFECYCLE                   │
                        └─────────────────────────────────────────────────────┘

   [Admin uploads PDF]
          │
          ▼
      ┌─────────┐     file_hash checked against manuals table
      │ PENDING │ ──── if duplicate ──►  HTTP 409 MANUAL_DUPLICATE (file rejected)
      └─────────┘
          │
          │  Ingestion worker picks up the job
          ▼
    ┌────────────┐
    │ PROCESSING │  ── ingestion_jobs.progress_pct increments as pages are parsed
    └────────────┘
          │
          ├── success ──────────────────────────────────────────────────┐
          │                                                              ▼
          │                                                        ┌───────────┐
          │                                                        │ COMPLETED │
          │                                                        └───────────┘
          │                                                              │
          │                                                    [Admin triggers reindex]
          │                                                              │
          │                                                              ▼
          │                                                       ┌─────────────┐
          │                                                       │ REPROCESSING│
          │                                                       └─────────────┘
          │                                                              │
          │                                                     (returns to PROCESSING
          │                                                      flow above)
          │
          └── failure ──────────────────────────────────────────────────┐
                                                                         ▼
                                                                    ┌────────┐
                                                                    │ FAILED │
                                                                    └────────┘
                                                                         │
                                                                [Admin may retry →
                                                                 new ingestion_job,
                                                                 status → REPROCESSING]
```

### Lifecycle State Transitions

| From | To | Trigger |
|---|---|---|
| `pending` | `processing` | Ingestion worker claims the job |
| `processing` | `completed` | All chunks embedded and written successfully |
| `processing` | `failed` | Unrecoverable error (e.g., corrupt PDF, embedding API failure) |
| `completed` | `reprocessing` | Admin requests re-index via `POST /manuals/{id}/reindex` |
| `failed` | `reprocessing` | Admin retries a failed ingestion |
| `reprocessing` | `processing` | Worker picks up the new job |

When a manual moves to `reprocessing`, the ingestion worker deletes all existing chunks for that manual (via `DELETE FROM chunks WHERE manual_id = $1`) before creating fresh ones. This avoids duplicate or stale chunks appearing in retrieval results.

### Ingestion Job Detail

Each state transition in `manuals.processing_status` is mirrored by a row in `ingestion_jobs`. This keeps the `manuals` table lean while providing a complete audit trail of every ingestion attempt including timestamps and error messages. The frontend polls `GET /api/v1/manuals/{id}/status` which reads the most recent `ingestion_jobs` row for that manual.

---

## Conversation Lifecycle

```
   [Technician opens chat or sends first message]
          │
          ▼
   ┌─────────────┐
   │   ACTIVE    │   is_active = true
   │             │   session_id live in Redis
   └─────────────┘
          │
          ├── Technician closes session or 90-day retention expires
          │
          ▼
   ┌──────────────┐
   │   ARCHIVED   │   is_active = false
   │              │   Redis session key removed
   └──────────────┘
          │
          │   (Data retained in PostgreSQL for audit / history view)
          │
          │   After 90 days from updated_at
          ▼
   ┌────────────────┐
   │  HARD DELETED  │   Scheduled job: DELETE FROM conversations WHERE ...
   └────────────────┘
          │
          │   ON DELETE CASCADE removes messages and citations
```

Conversations are soft-deleted by setting `is_active = false`. A nightly cleanup job permanently removes conversations older than 90 days along with their dependent messages and citations (cascaded by the database). Deleting a conversation does not delete the underlying chunks or manuals — those are independent of usage history.

---

## Soft Deletion Policy

MechMind uses a mixed strategy: soft deletion where foreign key integrity matters, hard deletion where data must be fully purged.

| Table | Deletion Strategy | Mechanism | Reason |
|---|---|---|---|
| `users` | Soft | `is_active = false` | Audit logs, conversation history must survive deactivation |
| `machines` | Soft | `is_active = false` | Manuals reference machines; removing a machine without reassigning manuals would violate `ON DELETE RESTRICT` |
| `manuals` | Hard (admin action) | `DELETE` row | Triggers cascade on chunks; explicitly intended action by admin |
| `chunks` | Hard (cascade) | `ON DELETE CASCADE` from `manuals` | No independent lifetime; chunk existence is tied to its manual |
| `conversations` | Soft then hard | `is_active = false` → scheduled DELETE after 90 days | Balances history visibility with data retention |
| `messages` | Hard (cascade) | `ON DELETE CASCADE` from `conversations` | No independent lifetime |
| `citations` | Hard (cascade) | `ON DELETE CASCADE` from `messages` | No independent lifetime |
| `ingestion_jobs` | Hard (cascade) | `ON DELETE CASCADE` from `manuals` | Job history is disposable when the manual is deleted |
| `audit_logs` | Hard (scheduled) | Scheduled DELETE after 1 year | Compliance retention window |

---

## Data Retention Policy

| Data Category | Retention Period | Mechanism |
|---|---|---|
| Conversations and messages | 90 days from `conversations.updated_at` | Nightly scheduled job |
| Audit logs | 1 year from `audit_logs.created_at` | Monthly archival job |
| Chunks | Until the parent manual is deleted | PostgreSQL `ON DELETE CASCADE` |
| Ingestion jobs | Until the parent manual is deleted | PostgreSQL `ON DELETE CASCADE` |
| User accounts | Indefinite (soft delete only) | Manual admin action required for permanent removal |
| Machine records | Indefinite (soft delete only) | Manual admin action; `ON DELETE RESTRICT` prevents orphan manuals |

The 90-day conversation window reflects the expected troubleshooting context — factory incidents older than three months are unlikely to be referenced in follow-up queries. Extending this window requires a configuration change and a migration to add a `retention_days` setting.

---

## Cascades and Orphan Prevention

### Cascade Map

```
machines (RESTRICT on delete)
  └── manuals (CASCADE on machine_id? No — RESTRICT)
        └── chunks              (ON DELETE CASCADE)
        └── ingestion_jobs      (ON DELETE CASCADE)

users (SET NULL on delete)
  └── manuals.created_by        (ON DELETE SET NULL)
  └── conversations.user_id     (ON DELETE SET NULL)
  └── audit_logs.user_id        (ON DELETE SET NULL)

conversations (CASCADE on delete)
  └── messages                  (ON DELETE CASCADE)
        └── citations           (ON DELETE CASCADE)

chunks (SET NULL on citation delete)
  └── citations.chunk_id        (ON DELETE SET NULL)
```

### Orphan Prevention Rules

1. **A machine cannot be deleted while it has associated manuals.** `ON DELETE RESTRICT` on `manuals.machine_id` forces the admin to either delete or reassign all manuals before removing a machine. This prevents a situation where chunks exist in the vector index pointing to a non-existent machine.

2. **Chunks are always owned by a manual.** `ON DELETE CASCADE` on `chunks.manual_id` ensures no orphan embeddings remain in the `chunks` table after a manual is deleted. The BM25 index must also be rebuilt after manual deletion — the application layer handles this as part of the deletion workflow.

3. **Citations survive chunk re-indexing.** `ON DELETE SET NULL` on `citations.chunk_id` means that when a manual is reindexed and its chunks replaced, existing citations in historical messages are not deleted — they simply lose their chunk reference (`chunk_id = NULL`), which the UI surfaces as "[Source no longer available]".

4. **User deactivation does not cascade.** Setting `is_active = false` on a user leaves all their foreign key references intact. This preserves conversation history, audit logs, and manual attribution.

---

## Denormalization: `machine_id` on `chunks`

### The Design Decision

The `chunks` table carries a `machine_id` column even though this value is already derivable by joining through `manuals` (`chunks.manual_id → manuals.machine_id`).

### Justification

The core retrieval query executed on every user question is:

```sql
SELECT id, content, section_path, page_start, relevance_score
FROM chunks
WHERE machine_id = $1                          -- scope to current machine
ORDER BY embedding <=> $2                      -- ANN vector search
LIMIT 20;
```

Without denormalization, this would require a join:

```sql
SELECT c.id, c.content, c.section_path, c.page_start
FROM chunks c
JOIN manuals m ON c.manual_id = m.id
WHERE m.machine_id = $1
ORDER BY c.embedding <=> $2
LIMIT 20;
```

The HNSW index on `chunks.embedding` cannot be efficiently combined with a filter that requires resolving `machine_id` through a join. PostgreSQL's query planner is likely to either:
- Perform a full index scan and then filter, defeating the ANN index, or
- Fall back to a sequential scan of the join result.

By materializing `machine_id` directly on `chunks`, the planner can apply the machine filter during the HNSW scan, dramatically reducing the candidate set before distance computation.

### Consistency Guarantee

`chunks.machine_id` is always written by the ingestion worker at chunk creation time using the value from the parent `manuals` row. There is no UPDATE path for `chunks.machine_id` — if a manual needs to be reassigned to a different machine, the correct procedure is to delete the manual (cascading all chunks) and re-upload it under the new machine.

### Trade-off Accepted

The trade-off is that a data inconsistency is theoretically possible if `chunks.machine_id` diverges from `manuals.machine_id`. This risk is mitigated by:
1. The ingestion worker being the only writer of chunk rows.
2. A database check constraint validating that `chunks.machine_id` matches `manuals.machine_id` is feasible via a trigger if stricter guarantees are needed in the future.
3. Integration tests that verify chunk machine attribution after every ingestion run.
