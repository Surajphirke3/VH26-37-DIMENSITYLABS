
import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, String
from sqlalchemy.orm import relationship

from app.db.base import BaseModel


class UserRole(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    technician = "technician"


class User(BaseModel):
    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(
        Enum(UserRole, name="user_role_enum"),
        nullable=False,
        default=UserRole.technician,
        server_default=UserRole.technician.value,
    )
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")
    last_login = Column(DateTime(timezone=True), nullable=True)

    manuals = relationship("Manual", back_populates="creator", foreign_keys="Manual.created_by")
    conversations = relationship("Conversation", back_populates="user")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role}>"
