from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.database import get_db
from app.db.models import Member, Message, HealthEvent, JourneyState
from app.services.journey_generator import HealthJourneyGenerator
from app.services.realistic_journey_generator import RealisticJourneyGenerator

router = APIRouter()


@router.post("/generate")
async def generate_journey(db: Session = Depends(get_db)):
    """Generate a complete 8-month health journey for Rohan Patel"""
    try:
        generator = HealthJourneyGenerator()
        journey_data = generator.generate_complete_journey()
        
        # Save to database
        member_id = generator.save_journey_to_database(journey_data)
        
        return {
            "message": "Journey generated successfully",
            "member_id": member_id,
            "summary": journey_data["journey_summary"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-realistic")
async def generate_realistic_journey(db: Session = Depends(get_db)):
    """Generate a realistic 8-month health journey with all constraints"""
    try:
        generator = RealisticJourneyGenerator()
        journey_data = generator.generate_realistic_complete_journey()
        
        # Save to database (reuse the save method)
        basic_generator = HealthJourneyGenerator()
        member_id = basic_generator.save_journey_to_database(journey_data)
        
        return {
            "message": "Realistic journey generated successfully",
            "member_id": member_id,
            "summary": journey_data["journey_summary"],
            "realism_features": {
                "member_initiated_conversations": len(journey_data["member_conversations"]),
                "plan_adjustments": len(journey_data["plan_adherence_events"]),
                "exercise_updates": len(journey_data["exercise_progressions"]),
                "quarterly_diagnostics": len(journey_data["quarterly_diagnostics"]),
                "chronic_condition": journey_data["member_profile"]["chronic_condition"],
                "average_adherence": f"{journey_data['journey_summary']['average_adherence_rate']*100}%"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/members/{member_id}")
async def get_member_journey(member_id: str, db: Session = Depends(get_db)):
    """Get complete journey data for a member"""
    try:
        # Get member
        member = db.query(Member).filter(Member.id == member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        # Get messages
        messages = db.query(Message).filter(Message.member_id == member_id).order_by(Message.timestamp).all()
        
        # Get health events
        health_events = db.query(HealthEvent).filter(HealthEvent.member_id == member_id).order_by(HealthEvent.event_date).all()
        
        # Get journey states
        journey_states = db.query(JourneyState).filter(JourneyState.member_id == member_id).order_by(JourneyState.month).all()
        
        return {
            "member": {
                "id": str(member.id),
                "name": member.name,
                "age": member.age,
                "occupation": member.occupation,
                "location": member.location,
                "health_goals": member.health_goals
            },
            "messages": [
                {
                    "id": str(msg.id),
                    "agent_name": msg.agent.name,
                    "agent_role": msg.agent.role,
                    "content": msg.content,
                    "message_type": msg.message_type,
                    "timestamp": msg.timestamp,
                    "context_data": msg.context_data
                } for msg in messages
            ],
            "health_events": [
                {
                    "id": str(event.id),
                    "event_type": event.event_type,
                    "event_date": event.event_date,
                    "description": event.description,
                    "results": event.results
                } for event in health_events
            ],
            "journey_states": [
                {
                    "month": state.month,
                    "biomarkers": state.biomarkers,
                    "interventions": state.current_interventions,
                    "metrics": state.progress_metrics
                } for state in journey_states
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/members/{member_id}/timeline")
async def get_journey_timeline(member_id: str, db: Session = Depends(get_db)):
    """Get timeline view of member's journey"""
    try:
        # Get member
        member = db.query(Member).filter(Member.id == member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        # Get messages grouped by month
        messages = db.query(Message).filter(Message.member_id == member_id).order_by(Message.timestamp).all()
        
        # Group messages by month
        timeline = {}
        for message in messages:
            month = message.context_data.get("month", 1) if message.context_data else 1
            
            if month not in timeline:
                timeline[month] = {
                    "month": month,
                    "messages": [],
                    "agent_activity": {},
                    "message_types": {}
                }
            
            timeline[month]["messages"].append({
                "agent_name": message.agent.name,
                "content": message.content,
                "message_type": message.message_type,
                "timestamp": message.timestamp,
                "day": message.context_data.get("day", 1) if message.context_data else 1
            })
            
            # Track agent activity
            agent_name = message.agent.name
            timeline[month]["agent_activity"][agent_name] = timeline[month]["agent_activity"].get(agent_name, 0) + 1
            
            # Track message types
            msg_type = message.message_type or "general"
            timeline[month]["message_types"][msg_type] = timeline[month]["message_types"].get(msg_type, 0) + 1
        
        # Get health events
        health_events = db.query(HealthEvent).filter(HealthEvent.member_id == member_id).all()
        
        # Get journey states (biomarker progression)
        journey_states = db.query(JourneyState).filter(JourneyState.member_id == member_id).order_by(JourneyState.month).all()
        
        return {
            "member_id": member_id,
            "timeline": list(timeline.values()),
            "health_events": [
                {
                    "month": event.event_date.month,
                    "day": event.event_date.day,
                    "event_type": event.event_type,
                    "description": event.description,
                    "results": event.results
                } for event in health_events
            ],
            "biomarker_progression": [
                {
                    "month": state.month,
                    "biomarkers": state.biomarkers
                } for state in journey_states
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/members")
async def list_members(db: Session = Depends(get_db)):
    """List all members in the system"""
    try:
        members = db.query(Member).all()
        return [
            {
                "id": str(member.id),
                "name": member.name,
                "age": member.age,
                "occupation": member.occupation,
                "location": member.location,
                "created_at": member.created_at
            } for member in members
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))