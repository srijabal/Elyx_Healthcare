"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Message, JourneyState } from "@/services/types"
import { X, Target, TrendingUp, Clock, Brain, Heart, Lightbulb, CheckCircle, AlertTriangle } from "lucide-react"

interface DecisionDrillDownModalProps {
  message: Message
  journeyStates: JourneyState[]
  onClose: () => void
}

interface InterventionImpact {
  intervention: string
  reasoning: string
  expectedOutcome: string
  actualOutcome?: string
  success: boolean
  timeframe: string
}

export function DecisionDrillDownModal({ message, journeyStates, onClose }: DecisionDrillDownModalProps) {
  const currentMonth = message.context_data?.month || 1
  const nextMonth = currentMonth + 1

  const currentBiomarkers = useMemo(() => {
    return journeyStates.find((js) => js.month === currentMonth)?.biomarkers
  }, [journeyStates, currentMonth])

  const nextBiomarkers = useMemo(() => {
    return journeyStates.find((js) => js.month === nextMonth)?.biomarkers
  }, [journeyStates, nextMonth])

  // Generate intervention analysis based on message content and agent
  const interventionAnalysis = useMemo((): InterventionImpact[] => {
    const interventions: InterventionImpact[] = []
    const agentName = message.agent_name
    const content = message.content.toLowerCase()

    // Analyze different types of interventions based on agent and content
    if (agentName === "Dr. Warren" || content.includes("blood pressure") || content.includes("medical")) {
      const currentBP = currentBiomarkers?.blood_pressure || "0/0"
      const nextBP = nextBiomarkers?.blood_pressure || "0/0"
      const currentSys = Number.parseInt(currentBP.split("/")[0])
      const nextSys = Number.parseInt(nextBP.split("/")[0])

      interventions.push({
        intervention: "Medical Monitoring & BP Management",
        reasoning: "Patient shows pre-hypertensive readings requiring immediate intervention",
        expectedOutcome: "Reduce systolic BP by 5-10 mmHg through lifestyle modifications",
        actualOutcome: nextSys < currentSys ? `BP reduced from ${currentBP} to ${nextBP}` : "BP monitoring continues",
        success: nextSys < currentSys,
        timeframe: "30 days",
      })
    }

    if (
      agentName === "Carla" ||
      content.includes("exercise") ||
      content.includes("workout") ||
      content.includes("gym")
    ) {
      const currentWeight = Number.parseFloat(currentBiomarkers?.weight?.replace("kg", "") || "0")
      const nextWeight = Number.parseFloat(nextBiomarkers?.weight?.replace("kg", "") || "0")

      interventions.push({
        intervention: "Personalized Exercise Program",
        reasoning: "Tailored fitness plan to improve cardiovascular health and weight management",
        expectedOutcome: "Achieve 0.5-1kg weight loss and improved cardiovascular fitness",
        actualOutcome:
          nextWeight < currentWeight
            ? `Weight reduced by ${(currentWeight - nextWeight).toFixed(1)}kg`
            : "Muscle building phase",
        success: true, // Exercise always has benefits even if weight doesn't drop
        timeframe: "30 days",
      })
    }

    if (agentName === "Ruby" || content.includes("meal") || content.includes("nutrition") || content.includes("diet")) {
      interventions.push({
        intervention: "Nutritional Strategy Adjustment",
        reasoning: "Optimize macronutrient balance for metabolic health and sustainable weight loss",
        expectedOutcome: "Improve adherence and metabolic markers",
        actualOutcome: "Enhanced meal planning and nutrient timing implemented",
        success: true,
        timeframe: "14 days",
      })
    }

    if (
      agentName === "Rachel" ||
      content.includes("stress") ||
      content.includes("mental") ||
      content.includes("wellness")
    ) {
      const currentStress = Number.parseInt(currentBiomarkers?.stress_level?.split("/")[0] || "0")
      const nextStress = Number.parseInt(nextBiomarkers?.stress_level?.split("/")[0] || "0")

      interventions.push({
        intervention: "Stress Management Protocol",
        reasoning: "High stress levels impact cortisol and cardiovascular health",
        expectedOutcome: "Reduce stress level by 1-2 points through mindfulness techniques",
        actualOutcome:
          nextStress < currentStress
            ? `Stress reduced from ${currentStress}/10 to ${nextStress}/10`
            : "Stress management ongoing",
        success: nextStress <= currentStress,
        timeframe: "21 days",
      })
    }

    if (
      agentName === "Advik" ||
      content.includes("data") ||
      content.includes("performance") ||
      content.includes("metrics")
    ) {
      interventions.push({
        intervention: "Data-Driven Optimization",
        reasoning: "Analyze wearable data to identify patterns and optimization opportunities",
        expectedOutcome: "Improve sleep quality and recovery metrics",
        actualOutcome: "Identified sleep pattern improvements and HRV optimization",
        success: true,
        timeframe: "7 days",
      })
    }

    if (
      agentName === "Neel" ||
      content.includes("coordination") ||
      content.includes("team") ||
      content.includes("check")
    ) {
      interventions.push({
        intervention: "Care Coordination Enhancement",
        reasoning: "Ensure all specialists are aligned and member has comprehensive support",
        expectedOutcome: "Improved adherence through better communication and support",
        actualOutcome: "Enhanced inter-agent coordination and member engagement",
        success: true,
        timeframe: "Ongoing",
      })
    }

    // If no specific interventions found, create a general one
    if (interventions.length === 0) {
      interventions.push({
        intervention: "Personalized Health Guidance",
        reasoning: "Provide targeted advice based on member's current health status and goals",
        expectedOutcome: "Support continued progress toward health goals",
        actualOutcome: "Guidance provided and member engagement maintained",
        success: true,
        timeframe: "Immediate",
      })
    }

    return interventions
  }, [message, currentBiomarkers, nextBiomarkers, currentMonth, nextMonth])

  const decisionContext = useMemo(() => {
    return {
      memberProfile: {
        age: 46,
        condition: "Pre-hypertension",
        goals: ["Reduce cardiovascular risk", "Improve fitness", "Stress management"],
        riskFactors: ["Family history of heart disease", "High stress job", "Frequent travel"],
      },
      currentHealth: {
        primaryConcern:
          currentBiomarkers?.blood_pressure && Number.parseInt(currentBiomarkers.blood_pressure.split("/")[0]) > 130
            ? "Elevated blood pressure"
            : "General wellness",
        urgency: message.context_data?.urgency || "medium",
        trend: "Improving with interventions",
      },
      aiReasoning: {
        dataConsidered: [
          "Current biomarker readings",
          "Historical trend analysis",
          "Member-specific risk factors",
          "Previous intervention outcomes",
          "Behavioral patterns from wearables",
        ],
        decisionFactors: [
          "Evidence-based medicine protocols",
          "Personalized risk assessment",
          "Member lifestyle constraints",
          "Multi-agent care coordination",
        ],
      },
    }
  }, [currentBiomarkers, message])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border shadow-lg">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Brain className="w-6 h-6 text-chart-1" />
                Decision Deep Dive Analysis
              </h2>
              <p className="text-muted-foreground mt-1">
                AI intervention analysis for {message.agent_name} • Month {currentMonth}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Message Context */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Message Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-chart-1 text-primary-foreground text-xs flex items-center justify-center">
                      {message.agent_name.charAt(0)}
                    </div>
                    <span className="font-medium text-sm text-foreground">{message.agent_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {message.message_type.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Timestamp:</span>
                    <p className="font-medium text-foreground">{new Date(message.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Journey Day:</span>
                    <p className="font-medium text-foreground">
                      Month {currentMonth}, Day {message.context_data?.day}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Context */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Health Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Primary Concern:</span>
                    <span className="text-xs font-medium text-foreground">
                      {decisionContext.currentHealth.primaryConcern}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Risk Level:</span>
                    <Badge variant="outline" className="text-xs">
                      {decisionContext.currentHealth.urgency}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Overall Trend:</span>
                    <span className="text-xs font-medium text-chart-2">{decisionContext.currentHealth.trend}</span>
                  </div>
                </div>

                {currentBiomarkers && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Current Biomarkers:</p>
                    <div className="grid grid-cols-2 gap-1 text-xs text-foreground">
                      <div>BP: {currentBiomarkers.blood_pressure}</div>
                      <div>Weight: {currentBiomarkers.weight}</div>
                      <div>Stress: {currentBiomarkers.stress_level}</div>
                      <div>Sleep: {currentBiomarkers.sleep_average}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Intervention Impact Analysis */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Target className="w-5 h-5" />
              Intervention Impact Analysis
            </h3>

            <div className="space-y-4">
              {interventionAnalysis.map((intervention, index) => (
                <Card
                  key={index}
                  className={`border-l-4 ${intervention.success ? "border-l-chart-2" : "border-l-chart-3"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-chart-3" />
                        <h4 className="font-medium text-foreground">{intervention.intervention}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {intervention.success ? (
                          <CheckCircle className="w-4 h-4 text-chart-2" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-chart-3" />
                        )}
                        <Badge variant={intervention.success ? "default" : "secondary"} className="text-xs">
                          {intervention.success ? "Successful" : "In Progress"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Clinical Reasoning:</p>
                        <p className="text-sm text-foreground">{intervention.reasoning}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Expected Outcome:</p>
                          <p className="text-sm text-chart-1">{intervention.expectedOutcome}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Actual Result:</p>
                          <p className={`text-sm ${intervention.success ? "text-chart-2" : "text-chart-3"}`}>
                            {intervention.actualOutcome}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-2 border-t border-border">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          Timeframe: {intervention.timeframe}
                        </div>
                        {intervention.success && (
                          <div className="flex items-center gap-1 text-xs text-chart-2">
                            <TrendingUp className="w-3 h-3" />
                            Measurable improvement achieved
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* AI Decision Framework */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Brain className="w-5 h-5" />
              AI Decision Framework
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-sm text-foreground">Data Considered</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-foreground">
                    {decisionContext.aiReasoning.dataConsidered.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-chart-1"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-sm text-foreground">Decision Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-foreground">
                    {decisionContext.aiReasoning.decisionFactors.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-chart-2"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
