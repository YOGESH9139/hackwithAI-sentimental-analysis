"use client"

import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts'
import { Activity } from 'lucide-react'

interface ConsensusChartProps {
  symbol: string
}

// Mock data - will be replaced with actual AI analysis
const radarData = [
  { metric: 'Sentiment', value: 78 },
  { metric: 'Technical', value: 65 },
  { metric: 'Fundamental', value: 52 },
  { metric: 'Momentum', value: 85 },
  { metric: 'Risk', value: 45 },
  { metric: 'Volume', value: 72 },
]

const agentConfidenceData = [
  { name: 'Conservative', confidence: 65, color: '#3b82f6' },
  { name: 'Moderate', confidence: 72, color: '#eab308' },
  { name: 'Growth', confidence: 68, color: '#f97316' },
  { name: 'Aggressive', confidence: 91, color: '#ef4444' },
]

export function ConsensusChart({ symbol }: ConsensusChartProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-white/5 flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">Analysis Metrics for {symbol}</h2>
      </div>
      <div className="p-5">
        {/* Radar Chart */}
        <div className="h-[220px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis 
                dataKey="metric" 
                tick={{ fill: '#8a8a9a', fontSize: 11 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]}
                tick={{ fill: '#8a8a9a', fontSize: 10 }}
                axisLine={false}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#00D094"
                fill="#00D094"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Legend 
                wrapperStyle={{ color: '#8a8a9a' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Confidence Bar Chart */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-foreground">Agent Confidence Levels</h4>
          <div className="h-[130px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentConfidenceData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80}
                  tick={{ fill: '#8a8a9a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(20, 20, 30, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#f0f0f5',
                    backdropFilter: 'blur(10px)'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Confidence']}
                />
                <Bar 
                  dataKey="confidence" 
                  radius={[0, 6, 6, 0]}
                >
                  {agentConfidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t border-white/5">
          Metrics based on simulated multi-agent analysis
        </p>
      </div>
    </div>
  )
}
