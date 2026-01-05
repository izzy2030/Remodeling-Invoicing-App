'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Plus,
  Loader2,
  TrendingUp,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Zap,
  ArrowRight,
  MoreHorizontal,
  Hammer,
  Sparkles,
  ChevronRight,
  Target,
  Wallet,
  Eye,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { OverviewChart } from '@/components/dashboard/OverviewChart'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/Button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ totalRevenue: 0, pendingCount: 0, clientCount: 0 })
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const [
      { data: { user: currentUser } },
      invoicesRes,
      chartInvoicesRes,
      clientsRes,
      settingsRes
    ] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('invoices').select('*, clients(*)').order('created_at', { ascending: false }).limit(6),
      supabase.from('invoices')
        .select('created_at, labor_line1_amount, labor_line2_amount, materials_line1_amount, materials_line2_amount, materials_line3_amount, tax_rate')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true }),
      supabase.from('clients').select('*', { count: 'exact' }),
      supabase.from('settings').select('*').eq('id', 1).single()
    ])

    if (!settingsRes.data || !settingsRes.data.company_name) {
      router.push('/settings?onboarding=true')
      return
    }

    setUser(currentUser)

    if (invoicesRes.data) {
      setRecentInvoices(invoicesRes.data)
      
       const calculateTotal = (inv: any) => {
        const subtotal = (inv.labor_line1_amount || 0) + (inv.labor_line2_amount || 0) +
          (inv.materials_line1_amount || 0) + (inv.materials_line2_amount || 0) + (inv.materials_line3_amount || 0)
        const tax = (subtotal * (inv.tax_rate || 0)) / 100
        return subtotal + tax
      }

      if (chartInvoicesRes.data) {
        // Group by month
        const monthlyData = new Map<string, number>()
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
          const d = new Date()
          d.setMonth(d.getMonth() - i)
          const key = d.toLocaleString('default', { month: 'short' })
          monthlyData.set(key, 0)
        }

        let totalRev = 0
        let pending = 0

        chartInvoicesRes.data.forEach(inv => {
          const amount = calculateTotal(inv)
          const date = new Date(inv.created_at)
          const key = date.toLocaleString('default', { month: 'short' })
          
          if (monthlyData.has(key)) {
             monthlyData.set(key, (monthlyData.get(key) || 0) + amount)
          }
          totalRev += amount
        })

        pending = invoicesRes.data.length 

        setStats({
          totalRevenue: totalRev,
          pendingCount: pending,
          clientCount: clientsRes.count || 0
        })

        const formattedChartData = Array.from(monthlyData).map(([name, total]) => ({
          name,
          total
        }))
        setChartData(formattedChartData)
      }
    }
    setLoading(false)
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl blur-xl animate-pulse" />
        <div className="relative bg-gradient-to-br from-primary to-accent p-4 rounded-2xl">
          <Hammer className="w-8 h-8 text-primary-foreground animate-bounce" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[11px]">Preparing Dashboard</p>
        <div className="flex items-center gap-1 justify-center">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/60"
              style={{
                animation: 'pulse 1s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )

  const Sparkline = ({ color, trend }: { color: string, trend: 'up' | 'down' }) => {
    const data = trend === 'up' 
      ? [{v: 10}, {v: 20}, {v: 15}, {v: 25}, {v: 20}, {v: 35}, {v: 40}]
      : [{v: 40}, {v: 35}, {v: 20}, {v: 25}, {v: 15}, {v: 20}, {v: 10}]
    
    return (
      <div className="w-32 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`spark-${color}-${trend}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              fill={`url(#spark-${color}-${trend})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const StatCard = ({
    title,
    value,
    trend,
    trendValue,
    color,
    sparkTrend,
    icon: Icon,
    delay
  }: {
    title: string
    value: string
    trend: 'up' | 'down'
    trendValue: string
    color: string
    sparkTrend: 'up' | 'down'
    icon: any
    delay: number
  }) => (
    <div
      className="card-premium card-diagonal p-6 animate-fade-up shadow-sm hover:shadow-md"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex justify-between items-start mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner"
          style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <Sparkline color={color} trend={sparkTrend} />
      </div>

      <div className="space-y-2">
        <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-tight">{title}</p>
        <h3 className="text-3xl font-bold text-foreground font-syne tracking-tight">{value}</h3>
        <div className="flex items-center gap-2 pt-1">
          <span className={`
            flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-md
            ${trend === 'up'
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
              : 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20'
            }
          `}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">vs last week</span>
        </div>
      </div>
    </div>
  )

  const InvoiceCard = ({ invoice, index }: { invoice: any, index: number }) => {
    const total = (invoice.labor_line1_amount || 0) + (invoice.labor_line2_amount || 0) +
      (invoice.materials_line1_amount || 0) + (invoice.materials_line2_amount || 0)

    return (
      <div
        className="card-premium p-5 group animate-fade-up hover:scale-[1.02] active:scale-[0.98]"
        style={{ animationDelay: `${0.3 + (index * 0.05)}s` }}
      >
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-gradient-to-br from-secondary to-secondary/50 rounded-xl flex items-center justify-center font-bold text-muted-foreground border border-border text-sm group-hover:from-primary/10 group-hover:to-accent/10 group-hover:text-primary transition-all duration-500 shadow-sm">
              {invoice.clients?.name?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-foreground text-[15px] tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                {invoice.clients?.name}
              </h4>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-2 py-0.5 rounded-md w-fit mt-1 border border-border">
                {invoice.invoice_number}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)}>
                 <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
                 View Details
               </DropdownMenuItem>
               <DropdownMenuItem>
                 <Sparkles className="w-4 h-4 mr-2 text-muted-foreground" />
                 Generate Note
               </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="pt-4 border-t border-border/60">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Amount</p>
              <p className="text-xl font-bold text-foreground font-syne tracking-tight">${total.toLocaleString()}</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="secondary" size="icon" className="h-10 w-10 hover:bg-primary hover:text-white group/btn">
                    <Link href={`/invoices/${invoice.id}`}>
                      <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Invoice</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Header */}
      <section className="animate-fade-up">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5 text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">Revenue Overview</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col justify-start">
             <h2 className="text-4xl md:text-5xl font-bold font-syne tracking-tight leading-none mb-1">
              <span className="text-gradient">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </h2>
            <p className="text-muted-foreground font-medium">Total revenue (Last 6 Months)</p>
            <div className="mt-6 flex gap-3">
               <Button size="sm" variant="outline" onClick={() => router.push('/invoices')}>
                 Invoices
               </Button>
               <Button size="sm" variant="ghost">
                 Settings
               </Button>
            </div>
          </div>
          {chartData.some(d => d.total > 0) && (
            <div className="lg:col-span-2 h-[160px] w-full mt-2 lg:mt-0 bg-white/50 dark:bg-black/20 rounded-3xl p-4 border border-border/50">
              <OverviewChart data={chartData} />
            </div>
          )}
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 -mt-2">
        <StatCard
          title="New Invoices"
          value={stats.pendingCount.toString()}
          trend="up"
          trendValue="+15%"
          color="var(--primary)"
          sparkTrend="up"
          icon={Target}
          delay={0.1}
        />
        <StatCard
          title="Pending Amount"
          value={`$${(stats.totalRevenue * 0.4).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          trend="down"
          trendValue="-4%"
          color="#f59e0b"
          sparkTrend="down"
          icon={Clock}
          delay={0.15}
        />
        <StatCard
          title="Active Clients"
          value={stats.clientCount.toString()}
          trend="up"
          trendValue="+8%"
          color="#10b981"
          sparkTrend="up"
          icon={TrendingUp}
          delay={0.2}
        />
      </div>

      {/* Recent Transactions */}
      <section className="space-y-6">
        <div className="flex items-center justify-between animate-fade-up" style={{ animationDelay: '0.25s' }}>
          <div>
            <h2 className="text-2xl font-bold text-foreground font-syne tracking-tight">Recent Invoices</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Your latest billing activity</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="font-bold text-primary hover:text-primary">
            <Link href="/invoices" className="flex items-center gap-2">
              View all
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Draft</span>
              <span className="text-[11px] font-bold text-foreground bg-secondary px-2 py-0.5 rounded-md border border-border">2</span>
            </div>
            <div className="space-y-4">
              {recentInvoices.slice(0, 2).map((inv, i) => <InvoiceCard key={inv.id} invoice={inv} index={i} />)}
              <Button
                variant="outline"
                className="w-full py-8 border-2 border-dashed border-border rounded-[1.5rem] text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm font-bold gap-2 group animate-fade-up h-auto"
                style={{ animationDelay: '0.4s' }}
                onClick={() => router.push('/invoices/new')}
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                New Invoice
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Pending</span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">2</span>
            </div>
            <div className="space-y-4">
              {recentInvoices.slice(2, 4).map((inv, i) => <InvoiceCard key={inv.id} invoice={inv} index={i + 2} />)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Paid</span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">2</span>
            </div>
            <div className="space-y-4">
              {recentInvoices.slice(4, 6).map((inv, i) => <InvoiceCard key={inv.id} invoice={inv} index={i + 4} />)}
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant CTA */}
      <div
        className="relative rounded-[2.5rem] overflow-hidden animate-fade-up shadow-2xl shadow-primary/10 group"
        style={{ animationDelay: '0.5s' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent transition-transform duration-700 group-hover:scale-105" />

        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />

        <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-8 max-w-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/15 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center border border-white/20 shadow-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-white/40 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-3xl md:text-5xl font-bold text-white font-syne tracking-tight leading-tight">
                AI-Powered Invoicing
              </h3>
              <p className="text-white/80 font-medium text-lg mt-4 leading-relaxed max-w-md">
                Create professional invoices instantly using natural language.
                Just describe your work and let AI handle the rest.
              </p>
            </div>

            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-2xl shadow-black/20 rounded-2xl h-16 px-10 group/cta">
              <Link href="/invoices/ai" className="flex items-center gap-3">
                <span className="text-base uppercase tracking-wider">Try AI Invoice</span>
                <ArrowRight className="w-6 h-6 group-hover/cta:translate-x-1.5 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl scale-150" />
            <div className="relative w-64 h-64 border-2 border-white/10 rounded-full flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white/5 rounded-full flex items-center justify-center animate-float overflow-hidden">
                <Sparkles className="w-24 h-24 text-white/10" />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                 <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
