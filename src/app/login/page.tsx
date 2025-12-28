'use client'

import { supabase } from '@/lib/supabase'
import { Wrench, ArrowRight, Github } from 'lucide-react'
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left Side: Login Form */}
      <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center gap-3 mb-16">
            <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-outfit">RemodelFlow</h1>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight font-outfit leading-tight">
              Create and manage invoices <span className="text-primary">effortlessly.</span>
            </h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              The professional tool for remodeling experts to handle clients, projects, and payments.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full h-16 flex items-center justify-between px-8 bg-white border-2 border-slate-100 text-slate-900 font-bold rounded-2xl hover:border-primary hover:bg-slate-50 transition-all group"
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
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>

            <button className="w-full h-16 flex items-center justify-between px-8 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all group">
              <div className="flex items-center gap-4">
                <Github className="w-6 h-6" />
                Continue with GitHub
              </div>
              <ArrowRight className="w-5 h-5 text-white/30 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          <div className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2025 RemodelFlow</p>
            <div className="flex gap-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-primary cursor-pointer transition-colors">Privacy</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-primary cursor-pointer transition-colors">Terms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Showcase */}
      <div className="hidden lg:block relative p-4">
        <div className="relative h-full w-full bg-primary rounded-[2.5rem] overflow-hidden flex flex-col justify-end p-20 shadow-2xl shadow-primary/20">
          {/* Abstract Pattern / Texture */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-[-10%] right-[-10%] w-[100%] h-[100%] bg-white/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] bg-blue-900/20 rounded-full blur-[100px]" />

          <div className="relative z-10 max-w-lg space-y-8">
            <div className="w-16 h-1 bg-white/40 rounded-full" />
            <h3 className="text-5xl font-extrabold text-white leading-[1.1] font-outfit">
              "This transformed how I handle my projects."
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20" />
              <div>
                <p className="text-white font-bold text-lg">Marcus Chen</p>
                <p className="text-white/60 font-medium">Head of Apex Construction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
