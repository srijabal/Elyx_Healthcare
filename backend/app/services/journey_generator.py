from typing import Dict, Any, List
from datetime import datetime, date, timedelta
import random
import json
from app.agents.langgraph_orchestrator import LangGraphOrchestrator, HealthJourneyState
from app.db.models import Member, Agent, Message, HealthEvent, JourneyState
from app.db.database import SessionLocal


class HealthJourneyGenerator:
    def __init__(self):
        self.orchestrator = LangGraphOrchestrator()
        self.db = SessionLocal()
    
    def generate_rohan_profile(self) -> Dict[str, Any]:
        """Generate Rohan Patel's member profile per official requirements"""
        return {
            "name": "Rohan Patel",
            "age": 46,
            "occupation": "Regional Head of Sales",
            "location": "Singapore",
            "health_goals": [
                "Improve cardiovascular health",
                "Build lean muscle mass",
                "Reduce work stress",
                "Optimize sleep quality",
                "Increase energy levels"
            ],
            "constraints": [
                "Limited cooking time due to work demands",
                "Irregular meal timing with client meetings",
                "Sedentary desk job with long hours",
                "Frequent business travel disrupts routine",
                "High-pressure sales targets cause stress"
            ],
            "initial_biomarkers": {
                "weight": "75kg",
                "body_fat": "18%",
                "blood_pressure": "128/82",
                "resting_heart_rate": "72 bpm",
                "sleep_average": "6.5 hours",
                "stress_level": "7/10",
                "cholesterol_total": "220 mg/dL",
                "hdl_cholesterol": "42 mg/dL",
                "ldl_cholesterol": "145 mg/dL",
                "triglycerides": "165 mg/dL",
                "glucose_fasting": "98 mg/dL",
                "hba1c": "5.4%"
            },
            "travel_schedule": [
                {"month": 1, "destination": "Bangalore", "days": 3},
                {"month": 2, "destination": "Mumbai", "days": 4},
                {"month": 3, "destination": "Bangkok", "days": 2},
                {"month": 4, "destination": "Jakarta", "days": 3},
                {"month": 5, "destination": "Manila", "days": 2},
                {"month": 6, "destination": "Kuala Lumpur", "days": 3},
                {"month": 7, "destination": "Ho Chi Minh", "days": 4},
                {"month": 8, "destination": "Bangalore", "days": 2}
            ]
        }
    
    def generate_biomarker_progression(self) -> Dict[int, Dict[str, Any]]:
        """Generate realistic biomarker improvements over 8 months"""
        return {
            1: {
                "weight": "75kg", "body_fat": "18%", "blood_pressure": "128/82",
                "resting_heart_rate": "72 bpm", "sleep_average": "6.5 hours", "stress_level": "7/10",
                "cholesterol_total": "220 mg/dL", "hdl_cholesterol": "42 mg/dL"
            },
            2: {
                "weight": "74.2kg", "body_fat": "17.3%", "blood_pressure": "125/80", 
                "resting_heart_rate": "70 bpm", "sleep_average": "7 hours", "stress_level": "6/10",
                "cholesterol_total": "210 mg/dL", "hdl_cholesterol": "45 mg/dL"
            },
            3: {  # First diagnostic
                "weight": "73.8kg", "body_fat": "16.8%", "blood_pressure": "122/78",
                "resting_heart_rate": "68 bpm", "sleep_average": "7.2 hours", "stress_level": "6/10",
                "cholesterol_total": "200 mg/dL", "hdl_cholesterol": "48 mg/dL",
                "glucose_fasting": "92 mg/dL", "hba1c": "5.2%"
            },
            4: {
                "weight": "73.5kg", "body_fat": "16.2%", "blood_pressure": "120/76",
                "resting_heart_rate": "66 bpm", "sleep_average": "7.3 hours", "stress_level": "5/10",
                "cholesterol_total": "195 mg/dL", "hdl_cholesterol": "50 mg/dL"
            },
            5: {
                "weight": "73kg", "body_fat": "15.8%", "blood_pressure": "118/74",
                "resting_heart_rate": "65 bpm", "sleep_average": "7.5 hours", "stress_level": "5/10",
                "cholesterol_total": "188 mg/dL", "hdl_cholesterol": "52 mg/dL"
            },
            6: {  # Second diagnostic
                "weight": "72.8kg", "body_fat": "15.5%", "blood_pressure": "117/73",
                "resting_heart_rate": "64 bpm", "sleep_average": "7.6 hours", "stress_level": "4/10",
                "cholesterol_total": "180 mg/dL", "hdl_cholesterol": "55 mg/dL",
                "glucose_fasting": "88 mg/dL", "hba1c": "5.0%"
            },
            7: {
                "weight": "72.5kg", "body_fat": "15.2%", "blood_pressure": "115/72",
                "resting_heart_rate": "63 bpm", "sleep_average": "7.8 hours", "stress_level": "4/10",
                "cholesterol_total": "175 mg/dL", "hdl_cholesterol": "58 mg/dL"
            },
            8: {
                "weight": "72kg", "body_fat": "14.8%", "blood_pressure": "114/71",
                "resting_heart_rate": "62 bpm", "sleep_average": "8 hours", "stress_level": "3/10",
                "cholesterol_total": "170 mg/dL", "hdl_cholesterol": "60 mg/dL"
            }
        }
    
    def generate_health_events(self) -> List[Dict[str, Any]]:
        """Generate key health events including quarterly diagnostics"""
        events = []
        
        # Month 3 - First Quarterly Diagnostic
        events.append({
            "month": 3,
            "day": 15,
            "event_type": "quarterly_diagnostic",
            "description": "Comprehensive health assessment - 3 month review",
            "results": {
                "blood_panel": "Improved lipid profile, reduced inflammation markers",
                "body_composition": "2kg weight loss, 1.2% body fat reduction",
                "cardiovascular": "Improved resting heart rate and blood pressure",
                "metabolic": "Better glucose regulation and insulin sensitivity"
            },
            "related_agents": ["Dr. Warren", "Advik", "Neel"]
        })
        
        # Month 6 - Second Quarterly Diagnostic  
        events.append({
            "month": 6,
            "day": 15,
            "event_type": "quarterly_diagnostic",
            "description": "Mid-journey comprehensive assessment",
            "results": {
                "blood_panel": "Cholesterol now in optimal range, excellent inflammatory markers",
                "body_composition": "Lean muscle gain evident, body fat at target levels",
                "cardiovascular": "Significant improvement in all cardiac risk factors",
                "metabolic": "HbA1c and glucose levels excellent",
                "sleep_study": "Sleep quality dramatically improved"
            },
            "related_agents": ["Dr. Warren", "Advik", "Rachel", "Neel"]
        })
        
        # Additional milestone events
        events.append({
            "month": 2,
            "day": 20,
            "event_type": "milestone",
            "description": "First major fitness milestone achieved",
            "results": {"achievement": "Completed first 5K run in under 30 minutes"},
            "related_agents": ["Carla", "Neel"]
        })
        
        events.append({
            "month": 4,
            "day": 10,
            "event_type": "challenge",
            "description": "Business travel stress management",
            "results": {"intervention": "Implemented travel wellness protocol"},
            "related_agents": ["Rachel", "Ruby", "Neel"]
        })
        
        events.append({
            "month": 7,
            "day": 5,
            "event_type": "milestone",
            "description": "Body composition goal achieved",
            "results": {"achievement": "Reached target body fat percentage of 15%"},
            "related_agents": ["Carla", "Ruby", "Advik"]
        })
        
        return events
    
    def generate_complete_journey(self) -> Dict[str, Any]:
        """Generate the complete 8-month health journey for Rohan"""
        
        # Initialize member profile and biomarker progression
        member_profile = self.generate_rohan_profile()
        biomarker_progression = self.generate_biomarker_progression()
        health_events = self.generate_health_events()
        
        # Initialize journey state
        initial_state: HealthJourneyState = {
            "member_profile": member_profile,
            "current_month": 1,
            "current_day": 1,
            "journey_state": {
                "biomarkers": biomarker_progression[1],
                "current_interventions": [],
                "progress_metrics": {}
            },
            "messages": [],
            "agents": self.orchestrator.agents,
            "context": {}
        }
        
        # Generate messages for 8 months (240 days)
        all_messages = []
        current_state = initial_state.copy()
        
        for month in range(1, 9):
            current_state["current_month"] = month
            current_state["journey_state"]["biomarkers"] = biomarker_progression[month]
            
            # Generate approximately 30 days per month
            days_in_month = 30
            for day in range(1, days_in_month + 1):
                current_day = (month - 1) * 30 + day
                current_state["current_day"] = current_day
                
                # Check for special events
                day_events = [e for e in health_events if e["month"] == month and e["day"] == day]
                if day_events:
                    current_state["context"]["events"] = day_events
                
                # Generate 1-3 messages per day
                messages_today = random.randint(1, 3)
                for _ in range(messages_today):
                    try:
                        new_messages = self.orchestrator.generate_day_messages(current_state)
                        all_messages.extend(new_messages)
                        current_state["messages"].extend(new_messages)
                    except Exception as e:
                        # If orchestrator fails, create a simple message
                        fallback_message = {
                            "agent_name": "Neel",
                            "agent_role": "Relationship Manager",
                            "content": f"Checking in on your progress - Month {month}, Day {day}",
                            "message_type": "daily_check",
                            "timestamp": datetime.now(),
                            "day": current_day,
                            "month": month
                        }
                        all_messages.append(fallback_message)
                        current_state["messages"].append(fallback_message)
        
        return {
            "member_profile": member_profile,
            "biomarker_progression": biomarker_progression,
            "health_events": health_events,
            "messages": all_messages,
            "total_messages": len(all_messages),
            "journey_summary": {
                "duration_months": 8,
                "total_days": 240,
                "major_milestones": len([e for e in health_events if e["event_type"] in ["milestone", "quarterly_diagnostic"]]),
                "agent_interactions": len(set([m["agent_name"] for m in all_messages]))
            }
        }
    
    def save_journey_to_database(self, journey_data: Dict[str, Any]) -> str:
        """Save the generated journey to the database"""
        try:
            # Create member record
            member = Member(
                name=journey_data["member_profile"]["name"],
                age=journey_data["member_profile"]["age"],
                occupation=journey_data["member_profile"]["occupation"],
                location=journey_data["member_profile"]["location"],
                health_goals=journey_data["member_profile"]["health_goals"]
            )
            self.db.add(member)
            self.db.flush()  # Get member ID
            
            # Create agent records
            agent_ids = {}
            for agent_name, agent_config in self.orchestrator.agents.items():
                agent = Agent(
                    name=agent_name,
                    role=agent_config.role,
                    specialty="",
                    persona_prompt=agent_config.persona_prompt
                )
                self.db.add(agent)
                self.db.flush()
                agent_ids[agent_name] = agent.id
            
            # Create message records
            for msg in journey_data["messages"]:
                message = Message(
                    member_id=member.id,
                    agent_id=agent_ids[msg["agent_name"]],
                    content=msg["content"],
                    message_type=msg["message_type"],
                    timestamp=msg["timestamp"],
                    context_data={
                        "day": msg["day"],
                        "month": msg["month"],
                        "agent_role": msg["agent_role"]
                    }
                )
                self.db.add(message)
            
            # Create health event records
            for event in journey_data["health_events"]:
                health_event = HealthEvent(
                    member_id=member.id,
                    event_type=event["event_type"],
                    event_date=date(2024, event["month"], event["day"]),
                    description=event["description"],
                    results=event["results"],
                    related_agents=[agent_ids[name] for name in event["related_agents"] if name in agent_ids]
                )
                self.db.add(health_event)
            
            # Create journey state records for each month
            for month, biomarkers in journey_data["biomarker_progression"].items():
                journey_state = JourneyState(
                    member_id=member.id,
                    month=month,
                    biomarkers=biomarkers,
                    current_interventions=[],
                    progress_metrics={}
                )
                self.db.add(journey_state)
            
            self.db.commit()
            return str(member.id)
            
        except Exception as e:
            self.db.rollback()
            raise e
        finally:
            self.db.close()