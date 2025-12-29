'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  return (
    <div className="flex">
      {!isLoginPage && <Sidebar />}
      <main className={`flex-1 ${!isLoginPage ? 'md:ml-64 p-4 md:p-8 pt-20 md:pt-8' : ''}`}>
        <div className={!isLoginPage ? "max-w-7xl mx-auto" : ""}>
          {children}
        </div>
      </main>
    </div>
  )
}
