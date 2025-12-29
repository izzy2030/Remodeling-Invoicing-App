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
  Settings,
  Hammer,
  TrendingUp
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'

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

  const NavItem = ({ item, isActive, index }: { item: any, isActive: boolean, index: number }) => (
    <Link
      href={item.href}
      className={`
        flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
        ${isActive
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }
      `}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Active indicator line */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground/40 rounded-r-full" />
      )}

      <item.icon className={`w-[18px] h-[18px] transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
      <span className="font-semibold text-[13px] tracking-tight">{item.name}</span>

      {/* Shimmer effect on hover */}
      {!isActive && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      )}
    </Link>
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="p-6 pb-8">
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <Hammer className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <div className="md:hidden lg:block">
            <h1 className="font-syne font-extrabold text-foreground tracking-tight text-xl">Flow</h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] -mt-0.5">Invoicing</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-3 flex-1">
        <div className="mb-3 px-4">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Menu</p>
        </div>
        <nav className="space-y-1">
          {mainNav.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return <NavItem key={item.name} item={item} isActive={isActive} index={index} />
          })}
        </nav>

        {/* Stats mini-card */}
        <div className="mt-8 mx-1 p-4 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 border border-border relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-20 h-20" />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">This Month</p>
          <p className="text-2xl font-bold text-foreground font-syne tracking-tight">$12,450</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">+18% growth</p>
          </div>
        </div>
      </div>

      {/* User profile */}
      <div className="mt-auto p-4 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border shadow-sm overflow-hidden flex items-center justify-center">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">
              {user?.user_metadata?.full_name || 'Business Owner'}
            </p>
            <p className="text-[10px] font-medium text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-b border-border md:hidden z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl shadow-sm">
              <Hammer className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-syne font-extrabold text-foreground text-lg">Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-muted-foreground rounded-xl hover:bg-secondary transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-in Menu */}
      <aside className={`
        fixed inset-y-0 right-0 w-72 bg-card border-l border-border md:hidden z-50 
        transform transition-transform duration-300 ease-out
        ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-secondary rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-card/50 backdrop-blur-md border-r border-border hidden md:flex flex-col z-40">
        <SidebarContent />
      </aside>
    </>
  )
}
