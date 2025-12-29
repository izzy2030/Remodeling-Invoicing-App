'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Plus, 
  Search, 
  Bell, 
  Loader2, 
  TrendingUp, 
  Users, 
  Clock, 
  Calendar,
  ArrowUpRight,
  TrendingDown,
  Zap,
  ChevronRight,
  FileText,
  UserPlus,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ totalRevenue: 0, pendingCount: 0, clientCount: 0 })
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    const [{ data: { user: currentUser } }, invoicesRes, clientsRes] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('invoices').select('*, clients(*)').order('created_at', { ascending: false }).limit(6),
      supabase.from('clients').select('*', { count: 'exact' })
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
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Preparing Dashboard...</p>
    </div>
  )

  const Sparkline = ({ color, trend }: { color: string, trend: 'up' | 'down' }) => (
    <div className="w-32 h-12 relative overflow-hidden">
      <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
        <path 
          d={trend === 'up' ? "M0 35 Q 25 35, 40 25 T 70 20 T 100 5" : "M0 5 Q 25 5, 40 15 T 70 20 T 100 35"} 
          fill="none" 
          stroke={color} 
          strokeWidth="3" 
          strokeLinecap="round"
          className="animate-draw"
        />
        <path 
          d={trend === 'up' ? "M0 35 Q 25 35, 40 25 T 70 20 T 100 5 V 40 H 0 Z" : "M0 5 Q 25 5, 40 15 T 70 20 T 100 35 V 40 H 0 Z"} 
          fill={`url(#gradient-${color})`}
          opacity="0.1"
        />
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )

  const StatCard = ({ title, value, trend, trendValue, color, sparkTrend }: { title: string, value: string, trend: 'up' | 'down', trendValue: string, color: string, sparkTrend: 'up' | 'down' }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium group hover:border-slate-200 transition-all flex flex-col justify-between overflow-hidden relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[13px] font-medium text-slate-500 mb-6">{title}</p>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-900 font-outfit">{value}</h3>
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 text-[13px] font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-orange-500'}`}>
                {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trendValue}
              </span>
              <span className="text-[11px] font-medium text-slate-400">compared to last week</span>
            </div>
          </div>
        </div>
        <Sparkline color={color} trend={sparkTrend} />
      </div>
    </div>
  )

  const ActivityCard = ({ invoice }: { invoice: any }) => {
    const total = (invoice.labor_line1_amount || 0) + (invoice.labor_line2_amount || 0) + 
                  (invoice.materials_line1_amount || 0) + (invoice.materials_line2_amount || 0)
    
    return (
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-premium group hover:border-slate-200 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-400 border border-slate-200 uppercase text-xs">
              {invoice.clients?.name?.[0]}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-primary transition-colors truncate max-w-[140px]">
                {invoice.clients?.name}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded w-fit mt-0.5">
                {invoice.invoice_number}
              </p>
            </div>
          </div>
          <button className="text-slate-300 hover:text-slate-900">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        
        <div className="pt-4 border-t border-slate-50">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Amount Due</p>
              <p className="text-lg font-black text-slate-900 font-outfit leading-none">${total.toLocaleString()}</p>
            </div>
            <Link 
              href={`/invoices/${invoice.id}`}
              className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg hover:bg-primary hover:text-white transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header Stat */}
      <section className="space-y-1">
        <p className="text-xl font-bold text-slate-900 font-outfit tracking-tight">Your total revenue</p>
        <h2 className="text-5xl font-black text-primary font-outfit tracking-tighter">
          ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h2>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="New invoices" 
          value={stats.pendingCount.toString()} 
          trend="up" 
          trendValue="15%" 
          color="#09090b" 
          sparkTrend="up" 
        />
        <StatCard 
          title="Pending amount" 
          value={`$${(stats.totalRevenue * 0.4).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          trend="down" 
          trendValue="4%" 
          color="#f59e0b" 
          sparkTrend="down" 
        />
        <StatCard 
          title="Avg. invoice value" 
          value={`$${(stats.totalRevenue / (stats.pendingCount || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          trend="up" 
          trendValue="8%" 
          color="#10b981" 
          sparkTrend="up" 
        />
      </div>

      {/* Categorized Invoices */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-slate-900 font-outfit">Recent transactions</h2>
          <Link href="/invoices" className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-0.5 hover:opacity-70">View all</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="px-2 mb-4 text-[12px] font-bold text-slate-900 flex items-center justify-between">
              <span>Draft</span>
              <span className="text-slate-300">2</span>
            </p>
            <div className="space-y-4">
              {recentInvoices.slice(0, 2).map((inv, i) => <ActivityCard key={i} invoice={inv} />)}
              <button className="w-full flex items-center justify-center py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-primary hover:text-primary transition-all text-[13px] font-bold gap-2 group">
                <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                Add transaction
              </button>
            </div>
          </div>

          <div>
            <p className="px-2 mb-4 text-[12px] font-bold text-slate-900 flex items-center justify-between">
              <span>In Progress</span>
              <span className="text-slate-300">2</span>
            </p>
            <div className="space-y-4">
              {recentInvoices.slice(2, 4).map((inv, i) => <ActivityCard key={i} invoice={inv} />)}
            </div>
          </div>

          <div>
            <p className="px-2 mb-4 text-[12px] font-bold text-slate-900 flex items-center justify-between">
              <span>Paid</span>
              <span className="text-slate-300">2</span>
            </p>
            <div className="space-y-4">
              {recentInvoices.slice(4, 6).map((inv, i) => <ActivityCard key={i} invoice={inv} />)}
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Card - Styled like the screenshot's 'extension' block or better */}
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-premium relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-slate-800 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000 opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-slate-800 rounded-full blur-[80px] opacity-30" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-6 max-w-xl">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <Zap className="w-7 h-7 text-yellow-400 fill-yellow-400" />
            </div>
            <div>
              <h4 className="text-4xl font-black font-outfit leading-none mb-4 italic">Next Gen Billing</h4>
              <p className="text-white/60 font-medium text-lg leading-relaxed">
                Automate your entire remodeling business with our AI-powered flow assistant. 
                Just speak your invoice details and we'll handle the rest.
              </p>
            </div>
            <button className="h-14 px-8 bg-white text-slate-900 font-black rounded-2xl flex items-center gap-3 hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98] uppercase text-xs tracking-widest">
              Activate Assistant
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="hidden lg:block text-white/5">
            <div className="w-64 h-64 border-4 border-white/5 rounded-full flex items-center justify-center relative">
               <Zap className="w-24 h-24 text-white opacity-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

