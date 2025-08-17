from typing import Dict, Any, List, Optional
from groq import Groq
from app.core.config import settings
import json
from datetime import datetime, date


class BaseAgent:
    def __init__(self, name: str, role: str, persona_prompt: str):
        self.name = name
        self.role = role
        self.persona_prompt = persona_prompt
        self.client = Groq(
            api_key=settings.GROQ_API_KEY
        )
    
    def generate_message(
        self, 
        context: Dict[str, Any], 
        message_type: str = "general",
        previous_messages: List[Dict] = None
    ) -> str:
        """Generate a contextual message based on the member's current state"""
        
        # Build context for the AI
        context_prompt = self._build_context_prompt(context, message_type, previous_messages)
        
        # Create the full prompt
        full_prompt = f"""
{self.persona_prompt}

Current Context:
{context_prompt}

Message Type: {message_type}

Generate a natural, WhatsApp-style message as {self.name}. Keep it:
- Conversational and friendly
- Specific to the member's situation
- Actionable when appropriate
- Under 200 words
- Professional but warm

Message:"""

        response = self.client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "user", "content": full_prompt}
            ],
            temperature=0.7,
            max_tokens=1024
        )
        return response.choices[0].message.content.strip()
    
    def _build_context_prompt(
        self, 
        context: Dict[str, Any], 
        message_type: str,
        previous_messages: List[Dict] = None
    ) -> str:
        """Build context prompt from member data and journey state"""
        
        member = context.get('member', {})
        journey_state = context.get('journey_state', {})
        current_month = context.get('current_month', 1)
        
        context_parts = [
            f"Member: {member.get('name', 'Unknown')} ({member.get('age', 'Unknown')} years old)",
            f"Occupation: {member.get('occupation', 'Unknown')}",
            f"Location: {member.get('location', 'Unknown')}",
            f"Current Month: {current_month}/8 of health journey",
        ]
        
        if journey_state:
            biomarkers = journey_state.get('biomarkers', {})
            if biomarkers:
                context_parts.append("Current Biomarkers:")
                for key, value in biomarkers.items():
                    context_parts.append(f"  - {key}: {value}")
        
        # Add recent messages for context
        if previous_messages:
            context_parts.append("\nRecent conversation context:")
            for msg in previous_messages[-3:]:  # Last 3 messages
                agent_name = msg.get('agent_name', 'Unknown')
                content = msg.get('content', '')[:100] + "..." if len(msg.get('content', '')) > 100 else msg.get('content', '')
                context_parts.append(f"  {agent_name}: {content}")
        
        return "\n".join(context_parts)
    
    def should_send_message(self, context: Dict[str, Any], current_day: int) -> bool:
        """Determine if this agent should send a message on the current day"""
        # Base implementation - override in specific agents
        return False