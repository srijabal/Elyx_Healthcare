'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Message, AGENT_COLORS } from '@/services/types';
import { format, parseISO } from 'date-fns';
import { 
  MessageCircle, 
  User, 
  Clock,
  AlertCircle,
  CheckCircle2,
  Eye,
  Search
} from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  selectedMonth?: number;
  onMessageClick?: (message: Message) => void;
  onShowTraceability?: (message: Message) => void;
}

export function ChatInterface({ messages, selectedMonth, onMessageClick, onShowTraceability }: ChatInterfaceProps) {
  const filteredMessages = useMemo(() => {
    if (!selectedMonth) return messages;
    return messages.filter(msg => msg.context_data.month === selectedMonth);
  }, [messages, selectedMonth]);

  const groupedMessages = useMemo(() => {
    const groups: { [key: string]: Message[] } = {};
    
    filteredMessages.forEach(message => {
      const date = format(parseISO(message.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredMessages]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Health Journey Conversations
          {selectedMonth && (
            <Badge variant="outline">Month {selectedMonth}</Badge>
          )}
        </CardTitle>
        <div className="text-sm text-gray-600">
          {filteredMessages.length} messages
        </div>
      </CardHeader>
      
      <CardContent className="h-[600px] overflow-y-auto space-y-4">
        {groupedMessages.map(([date, dayMessages]) => (
          <div key={date} className="space-y-3">
            {/* Date Separator */}
            <div className="flex items-center justify-center py-2">
              <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
              </div>
            </div>

            {/* Messages for this day */}
            {dayMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onClick={() => onMessageClick?.(message)}
                onShowTraceability={() => onShowTraceability?.(message)}
              />
            ))}
          </div>
        ))}

        {filteredMessages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No messages for this period</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MessageBubbleProps {
  message: Message;
  onClick?: () => void;
  onShowTraceability?: () => void;
}

function MessageBubble({ message, onClick, onShowTraceability }: MessageBubbleProps) {
  const isMemberMessage = message.context_data.is_member_initiated || 
                         message.agent_name === 'Rohan' || 
                         message.agent_name === 'Member';
  
  const agentColor = AGENT_COLORS[message.agent_name as keyof typeof AGENT_COLORS] || AGENT_COLORS.Member;

  return (
    <div 
      className={`flex gap-3 ${isMemberMessage ? 'flex-row-reverse' : ''} cursor-pointer group`}
      onClick={onClick}
    >
      {/* Avatar */}
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback 
          className="text-xs font-medium text-white"
          style={{ backgroundColor: agentColor }}
        >
          {getInitials(message.agent_name)}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isMemberMessage ? 'items-end' : 'items-start'}`}>
        {/* Agent Name & Time */}
        <div className={`flex items-center gap-2 mb-1 ${isMemberMessage ? 'flex-row-reverse' : ''}`}>
          <span 
            className="text-xs font-medium"
            style={{ color: agentColor }}
          >
            {message.agent_name}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(parseISO(message.timestamp), 'HH:mm')}
          </span>
        </div>

        {/* Message Bubble */}
        <div 
          className={`px-4 py-2 rounded-2xl max-w-full group-hover:shadow-md transition-shadow ${
            isMemberMessage 
              ? 'bg-blue-500 text-white rounded-br-md' 
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        {/* Message Type & Context */}
        <div className={`flex items-center gap-2 mt-1 ${isMemberMessage ? 'flex-row-reverse' : ''}`}>
          <MessageTypeIndicator type={message.message_type} />
          {message.context_data.urgency && (
            <UrgencyIndicator urgency={message.context_data.urgency} />
          )}
          {/* Traceability Button - Only for AI agent responses */}
          {!isMemberMessage && onShowTraceability && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowTraceability();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-gray-200 flex items-center gap-1"
              title="View AI Decision Process"
            >
              <Eye className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Trace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageTypeIndicator({ type }: { type: string }) {
  const typeConfig = {
    member_question: { icon: User, color: 'text-blue-500', label: 'Question' },
    agent_response: { icon: CheckCircle2, color: 'text-green-500', label: 'Response' },
    plan_adjustment: { icon: AlertCircle, color: 'text-orange-500', label: 'Plan Update' },
    exercise_update: { icon: CheckCircle2, color: 'text-purple-500', label: 'Exercise' },
    diagnostic_results: { icon: CheckCircle2, color: 'text-red-500', label: 'Results' },
  };

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.agent_response;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1">
      <Icon className={`w-3 h-3 ${config.color}`} />
      <span className="text-xs text-gray-500">{config.label}</span>
    </div>
  );
}

function UrgencyIndicator({ urgency }: { urgency: string }) {
  const colors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
  };

  return (
    <Badge variant="outline" className={`text-xs ${colors[urgency as keyof typeof colors] || colors.medium}`}>
      {urgency}
    </Badge>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}