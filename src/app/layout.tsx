import { Plus_Jakarta_Sans, Outfit } from 'next/font/google'
import AppShell from '@/components/layout/AppShell'
import { ThemeProvider } from '@/components/ThemeProvider'
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

export const metadata = {
  title: 'Remodeling Invoicing',
  description: 'Professional invoicing for remodelers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="font-jakarta min-h-screen bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary">
        <ThemeProvider>
          <AppShell>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}

