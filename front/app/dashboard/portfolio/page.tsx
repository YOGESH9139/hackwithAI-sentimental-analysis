"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  ArrowUpRight,
  Plus
} from 'lucide-react'
import Link from 'next/link'

// Mock holdings data
const holdings = [
  { symbol: 'AAPL', name: 'Apple Inc.', quantity: 0, avgPrice: 0, currentPrice: 0, value: 0, change: 0, allocation: 0 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', quantity: 0, avgPrice: 0, currentPrice: 0, value: 0, change: 0, allocation: 0 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', quantity: 0, avgPrice: 0, currentPrice: 0, value: 0, change: 0, allocation: 0 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', quantity: 0, avgPrice: 0, currentPrice: 0, value: 0, change: 0, allocation: 0 },
]

export default function PortfolioPage() {
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
  const totalChange = 0
  const totalChangePercent = 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Portfolio</h1>
          <p className="text-muted-foreground">Track and manage your investments</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green">
          <Plus className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-muted-foreground mb-2">Total Value</p>
          <div className="text-3xl font-bold font-mono text-foreground">
            ${totalValue.toLocaleString()}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-muted-foreground mb-2">Total Gain/Loss</p>
          <div className={`text-3xl font-bold font-mono ${
            totalChange >= 0 ? 'text-[#00D094]' : 'text-[#ef4444]'
          }`}>
            {totalChange >= 0 ? '+' : ''}${totalChange.toLocaleString()}
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            totalChangePercent >= 0 ? 'text-[#00D094]' : 'text-[#ef4444]'
          }`}>
            {totalChangePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-muted-foreground mb-2">Positions</p>
          <div className="text-3xl font-bold font-mono text-foreground">
            {holdings.length}
          </div>
          <p className="text-sm text-muted-foreground">Active holdings</p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Holdings</h2>
        </div>
        <div className="p-5">
          {holdings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Symbol</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Avg Price</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Current</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Value</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Change</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Allocation</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => (
                    <tr key={holding.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 font-bold text-sm text-primary">
                            {holding.symbol.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{holding.symbol}</p>
                            <p className="text-xs text-muted-foreground">{holding.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-4 px-2 font-mono text-foreground">{holding.quantity}</td>
                      <td className="text-right py-4 px-2 font-mono text-foreground">${holding.avgPrice.toFixed(2)}</td>
                      <td className="text-right py-4 px-2 font-mono text-foreground">${holding.currentPrice.toFixed(2)}</td>
                      <td className="text-right py-4 px-2 font-mono font-medium text-foreground">${holding.value.toLocaleString()}</td>
                      <td className="text-right py-4 px-2">
                        <Badge 
                          variant="outline" 
                          className={holding.change >= 0 
                            ? 'border-[#00D094]/30 bg-[#00D094]/10 text-[#00D094]' 
                            : 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]'
                          }
                        >
                          {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}%
                        </Badge>
                      </td>
                      <td className="text-right py-4 px-2 text-muted-foreground">
                        {holding.allocation.toFixed(1)}%
                      </td>
                      <td className="text-right py-4 px-2">
                        <Link href={`/dashboard/stock/${holding.symbol}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <PieChart className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-2">No holdings yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start trading to build your portfolio
              </p>
              <Link href="/dashboard">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Browse Stocks</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
