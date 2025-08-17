"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useTimeline } from "@/hooks/useTimeline"
import { type JourneyData, type TimelineMonth, AGENT_COLORS } from "@/services/types"
import { Calendar, Heart, Activity, TrendingUp, MessageCircle, Stethoscope } from "lucide-react"

interface TimelineViewProps {
  journeyData: JourneyData
  onMonthSelect?: (month: number) => void
  selectedMonth?: number
}

export function TimelineView({ journeyData, onMonthSelect, selectedMonth }: TimelineViewProps) {
  const timelineMonths = useTimeline(journeyData)

  const handleMonthClick = (month: number) => {
    onMonthSelect?.(month)
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{journeyData.member.name}'s Health Journey</h2>
        <p className="text-muted-foreground">8-month transformation from pre-hypertension to optimal health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
      <ProgressOverview startBiomarkers={timelineMonths[0]?.biomarkers} endBiomarkers={timelineMonths[7]?.biomarkers} />
    </div>
  )
}

interface MonthCardProps {
  monthData: TimelineMonth
  isSelected: boolean
  onClick: () => void
}

function MonthCard({ monthData, isSelected, onClick }: MonthCardProps) {
  const { month, biomarkers, messages, events, agent_activity, adherence_rate } = monthData

  // Parse biomarkers for display
  const bp = biomarkers.blood_pressure?.split("/") || ["--", "--"]
  const weight = biomarkers.weight?.replace("kg", "") || "--"
  const stress = biomarkers.stress_level?.split("/")[0] || "--"

  // Count message types
  const memberMessages = messages.filter((m) => m.context_data?.is_member_initiated).length
  const agentMessages = messages.length - memberMessages

  // Get most active agent
  const mostActiveAgent = Object.entries(agent_activity).sort(([, a], [, b]) => b - a)[0]

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        isSelected
          ? "ring-2 ring-primary bg-gradient-to-br from-primary/5 to-chart-1/5 border-primary/30"
          : "hover:bg-muted/30 border-border"
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2 text-foreground">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Calendar className="w-3 h-3 text-primary" />
            </div>
            Month {month}
          </span>
          <Badge variant={getAdherenceVariant(adherence_rate)} className="text-xs">
            {Math.round(adherence_rate * 100)}%
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
            <Heart className="w-3 h-3 text-chart-1" />
            <div>
              <span className="text-muted-foreground text-xs block">BP</span>
              <span className="font-medium text-foreground">
                {bp[0]}/{bp[1]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
            <Activity className="w-3 h-3 text-chart-4" />
            <div>
              <span className="text-muted-foreground text-xs block">Weight</span>
              <span className="font-medium text-foreground">{weight}kg</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 col-span-2">
            <TrendingUp className="w-3 h-3 text-chart-3" />
            <div>
              <span className="text-muted-foreground text-xs">Stress Level</span>
              <span className="font-medium text-foreground ml-2">{stress}/10</span>
            </div>
          </div>
        </div>

        {/* Message Activity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              Messages
            </span>
            <span className="font-medium text-foreground">{messages.length}</span>
          </div>
          <div className="flex gap-1 text-xs">
            <Badge variant="outline" className="text-chart-2 border-chart-2/30">
              {memberMessages} from Rohan
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              {agentMessages} responses
            </Badge>
          </div>
        </div>

        {/* Most Active Agent */}
        {mostActiveAgent && (
          <div className="text-xs p-2 rounded-md bg-muted/20 border border-border/50">
            <span className="text-muted-foreground">Most active: </span>
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
            {events.slice(0, 2).map((event, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs p-2 rounded-md bg-chart-2/10">
                <Stethoscope className="w-3 h-3 text-chart-2 flex-shrink-0" />
                <span className="text-foreground truncate">{event.description}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Plan Adherence</span>
            <span className="font-medium text-foreground">{Math.round(adherence_rate * 100)}%</span>
          </div>
          <Progress value={adherence_rate * 100} className="h-2 bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

function ProgressOverview({
  startBiomarkers,
  endBiomarkers,
}: {
  startBiomarkers?: any
  endBiomarkers?: any
}) {
  if (!startBiomarkers || !endBiomarkers) return null

  const improvements = [
    {
      label: "Blood Pressure",
      start: startBiomarkers.blood_pressure,
      end: endBiomarkers.blood_pressure,
      icon: Heart,
      color: "text-chart-1",
    },
    {
      label: "Weight",
      start: startBiomarkers.weight,
      end: endBiomarkers.weight,
      icon: Activity,
      color: "text-chart-4",
    },
    {
      label: "Stress Level",
      start: startBiomarkers.stress_level,
      end: endBiomarkers.stress_level,
      icon: TrendingUp,
      color: "text-chart-3",
    },
  ]

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-chart-4/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-chart-4" />
          </div>
          Health Transformation Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {improvements.map((item, idx) => (
            <div
              key={idx}
              className="text-center p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border/50"
            >
              <div className="w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center mx-auto mb-4">
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-3">{item.label}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Start:</span>
                  <span className="font-medium text-foreground">{item.start}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">End:</span>
                  <span className="font-medium text-chart-4">{item.end}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function getAdherenceVariant(rate: number): "default" | "secondary" | "destructive" | "outline" {
  if (rate >= 0.7) return "default"
  if (rate >= 0.5) return "secondary"
  return "destructive"
}
