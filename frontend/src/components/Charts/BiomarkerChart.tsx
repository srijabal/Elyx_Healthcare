"use client"

import { useMemo } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { JourneyState } from "@/services/types"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"

interface BiomarkerChartProps {
  journeyStates: JourneyState[]
  selectedBiomarker: string
  onBiomarkerChange: (biomarker: string) => void
}

interface ChartDataPoint {
  month: number
  value: number
  unit: string
  label: string
  rawValue: string
}

export function BiomarkerChart({ journeyStates, selectedBiomarker, onBiomarkerChange }: BiomarkerChartProps) {
  const biomarkerOptions = [
    { key: "blood_pressure_sys", label: "Blood Pressure (Systolic)", unit: "mmHg", color: "hsl(var(--chart-1))" },
    { key: "weight", label: "Weight", unit: "kg", color: "hsl(var(--chart-2))" },
    { key: "stress_level", label: "Stress Level", unit: "/10", color: "hsl(var(--chart-3))" },
    { key: "sleep_hours", label: "Sleep Average", unit: "hours", color: "hsl(var(--chart-4))" },
    { key: "adherence", label: "Plan Adherence", unit: "%", color: "hsl(var(--chart-5))" },
    { key: "body_fat", label: "Body Fat", unit: "%", color: "hsl(var(--chart-1))" },
    { key: "resting_hr", label: "Resting Heart Rate", unit: "bpm", color: "hsl(var(--chart-2))" },
  ]

  const chartData = useMemo(() => {
    return journeyStates.map((state) => {
      const biomarkers = state.biomarkers
      let value = 0
      let rawValue = ""

      switch (selectedBiomarker) {
        case "blood_pressure_sys":
          rawValue = biomarkers.blood_pressure || "0/0"
          value = Number.parseInt(rawValue.split("/")[0]) || 0
          break
        case "weight":
          rawValue = biomarkers.weight || "0kg"
          value = Number.parseFloat(rawValue.replace("kg", "")) || 0
          break
        case "stress_level":
          rawValue = biomarkers.stress_level || "0/10"
          value = Number.parseInt(rawValue.split("/")[0]) || 0
          break
        case "sleep_hours":
          rawValue = biomarkers.sleep_average || "0 hours"
          value = Number.parseFloat(rawValue.replace(" hours", "")) || 0
          break
        case "adherence":
          rawValue = biomarkers.adherence_this_month || "0%"
          value = Number.parseInt(rawValue.replace("%", "")) || 0
          break
        case "body_fat":
          rawValue = biomarkers.body_fat || "0%"
          value = Number.parseFloat(rawValue.replace("%", "")) || 0
          break
        case "resting_hr":
          rawValue = biomarkers.resting_heart_rate || "0 bpm"
          value = Number.parseInt(rawValue.replace(" bpm", "")) || 0
          break
        default:
          value = 0
      }

      return {
        month: state.month,
        value: value,
        unit: biomarkerOptions.find((opt) => opt.key === selectedBiomarker)?.unit || "",
        label: `Month ${state.month}`,
        rawValue: rawValue,
      }
    })
  }, [journeyStates, selectedBiomarker])

  const selectedOption = biomarkerOptions.find((opt) => opt.key === selectedBiomarker) || biomarkerOptions[0]

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2) return null
    const first = chartData[0].value
    const last = chartData[chartData.length - 1].value
    const change = last - first
    const percentChange = (change / first) * 100

    return {
      change: change,
      percentChange: percentChange,
      isImprovement:
        selectedBiomarker === "blood_pressure_sys"
          ? change < 0
          : selectedBiomarker === "weight"
            ? change < 0
            : selectedBiomarker === "stress_level"
              ? change < 0
              : selectedBiomarker === "body_fat"
                ? change < 0
                : change > 0, // For sleep, adherence, resting HR improvement is positive
    }
  }, [chartData, selectedBiomarker])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background p-3 border border-border rounded-lg shadow-lg">
          <p className="font-medium text-foreground">{`Month ${data.month}`}</p>
          <p className="text-chart-1">{`${selectedOption.label}: ${data.rawValue}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="shadow-lg border border-border/50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="w-8 h-8 rounded-lg bg-chart-1/10 flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5 text-chart-1" />
              </div>
              Biomarker Progress
            </CardTitle>
            <p className="text-muted-foreground mt-1">8-month health transformation trends</p>
          </div>
          {trend && (
            <div className="text-right">
              <div className={`flex items-center gap-1 ${trend.isImprovement ? "text-chart-2" : "text-chart-1"}`}>
                {trend.isImprovement ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-semibold">{Math.abs(trend.percentChange).toFixed(1)}%</span>
              </div>
              <p className="text-xs text-muted-foreground">{trend.isImprovement ? "Improved" : "Declined"}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Biomarker Selection */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            {biomarkerOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => onBiomarkerChange(option.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  selectedBiomarker === option.key
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground hover:bg-muted/50 border-border hover:border-primary/30"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 bg-gradient-to-br from-muted/10 to-transparent rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedOption.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={selectedOption.color} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `M${value}`}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `${value}${selectedOption.unit}`}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={selectedOption.color}
                strokeWidth={2}
                fill="url(#colorGradient)"
                dot={{ fill: selectedOption.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: selectedOption.color, strokeWidth: 2, fill: "hsl(var(--background))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
          <div className="text-center p-4 bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg border border-border/20">
            <p className="text-sm font-medium text-muted-foreground mb-2">Starting Value</p>
            <p className="font-bold text-lg text-foreground">{chartData[0]?.rawValue || "N/A"}</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg border border-border/20">
            <p className="text-sm font-medium text-muted-foreground mb-2">Current Value</p>
            <p className="font-bold text-lg text-foreground">
              {chartData[chartData.length - 1]?.rawValue || "N/A"}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg border border-border/20">
            <p className="text-sm font-medium text-muted-foreground mb-2">Total Change</p>
            <p className={`font-bold text-lg ${trend?.isImprovement ? "text-chart-4" : "text-chart-1"}`}>
              {trend ? `${trend.change > 0 ? "+" : ""}${trend.change.toFixed(1)}${selectedOption.unit}` : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
