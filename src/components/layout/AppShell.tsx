'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { Search, Filter, Calendar, Command } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    if (paths.length === 0) return ['Dashboard']
    return ['Dashboard', ...paths.map(p => p.charAt(0).toUpperCase() + p.slice(1))]
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <div className={`min-h-screen ${!isLoginPage ? 'bg-mesh' : 'bg-background'}`}>
      {!isLoginPage && <Sidebar />}
      <main className={`flex-1 ${!isLoginPage ? 'md:ml-64 p-4 md:p-8 pt-20 md:pt-4' : ''}`}>
        {!isLoginPage && (
          <div className="max-w-7xl mx-auto mb-8 hidden md:block">
            <header className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-[13px] font-medium">
                {breadcrumbs.map((crumb, i) => {
                  const paths = pathname.split('/').filter(Boolean)
                  const href = i === 0 ? '/' : `/${paths.slice(0, i).join('/')}`
                  const isLast = i === breadcrumbs.length - 1
                  
                  return (
                    <div key={crumb} className="flex items-center gap-2">
                       {isLast ? (
                        <span className="text-foreground font-bold">{crumb}</span>
                      ) : (
                        <a href={href} className="text-muted-foreground hover:text-foreground transition-colors">
                          {crumb}
                        </a>
                      )}
                      {!isLast && <span className="text-border">/</span>}
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search" 
                    className="h-10 pl-10 pr-12 bg-secondary border border-transparent focus:bg-card focus:border-border rounded-xl text-[13px] w-64 outline-none transition-all text-foreground"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-card border border-border rounded-md shadow-sm">
                    <Command className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground">K</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="h-10 px-4 bg-card border border-border rounded-xl text-[13px] font-bold text-foreground flex items-center gap-2 hover:bg-muted transition-colors">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Select Dates
                  </button>
                  <button className="h-10 px-4 bg-card border border-border rounded-xl text-[13px] font-bold text-foreground flex items-center gap-2 hover:bg-muted transition-colors">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    Filter
                  </button>
                  <ThemeToggle />
                </div>
              </div>
            </header>
          </div>
        )}
        <div className={!isLoginPage ? "max-w-7xl mx-auto" : ""}>
          {children}
        </div>
      </main>
    </div>
  )
}
