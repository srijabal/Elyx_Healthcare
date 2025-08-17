#!/usr/bin/env python3
"""
Script to save realistic journey data to Supabase database
"""

import sys
import os
import json
from datetime import datetime, date
from uuid import uuid4

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from app.db.database import SessionLocal
from app.db.models import Member, Agent, Message, HealthEvent, JourneyState
from app.services.realistic_journey_generator import RealisticJourneyGenerator

def save_realistic_journey_to_db():
    """Generate realistic journey and save to database properly"""
    
    print("SAVING REALISTIC JOURNEY TO DATABASE")
    print("=" * 50)
    
    try:
        # Generate the journey
        print("1. Generating realistic journey data...")
        generator = RealisticJourneyGenerator()
        journey_data = generator.generate_realistic_complete_journey()
        
        # Get database session
        db = SessionLocal()
        
        print("2. Saving to database...")
        
        # 1. Create member record
        member_profile = journey_data["member_profile"]
        member = Member(
            name=member_profile["preferred_name"],
            age=member_profile["age"],
            occupation=member_profile["occupation"],
            location=member_profile["primary_residence"],
            health_goals=[goal["goal"] for goal in member_profile["top_health_goals"]]
        )
        db.add(member)
        db.flush()  # Get member ID
        print(f"   - Created member: {member.name} (ID: {member.id})")
        
        # 2. Get existing agents and create Member agent if needed
        agents = db.query(Agent).all()
        agent_lookup = {agent.name: agent for agent in agents}
        
        # Create Member agent for member-initiated messages
        member_agent = Agent(
            name="Member",
            role="Health Journey Member",
            specialty="Member Questions & Conversations",
            persona_prompt="I am the member on this health journey, asking questions and sharing updates."
        )
        db.add(member_agent)
        db.flush()
        agent_lookup["Member"] = member_agent
        agent_lookup["Rohan"] = member_agent  # Map Rohan to Member agent
        
        print(f"   - Found {len(agents)} agents in database + created Member agent")
        
        # 3. Create message records
        messages = journey_data.get("messages", [])
        message_count = 0
        
        for msg in messages:
            agent_name = msg.get("agent_name", "Neel")
            
            # All agents should now be in lookup (including Member for Rohan)
            if agent_name in agent_lookup:
                agent_id = agent_lookup[agent_name].id
            else:
                # Skip unknown agents
                print(f"   - Skipping unknown agent: {agent_name}")
                continue
                
            # Handle timestamp
            timestamp = msg.get("timestamp")
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            elif not isinstance(timestamp, datetime):
                timestamp = datetime.now()
            
            message = Message(
                member_id=member.id,
                agent_id=agent_id,
                content=msg.get("content", ""),
                message_type=msg.get("message_type", "general"),
                timestamp=timestamp,
                context_data={
                    "day": msg.get("day", 1),
                    "month": msg.get("month", 1),
                    "is_member_initiated": msg.get("is_member_initiated", False),
                    "sender": agent_name  # Track who sent the message
                }
            )
            db.add(message)
            message_count += 1
        
        print(f"   - Created {message_count} messages")
        
        # 4. Create health events (quarterly diagnostics)
        diagnostics = journey_data.get("quarterly_diagnostics", [])
        event_count = 0
        
        for diag in diagnostics:
            health_event = HealthEvent(
                member_id=member.id,
                event_type=diag.get("event_type", "quarterly_diagnostic"),
                event_date=date(2024, diag.get("month", 1), diag.get("day", 15)),
                description=diag.get("description", ""),
                results=diag.get("results", {})
            )
            db.add(health_event)
            event_count += 1
        
        print(f"   - Created {event_count} health events")
        
        # 5. Create journey states (monthly biomarkers)
        biomarker_progression = journey_data.get("biomarker_progression", {})
        state_count = 0
        
        for month, biomarkers in biomarker_progression.items():
            if isinstance(month, int):
                journey_state = JourneyState(
                    member_id=member.id,
                    month=month,
                    biomarkers=biomarkers,
                    current_interventions={},
                    progress_metrics={"adherence_rate": biomarkers.get("adherence_this_month", "50%")}
                )
                db.add(journey_state)
                state_count += 1
        
        print(f"   - Created {state_count} journey states")
        
        # Commit all changes
        db.commit()
        print("3. Database save completed successfully!")
        
        # Display summary
        summary = journey_data["journey_summary"]
        print("\nSUCCESS! Realistic journey saved to database")
        print("=" * 50)
        print(f"Member ID: {member.id}")
        print(f"Total Messages: {message_count}")
        print(f"Health Events: {event_count}")
        print(f"Journey States: {state_count}")
        print(f"Duration: {summary['duration_months']} months")
        
        # Show health transformation
        initial = journey_data["biomarker_progression"][1]
        final = journey_data["biomarker_progression"][8]
        print(f"\nHealth Transformation:")
        print(f"  Blood Pressure: {initial['blood_pressure']} -> {final['blood_pressure']}")
        print(f"  Weight: {initial['weight']} -> {final['weight']}")
        print(f"  Stress: {initial['stress_level']} -> {final['stress_level']}")
        
        print(f"\nAPI Endpoints Ready:")
        print(f"  - GET /api/v1/journey/members/{member.id}")
        print(f"  - GET /api/v1/journey/members/{member.id}/timeline")
        
        db.close()
        return str(member.id)
        
    except Exception as e:
        print(f"\nERROR: Failed to save to database")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        if 'db' in locals():
            db.rollback()
            db.close()
        return None

if __name__ == "__main__":
    member_id = save_realistic_journey_to_db()
    if member_id:
        print(f"\nSUCCESS: Journey saved with Member ID: {member_id}")
        print("Ready to demonstrate to judges!")
    else:
        print("\nFAILED: Could not save to database")