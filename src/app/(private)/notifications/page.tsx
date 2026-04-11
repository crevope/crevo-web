'use client'
import { useEffect } from 'react'
import { useNotificationStore } from '@/features/notifications'
import { NOTIFICATION_ICONS } from '@/entities/notification'
import { formatRelativeDate } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, load, markAsRead, markAllAsRead } = useNotificationStore()

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-1 tracking-tight">Notificaciones</h1>
          {unreadCount > 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Tienes <strong className="text-[#0A192F] dark:text-[#D4AF37]">{unreadCount}</strong> sin leer
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Estás al día con todas tus notificaciones</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-100 dark:border-white/6 text-gray-500 dark:text-gray-400 font-medium text-sm hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
          >
            <i className="fa-solid fa-check-double" />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Unread count banner */}
      {unreadCount > 0 && (
        <div className={`${cardCls} p-4 flex items-center gap-4 border-l-2 border-l-[#00E5FF]`}>
          <div className="w-10 h-10 rounded-full bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] shrink-0">
            <i className="fa-regular fa-bell text-lg" />
          </div>
          <div>
            <p className="text-[#0A192F] dark:text-white font-medium text-sm">
              {unreadCount} notificación{unreadCount > 1 ? 'es' : ''} sin leer
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Toca cada notificación para marcarla como leída
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className={`${cardCls} overflow-hidden divide-y divide-gray-100 dark:divide-white/6`}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-start gap-4 p-5">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 pt-0.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-10 shrink-0 mt-1" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className={`${cardCls} p-16 text-center`}>
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#0F172A] flex items-center justify-center mx-auto mb-5">
            <i className="fa-regular fa-bell-slash text-3xl text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-[#0A192F] dark:text-white mb-2">Sin notificaciones</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Aquí aparecerán las alertas sobre tus préstamos y pagos.
          </p>
        </div>
      ) : (
        <div className={`${cardCls} overflow-hidden`}>
          <div className="divide-y divide-gray-100 dark:divide-white/6">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markAsRead(n.id)}
                className={`flex items-start gap-4 p-5 cursor-pointer transition-colors
                  ${!n.isRead
                    ? 'bg-[#0A192F]/3 dark:bg-[#D4AF37]/5 hover:bg-[#0A192F]/5 dark:hover:bg-[#D4AF37]/10'
                    : 'hover:bg-gray-50 dark:hover:bg-[#0F172A]'
                  }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0
                  ${!n.isRead
                    ? 'bg-[#0A192F]/5 dark:bg-[#D4AF37]/10'
                    : 'bg-gray-50 dark:bg-white/5'
                  }`}
                >
                  {NOTIFICATION_ICONS[n.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm leading-snug ${!n.isRead ? 'font-semibold text-[#0A192F] dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                      {n.title}
                    </p>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">
                      {formatRelativeDate(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{n.body}</p>
                </div>

                {/* Unread dot */}
                {!n.isRead && (
                  <div className="w-2.5 h-2.5 bg-[#00E5FF] rounded-full shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
