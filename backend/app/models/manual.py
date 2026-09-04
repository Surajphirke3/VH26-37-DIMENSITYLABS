
import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import BaseModel


class ManualType(str, enum.Enum):
    operator = "operator"
    service = "service"
    parts = "parts"
    installation = "installation"
    other = "other"


class ProcessingStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"
    reprocessing = "reprocessing"


class Manual(BaseModel):
    __tablename__ = "manuals"

    machine_id = Column(UUID(as_uuid=True), ForeignKey("machines.id", ondelete="RESTRICT"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    manual_type = Column(Enum(ManualType, name="manual_type_enum"), nullable=False, default=ManualType.service, server_default=ManualType.service.value)
    version = Column(String(50), nullable=True)
    language = Column(String(10), nullable=False, default="en", server_default="en")
    original_filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    file_size_bytes = Column(Integer, nullable=True)
    page_count = Column(Integer, nullable=True)
    processing_status = Column(Enum(ProcessingStatus, name="processing_status_enum"), nullable=False, default=ProcessingStatus.pending, server_default=ProcessingStatus.pending.value)
    processing_error = Column(String(2000), nullable=True)
    processing_started_at = Column(DateTime(timezone=True), nullable=True)
    processing_completed_at = Column(DateTime(timezone=True), nullable=True)
    file_hash = Column(String(64), unique=True, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    machine = relationship("Machine", back_populates="manuals")
    creator = relationship("User", back_populates="manuals", foreign_keys=[created_by])
    chunks = relationship("Chunk", back_populates="manual", cascade="all, delete-orphan")
    ingestion_jobs = relationship("IngestionJob", back_populates="manual", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Manual id={self.id} title={self.title!r} status={self.processing_status}>"
