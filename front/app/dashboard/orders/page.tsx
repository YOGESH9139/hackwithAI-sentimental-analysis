"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

// Mock orders data
const orders = [
  { 
    id: '1', 
    symbol: 'AAPL', 
    type: 'BUY', 
    quantity: 0, 
    price: 0, 
    status: 'COMPLETED',
    date: new Date().toISOString()
  },
  { 
    id: '2', 
    symbol: 'GOOGL', 
    type: 'SELL', 
    quantity: 0, 
    price: 0, 
    status: 'PENDING',
    date: new Date().toISOString()
  },
  { 
    id: '3', 
    symbol: 'MSFT', 
    type: 'BUY', 
    quantity: 0, 
    price: 0, 
    status: 'CANCELLED',
    date: new Date().toISOString()
  },
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4 text-[#00D094]" />
    case 'PENDING':
      return <Clock className="h-4 w-4 text-yellow-400" />
    case 'CANCELLED':
      return <XCircle className="h-4 w-4 text-[#ef4444]" />
    default:
      return null
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'COMPLETED':
      return <Badge className="bg-[#00D094]/10 text-[#00D094] border-[#00D094]/30">Completed</Badge>
    case 'PENDING':
      return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">Pending</Badge>
    case 'CANCELLED':
      return <Badge className="bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30">Cancelled</Badge>
    default:
      return null
  }
}

export default function OrdersPage() {
  const completedOrders = orders.filter(o => o.status === 'COMPLETED')
  const pendingOrders = orders.filter(o => o.status === 'PENDING')

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Orders</h1>
        <p className="text-muted-foreground">View your order history and pending orders</p>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-muted-foreground mb-2">Total Orders</p>
          <div className="text-3xl font-bold font-mono text-foreground">{orders.length}</div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-muted-foreground mb-2">Completed</p>
          <div className="text-3xl font-bold font-mono text-[#00D094]">
            {completedOrders.length}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-muted-foreground mb-2">Pending</p>
          <div className="text-3xl font-bold font-mono text-yellow-400">
            {pendingOrders.length}
          </div>
        </div>
      </div>

      {/* Orders Tabs */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <Tabs defaultValue="all">
          <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Order History</h2>
            </div>
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pending</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Completed</TabsTrigger>
            </TabsList>
          </div>
          <div className="p-5">
            <TabsContent value="all" className="mt-0">
              <OrderTable orders={orders} />
            </TabsContent>
            <TabsContent value="pending" className="mt-0">
              <OrderTable orders={pendingOrders} />
            </TabsContent>
            <TabsContent value="completed" className="mt-0">
              <OrderTable orders={completedOrders} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

function OrderTable({ orders }: { orders: typeof orders }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium">No orders found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Order ID</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Symbol</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Type</th>
            <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Quantity</th>
            <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Price</th>
            <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
            <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="py-4 px-2 font-mono text-sm text-foreground">#{order.id}</td>
              <td className="py-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 font-bold text-xs text-primary">
                    {order.symbol.charAt(0)}
                  </div>
                  <span className="font-medium text-foreground">{order.symbol}</span>
                </div>
              </td>
              <td className="py-4 px-2">
                <Badge variant="outline" 
                  className={order.type === 'BUY' 
                    ? 'bg-[#00D094]/10 text-[#00D094] border-[#00D094]/30' 
                    : 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30'
                  }
                >
                  {order.type}
                </Badge>
              </td>
              <td className="text-right py-4 px-2 font-mono text-foreground">{order.quantity}</td>
              <td className="text-right py-4 px-2 font-mono text-foreground">${order.price.toFixed(2)}</td>
              <td className="text-right py-4 px-2 font-mono font-medium text-foreground">
                ${(order.quantity * order.price).toFixed(2)}
              </td>
              <td className="py-4 px-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  {getStatusBadge(order.status)}
                </div>
              </td>
              <td className="py-4 px-2 text-sm text-muted-foreground">
                {new Date(order.date).toLocaleDateString()}
              </td>
              <td className="text-right py-4 px-2">
                <Link href={`/dashboard/stock/${order.symbol}`}>
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
  )
}
