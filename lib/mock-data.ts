import type { Stock, CandlestickData, AgentMessage, PredictionData } from "./types"

export const watchlistStocks: Stock[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 0.00, change: 0, changePercent: 0, isLoading: true },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 0.00, change: 0, changePercent: 0, isLoading: true },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 0.00, change: 0, changePercent: 0, isLoading: true },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 0.00, change: 0, changePercent: 0, isLoading: true },
  { symbol: "TSLA", name: "Tesla Inc.", price: 0.00, change: 0, changePercent: 0, isLoading: true },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 0.00, change: 0, changePercent: 0, isLoading: true },
  { symbol: "META", name: "Meta Platforms", price: 0.00, change: 0, changePercent: 0, isLoading: true },
  { symbol: "JPM", name: "JPMorgan Chase", price: 0.00, change: 0, changePercent: 0, isLoading: true },
]

// Mock candlestick data for chart placeholder
export const generateMockCandlestickData = (days: number = 30): CandlestickData[] => {
  const data: CandlestickData[] = []
  let basePrice = 150
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i))
    
    const volatility = Math.random() * 10
    const open = basePrice + (Math.random() - 0.5) * volatility
    const close = open + (Math.random() - 0.5) * volatility
    const high = Math.max(open, close) + Math.random() * 3
    const low = Math.min(open, close) - Math.random() * 3
    const volume = Math.floor(Math.random() * 10000000) + 1000000
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume
    })
    
    basePrice = close
  }
  
  return data
}

export const generateAgentDebate = (symbol: string): AgentMessage[] => [
  {
    id: "1",
    agent: "aggressive",
    message: `${symbol} shows strong momentum. Technical indicators suggest a breakout is imminent. I recommend a significant long position with a 15% allocation.`,
    timestamp: new Date(Date.now() - 300000),
    sentiment: "bullish"
  },
  {
    id: "2",
    agent: "conservative",
    message: `While I see the bullish signals, the current P/E ratio is concerning. I suggest a modest 5% position with strict stop-losses at -3%.`,
    timestamp: new Date(Date.now() - 240000),
    sentiment: "neutral"
  },
  {
    id: "3",
    agent: "balanced",
    message: `Considering both perspectives, a 8% allocation seems prudent. The risk-reward ratio is favorable but market volatility warrants caution.`,
    timestamp: new Date(Date.now() - 180000),
    sentiment: "bullish"
  },
  {
    id: "4",
    agent: "aggressive",
    message: `Recent sentiment analysis shows 72% positive social media mentions. Institutional buying has increased 23% this week.`,
    timestamp: new Date(Date.now() - 120000),
    sentiment: "bullish"
  },
  {
    id: "5",
    agent: "conservative",
    message: `I must note the upcoming Fed meeting could introduce volatility. We should hedge this position appropriately.`,
    timestamp: new Date(Date.now() - 60000),
    sentiment: "bearish"
  },
  {
    id: "6",
    agent: "orchestrator",
    message: `CONSENSUS REACHED: Based on multi-agent analysis, ${symbol} receives a BUY rating with 7% portfolio allocation. Entry point: Current price. Stop-loss: -4%. Take profit: +12%.`,
    timestamp: new Date(),
    sentiment: "bullish"
  }
]

export const generatePredictionData = (days: number = 14): PredictionData[] => {
  const data: PredictionData[] = []
  let baseValue = 100
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    
    const aggressive = baseValue + (Math.random() - 0.3) * 15
    const conservative = baseValue + (Math.random() - 0.5) * 5
    const balanced = baseValue + (Math.random() - 0.4) * 10
    const orchestrated = (aggressive * 0.3 + conservative * 0.3 + balanced * 0.4)
    
    data.push({
      date: date.toISOString().split('T')[0],
      aggressive: Number(aggressive.toFixed(2)),
      conservative: Number(conservative.toFixed(2)),
      balanced: Number(balanced.toFixed(2)),
      orchestrated: Number(orchestrated.toFixed(2))
    })
    
    baseValue = orchestrated
  }
  
  return data
}
