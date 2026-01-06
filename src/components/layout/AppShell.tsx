'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { Search, Filter, Calendar, Command, Bell } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'
  const isNewInvoicePage = pathname === '/invoices/new'

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
        {!isLoginPage && !isNewInvoicePage && (
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
                    className="h-10 pl-10 pr-14 bg-card border border-border focus:bg-card focus:border-primary rounded-md text-sm w-56 outline-none text-foreground font-medium placeholder:text-muted-foreground"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-1 bg-secondary border border-border rounded-md">
                    <Command className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground">K</span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="hidden xl:inline">Select Dates</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-syne font-bold">Select Date Range</h4>
                        <p className="text-xs text-muted-foreground">This feature will allow you to filter dashboard data by specific dates.</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="secondary" size="sm" className="h-9">Today</Button>
                          <Button variant="secondary" size="sm" className="h-9">This Week</Button>
                          <Button variant="secondary" size="sm" className="h-9">This Month</Button>
                          <Button variant="secondary" size="sm" className="h-9">All Time</Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="h-10 w-10 bg-card border border-border rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground relative group">
                        <Bell className="w-4 h-4" />
                        <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-card" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80 p-0 overflow-hidden">
                      <div className="p-4 border-b border-border bg-secondary/30">
                        <h4 className="font-bold text-sm">Notifications</h4>
                      </div>
                      <div className="p-4 py-8 text-center space-y-2">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
                          <Bell className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                        <p className="text-sm font-bold">All caught up!</p>
                        <p className="text-xs text-muted-foreground">No new notifications at this time.</p>
                      </div>
                    </PopoverContent>
                  </Popover>

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
