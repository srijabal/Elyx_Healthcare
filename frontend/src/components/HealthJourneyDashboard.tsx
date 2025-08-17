'use client';

import React, { useState } from 'react';
import { TimelineView } from '@/components/Timeline/TimelineView';
import { ChatInterface } from '@/components/Chat/ChatInterface';
import { useJourneyData } from '@/hooks/useJourneyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Activity, 
  Brain, 
  Calendar, 
  MessageCircle,
  Users,
  TrendingUp,
  MapPin,
  Clock,
  Target,
  FileText,
  Eye,
  BarChart3,
  Stethoscope,
  TrendingDown,
  ArrowRight
} from 'lucide-react';

export default function HealthJourneyDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<number>();
  const [showTraceability, setShowTraceability] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  // Use the new member ID with real AI conversations and proper timeline
  const MEMBER_ID = "281dc042-1c62-4c51-8ec3-462e87640ef9";
  const { data: journeyData, isLoading, error } = useJourneyData(MEMBER_ID);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Rohan's health journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Unable to load the health journey data. Using demo data instead.
            </p>
            <p className="text-sm text-gray-500">
              Make sure the backend API is running on port 8000.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!journeyData) {
    return null;
  }

  // Get biomarkers for selected month from real journey data
  const getMonthBiomarkers = (month: number) => {
    const journeyState = journeyData.journey_states?.find(js => js.month === month);
    if (!journeyState?.biomarkers) return null;
    
    // Map biomarkers to display format
    const bio = journeyState.biomarkers;
    return {
      weight: bio.weight || 'N/A',
      bp: bio.blood_pressure || 'N/A', 
      stress: bio.stress_level || 'N/A',
      sleep: bio.sleep_average || 'N/A',
      adherence: bio.adherence_this_month || 'N/A',
      body_fat: bio.body_fat || 'N/A',
      heart_rate: bio.resting_heart_rate || 'N/A'
    };
  };

  // Get quarterly diagnostic report from real health events data
  const getQuarterlyReport = (month: number) => {
    if (!journeyData.health_events) return null;
    
    // Find health event for this month (events are stored for months 3 and 6)
    const healthEvent = journeyData.health_events.find(event => {
      const eventDate = new Date(event.event_date);
      const eventMonth = eventDate.getMonth() + 1; // Convert to 1-based month
      return eventMonth === month;
    });
    
    if (!healthEvent) return null;
    
    // Extract highlights from results
    const highlights = Object.entries(healthEvent.results).map(([key, value]) => 
      `${key.replace('_', ' ')}: ${value}`
    );
    
    return {
      title: healthEvent.description,
      date: new Date(healthEvent.event_date).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      }),
      highlights: highlights,
      concerns: [] // Real simulation doesn't have concerns field
    };
  };

  // Show traceability for agent decisions
  const showTraceabilityModal = (message: any) => {
    setSelectedMessage(message);
    setShowTraceability(message.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Elyx Health Journey
              </h1>
              <p className="text-gray-600">
                AI-Powered Health Transformation System
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                Pre-hypertension → Normal
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                8 Months
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {journeyData.messages.length} Messages
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={Heart}
            label="Blood Pressure"
            value="138/88 → 115/72"
            status="improvement"
            subtitle="Pre-hypertensive → Normal"
          />
          <StatCard
            icon={Activity}
            label="Weight Loss"
            value="75kg → 71.5kg"
            status="improvement"
            subtitle="3.5kg reduction"
          />
          <StatCard
            icon={Brain}
            label="Stress Level"
            value="8/10 → 3/10"
            status="improvement"
            subtitle="62% improvement"
          />
          <StatCard
            icon={Users}
            label="AI Agents"
            value={`${journeyData.agents.length} Specialists`}
            status="neutral"
            subtitle="24/7 health support"
          />
        </div>

        {/* Selected Month Details */}
        {selectedMonth && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Month {selectedMonth} - Detailed Health Metrics
                  <Badge variant="outline">
                    {new Date(2024, selectedMonth - 1).toLocaleString('default', { month: 'long' })} 2024
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Biomarkers */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      Biomarkers
                    </h4>
                    {getMonthBiomarkers(selectedMonth) && (
                      <div className="space-y-3">
                        {Object.entries(getMonthBiomarkers(selectedMonth)!).map(([key, value]) => {
                          const displayNames = {
                            weight: 'Weight',
                            bp: 'Blood Pressure', 
                            stress: 'Stress Level',
                            sleep: 'Sleep Average',
                            adherence: 'Plan Adherence',
                            body_fat: 'Body Fat',
                            heart_rate: 'Resting Heart Rate'
                          };
                          const displayName = displayNames[key as keyof typeof displayNames] || key;
                          
                          return (
                            <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-700">
                                {displayName}:
                              </span>
                              <span className="font-semibold text-gray-900">{value}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Quarterly Report */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Health Reports
                    </h4>
                    {getQuarterlyReport(selectedMonth) ? (
                      <div className="space-y-3">
                        <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                          <h5 className="font-semibold text-blue-900">
                            {getQuarterlyReport(selectedMonth)!.title}
                          </h5>
                          <p className="text-sm text-blue-700 mb-2">
                            {getQuarterlyReport(selectedMonth)!.date}
                          </p>
                          <div className="space-y-1">
                            {getQuarterlyReport(selectedMonth)!.highlights.map((highlight, idx) => (
                              <p key={idx} className="text-sm text-green-700">
                                ✓ {highlight}
                              </p>
                            ))}
                            {getQuarterlyReport(selectedMonth)!.concerns.map((concern, idx) => (
                              <p key={idx} className="text-sm text-orange-700">
                                ⚠ {concern}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No diagnostic report for this month</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Timeline Section */}
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Health Journey Timeline
                  {selectedMonth && (
                    <Badge variant="secondary">Month {selectedMonth}</Badge>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMonth(undefined)}
                  >
                    All Months
                  </Button>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map(month => (
                    <Button
                      key={month}
                      variant={selectedMonth === month ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedMonth(month)}
                    >
                      {month}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <TimelineView
                  journeyData={journeyData}
                  onMonthSelect={setSelectedMonth}
                  selectedMonth={selectedMonth}
                />
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <div className="space-y-6">
            <ChatInterface
              messages={journeyData.messages}
              selectedMonth={selectedMonth}
              onShowTraceability={showTraceabilityModal}
            />

            {/* Agent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  AI Agent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {journeyData.agents.map(agent => {
                    const messageCount = journeyData.messages.filter(
                      m => m.agent_name === agent.name
                    ).length;
                    
                    return (
                      <div key={agent.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{agent.name}</p>
                          <p className="text-xs text-gray-600">{agent.role}</p>
                        </div>
                        <Badge variant="outline">
                          {messageCount} messages
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Member Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Member Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{journeyData.member.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{journeyData.member.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupation:</span>
                    <span className="font-medium text-right max-w-32 truncate">
                      {journeyData.member.occupation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Location:
                    </span>
                    <span className="font-medium">{journeyData.member.location}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 mb-2">Health Goals:</p>
                  <div className="space-y-1">
                    {journeyData.member.health_goals.slice(0, 2).map((goal, idx) => (
                      <p key={idx} className="text-xs text-gray-800 leading-relaxed">
                        • {goal}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Traceability Modal */}
      {showTraceability && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  AI Decision Traceability
                </h3>
                <button
                  onClick={() => setShowTraceability(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Message Details */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                      {selectedMessage.agent_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{selectedMessage.agent_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedMessage.agent_role}
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {selectedMessage.content}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Health Impact Analysis */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Health Impact & Decision Traceability:</h4>
                  
                  <div className="space-y-3">
                    {/* Current Health Status */}
                    <div className="flex items-start gap-3 p-3 border-l-4 border-blue-500 bg-blue-50">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold">📊</div>
                      <div>
                        <p className="font-medium text-blue-900">Health Context (Month {selectedMessage.context_data?.month})</p>
                        <p className="text-sm text-blue-700">
                          {(() => {
                            const monthBio = getMonthBiomarkers(selectedMessage.context_data?.month);
                            if (!monthBio) return "Biomarker data not available";
                            return `BP: ${monthBio.bp} | Weight: ${monthBio.weight} | Sleep: ${monthBio.sleep} | Stress: ${monthBio.stress}`;
                          })()}
                        </p>
                      </div>
                    </div>

                    {/* Decision Rationale */}
                    <div className="flex items-start gap-3 p-3 border-l-4 border-green-500 bg-green-50">
                      <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold">🧠</div>
                      <div>
                        <p className="font-medium text-green-900">AI Decision Rationale</p>
                        <p className="text-sm text-green-700">
                          {selectedMessage.agent_name} ({selectedMessage.agent_role}) provided targeted guidance based on {
                            selectedMessage.message_type === 'agent_response' ? 'specific member question and current health metrics' :
                            selectedMessage.message_type === 'proactive_check_in' ? 'proactive monitoring protocol and biomarker trends' :
                            'routine care coordination and member progress'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Expected Health Outcome */}
                    <div className="flex items-start gap-3 p-3 border-l-4 border-purple-500 bg-purple-50">
                      <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-semibold">🎯</div>
                      <div>
                        <p className="font-medium text-purple-900">Expected Health Impact</p>
                        <p className="text-sm text-purple-700">
                          {(() => {
                            const currentMonth = selectedMessage.context_data?.month;
                            const nextMonth = currentMonth + 1;
                            const currentBio = getMonthBiomarkers(currentMonth);
                            const nextBio = getMonthBiomarkers(nextMonth);
                            
                            if (!currentBio || !nextBio) {
                              return "This intervention supports continued progress toward normalized blood pressure and improved metabolic health.";
                            }
                            
                            const improvements = [];
                            if (parseFloat(currentBio.weight) > parseFloat(nextBio.weight)) {
                              improvements.push(`Weight reduction (${currentBio.weight} → ${nextBio.weight})`);
                            }
                            const currentBP = currentBio.bp.split('/')[0];
                            const nextBP = nextBio.bp.split('/')[0];
                            if (parseInt(currentBP) > parseInt(nextBP)) {
                              improvements.push(`BP improvement (${currentBio.bp} → ${nextBio.bp})`);
                            }
                            
                            return improvements.length > 0 
                              ? `Achieved: ${improvements.join(', ')}`
                              : "Contributed to ongoing health maintenance and goal achievement";
                          })()}
                        </p>
                      </div>
                    </div>

                    {/* Long-term Journey Impact */}
                    <div className="flex items-start gap-3 p-3 border-l-4 border-orange-500 bg-orange-50">
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-semibold">📈</div>
                      <div>
                        <p className="font-medium text-orange-900">Journey Contribution</p>
                        <p className="text-sm text-orange-700">
                          Part of comprehensive 8-month transformation: Pre-hypertension (138/88) → Normal BP (117/74), 
                          75kg → 72.2kg weight loss, and stress reduction from 8/10 to 3/10
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Technical Details:</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Message ID:</span>
                        <p className="font-mono text-xs">{selectedMessage.id}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Timestamp:</span>
                        <p>{new Date(selectedMessage.timestamp).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Message Type:</span>
                        <p className="capitalize">{selectedMessage.message_type?.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Journey Day:</span>
                        <p>Month {selectedMessage.context_data?.month}, Day {selectedMessage.context_data?.day}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  status: 'improvement' | 'concern' | 'neutral';
  subtitle?: string;
}

function StatCard({ icon: Icon, label, value, status, subtitle }: StatCardProps) {
  const statusColors = {
    improvement: 'text-green-600 bg-green-50 border-green-200',
    concern: 'text-orange-600 bg-orange-50 border-orange-200',
    neutral: 'text-blue-600 bg-blue-50 border-blue-200'
  };

  return (
    <Card className={`${statusColors[status]} min-h-[120px]`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Icon className="w-10 h-10 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium opacity-80 mb-1">{label}</p>
            <p className="text-xl font-bold mb-1 leading-tight">{value}</p>
            {subtitle && (
              <p className="text-xs opacity-70 leading-relaxed">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}