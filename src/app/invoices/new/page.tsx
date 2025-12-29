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
  DollarSign
} from 'lucide-react'

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
      setSettings(settingsRes.data)
      setInvoice(prev => ({
        ...prev,
        invoice_number: `INV-${settingsRes.data.next_invoice_number.toString().padStart(4, '0')}`,
        tax_rate: settingsRes.data.default_tax_rate ?? 0,
        notes: settingsRes.data.default_notes ?? ''
      }))
    }

    // Check for AI-generated invoice data
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

    // Auto-advance to step 2 if we got items
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

    const { error } = await supabase.from('invoices').insert([invoiceData])

    if (error) {
      alert('Error creating invoice')
    } else {
      await supabase.from('settings').update({ next_invoice_number: settings.next_invoice_number + 1 }).eq('id', 1)
      router.push('/')
    }
    setLoading(false)
  }

  const { subtotal, tax, grandTotal } = calculateTotals()

  const StepIndicator = ({ current, total, label }: { current: number, total: number, label: string }) => (
    <div className="bg-card/50 backdrop-blur-sm border-b border-border px-6 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-foreground">Step {current} of {total}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out rounded-full"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border h-16 flex items-center px-6 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-xl transition-colors group">
            <ChevronLeft className="w-5 h-5 text-foreground group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground font-syne">New Invoice</h1>
          </div>
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground font-semibold transition-colors text-sm">
            Cancel
          </button>
        </div>
      </header>

      {/* Step Indicator */}
      <StepIndicator
        current={step}
        total={3}
        label={step === 1 ? 'Details' : step === 2 ? 'Line Items' : 'Review'}
      />

      {/* Main Content */}
      <main className="flex-1 pb-32">
        <div className="max-w-3xl mx-auto px-6 py-8">

          {/* Step 1: Invoice Details */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <h2 className="text-2xl font-bold text-foreground font-syne">Invoice Details</h2>
                <p className="text-muted-foreground text-sm mt-1">Set up the basic information for this invoice.</p>
              </div>

              <div className="card-premium p-6 space-y-6">
                {/* Client Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">Client</label>
                  <div className="relative group">
                    <select
                      value={invoice.client_id}
                      onChange={(e) => setInvoice({ ...invoice, client_id: e.target.value })}
                      className="input-field appearance-none pr-12"
                    >
                      <option value="">Select a client...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Invoice Number */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">Invoice Number</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={invoice.invoice_number}
                      readOnly
                      className="input-field pl-11 bg-secondary cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">Issue Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={invoice.invoice_date}
                        onChange={(e) => setInvoice({ ...invoice, invoice_date: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">Due Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={invoice.due_date}
                        onChange={(e) => setInvoice({ ...invoice, due_date: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="flex items-center gap-4 p-5 bg-secondary/50 border border-border rounded-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  You'll add labor and material line items in the next step.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Line Items */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-up">
              {/* Labor Section */}
              <div className="card-premium overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-blue-500/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-blue-500" />
                    </div>
                    <h2 className="font-bold text-foreground">Labor</h2>
                  </div>
                  <button
                    onClick={addLaborItem}
                    className="w-9 h-9 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-border">
                  {laborItems.map((item, index) => (
                    <div key={index} className={`p-5 transition-all ${item.isEditing ? 'bg-blue-500/5' : 'hover:bg-secondary/30'}`}>
                      {item.isEditing ? (
                        <div className="space-y-4">
                          <input
                            autoFocus
                            placeholder="Description (e.g., Kitchen demolition)"
                            value={item.description}
                            onChange={(e) => updateLaborItem(index, { description: e.target.value })}
                            className="w-full text-base font-semibold text-foreground bg-transparent border-b-2 border-blue-500/30 focus:border-blue-500 outline-none py-2"
                          />
                          <div className="flex items-end gap-4">
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount</label>
                              <div className="relative mt-1">
                                <DollarSign className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={item.amount || ''}
                                  onChange={(e) => updateLaborItem(index, { amount: parseFloat(e.target.value) || 0 })}
                                  className="w-full pl-5 py-2 text-xl font-bold text-blue-500 bg-transparent outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateLaborItem(index, { isEditing: false })}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeLaborItem(index)}
                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="flex items-center justify-between cursor-pointer group"
                          onClick={() => updateLaborItem(index, { isEditing: true })}
                        >
                          <div>
                            <h3 className="font-bold text-foreground">{item.description || 'Untitled'}</h3>
                            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded mt-1 inline-block">Labor</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-foreground">${(item.amount || 0).toFixed(2)}</span>
                            <Pencil className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addLaborItem}
                  className="w-full py-4 text-blue-500 font-semibold hover:bg-blue-500/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Labor Item
                </button>
              </div>

              {/* Materials Section */}
              <div className="card-premium overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-violet-500/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-violet-500" />
                    </div>
                    <h2 className="font-bold text-foreground">Materials</h2>
                  </div>
                  <button
                    onClick={addMaterialItem}
                    className="w-9 h-9 bg-violet-500 text-white rounded-lg flex items-center justify-center hover:bg-violet-600 transition-colors shadow-lg shadow-violet-500/20"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-border">
                  {materialItems.map((item, index) => (
                    <div key={index} className={`p-5 transition-all ${item.isEditing ? 'bg-violet-500/5' : 'hover:bg-secondary/30'}`}>
                      {item.isEditing ? (
                        <div className="space-y-4">
                          <input
                            autoFocus
                            placeholder="Material name (e.g., Flooring tiles)"
                            value={item.description}
                            onChange={(e) => updateMaterialItem(index, { description: e.target.value })}
                            className="w-full text-base font-semibold text-foreground bg-transparent border-b-2 border-violet-500/30 focus:border-violet-500 outline-none py-2"
                          />
                          <div className="flex items-end gap-4">
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Price</label>
                              <div className="relative mt-1">
                                <DollarSign className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={item.amount || ''}
                                  onChange={(e) => updateMaterialItem(index, { amount: parseFloat(e.target.value) || 0 })}
                                  className="w-full pl-5 py-2 text-xl font-bold text-violet-500 bg-transparent outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateMaterialItem(index, { isEditing: false })}
                                className="p-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeMaterialItem(index)}
                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="flex items-center justify-between cursor-pointer group"
                          onClick={() => updateMaterialItem(index, { isEditing: true })}
                        >
                          <div>
                            <h3 className="font-bold text-foreground">{item.description || 'Untitled'}</h3>
                            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded mt-1 inline-block">Material</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-foreground">${(item.amount || 0).toFixed(2)}</span>
                            <Pencil className="w-4 h-4 text-muted-foreground/30 group-hover:text-violet-500 transition-colors" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addMaterialItem}
                  className="w-full py-4 text-violet-500 font-semibold hover:bg-violet-500/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Material Item
                </button>
              </div>

              {/* Summary */}
              <div className="pt-6 border-t border-border space-y-3 text-right">
                <div className="flex justify-end items-center gap-8">
                  <span className="text-sm font-semibold text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-bold text-foreground w-28">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-end items-center gap-8">
                  <span className="text-sm font-semibold text-muted-foreground">Tax ({invoice.tax_rate}%)</span>
                  <span className="text-lg font-bold text-muted-foreground w-28">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-end items-center gap-8 pt-3">
                  <span className="text-sm font-bold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary font-syne w-28">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-2xl font-bold text-foreground font-syne">Review & Finish</h2>
                <p className="text-muted-foreground text-sm mt-1">Verify the details and add any notes.</p>
              </div>

              {/* Grand Total Card */}
              <div className="relative rounded-2xl overflow-hidden grain">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="relative p-8 flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground/70 font-bold uppercase tracking-widest text-[10px]">Grand Total</p>
                    <h3 className="text-4xl font-bold text-primary-foreground font-syne mt-1">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    <p className="text-primary-foreground/60 text-xs mt-1">Including {invoice.tax_rate}% tax</p>
                  </div>
                  <div className="w-14 h-14 bg-primary-foreground/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-foreground/20">
                    <DollarSign className="w-7 h-7 text-primary-foreground" />
                  </div>
                </div>
              </div>

              {/* Tax Rate */}
              <div className="card-premium p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-bold text-foreground">Tax Rate</label>
                    <p className="text-xs text-muted-foreground mt-0.5">Adjust if needed</p>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-xl border border-border">
                    <input
                      type="number"
                      value={invoice.tax_rate}
                      onChange={(e) => setInvoice({ ...invoice, tax_rate: parseFloat(e.target.value) || 0 })}
                      className="bg-transparent w-12 text-base font-bold text-primary outline-none text-center"
                    />
                    <span className="text-sm font-bold text-primary">%</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-bold text-foreground">Notes / Payment Terms</label>
                </div>
                <textarea
                  rows={4}
                  value={invoice.notes}
                  onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                  placeholder="Thank you for your business. Payment is due within 30 days..."
                  className="input-field py-4 min-h-[120px] resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 md:left-64 right-0 p-5 bg-background/90 backdrop-blur-xl border-t border-border z-30">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="h-14 px-6 border border-border rounded-xl font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 btn-primary h-14 text-base group"
            >
              Continue
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 btn-primary h-14 text-base group disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Create Invoice
                  <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
