'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  ChevronRight,
  Send, 
  Download, 
  Printer, 
  Edit3, 
  History,
  MoreHorizontal,
  Mail,
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Share2,
  Trash2,
  ArrowRight,
  Loader2
} from 'lucide-react'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    fetchInvoiceData()
  }, [id])

  const fetchInvoiceData = async () => {
    setLoading(true)
    const [invoiceRes, settingsRes] = await Promise.all([
      supabase.from('invoices').select('*, clients(*)').eq('id', id).single(),
      supabase.from('settings').select('*').eq('id', 1).single()
    ])

    if (invoiceRes.data) setInvoice(invoiceRes.data)
    if (settingsRes.data) setSettings(settingsRes.data)
    setLoading(false)
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Invoice Preview...</p>
    </div>
  )

  if (!invoice) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-slate-900">Invoice not found</h2>
      <button onClick={() => router.push('/invoices')} className="mt-4 text-primary font-bold">Return to history</button>
    </div>
  )

  const laborSubtotal = (invoice.labor_line1_amount || 0) + (invoice.labor_line2_amount || 0)
  const materialsSubtotal = (invoice.materials_line1_amount || 0) + (invoice.materials_line2_amount || 0)
  const subtotal = laborSubtotal + materialsSubtotal
  const taxAmount = (subtotal * (invoice.tax_rate || 0)) / 100
  const grandTotal = subtotal + taxAmount

  return (
    <div className="space-y-10 pb-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push('/invoices')}
            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900 font-outfit uppercase tracking-tight">Invoice {invoice.invoice_number}</h1>
              <span className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                Pending
              </span>
            </div>
            <p className="text-slate-500 font-medium mt-1">Created on {new Date(invoice.invoice_date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-12 px-6 bg-slate-900 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
            <Send className="w-4 h-4" />
            Send to Client
          </button>
          <div className="flex items-center bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
            <button className="p-2.5 hover:bg-slate-50 text-slate-500 rounded-lg transition-colors" title="Download PDF">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2.5 hover:bg-slate-50 text-slate-500 rounded-lg transition-colors" title="Print Invoice">
              <Printer className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-slate-100 mx-1" />
            <button className="p-2.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors" title="Delete">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-10">
        {/* Invoice Preview */}
        <div className="flex-1">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium p-12 md:p-16 min-h-[10in] relative overflow-hidden group">
            {/* Branding Watermark */}
            <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <FileText className="w-64 h-64 text-slate-900 rotate-12" />
            </div>

            {/* Header Content */}
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                      <Wrench className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 font-outfit uppercase tracking-tighter">{settings?.company_name}</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quality Remodeling Works</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm font-semibold text-slate-500 max-w-xs">
                    <p>{settings?.company_address}</p>
                    <p>{settings?.company_phone}</p>
                    <p className="text-primary">{settings?.company_email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <h1 className="text-6xl font-black text-slate-900 opacity-5 tracking-tighter uppercase italic leading-none mb-4">Invoice</h1>
                  <div className="space-y-2">
                    <div className="inline-flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Invoice Number</span>
                      <span className="text-xl font-black text-slate-900 font-outfit tracking-wider italic">{invoice.invoice_number}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client & Billing Details */}
              <div className="grid grid-cols-2 gap-12 mb-20">
                <div className="bg-slate-50 rounded-[2rem] p-10 border border-slate-50 space-y-6">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Billing Information</h5>
                    <h3 className="text-2xl font-black text-slate-900 font-outfit italic tracking-tight">{invoice.clients?.name}</h3>
                  </div>
                  <div className="space-y-1 text-sm font-semibold text-slate-500">
                    <p>{invoice.clients?.address}</p>
                    <p className="text-slate-900">{invoice.clients?.email}</p>
                    <p>{invoice.clients?.phone}</p>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-end space-y-8 pr-6">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                    <p className="text-lg font-black text-slate-900 font-outfit italic">{new Date(invoice.invoice_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Payment Due</p>
                    <p className="text-lg font-black text-orange-500 font-outfit italic leading-none">{new Date(invoice.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-12 mb-20 px-4">
                {/* Services Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-slate-900/5">
                    <Wrench className="w-5 h-5 text-primary" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Professional Services</h4>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                        <th className="py-2 pr-8">Work Description</th>
                        <th className="py-2 text-right w-40">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[1, 2].map(i => {
                        const desc = invoice[`labor_line${i}_desc`]
                        const amount = invoice[`labor_line${i}_amount`]
                        if (!desc && !amount) return null
                        return (
                          <tr key={i} className="text-sm font-bold">
                            <td className="py-6 text-slate-800 pr-12 leading-relaxed">{desc}</td>
                            <td className="py-6 text-right text-slate-900 tabular-nums">${parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Materials Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-slate-900/5">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Materials & Fixtures</h4>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                        <th className="py-2 pr-8">Itemized Details</th>
                        <th className="py-2 text-right w-40">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[1, 2].map(i => {
                        const desc = invoice[`materials_line${i}_desc`]
                        const amount = invoice[`materials_line${i}_amount`]
                        if (!desc && !amount) return null
                        return (
                          <tr key={i} className="text-sm font-bold">
                            <td className="py-6 text-slate-800 pr-12 leading-relaxed">{desc}</td>
                            <td className="py-6 text-right text-slate-900 tabular-nums">${parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end pt-12 border-t-2 border-slate-900">
                <div className="w-full md:w-80 space-y-6">
                  <div className="space-y-3 px-2">
                    <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                      <span className="uppercase tracking-widest">Job Subtotal</span>
                      <span className="text-slate-900 tabular-nums">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                      <span className="uppercase tracking-widest">Tax Provision ({invoice.tax_rate}%)</span>
                      <span className="text-slate-900 tabular-nums">${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900 rounded-3xl p-8 flex flex-col items-center justify-center relative shadow-xl shadow-slate-900/20 translate-x-4">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Total Amount Due</span>
                    <span className="text-5xl font-black text-white font-outfit tracking-tighter tabular-nums underline decoration-primary decoration-4 underline-offset-8">
                      ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="mt-32 pt-16 border-t border-slate-100 flex flex-col md:flex-row justify-between gap-12">
                <div className="flex-1 space-y-4">
                  <h5 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Contractual Terms & Notes</h5>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                    {invoice.notes || "No additional terms provided for this invoice."}
                  </p>
                </div>
                <div className="text-right space-y-3">
                  <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Verified Signature</p>
                  <div className="h-16 w-48 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
                    <span className="font-outfit text-slate-300 italic">Signed Securely</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">System Authenticated</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Context */}
        <aside className="xl:w-[380px] space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-premium p-8 space-y-8">
            <h3 className="text-xl font-bold text-slate-900 font-outfit">Timeline & History</h3>
            
            <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50">
              <div className="flex gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-emerald-100 border-4 border-white flex items-center justify-center relative z-10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Invoice Generated</p>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">{new Date(invoice.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center relative z-10">
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">Waiting for first mail</p>
                  <p className="text-xs font-medium text-slate-300 mt-0.5">Not yet sent to recipient</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50 space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all group">
                <div className="flex items-center gap-3">
                  <Share2 className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">Audit Log</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all group">
                <div className="flex items-center gap-3">
                  <Edit3 className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">Edit Records</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold font-outfit uppercase tracking-tight">Need to follow up?</h4>
                <p className="text-white/60 text-xs font-medium mt-1 leading-relaxed">
                  Send a reminder notification to <span className="text-white">{invoice.clients?.name}</span> if the due date is approaching.
                </p>
              </div>
              <button className="h-12 w-full bg-white text-indigo-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                Send Reminder
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

