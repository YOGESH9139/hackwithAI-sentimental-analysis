"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Aegis Trader</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              Login / Signup
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
