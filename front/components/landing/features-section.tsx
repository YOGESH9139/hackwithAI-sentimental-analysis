"use client"

import { 
  Bot, 
  MessageSquare, 
  BarChart3, 
  Shield, 
  Zap, 
  Target 
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Bot,
    title: "Multi-Agent Architecture",
    description: "Multiple AI agents with distinct risk profiles (Aggressive, Conservative, Balanced) analyze market data simultaneously."
  },
  {
    icon: MessageSquare,
    title: "Agent Debate System",
    description: "Watch AI agents debate trading strategies in real-time, weighing risks and opportunities from different perspectives."
  },
  {
    icon: BarChart3,
    title: "Sentiment Analysis",
    description: "Advanced NLP analyzes news, social media, and market indicators to gauge market sentiment accurately."
  },
  {
    icon: Target,
    title: "Orchestrated Predictions",
    description: "Our orchestrator synthesizes all agent inputs to deliver a unified, optimized trading recommendation."
  },
  {
    icon: Zap,
    title: "Real-Time Processing",
    description: "Live market data integration with AlphaVantage API for up-to-the-minute analysis and predictions."
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Built-in risk assessment with visual gauges and heatmaps to help you understand potential exposure."
  }
]

export function FeaturesSection() {
  return (
    <section className="relative py-24 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl mb-4">
            The <span className="text-primary">Agentic Orchestrator</span> Explained
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
            Aegis revolutionizes trading by combining multiple AI perspectives into a single, 
            intelligent trading assistant.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-card border-border hover:border-primary/50 transition-colors group"
            >
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
