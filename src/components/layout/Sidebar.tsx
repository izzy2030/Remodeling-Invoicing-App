'use client'

import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  Users,
  Zap,
  User,
  Menu,
  X,
  LogOut,
  Sparkles,
  Settings
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const mainNav = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'AI Invoice', href: '/invoices/ai', icon: Sparkles },
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
    setMobileMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const NavItem = ({ item, isActive }: { item: any, isActive: boolean }) => (
    <Link
      href={item.href}
      className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group ${isActive
        ? 'bg-slate-100 text-slate-900 border border-slate-200'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
      <div className="flex items-center gap-3">
        <item.icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} />
        <span className="font-medium text-[13px] tracking-tight">{item.name}</span>
      </div>
    </Link>
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 p-2 rounded-xl shadow-sm border-2 border-slate-900">
            <Zap className="w-5 h-5 text-slate-900 fill-slate-900" />
          </div>
          <div className="md:hidden lg:block">
            <h1 className="font-black text-slate-900 leading-none tracking-tight font-outfit uppercase">Flow</h1>
          </div>
        </div>
      </div>

      <div className="px-3 space-y-8">
        <div>
          <div className="space-y-1">
            {mainNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return <NavItem key={item.name} item={item} isActive={isActive} />
            })}
          </div>
        </div>
      </div>

      <div className="mt-auto p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-white shadow-sm overflow-hidden">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-full h-full p-2 text-slate-400 outline-none" />
            )}
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[11px] font-bold text-slate-900 truncate tracking-tight">
              {user?.user_metadata?.full_name || 'Business'}
            </p>
          </div>
          <button onClick={handleSignOut} className="text-slate-400 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/70 backdrop-blur-md border-b border-slate-100 md:hidden z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="bg-yellow-400 p-1.5 rounded-lg border-2 border-slate-900 shadow-sm">
            <Zap className="w-4 h-4 text-slate-900 fill-slate-900" />
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-slate-600 rounded-xl"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Slide-in Menu */}
      <aside className={`fixed inset-y-0 right-0 w-72 bg-white border-l border-slate-100 md:hidden z-50 transform transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-slate-400"
        >
          <X className="w-6 h-6" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#fdfdfe] border-r border-slate-100 hidden md:flex flex-col z-40">
        <SidebarContent />
      </aside>
    </>
  )
}
