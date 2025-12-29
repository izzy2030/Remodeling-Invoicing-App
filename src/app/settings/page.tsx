'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
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
  return (
    <Suspense fallback={<div>Loading Settings...</div>}>
      <SettingsContent />
    </Suspense>
  )
}

function SettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const onboarding = searchParams.get('onboarding') === 'true'
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
    brand_color: '#3b82f6',
    logo_url: '',
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
      setSettings({
        company_name: settingsData.company_name ?? '',
        company_phone: settingsData.company_phone ?? '',
        company_email: settingsData.company_email ?? '',
        company_address: settingsData.company_address ?? '',
        default_tax_rate: settingsData.default_tax_rate ?? 0,
        next_invoice_number: settingsData.next_invoice_number ?? 1,
        brand_color: settingsData.brand_color ?? '#3b82f6',
        logo_url: settingsData.logo_url ?? ''
      })
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
    const fileName = `logo-${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('company-assets')
      .upload(fileName, file)

    if (uploadError) {
      setMessage('Error uploading logo')
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('company-assets')
      .getPublicUrl(fileName)

    setSettings(prev => ({ ...prev, logo_url: publicUrl }))
    setLoading(false)
  }

  const ColorSwatch = ({ color }: { color: string }) => (
    <button
      onClick={() => setSettings({ ...settings, brand_color: color })}
      className={`w-12 h-12 rounded-full border-4 transition-all ${settings.brand_color.toLowerCase() === color.toLowerCase() ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-white hover:scale-105 shadow-sm'}`}
      style={{ backgroundColor: color }}
    >
      {settings.brand_color.toLowerCase() === color.toLowerCase() && <Check className="w-5 h-5 text-white mx-auto shadow-sm" />}
    </button>
  )

  const swatches = [
    '#3b82f6', // Primary Blue
    '#F04438', // Red
    '#F79009', // Orange
    '#12B76A', // Green
    '#7F56D9', // Purple
    '#EE46BC', // Pink
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <header className="bg-card border-b border-border h-16 flex items-center px-6 sticky top-0 z-30">
        <div className="max-w-xl md:max-w-4xl mx-auto w-full flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Settings</h1>
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

          {onboarding && (
            <div className="bg-primary/10 border border-primary/20 p-8 rounded-[2rem] space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <CloudLightning className="w-24 h-24 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-primary font-outfit italic tracking-tight">Let's get started!</h2>
              <p className="text-muted-foreground font-bold leading-relaxed max-w-md">
                Complete your company profile to start creating professional invoices. This information will appear on your PDFs.
              </p>
            </div>
          )}

          {/* Branding Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase tracking-widest text-[10px] ml-1">
              <CloudLightning className="w-4 h-4" />
              Branding
            </div>

            <div className="bg-card rounded-3xl border border-border shadow-premium divide-y divide-border">
              <div className="p-8 space-y-4">
                <label className="text-sm font-bold text-muted-foreground block">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={settings.company_name}
                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                    className="w-full h-14 pl-14 pr-6 bg-secondary border border-border rounded-2xl text-base font-bold text-foreground focus:bg-card focus:border-primary transition-all outline-none"
                    placeholder="Apex Remodeling"
                  />
                </div>
              </div>

              <div className="p-0 border-t border-border grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 space-y-4">
                  <label className="text-sm font-bold text-muted-foreground block">Company Email</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={settings.company_email}
                      onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                      className="w-full h-14 pl-14 pr-6 bg-secondary border border-border rounded-2xl text-base font-bold text-foreground focus:bg-card focus:border-primary transition-all outline-none"
                      placeholder="hello@apex.com"
                    />
                  </div>
                </div>
                <div className="p-8 space-y-4 md:border-l border-border">
                  <label className="text-sm font-bold text-muted-foreground block">Company Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={settings.company_phone}
                      onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                      className="w-full h-14 pl-14 pr-6 bg-secondary border border-border rounded-2xl text-base font-bold text-foreground focus:bg-card focus:border-primary transition-all outline-none"
                      placeholder="(555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-4">
                <label className="text-sm font-bold text-muted-foreground block">Company Address</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-6 w-4 h-4 text-muted-foreground" />
                  <textarea
                    value={settings.company_address}
                    onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                    className="w-full min-h-[100px] pl-14 pr-6 py-5 bg-secondary border border-border rounded-2xl text-base font-bold text-foreground focus:bg-card focus:border-primary transition-all outline-none resize-none"
                    placeholder="123 Builder St, City, State 12345"
                  />
                </div>
              </div>

              <div className="p-8 space-y-4 border-t border-border">
                <label className="text-sm font-bold text-muted-foreground block">Default Tax Rate (%)</label>
                <div className="relative">
                  <Percent className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="number"
                    step="0.01"
                    value={settings.default_tax_rate}
                    onChange={(e) => setSettings({ ...settings, default_tax_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full h-14 pl-14 pr-6 bg-secondary border border-border rounded-2xl text-base font-bold text-foreground focus:bg-card focus:border-primary transition-all outline-none"
                    placeholder="8.25"
                  />
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-muted-foreground">Brand Color</label>
                  <div className="bg-secondary px-3 py-1.5 rounded-xl border border-border flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: settings.brand_color }} />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">{settings.brand_color}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  {swatches.map(color => <ColorSwatch key={color} color={color} />)}
                  <div className="relative group">
                    <input
                      type="color"
                      value={settings.brand_color}
                      onChange={(e) => setSettings({ ...settings, brand_color: e.target.value.toUpperCase() })}
                      className="w-12 h-12 rounded-full border-4 border-card opacity-0 absolute inset-0 cursor-pointer z-10"
                    />
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-secondary group-hover:bg-card transition-colors">
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="relative group mt-2">
                  <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={settings.brand_color}
                    onChange={(e) => setSettings({ ...settings, brand_color: e.target.value })}
                    className="w-full h-14 pl-14 pr-6 bg-secondary border border-border rounded-2xl text-base font-bold text-foreground focus:bg-card focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>

              <div className="p-8 space-y-4">
                <label className="text-sm font-bold text-muted-foreground block">Company Logo</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-3xl p-10 flex flex-col items-center justify-center gap-4 bg-secondary/50 hover:bg-card hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
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
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                        <p className="text-xs font-bold text-foreground bg-card px-3 py-1.5 rounded-full shadow-sm">Change Logo</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-bold text-foreground">Tap to upload</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Account Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase tracking-widest text-[10px] ml-1">
              <User className="w-4 h-4" />
              Account
            </div>

            <div className="space-y-4">
              <div className="bg-card rounded-3xl border border-border shadow-premium p-6 flex items-center justify-between hover:bg-secondary/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center border-2 border-card shadow-sm overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">{user?.user_metadata?.full_name || 'Business Owner'}</h4>
                    <p className="text-sm font-medium text-muted-foreground tracking-tight">{user?.email}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-foreground transition-colors" />
              </div>

              <div className="bg-card rounded-3xl border border-border shadow-premium p-6 flex items-center justify-between hover:bg-secondary/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                    <Lock className="w-7 h-7 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">Change Password</h4>
                    <p className="text-sm font-medium text-muted-foreground tracking-tight">Protect your account</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-foreground transition-colors" />
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase tracking-widest text-[10px] ml-1">
              <SettingsIcon className="w-4 h-4" />
              Preferences
            </div>

            <div className="bg-card rounded-3xl border border-border shadow-premium divide-y divide-border overflow-hidden">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Email Notifications</h4>
                    <p className="text-xs font-medium text-muted-foreground tracking-tight">Invoices & Updates</p>
                  </div>
                </div>
                <div className="w-14 h-8 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-6 h-6 bg-primary-foreground rounded-full shadow-sm" />
                </div>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-foreground rounded-2xl flex items-center justify-center">
                    <Moon className="w-6 h-6 text-background" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Dark Mode</h4>
                    <p className="text-xs font-medium text-muted-foreground tracking-tight">Experimental</p>
                  </div>
                </div>
                <div className="w-14 h-8 bg-secondary rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-6 h-6 bg-card rounded-full shadow-sm shadow-black/10" />
                </div>
              </div>
            </div>
          </section>

          <button
            onClick={handleSignOut}
            className="w-full h-16 bg-destructive/10 text-destructive font-bold rounded-2xl hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
          >
            Sign Out
          </button>

          <div className="text-center pt-8 border-t border-border">
            <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">Version 1.2.0 (Build 472)</p>
          </div>
        </div>
      </main>
    </div>
  )
}
