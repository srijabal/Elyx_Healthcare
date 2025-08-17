from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import Agent, Message
from app.agents.personas import AGENT_PERSONAS

router = APIRouter()


@router.get("/")
async def list_agents(db: Session = Depends(get_db)):
    """List all agents in the system"""
    try:
        agents = db.query(Agent).all()
        return [
            {
                "id": str(agent.id),
                "name": agent.name,
                "role": agent.role,
                "specialty": agent.specialty
            } for agent in agents
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/personas")
async def get_agent_personas():
    """Get all agent personas and their configurations"""
    return {
        "agents": [
            {
                "name": name,
                "role": config["role"],
                "specialty": config["specialty"],
                "description": f"{name} - {config['role']} specializing in {config['specialty']}"
            } for name, config in AGENT_PERSONAS.items()
        ],
        "total_agents": len(AGENT_PERSONAS)
    }


@router.get("/{agent_id}/messages")
async def get_agent_messages(agent_id: str, db: Session = Depends(get_db)):
    """Get all messages from a specific agent"""
    try:
        # Check if agent exists
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Get messages
        messages = db.query(Message).filter(Message.agent_id == agent_id).order_by(Message.timestamp).all()
        
        return {
            "agent": {
                "id": str(agent.id),
                "name": agent.name,
                "role": agent.role
            },
            "messages": [
                {
                    "id": str(msg.id),
                    "content": msg.content,
                    "message_type": msg.message_type,
                    "timestamp": msg.timestamp,
                    "member_name": msg.member.name,
                    "context": msg.context_data
                } for msg in messages
            ],
            "total_messages": len(messages)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{agent_id}/stats")
async def get_agent_stats(agent_id: str, db: Session = Depends(get_db)):
    """Get statistics for a specific agent"""
    try:
        # Check if agent exists
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Get messages
        messages = db.query(Message).filter(Message.agent_id == agent_id).all()
        
        # Calculate stats
        message_types = {}
        monthly_activity = {}
        
        for msg in messages:
            # Message type distribution
            msg_type = msg.message_type or "general"
            message_types[msg_type] = message_types.get(msg_type, 0) + 1
            
            # Monthly activity
            month = msg.context_data.get("month", 1) if msg.context_data else 1
            monthly_activity[month] = monthly_activity.get(month, 0) + 1
        
        return {
            "agent": {
                "id": str(agent.id),
                "name": agent.name,
                "role": agent.role
            },
            "statistics": {
                "total_messages": len(messages),
                "message_types": message_types,
                "monthly_activity": monthly_activity,
                "average_messages_per_month": len(messages) / 8 if len(messages) > 0 else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))