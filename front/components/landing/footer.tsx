import Link from 'next/link'
import { Activity } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6 glass">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Aegis<span className="text-primary">Trader</span>
            </span>
          </Link>
          
          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Documentation
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              API
            </Link>
          </nav>
          
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            Built for Hackathon 2026
          </p>
        </div>
      </div>
    </footer>
  )
}
