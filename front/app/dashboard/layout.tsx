"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Navbar } from '@/components/navbar'
import { Watchlist } from '@/components/dashboard/watchlist'
import { Loader2 } from 'lucide-react'

function getActiveTab(pathname: string): string {
  if (pathname.includes('/analysis')) return 'analysis'
  if (pathname.includes('/portfolio')) return 'portfolio'
  if (pathname.includes('/orders')) return 'orders'
  return 'dashboard'
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const activeTab = getActiveTab(pathname)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center glow-green">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background gradient-bg">
      <Navbar showDashboardNav activeTab={activeTab} />
      <div className="flex pt-16">
        {/* Left Sidebar - Watchlist (Fixed) */}
        <aside className="hidden lg:block w-80 h-[calc(100vh-4rem)] border-r border-white/5 overflow-y-auto fixed left-0 top-16 glass">
          <Watchlist />
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 lg:ml-80 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}
