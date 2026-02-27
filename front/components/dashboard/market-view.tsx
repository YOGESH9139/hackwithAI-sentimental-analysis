"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  ShoppingCart,
  DollarSign,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { 
  ResponsiveContainer, 
  ComposedChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Bar,
  Line
} from "recharts"
import type { Stock, CandlestickData, DashboardView } from "@/lib/types"

interface MarketViewProps {
  selectedStock: Stock | null
  candlestickData: CandlestickData[]
  onViewChange: (view: DashboardView) => void
}

export function MarketView({ selectedStock, candlestickData, onViewChange }: MarketViewProps) {
  const [tradeAlert, setTradeAlert] = useState<{ type: "buy" | "sell"; symbol: string } | null>(null)
  
  const handleTrade = (type: "buy" | "sell") => {
    if (selectedStock) {
      setTradeAlert({ type, symbol: selectedStock.symbol })
      setTimeout(() => setTradeAlert(null), 3000)
    }
  }
  
  if (!selectedStock) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <BarChartIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Select a Stock</h3>
          <p className="text-muted-foreground max-w-md">
            Choose a stock from the watchlist to view market data, charts, and trading options.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 p-6 bg-background overflow-y-auto">
      {/* Trade Alert */}
      {tradeAlert && (
        <Alert className="mb-4 border-primary/50 bg-primary/10">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            Mock {tradeAlert.type.toUpperCase()} order placed for {tradeAlert.symbol}. 
            <span className="text-muted-foreground"> (Demo - No real transaction)</span>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Stock Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{selectedStock.symbol}</h1>
          <p className="text-muted-foreground">{selectedStock.name}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            {selectedStock.isLoading ? (
              <div className="text-2xl font-mono text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-3xl font-mono font-bold text-foreground">
                  ${selectedStock.price.toFixed(2)}
                </div>
                <div className={`flex items-center justify-end gap-1 text-sm ${
                  selectedStock.change >= 0 ? "text-[var(--aegis-green)]" : "text-[var(--aegis-red)]"
                }`}>
                  {selectedStock.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>
                    {selectedStock.change >= 0 ? "+" : ""}
                    ${selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </>
            )}
          </div>
          
          <Button 
            onClick={() => onViewChange("analysis")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Brain className="h-4 w-4 mr-2" />
            Run Agentic Analysis
          </Button>
        </div>
      </div>
      
      {/* Chart */}
      <Card className="mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Price Chart</CardTitle>
          <CardDescription className="text-muted-foreground">
            30-day price history (Placeholder - Connect AlphaVantage API)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={candlestickData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  yAxisId="price"
                  domain={['auto', 'auto']}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  yAxisId="volume"
                  orientation="right"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Bar 
                  yAxisId="volume"
                  dataKey="volume" 
                  fill="var(--muted)" 
                  opacity={0.3}
                />
                <Line 
                  yAxisId="price"
                  type="monotone" 
                  dataKey="close" 
                  stroke="var(--primary)" 
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Trading Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[var(--aegis-green)]" />
              Buy Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-[var(--aegis-yellow)]/50 bg-[var(--aegis-yellow)]/10">
              <AlertCircle className="h-4 w-4 text-[var(--aegis-yellow)]" />
              <AlertDescription className="text-foreground">
                Mock trading only. No real money involved.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => handleTrade("buy")}
              className="w-full bg-[var(--aegis-green)] text-background hover:bg-[var(--aegis-green-dark)] font-semibold"
            >
              Buy {selectedStock.symbol}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[var(--aegis-red)]" />
              Sell Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-[var(--aegis-yellow)]/50 bg-[var(--aegis-yellow)]/10">
              <AlertCircle className="h-4 w-4 text-[var(--aegis-yellow)]" />
              <AlertDescription className="text-foreground">
                Mock trading only. No real money involved.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => handleTrade("sell")}
              className="w-full bg-[var(--aegis-red)] text-white hover:bg-[var(--aegis-red)]/90 font-semibold"
            >
              Sell {selectedStock.symbol}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M3 13h2v8H3zM9 9h2v12H9zM15 5h2v16h-2zM21 1h-2v20h2z" 
      />
    </svg>
  )
}
