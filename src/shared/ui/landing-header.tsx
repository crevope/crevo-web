'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/features/auth'
import { LandingThemeToggle } from './landing-theme-toggle'
import { Logo } from './Logo'
import { shortName } from '@/shared/lib/utils'

export function LandingHeader() {
  const { user, isAuthenticated, loadUser } = useAuthStore()

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return (
    <header className="w-full py-5 px-4 sm:px-8 lg:px-16 xl:px-20 flex justify-between items-center fixed top-0 left-0 z-50 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-gray-200/50 dark:border-[#334155]/50">

      {/* Logo — currentColor inherited from text-* class auto-switches navy ↔ white */}
      <Link href="/" className="flex items-center text-[#0A192F] dark:text-white">
        <Logo size={32} />
      </Link>

      {/* Nav */}
      <div className="flex items-center gap-4 sm:gap-5">
        <Link href="#nosotros" className="text-sm text-gray-500 hover:text-[#0A192F] transition-colors hidden md:block dark:hidden">Nosotros</Link>
        <Link href="#nosotros" className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors hidden dark:md:block">Nosotros</Link>

        <Link href="#ayuda" className="text-sm text-gray-500 hover:text-[#0A192F] transition-colors hidden md:block dark:hidden">Ayuda</Link>
        <Link href="#ayuda" className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors hidden dark:md:block">Ayuda</Link>

        <LandingThemeToggle />

        <div className="w-px h-4 bg-gray-200 hidden md:block dark:hidden" />
        <div className="w-px h-4 bg-[#334155] hidden dark:md:block" />

        {isAuthenticated && user ? (
          /* Authenticated — show profile button */
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#0A192F] dark:text-white border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-[#0A192F] dark:bg-[#D4AF37] flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#D4AF37] dark:text-[#0A192F] uppercase">
                {user.firstName?.trim().charAt(0) ?? 'U'}
              </span>
            </div>
            <span className="hidden sm:block">
              {shortName(user.firstName, user.lastName)}
            </span>
          </Link>
        ) : (
          /* Guest — show login button */
          <>
            <Link href="/login" className="px-4 py-1.5 text-sm font-medium text-[#0A192F] border border-[#0A192F] rounded-lg hover:bg-[#0A192F] hover:text-white transition-all dark:hidden">
              Iniciar sesión
            </Link>
            <Link href="/login" className="px-4 py-1.5 text-sm font-medium text-[#D4AF37] border border-[#D4AF37] rounded-lg hover:bg-[#D4AF37] hover:text-[#0A192F] transition-all hidden dark:block">
              Iniciar sesión
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
