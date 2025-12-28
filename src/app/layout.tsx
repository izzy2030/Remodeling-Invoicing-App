'use client'

import Sidebar from '@/components/layout/Sidebar'
import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50`}>
        <div className="flex">
          {!isLoginPage && <Sidebar />}
          <main className={`flex-1 ${!isLoginPage ? 'md:ml-64 p-4 md:p-8' : ''}`}>
            <div className={!isLoginPage ? "max-w-6xl mx-auto" : ""}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}

