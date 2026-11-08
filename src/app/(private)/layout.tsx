'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Menu } from 'lucide-react'
import { DashboardSidebar } from '@/widgets/dashboard-sidebar'
import { useAuthStore } from '@/features/auth'
import { useNotificationStore } from '@/features/notifications'
import { ChatWidget, useChatStore } from '@/features/chat'
import { Skeleton } from '@/shared/ui/skeleton'
import { Logo } from '@/shared/ui/Logo'
import { usePushNotifications } from '@/shared/hooks/usePushNotifications'

export default function PrivateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, loadUser, refreshUser } = useAuthStore()
  const {
    unreadCount,
    load: loadNotifications,
    subscribeRealtime,
    unsubscribeRealtime,
  } = useNotificationStore()
  const hydrateChat = useChatStore((s) => s.hydrate)
  const resetChat = useChatStore((s) => s.reset)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  usePushNotifications()

  useEffect(() => {
    // Hydrate instantly from localStorage so the skeleton isn't visible while
    // refreshUser() fetches. The store exposes `isLoading` only until the first
    // server response lands — after that any stale fields from the cache are
    // already overwritten. See useAuthStore for the contract.
    loadUser()
    void refreshUser()
  }, [loadUser, refreshUser])
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return
    subscribeRealtime(user.id)
    return () => {
      unsubscribeRealtime()
    }
  }, [isAuthenticated, user?.id, subscribeRealtime, unsubscribeRealtime])
  // Hydrate the chat widget once the session is confirmed. The store's
  // `hydrate()` is idempotent and safe to call multiple times — it
  // returns early if a previous run is still in flight. The matching
  // `reset()` on unmount tears down the Realtime channel and clears state
  // so a different user logging in on the same browser starts fresh.
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return
    void hydrateChat()
    return () => {
      resetChat()
    }
  }, [isAuthenticated, user?.id, hydrateChat, resetChat])
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login')
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-32 mx-auto" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    )
  }
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile Header */}
      <header className="lg:hidden w-full py-3.5 px-5 flex justify-between items-center bg-[#0A192F] border-b border-white/5 sticky top-0 z-30">
        {/* Mobile header is always navy bg → white mark + gold "revo" */}
        <Logo size={28} markColor="#FFFFFF" textColor="#D4AF37" />

        <div className="flex items-center gap-1">
          <Link
            href="/notifications"
            className="relative p-1 text-gray-300 hover:text-white transition-colors"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-[#00E5FF] text-[#0A192F] text-[9px] font-bold flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-300 hover:text-white text-lg focus:outline-none p-1 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-[1366px] mx-auto p-6 lg:p-10">{children}</div>
      </main>

      {/* Real-time support chat — floating launcher + slide-up panel.
          Renders for every authenticated user on every private route.
          Hidden until clicked; lazy network usage (no API call until the
          launcher is opened). */}
      <ChatWidget />
    </div>
  )
}
