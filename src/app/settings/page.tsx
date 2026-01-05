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
  Upload,
  Check,
  Palette,
  ChevronLeft,
  ChevronRight,
  User,
  Lock,
  Bell,
  Moon,
  LogOut,
  Hammer,
  Plus,
  Settings as SettingsIcon,
  Sparkles,
  Shield,
  CreditCard
} from 'lucide-react'

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl mx-auto flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-primary-foreground animate-spin" />
          </div>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Loading Settings...</p>
        </div>
      </div>
    }>
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
    brand_color: '#c45d35',
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
        brand_color: settingsData.brand_color ?? '#c45d35',
        logo_url: settingsData.logo_url ?? ''
      })
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    if (!user) {
      setMessage('Error: No user found')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('settings')
      .upsert({
        ...settings,
        id: 1,
        user_id: user.id
      })

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

  const swatches = [
    '#c45d35', // Copper (default)
    '#3b82f6', // Blue
    '#10b981', // Green
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#ec4899', // Pink
  ]

  const ColorSwatch = ({ color }: { color: string }) => (
    <button
      onClick={() => setSettings({ ...settings, brand_color: color })}
      className={`w-10 h-10 rounded-full transition-all duration-300 ${settings.brand_color.toLowerCase() === color.toLowerCase()
          ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110'
          : 'hover:scale-105 shadow-sm'
        }`}
      style={{ backgroundColor: color }}
    >
      {settings.brand_color.toLowerCase() === color.toLowerCase() && (
        <Check className="w-4 h-4 text-white mx-auto drop-shadow-sm" />
      )}
    </button>
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border h-16 flex items-center px-6 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground font-syne">Settings</h1>
          <button
            onClick={handleSave}
            disabled={loading}
            className="text-primary hover:text-primary/80 font-bold transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {/* Success message */}
      {message && (
        <div className="max-w-3xl mx-auto px-6 pt-4">
          <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('Error')
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}>
            {message}
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-10">
        {/* Onboarding Banner */}
        {onboarding && (
          <div className="relative rounded-2xl overflow-hidden animate-fade-up grain">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent" />
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} />
            <div className="relative p-8 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white font-syne">Welcome to Flow!</h2>
              <p className="text-white/80 font-medium max-w-lg">
                Complete your company profile to start creating professional invoices. This information will appear on your PDFs.
              </p>
            </div>
          </div>
        )}

        {/* Company Branding Section */}
        <section className="space-y-5 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Company Branding</span>
          </div>

          <div className="card-premium divide-y divide-border">
            {/* Company Name */}
            <div className="p-6 space-y-3">
              <label className="text-sm font-bold text-muted-foreground">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  className="input-field !pl-11"
                  placeholder="Apex Remodeling LLC"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 space-y-3">
                <label className="text-sm font-bold text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={settings.company_email}
                    onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                    className="input-field !pl-11"
                    placeholder="hello@apex.com"
                  />
                </div>
              </div>
              <div className="p-6 space-y-3 md:border-l border-border">
                <label className="text-sm font-bold text-muted-foreground">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={settings.company_phone}
                    onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                    className="input-field !pl-11"
                    placeholder="(555) 000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="p-6 space-y-3">
              <label className="text-sm font-bold text-muted-foreground">Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                <textarea
                  value={settings.company_address}
                  onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                  className="input-field !pl-11 py-3 min-h-[100px] resize-none"
                  placeholder="123 Builder St, Suite 100&#10;City, State 12345"
                />
              </div>
            </div>

            {/* Tax Rate */}
            <div className="p-6 space-y-3">
              <label className="text-sm font-bold text-muted-foreground">Default Tax Rate (%)</label>
              <div className="relative">
                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  step="0.01"
                  value={settings.default_tax_rate}
                  onChange={(e) => setSettings({ ...settings, default_tax_rate: parseFloat(e.target.value) || 0 })}
                  className="input-field !pl-11"
                  placeholder="8.25"
                />
              </div>
            </div>

            {/* Brand Color */}
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-muted-foreground">Brand Color</label>
                <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-lg border border-border">
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: settings.brand_color }} />
                  <span className="text-xs font-bold text-muted-foreground uppercase">{settings.brand_color}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {swatches.map(color => <ColorSwatch key={color} color={color} />)}
                <div className="relative group">
                  <input
                    type="color"
                    value={settings.brand_color}
                    onChange={(e) => setSettings({ ...settings, brand_color: e.target.value.toUpperCase() })}
                    className="w-10 h-10 rounded-full opacity-0 absolute inset-0 cursor-pointer z-10"
                  />
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-secondary group-hover:bg-card group-hover:border-primary/30 transition-all">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="p-6 space-y-3">
              <label className="text-sm font-bold text-muted-foreground">Company Logo</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-secondary/30 hover:bg-card hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
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
                    <img src={settings.logo_url} alt="Company Logo" className="h-24 object-contain relative z-10" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                      <p className="text-xs font-bold text-foreground bg-card px-4 py-2 rounded-lg shadow-sm">Change Logo</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">Click to upload</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section className="space-y-5 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Account</span>
          </div>

          <div className="space-y-3">
            <div className="card-premium p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl overflow-hidden flex items-center justify-center border border-border">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{user?.user_metadata?.full_name || 'Business Owner'}</h4>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-foreground transition-colors" />
            </div>

            <div className="card-premium p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-violet-500" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Change Password</h4>
                  <p className="text-sm text-muted-foreground">Protect your account</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-foreground transition-colors" />
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="space-y-5 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <SettingsIcon className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Preferences</span>
          </div>

          <div className="card-premium divide-y divide-border">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Invoices & updates</p>
                </div>
              </div>
              <div className="w-12 h-7 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-5 h-5 bg-primary-foreground rounded-full shadow-sm" />
              </div>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center">
                  <Moon className="w-6 h-6 text-background" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Dark Mode</h4>
                  <p className="text-sm text-muted-foreground">Use theme toggle</p>
                </div>
              </div>
              <div className="w-12 h-7 bg-secondary rounded-full relative cursor-pointer border border-border">
                <div className="absolute left-1 top-1 w-5 h-5 bg-card rounded-full shadow-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full h-14 bg-destructive/10 text-destructive font-bold rounded-xl hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2 animate-fade-up"
          style={{ animationDelay: '0.4s' }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        {/* Version */}
        <div className="text-center pt-4 border-t border-border animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Flow v2.0.0 • Copper Edition</p>
        </div>
      </main>
    </div>
  )
}
