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
  Loader2
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
      .select('*, clients(name)')
      .order('created_at', { ascending: false })
    
    if (data) setInvoices(data)
    setLoading(false)
  }

  const getStatusColor = (dueDate: string) => {
    const today = new Date().toISOString().split('T')[0]
    if (dueDate < today) return 'bg-red-50 text-red-600'
    return 'bg-orange-50 text-orange-600'
  }

  return (
    <div className="space-y-8 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Invoices History</h1>
          <p className="text-slate-500 text-sm mt-1">Keep track of all your projects and their financial status.</p>
        </div>
        <Link 
          href="/invoices/new"
          className="px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Invoice
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by invoice number or client..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4 text-center">Date Issued</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(invoice.due_date)}`}>
                        {new Date(invoice.due_date) < new Date() ? 'Overdue' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{invoice.invoice_number}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-700">{invoice.clients?.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 text-center">{invoice.invoice_date}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                      ${((invoice.labor_line1_amount || 0) + (invoice.labor_line2_amount || 0) + (invoice.materials_line1_amount || 0) + (invoice.materials_line2_amount || 0) + (invoice.tax_rate * (invoice.materials_line1_amount + invoice.materials_line2_amount) / 100)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Link 
                          href={`/invoices/${invoice.id}`}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                       <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-slate-400 font-medium">No invoices found. Create your first one!</p>
                       <Link 
                        href="/invoices/new" 
                        className="text-blue-600 font-bold text-sm mt-2 inline-block hover:underline"
                       >
                         Start billing now →
                       </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
