from typing import Dict, Any, List, TypedDict, Annotated
from langgraph.graph import StateGraph, END
import operator
from datetime import datetime, date, timedelta
import random
from app.agents.base_agent import BaseAgent
from app.agents.personas import AGENT_PERSONAS


class HealthJourneyState(TypedDict):
    member_profile: Dict[str, Any]
    current_month: int
    current_day: int
    journey_state: Dict[str, Any]
    messages: Annotated[List[Dict], operator.add]
    agents: Dict[str, BaseAgent]
    context: Dict[str, Any]


class LangGraphOrchestrator:
    def __init__(self):
        self.agents = {}
        self.graph = None
        self._initialize_agents()
        self._build_graph()
    
    def _initialize_agents(self):
        """Initialize all health journey agents"""
        for agent_name, agent_config in AGENT_PERSONAS.items():
            self.agents[agent_name] = BaseAgent(
                name=agent_name,
                role=agent_config["role"],
                persona_prompt=agent_config["persona_prompt"]
            )
    
    def _build_graph(self):
        """Build the LangGraph workflow for agent coordination"""
        workflow = StateGraph(HealthJourneyState)
        
        # Add agent nodes
        workflow.add_node("dr_warren", self._dr_warren_node)
        workflow.add_node("ruby", self._ruby_node)
        workflow.add_node("advik", self._advik_node)
        workflow.add_node("carla", self._carla_node)
        workflow.add_node("rachel", self._rachel_node)
        workflow.add_node("neel", self._neel_node)
        workflow.add_node("coordinator", self._coordinator_node)
        
        # Define the workflow flow
        workflow.set_entry_point("coordinator")
        
        # Coordinator decides which agents should act
        workflow.add_conditional_edges(
            "coordinator",
            self._decide_next_agents,
            {
                "dr_warren": "dr_warren",
                "ruby": "ruby", 
                "advik": "advik",
                "carla": "carla",
                "rachel": "rachel",
                "neel": "neel",
                "end": END
            }
        )
        
        # All agents return to coordinator for next decision
        for agent in ["dr_warren", "ruby", "advik", "carla", "rachel", "neel"]:
            workflow.add_edge(agent, "coordinator")
        
        self.graph = workflow.compile()
    
    def _coordinator_node(self, state: HealthJourneyState) -> Dict[str, Any]:
        """Central coordinator that decides which agents should act"""
        current_day = state["current_day"]
        current_month = state["current_month"]
        
        # Update context for decision making
        state["context"]["last_coordinator_run"] = current_day
        
        return state
    
    def _decide_next_agents(self, state: HealthJourneyState) -> str:
        """Decide which agent should act next based on context"""
        current_day = state["current_day"]
        current_month = state["current_month"]
        recent_messages = state["messages"][-10:]  # Last 10 messages
        
        # Check if we need diagnostic results (months 3 and 6)
        if current_month in [3, 6] and current_day % 30 == 15:  # Mid-month diagnostics
            return "dr_warren"
        
        # Daily message patterns
        agents_today = []
        
        # Dr. Warren - medical oversight (2-3 times per week)
        if current_day % 3 == 0:
            agents_today.append("dr_warren")
        
        # Ruby - nutrition (daily during meal times)
        if current_day % 2 == 0:
            agents_today.append("ruby")
        
        # Carla - fitness (4-5 times per week)
        if current_day % 2 == 1:
            agents_today.append("carla")
        
        # Rachel - mental health (3-4 times per week)
        if current_day % 3 == 1:
            agents_today.append("rachel")
        
        # Advik - performance analysis (weekly)
        if current_day % 7 == 0:
            agents_today.append("advik")
        
        # Neel - coordination (as needed, 2-3 times per week)
        if current_day % 4 == 0:
            agents_today.append("neel")
        
        # Select one agent for this iteration
        if agents_today:
            return random.choice(agents_today)
        
        return "end"
    
    def _dr_warren_node(self, state: HealthJourneyState) -> Dict[str, Any]:
        """Dr. Warren's medical oversight and recommendations"""
        agent = self.agents["Dr. Warren"]
        
        # Determine message type based on context
        current_month = state["current_month"]
        current_day = state["current_day"]
        
        if current_month in [3, 6] and current_day % 30 == 15:
            message_type = "diagnostic_results"
        elif current_day % 7 == 0:
            message_type = "weekly_review"
        else:
            message_type = "daily_medical_check"
        
        # Generate message
        message = agent.generate_message(
            context={
                "member": state["member_profile"],
                "journey_state": state["journey_state"],
                "current_month": current_month
            },
            message_type=message_type,
            previous_messages=state["messages"][-5:]
        )
        
        # Add message to state
        new_message = {
            "agent_name": "Dr. Warren",
            "agent_role": "Lead Physician",
            "content": message,
            "message_type": message_type,
            "timestamp": datetime.now(),
            "day": current_day,
            "month": current_month
        }
        
        state["messages"].append(new_message)
        return state
    
    def _ruby_node(self, state: HealthJourneyState) -> Dict[str, Any]:
        """Ruby's nutrition guidance and meal planning"""
        agent = self.agents["Ruby"]
        
        current_day = state["current_day"]
        current_month = state["current_month"]
        
        # Determine message type
        if current_day % 7 == 0:
            message_type = "weekly_meal_plan"
        elif random.random() < 0.3:
            message_type = "travel_nutrition"
        else:
            message_type = "daily_nutrition"
        
        message = agent.generate_message(
            context={
                "member": state["member_profile"],
                "journey_state": state["journey_state"],
                "current_month": current_month
            },
            message_type=message_type,
            previous_messages=state["messages"][-5:]
        )
        
        new_message = {
            "agent_name": "Ruby",
            "agent_role": "Nutritionist",
            "content": message,
            "message_type": message_type,
            "timestamp": datetime.now(),
            "day": current_day,
            "month": current_month
        }
        
        state["messages"].append(new_message)
        return state
    
    def _advik_node(self, state: HealthJourneyState) -> Dict[str, Any]:
        """Advik's performance analysis and biomarker insights"""
        agent = self.agents["Advik"]
        
        message = agent.generate_message(
            context={
                "member": state["member_profile"],
                "journey_state": state["journey_state"],
                "current_month": state["current_month"]
            },
            message_type="biomarker_analysis",
            previous_messages=state["messages"][-5:]
        )
        
        new_message = {
            "agent_name": "Advik",
            "agent_role": "Performance Scientist",
            "content": message,
            "message_type": "biomarker_analysis",
            "timestamp": datetime.now(),
            "day": state["current_day"],
            "month": state["current_month"]
        }
        
        state["messages"].append(new_message)
        return state
    
    def _carla_node(self, state: HealthJourneyState) -> Dict[str, Any]:
        """Carla's fitness coaching and workout guidance"""
        agent = self.agents["Carla"]
        
        current_day = state["current_day"]
        
        if current_day % 7 == 0:
            message_type = "weekly_workout_plan"
        elif random.random() < 0.3:
            message_type = "travel_workout"
        else:
            message_type = "daily_fitness"
        
        message = agent.generate_message(
            context={
                "member": state["member_profile"],
                "journey_state": state["journey_state"],
                "current_month": state["current_month"]
            },
            message_type=message_type,
            previous_messages=state["messages"][-5:]
        )
        
        new_message = {
            "agent_name": "Carla",
            "agent_role": "Fitness Coach",
            "content": message,
            "message_type": message_type,
            "timestamp": datetime.now(),
            "day": current_day,
            "month": state["current_month"]
        }
        
        state["messages"].append(new_message)
        return state
    
    def _rachel_node(self, state: HealthJourneyState) -> Dict[str, Any]:
        """Rachel's mental health support and stress management"""
        agent = self.agents["Rachel"]
        
        message = agent.generate_message(
            context={
                "member": state["member_profile"],
                "journey_state": state["journey_state"],
                "current_month": state["current_month"]
            },
            message_type="mental_wellness",
            previous_messages=state["messages"][-5:]
        )
        
        new_message = {
            "agent_name": "Rachel",
            "agent_role": "Mental Health Specialist", 
            "content": message,
            "message_type": "mental_wellness",
            "timestamp": datetime.now(),
            "day": state["current_day"],
            "month": state["current_month"]
        }
        
        state["messages"].append(new_message)
        return state
    
    def _neel_node(self, state: HealthJourneyState) -> Dict[str, Any]:
        """Neel's care coordination and member support"""
        agent = self.agents["Neel"]
        
        message = agent.generate_message(
            context={
                "member": state["member_profile"],
                "journey_state": state["journey_state"],
                "current_month": state["current_month"]
            },
            message_type="coordination",
            previous_messages=state["messages"][-5:]
        )
        
        new_message = {
            "agent_name": "Neel",
            "agent_role": "Relationship Manager",
            "content": message,
            "message_type": "coordination",
            "timestamp": datetime.now(),
            "day": state["current_day"],
            "month": state["current_month"]
        }
        
        state["messages"].append(new_message)
        return state
    
    def generate_day_messages(self, state: HealthJourneyState) -> List[Dict]:
        """Generate messages for a single day"""
        initial_message_count = len(state["messages"])
        
        # Run the graph for one iteration
        result = self.graph.invoke(state)
        
        # Return only new messages generated
        return result["messages"][initial_message_count:]