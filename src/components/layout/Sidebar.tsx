'use client'

import Link from 'next/link'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Wrench,
  ChevronRight,
  User,
  Menu,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  useEffect(() => {
    // Close mobile menu on route change
    setMobileMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 md:hidden z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 leading-none tracking-tight font-outfit text-sm">RemodelFlow</h1>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Pro Manager</p>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-in Menu */}
      <aside className={`fixed inset-y-0 right-0 w-80 bg-white border-l border-slate-100 md:hidden flex flex-col z-50 transform transition-transform duration-300 ease-out ${
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 leading-none tracking-tight font-outfit">RemodelFlow</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Pro Manager</p>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="font-bold text-sm tracking-tight">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <div className="bg-slate-50/50 rounded-3xl p-4 border border-slate-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden shrink-0">
                {user?.user_metadata?.avatar_url ? (
                   <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate tracking-tight">
                  {user?.user_metadata?.full_name || 'Business Owner'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{user?.email || 'owner@remodel.pro'}</p>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar (unchanged) */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 hidden md:flex flex-col z-40">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 leading-none tracking-tight font-outfit">RemodelFlow</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Pro Manager</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="font-bold text-sm tracking-tight">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <div className="bg-slate-50/50 rounded-3xl p-4 border border-slate-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden shrink-0">
                {user?.user_metadata?.avatar_url ? (
                   <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate tracking-tight">
                  {user?.user_metadata?.full_name || 'Business Owner'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{user?.email || 'owner@remodel.pro'}</p>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

