"use client"

import { useAuth } from '@/context/auth-context'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function CTASection() {
  const { user } = useAuth()

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[150px]" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Start for Free</span>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Ready to Trade with{' '}
          </span>
          <span className="text-primary text-glow-green">AI Intelligence?</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Join the future of trading where multiple AI perspectives converge to give you the best possible insights.
        </p>
        
        <Link href={user ? "/dashboard" : "/auth"}>
          <Button size="lg" className="h-14 px-10 text-lg bg-primary text-primary-foreground hover:bg-primary/90 glow-green transition-all duration-300">
            {user ? "Go to Dashboard" : "Get Started Free"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        
        <p className="mt-6 text-sm text-muted-foreground">
          No credit card required. Start with mock trading today.
        </p>
      </div>
    </section>
  )
}
