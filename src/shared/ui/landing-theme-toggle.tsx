'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useIsClient } from '@/shared/hooks/useIsClient'

export function LandingThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useIsClient()

  if (!mounted) {
    // placeholder with same size to avoid layout shift
    return <div className="w-10 h-10 ml-2" />
  }

  const isDark = resolvedTheme === 'dark'

  if (!isDark) {
    return (
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-label="Cambiar a tema oscuro"
        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all ml-2"
      >
        <Moon className="h-4 w-4 text-gray-600" aria-hidden="true" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setTheme('light')}
      aria-label="Cambiar a tema claro"
      className="w-10 h-10 rounded-lg bg-[#1E293B] hover:bg-[#334155] flex items-center justify-center transition-all ml-2"
    >
      <Sun className="h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
    </button>
  )
}
