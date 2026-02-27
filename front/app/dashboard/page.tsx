"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar"
import { WatchlistSidebar } from "@/components/dashboard/watchlist-sidebar"
import { MarketView } from "@/components/dashboard/market-view"
import { AnalysisView } from "@/components/dashboard/analysis-view"
import { 
  watchlistStocks, 
  generateMockCandlestickData, 
  generateAgentDebate,
  generatePredictionData 
} from "@/lib/mock-data"
import type { DashboardView, Stock } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [currentView, setCurrentView] = useState<DashboardView>("market")
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null)
  const [stocks] = useState<Stock[]>(watchlistStocks)
  
  // Redirect to auth if not authenticated (only after loading is complete)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, isLoading, router])
  
  // Get the selected stock object
  const selectedStock = useMemo(() => {
    return stocks.find(s => s.symbol === selectedStockSymbol) || null
  }, [stocks, selectedStockSymbol])
  
  // Generate mock data for the selected stock
  const candlestickData = useMemo(() => {
    return generateMockCandlestickData(30)
  }, [selectedStockSymbol])
  
  const agentMessages = useMemo(() => {
    return selectedStockSymbol ? generateAgentDebate(selectedStockSymbol) : []
  }, [selectedStockSymbol])
  
  const predictionData = useMemo(() => {
    return generatePredictionData(14)
  }, [selectedStockSymbol])
  
  // Handle stock selection
  const handleSelectStock = (symbol: string) => {
    setSelectedStockSymbol(symbol)
    setCurrentView("market")
  }
  
  // Handle view change
  const handleViewChange = (view: DashboardView) => {
    setCurrentView(view)
  }
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navbar */}
      <DashboardNavbar 
        currentView={currentView}
        onViewChange={handleViewChange}
        selectedStock={selectedStockSymbol}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Watchlist */}
        <WatchlistSidebar 
          stocks={stocks}
          selectedStock={selectedStockSymbol}
          onSelectStock={handleSelectStock}
        />
        
        {/* Right Workspace - Dynamic Content */}
        {currentView === "market" ? (
          <MarketView 
            selectedStock={selectedStock}
            candlestickData={candlestickData}
            onViewChange={handleViewChange}
          />
        ) : (
          <AnalysisView 
            selectedStock={selectedStock}
            agentMessages={agentMessages}
            predictionData={predictionData}
            onViewChange={handleViewChange}
          />
        )}
      </div>
    </div>
  )
}
