"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Brain,
  Flame,
  Shield,
  Scale,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Activity,
  Sparkles,
  Loader2,
  ListPlus
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
import { cn } from "@/lib/utils"
import Link from 'next/link'
import { AgentMessage, PredictionData } from '@/lib/types'

// Setup dummy agents data generator for the demo
function generateMockAgentMessages(symbol: string): AgentMessage[] {
  return [
    {
      id: "1",
      agent: "conservative",
      message: `Analyzing ${symbol} technicals. The 50-day SMA is holding as support, but volume is declining. I suggest waiting for confirmation before entering a position.`,
      timestamp: new Date().toISOString(),
      sentiment: "neutral"
    },
    {
      id: "2",
      agent: "aggressive",
      message: `Momentum indicators are highly favorable. MACD crossover just occurred. We should capitalize on this breakout immediately. The risk/reward is skewed heavily to the upside.`,
      timestamp: new Date().toISOString(),
      sentiment: "bullish"
    },
    {
      id: "3",
      agent: "balanced",
      message: `Considering both technical setup and macro environment. Sector rotation favors ${symbol}, but broad market headwinds remain. A partial position makes sense here.`,
      timestamp: new Date().toISOString(),
      sentiment: "bullish"
    },
    {
      id: "4",
      agent: "conservative",
      message: `Agreed on the partial position. If we enter now, strict stop-loss at the recent swing low limits our downside exposure to an acceptable 4%.`,
      timestamp: new Date().toISOString(),
      sentiment: "neutral"
    },
    {
      id: "5",
      agent: "orchestrator",
      message: `Debate concluded. Consensus reached: Moderate BUY. The aggressive momentum is validated by sector strength, but conservative risk management is warranted given declining volume. Executing 7% portfolio allocation with defined stops.`,
      timestamp: new Date().toISOString(),
      sentiment: "bullish"
    }
  ]
}

function generateMockPredictions(basePrice: number): PredictionData[] {
  const data: PredictionData[] = []
  const today = new Date()

  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)

    // Create diverging paths
    const variance = (i * basePrice * 0.01) // 1% variance per day
    const agg = basePrice + variance * 1.5 + (Math.random() - 0.5) * basePrice * 0.02
    const cons = basePrice + variance * 0.2 + (Math.random() - 0.5) * basePrice * 0.01
    const bal = basePrice + variance * 0.8 + (Math.random() - 0.5) * basePrice * 0.015
    const orch = (agg + cons + bal) / 3 // Simplified orchestrator logic

    data.push({
      date: d.toISOString(),
      aggressive: agg,
      conservative: cons,
      balanced: bal,
      orchestrated: orch
    })
  }
  return data
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
    color: "text-[#00D094]",
    bgColor: "bg-[#00D094]/10",
    borderColor: "border-[#00D094]/50"
  }
}

const sentimentIcon = {
  bullish: TrendingUp,
  bearish: TrendingDown,
  neutral: Minus
}

const sentimentColor = {
  bullish: "text-[#00D094]",
  bearish: "text-[#ef4444]",
  neutral: "text-yellow-500"
}

function AnalysisContent() {
  const searchParams = useSearchParams()
  const initialSymbol = searchParams.get('symbol') || ''
  const shouldAutoRun = searchParams.get('autorun') === 'true'

  const [symbol, setSymbol] = useState(initialSymbol)
  const [searchInput, setSearchInput] = useState(initialSymbol)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  // Simulation Data
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([])
  const [predictionData, setPredictionData] = useState<PredictionData[]>([])
  const [displayedMessages, setDisplayedMessages] = useState<AgentMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Drag and drop states
  const [isDragOver, setIsDragOver] = useState(false)

  // Track if we've already auto-run to prevent double firing in React StrictMode
  const hasAutoRun = useRef(false)

  const handleAnalyze = async (targetSymbol: string) => {
    if (!targetSymbol.trim()) return

    setSymbol(targetSymbol.toUpperCase())
    setSearchInput(targetSymbol.toUpperCase())
    setIsAnalyzing(true)
    setAnalysisComplete(false)
    setDisplayedMessages([])

    // Generate data
    // Fetch live price as base for predictions if possible, fallback to 150
    let basePrice = 150
    try {
      const res = await fetch(`/api/stock/quote?symbol=${targetSymbol}`)
      const data = await res.json()
      if (data && data.c) basePrice = data.c
    } catch {
      // ignore
    }

    const messages = generateMockAgentMessages(targetSymbol.toUpperCase())
    setAgentMessages(messages)
    setPredictionData(generateMockPredictions(basePrice))

    // Simulate analysis time before showing results page
    await new Promise(resolve => setTimeout(resolve, 2000))

    setIsAnalyzing(false)
    setAnalysisComplete(true)

    // Animate messages appearing
    messages.forEach((message, index) => {
      setTimeout(() => {
        setDisplayedMessages(prev => [...prev, message])
      }, (index + 1) * 1500)
    })
  }

  // Handle AutoRun from URL parameters
  useEffect(() => {
    if (initialSymbol && shouldAutoRun && !hasAutoRun.current) {
      hasAutoRun.current = true
      handleAnalyze(initialSymbol)
    }
  }, [initialSymbol, shouldAutoRun])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [displayedMessages])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const symbol = e.dataTransfer.getData('text/plain')
    if (symbol) {
      handleAnalyze(symbol)
    }
  }

  const sentimentScore = 72 // Mock sentiment score
  const gaugeData = [
    { name: "Sentiment", value: sentimentScore, fill: "#00D094" }
  ]

  const isDebating = displayedMessages.length < agentMessages.length

  return (
    <div
      className={cn(
        "flex-1 p-6 overflow-y-auto transition-colors duration-300 relative",
        isDragOver ? "bg-primary/5" : ""
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay visual hint */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-sm border-2 border-dashed border-primary/50 m-6 rounded-3xl">
          <div className="flex flex-col items-center gap-4 bg-background/80 p-8 rounded-2xl glass-card">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center glow-green">
              <Activity className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Drop to Analyze</h2>
            <p className="text-muted-foreground text-center">Release the stock to instantly run the multi-agent debate</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 glow-green hidden sm:flex">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agentic Analysis</h1>
            <p className="text-muted-foreground text-sm max-w-lg">
              Multi-agent debate and orchestrated consensus analysis for any stock.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Symbol (e.g. AAPL)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze(searchInput)}
              className="pl-9 h-10 bg-white/5 border-white/10"
            />
          </div>
          <Button
            onClick={() => handleAnalyze(searchInput)}
            disabled={!searchInput.trim() || isAnalyzing}
            className="h-10 bg-primary text-primary-foreground hover:bg-primary/90 glow-green whitespace-nowrap"
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run"}
          </Button>
        </div>
      </div>

      {isAnalyzing && (
        <div className="glass-card rounded-2xl p-16 my-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 border border-primary/30 glow-green">
                <Activity className="h-10 w-10 text-primary animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Agents Initializing...</h3>
            <p className="text-muted-foreground max-w-sm">Fetching technicals, latest news, and fundamental data for {symbol}.</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isAnalyzing && !analysisComplete && (
        <div className="glass-card rounded-2xl p-16 my-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-6">
              <Brain className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">No Stock Selected</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Enter a stock symbol to start the multi-agent analysis.
              Our AI agents will debate and provide you with a consensus recommendation.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {['AAPL', 'TSLA', 'GOOGL', 'NVDA'].map((s) => (
                <Button
                  key={s}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAnalyze(s)}
                  className="h-8 border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisComplete && symbol && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Analysis for {symbol}</h2>
            {isDebating ? (
              <Badge variant="outline" className="border-primary/50 text-primary animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                Agents Debating...
              </Badge>
            ) : (
              <Badge className="bg-[#00D094]/20 text-[#00D094] border-0">
                Debate Concluded
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Debate Terminal */}
            <Card className="glass-card border-white/5 lg:col-span-1 border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Agent Debate Feed
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Watch AI agents analyze and debate trading strategies in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto space-y-4 p-4 rounded-xl bg-white/5 border border-white/5 font-mono text-sm relative">
                  {displayedMessages.map((message) => {
                    const config = agentConfig[message.agent]
                    const SentimentIcon = message.sentiment ? sentimentIcon[message.sentiment] : null

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "p-4 rounded-xl border animate-in fade-in slide-in-from-bottom-4 shadow-sm backdrop-blur-sm",
                          config.bgColor,
                          config.borderColor,
                          message.agent === "orchestrator" && "ring-1 ring-[#00D094]/50 shadow-lg shadow-[#00D094]/10"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <config.icon className={cn("h-4 w-4", config.color)} />
                            <span className={cn("font-bold tracking-wide uppercase text-xs", config.color)}>
                              {config.name}
                            </span>
                          </div>
                          {SentimentIcon && message.sentiment && (
                            <div className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-black/20", sentimentColor[message.sentiment])}>
                              <SentimentIcon className="h-3 w-3" />
                              <span className="capitalize">{message.sentiment}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-foreground/90 text-[13px] leading-relaxed">
                          {message.message}
                        </p>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} className="h-1" />

                  {isDebating && (
                    <div className="flex items-center gap-2 text-muted-foreground px-4 py-2 animate-pulse">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Gauge */}
            <Card className="glass-card border-white/5 border-0 shadow-none">
              <CardHeader className="pb-0">
                <CardTitle className="text-foreground">Sentiment Analysis</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Overall market sentiment score for {symbol}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex flex-col items-center justify-center relative -mt-4">
                  <ResponsiveContainer width="100%" height="80%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="70%"
                      outerRadius="100%"
                      barSize={20}
                      data={gaugeData}
                      startAngle={180}
                      endAngle={0}
                    >
                      <RadialBar
                        background={{ fill: 'rgba(255,255,255,0.05)' }}
                        dataKey="value"
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="text-center absolute inset-0 flex items-center justify-center mt-12 flex-col">
                    <div className="text-5xl font-bold font-mono text-[#00D094]">{sentimentScore}%</div>
                    <div className="text-sm text-[#00D094] mt-1 uppercase tracking-wide font-semibold">Bullish</div>
                  </div>
                </div>

                {/* Sentiment Breakdown */}
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="text-center p-3 rounded-xl bg-[#00D094]/10 border border-[#00D094]/20">
                    <div className="text-lg font-bold text-[#00D094]">72%</div>
                    <div className="text-xs text-[#00D094]/80 mt-1">BULLISH</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <div className="text-lg font-bold text-yellow-500">18%</div>
                    <div className="text-xs text-yellow-500/80 mt-1">NEUTRAL</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20">
                    <div className="text-lg font-bold text-[#ef4444]">10%</div>
                    <div className="text-xs text-[#ef4444]/80 mt-1">BEARISH</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prediction Chart */}
            <Card className="glass-card border-white/5 lg:col-span-2 border-0 shadow-none">
              <CardHeader>
                <CardTitle className="text-foreground">Orchestrated 14-Day Price Prediction</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Projected pathways from each agent and the final orchestrated output
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(10,10,15,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)',
                        }}
                        labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                        formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', opacity: 0.8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="aggressive"
                        stroke="#f97316"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        name="Aggressive"
                      />
                      <Line
                        type="monotone"
                        dataKey="conservative"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        name="Conservative"
                      />
                      <Line
                        type="monotone"
                        dataKey="balanced"
                        stroke="#a855f7"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        name="Balanced"
                      />
                      <Line
                        type="monotone"
                        dataKey="orchestrated"
                        stroke="#00D094"
                        strokeWidth={4}
                        dot={false}
                        name="Orchestrated Output"
                        activeDot={{ r: 6, fill: "#00D094", stroke: "rgba(0, 208, 148, 0.3)", strokeWidth: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Final Recommendation */}
            <Card className="bg-primary/5 lg:col-span-2 ring-1 ring-primary/20 border-0 shadow-lg shadow-primary/5 relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl opacity-50 pointer-events-none" />

              <CardHeader className="relative z-10">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Orchestrated Execution Strategy
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Final consensus parameters generated by the multi-agent system
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-xl bg-[#00D094]/10 border border-[#00D094]/30 backdrop-blur-sm">
                    <div className="text-2xl font-black tracking-tight text-[#00D094]">BUY</div>
                    <div className="text-xs uppercase font-bold tracking-wider text-[#00D094]/70 mt-1">Action</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="text-2xl font-bold font-mono text-foreground">7%</div>
                    <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground mt-1">Allocation</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 backdrop-blur-sm">
                    <div className="text-2xl font-bold font-mono text-[#ef4444]">-4.0%</div>
                    <div className="text-xs uppercase font-bold tracking-wider text-[#ef4444]/70 mt-1">Stop Loss</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-[#00D094]/10 border border-[#00D094]/10 backdrop-blur-sm">
                    <div className="text-2xl font-bold font-mono text-[#00D094]">+12.5%</div>
                    <div className="text-xs uppercase font-bold tracking-wider text-[#00D094]/70 mt-1">Take Profit</div>
                  </div>
                </div>

                <div className="mt-6 p-5 rounded-xl bg-black/20 border border-white/5">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Execution Rationale
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Based on multi-agent consensus, {symbol} demonstrates strong bullish momentum
                    with favorable risk-reward characteristics. Technical indicators align with positive
                    sentiment analysis (72% bullish). The orchestrator recommends a moderate position
                    with strict downside protection at -4%. Consider macro market conditions and personal risk tolerance
                    before executing this setup.
                  </p>

                  <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
                      Save Profile
                    </Button>
                    <Button className="bg-[#00D094] text-[#0a0a0f] hover:bg-[#00D094]/90 font-bold glow-green">
                      Execute Trade
                      <Zap className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading Analysis Engine...</p>
        </div>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  )
}
