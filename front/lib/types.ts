export interface Stock {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
    volume: number
    marketCap: number
    sector: string
}

export interface AgentMessage {
    id: string
    agent: "aggressive" | "conservative" | "balanced" | "orchestrator"
    message: string
    timestamp: string
    sentiment?: "bullish" | "bearish" | "neutral"
}

export interface PredictionData {
    date: string
    aggressive: number
    conservative: number
    balanced: number
    orchestrated: number
}

export type DashboardView = "market" | "analysis" | "portfolio"
