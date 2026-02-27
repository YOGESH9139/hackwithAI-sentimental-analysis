"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, BarChart3, Brain, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import type { DashboardView } from "@/lib/types"

interface DashboardNavbarProps {
  currentView: DashboardView
  onViewChange: (view: DashboardView) => void
  selectedStock: string | null
}

export function DashboardNavbar({ currentView, onViewChange, selectedStock }: DashboardNavbarProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  
  const handleLogout = () => {
    logout()
    router.push("/")
  }
  
  return (
    <nav className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">Aegis Trader</span>
        </div>
        
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          <button
            onClick={() => onViewChange("market")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              currentView === "market" 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BarChart3 className="h-4 w-4" />
            Market
          </button>
          <button
            onClick={() => onViewChange("analysis")}
            disabled={!selectedStock}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              currentView === "analysis" 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground",
              !selectedStock && "opacity-50 cursor-not-allowed"
            )}
          >
            <Brain className="h-4 w-4" />
            Agentic Analysis
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Welcome, <span className="text-foreground font-medium">{user?.username}</span>
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="border-border text-foreground hover:bg-secondary"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </nav>
  )
}
