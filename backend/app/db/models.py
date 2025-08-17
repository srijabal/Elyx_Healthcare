from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, JSON, Date
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()


class Member(Base):
    __tablename__ = "members"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=False)
    occupation = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    health_goals = Column(ARRAY(Text), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    messages = relationship("Message", back_populates="member")
    health_events = relationship("HealthEvent", back_populates="member")
    journey_states = relationship("JourneyState", back_populates="member")


class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    specialty = Column(String(255), nullable=True)
    persona_prompt = Column(Text, nullable=True)
    
    # Relationships
    messages = relationship("Message", back_populates="agent")


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)
    content = Column(Text, nullable=False)
    message_type = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    context_data = Column(JSON, nullable=True)
    
    # Relationships
    member = relationship("Member", back_populates="messages")
    agent = relationship("Agent", back_populates="messages")


class HealthEvent(Base):
    __tablename__ = "health_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False)
    event_type = Column(String(255), nullable=False)
    event_date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    results = Column(JSON, nullable=True)
    related_agents = Column(ARRAY(UUID), nullable=True)
    
    # Relationships
    member = relationship("Member", back_populates="health_events")


class JourneyState(Base):
    __tablename__ = "journey_state"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False)
    month = Column(Integer, nullable=False)
    biomarkers = Column(JSON, nullable=True)
    current_interventions = Column(JSON, nullable=True)
    progress_metrics = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    member = relationship("Member", back_populates="journey_states")