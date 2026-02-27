"use client"

import { useTrading } from '@/context/trading-context'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Clock, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
  const { orders } = useTrading()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          Order History <Badge variant="secondary" className="bg-primary/20 text-primary border-0">Mock Trading</Badge>
        </h1>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Order History</h3>
            <p className="text-muted-foreground max-w-sm">
              Your mock trading history will appear here once you buy or sell a stock.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Symbol</th>
                  <th className="px-6 py-4 font-medium text-right">Shares</th>
                  <th className="px-6 py-4 font-medium text-right">Price</th>
                  <th className="px-6 py-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {formatDate(order.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${order.type === 'buy'
                          ? 'bg-[#00D094]/10 text-[#00D094]'
                          : 'bg-[#ef4444]/10 text-[#ef4444]'
                        }`}>
                        {order.type === 'buy' ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        {order.type.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/dashboard/stock/${order.symbol}`} className="font-semibold hover:text-primary transition-colors">
                        {order.symbol}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono">
                      {order.shares}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono">
                      {formatCurrency(order.price, order.symbol)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-medium text-foreground">
                      {order.type === 'sell' ? '+' : '-'}{formatCurrency(order.total, order.symbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
