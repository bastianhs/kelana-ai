from typing import List
from models.conversation import Conversation, Message
from database import SessionLocal


def create_conversation(user_id: int, title: str = "New Conversation") -> Conversation:
    """Create a new conversation for the given user."""
    db = SessionLocal()
    try:
        conversation = Conversation(user_id=user_id, title=title)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation
    finally:
        db.close()


def list_conversations(user_id: int) -> List[Conversation]:
    """Return all conversations belonging to the user, newest first."""
    db = SessionLocal()
    try:
        return (
            db.query(Conversation)
            .filter(Conversation.user_id == user_id)
            .order_by(Conversation.created_at.desc())
            .all()
        )
    finally:
        db.close()


def update_conversation(conversation_id: int, title: str) -> Conversation:
    """Update the title of a conversation."""
    db = SessionLocal()
    try:
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conversation is None:
            raise ValueError(f"Conversation {conversation_id} not found")
        conversation.title = title
        db.commit()
        db.refresh(conversation)
        return conversation
    finally:
        db.close()


def create_message(conversation_id: int, role: str, content: str) -> Message:
    """Persist a single message to a conversation."""
    db = SessionLocal()
    try:
        message = Message(conversation_id=conversation_id, role=role, content=content)
        db.add(message)
        db.commit()
        db.refresh(message)
        return message
    finally:
        db.close()


def list_messages(conversation_id: int) -> List[Message]:
    """Return all messages for a conversation in chronological order."""
    db = SessionLocal()
    try:
        return (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .all()
        )
    finally:
        db.close()
