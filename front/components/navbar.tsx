"use client"

import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Activity, ChevronDown, LogOut, User } from 'lucide-react'
import GradualBlur from '@/components/ui/gradblur'

interface NavbarProps {
  showAuthButtons?: boolean
  showDashboardNav?: boolean
  activeTab?: string
}

export function Navbar({ showAuthButtons = true, showDashboardNav = false, activeTab }: NavbarProps) {
  const { user, logout, isLoading } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5">
      <div className="relative glass overflow-hidden">
        <div className="absolute top-0 inset-0 z-0 pointer-events-none">
          <GradualBlur
            position="top"
            height="2.5rem"
            strength={0.1}
            divCount={5}
            curve="bezier"
            exponential
            opacity={0}
          />
        </div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xl z-10" />
        <div className="relative z-20 flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 group-hover:glow-green transition-all duration-300">
            <Activity className="h-5 w-5 text-primary" />
          </div> */}
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Aegis<span className="text-primary">Trader</span>
            </span>
          </Link>

          {/* Dashboard Navigation */}
          {showDashboardNav && user && (
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={activeTab === 'dashboard' ? 'bg-white/10 text-white hover:bg-white/20' : 'text-muted-foreground hover:text-white hover:bg-white/5'}
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/portfolio">
                <Button
                  variant="ghost"
                  size="sm"
                  className={activeTab === 'portfolio' ? 'bg-white/10 text-white hover:bg-white/20' : 'text-muted-foreground hover:text-white hover:bg-white/5'}
                >
                  Portfolio
                </Button>
              </Link>
              <Link href="/dashboard/orders">
                <Button
                  variant="ghost"
                  size="sm"
                  className={activeTab === 'orders' ? 'bg-white/10 text-white hover:bg-white/20' : 'text-muted-foreground hover:text-white hover:bg-white/5'}
                >
                  Orders
                </Button>
              </Link>
              <Link href="/dashboard/analysis">
                <Button
                  variant={activeTab === 'analysis' ? 'default' : 'ghost'}
                  size="sm"
                  className={activeTab === 'analysis' ? 'bg-primary text-primary-foreground glow-green' : 'text-primary hover:text-primary hover:bg-primary/10'}
                >
                  <Activity className="mr-1.5 h-4 w-4" />
                  Agentic Analysis
                </Button>
              </Link>
            </nav>
          )}

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {!isLoading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="hidden sm:inline">{user.username}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : showAuthButtons ? (
                  <>
                    <Link href="/auth">
                      <Button variant="ghost" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth?mode=signup">
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
