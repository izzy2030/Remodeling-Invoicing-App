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
  ArrowUpRight
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
    if (dueDate < today) return { label: 'Overdue', color: 'text-red-600 bg-red-50 border-red-100' }
    return { label: 'Pending', color: 'text-orange-600 bg-orange-50 border-orange-100' }
  }

  const calculateInvoiceTotal = (invoice: any) => {
    const subtotal = (invoice.labor_line1_amount || 0) + 
                     (invoice.labor_line2_amount || 0) + 
                     (invoice.materials_line1_amount || 0) + 
                     (invoice.materials_line2_amount || 0)
    const tax = (subtotal * (invoice.tax_rate || 0)) / 100
    return subtotal + tax
  }

  const stats = [
    { label: 'Total Volume', value: `$${invoices.reduce((sum, inv) => sum + calculateInvoiceTotal(inv), 0).toLocaleString()}`, icon: TrendingUp, color: 'text-primary bg-primary/10' },
    { label: 'Pending', value: invoices.filter(inv => new Date(inv.due_date) >= new Date()).length.toString(), icon: Clock, color: 'text-orange-500 bg-orange-50' },
    { label: 'Overdue', value: invoices.filter(inv => new Date(inv.due_date) < new Date()).length.toString(), icon: AlertCircle, color: 'text-red-500 bg-red-50' },
  ]

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-outfit">Invoices</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your business revenue and client billing.</p>
        </div>
        <Link 
          href="/invoices/new"
          className="h-14 px-8 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          New Invoice
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-premium flex items-center gap-6">
            <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search by client or invoice number..." 
            className="w-full h-16 pl-14 pr-6 bg-white border-2 border-slate-50 rounded-2xl text-base font-semibold text-slate-900 focus:border-primary focus:bg-white transition-all outline-none"
          />
        </div>
        <button className="h-16 px-8 bg-white border-2 border-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-3">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Invoices...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-50/50 px-8 py-4 rounded-2xl">
            <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="col-span-4">Client / Invoice #</div>
              <div className="col-span-3 text-center">Status / Due</div>
              <div className="col-span-3 text-right">Amount</div>
              <div className="col-span-2"></div>
            </div>
          </div>

          <div className="space-y-4">
            {invoices.map((invoice) => {
              const status = getStatus(invoice.due_date)
              const total = calculateInvoiceTotal(invoice)
              
              return (
                <div key={invoice.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-premium hover:border-primary/20 transition-all group">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4 flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-slate-400 border border-slate-100">
                        {invoice.clients?.name?.[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg group-hover:text-primary transition-colors">{invoice.clients?.name}</h4>
                        <p className="text-sm font-bold text-slate-400 tabular-nums uppercase tracking-tight">{invoice.invoice_number}</p>
                      </div>
                    </div>
                    
                    <div className="col-span-3 flex flex-col items-center gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${status.color}`}>
                        {status.label}
                      </span>
                      <p className="text-xs font-bold text-slate-400">Due {invoice.due_date}</p>
                    </div>

                    <div className="col-span-3 text-right">
                      <p className="text-2xl font-bold text-slate-900">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grand Total</p>
                    </div>

                    <div className="col-span-2 flex justify-end gap-2">
                      <Link 
                        href={`/invoices/${invoice.id}`}
                        className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {invoices.length === 0 && (
              <div className="bg-white rounded-[3rem] border-4 border-dashed border-slate-50 p-20 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-10 h-10 text-slate-200" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">No invoices yet</h3>
                  <p className="text-slate-500 font-medium mt-2">Get started by creating your first professional invoice.</p>
                </div>
                <Link 
                  href="/invoices/new"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-primary transition-all shadow-xl shadow-slate-900/10 group"
                >
                  Create Invoice
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
