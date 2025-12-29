'use client'

import { supabase } from '@/lib/supabase'
import { Hammer, ArrowRight, Github, Sparkles, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/')
      }
    })
  }, [router])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-primary/10 via-accent/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-accent/10 via-primary/5 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

      {/* Grain texture */}
      <div className="fixed inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Grid pattern */}
      <div className="fixed inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Main Container */}
      <div className="relative max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-card rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden border border-border animate-scale-in">

        {/* Left Side: Login Form */}
        <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-16 relative">
          <div className="max-w-sm w-full mx-auto space-y-10">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="relative bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
                  <Hammer className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground font-syne tracking-tight">Flow</h1>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] -mt-0.5">Invoicing</p>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-foreground font-syne tracking-tight leading-[1.15]">
                Build better.
                <span className="block text-gradient">Bill smarter.</span>
              </h2>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Professional invoicing crafted for modern remodeling contractors.
              </p>
            </div>

            {/* Login Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-14 flex items-center justify-between px-6 bg-card border border-border text-foreground font-semibold rounded-xl hover:border-primary hover:bg-secondary transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm">Continue with Google</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </button>

              <button className="w-full h-14 flex items-center justify-between px-6 bg-foreground text-background font-semibold rounded-xl hover:opacity-90 transition-all group shadow-lg shadow-foreground/10">
                <div className="flex items-center gap-3">
                  <Github className="w-5 h-5" />
                  <span className="text-sm">Continue with GitHub</span>
                </div>
                <ArrowRight className="w-4 h-4 text-background/50 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground/50">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secured by Supabase Auth</span>
            </div>
          </div>
        </div>

        {/* Right Side: Showcase */}
        <div className="hidden lg:block relative bg-gradient-to-br from-secondary/50 to-secondary/30 p-6">
          <div className="h-full w-full bg-gradient-to-br from-primary via-primary to-accent rounded-[2rem] overflow-hidden flex flex-col justify-end p-12 relative grain">

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[300px] h-[300px] bg-black/10 rounded-full blur-[80px]" />

            {/* Dot pattern */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
              backgroundSize: '28px 28px'
            }} />

            {/* Floating decorative cards */}
            <div className="absolute top-12 right-12 animate-float" style={{ animationDelay: '0s' }}>
              <div className="w-48 h-32 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/80 text-xs font-bold">AI Invoice</span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 bg-white/20 rounded-full w-full" />
                  <div className="h-2 bg-white/20 rounded-full w-3/4" />
                  <div className="h-2 bg-white/20 rounded-full w-1/2" />
                </div>
              </div>
            </div>

            <div className="absolute top-32 left-8 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="w-36 h-24 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 shadow-xl">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">Revenue</p>
                <p className="text-white font-bold text-lg font-syne">$24,580</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-300">+12%</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 space-y-8">
              {/* Rating dots */}
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="w-2 h-2 bg-accent rounded-full" />
                ))}
                <span className="text-white/60 text-xs font-bold ml-2">5.0 Rating</span>
              </div>

              {/* Quote */}
              <blockquote className="text-3xl font-bold text-white leading-tight font-syne tracking-tight">
                "Flow transformed how I run my remodeling business. Invoicing used to take hours—now it takes minutes."
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
                <div>
                  <p className="text-white font-bold text-lg font-syne">Marcus Chen</p>
                  <p className="text-white/60 font-semibold text-xs uppercase tracking-wider">Apex Construction LLC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
