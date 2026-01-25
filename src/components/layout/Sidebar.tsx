'use client'

import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  Users,
  User,
  Menu,
  X,
  LogOut,
  Sparkles,
  Settings,
  Hammer,
  TrendingUp,
  CreditCard,
  UserCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog'

import SpotlightCard from '@/components/ui/SpotlightCard'

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
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={`
              flex items-center gap-3.5 px-4 py-3 rounded-md group relative overflow-hidden
              ${isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }
            `}
          >
            {/* Active indicator line */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground/40 rounded-r-full" />
            )}

            <item.icon className="w-[18px] h-[18px]" />
            <span className="font-semibold text-[13px] tracking-tight">{item.name}</span>


          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          Go to {item.name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="p-6 pb-8">
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-md blur-lg opacity-50" />
            <div className="relative bg-gradient-to-br from-primary to-accent p-2.5 rounded-md">
              <Hammer className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <div>
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
            const isActive = pathname === item.href || (
              item.href !== '/' &&
              pathname.startsWith(item.href) &&
              (item.href === '/invoices' ? pathname !== '/invoices/ai' : true)
            )
            return <NavItem key={item.name} item={item} isActive={isActive} index={index} />
          })}
        </nav>

        {/* Stats mini-card */}
        {/* Stats mini-card */}
        <SpotlightCard className="mt-8 mx-1 p-4 bg-gradient-to-br from-secondary/50 to-secondary/30 border-border/50">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <TrendingUp className="w-20 h-20" />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">This Month</p>
          <p className="text-2xl font-bold text-foreground font-syne tracking-tight">$12,450</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">+18% growth</p>
          </div>
        </SpotlightCard>
      </div>

      {/* User profile with Radix Dropdown */}
      <div className="mt-auto p-4 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer group">
              <Avatar className="h-10 w-10 border-2 border-transparent">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || <User className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {user?.user_metadata?.full_name || 'Business Owner'}
                </p>
                <p className="text-[10px] font-medium text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-64">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <UserCircle className="w-4 h-4 mr-2 text-muted-foreground" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings?tab=billing')}>
              <CreditCard className="w-4 h-4 mr-2 text-muted-foreground" />
              Billing & Plan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Header with Radix Dialog */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-b border-border md:hidden z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-md">
              <Hammer className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-syne font-extrabold text-foreground text-lg">Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DialogTrigger asChild>
                <button
                  className="w-10 h-10 flex items-center justify-center text-muted-foreground rounded-md hover:bg-secondary"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="fixed inset-y-0 right-0 left-auto translate-x-0 translate-y-0 w-80 h-full rounded-none border-l animate-in slide-in-from-right duration-300 p-0">
                <div className="p-4 absolute top-0 right-0 z-50">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-secondary rounded-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <SidebarContent />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-card/50 backdrop-blur-md border-r border-border hidden md:flex flex-col z-40">
        <SidebarContent />
      </aside>
    </>
  )
}
