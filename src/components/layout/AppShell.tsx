'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { Search, Filter, Calendar, Command, Bell } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    if (paths.length === 0) return ['Dashboard']
    return ['Dashboard', ...paths.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '))]
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <div className={`min-h-screen ${!isLoginPage ? 'bg-mesh' : 'bg-background'}`}>
      {!isLoginPage && <Sidebar />}
      <main className={`flex-1 ${!isLoginPage ? 'md:ml-64 p-4 md:p-8 pt-20 md:pt-4' : ''}`}>
        {!isLoginPage && (
          <div className="max-w-7xl mx-auto mb-8 hidden md:block animate-fade-up">
            <header className="flex items-center justify-between mb-8">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, i) => {
                  const paths = pathname.split('/').filter(Boolean)
                  const href = i === 0 ? '/' : `/${paths.slice(0, i).join('/')}`
                  const isLast = i === breadcrumbs.length - 1

                  return (
                    <div key={crumb} className="flex items-center gap-2">
                      {isLast ? (
                        <span className="text-foreground font-bold">{crumb}</span>
                      ) : (
                        <Link
                          href={href}
                          className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                          {crumb}
                        </Link>
                      )}
                      {!isLast && <span className="text-border font-medium">/</span>}
                    </div>
                  )
                })}
              </nav>

              {/* Right side controls */}
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="h-10 pl-10 pr-14 bg-card border border-border focus:bg-card focus:border-primary rounded-xl text-sm w-56 outline-none transition-all text-foreground font-medium placeholder:text-muted-foreground"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-1 bg-secondary border border-border rounded-md">
                    <Command className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground">K</span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2">
                  <button className="h-10 px-4 bg-card border border-border rounded-xl text-sm font-semibold text-foreground flex items-center gap-2 hover:bg-secondary transition-colors">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="hidden xl:inline">Select Dates</span>
                  </button>

                  <button className="h-10 w-10 bg-card border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors relative">
                    <Bell className="w-4 h-4" />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
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
