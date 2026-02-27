export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  isLoading?: boolean
}

export interface CandlestickData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface AgentMessage {
  id: string
  agent: "aggressive" | "conservative" | "balanced" | "orchestrator"
  message: string
  timestamp: Date
  sentiment?: "bullish" | "bearish" | "neutral"
}

export interface PredictionData {
  date: string
  aggressive: number
  conservative: number
  balanced: number
  orchestrated: number
}

export type DashboardView = "market" | "analysis"
