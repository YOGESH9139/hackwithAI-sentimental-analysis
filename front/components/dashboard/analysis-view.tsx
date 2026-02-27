"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Flame, 
  Shield, 
  Scale,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft
} from "lucide-react"
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid,
  RadialBarChart,
  RadialBar
} from "recharts"
import type { Stock, AgentMessage, PredictionData, DashboardView } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AnalysisViewProps {
  selectedStock: Stock | null
  agentMessages: AgentMessage[]
  predictionData: PredictionData[]
  onViewChange: (view: DashboardView) => void
}

const agentConfig = {
  aggressive: {
    name: "Aggressive Agent",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30"
  },
  conservative: {
    name: "Conservative Agent",
    icon: Shield,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30"
  },
  balanced: {
    name: "Balanced Agent",
    icon: Scale,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30"
  },
  orchestrator: {
    name: "Orchestrator",
    icon: Zap,
    color: "text-[var(--aegis-green)]",
    bgColor: "bg-[var(--aegis-green)]/10",
    borderColor: "border-[var(--aegis-green)]/50"
  }
}

const sentimentIcon = {
  bullish: TrendingUp,
  bearish: TrendingDown,
  neutral: Minus
}

const sentimentColor = {
  bullish: "text-[var(--aegis-green)]",
  bearish: "text-[var(--aegis-red)]",
  neutral: "text-[var(--aegis-yellow)]"
}

export function AnalysisView({ selectedStock, agentMessages, predictionData, onViewChange }: AnalysisViewProps) {
  const [displayedMessages, setDisplayedMessages] = useState<AgentMessage[]>([])
  const [isAnimating, setIsAnimating] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Animate messages appearing one by one
  useEffect(() => {
    if (selectedStock) {
      setDisplayedMessages([])
      setIsAnimating(true)
      
      agentMessages.forEach((message, index) => {
        setTimeout(() => {
          setDisplayedMessages(prev => [...prev, message])
          if (index === agentMessages.length - 1) {
            setIsAnimating(false)
          }
        }, index * 1000)
      })
    }
  }, [selectedStock, agentMessages])
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [displayedMessages])
  
  if (!selectedStock) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Stock Selected</h3>
          <p className="text-muted-foreground max-w-md">
            Select a stock from the watchlist to run agentic analysis.
          </p>
        </div>
      </div>
    )
  }
  
  // Calculate sentiment gauge data
  const sentimentScore = 72 // Mock sentiment score
  const gaugeData = [
    { name: "Sentiment", value: sentimentScore, fill: "var(--aegis-green)" }
  ]
  
  return (
    <div className="flex-1 p-6 bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewChange("market")}
            className="border-border text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Market
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Agentic Analysis: {selectedStock.symbol}
            </h1>
            <p className="text-muted-foreground text-sm">
              Multi-agent debate and orchestrated consensus
            </p>
          </div>
        </div>
        
        {isAnimating && (
          <Badge variant="outline" className="border-primary/50 text-primary animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            Agents Analyzing...
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Debate Terminal */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Agent Debate
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Watch AI agents analyze and debate trading strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto space-y-4 p-4 rounded-lg bg-background border border-border font-mono text-sm">
              {displayedMessages.map((message) => {
                const config = agentConfig[message.agent]
                const SentimentIcon = message.sentiment ? sentimentIcon[message.sentiment] : null
                
                return (
                  <div 
                    key={message.id}
                    className={cn(
                      "p-3 rounded-lg border animate-in fade-in slide-in-from-bottom-2",
                      config.bgColor,
                      config.borderColor,
                      message.agent === "orchestrator" && "ring-1 ring-primary/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <config.icon className={cn("h-4 w-4", config.color)} />
                        <span className={cn("font-semibold", config.color)}>
                          {config.name}
                        </span>
                      </div>
                      {SentimentIcon && message.sentiment && (
                        <div className={cn("flex items-center gap-1 text-xs", sentimentColor[message.sentiment])}>
                          <SentimentIcon className="h-3 w-3" />
                          <span className="capitalize">{message.sentiment}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-foreground text-xs leading-relaxed">
                      {message.message}
                    </p>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>
        
        {/* Sentiment Gauge */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Sentiment Analysis</CardTitle>
            <CardDescription className="text-muted-foreground">
              Overall market sentiment score for {selectedStock.symbol}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="80%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="60%" 
                  outerRadius="100%" 
                  barSize={20} 
                  data={gaugeData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background={{ fill: 'var(--secondary)' }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="text-center -mt-8">
                <div className="text-4xl font-bold text-[var(--aegis-green)]">{sentimentScore}%</div>
                <div className="text-sm text-muted-foreground">Bullish Sentiment</div>
              </div>
            </div>
            
            {/* Sentiment Breakdown */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 rounded-lg bg-[var(--aegis-green)]/10 border border-[var(--aegis-green)]/30">
                <div className="text-lg font-bold text-[var(--aegis-green)]">72%</div>
                <div className="text-xs text-muted-foreground">Bullish</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--aegis-yellow)]/10 border border-[var(--aegis-yellow)]/30">
                <div className="text-lg font-bold text-[var(--aegis-yellow)]">18%</div>
                <div className="text-xs text-muted-foreground">Neutral</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--aegis-red)]/10 border border-[var(--aegis-red)]/30">
                <div className="text-lg font-bold text-[var(--aegis-red)]">10%</div>
                <div className="text-xs text-muted-foreground">Bearish</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Prediction Chart */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Orchestrated Predictions</CardTitle>
            <CardDescription className="text-muted-foreground">
              14-day price predictions from each agent and the final orchestrated output
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'var(--foreground)' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="aggressive" 
                    stroke="#f97316" 
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Aggressive"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conservative" 
                    stroke="#3b82f6" 
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Conservative"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balanced" 
                    stroke="#a855f7" 
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Balanced"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orchestrated" 
                    stroke="var(--aegis-green)" 
                    strokeWidth={3}
                    dot={false}
                    name="Orchestrated (Final)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Final Recommendation */}
        <Card className="bg-card border-primary/30 lg:col-span-2 ring-1 ring-primary/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Orchestrated Recommendation
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Final consensus from the multi-agent system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-[var(--aegis-green)]/10 border border-[var(--aegis-green)]/30">
                <div className="text-2xl font-bold text-[var(--aegis-green)]">BUY</div>
                <div className="text-sm text-muted-foreground">Signal</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary border border-border">
                <div className="text-2xl font-bold text-foreground">7%</div>
                <div className="text-sm text-muted-foreground">Portfolio Allocation</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary border border-border">
                <div className="text-2xl font-bold text-[var(--aegis-red)]">-4%</div>
                <div className="text-sm text-muted-foreground">Stop Loss</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary border border-border">
                <div className="text-2xl font-bold text-[var(--aegis-green)]">+12%</div>
                <div className="text-sm text-muted-foreground">Take Profit</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-background border border-border">
              <h4 className="font-semibold text-foreground mb-2">Analysis Summary</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Based on multi-agent consensus, {selectedStock.symbol} demonstrates strong bullish momentum 
                with favorable risk-reward characteristics. Technical indicators align with positive 
                sentiment analysis (72% bullish). The orchestrator recommends a moderate position 
                with defined risk parameters. Consider market conditions and personal risk tolerance 
                before executing trades.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
