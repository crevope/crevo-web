'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { LandingThemeToggle } from './landing-theme-toggle'
import { Logo } from './Logo'
import { shortName } from '@/shared/lib/utils'
import { useIsClient } from '@/shared/hooks/useIsClient'

/**
 * Public navigation entries. Order is the funnel order — calculator first
 * (high-intent), then transactional content (Tarifas), then educational
 * (Blog / FAQ), then About last (lowest intent).
 *
 * Mobile shows the same set inside a slide-down panel; desktop renders
 * inline starting at `md` (768px) where there's enough horizontal room.
 */
const NAV_LINKS = [
  { href: '/simulador', label: 'Simulador' },
  { href: '/tarifas', label: 'Tarifas' },
  { href: '/blog', label: 'Blog' },
  { href: '/sobre-nosotros', label: 'Nosotros' },
  { href: '/preguntas-frecuentes', label: 'Ayuda' },
] as const

export function LandingHeader() {
  const { user, isAuthenticated, loadUser } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  // `mounted` gates the auth-dependent CTA so SSR and the first client render
  // emit the SAME markup (the guest "Iniciar sesión" button). React would
  // otherwise mismatch when localStorage already has a logged-in user: the
  // server has no way to know, so it would render the guest button while the
  // client immediately renders the dashboard avatar — that's a hard
  // hydration error in Next 16. Once `mounted` is true we can safely show
  // the authenticated CTA based on the in-memory store value.
  const mounted = useIsClient()

  // Hydrate the auth store from localStorage on mount. This is the actual
  // side effect (the `mounted` gate above is purely a render fence).
  useEffect(() => {
    loadUser()
  }, [loadUser])

  // Close the mobile menu on route change. We approximate this by closing
  // whenever the user clicks any link inside the menu (handled per-link).
  const closeMobile = () => setMobileOpen(false)

  const showAuthedCta = mounted && isAuthenticated && user

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-gray-200/50 dark:border-[#334155]/50">
      <div className="w-full py-4 px-4 sm:px-8 lg:px-16 xl:px-20 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center text-[#0A192F] dark:text-white"
          onClick={closeMobile}
        >
          <Logo size={32} />
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-5 lg:gap-6"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#0A192F] dark:hover:text-[#D4AF37] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right side: theme toggle + auth CTA + (mobile) hamburger */}
        <div className="flex items-center gap-3 sm:gap-4">
          <LandingThemeToggle />

          <div className="w-px h-4 bg-gray-200 dark:bg-[#334155] hidden md:block" />

          {showAuthedCta ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#0A192F] dark:text-white border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              onClick={closeMobile}
            >
              <div className="w-6 h-6 rounded-full bg-[#0A192F] dark:bg-[#D4AF37] flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#D4AF37] dark:text-[#0A192F] uppercase">
                  {user.firstName?.trim().charAt(0) ?? 'U'}
                </span>
              </div>
              <span className="hidden sm:block">{shortName(user.firstName, user.lastName)}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm font-medium text-[#0A192F] dark:text-[#D4AF37] border border-[#0A192F] dark:border-[#D4AF37] rounded-lg hover:bg-[#0A192F] dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-[#0A192F] transition-all"
              onClick={closeMobile}
            >
              Iniciar sesión
            </Link>
          )}

          {/* Mobile hamburger — only renders below `md` */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer — slides down inside the header background. Kept
          inline (no portal) so it inherits the same sticky/blur styling. */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Navegación móvil"
          className="md:hidden border-t border-gray-200/50 dark:border-[#334155]/50 px-4 py-3"
        >
          <ul className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={closeMobile}
                  className="block py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-[#0A192F] dark:hover:text-[#D4AF37] transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
