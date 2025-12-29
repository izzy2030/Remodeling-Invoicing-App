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
  Wallet
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ totalRevenue: 0, pendingCount: 0, clientCount: 0 })
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    const [
      { data: { user: currentUser } },
      invoicesRes,
      clientsRes,
      settingsRes
    ] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('invoices').select('*, clients(*)').order('created_at', { ascending: false }).limit(6),
      supabase.from('clients').select('*', { count: 'exact' }),
      supabase.from('settings').select('*').eq('id', 1).single()
    ])

    setUser(currentUser)

    if (invoicesRes.data) {
      setRecentInvoices(invoicesRes.data)

      const total = invoicesRes.data.reduce((acc, inv) => {
        const subtotal = (inv.labor_line1_amount || 0) + (inv.labor_line2_amount || 0) +
          (inv.materials_line1_amount || 0) + (inv.materials_line2_amount || 0)
        const tax = (subtotal * (inv.tax_rate || 0)) / 100
        return acc + subtotal + tax
      }, 0)

      setStats({
        totalRevenue: total,
        pendingCount: invoicesRes.data.length,
        clientCount: clientsRes.count || 0
      })
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

  const Sparkline = ({ color, trend }: { color: string, trend: 'up' | 'down' }) => (
    <div className="w-28 h-12 relative overflow-hidden opacity-80">
      <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={`spark-${color}-${trend}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={trend === 'up'
            ? "M0 35 Q 15 32, 25 28 T 45 22 T 65 15 T 85 10 T 100 5"
            : "M0 5 Q 15 8, 25 15 T 45 22 T 65 28 T 85 32 T 100 35"
          }
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          className="animate-draw"
        />
        <path
          d={trend === 'up'
            ? "M0 35 Q 15 32, 25 28 T 45 22 T 65 15 T 85 10 T 100 5 V 40 H 0 Z"
            : "M0 5 Q 15 8, 25 15 T 45 22 T 65 28 T 85 32 T 100 35 V 40 H 0 Z"
          }
          fill={`url(#spark-${color}-${trend})`}
        />
      </svg>
    </div>
  )

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
      className="card-premium card-diagonal p-6 animate-fade-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex justify-between items-start mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <Sparkline color={color} trend={sparkTrend} />
      </div>

      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-muted-foreground">{title}</p>
        <h3 className="text-3xl font-bold text-foreground font-syne tracking-tight">{value}</h3>
        <div className="flex items-center gap-2 pt-1">
          <span className={`
            flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-md
            ${trend === 'up'
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
              : 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
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
        className="card-premium p-5 group animate-fade-up"
        style={{ animationDelay: `${0.3 + (index * 0.05)}s` }}
      >
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-gradient-to-br from-secondary to-secondary/50 rounded-xl flex items-center justify-center font-bold text-muted-foreground border border-border text-sm group-hover:from-primary/10 group-hover:to-accent/10 group-hover:text-primary transition-all duration-300">
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
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Amount</p>
              <p className="text-xl font-bold text-foreground font-syne tracking-tight">${total.toLocaleString()}</p>
            </div>
            <Link
              href={`/invoices/${invoice.id}`}
              className="w-10 h-10 flex items-center justify-center bg-secondary text-muted-foreground rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 group/btn"
            >
              <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </Link>
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
        <h2 className="text-5xl md:text-6xl font-bold font-syne tracking-tight">
          <span className="text-gradient">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </h2>
        <p className="text-muted-foreground font-medium mt-2">Total revenue this period</p>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
          <Link
            href="/invoices"
            className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
          >
            View all
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Draft</span>
              <span className="text-[11px] font-bold text-foreground bg-secondary px-2 py-0.5 rounded-md">2</span>
            </div>
            <div className="space-y-4">
              {recentInvoices.slice(0, 2).map((inv, i) => <InvoiceCard key={inv.id} invoice={inv} index={i} />)}
              <button
                className="w-full flex items-center justify-center py-5 border-2 border-dashed border-border rounded-2xl text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm font-bold gap-2 group animate-fade-up"
                style={{ animationDelay: '0.4s' }}
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                New Invoice
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Pending</span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">2</span>
            </div>
            <div className="space-y-4">
              {recentInvoices.slice(2, 4).map((inv, i) => <InvoiceCard key={inv.id} invoice={inv} index={i + 2} />)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Paid</span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">2</span>
            </div>
            <div className="space-y-4">
              {recentInvoices.slice(4, 6).map((inv, i) => <InvoiceCard key={inv.id} invoice={inv} index={i + 4} />)}
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant CTA */}
      <div
        className="relative rounded-[2rem] overflow-hidden animate-fade-up grain"
        style={{ animationDelay: '0.5s' }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />

        {/* Decorative elements */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />

        {/* Content */}
        <div className="relative z-10 p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-6 max-w-xl">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-white/60 rounded-full"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-white font-syne tracking-tight leading-tight">
                AI-Powered Invoicing
              </h3>
              <p className="text-white/70 font-medium text-lg mt-3 leading-relaxed max-w-md">
                Create professional invoices instantly using natural language.
                Just describe your work and let AI handle the rest.
              </p>
            </div>

            <Link
              href="/invoices/ai"
              className="inline-flex items-center gap-3 h-14 px-8 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition-all shadow-xl shadow-black/10 group"
            >
              <span className="text-sm uppercase tracking-wide">Try AI Invoice</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Decorative icon */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl scale-150" />
              <div className="relative w-48 h-48 border-2 border-white/10 rounded-full flex items-center justify-center">
                <div className="w-32 h-32 border-2 border-white/10 rounded-full flex items-center justify-center animate-float">
                  <Sparkles className="w-16 h-16 text-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
