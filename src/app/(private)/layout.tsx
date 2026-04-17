'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DashboardSidebar } from '@/widgets/dashboard-sidebar'
import { useAuthStore } from '@/features/auth'
import { useNotificationStore } from '@/features/notifications'
import { Skeleton } from '@/shared/ui/skeleton'
import { Logo } from '@/shared/ui/Logo'
import { usePushNotifications } from '@/shared/hooks/usePushNotifications'

export default function PrivateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore()
  const { unreadCount, load: loadNotifications, subscribeRealtime, unsubscribeRealtime } = useNotificationStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  usePushNotifications()

  useEffect(() => { loadUser() }, [loadUser])
  useEffect(() => { loadNotifications() }, [loadNotifications])
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return
    subscribeRealtime(user.id)
    return () => { unsubscribeRealtime() }
  }, [isAuthenticated, user?.id, subscribeRealtime, unsubscribeRealtime])
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
          <Link href="/notifications" className="relative p-1 text-gray-300 hover:text-white transition-colors">
            <i className="fa-regular fa-bell text-lg" />
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
            <i className="fa-solid fa-bars" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-[1366px] mx-auto p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
