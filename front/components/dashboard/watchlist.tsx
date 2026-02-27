"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Plus, TrendingUp, TrendingDown, Star, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useStockData } from '@/hooks/use-stock-data'

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

function WatchlistItem({ symbol, name }: { symbol: string; name: string }) {
  const { data, isLoading } = useStockData(symbol)

  return (
    <Link href={`/dashboard/stock/${symbol}`} className="block">
      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer group">
        <div className="flex items-center gap-3">
          <Star className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <div>
            <p className="font-medium text-foreground">{symbol}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[120px]">{name}</p>
          </div>
        </div>

        <div className="text-right min-w-[70px]">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
          ) : data ? (
            <>
              <p className="font-mono text-sm text-foreground">
                ${data.c.toFixed(2)}
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

  const filteredList = DEFAULT_SYMBOLS.filter(
    stock =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const marketOpen = isMarketOpen()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Watchlist</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5">
            <Plus className="h-4 w-4" />
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
          {filteredList.map((stock) => (
            <WatchlistItem key={stock.symbol} symbol={stock.symbol} name={stock.name} />
          ))}
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
