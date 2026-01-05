'use client'

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useTheme } from '@/components/ThemeProvider'

interface OverviewChartProps {
  data: {
    name: string
    total: number
  }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/90 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl animate-scale-in">
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{label}</p>
        <p className="text-lg font-bold text-primary font-syne">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

export function OverviewChart({ data }: OverviewChartProps) {
  const isEmpty = !data || data.length === 0 || data.every(item => item.total === 0)

  if (isEmpty) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-2xl bg-secondary/10">
        <p className="text-muted-foreground text-sm font-medium">No revenue data available</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full outline-none select-none" tabIndex={-1}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
          
          <XAxis 
            dataKey="name" 
            stroke="var(--muted-foreground)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            dy={10}
            minTickGap={20}
          />
          <YAxis 
            stroke="var(--muted-foreground)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
            dx={-10}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
          
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--primary)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
