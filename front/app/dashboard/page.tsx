"use client"

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { useStockData } from '@/hooks/use-stock-data'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  ArrowRight,
  BarChart3,
  Sparkles,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

// Portfolio stats are user-specific — zeroed until trading backend is connected
const portfolioStats = {
  totalValue: 0,
  dayChange: 0,
  dayChangePercent: 0,
  availableCash: 10000, // starting paper trading balance
}

const MARKET_MOVERS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon Inc.' },
]

function MarketMoverCard({ symbol, name }: { symbol: string; name: string }) {
  const { data, isLoading } = useStockData(symbol)
  const isPositive = (data?.dp ?? 0) >= 0

  return (
    <Link href={`/dashboard/stock/${symbol}`} className="block">
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-primary/20">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 font-bold text-primary text-sm">
            {symbol.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-foreground">{symbol}</p>
            <p className="text-sm text-muted-foreground truncate max-w-[110px]">{name}</p>
          </div>
        </div>
        <div className="text-right min-w-[80px]">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
          ) : data ? (
            <>
              <p className="font-mono text-foreground">${data.c.toFixed(2)}</p>
              <p className={`text-sm ${isPositive ? 'text-[#00D094]' : 'text-[#ef4444]'}`}>
                {isPositive ? '+' : ''}{data.dp.toFixed(2)}%
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Welcome back,{' '}
          </span>
          <span className="text-primary">{user?.username}</span>
        </h1>
        <p className="text-muted-foreground">
          Here is your portfolio overview and live market data.
        </p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5 hover:border-primary/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Portfolio Value</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            ${portfolioStats.totalValue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Mock trading balance</p>
        </div>

        <div className="glass-card rounded-2xl p-5 hover:border-primary/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{"Today's Change"}</span>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${portfolioStats.dayChange >= 0 ? 'bg-[#00D094]/10' : 'bg-[#ef4444]/10'
              }`}>
              {portfolioStats.dayChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-[#00D094]" />
              ) : (
                <TrendingDown className="h-4 w-4 text-[#ef4444]" />
              )}
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono ${portfolioStats.dayChange >= 0 ? 'text-[#00D094]' : 'text-[#ef4444]'
            }`}>
            {portfolioStats.dayChange >= 0 ? '+' : ''}${portfolioStats.dayChange.toLocaleString()}
          </div>
          <p className={`text-xs mt-1 ${portfolioStats.dayChangePercent >= 0 ? 'text-[#00D094]' : 'text-[#ef4444]'
            }`}>
            {portfolioStats.dayChangePercent >= 0 ? '+' : ''}{portfolioStats.dayChangePercent.toFixed(2)}%
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 hover:border-primary/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Available Cash</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            ${portfolioStats.availableCash.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Ready to invest</p>
        </div>
      </div>

      {/* Market Movers & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Movers */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="font-semibold text-foreground">Market Movers</h2>
              <Link href="/dashboard/portfolio">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {MARKET_MOVERS.map((stock) => (
                  <MarketMoverCard key={stock.symbol} symbol={stock.symbol} name={stock.name} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="font-semibold text-foreground">Quick Actions</h2>
            </div>
            <div className="p-5 space-y-3">
              <Link href="/dashboard/analysis" className="block">
                <Button className="w-full justify-start h-12 bg-primary text-primary-foreground hover:bg-primary/90 glow-green">
                  <Activity className="mr-3 h-5 w-5" />
                  Agentic Analysis
                </Button>
              </Link>
              <Link href="/dashboard/portfolio" className="block">
                <Button variant="outline" className="w-full justify-start h-12 border-white/10 bg-white/5 hover:bg-white/10">
                  <Wallet className="mr-3 h-5 w-5" />
                  View Portfolio
                </Button>
              </Link>
              <Link href="/dashboard/orders" className="block">
                <Button variant="outline" className="w-full justify-start h-12 border-white/10 bg-white/5 hover:bg-white/10">
                  <BarChart3 className="mr-3 h-5 w-5" />
                  Order History
                </Button>
              </Link>
            </div>
          </div>

          {/* AI Insight Card */}
          <div className="glass-card rounded-2xl overflow-hidden border-primary/20">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-primary">AI Insight</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Get AI-powered analysis on any stock with our multi-agent debate system. Multiple risk profiles converge to give you balanced insights.
              </p>
              <Link href="/dashboard/analysis">
                <Button size="sm" className="w-full bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30">
                  Try Agentic Analysis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
