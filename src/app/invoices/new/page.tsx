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
  Send
} from 'lucide-react'
import AIChat from '@/components/AIChat'

export default function NewInvoicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  
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
    { description: '', amount: 0 },
    { description: '', amount: 0 }
  ])

  const [materialItems, setMaterialItems] = useState([
    { description: '', amount: 0 },
    { description: '', amount: 0 }
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
    const tax = (materialsSubtotal * invoice.tax_rate) / 100
    const grandTotal = laborSubtotal + materialsSubtotal + tax

    return { laborSubtotal, materialsSubtotal, tax, grandTotal }
  }

  const addLaborItem = () => {
    setLaborItems([...laborItems, { description: '', amount: 0 }])
  }

  const removeLaborItem = (index: number) => {
    if (laborItems.length > 1) {
      setLaborItems(laborItems.filter((_, i) => i !== index))
    }
  }

  const updateLaborItem = (index: number, field: 'description' | 'amount', value: string | number) => {
    const updated = [...laborItems]
    updated[index] = { ...updated[index], [field]: value }
    setLaborItems(updated)
  }

  const addMaterialItem = () => {
    setMaterialItems([...materialItems, { description: '', amount: 0 }])
  }

  const removeMaterialItem = (index: number) => {
    if (materialItems.length > 1) {
      setMaterialItems(materialItems.filter((_, i) => i !== index))
    }
  }

  const updateMaterialItem = (index: number, field: 'description' | 'amount', value: string | number) => {
    const updated = [...materialItems]
    updated[index] = { ...updated[index], [field]: value }
    setMaterialItems(updated)
  }


  const handleApplyAIInvoice = (aiData: any) => {
    // Find matching client
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

    // Apply labor items
    if (aiData.labor_items && aiData.labor_items.length > 0) {
      setLaborItems(aiData.labor_items.map((item: any) => ({
        description: item.description || '',
        amount: item.amount || 0
      })))
    }

    // Apply material items
    if (aiData.material_items && aiData.material_items.length > 0) {
      setMaterialItems(aiData.material_items.map((item: any) => ({
        description: item.description || '',
        amount: item.amount || 0
      })))
    }
  }



  const handleSave = async () => {
    setLoading(true)
    
    // Handle more than 2 items by combining extras
    const labor1 = laborItems[0] || { description: '', amount: 0 }
    const labor2Extra = laborItems.slice(1) // All items after the first
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
      console.error(error)
    } else {
      // Increment next_invoice_number in settings
      await supabase.from('settings').update({ next_invoice_number: settings.next_invoice_number + 1 }).eq('id', 1)
      router.push('/')
    }
    setLoading(false)
  }


  const { laborSubtotal, materialsSubtotal, tax, grandTotal } = calculateTotals()


  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white border hover:border-slate-200 rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">New Invoice</h1>
            <p className="text-slate-500 text-sm mt-1">Draft #{invoice.invoice_number} • Created just now</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm">
            Save Draft
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200 text-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Sending...' : 'Send Invoice'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
              <FileText className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Invoice Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client</label>
                <select 
                  value={invoice.client_id}
                  onChange={(e) => setInvoice({...invoice, client_id: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                >
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Number</label>
                <div className="relative">
                   <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                    type="text" 
                    value={invoice.invoice_number}
                    readOnly
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-medium cursor-not-allowed"
                   />

                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Issued</label>
                <div className="relative">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                    type="date" 
                    value={invoice.invoice_date}
                    onChange={(e) => setInvoice({...invoice, invoice_date: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-medium"
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Labor Section */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
              <Wrench className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Labor</h2>
            </div>
            
            <table className="w-full text-left">
               <thead>
                 <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                   <th className="pb-4">Description</th>
                   <th className="pb-4 w-40 text-right">Amount ($)</th>
                   <th className="pb-4 w-10"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {laborItems.map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 pr-4">
                        <input 
                          type="text"
                          placeholder={index === 0 ? "Demolition & Site Prep" : "Additional Labor"}
                          value={item.description}
                          onChange={(e) => updateLaborItem(index, 'description', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white transition-all"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <input 
                          type="number"
                          placeholder="0.00"
                          value={item.amount || ''}
                          onChange={(e) => updateLaborItem(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white transition-all text-right font-medium"
                        />
                      </td>
                      <td className="py-3">
                        {laborItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLaborItem(index)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                 ))}
               </tbody>
            </table>
            <button 
              type="button"
              onClick={addLaborItem}
              className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors px-1"
            >
              <Plus className="w-3 h-3" />
              Add Labor Item
            </button>
          </div>

          {/* Materials Section */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
              <Package className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Materials</h2>
            </div>
            
             <table className="w-full text-left">
               <thead>
                 <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                   <th className="pb-4">Item Name</th>
                   <th className="pb-4 w-40 text-right">Amount ($)</th>
                   <th className="pb-4 w-10"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {materialItems.map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 pr-4">
                        <input 
                          type="text"
                          placeholder={index === 0 ? "Ceramic Subway Tile" : "Additional Material"}
                          value={item.description}
                          onChange={(e) => updateMaterialItem(index, 'description', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white transition-all"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <input 
                          type="number"
                          placeholder="0.00"
                          value={item.amount || ''}
                          onChange={(e) => updateMaterialItem(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white transition-all text-right font-medium"
                        />
                      </td>
                      <td className="py-3">
                        {materialItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMaterialItem(index)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                 ))}
               </tbody>
            </table>
            <button 
              type="button"
              onClick={addMaterialItem}
              className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors px-1"
            >
              <Plus className="w-3 h-3" />
              Add Material Item
            </button>
          </div>

          
          {/* Notes & Terms Section */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <Plus className="w-4 h-4 text-slate-400" />
              <h2 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Notes & Terms</h2>
            </div>
            <textarea 
              rows={4}
              value={invoice.notes}
              onChange={(e) => setInvoice({...invoice, notes: e.target.value})}
              placeholder="Add payment terms, thank you notes, or other details here..."
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white transition-all resize-none" 
            />
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 sticky top-8">
            <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-8">Summary</h2>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Labor Subtotal</span>
                <span className="text-slate-900 font-bold">${laborSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Materials Subtotal</span>
                <span className="text-slate-900 font-bold">${materialsSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-5 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Tax</span>
                  <div className="flex items-center bg-slate-100 rounded-lg px-2 py-0.5">
                     <input 
                      type="number" 
                      value={invoice.tax_rate}
                      onChange={(e) => setInvoice({...invoice, tax_rate: parseFloat(e.target.value) || 0})}
                      className="w-8 bg-transparent text-[10px] text-slate-500 font-bold text-center focus:outline-none"
                     />
                     <span className="text-[10px] text-slate-400 font-bold">%</span>
                  </div>
                </div>
                <span className="text-slate-900 font-bold">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                <span className="text-blue-600 font-bold text-lg">Grand Total</span>
                <span className="text-blue-600 font-extrabold text-2xl">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            
            <div className="mt-10 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
               <div className="flex gap-3">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    This invoice will be saved as a draft. You can preview the PDF and email it to your client after saving.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Assistant */}
      <AIChat clients={clients} onApplyInvoice={handleApplyAIInvoice} />
    </div>
  )
}

