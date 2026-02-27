"use client"

import { useState } from 'react'
import { useTrading } from '@/context/trading-context'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, RefreshCw, BarChart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useStockData } from '@/hooks/use-stock-data'

function PortfolioPosition({ position, refreshTrigger }: { position: any, refreshTrigger: number }) {
  const { data, isLoading } = useStockData(position.symbol, refreshTrigger)

  const currentPrice = data?.c ?? position.averageCost
  const currentValue = position.shares * currentPrice
  const totalCost = position.shares * position.averageCost
  const totalReturn = currentValue - totalCost
  const returnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0
  const isPositive = totalReturn >= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-5 hover:bg-white/5 transition-colors items-center border-b border-white/5 last:border-0">
      <div className="md:col-span-2">
        <Link href={`/dashboard/stock/${position.symbol}`} className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
            {position.symbol.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{position.symbol}</p>
            <p className="text-sm text-muted-foreground">{position.shares} shares</p>
          </div>
        </Link>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">Current Price</p>
        <p className="font-mono text-sm">
          {isLoading ? '...' : formatCurrency(currentPrice, position.symbol)}
        </p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">Avg Cost</p>
        <p className="font-mono text-sm">
          {formatCurrency(position.averageCost, position.symbol)}
        </p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">Total Value</p>
        <p className="font-mono font-medium text-foreground">
          {formatCurrency(currentValue, position.symbol)}
        </p>
      </div>

      <div className="text-right">
        <p className="text-xs text-muted-foreground mb-1">Total Return</p>
        <div className={`inline-flex flex-col items-end ${isPositive ? 'text-[#00D094]' : 'text-[#ef4444]'}`}>
          <span className="font-mono font-medium">{isPositive ? '+' : ''}{formatCurrency(totalReturn, position.symbol)}</span>
          <span className="text-xs flex items-center gap-1">
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(returnPercent).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  )
}

export default function PortfolioPage() {
  const { cashBalance, positions } = useTrading()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Portfolio <Badge variant="secondary" className="bg-primary/20 text-primary border-0">Mock Trading</Badge>
          </h1>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} className="border-white/10 hover:bg-white/10">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3 glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <h2 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Available Cash Balance
          </h2>
          <p className="text-5xl font-bold font-mono text-foreground mb-4 drop-shadow-sm">
            {formatCurrency(cashBalance)}
          </p>
          <p className="text-sm text-muted-foreground">
            Funds available for executing mock trades. Use the search bar to find and buy stocks.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Positions</p>
            <p className="text-3xl font-bold font-mono text-primary mt-1">{positions.length}</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Your Assets</h2>
        </div>

        {positions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Open Positions</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              You haven&apos;t executed any mock trades yet. Search for a stock and hit Buy to start building your portfolio.
            </p>
            <Link href="/dashboard">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green">
                Explore Market
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            {positions.map(pos => (
              <PortfolioPosition key={pos.symbol} position={pos} refreshTrigger={refreshTrigger} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
