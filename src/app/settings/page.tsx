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
  Check,
  Palette,
  ChevronLeft,
  ChevronRight,
  User,
  Lock,
  Bell,
  Moon,
  LogOut,
  Plus,
  Settings as SettingsIcon,
  Sparkles,
  Shield,
  CreditCard,
  Upload,
  UserCircle,
  Eye,
  Trash
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/Dialog'

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
    brand_color: '#c5613b',
    logo_url: '',
  })
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'general')

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
        brand_color: settingsData.brand_color ?? '#c5613b',
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
    '#c5613b', // Primary Copper
    '#3b82f6', // Blue
    '#10b981', // Green
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#6366f1', // Indigo
  ]

  const ColorSwatch = ({ color }: { color: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setSettings({ ...settings, brand_color: color })}
            className={`w-10 h-10 rounded-full transition-all duration-300 relative flex items-center justify-center ${settings.brand_color.toLowerCase() === color.toLowerCase()
                ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110 shadow-lg shadow-black/10'
                : 'hover:scale-110 shadow-sm opacity-80 hover:opacity-100'
              }`}
            style={{ backgroundColor: color }}
          >
            {settings.brand_color.toLowerCase() === color.toLowerCase() && (
              <Check className="w-4 h-4 text-white drop-shadow-sm" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>{color.toUpperCase()}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border h-20 flex items-center px-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button variant="secondary" size="icon" onClick={() => router.back()} className="rounded-xl h-11 w-11 shadow-sm">
                <ChevronLeft className="w-5 h-5" />
             </Button>
             <div>
                <h1 className="text-2xl font-bold text-foreground font-syne tracking-tight">Settings</h1>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Preferences & Account</p>
             </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="h-11 px-8 rounded-xl copper-glow"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </header>

      {/* Success/Error message */}
      <div className="max-w-4xl mx-auto px-6 h-12 flex items-center">
        {message && (
          <div className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2 border ${message.includes('Error')
              ? 'bg-destructive/10 text-destructive border-destructive/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            }`}>
            {message}
          </div>
        )}
      </div>

      <main className="max-w-4xl mx-auto px-6 py-4 space-y-12">
        {/* Onboarding Banner */}
        {onboarding && (
          <div className="relative rounded-[2rem] overflow-hidden animate-fade-up shadow-xl shadow-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} />
            <div className="relative p-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 bg-white/15 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-white font-syne tracking-tight">Welcome to Flow!</h2>
                <p className="text-white/80 font-medium mt-2 max-w-lg">
                  Complete your company profile to start creating professional invoices. This information will appear on your PDFs.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Navigation */}
          <aside className="lg:col-span-4 space-y-4">
             <nav className="space-y-1">
                {[
                  { id: 'general', name: 'General', icon: Building2 },
                  { id: 'billing', name: 'Billing', icon: CreditCard },
                  { id: 'account', name: 'Account', icon: UserCircle },
                  { id: 'appearance', name: 'Appearance', icon: Palette },
                  { id: 'security', name: 'Security', icon: Shield },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
                      ${activeTab === tab.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }
                    `}
                  >
                    <tab.icon className="w-4.5 h-4.5" />
                    {tab.name}
                  </button>
                ))}
             </nav>

             <div className="pt-6">
                <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive h-12 rounded-xl font-bold" onClick={handleSignOut}>
                   <LogOut className="w-4.5 h-4.5 mr-3" />
                   Sign Out
                </Button>
             </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-8 space-y-10">
            {activeTab === 'general' && (
              <section className="space-y-6 animate-fade-up">
                <div className="space-y-1">
                   <h3 className="text-xl font-bold text-foreground font-syne">Business Details</h3>
                   <p className="text-sm text-muted-foreground">This info appears on your professional invoices.</p>
                </div>

                <div className="card-premium p-6 space-y-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={settings.company_name}
                        onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                        className="input-field !pl-11 h-12"
                        placeholder="Apex Remodeling LLC"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          value={settings.company_email}
                          onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                          className="input-field !pl-11 h-12"
                          placeholder="hello@apex.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={settings.company_phone}
                          onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                          className="input-field !pl-11 h-12"
                          placeholder="(555) 000-0000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Address</label>
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
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Default Tax Rate (%)</label>
                    <div className="relative">
                      <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="number"
                        step="0.01"
                        value={settings.default_tax_rate}
                        onChange={(e) => setSettings({ ...settings, default_tax_rate: parseFloat(e.target.value) || 0 })}
                        className="input-field !pl-11 h-12"
                        placeholder="8.25"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'appearance' && (
              <section className="space-y-8 animate-fade-up">
                <div className="space-y-1">
                   <h3 className="text-xl font-bold text-foreground font-syne">Appearance</h3>
                   <p className="text-sm text-muted-foreground">Customize how your brand looks across the platform.</p>
                </div>

                <div className="card-premium p-8 space-y-10">
                   {/* Brand Color */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h4 className="font-bold text-foreground">Brand Color</h4>
                         <div className="bg-secondary px-3 py-1.5 rounded-xl border border-border flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: settings.brand_color }} />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{settings.brand_color}</span>
                         </div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                         {swatches.map(color => <ColorSwatch key={color} color={color} />)}
                         <div className="relative group">
                            <input
                              type="color"
                              value={settings.brand_color}
                              onChange={(e) => setSettings({ ...settings, brand_color: e.target.value.toUpperCase() })}
                              className="w-10 h-10 rounded-full opacity-0 absolute inset-0 cursor-pointer z-10"
                            />
                            <div className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-secondary transition-all group-hover:bg-card">
                               <Plus className="w-4 h-4 text-muted-foreground" />
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Logo Upload */}
                   <div className="space-y-4">
                      <h4 className="font-bold text-foreground">Company Logo</h4>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-3xl p-10 flex flex-col items-center justify-center gap-4 bg-secondary/20 hover:bg-card hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
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
                            <img src={settings.logo_url} alt="Company Logo" className="h-28 object-contain relative z-10" />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 backdrop-blur-[2px]">
                               <div className="bg-white/90 px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2">
                                  <Upload className="w-4 h-4 text-primary" />
                                  <span className="text-xs font-bold text-foreground">Change Logo</span>
                               </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                              <Upload className="w-8 h-8 text-primary" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-foreground">Click to upload company logo</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">PNG, JPG or SVG up to 5MB</p>
                            </div>
                          </>
                        )}
                      </div>
                   </div>
                </div>
              </section>
            )}

            {activeTab === 'account' && (
              <section className="space-y-8 animate-fade-up">
                <div className="space-y-1">
                   <h3 className="text-xl font-bold text-foreground font-syne">Account Profile</h3>
                   <p className="text-sm text-muted-foreground">Manage your personal information.</p>
                </div>

                <div className="card-premium overflow-hidden divide-y divide-border">
                   <div className="p-8 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <Avatar className="h-20 w-20 rounded-3xl border-2 border-secondary shadow-lg">
                            <AvatarImage src={user?.user_metadata?.avatar_url} />
                            <AvatarFallback className="text-2xl bg-gradient-to-br from-secondary to-muted">
                               <User className="w-8 h-8" />
                            </AvatarFallback>
                         </Avatar>
                         <div>
                            <h4 className="text-xl font-bold text-foreground">{user?.user_metadata?.full_name || 'Business Owner'}</h4>
                            <p className="text-sm font-medium text-muted-foreground mt-0.5">{user?.email}</p>
                            <div className="mt-2.5 flex gap-2">
                               <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md border border-emerald-500/20 uppercase tracking-widest">Active</span>
                               <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-md border border-primary/20 uppercase tracking-widest">Pro Plan</span>
                            </div>
                         </div>
                      </div>
                      <Button variant="secondary" size="sm" className="rounded-xl font-bold">Edit Profile</Button>
                   </div>

                   <div className="p-8 flex items-center justify-between hover:bg-secondary/20 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center">
                            <Bell className="w-5 h-5 text-amber-500" />
                         </div>
                         <div>
                            <h4 className="font-bold text-foreground">Notifications</h4>
                            <p className="text-xs text-muted-foreground">Manage your update preferences</p>
                         </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-foreground transition-all" />
                   </div>
                </div>
              </section>
            )}

             {activeTab === 'security' && (
              <section className="space-y-8 animate-fade-up">
                <div className="space-y-1">
                   <h3 className="text-xl font-bold text-foreground font-syne">Security</h3>
                   <p className="text-sm text-muted-foreground">Keep your account safe and secure.</p>
                </div>

                <div className="space-y-4">
                   <div className="card-premium p-6 flex items-center justify-between hover:bg-secondary/20 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-11 h-11 bg-violet-500/10 rounded-xl flex items-center justify-center">
                            <Lock className="w-5 h-5 text-violet-500" />
                         </div>
                         <div>
                            <h4 className="font-bold text-foreground">Password Management</h4>
                            <p className="text-xs text-muted-foreground">Last updated 3 months ago</p>
                         </div>
                      </div>
                      <Button variant="ghost" className="font-bold text-primary">Reset</Button>
                   </div>

                   <div className="card-premium p-6 flex items-center justify-between hover:bg-secondary/20 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-11 h-11 bg-foreground rounded-xl flex items-center justify-center">
                            <Moon className="w-5 h-5 text-background" />
                         </div>
                         <div>
                            <h4 className="font-bold text-foreground">Login Activity</h4>
                            <p className="text-xs text-muted-foreground">Check your active sessions</p>
                         </div>
                      </div>
                      <Button variant="secondary" size="sm">View</Button>
                   </div>
                </div>
              </section>
            )}

            {activeTab === 'billing' && (
               <section className="space-y-8 animate-fade-up">
                <div className="space-y-1">
                   <h3 className="text-xl font-bold text-foreground font-syne">Billing & Subscription</h3>
                   <p className="text-sm text-muted-foreground">Manage your plan and invoices.</p>
                </div>

                <div className="card-premium p-8 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8">
                      <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-bold text-xs border border-primary/20">Active Plan</div>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-1">
                         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Plan</p>
                         <h4 className="text-3xl font-bold text-foreground font-syne">Flow Pro</h4>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2">
                             <Check className="w-4 h-4 text-emerald-500" />
                             <span className="text-sm font-medium">Unlimited Invoices</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <Check className="w-4 h-4 text-emerald-500" />
                             <span className="text-sm font-medium">AI Assistant Access</span>
                         </div>
                      </div>
                      <div className="pt-4 flex gap-3">
                         <Button variant="outline" className="h-11 px-8 font-bold">Manage Billing</Button>
                         <Button variant="ghost" className="h-11 px-8 font-bold text-muted-foreground">Change Plan</Button>
                      </div>
                   </div>
                </div>
               </section>
            )}
          </div>
        </div>

        {/* Footer Version */}
        <div className="pt-12 border-t border-border/60 text-center animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em]">Flow v2.0.1 • Crafted for Craftspeople</p>
        </div>
      </main>
    </div>
  )
}
