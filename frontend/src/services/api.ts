import { JourneyData, Member, Agent, Message, HealthEvent, JourneyState } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Member endpoints
  async getMember(memberId: string): Promise<Member> {
    return this.fetchApi<Member>(`/api/v1/journey/members/${memberId}`);
  }

  async getMemberTimeline(memberId: string): Promise<JourneyData> {
    const response = await this.fetchApi<any>(`/api/v1/journey/members/${memberId}/timeline`);
    
    // Transform API response to match our frontend types
    return {
      member: {
        id: memberId,
        name: "Rohan Patel", // We'll get this from the member endpoint
        age: 46,
        occupation: "Regional Head of Sales",
        location: "Singapore", 
        health_goals: []
      },
      agents: [], // We'll get this from agents endpoint
      messages: response.timeline.flatMap((month: any) => 
        month.messages.map((msg: any) => ({
          id: `${month.month}-${msg.day}-${Date.now()}`,
          member_id: memberId,
          agent_id: msg.agent_name === 'Rohan' ? null : 'agent-id',
          agent_name: msg.agent_name,
          content: msg.content,
          message_type: msg.message_type,
          timestamp: msg.timestamp,
          context_data: {
            day: msg.day,
            month: month.month,
            is_member_initiated: msg.is_member_initiated
          }
        }))
      ),
      health_events: response.health_events.map((event: any) => ({
        id: `event-${event.month}-${event.day}`,
        member_id: memberId,
        event_type: event.event_type,
        event_date: `2024-${event.month.toString().padStart(2, '0')}-${event.day.toString().padStart(2, '0')}`,
        description: event.description,
        results: event.results
      })),
      journey_states: response.biomarker_progression.map((state: any) => ({
        id: `state-${state.month}`,
        member_id: memberId,
        month: state.month,
        biomarkers: state.biomarkers,
        current_interventions: [],
        progress_metrics: {}
      }))
    };
  }

  // Agent endpoints
  async getAgents(): Promise<Agent[]> {
    return this.fetchApi<Agent[]>('/api/v1/agents/');
  }

  // Message endpoints
  async searchMessages(query: string): Promise<Message[]> {
    return this.fetchApi<Message[]>(`/api/v1/messages/search?query=${encodeURIComponent(query)}`);
  }

  async getMessageAnalytics(): Promise<any> {
    return this.fetchApi<any>('/api/v1/messages/analytics');
  }

  // Get complete member journey data (includes messages, health_events, journey_states)
  async getMemberJourneyData(memberId: string): Promise<JourneyData> {
    const response = await this.fetchApi<any>(`/api/v1/journey/members/${memberId}`);
    
    // Transform API response to match our frontend types
    return {
      member: response.member,
      agents: response.agents || [], // Get from separate endpoint if needed
      messages: response.messages || [],
      health_events: response.health_events || [],
      journey_states: response.journey_states || [],
      timeline: response.timeline // For backwards compatibility
    };
  }

  // Journey generation
  async generateRealisticJourney(): Promise<{ member_id: string }> {
    return this.fetchApi<{ member_id: string }>('/api/v1/journey/generate-realistic', {
      method: 'POST',
    });
  }

  // Mock data for development (when backend is not available)
  async getMockJourneyData(): Promise<JourneyData> {
    // This would be replaced with real API call in production
    return {
      member: {
        id: 'mock-member-id',
        name: 'Rohan Patel',
        age: 46,
        occupation: 'Regional Head of Sales',
        location: 'Singapore',
        health_goals: [
          'Reduce risk of heart disease',
          'Enhance cognitive function',
          'Implement health screenings'
        ]
      },
      agents: [
        { id: '1', name: 'Dr. Warren', role: 'The Medical Strategist', specialty: 'Medical oversight', persona_prompt: '' },
        { id: '2', name: 'Ruby', role: 'The Concierge / Orchestrator', specialty: 'Logistics', persona_prompt: '' },
        { id: '3', name: 'Advik', role: 'The Performance Scientist', specialty: 'Analytics', persona_prompt: '' },
        { id: '4', name: 'Carla', role: 'The Nutritionist', specialty: 'Nutrition', persona_prompt: '' },
        { id: '5', name: 'Rachel', role: 'The PT / Physiotherapist', specialty: 'Fitness', persona_prompt: '' },
        { id: '6', name: 'Neel', role: 'The Concierge Lead / Relationship Manager', specialty: 'Coordination', persona_prompt: '' },
      ],
      messages: [
        {
          id: '1',
          member_id: 'mock-member-id',
          agent_id: '1',
          agent_name: 'Rohan',
          content: 'Quick question - is my resting HR of 65 good or should be lower?',
          message_type: 'member_question',
          timestamp: '2024-01-15T14:30:00Z',
          context_data: {
            day: 15,
            month: 1,
            is_member_initiated: true,
            sender: 'Rohan',
            urgency: 'medium'
          }
        },
        {
          id: '2',
          member_id: 'mock-member-id',
          agent_id: '1',
          agent_name: 'Dr. Warren',
          content: 'That\'s actually quite good! A resting HR of 65 shows your cardiovascular fitness is improving. The target range is 60-100, so you\'re in excellent territory.',
          message_type: 'agent_response',
          timestamp: '2024-01-15T14:45:00Z',
          context_data: {
            day: 15,
            month: 1,
            is_member_initiated: false,
            sender: 'Dr. Warren'
          }
        }
      ],
      health_events: [
        {
          id: '1',
          member_id: 'mock-member-id',
          event_type: 'quarterly_diagnostic',
          event_date: '2024-03-15',
          description: 'Q1 Comprehensive Health Panel',
          results: {
            blood_panel: 'Improved lipid profile',
            body_composition: '2kg weight loss',
            cardiovascular: 'Improved resting heart rate'
          }
        }
      ],
      journey_states: Array.from({ length: 8 }, (_, i) => ({
        id: `state-${i + 1}`,
        member_id: 'mock-member-id',
        month: i + 1,
        biomarkers: {
          weight: `${75 - (i * 0.5)}kg`,
          body_fat: `${18 - (i * 0.4)}%`,
          blood_pressure: `${138 - (i * 3)}/${88 - (i * 2)}`,
          resting_heart_rate: `${78 - (i * 2)} bpm`,
          sleep_average: `${6.2 + (i * 0.2)} hours`,
          stress_level: `${8 - i}/10`,
          adherence_this_month: `${35 + (i * 5)}%`
        },
        current_interventions: [],
        progress_metrics: {}
      }))
    };
  }
}

export const apiService = new ApiService();