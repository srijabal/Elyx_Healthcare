from typing import Dict, Any, List, Tuple
from datetime import datetime, date, timedelta
import random
import json
from app.agents.langgraph_orchestrator import LangGraphOrchestrator, HealthJourneyState
from app.db.models import Member, Agent, Message, HealthEvent, JourneyState
from app.db.database import SessionLocal


class RealisticJourneyGenerator:
    """Enhanced journey generator with realistic constraints and member behavior"""
    
    def __init__(self):
        self.orchestrator = LangGraphOrchestrator()
        self.db = SessionLocal()
        
        # Realism constraints
        self.member_questions_per_week = 5  # Up to 5 conversations started by member
        self.plan_adherence_rate = 0.5  # 50% adherence rate
        self.exercise_update_frequency = 14  # Every 2 weeks
        self.travel_frequency = 4  # 1 week out of every 4 weeks
        self.commitment_hours_per_week = 5  # 5 hours per week commitment
        
    def generate_rohan_profile_realistic(self) -> Dict[str, Any]:
        """Generate enhanced Rohan profile matching the problem statement requirements"""
        return {
            "preferred_name": "Rohan Patel",
            "date_of_birth": "12 March 1979",
            "age": 46,
            "gender_identity": "Male",
            "primary_residence": "Singapore",
            "frequent_travel_hubs": ["UK", "US", "South Korea", "Jakarta"],
            "occupation": "Regional Head of Sales for a FinTech company",
            "business_commitments": "Frequent international travel and high-stress demands",
            "personal_assistant": "Sarah Tan",
            "top_health_goals": [
                {
                    "goal": "Reduce risk of heart disease (due to family history) by maintaining healthy cholesterol and blood pressure levels",
                    "target_date": "December 2026"
                },
                {
                    "goal": "Enhance cognitive function and focus for sustained mental performance in demanding work environment",
                    "target_date": "June 2026"
                },
                {
                    "goal": "Implement annual full-body health screenings for early detection of debilitating diseases",
                    "target_date": "November 2025"
                }
            ],
            "why_now": "Family history of heart disease; wants to proactively manage health for long-term career performance and to be present for his young children",
            "success_metrics": [
                "Blood panel markers (cholesterol, blood pressure, inflammatory markers)",
                "Cognitive assessment scores", 
                "Sleep quality (Garmin data)",
                "Stress resilience (subjective self-assessment, Garmin HRV)"
            ],
            "personality_assessment": "Analytical, driven, values efficiency and evidence-based approaches",
            "stage_of_change": "Highly motivated and ready to act, but time-constrained. Needs clear, concise action plans and data-driven insights",
            "social_support": "Wife is supportive; has 2 young kids; employs a cook at home which helps with nutrition management",
            "mental_health_history": "No formal mental health history; manages work-related stress through exercise",
            "tech_stack": {
                "wearables": "Garmin watch (used for runs), considering Oura ring",
                "health_apps": ["Trainerize", "MyFitnessPal", "Whoop"],
                "data_sharing": "Willing to enable full data sharing from Garmin and any new wearables for comprehensive integration and analysis"
            },
            "desired_reports": "Monthly consolidated health report focusing on key trends and actionable insights; quarterly deep-dive into specific health areas",
            "communication_preferences": "Important updates and communication via PA (Sarah) for scheduling",
            "response_expectations": "Expects responses within 24-48 hours for non-urgent inquiries. For urgent health concerns, contact his PA immediately, who will then inform his wife",
            "detail_preference": "Prefers executive summaries with clear recommendations, but appreciates access to granular data upon request to understand the underlying evidence",
            "cultural_considerations": "English, Indian cultural background, no specific religious considerations impacting health services",
            "availability": "Exercises every morning (20 min routine), occasional runs. Often travels at least once every two weeks",
            "travel_calendar": "Travel calendar provided by PA (Sarah) on a monthly basis. Requires flexible scheduling and consideration for time-zone adjustments during frequent travel (UK, US, South Korea, Jakarta)",
            "appointment_preferences": "Prefers virtual appointments due to travel, but open to on-site for initial comprehensive assessments or specific procedures",
            "transport": "Will arrange his own transport",
            "initial_biomarkers": {
                "weight": "75kg",
                "body_fat": "18%", 
                "blood_pressure": "138/88",
                "resting_heart_rate": "78 bpm",
                "sleep_average": "6.2 hours",
                "stress_level": "8/10",
                "cholesterol_total": "235 mg/dL",
                "hdl_cholesterol": "38 mg/dL",
                "ldl_cholesterol": "155 mg/dL",
                "triglycerides": "185 mg/dL",
                "glucose_fasting": "102 mg/dL",
                "hba1c": "5.6%"
            },
            "travel_schedule": self._generate_travel_schedule(),
            "work_intensity_calendar": self._generate_work_calendar()
        }
    
    def _generate_travel_schedule(self) -> List[Dict[str, Any]]:
        """Generate realistic business travel schedule - 1 week every 4 weeks"""
        travel_schedule = []
        week_counter = 0
        
        for month in range(1, 9):
            # Each month has ~4 weeks, travel every 4th week
            for week in range(1, 5):
                week_counter += 1
                if week_counter % 4 == 0:  # Every 4th week
                    destinations = ["UK", "US", "South Korea", "Jakarta"]
                    travel_schedule.append({
                        "month": month,
                        "week": week,
                        "destination": random.choice(destinations),
                        "duration_days": random.randint(3, 6),
                        "purpose": "Sales meetings and client visits"
                    })
        
        return travel_schedule
    
    def _generate_work_calendar(self) -> List[Dict[str, Any]]:
        """Generate work intensity calendar affecting health plan adherence"""
        calendar = []
        
        for month in range(1, 9):
            # Quarter-end months are more intense
            if month % 3 == 0:
                intensity = "high"
                stress_multiplier = 1.5
            else:
                intensity = random.choice(["medium", "medium", "high"])  # Bias toward medium/high
                stress_multiplier = 1.2 if intensity == "high" else 1.0
            
            calendar.append({
                "month": month,
                "intensity": intensity,
                "stress_multiplier": stress_multiplier,
                "quarter_end": month % 3 == 0
            })
        
        return calendar
    
    def generate_quarterly_diagnostics(self) -> List[Dict[str, Any]]:
        """Generate comprehensive diagnostic tests every 3 months"""
        diagnostics = []
        
        # Month 3 diagnostic
        diagnostics.append({
            "month": 3,
            "day": 15,
            "event_type": "quarterly_diagnostic",
            "description": "Q1 Comprehensive Health Panel",
            "tests_performed": [
                "Clinical History: Thorough interview to study current health",
                "Physical Examination: Comprehensive assessment by physician",
                "Vital Signs: Blood pressure, heart rate, BMI",
                "OGTT with paired insulin",
                "Lipid profile + advanced lipid tests (ApoB/ApoA, Lp(a), PLAC test)",
                "Full blood count (FBC)",
                "Liver and kidney function tests",
                "Micronutrient Panel - including Omega-3",
                "ESR CRP",
                "Biological: TruAge",
                "TSH T3 T4, Cortisol",
                "Sex Hormones: Age-adjusted",
                "Heavy Metals: Lead, Mercury",
                "ApoE4",
                "Epigenetic tests",
                "Urinalysis: Kidney and urinary tract health"
            ],
            "results": {
                "weight": "73.5kg (-1.5kg)",
                "body_fat": "16.8% (-1.2%)",
                "blood_pressure": "128/82 (-10/-6)",
                "cholesterol_total": "205 mg/dL (-30)",
                "hdl_cholesterol": "45 mg/dL (+7)",
                "glucose_fasting": "95 mg/dL (-7)",
                "hba1c": "5.3% (-0.3%)",
                "improvements": "Significant cardiovascular risk reduction, pre-hypertension improving"
            },
            "concerns": [
                "Still needs consistent exercise routine",
                "Sleep quality inconsistent during travel",
                "Stress management techniques need reinforcement"
            ]
        })
        
        # Month 6 diagnostic
        diagnostics.append({
            "month": 6,
            "day": 15,
            "event_type": "quarterly_diagnostic", 
            "description": "Q2 Mid-Journey Assessment",
            "tests_performed": [
                "Cancer Screening: Colorectal (FIT, Colonoscopy), Full Body MRI OR Targeted MRI/Lucence",
                "Advanced Cardiovascular: ECG, Coronary Calcium Score with Angiography vs Cleerly, Echocardiogram, CIMT Scan",
                "Overall Health & Fitness: VO2 Max Testing, Grip strength, Functional Movement Screening (FMS), Indirect Calorimetry/DLW, Spirometry",
                "Genetic Testing: Hereditary Risk Assessment, Pharmacogenomics",
                "Body Composition: DEXA Scan",
                "Hormone Profiling: Thyroid Function, Sex Hormone Levels",
                "Nutritional Assessment: Micronutrient Levels, Food Allergy Testing, Gut microbiome",
                "Brain Health: Cognitive Function Tests, Mental health review, Brain MRI stroke screen",
                "Skin Analysis: VISIA",
                "Extended Care: Comprehensive Consultation with specialists, Personalized Lifestyle Recommendations"
            ],
            "results": {
                "weight": "72kg (-3kg total)",
                "body_fat": "15.2% (-2.8% total)",
                "blood_pressure": "118/76 (normalized)",
                "cholesterol_total": "175 mg/dL (-60 total)",
                "hdl_cholesterol": "52 mg/dL (+14 total)",
                "glucose_fasting": "88 mg/dL (-14 total)",
                "hba1c": "5.1% (-0.5% total)",
                "vo2_max": "35 ml/kg/min (improved fitness)",
                "improvements": "Pre-hypertension resolved, pre-diabetes reversed"
            },
            "achievements": [
                "Blood pressure normalized without medication",
                "Cardiovascular risk dropped to low category",
                "Lean muscle mass increased significantly",
                "Sleep quality dramatically improved"
            ]
        })
        
        return diagnostics
    
    def generate_member_initiated_conversations(self) -> List[Dict[str, Any]]:
        """Generate realistic member-initiated conversations (5 per week average)"""
        conversations = []
        topics = [
            "I read about intermittent fasting, is it good for me?",
            "My colleague said Zone 2 cardio is overrated, thoughts?", 
            "Can I take creatine? Will it affect my BP?",
            "Saw this article about sleep and testosterone, relevant?",
            "Quick question - is my resting HR of 65 good or should be lower?",
            "Client dinner tonight, how do I navigate the menu?",
            "Hotel gym only has treadmill, what should I do?",
            "Feeling stressed today, any quick techniques?",
            "My wife wants to try keto together, good idea?",
            "Travel day tomorrow, should I fast on the flight?",
            "Why am I more tired after starting the supplements?",
            "Can I do strength training 2 days in a row?",
            "How important is timing of protein intake?",
            "Should I be worried about my cholesterol genetics?",
            "Quick - is coconut oil actually healthy or not?"
        ]
        
        realistic_typing_patterns = [
            ("Quick question - ", "typo_prone"),
            ("Hey, ", "casual"),
            ("I've been thinking about ", "research_mode"),
            ("Hmm, ", "uncertain"),
            ("One more thing - ", "afterthought")
        ]
        
        # Generate ~5 conversations per week across 32 weeks
        total_conversations = 32 * 5  # 160 conversations
        
        for i in range(total_conversations):
            week = (i // 5) + 1
            day_in_week = (i % 5) + 1
            
            topic = random.choice(topics)
            typing_style = random.choice(realistic_typing_patterns)
            
            # Add realistic typing elements
            if typing_style[1] == "typo_prone":
                topic = self._add_realistic_typos(topic)
            elif typing_style[1] == "casual":
                topic = topic.lower()
            
            conversations.append({
                "week": week,
                "day": day_in_week,
                "type": "member_initiated",
                "content": typing_style[0] + topic,
                "urgency": random.choice(["low", "medium", "medium", "high"]),
                "research_prompted": random.random() < 0.3  # 30% are research-prompted
            })
        
        return conversations
    
    def _add_realistic_typos(self, text: str) -> str:
        """Add realistic typing errors for busy professional"""
        typos = {
            "the": "teh", "and": "nad", "you": "u", "your": "ur",
            "because": "bc", "right": "rite", "about": "abt",
            "should": "shld", "would": "wld", "good": "gud"
        }
        
        words = text.split()
        for i, word in enumerate(words):
            if random.random() < 0.1 and word.lower() in typos:  # 10% chance
                words[i] = typos[word.lower()]
        
        return " ".join(words)
    
    def generate_plan_adherence_events(self) -> List[Dict[str, Any]]:
        """Generate realistic plan adherence (~50%) with adjustments"""
        events = []
        
        plan_changes = [
            {
                "week": 3,
                "issue": "Exercise timing doesn't work with client calls",
                "adjustment": "Move workouts to early morning 6 AM",
                "adherence_before": 0.3,
                "adherence_after": 0.7
            },
            {
                "week": 6,
                "issue": "Meal prep taking too long on Sundays",
                "adjustment": "Switch to pre-made healthy options + simple recipes",
                "adherence_before": 0.4,
                "adherence_after": 0.6
            },
            {
                "week": 9,
                "issue": "Travel disrupting sleep schedule too much",
                "adjustment": "Focus on sleep hygiene basics + melatonin for travel",
                "adherence_before": 0.3,
                "adherence_after": 0.5
            },
            {
                "week": 12,
                "issue": "Gym workouts too time-consuming",
                "adjustment": "Switch to efficient 30-min hotel room routines",
                "adherence_before": 0.4,
                "adherence_after": 0.8
            },
            {
                "week": 18,
                "issue": "Stress eating during quarter-end",
                "adjustment": "Pre-planned healthy stress snacks + mindfulness breaks",
                "adherence_before": 0.2,
                "adherence_after": 0.6
            },
            {
                "week": 24,
                "issue": "Supplement routine too complicated",
                "adjustment": "Simplify to 3 key supplements with travel packs",
                "adherence_before": 0.3,
                "adherence_after": 0.7
            }
        ]
        
        return plan_changes
    
    def generate_exercise_progression(self) -> List[Dict[str, Any]]:
        """Generate exercise updates every 2 weeks based on progress"""
        progressions = []
        
        for week in range(2, 33, 2):  # Every 2 weeks for 32 weeks
            month = (week - 1) // 4 + 1
            
            progressions.append({
                "week": week,
                "month": month,
                "update_type": "exercise_progression",
                "changes": self._get_exercise_changes_for_week(week),
                "rationale": self._get_progression_rationale(week),
                "estimated_time": "30-45 minutes per session"
            })
        
        return progressions
    
    def _get_exercise_changes_for_week(self, week: int) -> Dict[str, Any]:
        """Get specific exercise changes based on week progression"""
        base_progressions = {
            2: {"focus": "Foundation", "cardio": "20 min Zone 2", "strength": "Bodyweight basics"},
            4: {"focus": "Building", "cardio": "25 min Zone 2", "strength": "Add resistance bands"},
            6: {"focus": "Travel Adaptation", "cardio": "Hotel room HIIT options", "strength": "Equipment-free routines"},
            8: {"focus": "Strength Focus", "cardio": "30 min Zone 2", "strength": "Progressive overload"},
            10: {"focus": "Endurance", "cardio": "35 min Zone 2 + intervals", "strength": "Compound movements"},
            12: {"focus": "Travel Optimization", "cardio": "Efficient 20-min protocols", "strength": "Minimal equipment needed"},
            14: {"focus": "Advanced", "cardio": "40 min Zone 2", "strength": "Advanced progressions"},
            16: {"focus": "Performance", "cardio": "Zone 2 + VO2 work", "strength": "Power movements"},
        }
        
        # Cycle through progressions
        week_key = min(week, 16)
        if week > 16:
            week_key = ((week - 16) % 8) + 8
        
        return base_progressions.get(week_key, base_progressions[16])
    
    def _get_progression_rationale(self, week: int) -> str:
        """Get rationale for exercise progression"""
        rationales = [
            "Based on improved cardiovascular fitness markers",
            "Adapting to travel schedule and hotel gym constraints", 
            "Progressive overload needed for continued strength gains",
            "Heart rate variability shows good recovery capacity",
            "Time efficiency needed due to work demands",
            "Addressing movement quality before increasing intensity",
            "Building on previous month's strength improvements",
            "Optimizing for business travel requirements"
        ]
        
        return random.choice(rationales)
    
    def generate_realistic_complete_journey(self) -> Dict[str, Any]:
        """Generate complete journey with all realistic constraints"""
        
        # Enhanced member profile
        member_profile = self.generate_rohan_profile_realistic()
        
        # Realistic biomarker progression (slower, with setbacks)
        biomarker_progression = self._generate_realistic_biomarker_progression()
        
        # Quarterly diagnostics (every 3 months)
        quarterly_diagnostics = self.generate_quarterly_diagnostics()
        
        # Member-initiated conversations (5 per week)
        member_conversations = self.generate_member_initiated_conversations()
        
        # Plan adherence and adjustments (50% success rate)
        plan_adherence = self.generate_plan_adherence_events()
        
        # Exercise updates every 2 weeks
        exercise_progressions = self.generate_exercise_progression()
        
        # Generate messages with realistic constraints
        all_messages = self._generate_realistic_messages(
            member_profile, 
            member_conversations,
            plan_adherence,
            exercise_progressions
        )
        
        return {
            "member_profile": member_profile,
            "biomarker_progression": biomarker_progression,
            "quarterly_diagnostics": quarterly_diagnostics,
            "member_conversations": member_conversations,
            "plan_adherence_events": plan_adherence,
            "exercise_progressions": exercise_progressions,
            "messages": all_messages,
            "total_messages": len(all_messages),
            "journey_summary": {
                "duration_months": 8,
                "total_days": 240,
                "diagnostic_tests": len(quarterly_diagnostics),
                "member_initiated_conversations": len(member_conversations),
                "plan_adjustments": len(plan_adherence),
                "exercise_updates": len(exercise_progressions),
                "average_adherence_rate": 0.5,
                "travel_weeks": len([t for t in member_profile["travel_schedule"]]),
                "chronic_condition_managed": "Pre-hypertension"
            }
        }
    
    def _generate_realistic_biomarker_progression(self) -> Dict[int, Dict[str, Any]]:
        """Generate realistic biomarker progression with setbacks and plateaus"""
        progression = {}
        
        # Month 1: Baseline with chronic condition
        progression[1] = {
            "weight": "75kg",
            "body_fat": "18%", 
            "blood_pressure": "138/88",  # Pre-hypertensive
            "resting_heart_rate": "78 bpm",
            "sleep_average": "6.2 hours",
            "stress_level": "8/10",
            "adherence_this_month": "35%"
        }
        
        # Month 2: Slow start, learning
        progression[2] = {
            "weight": "74.5kg",
            "body_fat": "17.6%",
            "blood_pressure": "135/86",
            "resting_heart_rate": "76 bpm", 
            "sleep_average": "6.8 hours",
            "stress_level": "7/10",
            "adherence_this_month": "45%"
        }
        
        # Month 3: First diagnostic, motivation boost
        progression[3] = {
            "weight": "73.5kg", 
            "body_fat": "16.8%",
            "blood_pressure": "128/82",
            "resting_heart_rate": "72 bpm",
            "sleep_average": "7.1 hours", 
            "stress_level": "6/10",
            "adherence_this_month": "60%"
        }
        
        # Month 4: Quarter-end stress, some setback
        progression[4] = {
            "weight": "73.8kg",  # Slight gain due to stress
            "body_fat": "17.0%",
            "blood_pressure": "132/84",  # Stress spike
            "resting_heart_rate": "74 bpm",
            "sleep_average": "6.5 hours",  # Work stress affecting sleep
            "stress_level": "7/10",
            "adherence_this_month": "35%"
        }
        
        # Month 5: Recovery, plan adjustments working
        progression[5] = {
            "weight": "73.2kg",
            "body_fat": "16.4%", 
            "blood_pressure": "125/80",
            "resting_heart_rate": "70 bpm",
            "sleep_average": "7.3 hours",
            "stress_level": "5/10",
            "adherence_this_month": "65%"
        }
        
        # Month 6: Second diagnostic, excellent progress
        progression[6] = {
            "weight": "72kg",
            "body_fat": "15.2%",
            "blood_pressure": "118/76",  # Normalized!
            "resting_heart_rate": "66 bpm",
            "sleep_average": "7.6 hours",
            "stress_level": "4/10", 
            "adherence_this_month": "70%"
        }
        
        # Month 7: Plateau phase, maintaining
        progression[7] = {
            "weight": "71.8kg",
            "body_fat": "15.0%",
            "blood_pressure": "116/74", 
            "resting_heart_rate": "64 bpm",
            "sleep_average": "7.8 hours",
            "stress_level": "4/10",
            "adherence_this_month": "60%"
        }
        
        # Month 8: Final optimization
        progression[8] = {
            "weight": "71.5kg",
            "body_fat": "14.5%",
            "blood_pressure": "115/72",
            "resting_heart_rate": "62 bpm", 
            "sleep_average": "8 hours",
            "stress_level": "3/10",
            "adherence_this_month": "75%"
        }
        
        return progression
    
    def _generate_realistic_messages(
        self,
        member_profile: Dict[str, Any],
        member_conversations: List[Dict[str, Any]], 
        plan_adherence: List[Dict[str, Any]],
        exercise_progressions: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate messages incorporating all realistic constraints"""
        
        all_messages = []
        
        # Use existing orchestrator but enhance with realistic elements
        for week in range(1, 33):  # 32 weeks = 8 months
            month = (week - 1) // 4 + 1
            
            # Add member-initiated conversations for this week
            week_conversations = [c for c in member_conversations if c["week"] == week]
            for conv in week_conversations:
                all_messages.append({
                    "agent_name": "Rohan",  # Member
                    "agent_role": "Member",
                    "content": conv["content"],
                    "message_type": "member_question",
                    "timestamp": datetime.now(),
                    "day": (week - 1) * 7 + conv["day"],
                    "month": month,
                    "is_member_initiated": True
                })
            
            # Add plan adherence adjustments
            week_adjustments = [p for p in plan_adherence if p["week"] == week]
            for adj in week_adjustments:
                all_messages.append({
                    "agent_name": "Neel",
                    "agent_role": "Relationship Manager",
                    "content": f"I notice {adj['issue']}. Let's try this adjustment: {adj['adjustment']}",
                    "message_type": "plan_adjustment",
                    "timestamp": datetime.now(),
                    "day": (week - 1) * 7 + 3,
                    "month": month,
                    "adherence_change": {"before": adj["adherence_before"], "after": adj["adherence_after"]}
                })
            
            # Add exercise progressions every 2 weeks
            if week % 2 == 0:
                week_progressions = [e for e in exercise_progressions if e["week"] == week]
                for prog in week_progressions:
                    all_messages.append({
                        "agent_name": "Carla",
                        "agent_role": "Fitness Coach",
                        "content": f"Time for your bi-weekly update! {prog['rationale']}. New focus: {prog['changes']['focus']}",
                        "message_type": "exercise_update",
                        "timestamp": datetime.now(),
                        "day": (week - 1) * 7 + 1,
                        "month": month,
                        "exercise_changes": prog["changes"]
                    })
        
        return all_messages