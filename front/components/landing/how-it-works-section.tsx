import { Search, MessageSquare, TrendingUp, Target } from 'lucide-react'

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Select Your Stock',
    description: 'Choose any stock from the market. Our system supports real-time data from major exchanges.'
  },
  {
    icon: MessageSquare,
    step: '02',
    title: 'Agents Analyze & Debate',
    description: 'Each AI agent analyzes the stock from their unique risk perspective and engages in structured debate.'
  },
  {
    icon: TrendingUp,
    step: '03',
    title: 'Consensus Formation',
    description: 'The Aegis orchestrator synthesizes all viewpoints and forms a balanced consensus recommendation.'
  },
  {
    icon: Target,
    step: '04',
    title: 'Actionable Insights',
    description: 'Receive clear predictions, confidence levels, and reasoning behind the final trading recommendation.'
  }
]

export function HowItWorksSection() {
  return (
    <section className="relative py-24 px-6">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              How{' '}
            </span>
            <span className="text-primary">It Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From stock selection to actionable insights in four simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center group">
                {/* Step Circle */}
                <div className="relative z-10 mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl glass-card border-primary/20 group-hover:border-primary/50 group-hover:glow-green transition-all duration-300">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                    {step.step}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
