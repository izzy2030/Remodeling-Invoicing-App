'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
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
  AlertCircle
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
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!invoice) return <div>Invoice not found.</div>

  const laborSubtotal = (invoice.labor_line1_hours * invoice.labor_line1_rate) + (invoice.labor_line2_hours * invoice.labor_line2_rate)
  const materialsSubtotal = (invoice.materials_line1_qty * invoice.materials_line1_unit_price) + (invoice.materials_line2_qty * invoice.materials_line2_unit_price)
  const taxAmount = (materialsSubtotal * invoice.tax_rate) / 100
  const grandTotal = laborSubtotal + materialsSubtotal + taxAmount

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20">
      {/* Sidebar Actions */}
      <aside className="lg:w-80 space-y-6 order-2 lg:order-1">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-50">
             <h2 className="font-bold text-slate-900">Actions</h2>
             <span className="text-xs text-slate-400">Manage invoice {invoice.invoice_number}</span>
          </div>

          <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Status</p>
                <p className="text-sm font-bold text-orange-700">Pending Payment</p>
              </div>
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
          </div>

          <div className="space-y-3">
             <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-100">
                <Send className="w-4 h-4" />
                Email Invoice
             </button>
             <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all border border-slate-100 text-sm">
                   <Download className="w-4 h-4" />
                   Download
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all border border-slate-100 text-sm">
                   <Printer className="w-4 h-4" />
                   Print
                </button>
             </div>
          </div>

          <div className="pt-6 border-t border-slate-50 space-y-1">
             <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                <Edit3 className="w-4 h-4" />
                Edit Invoice Details
             </button>
             <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                <History className="w-4 h-4" />
                View Activity Log
             </button>
          </div>
        </div>
      </aside>

      {/* Main Preview Area */}
      <section className="flex-1 order-1 lg:order-2 space-y-6">
        <button 
          onClick={() => router.push('/invoices')}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors mb-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to history
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-12 min-h-[11in] flex flex-col text-slate-900">
           {/* Invoice Header */}
           <div className="flex justify-between items-start mb-12">
              <div className="flex items-center gap-4">
                 <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100">
                    <Wrench className="w-6 h-6 text-white" />
                 </div>
                 <h1 className="text-xl font-black tracking-tight">{settings?.company_name}</h1>
              </div>
              <div className="text-right">
                 <h2 className="text-4xl font-black text-blue-600 tracking-tighter uppercase italic">Invoice</h2>
                 <p className="text-slate-400 font-bold mt-1"># {invoice.invoice_number}</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-12 mb-16 px-1">
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From</p>
                 <div className="space-y-1 text-sm font-medium text-slate-600">
                    <p className="font-bold text-slate-900">{settings?.company_name}</p>
                    <p>{settings?.company_address}</p>
                    <p>{settings?.company_phone}</p>
                    <p>{settings?.company_email}</p>
                 </div>
              </div>
              <div className="text-right space-y-6">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</p>
                    <p className="text-sm font-bold">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-orange-400">Due Date</p>
                    <p className="text-sm font-bold text-orange-500">{new Date(invoice.due_date).toLocaleDateString()}</p>
                 </div>
              </div>
           </div>

           <div className="mb-16 bg-slate-50 rounded-[2rem] p-10 space-y-4 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill To</p>
              <div className="space-y-1">
                 <h3 className="text-2xl font-black text-slate-900">{invoice.clients?.name}</h3>
                 <div className="text-slate-500 font-medium space-y-1">
                    <p>{invoice.clients?.address}</p>
                    <p>{invoice.clients?.email}</p>
                 </div>
              </div>
           </div>

           {/* Tables Section */}
           <div className="space-y-12 mb-16">
              {/* Labor Table */}
              <div className="space-y-4 px-1">
                <div className="flex items-center gap-3">
                   <Wrench className="w-4 h-4 text-blue-600" />
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Labor Details</h4>
                </div>
                <table className="w-full">
                   <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <th className="py-2 text-left pb-4">Description</th>
                         <th className="py-2 text-center pb-4 w-24">Hrs</th>
                         <th className="py-2 text-center pb-4 w-32">Rate</th>
                         <th className="py-2 text-right pb-4 w-40">Amount</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {[1, 2].map(i => {
                        const desc = invoice[`labor_line${i}_desc`]
                        const hours = invoice[`labor_line${i}_hours`]
                        const rate = invoice[`labor_line${i}_rate`]
                        if (!desc && !hours) return null
                        return (
                          <tr key={i} className="text-sm font-medium">
                             <td className="py-5 text-slate-900 pr-8">
                                <p className="font-bold">{desc}</p>
                             </td>
                             <td className="py-5 text-center text-slate-500">{hours}</td>
                             <td className="py-5 text-center text-slate-500">${parseFloat(rate).toFixed(2)}</td>
                             <td className="py-5 text-right font-black text-slate-900">${(hours * rate).toFixed(2)}</td>
                          </tr>
                        )
                      })}
                   </tbody>
                </table>
              </div>

              {/* Materials Table */}
              <div className="space-y-4 px-1">
                <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-4 h-4 text-blue-600" />
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Materials Detail</h4>
                </div>
                <table className="w-full">
                   <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <th className="py-2 text-left pb-4">Item Name</th>
                         <th className="py-2 text-center pb-4 w-24">Qty</th>
                         <th className="py-2 text-center pb-4 w-32">Price</th>
                         <th className="py-2 text-right pb-4 w-40">Amount</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {[1, 2].map(i => {
                        const desc = invoice[`materials_line${i}_desc`]
                        const qty = invoice[`materials_line${i}_qty`]
                        const price = invoice[`materials_line${i}_unit_price`]
                        if (!desc && !qty) return null
                        return (
                          <tr key={i} className="text-sm font-medium">
                             <td className="py-5 text-slate-900 pr-8">
                                <p className="font-bold">{desc}</p>
                             </td>
                             <td className="py-5 text-center text-slate-500">{qty}</td>
                             <td className="py-5 text-center text-slate-500">${parseFloat(price).toFixed(2)}</td>
                             <td className="py-5 text-right font-black text-slate-900">${(qty * price).toFixed(2)}</td>
                          </tr>
                        )
                      })}
                   </tbody>
                </table>
              </div>
           </div>

           {/* Totals Section */}
           <div className="mt-auto flex justify-end">
              <div className="w-80 space-y-4">
                 <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                    <span className="uppercase tracking-widest">Subtotal</span>
                    <span className="text-slate-900">${(laborSubtotal + materialsSubtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                    <span className="uppercase tracking-widest">Tax ({invoice.tax_rate}%)</span>
                    <span className="text-slate-900">${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                 </div>
                 <div className="pt-6 border-t-4 border-blue-600 flex justify-between items-center">
                    <span className="text-blue-600 font-black text-lg uppercase tracking-tighter italic">Total Amount</span>
                    <span className="text-blue-600 font-black text-3xl tracking-tighter">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                 </div>
              </div>
           </div>

           <div className="mt-20 pt-10 border-t border-slate-50 flex items-start gap-10">
              <div className="flex-1 space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terms & Notes</p>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {invoice.notes}
                 </p>
              </div>
              <div className="text-right space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions?</p>
                 <p className="text-xs font-bold text-slate-900 italic">Support @ {settings?.company_email}</p>
              </div>
           </div>
        </div>
      </section>
    </div>
  )
}
