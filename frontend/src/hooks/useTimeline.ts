import { useMemo } from 'react';
import { JourneyData, TimelineMonth, Message } from '@/services/types';

export function useTimeline(journeyData?: JourneyData) {
  return useMemo(() => {
    if (!journeyData) return [];

    const timelineMonths: TimelineMonth[] = [];

    // Create timeline data for each month
    for (let month = 1; month <= 8; month++) {
      const monthState = journeyData.journey_states.find(state => state.month === month);
      const monthMessages = journeyData.messages.filter(msg => {
        // Try context_data.month first, fallback to extracting from timestamp
        if (msg.context_data?.month) {
          return msg.context_data.month === month;
        }
        // Extract month from timestamp
        try {
          const date = new Date(msg.timestamp);
          const messageMonth = date.getMonth() + 1; // getMonth() returns 0-11
          return messageMonth === month;
        } catch {
          return false;
        }
      });
      const monthEvents = journeyData.health_events.filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate.getMonth() + 1 === month;
      });

      // Calculate agent activity
      const agentActivity: { [agentName: string]: number } = {};
      monthMessages.forEach(msg => {
        agentActivity[msg.agent_name] = (agentActivity[msg.agent_name] || 0) + 1;
      });

      // Parse adherence rate
      const adherenceStr = monthState?.biomarkers.adherence_this_month || '50%';
      const adherence_rate = parseInt(adherenceStr.replace('%', '')) / 100;

      timelineMonths.push({
        month,
        biomarkers: monthState?.biomarkers || {
          weight: '75kg',
          body_fat: '18%',
          blood_pressure: '138/88',
          resting_heart_rate: '78 bpm',
          sleep_average: '6.2 hours',
          stress_level: '8/10'
        },
        messages: monthMessages,
        events: monthEvents,
        agent_activity: agentActivity,
        adherence_rate
      });
    }

    return timelineMonths;
  }, [journeyData]);
}

export function useMessagesByMonth(messages: Message[], month: number) {
  return useMemo(() => {
    return messages.filter(msg => {
      // Try context_data.month first, fallback to extracting from timestamp
      if (msg.context_data?.month) {
        return msg.context_data.month === month;
      }
      // Extract month from timestamp
      try {
        const date = new Date(msg.timestamp);
        const messageMonth = date.getMonth() + 1;
        return messageMonth === month;
      } catch {
        return false;
      }
    });
  }, [messages, month]);
}