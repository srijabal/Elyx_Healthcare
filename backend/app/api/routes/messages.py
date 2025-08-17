from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import Message
from datetime import datetime

router = APIRouter()


@router.get("/")
async def list_messages(
    db: Session = Depends(get_db),
    member_id: Optional[str] = Query(None, description="Filter by member ID"),
    agent_id: Optional[str] = Query(None, description="Filter by agent ID"),
    message_type: Optional[str] = Query(None, description="Filter by message type"),
    month: Optional[int] = Query(None, description="Filter by month (1-8)"),
    limit: int = Query(100, description="Maximum number of messages to return")
):
    """List messages with optional filtering"""
    try:
        query = db.query(Message).order_by(Message.timestamp.desc())
        
        # Apply filters
        if member_id:
            query = query.filter(Message.member_id == member_id)
        
        if agent_id:
            query = query.filter(Message.agent_id == agent_id)
        
        if message_type:
            query = query.filter(Message.message_type == message_type)
        
        if month:
            # Filter by month using context_data
            query = query.filter(Message.context_data.op('->>')('month') == str(month))
        
        messages = query.limit(limit).all()
        
        return {
            "messages": [
                {
                    "id": str(msg.id),
                    "member_name": msg.member.name,
                    "agent_name": msg.agent.name,
                    "agent_role": msg.agent.role,
                    "content": msg.content,
                    "message_type": msg.message_type,
                    "timestamp": msg.timestamp,
                    "context": msg.context_data
                } for msg in messages
            ],
            "total_returned": len(messages),
            "filters_applied": {
                "member_id": member_id,
                "agent_id": agent_id,
                "message_type": message_type,
                "month": month
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/types")
async def get_message_types(db: Session = Depends(get_db)):
    """Get all unique message types in the system"""
    try:
        # Get distinct message types
        result = db.query(Message.message_type).distinct().all()
        message_types = [row[0] for row in result if row[0] is not None]
        
        # Get count for each type
        type_counts = {}
        for msg_type in message_types:
            count = db.query(Message).filter(Message.message_type == msg_type).count()
            type_counts[msg_type] = count
        
        return {
            "message_types": message_types,
            "type_counts": type_counts,
            "total_types": len(message_types)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
async def search_messages(
    query: str = Query(..., description="Search term"),
    db: Session = Depends(get_db),
    limit: int = Query(50, description="Maximum number of results")
):
    """Search messages by content"""
    try:
        # Search in message content
        messages = db.query(Message).filter(
            Message.content.ilike(f"%{query}%")
        ).order_by(Message.timestamp.desc()).limit(limit).all()
        
        return {
            "search_query": query,
            "results": [
                {
                    "id": str(msg.id),
                    "member_name": msg.member.name,
                    "agent_name": msg.agent.name,
                    "content": msg.content,
                    "message_type": msg.message_type,
                    "timestamp": msg.timestamp,
                    "context": msg.context_data
                } for msg in messages
            ],
            "total_results": len(messages)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics")
async def get_message_analytics(db: Session = Depends(get_db)):
    """Get analytics about messages in the system"""
    try:
        # Total message count
        total_messages = db.query(Message).count()
        
        # Messages per agent
        agent_stats = db.query(
            Message.agent_id,
            db.func.count(Message.id).label('message_count')
        ).group_by(Message.agent_id).all()
        
        agent_message_counts = {}
        for agent_id, count in agent_stats:
            agent = db.query(db.session.query(Message).filter(Message.agent_id == agent_id).first().agent).first()
            if agent:
                agent_message_counts[agent.name] = count
        
        # Messages per type
        type_stats = db.query(
            Message.message_type,
            db.func.count(Message.id).label('count')
        ).group_by(Message.message_type).all()
        
        type_counts = {msg_type or "general": count for msg_type, count in type_stats}
        
        # Messages per month (from context_data)
        monthly_stats = {}
        messages_with_context = db.query(Message).filter(Message.context_data.isnot(None)).all()
        
        for msg in messages_with_context:
            month = msg.context_data.get("month", 1) if msg.context_data else 1
            monthly_stats[month] = monthly_stats.get(month, 0) + 1
        
        return {
            "total_messages": total_messages,
            "agent_activity": agent_message_counts,
            "message_types": type_counts,
            "monthly_distribution": monthly_stats,
            "average_messages_per_month": total_messages / 8 if total_messages > 0 else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))