'use client'

import Sidebar from '@/components/layout/Sidebar'
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google'
import { usePathname } from 'next/navigation'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  return (
    <html lang="en" className={`${jakarta.variable} ${outfit.variable}`}>
      <body className="font-jakarta min-h-screen bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary">
        <div className="flex">
          {!isLoginPage && <Sidebar />}
          <main className={`flex-1 ${!isLoginPage ? 'md:ml-64 p-4 md:p-8' : ''}`}>
            <div className={!isLoginPage ? "max-w-5xl mx-auto" : ""}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}

