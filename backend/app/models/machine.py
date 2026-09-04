
from sqlalchemy import Boolean, Column, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base import BaseModel


class Machine(BaseModel):
    __tablename__ = "machines"

    __table_args__ = (
        UniqueConstraint("name", "model", "manufacturer", name="uq_machine_name_model_manufacturer"),
    )

    name = Column(String(255), nullable=False, index=True)
    model = Column(String(255), nullable=True)
    manufacturer = Column(String(255), nullable=True)
    category = Column(String(255), nullable=True)
    description = Column(String(2000), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")

    manuals = relationship("Manual", back_populates="machine", cascade="all, delete-orphan")
    chunks = relationship("Chunk", back_populates="machine", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="machine")

    def __repr__(self) -> str:
        return f"<Machine id={self.id} name={self.name!r} model={self.model!r}>"
