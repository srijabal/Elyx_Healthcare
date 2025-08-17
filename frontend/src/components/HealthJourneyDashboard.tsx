"use client"

import type React from "react"
import { useState } from "react"
import { TimelineView } from "@/components/Timeline/TimelineView"
import { ChatInterface } from "@/components/Chat/ChatInterface"
import { useJourneyData } from "@/hooks/useJourneyData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Activity,
  Brain,
  Calendar,
  MessageCircle,
  Users,
  MapPin,
  Target,
  FileText,
  Eye,
  BarChart3,
  Stethoscope,
  Sparkles,
  AlertCircle,
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { BiomarkerChart } from "@/components/Charts/BiomarkerChart"
import { DecisionDrillDownModal } from "@/components/Modals/DecisionDrillDownModal"
import { useTheme } from "@/components/providers/ThemeProvider"

export default function HealthJourneyDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<number>()
  const [showTraceability, setShowTraceability] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null)
  const [showDecisionDrillDown, setShowDecisionDrillDown] = useState<string | null>(null)
  const [selectedBiomarker, setSelectedBiomarker] = useState<string>("blood_pressure_sys")
  const { theme, setTheme } = useTheme()

  // Use the member ID with properly distributed timestamps and agent balance
  const MEMBER_ID = "281dc042-1c62-4c51-8ec3-462e87640ef9"
  const { data: journeyData, isLoading, error } = useJourneyData(MEMBER_ID)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary/20 border-t-primary mx-auto shadow-lg"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-2xl font-bold text-foreground">Loading Health Journey</p>
            <p className="text-muted-foreground text-lg">Preparing Rohan's transformation data...</p>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-lg shadow-strong border border-destructive/20">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive text-2xl font-bold">
              Connection Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground leading-relaxed text-lg">Unable to load the health journey data. Using demo data instead.</p>
            <p className="text-sm text-muted-foreground">Make sure the backend API is running on port 8000.</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              className="w-full h-12 text-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!journeyData) {
    return null
  }

  // Get biomarkers for selected month from real journey data
  const getMonthBiomarkers = (month: number) => {
    const journeyState = journeyData.journey_states?.find((js) => js.month === month)
    if (!journeyState?.biomarkers) return null

    // Map biomarkers to display format
    const bio = journeyState.biomarkers
    return {
      weight: bio.weight || "N/A",
      bp: bio.blood_pressure || "N/A",
      stress: bio.stress_level || "N/A",
      sleep: bio.sleep_average || "N/A",
      adherence: bio.adherence_this_month || "N/A",
      body_fat: bio.body_fat || "N/A",
      heart_rate: bio.resting_heart_rate || "N/A",
    }
  }

  // Get quarterly diagnostic report from real health events data
  const getQuarterlyReport = (month: number) => {
    if (!journeyData.health_events) return null

    // Find health event for this month (events are stored for months 3 and 6)
    const healthEvent = journeyData.health_events.find((event) => {
      const eventDate = new Date(event.event_date)
      const eventMonth = eventDate.getMonth() + 1 // Convert to 1-based month
      return eventMonth === month
    })

    if (!healthEvent) return null

    // Extract highlights from results
    const highlights = Object.entries(healthEvent.results).map(([key, value]) => `${key.replace("_", " ")}: ${value}`)

    return {
      title: healthEvent.description,
      date: new Date(healthEvent.event_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      highlights: highlights,
      concerns: [], // Real simulation doesn't have concerns field
    }
  }

  // Show traceability for agent decisions
  const showTraceabilityModal = (message: any) => {
    setSelectedMessage(message)
    setShowTraceability(message.id)
  }

  // Show decision drill-down modal
  const showDecisionDrillDownModal = (message: any) => {
    setSelectedMessage(message)
    setShowDecisionDrillDown(message.id)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                Rohan's Health Journey
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm font-medium">
                <Heart className="w-4 h-4 text-chart-1" />
                Pre-hypertension → Normal
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-chart-2" />
                8 Months Journey
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm font-medium">
                <MessageCircle className="w-4 h-4 text-chart-3" />
                {journeyData.messages.length} Messages
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="ml-2 shadow-sm"
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Enhanced Spacing */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Enhanced Key Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          <StatCard
            icon={Heart}
            label="Blood Pressure"
            value="138/88 → 115/72"
            status="improvement"
            subtitle="Pre-hypertensive → Normal"
            trend="+23% improvement"
            trendIcon={TrendingUp}
          />
          <StatCard
            icon={Activity}
            label="Weight Loss"
            value="75kg → 71.5kg"
            status="improvement"
            subtitle="3.5kg reduction"
            trend="-4.7% body weight"
            trendIcon={TrendingDown}
          />
          <StatCard
            icon={Brain}
            label="Stress Level"
            value="8/10 → 3/10"
            status="improvement"
            subtitle="62% improvement"
            trend="Significant reduction"
            trendIcon={TrendingDown}
          />
        </div>

        {/* Enhanced Month Details Section */}
        {selectedMonth && (
          <div className="mb-12">
            <Card className="border border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-chart-1/5 shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-4 text-2xl font-bold">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  Month {selectedMonth} - Detailed Health Metrics
                  <Badge variant="outline" className="ml-auto px-4 py-2 text-sm font-medium">
                    {new Date(2024, selectedMonth - 1).toLocaleString("default", { month: "long" })} 2024
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Enhanced Biomarkers */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-xl flex items-center gap-3 text-foreground">
                      <Stethoscope className="w-6 h-6 text-chart-2" />
                      Biomarkers
                    </h4>
                    {getMonthBiomarkers(selectedMonth) && (
                      <div className="space-y-4">
                        {Object.entries(getMonthBiomarkers(selectedMonth)!).map(([key, value]) => {
                          const displayNames = {
                            weight: "Weight",
                            bp: "Blood Pressure",
                            stress: "Stress Level",
                            sleep: "Sleep Average",
                            adherence: "Plan Adherence",
                            body_fat: "Body Fat",
                            heart_rate: "Resting Heart Rate",
                          }
                          const displayName = displayNames[key as keyof typeof displayNames] || key

                          // Get trend indicator based on biomarker type
                          const getTrendIcon = (biomarkerKey: string, value: string) => {
                            if (biomarkerKey === 'weight' && value !== 'N/A') {
                              return <TrendingDown className="w-4 h-4 text-chart-3" />
                            }
                            if (biomarkerKey === 'stress' && value !== 'N/A') {
                              return <TrendingDown className="w-4 h-4 text-chart-3" />
                            }
                            if (biomarkerKey === 'adherence' && value !== 'N/A') {
                              return <TrendingUp className="w-4 h-4 text-chart-4" />
                            }
                            return null
                          }

                          return (
                            <div
                              key={key}
                              className="flex justify-between items-center p-6 bg-muted/20 rounded-xl border border-border/20 shadow-sm hover:shadow-lg transition-all duration-300 group"
                            >
                              <div className="flex items-center gap-3">
                                {getTrendIcon(key, value)}
                                <span className="font-semibold text-foreground text-lg">{displayName}:</span>
                              </div>
                              <span className="font-bold text-primary text-xl group-hover:text-primary/80 transition-colors">{value}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Enhanced Health Reports */}
                  <div className="space-y-6">
                    <h4 className="font-bold text-xl flex items-center gap-3 text-foreground">
                      <FileText className="w-6 h-6 text-chart-3" />
                      Health Reports
                    </h4>
                    {getQuarterlyReport(selectedMonth) ? (
                      <div className="space-y-4">
                        <Card className="border-l-4 border-l-chart-2 bg-chart-2/5 shadow-lg">
                          <CardContent className="p-6">
                            <h5 className="font-bold text-foreground text-lg mb-3">
                              {getQuarterlyReport(selectedMonth)!.title}
                            </h5>
                            <p className="text-muted-foreground mb-4 font-medium">
                              {getQuarterlyReport(selectedMonth)!.date}
                            </p>
                            <div className="space-y-3">
                              {getQuarterlyReport(selectedMonth)!.highlights.map((highlight, idx) => (
                                <p key={idx} className="text-foreground flex items-start gap-3 leading-relaxed">
                                  <div className="w-2 h-2 rounded-full bg-chart-4 mt-2 flex-shrink-0"></div>
                                  <span className="text-base">{highlight}</span>
                                </p>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="p-12 text-center text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed border-border">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No diagnostic report for this month</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Enhanced Timeline Section */}
          <div className="xl:col-span-2 space-y-12">
            <Card className="shadow-lg border border-border/50">
              <CardHeader className="space-y-6 pb-6">
                <CardTitle className="flex items-center gap-4 text-2xl font-bold">
                  <div className="w-10 h-10 rounded-xl bg-chart-1/10 flex items-center justify-center shadow-sm">
                    <Calendar className="w-6 h-6 text-chart-1" />
                  </div>
                  Health Journey Timeline
                  {selectedMonth && (
                    <Badge variant="default" className="ml-auto px-4 py-2 text-sm font-medium">
                      Month {selectedMonth}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={selectedMonth === undefined ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMonth(undefined)}
                    className="h-10 px-6 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    All Months
                  </Button>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((month) => (
                    <Button
                      key={month}
                      variant={selectedMonth === month ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedMonth(month)}
                      className={`h-10 w-12 p-0 font-bold text-lg transition-all duration-200 ${
                        selectedMonth === month 
                          ? 'shadow-lg scale-105' 
                          : 'hover:scale-105 hover:shadow-md'
                      }`}
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

            {/* Enhanced Biomarker Progress Chart */}
            <BiomarkerChart
              journeyStates={journeyData.journey_states || []}
              selectedBiomarker={selectedBiomarker}
              onBiomarkerChange={setSelectedBiomarker}
            />
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-8">
            <ChatInterface
              messages={journeyData.messages}
              selectedMonth={selectedMonth}
              onShowTraceability={showTraceabilityModal}
              onShowDecisionDrillDown={showDecisionDrillDownModal}
            />

            {/* Enhanced Agent Activity */}
            <Card className="shadow-lg border border-border/50">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center shadow-sm">
                    <Users className="w-5 h-5 text-chart-3" />
                  </div>
                  AI Agent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {journeyData.agents.map((agent) => {
                  const messageCount = journeyData.messages.filter((m) => m.agent_name === agent.name).length

                  return (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border border-border/20 shadow-sm hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="space-y-2">
                        <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{agent.name}</p>
                        <p className="text-sm text-muted-foreground font-medium">{agent.role}</p>
                      </div>
                      <Badge variant="secondary" className="font-bold px-4 py-2 text-lg shadow-sm group-hover:shadow-md transition-all duration-200">
                        {messageCount}
                      </Badge>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Enhanced Member Profile */}
            <Card className="shadow-lg border border-border/50">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="w-8 h-8 rounded-lg bg-chart-4/10 flex items-center justify-center shadow-sm">
                    <Target className="w-5 h-5 text-chart-4" />
                  </div>
                  Member Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/20 shadow-sm hover:shadow-md transition-all duration-200">
                    <span className="text-muted-foreground font-semibold">Name:</span>
                    <span className="font-bold text-foreground text-lg">{journeyData.member.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/20 shadow-sm hover:shadow-md transition-all duration-200">
                    <span className="text-muted-foreground font-semibold">Age:</span>
                    <span className="font-bold text-foreground text-lg">{journeyData.member.age}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/20 shadow-sm hover:shadow-md transition-all duration-200">
                    <span className="text-muted-foreground font-semibold">Occupation:</span>
                    <span className="font-bold text-foreground text-right max-w-32 truncate text-lg">
                      {journeyData.member.occupation}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/20 shadow-sm hover:shadow-md transition-all duration-200">
                    <span className="text-muted-foreground flex items-center gap-2 font-semibold">
                      <MapPin className="w-4 h-4" />
                      Location:
                    </span>
                    <span className="font-bold text-foreground text-lg">{journeyData.member.location}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50">
                  <p className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-chart-4" />
                    Health Goals:
                  </p>
                  <div className="space-y-3">
                    {journeyData.member.health_goals.slice(0, 2).map((goal, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-gradient-to-r from-chart-4/10 to-chart-4/5 rounded-xl border border-chart-4/20 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="w-3 h-3 rounded-full bg-chart-4 mt-2 flex-shrink-0 shadow-sm"></div>
                        <p className="text-foreground leading-relaxed font-semibold">{goal}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Enhanced Traceability Modal */}
      {showTraceability && selectedMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border/50">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <Eye className="w-6 h-6 text-primary" />
                  AI Decision Traceability
                </h3>
                <button 
                  onClick={() => setShowTraceability(null)} 
                  className="text-muted-foreground hover:text-foreground text-2xl transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-8">
                {/* Enhanced Message Details */}
                <div className="border border-border/50 rounded-xl p-6 bg-muted/20">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                      {selectedMessage.agent_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-foreground text-lg">{selectedMessage.agent_name}</span>
                        <Badge variant="outline" className="font-medium">
                          {selectedMessage.agent_role}
                        </Badge>
                      </div>
                      <p className="text-foreground text-base leading-relaxed">{selectedMessage.content}</p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Health Impact Analysis */}
                <div className="space-y-6">
                  <h4 className="font-bold text-xl text-foreground">Health Impact & Decision Traceability:</h4>

                  <div className="space-y-4">
                    {/* Current Health Status */}
                    <div className="flex items-start gap-4 p-6 border-l-4 border-primary bg-primary/5 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">
                        📊
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-lg mb-2">
                          Health Context (Month {selectedMessage.context_data?.month})
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          {(() => {
                            const monthBio = getMonthBiomarkers(selectedMessage.context_data?.month)
                            if (!monthBio) return "Biomarker data not available"
                            return `BP: ${monthBio.bp} | Weight: ${monthBio.weight} | Sleep: ${monthBio.sleep} | Stress: ${monthBio.stress}`
                          })()}
                        </p>
                      </div>
                    </div>

                    {/* Decision Rationale */}
                    <div className="flex items-start gap-4 p-6 border-l-4 border-chart-3 bg-chart-3/5 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-chart-3 text-white text-sm flex items-center justify-center font-bold">
                        🧠
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-lg mb-2">AI Decision Rationale</p>
                        <p className="text-muted-foreground leading-relaxed">
                          {selectedMessage.agent_name} ({selectedMessage.agent_role}) provided targeted guidance based
                          on{" "}
                          {selectedMessage.message_type === "agent_response"
                            ? "specific member question and current health metrics"
                            : selectedMessage.message_type === "proactive_check_in"
                              ? "proactive monitoring protocol and biomarker trends"
                              : "routine care coordination and member progress"}
                        </p>
                      </div>
                    </div>

                    {/* Expected Health Outcome */}
                    <div className="flex items-start gap-4 p-6 border-l-4 border-chart-4 bg-chart-4/5 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-chart-4 text-white text-sm flex items-center justify-center font-bold">
                        🎯
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-lg mb-2">Expected Health Impact</p>
                        <p className="text-muted-foreground leading-relaxed">
                          {(() => {
                            const currentMonth = selectedMessage.context_data?.month
                            const nextMonth = currentMonth + 1
                            const currentBio = getMonthBiomarkers(currentMonth)
                            const nextBio = getMonthBiomarkers(nextMonth)

                            if (!currentBio || !nextBio) {
                              return "This intervention supports continued progress toward normalized blood pressure and improved metabolic health."
                            }

                            const improvements = []
                            if (Number.parseFloat(currentBio.weight) > Number.parseFloat(nextBio.weight)) {
                              improvements.push(`Weight reduction (${currentBio.weight} → ${nextBio.weight})`)
                            }
                            const currentBP = currentBio.bp.split("/")[0]
                            const nextBP = nextBio.bp.split("/")[0]
                            if (Number.parseInt(currentBP) > Number.parseInt(nextBP)) {
                              improvements.push(`BP improvement (${currentBio.bp} → ${nextBio.bp})`)
                            }

                            return improvements.length > 0
                              ? `Achieved: ${improvements.join(", ")}`
                              : "Contributed to ongoing health maintenance and goal achievement"
                          })()}
                        </p>
                      </div>
                    </div>

                    {/* Long-term Journey Impact */}
                    <div className="flex items-start gap-4 p-6 border-l-4 border-chart-2 bg-chart-2/5 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-chart-2 text-white text-sm flex items-center justify-center font-bold">
                        📈
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-lg mb-2">Journey Contribution</p>
                        <p className="text-muted-foreground leading-relaxed">
                          Part of comprehensive 8-month transformation: Pre-hypertension (138/88) → Normal BP (117/74),
                          75kg → 72.2kg weight loss, and stress reduction from 8/10 to 3/10
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Technical Details */}
                  <div className="mt-8 p-6 bg-muted/20 rounded-xl border border-border/50">
                    <h5 className="font-bold text-foreground text-lg mb-4">Technical Details:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <span className="text-muted-foreground font-medium">Message ID:</span>
                        <p className="font-mono text-sm bg-muted/50 p-2 rounded-lg">{selectedMessage.id}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-muted-foreground font-medium">Timestamp:</span>
                        <p className="font-medium">{new Date(selectedMessage.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-muted-foreground font-medium">Message Type:</span>
                        <p className="font-medium capitalize">{selectedMessage.message_type?.replace("_", " ")}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-muted-foreground font-medium">Journey Day:</span>
                        <p className="font-medium">
                          Month {selectedMessage.context_data?.month}, Day {selectedMessage.context_data?.day}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decision Drill-Down Modal */}
      {showDecisionDrillDown && selectedMessage && (
        <DecisionDrillDownModal
          message={selectedMessage}
          journeyStates={journeyData.journey_states || []}
          onClose={() => setShowDecisionDrillDown(null)}
        />
      )}
    </div>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  status: "improvement" | "concern" | "neutral"
  subtitle?: string
  trend?: string
  trendIcon?: React.ComponentType<{ className?: string }>
}

function StatCard({ icon: Icon, label, value, status, subtitle, trend, trendIcon: TrendIcon }: StatCardProps) {
  const statusConfig = {
    improvement: {
      bg: "bg-card",
      border: "border-chart-4/20",
      icon: "text-chart-4",
      iconBg: "bg-chart-4/10",
      text: "text-foreground",
      trend: "text-chart-4",
    },
    concern: {
      bg: "bg-card",
      border: "border-destructive/20",
      icon: "text-destructive",
      iconBg: "bg-destructive/10",
      text: "text-foreground",
      trend: "text-destructive",
    },
    neutral: {
      bg: "bg-card",
      border: "border-chart-2/20",
      icon: "text-chart-2",
      iconBg: "bg-chart-2/10",
      text: "text-foreground",
      trend: "text-chart-2",
    },
  }

  const config = statusConfig[status]

  return (
    <Card className={`${config.bg} ${config.border} border shadow-sm hover:shadow-md transition-all duration-200 h-full`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${config.icon}`} />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className={`text-xl font-bold ${config.text} leading-tight`}>{value}</p>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            {trend && TrendIcon && (
              <div className="flex items-center gap-2">
                <TrendIcon className={`w-4 h-4 ${config.trend}`} />
                <p className={`text-sm font-medium ${config.trend}`}>{trend}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
