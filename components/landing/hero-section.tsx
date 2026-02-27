"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, Brain, TrendingUp } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2420_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2420_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
          <Bot className="h-4 w-4" />
          <span>Powered by Multi-Agent AI Orchestration</span>
        </div>
        
        <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-foreground md:text-7xl">
          Trade Smarter with
          <span className="block text-primary">Agentic Intelligence</span>
        </h1>
        
        <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
          Aegis combines multiple AI risk-profile agents that analyze market sentiment, 
          debate strategies, and deliver orchestrated trading insights in real-time.
        </p>
        
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/auth">
            <Button 
              size="lg" 
              className="group bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 font-semibold"
            >
              Try It Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-border text-foreground hover:bg-secondary text-lg px-8 py-6"
          >
            Watch Demo
          </Button>
        </div>
        
        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur">
            <Brain className="mx-auto mb-3 h-8 w-8 text-primary" />
            <div className="text-3xl font-bold text-foreground">3+</div>
            <div className="text-sm text-muted-foreground">AI Risk Agents</div>
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur">
            <TrendingUp className="mx-auto mb-3 h-8 w-8 text-primary" />
            <div className="text-3xl font-bold text-foreground">Real-Time</div>
            <div className="text-sm text-muted-foreground">Market Analysis</div>
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur">
            <Bot className="mx-auto mb-3 h-8 w-8 text-primary" />
            <div className="text-3xl font-bold text-foreground">Orchestrated</div>
            <div className="text-sm text-muted-foreground">Consensus Output</div>
          </div>
        </div>
      </div>
    </section>
  )
}
