'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Trash2,
  Calendar,
  Hash,
  Wrench,
  Package,
  ChevronLeft,
  ArrowRight,
  Eye,
  Check,
  ChevronDown,
  Pencil,
  Info,
  FileText,
  DollarSign,
  User,
  MoreVertical,
  Loader2,
  X,
  CreditCard,
  Building2,
  MapPin,
  Phone,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'

export default function NewInvoicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [step, setStep] = useState(1)

  const [invoice, setInvoice] = useState({
    client_id: '',
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    project_description: '',
    tax_rate: 0,
    notes: ''
  })

  const [laborItems, setLaborItems] = useState([
    { description: '', amount: 0, isEditing: false }
  ])

  const [materialItems, setMaterialItems] = useState([
    { description: '', amount: 0, isEditing: false }
  ])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [clientsRes, settingsRes] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('settings').select('*').eq('id', 1).single()
    ])

    if (clientsRes.data) setClients(clientsRes.data)
    if (settingsRes.data) {
      if (!settingsRes.data.company_name) {
        router.push('/settings?onboarding=true')
        return
      }

      setSettings(settingsRes.data)
      setInvoice(prev => ({
        ...prev,
        invoice_number: `INV-${settingsRes.data.next_invoice_number.toString().padStart(4, '0')}`,
        tax_rate: settingsRes.data.default_tax_rate ?? 0,
        notes: settingsRes.data.default_notes ?? ''
      }))
    } else {
      router.push('/settings?onboarding=true')
      return
    }

    const aiData = sessionStorage.getItem('ai_invoice_data')
    if (aiData) {
      try {
        const parsed = JSON.parse(aiData)
        handleApplyAIInvoice(parsed, clientsRes.data || [])
        sessionStorage.removeItem('ai_invoice_data')
      } catch (e) {
        console.error('Failed to parse AI invoice data', e)
      }
    }
  }

  const calculateTotals = () => {
    const laborSubtotal = laborItems.reduce((sum, item) => sum + (item.amount || 0), 0)
    const materialsSubtotal = materialItems.reduce((sum, item) => sum + (item.amount || 0), 0)
    const subtotal = laborSubtotal + materialsSubtotal
    const tax = (subtotal * invoice.tax_rate) / 100
    const grandTotal = subtotal + tax

    return { laborSubtotal, materialsSubtotal, subtotal, tax, grandTotal }
  }

  const addLaborItem = () => {
    setLaborItems([...laborItems, { description: '', amount: 0, isEditing: true }])
  }

  const removeLaborItem = (index: number) => {
    setLaborItems(laborItems.filter((_, i) => i !== index))
  }

  const updateLaborItem = (index: number, updates: any) => {
    const updated = [...laborItems]
    updated[index] = { ...updated[index], ...updates }
    setLaborItems(updated)
  }

  const addMaterialItem = () => {
    setMaterialItems([...materialItems, { description: '', amount: 0, isEditing: true }])
  }

  const removeMaterialItem = (index: number) => {
    setMaterialItems(materialItems.filter((_, i) => i !== index))
  }

  const updateMaterialItem = (index: number, updates: any) => {
    const updated = [...materialItems]
    updated[index] = { ...updated[index], ...updates }
    setMaterialItems(updated)
  }

  const handleApplyAIInvoice = (aiData: any, clientList?: any[]) => {
    const searchClients = clientList || clients
    const matchedClient = searchClients.find(c =>
      c.name.toLowerCase().includes(aiData.client_name?.toLowerCase() || '')
    )

    setInvoice(prev => ({
      ...prev,
      client_id: matchedClient?.id || prev.client_id,
      due_date: aiData.due_date || prev.due_date,
      tax_rate: aiData.tax_rate ?? prev.tax_rate,
      notes: aiData.notes || prev.notes
    }))

    if (aiData.labor_items && aiData.labor_items.length > 0) {
      setLaborItems(aiData.labor_items.map((item: any) => ({
        description: item.description || '',
        amount: item.amount || 0,
        isEditing: false
      })))
    }

    if (aiData.material_items && aiData.material_items.length > 0) {
      setMaterialItems(aiData.material_items.map((item: any) => ({
        description: item.description || '',
        amount: item.amount || 0,
        isEditing: false
      })))
    }

    if ((aiData.labor_items?.length || 0) + (aiData.material_items?.length || 0) > 0) {
      setStep(2)
    }
  }

  const handleSave = async () => {
    setLoading(true)

    const labor1 = laborItems[0] || { description: '', amount: 0 }
    const labor2Extra = laborItems.slice(1)
    const labor2Combined = labor2Extra.length > 0
      ? {
        description: labor2Extra.map(item => item.description).filter(Boolean).join('; '),
        amount: labor2Extra.reduce((sum, item) => sum + (item.amount || 0), 0)
      }
      : { description: '', amount: 0 }

    const material1 = materialItems[0] || { description: '', amount: 0 }
    const material2Extra = materialItems.slice(1)
    const material2Combined = material2Extra.length > 0
      ? {
        description: material2Extra.map(item => item.description).filter(Boolean).join('; '),
        amount: material2Extra.reduce((sum, item) => sum + (item.amount || 0), 0)
      }
      : { description: '', amount: 0 }

    const invoiceData = {
      ...invoice,
      labor_line1_desc: labor1.description,
      labor_line1_amount: labor1.amount,
      labor_line2_desc: labor2Combined.description,
      labor_line2_amount: labor2Combined.amount,
      materials_line1_desc: material1.description,
      materials_line1_amount: material1.amount,
      materials_line2_desc: material2Combined.description,
      materials_line2_amount: material2Combined.amount,
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('You must be logged in to create invoices')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('invoices').insert([{
      ...invoiceData,
      user_id: user.id
    }])

    if (error) {
      console.error(error)
      alert('Error creating invoice')
    } else {
      await supabase.from('settings').update({ next_invoice_number: settings.next_invoice_number + 1 }).eq('id', 1)
      router.push('/')
    }
    setLoading(false)
  }

  const { subtotal, tax, grandTotal } = calculateTotals()

  const StepIndicator = ({ current, total, label }: { current: number, total: number, label: string }) => (
    <div className="bg-background/60 backdrop-blur-sm border-b border-border/40 px-2 sm:px-6 py-4 sm:py-6 transition-all">
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-0">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none">Step {current} of {total}</span>
            <span className="text-sm font-bold text-foreground tracking-tight leading-none">{label}</span>
          </div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-full self-start sm:self-auto">{Math.round((current / total) * 100)}% Complete</span>
        </div>
        <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden w-full">
          <div
            className="h-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-1000 ease-out rounded-full shadow-[0_0_12px_-2px_rgba(249,115,22,0.4)] relative"
            style={{ width: `${(current / total) * 100}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/20" />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-border/40 h-16 sm:h-20 flex items-center px-2 sm:px-6 sticky top-0 z-50 transition-all">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full h-10 w-10 hover:bg-secondary/50 hover:text-foreground text-muted-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex flex-col items-center">
            <h1 className="text-base sm:text-lg font-bold text-foreground font-syne tracking-tight">New Invoice</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-80">{invoice.invoice_number}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md text-[10px] sm:text-xs px-3 sm:px-4 h-8 sm:h-9 uppercase tracking-wide transition-colors"
          >
            Cancel
          </Button>
        </div>
      </header>

      {/* Step Indicator */}
      <StepIndicator
        current={step}
        total={3}
        label={step === 1 ? 'Job Details' : step === 2 ? 'Line Items' : 'Submission'}
      />

      {/* Main Content */}
      <main className="flex-1 pb-12">
        <div className="max-w-3xl mx-auto px-2 sm:px-6 py-6 sm:py-8">

          {/* Step 1: Invoice Details */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-syne tracking-tight">Invoice Details</h2>
                <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">Set up the basic information for this invoice.</p>
              </div>

              <div className="card-premium p-5 sm:p-8 space-y-6">
                {/* Client Selection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Client Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <select
                      value={invoice.client_id}
                      onChange={(e) => setInvoice({ ...invoice, client_id: e.target.value })}
                      className="input-field appearance-none pl-12 pr-12 h-12"
                    >
                      <option value="">Select a client...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none opacity-50" />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Issue Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                      <input
                        type="date"
                        value={invoice.invoice_date}
                        onChange={(e) => setInvoice({ ...invoice, invoice_date: e.target.value })}
                        className="input-field pl-12 h-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Due Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                      <input
                        type="date"
                        value={invoice.due_date}
                        onChange={(e) => setInvoice({ ...invoice, due_date: e.target.value })}
                        className="input-field pl-12 h-12"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="flex items-start sm:items-center gap-3 sm:gap-5 p-4 sm:p-6 bg-secondary/40 border border-border/60 rounded-md">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-md flex items-center justify-center border border-primary/20 flex-shrink-0">
                  <Info className="w-6 h-6 text-primary" />
                </div>
                <p className="text-xs sm:text-sm text-foreground font-semibold leading-relaxed">
                  Tip: You can use the AI Assistant at any time to automatically generate these details from your messy notes.
                </p>
              </div>

              {/* Step 1 Action */}
              <div className="pt-6">
                <Button
                  onClick={() => setStep(2)}
                  variant="premium"
                  size="premium"
                  className="w-full"
                >
                  Continue to Items
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Line Items */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-up">
              {/* Labor Section */}
              <div className="card-premium overflow-hidden">
                <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-border flex items-center justify-between bg-primary/5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 bg-primary/10 rounded-md flex items-center justify-center border border-primary/20">
                      <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground text-base sm:text-lg">Labor Fees</h2>
                      <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Work & Services</p>
                    </div>
                  </div>
                  <Button
                    onClick={addLaborItem}
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10 bg-primary hover:bg-primary/90 rounded-md"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>

                <div className="divide-y divide-border/60">
                  {laborItems.map((item, index) => (
                    <div key={index} className={`p-4 sm:p-6 transition-all ${item.isEditing ? 'bg-primary/[0.03]' : 'hover:bg-secondary/20'}`}>
                      {item.isEditing ? (
                        <div className="space-y-5">
                          <input
                            autoFocus
                            placeholder="Describe the task (e.g., Master Bathroom Demolition)"
                            value={item.description}
                            onChange={(e) => updateLaborItem(index, { description: e.target.value })}
                            className="w-full text-lg font-bold text-foreground bg-transparent border-b-2 border-primary/20 focus:border-primary outline-none py-2 placeholder:text-muted-foreground/40"
                          />
                          <div className="flex items-end gap-6">
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">Fee Amount</label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={item.amount || ''}
                                  onChange={(e) => updateLaborItem(index, { amount: parseFloat(e.target.value) || 0 })}
                                  className="w-full pl-8 py-3 text-2xl font-bold text-primary bg-secondary/50 rounded-md border border-primary/10 focus:border-primary focus:bg-white outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <Button
                                onClick={() => updateLaborItem(index, { isEditing: false })}
                                className="h-12 sm:h-14 px-4 sm:px-6 flex-1 sm:flex-initial bg-primary hover:bg-primary/90 rounded-md font-bold text-sm sm:text-base"
                              >
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                Save Item
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => removeLaborItem(index)}
                                className="h-12 sm:h-14 w-12 sm:w-14 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md"
                              >
                                <Trash2 className="w-6 h-6 sm:w-7 sm:h-7" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="flex items-center justify-between cursor-pointer group"
                          onClick={() => updateLaborItem(index, { isEditing: true })}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-sm bg-primary/40" />
                            <div>
                              <h3 className="font-bold text-foreground text-[15px] uppercase tracking-tight">{item.description || 'Unnamed Labor task'}</h3>
                              <p className="text-[10px] font-bold text-muted-foreground tracking-widest mt-0.5 opacity-60">Labor Item</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-xl font-bold font-syne text-foreground tracking-tight">${(item.amount || 0).toLocaleString()}</span>
                            <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials Section */}
              <div className="card-premium overflow-hidden">
                <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-border flex items-center justify-between bg-accent/5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 bg-accent/10 rounded-md flex items-center justify-center border border-accent/20">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground text-base sm:text-lg">Materials</h2>
                      <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Inventory & Parts</p>
                    </div>
                  </div>
                  <Button
                    onClick={addMaterialItem}
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10 bg-accent hover:bg-accent/90 rounded-md"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>

                <div className="divide-y divide-border/60">
                  {materialItems.map((item, index) => (
                    <div key={index} className={`p-4 sm:p-6 transition-all ${item.isEditing ? 'bg-accent/[0.03]' : 'hover:bg-secondary/20'}`}>
                      {item.isEditing ? (
                        <div className="space-y-5">
                          <input
                            autoFocus
                            placeholder="Material name (e.g., 50sqft Porcelain Tile)"
                            value={item.description}
                            onChange={(e) => updateMaterialItem(index, { description: e.target.value })}
                            className="w-full text-lg font-bold text-foreground bg-transparent border-b-2 border-accent/20 focus:border-accent outline-none py-2 placeholder:text-muted-foreground/40"
                          />
                          <div className="flex items-end gap-6">
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 ml-1">Total Cost</label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-foreground" />
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={item.amount || ''}
                                  onChange={(e) => updateMaterialItem(index, { amount: parseFloat(e.target.value) || 0 })}
                                  className="w-full pl-8 py-3 text-2xl font-bold text-accent-foreground bg-secondary/50 rounded-md border border-accent/10 focus:border-accent focus:bg-white outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <Button
                                onClick={() => updateMaterialItem(index, { isEditing: false })}
                                className="h-12 sm:h-14 px-4 sm:px-6 flex-1 sm:flex-initial bg-accent hover:bg-accent/90 rounded-md font-bold text-sm text-accent-foreground"
                              >
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                Save Item
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => removeMaterialItem(index)}
                                className="h-12 sm:h-14 w-12 sm:w-14 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md"
                              >
                                <Trash2 className="w-6 h-6 sm:w-7 sm:h-7" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="flex items-center justify-between cursor-pointer group"
                          onClick={() => updateMaterialItem(index, { isEditing: true })}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-sm bg-accent/40" />
                            <div>
                              <h3 className="font-bold text-foreground text-[15px] uppercase tracking-tight">{item.description || 'Unnamed Material'}</h3>
                              <p className="text-[10px] font-bold text-muted-foreground tracking-widest mt-0.5 opacity-60">Inventory Item</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-xl font-bold font-syne text-foreground tracking-tight">${(item.amount || 0).toLocaleString()}</span>
                            <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="pt-8 border-t border-border/40 space-y-3 sm:space-y-4 text-right pr-2 sm:pr-6">
                <div className="flex justify-end items-center gap-4 sm:gap-10">
                  <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Subtotal</span>
                  <span className="text-base sm:text-xl font-bold text-foreground w-24 sm:w-32 font-syne tracking-tight">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-end items-center gap-4 sm:gap-10">
                  <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Tax ({invoice.tax_rate}%)</span>
                  <span className="text-base sm:text-xl font-bold text-muted-foreground w-24 sm:w-32 font-syne tracking-tight">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-end items-center gap-4 sm:gap-10 pt-2 sm:pt-4">
                  <span className="text-[11px] sm:text-[13px] font-extrabold text-foreground uppercase tracking-widest">Grand Total</span>
                  <span className="text-2xl sm:text-4xl font-bold text-primary font-syne w-24 sm:w-32 tracking-tighter">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="h-12 sm:h-14 px-6 sm:px-10 rounded-md font-bold text-sm sm:text-base text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                  Go Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  variant="premium"
                  size="premium"
                  className="flex-1"
                >
                  Continue to Review
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </div>
            </div>
          )
          }

          {/* Step 3: Review */}
          {
            step === 3 && (
              <div className="space-y-8 animate-fade-up">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-syne tracking-tight">Review Invoice</h2>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1">Verify details and finalize notes before sending.</p>
                </div>

                {/* Total Card */}
                <div className="relative rounded-md overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                  <div className="relative p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                    <div>
                      <label className="text-[9px] sm:text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-2">Invoice Amount</label>
                      <h3 className="text-3xl sm:text-5xl font-bold text-white font-syne tracking-tight leading-none">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                      <div className="flex flex-wrap gap-2 sm:gap-2.5 mt-3 sm:mt-4">
                        <span className="px-2 sm:px-2.5 py-1 bg-white/15 text-white font-bold text-[9px] sm:text-[10px] rounded border border-white/20 uppercase tracking-widest">Tax included</span>
                        <span className="px-2 sm:px-2.5 py-1 bg-white/15 text-white font-bold text-[9px] sm:text-[10px] rounded border border-white/20 uppercase tracking-widest">{invoice.invoice_number}</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/15 backdrop-blur-xl rounded-lg flex items-center justify-center border border-white/20">
                      <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Tax Override */}
                  <div className="card-premium p-4 sm:p-6">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block mb-4">Tax Percentage</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-secondary/50 rounded-md h-12 border border-border flex items-center px-4">
                        <input
                          type="number"
                          value={invoice.tax_rate}
                          onChange={(e) => setInvoice({ ...invoice, tax_rate: parseFloat(e.target.value) || 0 })}
                          className="bg-transparent text-xl font-bold text-foreground outline-none w-full"
                        />
                        <span className="text-primary font-bold">%</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="h-12 w-12 rounded-md bg-primary/5 flex items-center justify-center border border-primary/10 cursor-help">
                              <Info className="w-5 h-5 text-primary" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Standard rate is {settings?.default_tax_rate}%</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Confirmation Box */}
                  <div className="card-premium p-4 sm:p-6 bg-emerald-500/[0.03] border-emerald-500/10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Ready to Ship</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground font-medium pl-11">All details look good to go. Invoice will be saved immediately.</p>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Pencil className="w-4 h-4 text-primary" />
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Closing Notes & Terms</label>
                  </div>
                  <textarea
                    rows={5}
                    value={invoice.notes}
                    onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                    placeholder="Thank you for choosing Apex Remodeling. Payment is due within 15 days..."
                    className="input-field py-5 px-6 min-h-[160px] resize-none text-[15px] leading-relaxed font-medium"
                  />
                </div>

                {/* Step 3 Actions */}
                <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => setStep(2)}
                    className="h-12 sm:h-14 px-6 sm:px-10 rounded-md font-bold text-sm sm:text-base text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                    Go Back
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    variant="premium"
                    size="premium"
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Generating Invoice...
                      </>
                    ) : (
                      <>
                        Finalize & Create Invoice
                        <Check className="w-6 h-6 ml-3" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          }
        </div >
      </main >
    </div >
  )
}
