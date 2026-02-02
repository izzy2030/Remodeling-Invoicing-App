import { Poppins, Open_Sans } from 'next/font/google'
import AppShell from '@/components/layout/AppShell'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata = {
  title: 'Flow | Professional Invoicing for Remodelers',
  description: 'The modern invoicing platform designed for remodeling professionals. Create stunning invoices, manage clients, and grow your business.',
  keywords: 'invoicing, remodeling, contractor, construction, billing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${openSans.variable}`} suppressHydrationWarning>
      <body className="font-open-sans min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AppShell>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
