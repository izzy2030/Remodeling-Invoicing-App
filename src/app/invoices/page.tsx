'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Loader2,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowUpRight,
  MoreHorizontal,
  Sparkles,
  Calendar,
  DollarSign,
  ChevronDown,
  Download,
  Trash,
  Mail,
  Copy
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'

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
    if (dueDate < today) return { label: 'Overdue', style: 'badge-danger' }
    return { label: 'Pending', style: 'badge-warning' }
  }

  const calculateInvoiceTotal = (invoice: any) => {
    const subtotal = (invoice.labor_line1_amount || 0) +
      (invoice.labor_line2_amount || 0) +
      (invoice.materials_line1_amount || 0) +
      (invoice.materials_line2_amount || 0)
    const tax = (subtotal * (invoice.tax_rate || 0)) / 100
    return subtotal + tax
  }

  const totalVolume = invoices.reduce((sum, inv) => sum + calculateInvoiceTotal(inv), 0)

  const StatCard = ({ label, value, icon: Icon, gradient, delay }: any) => (
    <div
      className="card-premium p-5 group animate-fade-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shadow-black/5 ${gradient}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="w-16 h-8 relative overflow-hidden opacity-60">
          <svg viewBox="0 0 60 24" className="w-full h-full">
            <path
              d="M0 20 Q 15 18, 25 14 T 45 8 T 60 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-primary/40"
            />
          </svg>
        </div>
      </div>
      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground font-syne tracking-tight">{value}</p>
    </div>
  )

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <section className="animate-fade-up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <p className="text-sm font-semibold text-muted-foreground">Invoice Management</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-syne tracking-tight">Invoices</h1>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="secondary" className="bg-gradient-to-r from-violet-500/10 to-purple-600/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 hover:from-violet-500/20 hover:to-purple-600/20">
              <Link href="/invoices/ai" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Invoice
              </Link>
            </Button>
            <Button asChild>
              <Link href="/invoices/new" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Invoice
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Volume"
          value={`$${totalVolume.toLocaleString()}`}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-primary to-accent"
          delay={0.1}
        />
        <StatCard
          label="Pending Payment"
          value={invoices.filter(inv => new Date(inv.due_date) >= new Date()).length.toString()}
          icon={Clock}
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          delay={0.15}
        />
        <StatCard
          label="Overdue Items"
          value={invoices.filter(inv => new Date(inv.due_date) < new Date()).length.toString()}
          icon={AlertCircle}
          gradient="bg-gradient-to-br from-rose-500 to-red-600"
          delay={0.2}
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 animate-fade-up" style={{ animationDelay: '0.25s' }}>
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search invoices by client or number..."
            className="input-field pl-11 shadow-sm focus:shadow-md h-14"
          />
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-14 font-semibold">
                <Filter className="w-4 h-4 text-muted-foreground mr-2" />
                Filter
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
               <div className="space-y-3">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Filter by Status</p>
                 <div className="space-y-1.5">
                   {['All', 'Paid', 'Pending', 'Overdue'].map(status => (
                     <button key={status} className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold hover:bg-secondary transition-colors flex items-center justify-between group">
                       {status}
                       <div className="w-4 h-4 rounded-full border border-border group-hover:border-primary/50 transition-colors" />
                     </button>
                   ))}
                 </div>
               </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" className="h-14 font-semibold">
            <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
            Date
          </Button>
        </div>
      </div>

      {/* Invoice List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-primary to-accent p-4 rounded-2xl">
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            </div>
          </div>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[11px]">Loading Invoices...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice, index) => {
            const status = getStatus(invoice.due_date)
            const total = calculateInvoiceTotal(invoice)

            return (
              <div
                key={invoice.id}
                className="card-premium p-5 group animate-fade-up hover:scale-[1.01] active:scale-[0.99]"
                style={{ animationDelay: `${0.3 + (index * 0.03)}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  {/* Client Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/50 rounded-xl flex items-center justify-center font-bold text-muted-foreground border border-border group-hover:from-primary/10 group-hover:to-accent/10 group-hover:text-primary transition-all duration-500 shadow-sm">
                      {invoice.clients?.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors text-base tracking-tight truncate">
                        {invoice.clients?.name}
                      </h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-2 py-0.5 rounded-md w-fit mt-1 border border-border">
                        {invoice.invoice_number}
                      </p>
                    </div>
                  </div>

                  {/* Status & Due Date */}
                  <div className="flex items-center gap-8 px-2">
                    <div className="text-center hidden md:block">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 opacity-60">Status</p>
                      <span className={`badge ${status.style}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="text-center hidden md:block">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 opacity-60">Due Date</p>
                      <p className="text-xs font-bold text-foreground">{invoice.due_date}</p>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-0 border-border">
                    <div className="md:text-right">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 opacity-60">Total</p>
                      <p className="text-xl font-bold text-foreground font-syne tracking-tight">
                        ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="secondary" size="icon" className="h-10 w-10">
                        <Link href={`/invoices/${invoice.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="h-10 w-10">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => window.print()}>
                            <Download className="w-4 h-4 mr-2 text-muted-foreground" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                            Email Client
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(invoice.invoice_number)}>
                            <Copy className="w-4 h-4 mr-2 text-muted-foreground" />
                            Copy Number
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <Trash className="w-4 h-4 mr-2" />
                            Delete Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Empty State */}
          {invoices.length === 0 && (
            <div className="bg-card rounded-[2rem] border-2 border-dashed border-border p-16 text-center space-y-6 animate-fade-up">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl flex items-center justify-center mx-auto border border-border">
                <FileText className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground font-syne">No invoices yet</h3>
                <p className="text-muted-foreground font-medium mt-2 max-w-md mx-auto">
                  Get started by creating your first professional invoice for your remodeling projects.
                </p>
              </div>
              <Button asChild size="lg" className="rounded-2xl px-12 h-14 group">
                <Link href="/invoices/new" className="flex items-center gap-2">
                  Create First Invoice
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
