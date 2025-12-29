'use client'

import { supabase } from '@/lib/supabase'
import { Zap, ArrowRight, Github } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/')
      }
    })
  }, [router])

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-card rounded-[3rem] shadow-xl overflow-hidden border border-border">
        {/* Left Side: Login Form */}
        <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-20">
          <div className="max-w-md w-full mx-auto">
            <div className="flex items-center gap-3 mb-16">
              <div className="bg-yellow-400 p-2.5 rounded-2xl shadow-sm border-2 border-slate-900">
                <Zap className="w-6 h-6 text-slate-900 fill-slate-900" />
              </div>
              <h1 className="text-2xl font-black text-foreground tracking-tight font-outfit uppercase italic">Flow</h1>
            </div>

            <div className="mb-12">
              <h2 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight font-outfit leading-tight italic">
                Get more done <span className="text-primary italic">with Flow.</span>
              </h2>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Seamless professional invoicing for modern contractors.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full h-16 flex items-center justify-between px-8 bg-background border border-border text-foreground font-bold rounded-2xl hover:border-primary hover:bg-secondary transition-all group"
              >
                <div className="flex items-center gap-4">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                  Continue with Google
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </button>

              <button className="w-full h-16 flex items-center justify-between px-8 bg-foreground border border-foreground text-background font-bold rounded-2xl hover:opacity-90 transition-all group shadow-sm">
                <div className="flex items-center gap-4 text-sm uppercase tracking-widest font-black">
                  <Github className="w-5 h-5" />
                  GitHub Login
                </div>
                <ArrowRight className="w-5 h-5 text-background/30 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            <div className="mt-12 text-center text-xs font-bold text-muted-foreground/30 uppercase tracking-widest">
              Secured by Supabase Auth
            </div>
          </div>
        </div>

        {/* Right Side: Showcase */}
        <div className="hidden lg:block relative p-6 bg-secondary/50">
          <div className="relative h-full w-full bg-primary rounded-[2.5rem] overflow-hidden flex flex-col justify-end p-20 shadow-lg">
            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-background/10 rounded-full blur-[120px]" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <div className="relative z-10 max-w-lg space-y-10">
               <div className="flex items-center gap-2">
                 {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full" />)}
               </div>
              <h3 className="text-5xl font-black text-white leading-[1.05] font-outfit italic tracking-tighter">
                "The best tool for my remodeling business."
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center text-white font-black text-lg">
                  M
                </div>
                <div>
                  <p className="text-white font-black text-lg font-outfit tracking-tight">Marcus Chen</p>
                  <p className="text-white/60 font-bold text-xs uppercase tracking-widest">Apex Construction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
