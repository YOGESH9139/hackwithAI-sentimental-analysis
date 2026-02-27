"use client"

import { useAuth } from '@/context/auth-context'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Bot, Shield, Sparkles } from 'lucide-react'

export function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute inset-0 grid-pattern" />
      
      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
          {/* <Sparkles className="h-4 w-4 text-primary" /> */}
          <span className="text-sm font-medium text-primary">Multi-Agent AI Trading System</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance">
          <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Trade Smarter with
          </span>
          <span className="block text-primary text-glow-green mt-2">
            Agentic Consensus
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 text-balance leading-relaxed">
          Multiple AI agents with different risk profiles analyze, debate, and converge on 
          <span className="text-foreground font-medium"> optimal trading decisions</span>. 
          Real-time sentiment analysis meets collective intelligence.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href={user ? "/dashboard" : "/auth"}>
            <Button size="lg" className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 glow-green transition-all duration-300">
              {user ? "Go to Dashboard" : "Start Trading"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Stats Cards with Glassmorphism */}
        {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center hover:border-primary/30 transition-all duration-300 group">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-4 group-hover:glow-green transition-all">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <span className="text-3xl font-bold text-white mb-1">4+</span>
            <span className="text-muted-foreground">Risk-Profiled Agents</span>
          </div>
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center hover:border-primary/30 transition-all duration-300 group">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-4 group-hover:glow-green transition-all">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <span className="text-3xl font-bold text-white mb-1">Real-time</span>
            <span className="text-muted-foreground">Sentiment Analysis</span>
          </div>
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center hover:border-primary/30 transition-all duration-300 group">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-4 group-hover:glow-green transition-all">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <span className="text-3xl font-bold text-white mb-1">Consensus</span>
            <span className="text-muted-foreground">Decision Making</span>
          </div>
        </div> */}
      </div>
    </section>
  )
}
