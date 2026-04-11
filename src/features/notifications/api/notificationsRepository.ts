import { apiClient } from '@/shared/api/client'
import type { Notification } from '@/entities/notification'

export const notificationsRepository = {
  async getAll(): Promise<Notification[]> {
    const { data } = await apiClient.get('/notifications')
    const result = data?.data?.notifications
    return Array.isArray(result) ? result : []
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all')
  },

  async saveFcmToken(token: string): Promise<void> {
    await apiClient.post('/notifications/fcm-token', { token })
  },
}
