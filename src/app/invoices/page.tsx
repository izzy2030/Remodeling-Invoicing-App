'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Download, 
  Mail,
  Loader2,
  TrendingUp,
  Clock,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  MoreHorizontal,
  Sparkles
} from 'lucide-react'

export default function InvoicesPage() {
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<any[]>([])

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('invoices')
      .select('*, clients(*)')
      .order('created_at', { ascending: false })
    
    if (data) setInvoices(data)
    setLoading(false)
  }

  const getStatus = (dueDate: string) => {
    const today = new Date().toISOString().split('T')[0]
    if (dueDate < today) return { label: 'Overdue', color: 'text-red-500 bg-red-50 border-red-100' }
    return { label: 'Pending', color: 'text-orange-500 bg-orange-50 border-orange-100' }
  }

  const calculateInvoiceTotal = (invoice: any) => {
    const subtotal = (invoice.labor_line1_amount || 0) + 
                     (invoice.labor_line2_amount || 0) + 
                     (invoice.materials_line1_amount || 0) + 
                     (invoice.materials_line2_amount || 0)
    const tax = (subtotal * (invoice.tax_rate || 0)) / 100
    return subtotal + tax
  }

  const Sparkline = ({ color, trend }: { color: string, trend: 'up' | 'down' }) => (
    <div className="w-16 md:w-24 h-8 relative overflow-hidden">
      <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
        <path 
          d={trend === 'up' ? "M0 35 Q 25 35, 40 25 T 70 20 T 100 5" : "M0 5 Q 25 5, 40 15 T 70 20 T 100 35"} 
          fill="none" 
          stroke={color} 
          strokeWidth="4" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  )

  const StatCard = ({ label, value, icon: Icon, color, trend, trendValue, sparkColor }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium group hover:shadow-soft transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <Sparkline color={sparkColor} trend={trend} />
      </div>
      <div>
        <p className="text-[13px] font-medium text-slate-400 mb-1">{label}</p>
        <div className="flex items-end justify-between">
           <h3 className="text-2xl font-bold text-slate-900 font-outfit leading-none">{value}</h3>
           <span className={`text-[11px] font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-orange-500'}`}>
             {trend === 'up' ? '+' : '-'}{trendValue}
           </span>
        </div>
      </div>
    </div>
  )

  const totalVolume = invoices.reduce((sum, inv) => sum + calculateInvoiceTotal(inv), 0)

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome Section */}
      <section className="space-y-1">
        <p className="text-xl font-bold text-slate-900 font-outfit tracking-tight">Your Portfolio</p>
        <h2 className="text-5xl font-black text-primary font-outfit tracking-tighter">Invoices</h2>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Volume" 
          value={`$${totalVolume.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-slate-50 text-slate-900"
          trend="up"
          trendValue="12.4%"
          sparkColor="#09090b"
        />
        <StatCard 
          label="Pending Payment" 
          value={invoices.filter(inv => new Date(inv.due_date) >= new Date()).length.toString()}
          icon={Clock}
          color="bg-orange-50 text-orange-600"
          trend="down"
          trendValue="2.1%"
          sparkColor="#f59e0b"
        />
        <StatCard 
          label="Overdue items" 
          value={invoices.filter(inv => new Date(inv.due_date) < new Date()).length.toString()}
          icon={AlertCircle}
          color="bg-rose-50 text-rose-600"
          trend="up"
          trendValue="0.0%"
          sparkColor="#e11d48"
        />
      </div>

      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative group flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by client or invoice number..." 
              className="w-full h-12 pl-11 pr-6 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none h-12 px-6 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-slate-400" />
              Filter
            </button>
            <Link 
              href="/invoices/ai"
              className="flex-1 md:flex-none h-12 px-6 bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              AI Invoice
            </Link>
            <Link 
              href="/invoices/new"
              className="flex-1 md:flex-none h-12 px-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm shadow-sm shadow-slate-900/10"
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </Link>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Invoices...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {invoices.map((invoice) => {
              const status = getStatus(invoice.due_date)
              const total = calculateInvoiceTotal(invoice)
              
              return (
                <div key={invoice.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium hover:border-slate-200 transition-all group overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-200">
                        {invoice.clients?.name?.[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-base tracking-tight">{invoice.clients?.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded w-fit mt-1 border border-slate-100/50">{invoice.invoice_number}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8 px-4">
                      <div className="text-center hidden md:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="text-center hidden md:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                        <p className="text-[11px] font-bold text-slate-900">{invoice.due_date}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                      <div className="md:text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Grand Total</p>
                        <p className="text-xl font-black text-slate-900 font-outfit leading-none">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          href={`/invoices/${invoice.id}`}
                          className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {invoices.length === 0 && (
              <div className="bg-white/50 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-slate-200 p-20 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto border border-slate-100">
                  <FileText className="w-10 h-10 text-slate-200" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Your list is empty</h3>
                  <p className="text-slate-500 font-medium mt-2">Get started by creating your first professional invoice.</p>
                </div>
                <Link 
                  href="/invoices/new"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-primary transition-all shadow-xl shadow-slate-900/10 group"
                >
                  Create Invoice
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
