'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, LayoutDashboard, CreditCard, FileText, User } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useNotificationStore } from '@/features/notifications'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/loans', label: 'Préstamos', icon: CreditCard },
  { href: '/kyc', label: 'Verificación', icon: FileText },
  { href: '/profile', label: 'Perfil', icon: User },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()

  return (
    <>
      {/* ── Desktop top bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">

          {/* Logo */}
          <Link href="/dashboard" className="text-xl font-extrabold tracking-tight text-gradient-brand">
            CREVO
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${active
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                    }`}
                >
                  {label}
                  {active && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 bg-gradient-brand rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-brand text-[9px] text-white font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-border/50">
              <div className="h-7 w-7 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user?.firstName?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-muted-foreground font-medium">{user?.firstName}</span>
              <button
                onClick={logout}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1 hover:underline"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile bottom bar ───────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur-xl flex pb-safe">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors
                ${active ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Icon className={`h-5 w-5 transition-transform ${active ? 'scale-110' : ''}`} />
              {label}
            </Link>
          )
        })}
        <Link
          href="/notifications"
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold relative transition-colors
            ${pathname === '/notifications' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1/2 translate-x-3 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-brand text-[8px] text-white font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          Alertas
        </Link>
      </nav>
    </>
  )
}
