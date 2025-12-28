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
  Zap,
  ChevronRight,
  FileText,
  UserPlus,
  ArrowRight
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
      supabase.from('invoices').select('*, clients(*)').order('created_at', { ascending: false }).limit(4),
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

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-outfit">
            {greeting()}, <span className="text-primary">{user?.user_metadata?.full_name?.split(' ')[0] || 'Partner'}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Here's a snapshot of your remodeling business today.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link 
            href="/invoices/new"
            className="h-14 px-8 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10 active:scale-[0.98]"
          >
            <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            Quick Invoice
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-primary/20 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <TrendingUp className="w-8 h-8 text-slate-100 group-hover:text-primary/10 transition-colors" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
          <h3 className="text-3xl font-extrabold text-slate-900 font-outfit">
            ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <ArrowUpRight className="w-3 h-3" />
            12% Increase
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-orange-200 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <Clock className="w-8 h-8 text-slate-100 group-hover:text-orange-500/10 transition-colors" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Checks</p>
          <h3 className="text-3xl font-extrabold text-slate-900 font-outfit">{stats.pendingCount}</h3>
          <p className="text-xs font-bold text-orange-500 mt-4 uppercase tracking-widest">Awaiting Payment</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-indigo-200 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <Users className="w-8 h-8 text-slate-100 group-hover:text-indigo-500/10 transition-colors" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Client Base</p>
          <h3 className="text-3xl font-extrabold text-slate-900 font-outfit">{stats.clientCount}</h3>
          <Link href="/clients" className="mt-4 flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">
            Manage Directory <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Activity */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-extrabold text-slate-900 font-outfit">Recent Activity</h2>
            <Link href="/invoices" className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">View All</Link>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium divide-y divide-slate-50">
            {recentInvoices.map((invoice, i) => {
              const total = (invoice.labor_line1_amount || 0) + (invoice.labor_line2_amount || 0) + 
                            (invoice.materials_line1_amount || 0) + (invoice.materials_line2_amount || 0)
              
              return (
                <Link key={i} href={`/invoices/${invoice.id}`} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors first:rounded-t-[2.5rem] last:rounded-b-[2.5rem] group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-slate-400 border border-slate-100 group-hover:bg-white group-hover:border-primary/20 transition-all">
                      {invoice.clients?.name?.[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 tracking-tight">{invoice.clients?.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{invoice.invoice_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 font-outfit">${total.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{invoice.invoice_date}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Quick Actions & AI */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 font-outfit px-2">Quick Commands</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <Link href="/invoices/new" className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem] group hover:bg-primary hover:border-primary transition-all shadow-sm">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold text-slate-900 group-hover:text-white transition-colors">Create Invoice</h4>
              <p className="text-xs font-medium text-slate-500 group-hover:text-white/60 transition-colors mt-1">Start a fresh bill</p>
            </Link>

            <Link href="/clients" className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] group hover:bg-slate-900 hover:border-slate-900 transition-all shadow-sm">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6 text-slate-900" />
              </div>
              <h4 className="font-bold text-slate-900 group-hover:text-white transition-colors">Add Client</h4>
              <p className="text-xs font-medium text-slate-500 group-hover:text-white/60 transition-colors mt-1">Grow your database</p>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-primary p-8 rounded-[2.5rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden group border-4 border-white/10">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-2xl font-extrabold font-outfit leading-tight">AI Billing Assistant</h4>
                <p className="text-white/70 font-medium mt-2 leading-relaxed">
                  "RemodelFlow, create a 3k invoice for Marcus regarding the kitchen tile work."
                </p>
              </div>
              <button className="h-12 px-6 bg-white text-primary font-bold rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-lg">
                Activate Assistant
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

