"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, RefreshCw, TrendingUp, TrendingDown, Star, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useStockData } from '@/hooks/use-stock-data'
import { formatCurrency } from '@/lib/utils'

const DEFAULT_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'JPM', name: 'JPMorgan Chase' },
]

function WatchlistItem({ symbol, name, refreshTrigger = 0 }: { symbol: string; name: string; refreshTrigger?: number }) {
  const { data, isLoading } = useStockData(symbol, refreshTrigger)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', symbol)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <Link href={`/dashboard/stock/${symbol}`} className="block" draggable onDragStart={handleDragStart}>
      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer group">
        <div className="flex items-center gap-3">
          <Star className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <div>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
            ) : data ? (
              <>
                <p className={`font-medium  ${data.dp >= 0 ? 'text-[#00D094]' : 'text-[#ef4444]'
                  }`}>{symbol}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">{name}</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">—</p>
            )}
          </div>
        </div>

        <div className="text-right min-w-[70px]">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
          ) : data ? (
            <>
              <p className={`font-mono text-sm  ${data.dp >= 0 ? 'text-[#00D094]' : 'text-[#ef4444]'
                }`}>
                {formatCurrency(data.c, symbol)}
              </p>
              <div className={`flex items-center justify-end gap-1 text-xs ${data.dp >= 0 ? 'text-[#00D094]' : 'text-[#ef4444]'
                }`}>
                {data.dp >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{data.dp >= 0 ? '+' : ''}{data.dp.toFixed(2)}%</span>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">—</p>
          )}
        </div>
      </div>
    </Link>
  )
}

function isMarketOpen(): boolean {
  const now = new Date()
  // Convert to US Eastern time
  const eastern = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = eastern.getDay() // 0=Sun, 6=Sat
  const hours = eastern.getHours()
  const minutes = eastern.getMinutes()
  const timeInMinutes = hours * 60 + minutes
  // Market open: Mon-Fri, 9:30 AM - 4:00 PM ET
  return day >= 1 && day <= 5 && timeInMinutes >= 570 && timeInMinutes < 960
}

export function Watchlist() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ symbol: string, name: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setRefreshTrigger(prev => prev + 1)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/stock/search?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.results || [])
        }
      } catch (error) {
        console.error('Failed to search stocks:', error)
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const displayList = searchQuery.trim() ? searchResults : DEFAULT_SYMBOLS
  const marketOpen = isMarketOpen()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Watchlist</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-white/5"
            onClick={handleRefresh}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-white/5 border-white/10 focus:border-primary/50"
          />
        </div>
      </div>

      {/* Stock List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Searching stocks...</p>
            </div>
          ) : displayList.length > 0 ? (
            displayList.map((stock) => (
              <WatchlistItem key={stock.symbol} symbol={stock.symbol} name={stock.name} refreshTrigger={refreshTrigger} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <p className="text-sm">No stocks found.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Market Status */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Market Status</span>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${marketOpen ? 'bg-primary animate-pulse glow-green' : 'bg-yellow-500'}`} />
            <span className={`font-medium ${marketOpen ? 'text-primary' : 'text-yellow-500'}`}>
              {marketOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

