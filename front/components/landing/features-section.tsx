import { 
  Brain, 
  MessageSquare, 
  BarChart3, 
  Zap,
  Target,
  Shield
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Sentiment Analysis',
    description: 'Advanced NLP models analyze news, social media, and market sentiment in real-time to gauge market mood.'
  },
  {
    icon: MessageSquare,
    title: 'Agent Debate System',
    description: 'Multiple AI agents with different risk appetites debate and challenge each other to reach optimal conclusions.'
  },
  {
    icon: BarChart3,
    title: 'Prediction Visualization',
    description: 'Interactive charts showing agent predictions, confidence levels, and final consensus recommendations.'
  },
  {
    icon: Target,
    title: 'Live Market Data',
    description: 'Real-time stock data integration via Alpha Vantage for accurate and up-to-date market analysis.'
  },
  {
    icon: Zap,
    title: 'Instant Insights',
    description: 'Get actionable trading insights within seconds as agents rapidly process and debate market conditions.'
  },
  {
    icon: Shield,
    title: 'Risk Profiling',
    description: 'Each agent represents a different risk profile - from conservative to aggressive - for balanced perspectives.'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 px-6">
      <div className="absolute inset-0 gradient-bg opacity-50" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Powered by{' '}
            </span>
            <span className="text-primary">Intelligent Agents</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform combines multiple AI agents, each with unique perspectives, to deliver comprehensive market analysis.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-4 group-hover:glow-green transition-all">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
