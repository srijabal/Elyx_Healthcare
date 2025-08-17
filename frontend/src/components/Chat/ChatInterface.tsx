"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type Message, AGENT_COLORS } from "@/services/types"
import { format, parseISO } from "date-fns"
import { MessageCircle, User, Clock, AlertCircle, CheckCircle2, Eye, Zap, Bot } from "lucide-react"

interface ChatInterfaceProps {
  messages: Message[]
  selectedMonth?: number
  onMessageClick?: (message: Message) => void
  onShowTraceability?: (message: Message) => void
  onShowDecisionDrillDown?: (message: Message) => void
}

export function ChatInterface({
  messages,
  selectedMonth,
  onMessageClick,
  onShowTraceability,
  onShowDecisionDrillDown,
}: ChatInterfaceProps) {
  const filteredMessages = useMemo(() => {
    if (!selectedMonth) return messages
    return messages.filter((msg) => {
      // Try context_data.month first, fallback to extracting from timestamp
      if (msg.context_data?.month) {
        return msg.context_data.month === selectedMonth
      }
      // Extract month from timestamp (assuming messages are in 2024)
      try {
        const date = parseISO(msg.timestamp)
        const messageMonth = date.getMonth() + 1 // getMonth() returns 0-11
        return messageMonth === selectedMonth
      } catch {
        return false
      }
    })
  }, [messages, selectedMonth])

  const groupedMessages = useMemo(() => {
    const groups: { [key: string]: Message[] } = {}

    filteredMessages.forEach((message) => {
      const date = format(parseISO(message.timestamp), "yyyy-MM-dd")
      if (!groups[date]) groups[date] = []
      groups[date].push(message)
    })

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredMessages])

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-chart-3/10 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-chart-3" />
          </div>
          Health Conversations
          {selectedMonth && (
            <Badge variant="outline" className="ml-auto">
              Month {selectedMonth}
            </Badge>
          )}
        </CardTitle>
        <div className="text-sm text-muted-foreground">{filteredMessages.length} messages</div>
      </CardHeader>

      <CardContent className="h-[600px] overflow-y-auto space-y-4 pr-2">
        {groupedMessages.map(([date, dayMessages]) => (
          <div key={date} className="space-y-3">
            <div className="flex items-center justify-center py-3">
              <div className="bg-muted px-4 py-2 rounded-full text-xs font-medium text-muted-foreground border border-border/50">
                {format(parseISO(date), "EEEE, MMMM d, yyyy")}
              </div>
            </div>

            {/* Messages for this day */}
            {dayMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onClick={() => onMessageClick?.(message)}
                onShowTraceability={() => onShowTraceability?.(message)}
                onShowDecisionDrillDown={() => onShowDecisionDrillDown?.(message)}
              />
            ))}
          </div>
        ))}

        {filteredMessages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="font-medium">No messages for this period</p>
            <p className="text-sm mt-1">Select a different month to view conversations</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface MessageBubbleProps {
  message: Message
  onClick?: () => void
  onShowTraceability?: () => void
  onShowDecisionDrillDown?: () => void
}

function MessageBubble({ message, onClick, onShowTraceability, onShowDecisionDrillDown }: MessageBubbleProps) {
  const isMemberMessage =
    message.context_data?.is_member_initiated || message.agent_name === "Rohan" || message.agent_name === "Member"

  const agentColor = AGENT_COLORS[message.agent_name as keyof typeof AGENT_COLORS] || AGENT_COLORS.Member

  return (
    <div className={`flex gap-3 ${isMemberMessage ? "flex-row-reverse" : ""} cursor-pointer group`} onClick={onClick}>
      <Avatar className="w-9 h-9 flex-shrink-0 border-2 border-background shadow-sm">
        <AvatarFallback className="text-xs font-semibold text-white" style={{ backgroundColor: agentColor }}>
          {isMemberMessage ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[75%] ${isMemberMessage ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-2 mb-2 ${isMemberMessage ? "flex-row-reverse" : ""}`}>
          <span className="text-sm font-semibold" style={{ color: agentColor }}>
            {message.agent_name}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(parseISO(message.timestamp), "HH:mm")}
          </span>
        </div>

        <div
          className={`px-4 py-3 rounded-2xl max-w-full group-hover:shadow-md transition-all duration-200 border ${
            isMemberMessage
              ? "bg-primary text-primary-foreground rounded-br-md border-primary/20"
              : "bg-card text-card-foreground rounded-bl-md border-border hover:bg-muted/50"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        </div>

        <div className={`flex items-center gap-2 mt-2 ${isMemberMessage ? "flex-row-reverse" : ""}`}>
          <MessageTypeIndicator type={message.message_type} />
          {message.context_data?.urgency && <UrgencyIndicator urgency={message.context_data.urgency} />}
          {/* Action Buttons - Only for AI agent responses */}
          {!isMemberMessage && (
            <div className="flex gap-1">
              {onShowTraceability && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onShowTraceability()
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-7 px-2 text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Trace
                </Button>
              )}
              {onShowDecisionDrillDown && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onShowDecisionDrillDown()
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-7 px-2 text-xs text-chart-3 hover:text-chart-3 hover:bg-chart-3/10"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Deep Dive
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MessageTypeIndicator({ type }: { type: string }) {
  const typeConfig = {
    member_question: { icon: User, color: "text-chart-2", label: "Question" },
    agent_response: { icon: CheckCircle2, color: "text-chart-4", label: "Response" },
    plan_adjustment: { icon: AlertCircle, color: "text-chart-3", label: "Plan Update" },
    exercise_update: { icon: CheckCircle2, color: "text-chart-5", label: "Exercise" },
    diagnostic_results: { icon: CheckCircle2, color: "text-chart-1", label: "Results" },
  }

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.agent_response
  const Icon = config.icon

  return (
    <div className="flex items-center gap-1">
      <Icon className={`w-3 h-3 ${config.color}`} />
      <span className="text-xs text-muted-foreground">{config.label}</span>
    </div>
  )
}

function UrgencyIndicator({ urgency }: { urgency: string }) {
  const colors = {
    low: "bg-chart-4/10 text-chart-4 border-chart-4/20",
    medium: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    high: "bg-destructive/10 text-destructive border-destructive/20",
  }

  return (
    <Badge variant="outline" className={`text-xs ${colors[urgency as keyof typeof colors] || colors.medium}`}>
      {urgency}
    </Badge>
  )
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
