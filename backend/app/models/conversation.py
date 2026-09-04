
import enum

from sqlalchemy import Boolean, Column, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import BaseModel


class MessageRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class AnswerType(str, enum.Enum):
    solution = "solution"
    disambiguation_required = "disambiguation_required"
    insufficient_information = "insufficient_information"
    clarification_needed = "clarification_needed"
    error = "error"


class ConfidenceLevel(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class Conversation(BaseModel):
    __tablename__ = "conversations"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    session_id = Column(String(255), nullable=False, index=True)
    machine_id = Column(UUID(as_uuid=True), ForeignKey("machines.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(500), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")

    user = relationship("User", back_populates="conversations")
    machine = relationship("Machine", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Conversation id={self.id} session_id={self.session_id!r}>"


class Message(BaseModel):
    __tablename__ = "messages"

    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(Enum(MessageRole, name="message_role_enum"), nullable=False)
    content = Column(Text, nullable=False)
    answer_type = Column(Enum(AnswerType, name="answer_type_enum"), nullable=True)
    confidence_level = Column(Enum(ConfidenceLevel, name="confidence_level_enum"), nullable=True)
    evidence_score = Column(Float, nullable=True)
    retrieval_latency_ms = Column(Integer, nullable=True)
    llm_latency_ms = Column(Integer, nullable=True)
    total_latency_ms = Column(Integer, nullable=True)
    token_count_prompt = Column(Integer, nullable=True)
    token_count_completion = Column(Integer, nullable=True)

    conversation = relationship("Conversation", back_populates="messages")
    citations = relationship("Citation", back_populates="message", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Message id={self.id} role={self.role} conv={self.conversation_id}>"
