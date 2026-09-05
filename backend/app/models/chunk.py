
import enum

from pgvector.sqlalchemy import Vector
from sqlalchemy import ARRAY, Column, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import BaseModel


class ChunkType(str, enum.Enum):
    section = "section"
    error_code = "error_code"
    table = "table"
    warning = "warning"
    overlap = "overlap"
    procedure_list = "procedure_list"


class Chunk(BaseModel):
    __tablename__ = "chunks"

    __table_args__ = (
        Index("ix_chunks_machine_id", "machine_id"),
        Index("ix_chunks_manual_id", "manual_id"),
    )

    manual_id = Column(
        UUID(as_uuid=True),
        ForeignKey("manuals.id", ondelete="CASCADE"),
        nullable=False,
    )
    machine_id = Column(
        UUID(as_uuid=True),
        ForeignKey("machines.id", ondelete="CASCADE"),
        nullable=False,
    )
    chunk_index = Column(Integer, nullable=False)
    chunk_type = Column(
        Enum(ChunkType, name="chunk_type_enum"),
        nullable=False,
        default=ChunkType.section,
        server_default=ChunkType.section.value,
    )
    content = Column(Text, nullable=False)
    content_tokens = Column(Integer, nullable=True)
    page_start = Column(Integer, nullable=True)
    page_end = Column(Integer, nullable=True)
    section_path = Column(String(1000), nullable=True)
    error_codes_present = Column(ARRAY(String), nullable=False, default=list, server_default="{}")
    embedding_model = Column(String(100), nullable=True)
    embedding = Column(Vector(768), nullable=True)

    manual = relationship("Manual", back_populates="chunks")
    machine = relationship("Machine", back_populates="chunks")
    citations = relationship("Citation", back_populates="chunk")

    def __repr__(self) -> str:
        return f"<Chunk id={self.id} manual_id={self.manual_id} index={self.chunk_index}>"
