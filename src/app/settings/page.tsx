'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
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
  Palette,
  ChevronLeft,
  ChevronRight,
  User,
  Lock,
  Bell,
  Moon,
  LogOut,
  CloudLightning,
  Plus,
  Settings as SettingsIcon
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState({
    company_name: '',
    company_phone: '',
    company_email: '',
    company_address: '',
    default_tax_rate: 0,
    next_invoice_number: 1,
    brand_color: '#135BEC',
    accent_color: '#F2F4F7',
    logo_url: '',
    default_notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [{ data: userData }, { data: settingsData }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('settings').select('*').eq('id', 1).single()
    ])
    
    setUser(userData.user)
    if (settingsData) {
      setSettings(prev => ({
        ...prev,
        ...settingsData,
        company_name: settingsData.company_name ?? '',
        brand_color: settingsData.brand_color ?? '#135BEC'
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `company-logo-${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file)

    if (uploadError) {
      setMessage('Error uploading logo')
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName)

    setSettings(prev => ({ ...prev, logo_url: publicUrl }))
    setLoading(false)
  }

  const ColorSwatch = ({ color }: { color: string }) => (
    <button 
      onClick={() => setSettings({...settings, brand_color: color})}
      className={`w-12 h-12 rounded-full border-4 transition-all ${settings.brand_color.toLowerCase() === color.toLowerCase() ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-white hover:scale-105 shadow-sm'}`}
      style={{ backgroundColor: color }}
    >
      {settings.brand_color.toLowerCase() === color.toLowerCase() && <Check className="w-5 h-5 text-white mx-auto shadow-sm" />}
    </button>
  )

  const swatches = [
    '#135BEC', // Primary Blue
    '#F04438', // Red
    '#F79009', // Orange
    '#12B76A', // Green
    '#7F56D9', // Purple
    '#EE46BC', // Pink
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
       {/* Top Navigation */}
       <header className="bg-white border-b border-slate-100 h-16 flex items-center px-6 sticky top-0 z-30">
        <div className="max-w-xl md:max-w-4xl mx-auto w-full flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-900" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Settings</h1>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="text-primary hover:text-primary/80 font-bold transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      <main className="flex-1 pb-32">
        <div className="max-w-xl md:max-w-4xl mx-auto px-6 py-10 space-y-12">
          
          {/* Branding Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px] ml-1">
              <CloudLightning className="w-4 h-4" />
              Branding
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-100 shadow-premium divide-y divide-slate-50">
              <div className="p-8 space-y-4">
                <label className="text-sm font-bold text-slate-600 block">Company Name</label>
                <input 
                  type="text" 
                  value={settings.company_name}
                  onChange={(e) => setSettings({...settings, company_name: e.target.value})}
                  className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-base font-bold text-slate-900 focus:bg-white focus:border-primary transition-all outline-none"
                  placeholder="Apex Remodeling"
                />
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-600">Brand Color</label>
                  <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: settings.brand_color }} />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{settings.brand_color}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {swatches.map(color => <ColorSwatch key={color} color={color} />)}
                  <div className="relative group">
                    <input 
                      type="color" 
                      value={settings.brand_color}
                      onChange={(e) => setSettings({...settings, brand_color: e.target.value.toUpperCase()})}
                      className="w-12 h-12 rounded-full border-4 border-white opacity-0 absolute inset-0 cursor-pointer z-10"
                    />
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 group-hover:bg-white transition-colors">
                      <Plus className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="relative group mt-2">
                  <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    value={settings.brand_color}
                    onChange={(e) => setSettings({...settings, brand_color: e.target.value})}
                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-base font-bold text-slate-900 focus:bg-white focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>

              <div className="p-8 space-y-4">
                <label className="text-sm font-bold text-slate-600 block">Company Logo</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-100 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  {settings.logo_url ? (
                    <>
                      <img src={settings.logo_url} alt="Company Logo" className="h-32 object-contain relative z-10" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                         <p className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full shadow-sm">Change Logo</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-blue-100/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-bold text-slate-900">Tap to upload</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Account Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px] ml-1">
              <User className="w-4 h-4" />
              Account
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-premium p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                       <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{user?.user_metadata?.full_name || 'Business Owner'}</h4>
                    <p className="text-sm font-medium text-slate-500 tracking-tight">{user?.email}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-premium p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Lock className="w-7 h-7 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Change Password</h4>
                    <p className="text-sm font-medium text-slate-500 tracking-tight">Protect your account</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px] ml-1">
              <SettingsIcon className="w-4 h-4" />
              Preferences
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-100 shadow-premium divide-y divide-slate-50 overflow-hidden">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Email Notifications</h4>
                    <p className="text-xs font-medium text-slate-400 tracking-tight">Invoices & Updates</p>
                  </div>
                </div>
                <div className="w-14 h-8 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm" />
                </div>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                    <Moon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Dark Mode</h4>
                    <p className="text-xs font-medium text-slate-400 tracking-tight">Experimental</p>
                  </div>
                </div>
                <div className="w-14 h-8 bg-slate-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm shadow-slate-400/20" />
                </div>
              </div>
            </div>
          </section>

          <button 
            onClick={handleSignOut}
            className="w-full h-16 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            Sign Out
          </button>

          <div className="text-center pt-8">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Version 1.2.0 (Build 472)</p>
          </div>
        </div>
      </main>
    </div>
  )
}
