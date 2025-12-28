'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Bell, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalRevenue: 0, pendingInvoices: 0, activeClients: 0 })
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    const [invoicesRes, clientsRes] = await Promise.all([
      supabase.from('invoices').select('*, clients(name)').order('created_at', { ascending: false }).limit(5),
      supabase.from('clients').select('count')
    ])

    if (invoicesRes.data) {
      setRecentInvoices(invoicesRes.data)
      
      const total = invoicesRes.data.reduce((acc, inv) => {
        const labor = (inv.labor_line1_hours * inv.labor_line1_rate) + (inv.labor_line2_hours * inv.labor_line2_rate)
        const materials = (inv.materials_line1_qty * inv.materials_line1_unit_price) + (inv.materials_line2_qty * inv.materials_line2_unit_price)
        const tax = (materials * inv.tax_rate) / 100
        return acc + labor + materials + tax
      }, 0)

      setStats({
        totalRevenue: total,
        pendingInvoices: invoicesRes.data.length,
        activeClients: clientsRes.count || 0
      })
    }
    setLoading(false)
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full md:w-64"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-4">💰</div>
          <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
          <span className="text-2xl font-bold">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <p className="text-xs mt-2 font-medium text-emerald-500">+12% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl mb-4">⏳</div>
          <p className="text-sm font-medium text-slate-500 mb-1">Pending Invoices</p>
          <span className="text-2xl font-bold">{stats.pendingInvoices}</span>
          <p className="text-xs mt-2 font-medium text-slate-400">Outstanding payments</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-4">👥</div>
          <p className="text-sm font-medium text-slate-500 mb-1">Active Clients</p>
          <span className="text-2xl font-bold">{stats.activeClients}</span>
          <Link href="/clients" className="text-xs mt-2 font-medium text-blue-500 hover:underline block">View client directory →</Link>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Link href="/clients" className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add Client
        </Link>
        <Link href="/invoices/new" className="px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm shadow-sm shadow-blue-200">
          <Plus className="w-4 h-4" />
          Create New Invoice
        </Link>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-slate-900">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="font-bold">Recent Invoices</h2>
          <Link href="/invoices" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentInvoices.map((invoice, i) => {
                 const labor = (invoice.labor_line1_hours * invoice.labor_line1_rate) + (invoice.labor_line2_hours * invoice.labor_line2_rate)
                 const materials = (invoice.materials_line1_qty * invoice.materials_line1_unit_price) + (invoice.materials_line2_qty * invoice.materials_line2_unit_price)
                 const tax = (materials * invoice.tax_rate) / 100
                 const total = labor + materials + tax

                 return (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600`}>
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{invoice.invoice_number}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                          {invoice.clients?.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{invoice.clients?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">${total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/invoices/${invoice.id}`} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-all">
                        Details →
                      </Link>
                    </td>
                  </tr>
                 )
              })}
              {recentInvoices.length === 0 && (
                <tr>
                   <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                      No recent invoices.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

