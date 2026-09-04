# Database Schema — MechMind

PostgreSQL 15+ with the `pgvector` extension. All tables live in the `public` schema unless otherwise noted. UUID generation uses `gen_random_uuid()` (available without a separate extension in PostgreSQL 13+).

---

## Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid() on PG < 13
CREATE EXTENSION IF NOT EXISTS "vector";     -- pgvector for embedding columns
```

---

## ENUM Types

All application-level enumerations are declared as PostgreSQL native types so the database enforces valid values independently of the application layer.

```sql
CREATE TYPE user_role AS ENUM ('admin', 'technician', 'manager');

CREATE TYPE manual_type AS ENUM (
    'operator',
    'service',
    'parts',
    'installation',
    'other'
);

CREATE TYPE processing_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'reprocessing'
);

CREATE TYPE chunk_type AS ENUM (
    'section',
    'error_code',
    'table',
    'warning',
    'overlap'
);

CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

CREATE TYPE answer_type AS ENUM (
    'solution',
    'disambiguation_required',
    'insufficient_information',
    'clarification_needed',
    'error'
);

CREATE TYPE confidence_level AS ENUM ('HIGH', 'MEDIUM', 'LOW');

CREATE TYPE job_status AS ENUM (
    'queued',
    'running',
    'completed',
    'failed',
    'cancelled'
);
```

---

## Table 1: `users`

Stores authenticated system users. Passwords are stored as bcrypt hashes — the plaintext value never enters the database.

```sql
CREATE TABLE users (
    id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    email             VARCHAR(255)    NOT NULL,
    password_hash     VARCHAR(255)    NOT NULL,
    role              user_role       NOT NULL DEFAULT 'technician',
    full_name         VARCHAR(255),
    is_active         BOOLEAN         NOT NULL DEFAULT true,
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    last_login        TIMESTAMPTZ,

    CONSTRAINT users_email_unique UNIQUE (email)
);

-- Partial index: only active users are looked up during login
CREATE INDEX idx_users_email_active
    ON users (email)
    WHERE is_active = true;

-- General lookup by role for admin list views
CREATE INDEX idx_users_role ON users (role);
```

**Purpose:** Central identity table. `role` drives all API authorization decisions. `is_active = false` is used for soft-deletion — deactivated accounts cannot log in but their foreign key references (conversation history, audit logs) remain intact.

---

## Table 2: `machines`

Represents physical machines on the factory floor. Each machine may have multiple manuals associated with it.

```sql
CREATE TABLE machines (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255)    NOT NULL,
    model           VARCHAR(255),
    manufacturer    VARCHAR(255),
    category        VARCHAR(100),
    description     TEXT,
    is_active       BOOLEAN         NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Prevents duplicate entries for the same physical product line
    CONSTRAINT machines_name_model_manufacturer_unique
        UNIQUE (name, model, manufacturer)
);

CREATE INDEX idx_machines_manufacturer ON machines (manufacturer);
CREATE INDEX idx_machines_category ON machines (category);
CREATE INDEX idx_machines_active ON machines (is_active) WHERE is_active = true;
```

**Purpose:** The machine dimension is central to MechMind's disambiguation logic. When the same error code (e.g., `E101`) appears in manuals from two different machines, the system consults this table to present the technician with a machine-selection prompt. `category` supports filtering (e.g., show all CNC manuals).

---

## Table 3: `manuals`

Tracks uploaded PDF manuals throughout their ingestion lifecycle, from initial upload through text extraction, chunking, and embedding.

```sql
CREATE TABLE manuals (
    id                      UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id              UUID                NOT NULL,
    title                   VARCHAR(500)        NOT NULL,
    manual_type             manual_type         NOT NULL DEFAULT 'service',
    version                 VARCHAR(50),
    language                VARCHAR(10)         NOT NULL DEFAULT 'en',
    original_filename       VARCHAR(500),
    file_path               VARCHAR(1000),
    file_size_bytes         BIGINT,
    page_count              INTEGER,
    processing_status       processing_status   NOT NULL DEFAULT 'pending',
    processing_error        TEXT,
    processing_started_at   TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    file_hash               VARCHAR(64),
    created_by              UUID,
    created_at              TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT manuals_machine_fk
        FOREIGN KEY (machine_id) REFERENCES machines (id) ON DELETE RESTRICT,

    CONSTRAINT manuals_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,

    -- SHA-256 hex digest — prevents the same PDF from being indexed twice
    CONSTRAINT manuals_file_hash_unique UNIQUE (file_hash)
);

CREATE INDEX idx_manuals_machine_id         ON manuals (machine_id);
CREATE INDEX idx_manuals_processing_status  ON manuals (processing_status);
CREATE INDEX idx_manuals_machine_status     ON manuals (machine_id, processing_status);
CREATE INDEX idx_manuals_created_by         ON manuals (created_by);
```

**Purpose:** The manual is the atomic unit of knowledge ingestion. `processing_status` is the primary lifecycle state machine column — the ingestion worker reads and writes it. `file_hash` (SHA-256) prevents re-ingestion of duplicate PDFs even under different filenames. `ON DELETE RESTRICT` on `machine_id` prevents orphaning a manual when a machine is removed — the admin must reassign or delete manuals first.

---

## Table 4: `chunks`

Stores individual text segments produced during PDF ingestion. Each chunk carries its vector embedding and is the unit retrieved during RAG queries.

```sql
CREATE TABLE chunks (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    manual_id           UUID            NOT NULL,
    machine_id          UUID            NOT NULL,
    chunk_index         INTEGER         NOT NULL,
    chunk_type          chunk_type      NOT NULL,
    content             TEXT            NOT NULL,
    content_tokens      INTEGER,
    page_start          INTEGER,
    page_end            INTEGER,
    section_path        TEXT,
    error_codes_present TEXT[]          NOT NULL DEFAULT '{}',
    embedding           vector(768),
    embedding_model     VARCHAR(100),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chunks_manual_fk
        FOREIGN KEY (manual_id) REFERENCES manuals (id) ON DELETE CASCADE,

    CONSTRAINT chunks_machine_fk
        FOREIGN KEY (machine_id) REFERENCES machines (id) ON DELETE CASCADE,

    CONSTRAINT chunks_manual_index_unique
        UNIQUE (manual_id, chunk_index)
);

-- GIN index for fast containment queries: WHERE error_codes_present @> ARRAY['E101']
CREATE INDEX idx_chunks_error_codes
    ON chunks USING GIN (error_codes_present);

-- HNSW index for approximate nearest-neighbor vector search
-- ef_construction=128, m=16 are standard starting points; tune after load testing
CREATE INDEX idx_chunks_embedding_hnsw
    ON chunks USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 128);

-- IVFFlat alternative (comment out HNSW above if using this)
-- Requires ANALYZE after initial data load to set list centers
-- CREATE INDEX idx_chunks_embedding_ivfflat
--     ON chunks USING ivfflat (embedding vector_cosine_ops)
--     WITH (lists = 100);

-- Denormalized machine_id enables single-table lookups scoped to a machine
CREATE INDEX idx_chunks_machine_id ON chunks (machine_id);

-- Composite index for the common retrieval path: machine + chunk type
CREATE INDEX idx_chunks_machine_type ON chunks (machine_id, chunk_type);
```

**Purpose:** The core retrieval table. `machine_id` is denormalized (it can be derived via `manuals.machine_id`) to avoid a join on every vector search — at query time the retrieval path does `WHERE machine_id = $1 ORDER BY embedding <=> $2 LIMIT 20`, and adding a join to `manuals` would inhibit index usage on large tables. `error_codes_present` is a GIN-indexed array supporting BM25 pre-filtering by error code before the vector search runs. `section_path` is a human-readable breadcrumb (e.g., `"Chapter 3 > Error Codes > E101"`) used in citations.

---

## Table 5: `conversations`

Groups messages into a named conversation thread, optionally scoped to a machine. Supports multi-turn troubleshooting sessions.

```sql
CREATE TABLE conversations (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID,
    session_id  VARCHAR(255)    NOT NULL,
    machine_id  UUID,
    title       VARCHAR(500),
    is_active   BOOLEAN         NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT conversations_user_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,

    CONSTRAINT conversations_machine_fk
        FOREIGN KEY (machine_id) REFERENCES machines (id) ON DELETE SET NULL
);

CREATE INDEX idx_conversations_session_id  ON conversations (session_id);
CREATE INDEX idx_conversations_user_id     ON conversations (user_id);
CREATE INDEX idx_conversations_user_active ON conversations (user_id, is_active);
CREATE INDEX idx_conversations_updated_at  ON conversations (updated_at DESC);
```

**Purpose:** Provides conversation threading for multi-turn queries. `session_id` maps to a Redis key that stores ephemeral session context (conversation history window for the LLM prompt). `machine_id` records the machine context at the time the conversation was opened; it can change mid-conversation via the disambiguation flow. `title` is auto-generated from the first user message. `ON DELETE SET NULL` on `user_id` preserves conversation records for audit purposes even when a user account is deactivated.

---

## Table 6: `messages`

Individual turns within a conversation. Stores both user queries and LLM responses, along with performance telemetry and quality signals.

```sql
CREATE TABLE messages (
    id                      UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id         UUID                NOT NULL,
    role                    message_role        NOT NULL,
    content                 TEXT                NOT NULL,
    answer_type             answer_type,
    confidence_level        confidence_level,
    evidence_score          FLOAT,
    retrieval_latency_ms    INTEGER,
    llm_latency_ms          INTEGER,
    total_latency_ms        INTEGER,
    token_count_prompt      INTEGER,
    token_count_completion  INTEGER,
    created_at              TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT messages_conversation_fk
        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_conversation_id
    ON messages (conversation_id, created_at ASC);

CREATE INDEX idx_messages_created_at
    ON messages (created_at DESC);

-- Partial index to efficiently find all disambiguation responses
CREATE INDEX idx_messages_disambiguation
    ON messages (answer_type)
    WHERE answer_type = 'disambiguation_required';
```

**Purpose:** The primary record of system inputs and outputs. `answer_type` and `confidence_level` are only populated for `role = 'assistant'` messages. Latency columns (`retrieval_latency_ms`, `llm_latency_ms`, `total_latency_ms`) power the performance dashboard. `evidence_score` is the aggregated relevance signal from the reranker — values below a configured threshold trigger `answer_type = 'insufficient_information'`.

---

## Table 7: `citations`

Maps each assistant message to the specific chunks that were cited in the answer. Supports citation validation and phantom hallucination detection.

```sql
CREATE TABLE citations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID        NOT NULL,
    chunk_id        UUID,
    citation_index  INTEGER     NOT NULL,
    relevance_score FLOAT,
    is_phantom      BOOLEAN     NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT citations_message_fk
        FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE,

    CONSTRAINT citations_chunk_fk
        FOREIGN KEY (chunk_id) REFERENCES chunks (id) ON DELETE SET NULL
);

CREATE INDEX idx_citations_message_id ON citations (message_id);
CREATE INDEX idx_citations_chunk_id   ON citations (chunk_id);

-- Partial index for phantom citation auditing
CREATE INDEX idx_citations_phantom
    ON citations (message_id)
    WHERE is_phantom = true;
```

**Purpose:** Enables full citation traceability — each `[1]`, `[2]` reference in an answer maps to an exact chunk, which in turn maps to a page and section in a specific manual. `chunk_id` allows `ON DELETE SET NULL` (rather than cascade) so citation records survive even if a manual is later re-indexed and its chunks regenerated. `is_phantom = true` flags a citation number that the LLM included in its response but which does not correspond to any retrieved chunk — used for quality monitoring and model evaluation.

---

## Table 8: `ingestion_jobs`

Tracks background processing jobs for manual ingestion. One job per manual upload (or re-index request).

```sql
CREATE TABLE ingestion_jobs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    manual_id       UUID        NOT NULL,
    status          job_status  NOT NULL DEFAULT 'queued',
    progress_pct    INTEGER     NOT NULL DEFAULT 0
                                CHECK (progress_pct BETWEEN 0 AND 100),
    pages_processed INTEGER     NOT NULL DEFAULT 0,
    chunks_created  INTEGER     NOT NULL DEFAULT 0,
    error_message   TEXT,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ingestion_jobs_manual_fk
        FOREIGN KEY (manual_id) REFERENCES manuals (id) ON DELETE CASCADE
);

CREATE INDEX idx_ingestion_jobs_manual_id ON ingestion_jobs (manual_id);
CREATE INDEX idx_ingestion_jobs_status    ON ingestion_jobs (status);

-- The frontend polls for the latest job for a given manual
CREATE INDEX idx_ingestion_jobs_manual_latest
    ON ingestion_jobs (manual_id, created_at DESC);
```

**Purpose:** Decouples the HTTP upload response from the long-running ingestion pipeline. After a manual is uploaded, the API immediately returns a `job_id`. The frontend polls `GET /api/v1/manuals/{id}/status` which reads this table. `progress_pct` and `pages_processed` give real-time feedback to the admin UI's progress bar. A `cancelled` terminal state allows an admin to abort a stuck job.

---

## Table 9: `audit_logs`

Immutable record of security-relevant actions. Append-only — no updates or deletes are made to this table by the application.

```sql
CREATE TABLE audit_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID,
    action          VARCHAR(100) NOT NULL,
    resource_type   VARCHAR(50),
    resource_id     UUID,
    ip_address      INET,
    user_agent      TEXT,
    details         JSONB,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT audit_logs_user_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_user_id    ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_action     ON audit_logs (action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- Composite index for the most common admin query: user X's actions in a time range
CREATE INDEX idx_audit_logs_user_time
    ON audit_logs (user_id, created_at DESC);

-- GIN index for JSONB detail searches (e.g., filter by machine_id in details)
CREATE INDEX idx_audit_logs_details
    ON audit_logs USING GIN (details);
```

**Purpose:** Satisfies compliance and incident response requirements. Canonical `action` values use dot-notation: `user.login`, `user.logout`, `manual.upload`, `manual.delete`, `query.submit`, `machine.create`, `admin.user_deactivate`. `details` is an open JSONB column that stores action-specific context (e.g., for `manual.upload`: `{"filename": "haas_vf2_service.pdf", "machine_id": "..."}`) without requiring schema changes per action type. `ON DELETE SET NULL` on `user_id` ensures log records are never silently removed when a user is deactivated.

---

## Auto-Update Trigger for `updated_at`

Rather than relying on the application layer to set `updated_at`, a trigger maintains it automatically.

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with an updated_at column
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_machines_updated_at
    BEFORE UPDATE ON machines
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_manuals_updated_at
    BEFORE UPDATE ON manuals
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## Index Summary

| Table | Index | Type | Purpose |
|---|---|---|---|
| `users` | `idx_users_email_active` | B-tree (partial) | Login lookup for active users |
| `users` | `idx_users_role` | B-tree | Role-based list queries |
| `machines` | `idx_machines_manufacturer` | B-tree | Filter by manufacturer |
| `machines` | `idx_machines_category` | B-tree | Filter by category |
| `manuals` | `idx_manuals_machine_id` | B-tree | Manuals per machine |
| `manuals` | `idx_manuals_processing_status` | B-tree | Worker queue polling |
| `manuals` | `idx_manuals_machine_status` | B-tree | Filtered list view |
| `chunks` | `idx_chunks_error_codes` | GIN | BM25 pre-filter by error code array |
| `chunks` | `idx_chunks_embedding_hnsw` | HNSW | ANN vector similarity search |
| `chunks` | `idx_chunks_machine_id` | B-tree | Machine-scoped retrieval |
| `chunks` | `idx_chunks_machine_type` | B-tree | Machine + chunk type filter |
| `conversations` | `idx_conversations_session_id` | B-tree | Session lookup |
| `conversations` | `idx_conversations_user_active` | B-tree | Active conversations per user |
| `messages` | `idx_messages_conversation_id` | B-tree | Ordered message history |
| `citations` | `idx_citations_message_id` | B-tree | Citations per message |
| `citations` | `idx_citations_phantom` | B-tree (partial) | Phantom citation audit |
| `ingestion_jobs` | `idx_ingestion_jobs_manual_latest` | B-tree | Latest job for a manual |
| `audit_logs` | `idx_audit_logs_user_time` | B-tree | User activity time range |
| `audit_logs` | `idx_audit_logs_details` | GIN | JSONB detail field search |
