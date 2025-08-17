// Member Profile Types
export interface Member {
  id: string;
  name: string;
  age: number;
  occupation: string;
  location: string;
  health_goals: string[];
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  persona_prompt: string;
}

// Message Types
export interface Message {
  id: string;
  member_id: string;
  agent_id?: string;
  agent_name: string;
  content: string;
  message_type: string;
  timestamp: string;
  context_data: {
    day: number;
    month: number;
    is_member_initiated?: boolean;
    sender?: string;
    urgency?: string;
  };
}

// Health Event Types
export interface HealthEvent {
  id: string;
  member_id: string;
  event_type: string;
  event_date: string;
  description: string;
  results: Record<string, any>;
  related_agents?: string[];
}

// Journey State Types
export interface JourneyState {
  id: string;
  member_id: string;
  month: number;
  biomarkers: {
    weight: string;
    body_fat: string;
    blood_pressure: string;
    resting_heart_rate: string;
    sleep_average: string;
    stress_level: string;
    adherence_this_month?: string;
    [key: string]: any;
  };
  current_interventions: any[];
  progress_metrics: Record<string, any>;
}

// Complete Journey Data
export interface JourneyData {
  member: Member;
  messages: Message[];
  health_events: HealthEvent[];
  journey_states: JourneyState[];
  agents: Agent[];
  timeline?: any[]; // For backwards compatibility with timeline endpoint
}

// Timeline Data for Visualization
export interface TimelineMonth {
  month: number;
  biomarkers: JourneyState['biomarkers'];
  messages: Message[];
  events: HealthEvent[];
  agent_activity: {
    [agentName: string]: number; // message count
  };
  adherence_rate: number;
}

// Agent Colors for UI
export const AGENT_COLORS = {
  'Dr. Warren': 'hsl(var(--agent-doctor))',
  'Ruby': 'hsl(var(--agent-nutrition))',
  'Advik': 'hsl(var(--agent-performance))',
  'Carla': 'hsl(var(--agent-fitness))',
  'Rachel': 'hsl(var(--agent-mental))',
  'Neel': 'hsl(var(--agent-manager))',
  'Member': 'hsl(var(--member))',
  'Rohan': 'hsl(var(--member))',
} as const;

// Progress Status
export type ProgressStatus = 'improvement' | 'concern' | 'issue';

export const PROGRESS_COLORS = {
  improvement: 'hsl(var(--improvement))',
  concern: 'hsl(var(--concern))',
  issue: 'hsl(var(--issue))',
} as const;