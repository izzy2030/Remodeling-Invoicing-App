'use client'

import { useTheme } from '@/components/ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative h-10 w-10 bg-card border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all group overflow-hidden"
      aria-label="Toggle theme"
    >
      {/* Sun icon */}
      <Sun
        className={`w-4 h-4 absolute transition-all duration-300 ${theme === 'light'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 rotate-90 scale-0'
          }`}
      />

      {/* Moon icon */}
      <Moon
        className={`w-4 h-4 absolute transition-all duration-300 ${theme === 'dark'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 -rotate-90 scale-0'
          }`}
      />

      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
    </button>
  )
}
