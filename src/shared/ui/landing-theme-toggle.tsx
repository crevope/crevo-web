'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function LandingThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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
        <i className="fa-solid fa-moon text-gray-600" aria-hidden="true" />
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
      <i className="fa-solid fa-sun text-[#D4AF37]" aria-hidden="true" />
    </button>
  )
}
