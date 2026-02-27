
"use client"

import { use, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StockChart } from '@/components/dashboard/stock-chart'
import { TradeDialog } from '@/components/dashboard/trade-dialog'
import { useStockData } from '@/hooks/use-stock-data'
import { formatCurrency } from '@/lib/utils'
import {
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Star,
  Bell,
  Share2,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface StockProfile {
  name: string
  sector: string
  exchange: string
  marketCap: number
  high52w: number
  low52w: number
  peRatio: number
}

function useStockProfile(symbol: string) {
  const [profile, setProfile] = useState<StockProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!symbol) return
    let cancelled = false
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/stock/profile?symbol=${encodeURIComponent(symbol)}`)
        if (!res.ok) throw new Error('profile failed')
        const json = await res.json()
        if (!cancelled) setProfile(json)
      } catch {
        // fail silently, fallback shown below
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchProfile()
    return () => { cancelled = true }
  }, [symbol])

  return { profile, isLoading }
}

export default function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params)
  const upperSymbol = symbol.toUpperCase()

  const { data: quote, isLoading: quoteLoading } = useStockData(upperSymbol)
  const { profile, isLoading: profileLoading } = useStockProfile(upperSymbol)
  const router = useRouter()

  const [tradeAction, setTradeAction] = useState<'buy' | 'sell' | null>(null)
  const [showAnalysisConfirm, setShowAnalysisConfirm] = useState(false)

  const isPositive = (quote?.dp ?? 0) >= 0

  const handleRunAnalysis = () => {
    setShowAnalysisConfirm(false)
    router.push(`/dashboard/analysis?symbol=${upperSymbol}&autorun=true`)
  }

  return (
    <div className="p-6">
      {/* Back Navigation */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Stock Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{upperSymbol}</h1>
            {profileLoading ? (
              <div className="h-6 w-24 rounded-md bg-white/5 animate-pulse" />
            ) : (
              <Badge variant="outline" className="bg-white/5 border-white/10 text-muted-foreground">
                {profile?.exchange ?? 'Unknown'}
              </Badge>
            )}
          </div>
          {profileLoading ? (
            <div className="space-y-1">
              <div className="h-5 w-48 rounded-md bg-white/5 animate-pulse" />
              <div className="h-4 w-32 rounded-md bg-white/5 animate-pulse" />
            </div>
          ) : (
            <>
              <p className="text-lg text-foreground/80">{profile?.name ?? upperSymbol}</p>
              <p className="text-sm text-muted-foreground">{profile?.sector ?? 'Unknown'}</p>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="border-white/10 bg-white/5 hover:bg-white/10">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="border-white/10 bg-white/5 hover:bg-white/10">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="border-white/10 bg-white/5 hover:bg-white/10">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setShowAnalysisConfirm(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green"
          >
            <Activity className="mr-2 h-4 w-4" />
            Run Agentic Analysis
          </Button>
        </div>
      </div>

      {/* Price Info */}
      <div className="flex items-baseline gap-4 mb-8">
        {quoteLoading ? (
          <div className="flex items-center gap-4">
            <div className="h-12 w-40 rounded-md bg-white/5 animate-pulse" />
            <div className="h-7 w-32 rounded-md bg-white/5 animate-pulse" />
          </div>
        ) : quote ? (
          <>
            <span className="text-5xl font-bold font-mono text-foreground">
              {formatCurrency(quote.c, upperSymbol)}
            </span>
            <div className={`flex items-center gap-2 ${isPositive ? 'text-[#00D094]' : 'text-[#ef4444]'}`}>
              {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              <span className="text-xl font-semibold">
                {isPositive ? '+' : ''}{formatCurrency(Math.abs(quote.d), upperSymbol)} ({isPositive ? '+' : ''}{quote.dp.toFixed(2)}%)
              </span>
            </div>
          </>
        ) : (
          <span className="text-muted-foreground">Price unavailable</span>
        )}
      </div>

      {/* Chart Tabs */}
      <Tabs defaultValue="1D" className="mb-8">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="1D" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">1D</TabsTrigger>
          <TabsTrigger value="1W" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">1W</TabsTrigger>
          <TabsTrigger value="1M" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">1M</TabsTrigger>
          <TabsTrigger value="3M" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">3M</TabsTrigger>
          <TabsTrigger value="1Y" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">1Y</TabsTrigger>
          <TabsTrigger value="ALL" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">ALL</TabsTrigger>
        </TabsList>
        {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((period) => (
          <TabsContent key={period} value={period} className="mt-4">
            <StockChart symbol={upperSymbol} period={period} />
          </TabsContent>
        ))}
      </Tabs>

      {/* Stock Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Open</p>
          <p className="text-xl font-bold font-mono text-foreground">
            {quoteLoading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : quote ? formatCurrency(quote.o, upperSymbol) : '—'}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Prev Close</p>
          <p className="text-xl font-bold font-mono text-foreground">
            {quoteLoading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : quote ? formatCurrency(quote.pc, upperSymbol) : '—'}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Day High</p>
          <p className="text-xl font-bold font-mono text-[#00D094]">
            {quoteLoading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : quote ? formatCurrency(quote.h, upperSymbol) : '—'}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Day Low</p>
          <p className="text-xl font-bold font-mono text-[#ef4444]">
            {quoteLoading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : quote ? formatCurrency(quote.l, upperSymbol) : '—'}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
          <p className="text-xl font-bold font-mono text-foreground">
            {profileLoading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : profile?.marketCap ? `$${(profile.marketCap / 1000).toFixed(1)}T` : '—'}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">P/E Ratio</p>
          <p className="text-xl font-bold font-mono text-foreground">
            {profileLoading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : profile?.peRatio ? profile.peRatio.toFixed(2) : '—'}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">52W High</p>
          <p className="text-xl font-bold font-mono text-[#00D094]">
            {profileLoading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : profile?.high52w ? formatCurrency(profile.high52w, upperSymbol) : '—'}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">52W Low</p>
          <p className="text-xl font-bold font-mono text-[#ef4444]">
            {profileLoading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : profile?.low52w ? formatCurrency(profile.low52w, upperSymbol) : '—'}
          </p>
        </div>
      </div>

      {/* Trade Actions */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Trade {upperSymbol}</h3>
        <div className="flex gap-4">
          <Button
            className="flex-1 h-12 bg-[#00D094] text-[#0a0a0f] hover:bg-[#00D094]/90 font-semibold glow-green"
            onClick={() => setTradeAction('buy')}
            disabled={!quote}
          >
            Buy {quote ? `@ ${formatCurrency(quote.c, upperSymbol)}` : ''}
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 border-[#ef4444]/50 text-[#ef4444] hover:bg-[#ef4444]/10 font-semibold"
            onClick={() => setTradeAction('sell')}
            disabled={!quote}
          >
            Sell
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Mock trading · no real money involved · Prices from Finnhub
        </p>
      </div>

      {quote && (
        <TradeDialog
          isOpen={tradeAction !== null}
          onClose={() => setTradeAction(null)}
          symbol={upperSymbol}
          action={tradeAction}
          currentPrice={quote.c}
        />
      )}

      {/* Analysis Confirmation Dialog */}
      <Dialog open={showAnalysisConfirm} onOpenChange={setShowAnalysisConfirm}>
        <DialogContent className="sm:max-w-md bg-[#0a0a0f] border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Run Agentic Analysis
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-4">
              Are you sure you want to run a full multi-agent analysis on <strong className="text-foreground">{upperSymbol}</strong>?
              <br /><br />
              This will initialize our debate simulation engines and generate an orchestrated trading strategy based on current technicals.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAnalysisConfirm(false)}
              className="border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRunAnalysis}
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green"
            >
              Confirm & Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
