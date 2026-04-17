'use client'
import Link from 'next/link'
import { LandingThemeToggle } from './landing-theme-toggle'
import { Logo } from './Logo'

interface AuthHeaderProps {
  cta?: { label: string; href: string }
}

export function AuthHeader({ cta }: AuthHeaderProps) {
  return (
    <header className="w-full py-4 px-4 sm:px-8 lg:px-16 xl:px-20 flex justify-between items-center absolute top-0 left-0 z-50">
      <Link href="/" className="flex items-center text-[#0A192F] dark:text-white">
        <Logo size={32} />
      </Link>

      <div className="flex items-center gap-4 sm:gap-5">
        <LandingThemeToggle />
        <Link
          href="#ayuda"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#0A192F] dark:hover:text-[#D4AF37] transition-colors hidden md:block"
        >
          Ayuda
        </Link>
        {cta && (
          <>
            <div className="w-px h-4 bg-gray-200 dark:bg-[#334155] hidden md:block" />
            <Link
              href={cta.href}
              className="px-4 py-1.5 text-sm font-medium text-[#0A192F] dark:text-[#D4AF37] border border-[#0A192F] dark:border-[#D4AF37] rounded-lg hover:bg-[#0A192F] dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-[#0A192F] transition-all"
            >
              {cta.label}
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
