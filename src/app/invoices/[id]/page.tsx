'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  FileText,
  Calendar,
  User,
  Hash,
  Download,
  Mail,
  MoreHorizontal,
  ChevronLeft,
  Share2,
  Trash2,
  CheckCircle,
  Clock,
  ExternalLink,
  Edit,
  Printer,
  Hammer,
  CreditCard,
  Building2,
  MapPin,
  Phone,
  X,
  Wrench,
  Package,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'

export default function InvoiceDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    fetchInvoice()
  }, [id])

  const fetchInvoice = async () => {
    setLoading(true)
    const [{ data: invData }, { data: settData }] = await Promise.all([
      supabase.from('invoices').select('*, clients(*)').eq('id', id).single(),
      supabase.from('settings').select('*').eq('id', 1).single()
    ])

    if (invData) setInvoice(invData)
    if (settData) setSettings(settData)
    setLoading(false)
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-4">
      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
         <FileText className="w-6 h-6 text-primary animate-bounce" />
      </div>
      <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Loading Details...</p>
    </div>
  )

  if (!invoice) return (
    <div className="text-center py-20 space-y-6">
      <div className="w-20 h-20 bg-secondary rounded-[2rem] flex items-center justify-center mx-auto">
         <X className="w-10 h-10 text-muted-foreground/30" />
      </div>
      <h3 className="text-2xl font-bold font-syne">Invoice not found</h3>
      <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
    </div>
  )

  const subtotal = (invoice.labor_line1_amount || 0) + (invoice.labor_line2_amount || 0) +
    (invoice.materials_line1_amount || 0) + (invoice.materials_line2_amount || 0)
  const tax = (subtotal * (invoice.tax_rate || 0)) / 100
  const total = subtotal + tax

  const isOverdue = new Date(invoice.due_date) < new Date()

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" onClick={() => router.back()} className="rounded-xl h-11 w-11 shadow-sm group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </Button>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-foreground font-syne tracking-tight">Invoice Details</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">#{invoice.invoice_number}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex font-bold" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button className="font-bold copper-glow">
            <Mail className="w-4 h-4 mr-2" />
            Send to Client
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="outline" size="icon" className="h-11 w-11">
                 <MoreHorizontal className="w-5 h-5" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
               <DropdownMenuLabel>Invoice Actions</DropdownMenuLabel>
               <DropdownMenuItem>
                 <Edit className="w-4 h-4 mr-2 text-muted-foreground" />
                 Edit Details
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => window.print()}>
                 <Download className="w-4 h-4 mr-2 text-muted-foreground" />
                 Download PDF
               </DropdownMenuItem>
               <DropdownMenuItem>
                 <Share2 className="w-4 h-4 mr-2 text-muted-foreground" />
                 Copy Share Link
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                 <Trash2 className="w-4 h-4 mr-2" />
                 Delete Permanently
               </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Invoice Body */}
        <div className="lg:col-span-8 space-y-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="card-premium p-10 space-y-12 bg-white dark:bg-card">
            {/* Branding Header */}
            <div className="flex flex-col md:flex-row justify-between gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                      <Hammer className="w-6 h-6 text-white" />
                   </div>
                   <h2 className="text-2xl font-black font-syne tracking-tighter uppercase">{settings?.company_name || 'Business'}</h2>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground font-medium">
                  <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {settings?.company_address}</p>
                  <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {settings?.company_phone}</p>
                  <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {settings?.company_email}</p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <h3 className="text-5xl font-black font-syne text-primary/10 uppercase tracking-tighter leading-none">Invoice</h3>
                <p className="text-lg font-bold text-foreground font-syne tracking-tight">#{invoice.invoice_number}</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isOverdue ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                   {isOverdue ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                   {isOverdue ? 'Overdue' : 'Pending'}
                </div>
              </div>
            </div>

            {/* Bill To & Dates */}
            <div className="grid grid-cols-2 gap-10 py-10 border-y border-border/60">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Bill To</p>
                <div>
                  <h4 className="text-xl font-bold text-foreground font-syne">{invoice.clients?.name}</h4>
                  <p className="text-sm text-muted-foreground font-medium mt-1 whitespace-pre-line leading-relaxed">
                    {invoice.clients?.address}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-6 md:text-right">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Issued On</p>
                  <p className="text-sm font-bold text-foreground">{invoice.invoice_date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Due Date</p>
                  <p className="text-sm font-bold text-foreground">{invoice.due_date}</p>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-6">
              <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border/60">
                 <div className="col-span-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Description</div>
                 <div className="col-span-4 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Amount</div>
              </div>
              
              {/* Labor */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                   <Wrench className="w-3.5 h-3.5 text-primary" />
                   <span className="text-[11px] font-bold text-foreground uppercase tracking-widest">Labor & Services</span>
                </div>
                {invoice.labor_line1_desc && (
                  <div className="grid grid-cols-12 gap-4 items-center group">
                    <div className="col-span-8">
                       <p className="text-sm font-bold text-foreground">{invoice.labor_line1_desc}</p>
                    </div>
                    <div className="col-span-4 text-right">
                       <p className="text-sm font-bold text-foreground font-syne">${(invoice.labor_line1_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                )}
                {invoice.labor_line2_desc && (
                  <div className="grid grid-cols-12 gap-4 items-center group">
                    <div className="col-span-8">
                       <p className="text-sm font-bold text-foreground">{invoice.labor_line2_desc}</p>
                    </div>
                    <div className="col-span-4 text-right">
                       <p className="text-sm font-bold text-foreground font-syne">${(invoice.labor_line2_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Materials */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 mb-2">
                   <Package className="w-3.5 h-3.5 text-violet-500" />
                   <span className="text-[11px] font-bold text-foreground uppercase tracking-widest">Materials & Components</span>
                </div>
                {invoice.materials_line1_desc && (
                  <div className="grid grid-cols-12 gap-4 items-center group">
                    <div className="col-span-8">
                       <p className="text-sm font-bold text-foreground">{invoice.materials_line1_desc}</p>
                    </div>
                    <div className="col-span-4 text-right">
                       <p className="text-sm font-bold text-foreground font-syne">${(invoice.materials_line1_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                )}
                {invoice.materials_line2_desc && (
                  <div className="grid grid-cols-12 gap-4 items-center group">
                    <div className="col-span-8">
                       <p className="text-sm font-bold text-foreground">{invoice.materials_line2_desc}</p>
                    </div>
                    <div className="col-span-4 text-right">
                       <p className="text-sm font-bold text-foreground font-syne">${(invoice.materials_line2_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Total Calculations */}
            <div className="pt-10 border-t border-border/60 flex flex-col items-end gap-3 pr-2">
               <div className="flex justify-between items-center gap-12 text-sm">
                  <span className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="font-bold text-foreground font-syne">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="flex justify-between items-center gap-12 text-sm">
                  <span className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Tax ({invoice.tax_rate}%)</span>
                  <span className="font-bold text-foreground font-syne">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="flex justify-between items-center gap-12 pt-4 group">
                  <span className="font-black text-foreground uppercase tracking-[0.2em] text-[13px]">Total Due</span>
                  <span className="text-4xl font-black text-primary font-syne tracking-tighter transition-transform group-hover:scale-110">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
            </div>

            {/* Notes Section */}
            {invoice.notes && (
              <div className="pt-12 space-y-3">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Notes & Terms</p>
                 <div className="p-6 bg-secondary/30 rounded-2xl border border-border/40">
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">
                       {invoice.notes}
                    </p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
           {/* Client Summary Card */}
           <div className="card-premium p-6 space-y-6">
              <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Client Contact</h4>
              <div className="flex items-center gap-4">
                 <Avatar className="h-12 w-12 rounded-xl shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                       {invoice.clients?.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                 </Avatar>
                 <div>
                    <h5 className="font-bold text-foreground">{invoice.clients?.name}</h5>
                    <p className="text-xs text-muted-foreground">ID: {invoice.clients?.id?.substring(0, 8)}</p>
                 </div>
              </div>
              <div className="space-y-2 pt-2">
                 <Button variant="outline" className="w-full justify-start text-xs font-bold" size="sm">
                    <Mail className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    {invoice.clients?.email}
                 </Button>
                 <Button variant="outline" className="w-full justify-start text-xs font-bold" size="sm">
                    <Phone className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    {invoice.clients?.phone || 'Add phone number'}
                 </Button>
              </div>
              <Button className="w-full font-bold" size="sm" variant="secondary" onClick={() => router.push('/clients')}>
                 View Profile
                 <ExternalLink className="w-3.5 h-3.5 ml-2" />
              </Button>
           </div>

           {/* Payment Status Card */}
           <div className="card-premium p-6 space-y-6 overflow-hidden relative">
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
              <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Payment Status</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <CreditCard className="w-4 h-4 text-muted-foreground" />
                       <span className="text-sm font-bold">Method</span>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Wire / Check</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-muted-foreground" />
                       <span className="text-sm font-bold">Term</span>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Net 15</span>
                 </div>
                 <Button className="w-full font-bold mt-2" size="lg" variant="secondary">
                    Mark as Paid
                 </Button>
              </div>
           </div>

           {/* AI Insight */}
           <div className="card-premium p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/10">
              <div className="flex items-center gap-2 mb-4">
                 <Sparkles className="w-4 h-4 text-indigo-500" />
                 <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">AI Prediction</span>
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                 Based on historical data for {invoice.clients?.name}, this invoice is predicted to be paid within 4 days of the due date.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}
