'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Percent, 
  Hash, 
  FileText, 
  Upload, 
  Check, 
  Info,
  Palette
} from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [settings, setSettings] = useState({
    company_name: '',
    company_phone: '',
    company_email: '',
    company_address: '',
    default_tax_rate: 0,
    next_invoice_number: 1,
    brand_color: '#2563eb',
    accent_color: '#000000',
    logo_url: '',
    default_notes: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()
    
    if (data) {
      // Merge with defaults to ensure no null values break controlled inputs
      setSettings(prev => ({
        ...prev,
        company_name: data.company_name ?? '',
        company_phone: data.company_phone ?? '',
        company_email: data.company_email ?? '',
        company_address: data.company_address ?? '',
        default_tax_rate: data.default_tax_rate ?? 0,
        next_invoice_number: data.next_invoice_number ?? 1,
        brand_color: data.brand_color ?? '#2563eb',
        accent_color: data.accent_color ?? '#000000',
        logo_url: data.logo_url ?? '',
        default_notes: data.default_notes ?? ''
      }))
    }
  }


  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    const { error } = await supabase
      .from('settings')
      .update(settings)
      .eq('id', 1)
    
    if (error) {
      setMessage('Error saving settings')
    } else {
      setMessage('Changes saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Company Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your business details and branding for invoices.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {message}
        </div>
      )}

      {/* Branding Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
          <Palette className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-900">Branding</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <label className="block text-sm font-semibold text-slate-700">Company Logo</label>
             <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Upload className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-900">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </div>
             </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Brand Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={settings.brand_color}
                  onChange={(e) => setSettings({...settings, brand_color: e.target.value})}
                  className="w-12 h-12 rounded-lg border-2 border-slate-100 cursor-pointer p-0.5 overflow-hidden" 
                />
                <input 
                  type="text" 
                  value={settings.brand_color}
                  onChange={(e) => setSettings({...settings, brand_color: e.target.value})}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Accent Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={settings.accent_color}
                  onChange={(e) => setSettings({...settings, accent_color: e.target.value})}
                  className="w-12 h-12 rounded-lg border-2 border-slate-100 cursor-pointer p-0.5 overflow-hidden" 
                />
                <input 
                  type="text" 
                  value={settings.accent_color}
                  onChange={(e) => setSettings({...settings, accent_color: e.target.value})}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-900">Business Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={settings.company_name}
                onChange={(e) => setSettings({...settings, company_name: e.target.value})}
                placeholder="RemodelFlow Construction"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Business Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                value={settings.company_email}
                onChange={(e) => setSettings({...settings, company_email: e.target.value})}
                placeholder="contact@remodel.pro"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={settings.company_phone}
                onChange={(e) => setSettings({...settings, company_phone: e.target.value})}
                placeholder="+1 (555) 123-4567"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Mailing Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
              <textarea 
                rows={3}
                value={settings.company_address}
                onChange={(e) => setSettings({...settings, company_address: e.target.value})}
                placeholder="123 Builder Lane, Suite 100, San Francisco, CA 94107"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Defaults */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
          <Percent className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-900">Financial Defaults</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Default Tax Rate</label>
            <div className="relative">
              <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="number" 
                step="0.01"
                value={settings.default_tax_rate}
                onChange={(e) => setSettings({...settings, default_tax_rate: parseFloat(e.target.value)})}
                className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Next Invoice Number</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="number" 
                value={settings.next_invoice_number}
                onChange={(e) => setSettings({...settings, next_invoice_number: parseInt(e.target.value)})}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 px-1">
              <Info className="w-3 h-3 text-blue-500" />
              <p>This number will automatically increment on every new invoice.</p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Default Notes & Payment Terms</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
              <textarea 
                rows={4}
                value={settings.default_notes}
                onChange={(e) => setSettings({...settings, default_notes: e.target.value})}
                placeholder="Payment due upon receipt. Thank you for choosing RemodelFlow for your renovation needs."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
