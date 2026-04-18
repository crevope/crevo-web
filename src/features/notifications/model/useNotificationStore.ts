import { create } from 'zustand'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/shared/lib/supabase'
import { notificationsRepository } from '../api/notificationsRepository'
import type { Notification } from '@/entities/notification'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  load: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  subscribeRealtime: (userId: string) => void
  unsubscribeRealtime: () => void
  _channel: RealtimeChannel | null
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  _channel: null,

  load: async () => {
    set({ isLoading: true })
    try {
      const raw = await notificationsRepository.getAll()
      const notifications = Array.isArray(raw) ? raw : []
      set({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length })
    } finally {
      set({ isLoading: false })
    }
  },

  markAsRead: async (id) => {
    await notificationsRepository.markAsRead(id)
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllAsRead: async () => {
    await notificationsRepository.markAllAsRead()
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
  },

  subscribeRealtime: (userId: string) => {
    // Evitar duplicar la suscripción si ya existe
    if (get()._channel) return

    const channel = supabase
      .channel(`notif:${userId}`)
      .on('broadcast', { event: 'new_notification' }, () => {
        // El backend envía un ping — refetcheamos desde la API autenticada
        get().load()
      })
      .subscribe()

    set({ _channel: channel })
  },

  unsubscribeRealtime: () => {
    const channel = get()._channel
    if (channel) {
      supabase.removeChannel(channel)
      set({ _channel: null })
    }
  },
}))
