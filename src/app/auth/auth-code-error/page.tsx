'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthCodeErrorPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if user is actually logged in already
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // User is already logged in, redirect to dashboard
        router.push('/')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md text-center p-8">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Authentication Error</h1>
        <p className="text-slate-500 mb-8">
          Something went wrong during sign in. This could happen if the link expired or was already used.
        </p>
        <a 
          href="/login"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Try Again
        </a>
      </div>
    </div>
  )
}

