"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { useStockCandles } from '@/hooks/use-stock-candles'
import { Loader2 } from 'lucide-react'

interface StockChartProps {
  symbol: string
  period: string
}

export function StockChart({ symbol, period }: StockChartProps) {
  const { data, isLoading, error } = useStockCandles(symbol, period)

  const isPositive = data.length > 1 && data[data.length - 1].price >= data[0].price
  const startPrice = data.length > 0 ? data[0].price : 0
  const minPrice = data.length > 0 ? Math.min(...data.map(d => d.price)) * 0.995 : 0
  const maxPrice = data.length > 0 ? Math.max(...data.map(d => d.price)) * 1.005 : 100

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="h-[400px] w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading chart data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || data.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="h-[400px] w-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">{error ? 'Failed to load chart data.' : 'No chart data available for this period.'}</p>
            <p className="text-xs mt-1 opacity-60">Markets may be closed or data unavailable.</p>
          </div>
        </div>
      </div>
    )
  }

  const gradientId = `gradient-${symbol}-${isPositive ? 'up' : 'down'}`

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isPositive ? '#00D094' : '#ef4444'}
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor={isPositive ? '#00D094' : '#ef4444'}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8a8a9a', fontSize: 11 }}
              tickMargin={10}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8a8a9a', fontSize: 11 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              orientation="right"
              tickMargin={10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(20, 20, 30, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#f0f0f5',
                backdropFilter: 'blur(10px)'
              }}
              labelStyle={{ color: '#8a8a9a' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <ReferenceLine
              y={startPrice}
              stroke="#8a8a9a"
              strokeDasharray="3 3"
              strokeOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? '#00D094' : '#ef4444'}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-center text-muted-foreground mt-4">
        Powered by Yahoo Finance · Real-time market data
      </p>
    </div>
  )
}
