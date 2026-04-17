'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Home, HandCoins, Wallet, ArrowLeftRight, Bell, BookOpen, User,
  Sun, Moon, LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useNotificationStore } from '@/features/notifications'
import { Logo } from '@/shared/ui/Logo'
import { shortName } from '@/shared/lib/utils'

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
  matchPrefix?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',      icon: Home,           label: 'Dashboard' },
  { href: '/request-loan',   icon: HandCoins,      label: 'Solicitar Préstamo' },
  { href: '/loans',          icon: Wallet,         label: 'Mis Préstamos', matchPrefix: '/loans' },
  { href: '/payments',       icon: ArrowLeftRight, label: 'Pagos' },
  { href: '/notifications',  icon: Bell,           label: 'Notificaciones' },
  { href: '/my-complaints',  icon: BookOpen,       label: 'Mis Reclamos' },
  { href: '/profile',        icon: User,           label: 'Mi Perfil' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function DashboardSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { resolvedTheme, setTheme } = useTheme()
  const { unreadCount } = useNotificationStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  const isActive = (item: NavItem) => {
    if (item.matchPrefix) return pathname.startsWith(item.matchPrefix)
    return pathname === item.href
  }

  const name = user ? shortName(user.firstName, user.lastName) : 'Usuario'

  const initials = user
    ? `${user.firstName.trim().charAt(0)}${user.lastName.trim().charAt(0)}`.toUpperCase()
    : 'U'

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 z-40
          bg-[#0A192F] border-r border-white/5
          flex flex-col py-6 px-5 overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo — sidebar is always navy bg, so use white mark + gold "revo"
            via two-tone for premium contrast. */}
        <div className="hidden lg:flex items-center mb-8 px-1">
          <Logo size={28} markColor="#FFFFFF" textColor="#D4AF37" />
        </div>

        {/* User card */}
        <div className="flex items-center gap-3 mb-7 px-3 py-3 rounded-lg bg-white/5">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#D4AF37] to-[#D4AF37]/80 flex items-center justify-center text-[#0A192F] text-sm font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider">{greeting}</p>
            <p className="text-sm text-white font-medium truncate">{name}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="grow space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item)
            const ItemIcon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                  ${active
                    ? 'bg-[#00E5FF]/10 text-[#00E5FF] font-medium'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <ItemIcon className="h-4 w-4" aria-hidden="true" />
                {item.label}
                {item.href === '/notifications' && unreadCount > 0 && (
                  <span className="ml-auto w-[18px] h-[18px] rounded-full bg-[#00E5FF] text-[#0A192F] text-[10px] font-bold inline-flex items-center justify-center leading-none shrink-0">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto pt-5 border-t border-white/5 space-y-0.5">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer text-gray-400 hover:bg-white/5 hover:text-white transition-colors w-full"
          >
            {mounted ? (
              isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />
            ) : (
              <span className="w-4" />
            )}
            {mounted ? (isDark ? 'Modo Claro' : 'Modo Oscuro') : 'Tema'}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer text-red-400 hover:bg-red-400/10 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  )
}
