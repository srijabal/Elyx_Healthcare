import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { JourneyData } from '@/services/types';

export function useJourneyData(memberId?: string) {
  return useQuery({
    queryKey: ['journey', memberId],
    queryFn: async () => {
      if (memberId) {
        // Use the full member endpoint that includes journey_states and health_events
        return apiService.getMemberJourneyData(memberId);
      } else {
        // Use mock data for demo
        return apiService.getMockJourneyData();
      }
    },
    enabled: true, // Always enabled, will use mock data if no memberId
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => apiService.getAgents(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}