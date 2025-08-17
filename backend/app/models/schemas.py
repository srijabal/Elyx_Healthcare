from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from uuid import UUID


class MemberBase(BaseModel):
    name: str
    age: int
    occupation: str
    location: str
    health_goals: Optional[List[str]] = None


class Member(MemberBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class AgentBase(BaseModel):
    name: str
    role: str
    specialty: Optional[str] = None
    persona_prompt: Optional[str] = None


class Agent(AgentBase):
    id: UUID
    
    class Config:
        from_attributes = True


class MessageBase(BaseModel):
    content: str
    message_type: Optional[str] = None
    context_data: Optional[Dict[str, Any]] = None


class Message(MessageBase):
    id: UUID
    member_id: UUID
    agent_id: UUID
    timestamp: datetime
    
    class Config:
        from_attributes = True


class MessageWithDetails(Message):
    member_name: str
    agent_name: str
    agent_role: str


class HealthEventBase(BaseModel):
    event_type: str
    event_date: date
    description: Optional[str] = None
    results: Optional[Dict[str, Any]] = None
    related_agents: Optional[List[UUID]] = None


class HealthEvent(HealthEventBase):
    id: UUID
    member_id: UUID
    
    class Config:
        from_attributes = True


class JourneyStateBase(BaseModel):
    month: int
    biomarkers: Optional[Dict[str, Any]] = None
    current_interventions: Optional[Dict[str, Any]] = None
    progress_metrics: Optional[Dict[str, Any]] = None


class JourneyState(JourneyStateBase):
    id: UUID
    member_id: UUID
    updated_at: datetime
    
    class Config:
        from_attributes = True


class JourneyTimeline(BaseModel):
    member_id: UUID
    timeline: List[Dict[str, Any]]
    health_events: List[Dict[str, Any]]
    biomarker_progression: List[Dict[str, Any]]


class JourneyGeneration(BaseModel):
    member_profile: Dict[str, Any]
    biomarker_progression: Dict[int, Dict[str, Any]]
    health_events: List[Dict[str, Any]]
    messages: List[Dict[str, Any]]
    total_messages: int
    journey_summary: Dict[str, Any]


class AgentStats(BaseModel):
    agent: Dict[str, Any]
    statistics: Dict[str, Any]


class MessageAnalytics(BaseModel):
    total_messages: int
    agent_activity: Dict[str, int]
    message_types: Dict[str, int]
    monthly_distribution: Dict[int, int]
    average_messages_per_month: float