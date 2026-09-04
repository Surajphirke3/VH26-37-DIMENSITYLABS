
import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import BaseModel


class JobStatus(str, enum.Enum):
    queued = "queued"
    running = "running"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class IngestionJob(BaseModel):
    __tablename__ = "ingestion_jobs"

    manual_id = Column(
        UUID(as_uuid=True),
        ForeignKey("manuals.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status = Column(
        Enum(JobStatus, name="job_status_enum"),
        nullable=False,
        default=JobStatus.queued,
        server_default=JobStatus.queued.value,
    )
    progress_pct = Column(Integer, nullable=False, default=0, server_default="0")
    pages_processed = Column(Integer, nullable=True)
    chunks_created = Column(Integer, nullable=True)
    error_message = Column(String(2000), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    manual = relationship("Manual", back_populates="ingestion_jobs")

    def __repr__(self) -> str:
        return f"<IngestionJob id={self.id} manual_id={self.manual_id} status={self.status}>"
