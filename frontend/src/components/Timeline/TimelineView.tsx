'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTimeline } from '@/hooks/useTimeline';
import { JourneyData, TimelineMonth, AGENT_COLORS } from '@/services/types';
import { format } from 'date-fns';
import { 
  Calendar, 
  Heart, 
  Activity, 
  TrendingUp, 
  MessageCircle,
  Stethoscope,
  MapPin
} from 'lucide-react';

interface TimelineViewProps {
  journeyData: JourneyData;
  onMonthSelect?: (month: number) => void;
  selectedMonth?: number;
}

export function TimelineView({ journeyData, onMonthSelect, selectedMonth }: TimelineViewProps) {
  const timelineMonths = useTimeline(journeyData);

  const handleMonthClick = (month: number) => {
    onMonthSelect?.(month);
  };

  return (
    <div className="w-full">
      {/* Timeline Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {journeyData.member.name}'s Health Journey
        </h2>
        <p className="text-gray-600">
          8-month transformation from pre-hypertension to optimal health
        </p>
      </div>

      {/* Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {timelineMonths.map((monthData) => (
          <MonthCard
            key={monthData.month}
            monthData={monthData}
            isSelected={selectedMonth === monthData.month}
            onClick={() => handleMonthClick(monthData.month)}
          />
        ))}
      </div>

      {/* Progress Overview */}
      <ProgressOverview 
        startBiomarkers={timelineMonths[0]?.biomarkers}
        endBiomarkers={timelineMonths[7]?.biomarkers}
      />
    </div>
  );
}

interface MonthCardProps {
  monthData: TimelineMonth;
  isSelected: boolean;
  onClick: () => void;
}

function MonthCard({ monthData, isSelected, onClick }: MonthCardProps) {
  const { month, biomarkers, messages, events, agent_activity, adherence_rate } = monthData;
  
  // Parse biomarkers for display
  const bp = biomarkers.blood_pressure?.split('/') || ['--', '--'];
  const weight = biomarkers.weight?.replace('kg', '') || '--';
  const stress = biomarkers.stress_level?.split('/')[0] || '--';

  // Count message types
  const memberMessages = messages.filter(m => m.context_data.is_member_initiated).length;
  const agentMessages = messages.length - memberMessages;

  // Get most active agent
  const mostActiveAgent = Object.entries(agent_activity)
    .sort(([,a], [,b]) => b - a)[0];

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Month {month}
          </span>
          <Badge variant={getAdherenceVariant(adherence_rate)}>
            {Math.round(adherence_rate * 100)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Key Biomarkers */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-500" />
            <span className="text-gray-600">BP:</span>
            <span className="font-medium">{bp[0]}/{bp[1]}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-green-500" />
            <span className="text-gray-600">Weight:</span>
            <span className="font-medium">{weight}kg</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-orange-500" />
            <span className="text-gray-600">Stress:</span>
            <span className="font-medium">{stress}/10</span>
          </div>
        </div>

        {/* Message Activity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              Messages
            </span>
            <span className="font-medium">{messages.length}</span>
          </div>
          <div className="flex gap-1 text-xs">
            <Badge variant="outline" className="text-blue-600">
              {memberMessages} from Rohan
            </Badge>
            <Badge variant="outline" className="text-gray-600">
              {agentMessages} responses
            </Badge>
          </div>
        </div>

        {/* Most Active Agent */}
        {mostActiveAgent && (
          <div className="text-xs">
            <span className="text-gray-600">Most active: </span>
            <span 
              className="font-medium"
              style={{ color: AGENT_COLORS[mostActiveAgent[0] as keyof typeof AGENT_COLORS] }}
            >
              {mostActiveAgent[0]} ({mostActiveAgent[1]})
            </span>
          </div>
        )}

        {/* Events */}
        {events.length > 0 && (
          <div className="space-y-1">
            {events.map((event, idx) => (
              <div key={idx} className="flex items-center gap-1 text-xs">
                <Stethoscope className="w-3 h-3 text-blue-500" />
                <span className="text-gray-600 truncate">{event.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Adherence Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Plan Adherence</span>
            <span>{Math.round(adherence_rate * 100)}%</span>
          </div>
          <Progress value={adherence_rate * 100} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressOverview({ startBiomarkers, endBiomarkers }: {
  startBiomarkers?: any;
  endBiomarkers?: any;
}) {
  if (!startBiomarkers || !endBiomarkers) return null;

  const improvements = [
    {
      label: 'Blood Pressure',
      start: startBiomarkers.blood_pressure,
      end: endBiomarkers.blood_pressure,
      icon: Heart,
      color: 'text-red-500'
    },
    {
      label: 'Weight',
      start: startBiomarkers.weight,
      end: endBiomarkers.weight,
      icon: Activity,
      color: 'text-green-500'
    },
    {
      label: 'Stress Level',
      start: startBiomarkers.stress_level,
      end: endBiomarkers.stress_level,
      icon: TrendingUp,
      color: 'text-orange-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Health Transformation Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {improvements.map((item, idx) => (
            <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg">
              <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
              <h3 className="font-medium text-gray-900 mb-1">{item.label}</h3>
              <div className="text-sm space-y-1">
                <div className="text-gray-600">Start: <span className="font-medium">{item.start}</span></div>
                <div className="text-gray-600">End: <span className="font-medium text-green-600">{item.end}</span></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getAdherenceVariant(rate: number): "default" | "secondary" | "destructive" | "outline" {
  if (rate >= 0.7) return "default";
  if (rate >= 0.5) return "secondary";
  return "destructive";
}