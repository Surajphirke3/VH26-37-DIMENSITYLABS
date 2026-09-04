
from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import BaseModel


class Citation(BaseModel):
    __tablename__ = "citations"

    message_id = Column(
        UUID(as_uuid=True),
        ForeignKey("messages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chunk_id = Column(
        UUID(as_uuid=True),
        ForeignKey("chunks.id", ondelete="SET NULL"),
        nullable=True,
    )
    citation_index = Column(Integer, nullable=False)
    relevance_score = Column(Float, nullable=False)
    is_phantom = Column(Boolean, nullable=False, default=False, server_default="false")

    message = relationship("Message", back_populates="citations")
    chunk = relationship("Chunk", back_populates="citations")

    def __repr__(self) -> str:
        return f"<Citation id={self.id} message_id={self.message_id} index={self.citation_index}>"
