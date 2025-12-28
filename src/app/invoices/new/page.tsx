'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  Hash, 
  Wrench, 
  Package, 
  FileText,
  ChevronLeft,
  Save,
  Send,
  ArrowRight,
  Eye,
  Check,
  ChevronDown,
  Pencil,
  X,
  Info
} from 'lucide-react'
import AIChat from '@/components/AIChat'

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

  const handleApplyAIInvoice = (aiData: any) => {
    const matchedClient = clients.find(c => 
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
    <div className="bg-white border-b border-slate-100 px-6 py-4">
      <div className="max-w-xl mx-auto flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-slate-900">Step {current} of {total}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</span>
      </div>
      <div className="max-w-xl mx-auto h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 rounded-full"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-100 h-16 flex items-center px-6 sticky top-0 z-30">
        <div className="max-w-xl mx-auto w-full flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-900" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">New Invoice</h1>
          <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 font-semibold transition-colors">
            Cancel
          </button>
        </div>
      </header>

      {/* Step Indicator */}
      <StepIndicator 
        current={step} 
        total={3} 
        label={step === 1 ? 'Header Info' : step === 2 ? 'Add Items' : 'Invoice Footer'} 
      />

      {/* Main Content */}
      <main className="flex-1 pb-32">
        <div className="max-w-xl mx-auto px-6 py-10">
          
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-slate-900 font-outfit">Invoice Details</h2>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600 ml-1">Client</label>
                  <div className="relative group">
                    <select 
                      value={invoice.client_id}
                      onChange={(e) => setInvoice({...invoice, client_id: e.target.value})}
                      className="w-full h-16 pl-6 pr-12 bg-white border-2 border-slate-100 rounded-2xl text-base font-semibold text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none"
                    >
                      <option value="">Select or add client...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-1.5">
                    <Info className="w-3 h-3" />
                    Who is this invoice for?
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-600 ml-1">Invoice #</label>
                  <div className="relative group">
                    <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors font-bold" />
                    <input 
                      type="text" 
                      value={invoice.invoice_number}
                      readOnly
                      className="w-full h-16 pl-14 pr-12 bg-white border-2 border-slate-100 rounded-2xl text-base font-bold text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none cursor-not-allowed selection:bg-transparent"
                    />
                    <Pencil className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-600 ml-1">Issued Date</label>
                    <div className="relative group">
                      <input 
                        type="date" 
                        value={invoice.invoice_date}
                        onChange={(e) => setInvoice({...invoice, invoice_date: e.target.value})}
                        className="w-full h-16 px-6 bg-white border-2 border-slate-100 rounded-2xl text-base font-bold text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                      />
                      <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-600 ml-1">Due Date</label>
                    <div className="relative group">
                      <input 
                        type="date" 
                        value={invoice.due_date}
                        onChange={(e) => setInvoice({...invoice, due_date: e.target.value})}
                        className="w-full h-16 px-6 bg-white border-2 border-slate-100 rounded-2xl text-base font-bold text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                      />
                      <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none grayscale opacity-70" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                   <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                    <Info className="w-6 h-6 text-slate-400" />
                   </div>
                   <p className="text-sm font-semibold text-slate-500">Line items will be added in the next step.</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Labor Section */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="font-bold text-slate-900 text-lg">Labor</h2>
                  </div>
                  <button onClick={addLaborItem} className="p-2 bg-primary text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-md shadow-primary/20">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {laborItems.map((item, index) => (
                    <div key={index} className={`p-6 transition-all ${item.isEditing ? 'bg-blue-50/30 ring-1 ring-inset ring-blue-100' : 'hover:bg-slate-50/50'}`}>
                      {item.isEditing ? (
                        <div className="space-y-4">
                          <input 
                            autoFocus
                            placeholder="Labor Description"
                            value={item.description}
                            onChange={(e) => updateLaborItem(index, { description: e.target.value })}
                            className="w-full text-lg font-bold text-slate-900 bg-transparent border-b-2 border-blue-200 focus:border-primary outline-none py-2"
                          />
                          <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Amount ($)</label>
                              <div className="relative">
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                <input 
                                  type="number"
                                  placeholder="0.00"
                                  value={item.amount || ''}
                                  onChange={(e) => updateLaborItem(index, { amount: parseFloat(e.target.value) || 0 })}
                                  className="w-full pl-4 py-2 text-xl font-bold text-primary bg-transparent outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                              <button onClick={() => updateLaborItem(index, { isEditing: false })} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-colors">
                                <Check className="w-5 h-5" />
                              </button>
                              <button onClick={() => removeLaborItem(index)} className="p-2 border border-transparent text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group cursor-pointer" onClick={() => updateLaborItem(index, { isEditing: true })}>
                          <div className="space-y-1">
                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.description || "Untitled Labor"}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">Flat Fee</span>
                              <span className="text-xs text-slate-400 font-medium tracking-tight">remolding-app</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-xl text-slate-900">${(item.amount || 0).toFixed(2)}</span>
                            <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={addLaborItem}
                  className="w-full py-5 flex items-center justify-center gap-2 text-primary font-bold hover:bg-slate-50 transition-colors group"
                >
                  <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                  Add Labor Item
                </button>
              </div>

              {/* Materials Section */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="font-bold text-slate-900 text-lg">Materials</h2>
                  </div>
                  <button onClick={addMaterialItem} className="p-2 bg-indigo-600 text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-md shadow-indigo-200">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {materialItems.map((item, index) => (
                    <div key={index} className={`p-6 transition-all ${item.isEditing ? 'bg-indigo-50/30 ring-1 ring-inset ring-indigo-100' : 'hover:bg-slate-50/50'}`}>
                      {item.isEditing ? (
                        <div className="space-y-4">
                          <input 
                            autoFocus
                            placeholder="Material Name"
                            value={item.description}
                            onChange={(e) => updateMaterialItem(index, { description: e.target.value })}
                            className="w-full text-lg font-bold text-slate-900 bg-transparent border-b-2 border-indigo-200 focus:border-indigo-600 outline-none py-2"
                          />
                          <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Total Price ($)</label>
                              <div className="relative">
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                <input 
                                  type="number"
                                  placeholder="0.00"
                                  value={item.amount || ''}
                                  onChange={(e) => updateMaterialItem(index, { amount: parseFloat(e.target.value) || 0 })}
                                  className="w-full pl-4 py-2 text-xl font-bold text-indigo-600 bg-transparent outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                              <button onClick={() => updateMaterialItem(index, { isEditing: false })} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                                <Check className="w-5 h-5" />
                              </button>
                              <button onClick={() => removeMaterialItem(index)} className="p-2 border border-transparent text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group cursor-pointer" onClick={() => updateMaterialItem(index, { isEditing: true })}>
                          <div className="space-y-1">
                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.description || "Untitled Material"}</h3>
                             <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">Product</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-xl text-slate-900">${(item.amount || 0).toFixed(2)}</span>
                            <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={addMaterialItem}
                  className="w-full py-5 flex items-center justify-center gap-2 text-indigo-600 font-bold hover:bg-slate-50 transition-colors group"
                >
                  <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                  Add Material Item
                </button>
              </div>

              {/* Mid-form Summary */}
              <div className="pt-8 border-t border-slate-200/60 flex flex-col items-end space-y-4">
                <div className="flex items-center gap-10">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="text-xl font-bold text-slate-900">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-10 group">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Tax ({invoice.tax_rate}%)</span>
                    <Pencil className="w-3 h-3 text-slate-300 group-hover:text-primary transition-colors cursor-pointer" />
                  </div>
                  <span className="text-xl font-bold text-slate-500">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-4 flex flex-col items-end">
                   <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Estimated Total</span>
                   <span className="text-4xl font-extrabold text-primary font-outfit tracking-tight">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-3xl font-bold text-slate-900 font-outfit">Invoice Footer</h2>

               <div className="space-y-8">
                  <div className="flex flex-col items-end gap-3 pb-8 border-b border-slate-100">
                    <div className="flex items-center gap-10">
                      <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                      <span className="text-xl font-bold text-slate-900">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Tax Rate</span>
                        <div className="bg-blue-50 px-2.5 py-1 rounded-lg flex items-center border border-blue-100">
                           <input 
                            type="number"
                            value={invoice.tax_rate}
                            onChange={(e) => setInvoice({...invoice, tax_rate: parseFloat(e.target.value) || 0})}
                            className="bg-transparent w-8 text-xs font-bold text-primary outline-none text-center"
                           />
                           <span className="text-[10px] font-bold text-primary">%</span>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-slate-500">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
                     {/* Decorative circle */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
                     <div className="relative flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-white/70 font-bold uppercase tracking-widest text-[10px]">Grand Total</p>
                          <h3 className="text-4xl font-extrabold font-outfit tracking-tight">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                          <p className="text-white/60 text-[10px] font-medium mt-1 italic">Includes all applicable taxes and fees</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                          <span className="font-bold text-xl">$</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 ml-1">
                      <Pencil className="w-4 h-4 text-slate-400" />
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Notes / Terms</h3>
                    </div>
                    <textarea 
                      rows={6}
                      value={invoice.notes}
                      onChange={(e) => setInvoice({...invoice, notes: e.target.value})}
                      placeholder="Thank you for your business. Please send payment..."
                      className="w-full p-8 bg-white border-2 border-slate-100 rounded-3xl text-sm font-medium text-slate-600 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none shadow-sm"
                    />
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 md:left-64 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-100 z-30">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="h-16 px-8 border-2 border-slate-100 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button 
              onClick={() => setStep(step + 1)}
              className="flex-1 h-16 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Next: {step === 1 ? 'Add Items' : 'Review & Finish'}
              <ArrowRight className="w-5 h-5 flex-shrink-0" />
            </button>
          ) : (
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex-1 h-16 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save & Preview Invoice
                  <Eye className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </footer>

      {/* AI Chat Assistant */}
      <AIChat clients={clients} onApplyInvoice={handleApplyAIInvoice} />
    </div>
  )
}

