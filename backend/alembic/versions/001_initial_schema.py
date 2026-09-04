"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-09-04 00:00:00.000000
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ------------------------------------------------------------------
    # Extensions
    # ------------------------------------------------------------------
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # ------------------------------------------------------------------
    # ENUM types
    # ------------------------------------------------------------------
    user_role = postgresql.ENUM(
        "admin", "manager", "technician",
        name="user_role_enum",
        create_type=False,
    )
    user_role.create(op.get_bind(), checkfirst=True)

    manual_type = postgresql.ENUM(
        "operator", "service", "parts", "installation", "other",
        name="manual_type_enum",
        create_type=False,
    )
    manual_type.create(op.get_bind(), checkfirst=True)

    processing_status = postgresql.ENUM(
        "pending", "processing", "completed", "failed", "reprocessing",
        name="processing_status_enum",
        create_type=False,
    )
    processing_status.create(op.get_bind(), checkfirst=True)

    chunk_type = postgresql.ENUM(
        "section", "error_code", "table", "warning", "overlap",
        name="chunk_type_enum",
        create_type=False,
    )
    chunk_type.create(op.get_bind(), checkfirst=True)

    message_role = postgresql.ENUM(
        "user", "assistant", "system",
        name="message_role_enum",
        create_type=False,
    )
    message_role.create(op.get_bind(), checkfirst=True)

    answer_type = postgresql.ENUM(
        "solution", "disambiguation_required", "insufficient_information",
        "clarification_needed", "error",
        name="answer_type_enum",
        create_type=False,
    )
    answer_type.create(op.get_bind(), checkfirst=True)

    confidence_level = postgresql.ENUM(
        "HIGH", "MEDIUM", "LOW",
        name="confidence_level_enum",
        create_type=False,
    )
    confidence_level.create(op.get_bind(), checkfirst=True)

    job_status = postgresql.ENUM(
        "queued", "running", "completed", "failed", "cancelled",
        name="job_status_enum",
        create_type=False,
    )
    job_status.create(op.get_bind(), checkfirst=True)

    # ------------------------------------------------------------------
    # Tables (dependency order)
    # ------------------------------------------------------------------

    # users
    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column(
            "role",
            user_role,
            nullable=False,
            server_default="technician",
        ),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # machines
    op.create_table(
        "machines",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("model", sa.String(255), nullable=True),
        sa.Column("manufacturer", sa.String(255), nullable=True),
        sa.Column("category", sa.String(255), nullable=True),
        sa.Column("description", sa.String(2000), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.UniqueConstraint("name", "model", "manufacturer", name="uq_machine_name_model_manufacturer"),
    )
    op.create_index("ix_machines_name", "machines", ["name"])

    # manuals
    op.create_table(
        "manuals",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "machine_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("machines.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column(
            "manual_type",
            manual_type,
            nullable=False,
            server_default="service",
        ),
        sa.Column("version", sa.String(50), nullable=True),
        sa.Column("language", sa.String(10), nullable=False, server_default="en"),
        sa.Column("original_filename", sa.String(500), nullable=False),
        sa.Column("file_path", sa.String(1000), nullable=False),
        sa.Column("file_size_bytes", sa.Integer, nullable=True),
        sa.Column("page_count", sa.Integer, nullable=True),
        sa.Column(
            "processing_status",
            processing_status,
            nullable=False,
            server_default="pending",
        ),
        sa.Column("processing_error", sa.String(2000), nullable=True),
        sa.Column("processing_started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("processing_completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("file_hash", sa.String(64), unique=True, nullable=True),
        sa.Column(
            "created_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index("ix_manuals_machine_id", "manuals", ["machine_id"])

    # chunks
    op.create_table(
        "chunks",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "manual_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("manuals.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "machine_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("machines.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("chunk_index", sa.Integer, nullable=False),
        sa.Column(
            "chunk_type",
            chunk_type,
            nullable=False,
            server_default="section",
        ),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("content_tokens", sa.Integer, nullable=True),
        sa.Column("page_start", sa.Integer, nullable=True),
        sa.Column("page_end", sa.Integer, nullable=True),
        sa.Column("section_path", sa.String(1000), nullable=True),
        sa.Column(
            "error_codes_present",
            postgresql.ARRAY(sa.String),
            nullable=False,
            server_default="{}",
        ),
        sa.Column("embedding_model", sa.String(100), nullable=True),
        # vector(768) — pgvector type created via raw SQL
    )
    # Add the vector column using raw DDL (pgvector type)
    op.execute("ALTER TABLE chunks ADD COLUMN embedding vector(768)")

    op.create_index("ix_chunks_machine_id", "chunks", ["machine_id"])
    op.create_index("ix_chunks_manual_id", "chunks", ["manual_id"])

    # HNSW index on chunk embeddings for ANN search
    op.execute(
        "CREATE INDEX ix_chunks_embedding_hnsw ON chunks "
        "USING hnsw (embedding vector_cosine_ops) "
        "WITH (m = 16, ef_construction = 64)"
    )

    # GIN index on error_codes_present array for fast array searches
    op.execute(
        "CREATE INDEX ix_chunks_error_codes_gin ON chunks "
        "USING gin (error_codes_present)"
    )

    # Full-text search tsvector index on chunk content
    op.execute(
        "CREATE INDEX ix_chunks_content_fts ON chunks "
        "USING gin (to_tsvector('english', content))"
    )

    # conversations
    op.create_table(
        "conversations",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("session_id", sa.String(255), nullable=False),
        sa.Column(
            "machine_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("machines.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("title", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
    )
    op.create_index("ix_conversations_session_id", "conversations", ["session_id"])

    # messages
    op.create_table(
        "messages",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "conversation_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("conversations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "role",
            message_role,
            nullable=False,
        ),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column(
            "answer_type",
            answer_type,
            nullable=True,
        ),
        sa.Column(
            "confidence_level",
            confidence_level,
            nullable=True,
        ),
        sa.Column("evidence_score", sa.Float, nullable=True),
        sa.Column("retrieval_latency_ms", sa.Integer, nullable=True),
        sa.Column("llm_latency_ms", sa.Integer, nullable=True),
        sa.Column("total_latency_ms", sa.Integer, nullable=True),
        sa.Column("token_count_prompt", sa.Integer, nullable=True),
        sa.Column("token_count_completion", sa.Integer, nullable=True),
    )
    op.create_index("ix_messages_conversation_id", "messages", ["conversation_id"])

    # citations
    op.create_table(
        "citations",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "message_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("messages.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "chunk_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("chunks.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("citation_index", sa.Integer, nullable=False),
        sa.Column("relevance_score", sa.Float, nullable=False),
        sa.Column("is_phantom", sa.Boolean, nullable=False, server_default="false"),
    )
    op.create_index("ix_citations_message_id", "citations", ["message_id"])

    # ingestion_jobs
    op.create_table(
        "ingestion_jobs",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "manual_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("manuals.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "status",
            job_status,
            nullable=False,
            server_default="queued",
        ),
        sa.Column("progress_pct", sa.Integer, nullable=False, server_default="0"),
        sa.Column("pages_processed", sa.Integer, nullable=True),
        sa.Column("chunks_created", sa.Integer, nullable=True),
        sa.Column("error_message", sa.String(2000), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_ingestion_jobs_manual_id", "ingestion_jobs", ["manual_id"])

    # audit_logs
    op.create_table(
        "audit_logs",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("action", sa.String(255), nullable=False),
        sa.Column("resource_type", sa.String(100), nullable=True),
        sa.Column(
            "resource_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
        sa.Column("detail", sa.Text, nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
    )
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_resource_type", "audit_logs", ["resource_type"])


def downgrade() -> None:
    # Drop tables in reverse dependency order
    op.drop_table("audit_logs")
    op.drop_table("ingestion_jobs")
    op.drop_table("citations")
    op.drop_table("messages")
    op.drop_table("conversations")
    op.drop_table("chunks")
    op.drop_table("manuals")
    op.drop_table("machines")
    op.drop_table("users")

    # Drop ENUM types
    for enum_name in (
        "job_status_enum",
        "confidence_level_enum",
        "answer_type_enum",
        "message_role_enum",
        "chunk_type_enum",
        "processing_status_enum",
        "manual_type_enum",
        "user_role_enum",
    ):
        op.execute(f"DROP TYPE IF EXISTS {enum_name}")

    op.execute('DROP EXTENSION IF EXISTS "uuid-ossp"')
    op.execute("DROP EXTENSION IF EXISTS vector")
