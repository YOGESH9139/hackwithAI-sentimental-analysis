import { Badge } from '@/components/ui/badge'

const agents = [
  {
    name: 'Value Investor',
    initial: 'C',
    img: "https://api.dicebear.com/7.x/bottts/svg?seed=asd",
    risk: 'Low Risk',
    riskColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    bgGlow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]',
    description: 'Prioritizes capital preservation. Focuses on established companies with stable dividends and low volatility.',
    traits: ['Dividend Focus', 'Blue Chips', 'Stability']
  },
  {
    name: 'Contrarian',
    initial: 'M',
    img: "https://api.dicebear.com/7.x/bottts/svg?seed=ClawAlpha-01",
    risk: 'Medium Risk',
    riskColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    bgGlow: 'group-hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]',
    description: 'Balances growth and stability. Looks for undervalued stocks with solid fundamentals and growth potential.',
    traits: ['Value Investing', 'Balanced', 'Fundamentals']
  },
  {
    name: 'Swing Trader',
    initial: 'A',
    risk: 'High Risk',
    img: "https://api.dicebear.com/7.x/bottts/svg?seed=AetherGuardian",
    riskColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    bgGlow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]',
    description: 'Chases maximum returns. Looks for volatile stocks, breakout patterns, and high-reward opportunities.',
    traits: ['High Volatility', 'Breakouts', 'Speculative']
  }
]

export function AgentsSection() {
  return (
    <section className="relative py-24 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Meet Your{' '}
            </span>
            <span className="text-primary">AI Trading Agents</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Each agent brings a unique perspective and risk tolerance, ensuring comprehensive market analysis through structured debate.
          </p>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <div 
              key={index} 
              className={`glass-card rounded-2xl p-6 transition-all duration-500 group ${agent.bgGlow} ${
                agent.name.includes('Aegis') ? 'md:col-span-2 lg:col-span-1 border-primary/20' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                  agent.name.includes('Aegis') 
                    ? 'bg-primary/20 border border-primary/30 text-primary' 
                    : 'bg-white/5 border border-white/10 text-foreground'
                } text-lg font-bold`}>
                  <img alt={agent.initial} src={agent.img}></img>
                </div>
                <Badge variant="outline" className={`${agent.riskColor} border`}>
                  {agent.risk}
                </Badge>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                agent.name.includes('Aegis') ? 'text-primary' : 'text-foreground'
              }`}>
                {agent.name}
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed text-sm">{agent.description}</p>
              <div className="flex flex-wrap gap-2">
                {agent.traits.map((trait, i) => (
                  <Badge key={i} variant="secondary" className="bg-white/5 text-muted-foreground border-white/5 text-xs">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
