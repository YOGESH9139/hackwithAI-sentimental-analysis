"use client"

import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Bot } from 'lucide-react'

interface AgentDebatePanelProps {
  symbol: string
}

// Mock debate messages - in production this would come from your AI backend
const debateMessages = [
  {
    agent: 'Conservative',
    type: 'conservative',
    message: "Looking at the fundamentals, the P/E ratio is slightly elevated compared to historical averages. I recommend a cautious HOLD position until we see better entry points.",
    stance: 'HOLD'
  },
  {
    agent: 'Growth',
    type: 'growth',
    message: "I disagree. The momentum indicators are strong, and the recent earnings beat expectations. The growth trajectory justifies a BUY recommendation.",
    stance: 'BUY'
  },
  {
    agent: 'Moderate',
    type: 'moderate',
    message: "Both points are valid. While fundamentals are stretched, the technical setup is favorable. I lean towards a moderate BUY with a tight stop-loss.",
    stance: 'BUY'
  },
  {
    agent: 'Aggressive',
    type: 'aggressive',
    message: "The sentiment analysis shows overwhelmingly positive social media buzz. Combined with institutional buying, this is a STRONG BUY opportunity!",
    stance: 'STRONG BUY'
  },
  {
    agent: 'Conservative',
    type: 'conservative',
    message: "Social sentiment can be misleading. However, I acknowledge the institutional buying is a positive signal. I'll revise to a cautious BUY.",
    stance: 'BUY'
  },
  {
    agent: 'Aegis Orchestrator',
    type: 'orchestrator',
    message: "After weighing all perspectives: Conservative sees value risks but acknowledges momentum. Growth and Moderate favor buying. Aggressive sees strong sentiment. CONSENSUS: BUY with 78% confidence.",
    stance: 'CONSENSUS'
  },
]

function getAgentColor(type: string) {
  switch (type) {
    case 'conservative':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'moderate':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'growth':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    case 'aggressive':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'orchestrator':
      return 'bg-primary/20 text-primary border-primary/30'
    default:
      return 'bg-white/5 text-foreground border-white/10'
  }
}

function getStanceColor(stance: string) {
  if (stance.includes('BUY')) return 'text-[#00D094]'
  if (stance === 'HOLD') return 'text-yellow-400'
  if (stance === 'SELL') return 'text-[#ef4444]'
  if (stance === 'CONSENSUS') return 'text-primary'
  return 'text-muted-foreground'
}

function getAgentInitial(type: string) {
  switch (type) {
    case 'conservative': return 'C'
    case 'moderate': return 'M'
    case 'growth': return 'G'
    case 'aggressive': return 'A'
    case 'orchestrator': return 'AE'
    default: return '?'
  }
}

export function AgentDebatePanel({ symbol }: AgentDebatePanelProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-white/5 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">Agent Debate for {symbol}</h2>
      </div>
      <div className="p-5">
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-3">
            {debateMessages.map((msg, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-xl border transition-all ${
                  msg.type === 'orchestrator' 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'glass-subtle'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${getAgentColor(msg.type)}`}>
                      {msg.type === 'orchestrator' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        getAgentInitial(msg.type)
                      )}
                    </div>
                    <span className={`font-medium text-sm ${
                      msg.type === 'orchestrator' ? 'text-primary' : 'text-foreground'
                    }`}>
                      {msg.agent}
                    </span>
                  </div>
                  <Badge variant="outline" className={`${getAgentColor(msg.type)} border text-xs`}>
                    <span className={getStanceColor(msg.stance)}>{msg.stance}</span>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <p className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t border-white/5">
          Simulated debate. Connect your AI backend for real agent analysis.
        </p>
      </div>
    </div>
  )
}
