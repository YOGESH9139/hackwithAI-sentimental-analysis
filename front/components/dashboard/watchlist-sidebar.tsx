"use client"

import { TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Stock } from "@/lib/types"

interface WatchlistSidebarProps {
  stocks: Stock[]
  selectedStock: string | null
  onSelectStock: (symbol: string) => void
}

export function WatchlistSidebar({ stocks, selectedStock, onSelectStock }: WatchlistSidebarProps) {
  return (
    <aside className="w-72 border-r border-border bg-sidebar flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Watchlist</h2>
        <p className="text-xs text-muted-foreground mt-1">Click a stock to view details</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {stocks.map((stock) => (
          <button
            key={stock.symbol}
            onClick={() => onSelectStock(stock.symbol)}
            className={cn(
              "w-full p-3 rounded-lg mb-2 text-left transition-all",
              "hover:bg-sidebar-accent",
              selectedStock === stock.symbol 
                ? "bg-sidebar-accent border border-primary/50" 
                : "bg-sidebar border border-transparent"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sidebar-foreground">{stock.symbol}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {stock.name}
                </div>
              </div>
              
              <div className="text-right">
                {stock.isLoading ? (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="font-mono text-sm text-sidebar-foreground">
                      ${stock.price.toFixed(2)}
                    </div>
                    <div className={cn(
                      "flex items-center justify-end gap-1 text-xs",
                      stock.change >= 0 ? "text-[var(--aegis-green)]" : "text-[var(--aegis-red)]"
                    )}>
                      {stock.change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  )
}
