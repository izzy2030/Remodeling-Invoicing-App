'use client'

import Link from 'next/link'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Wrench
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 leading-none">RemodelFlow</h1>
          <p className="text-xs text-slate-500 mt-1">Invoice Manager</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors group"
          >
            <item.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
            {user?.user_metadata?.avatar_url ? (
               <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Users className="w-5 h-5 text-slate-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.user_metadata?.full_name || 'Owner'}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email || 'owner@remodel.pro'}</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors mt-2"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </aside>
  )
}

