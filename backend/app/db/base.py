import uuid

from sqlalchemy import Column, DateTime, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, declared_attr


class Base(DeclarativeBase):
    __allow_unmapped__ = True


class UUIDMixin:
    @declared_attr
    def id(cls):  # no return type annotation — avoids SA2 scan issue
        return Column(
            UUID(as_uuid=True),
            primary_key=True,
            default=uuid.uuid4,
            server_default=text("gen_random_uuid()"),
            nullable=False,
        )


class TimestampMixin:
    @declared_attr
    def created_at(cls):
        return Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False,
        )

    @declared_attr
    def updated_at(cls):
        return Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        )


class BaseModel(UUIDMixin, TimestampMixin, Base):
    __abstract__ = True
    __allow_unmapped__ = True
