import { apiClient } from '@/shared/api/client'

export const analyticsRepository = {
  // Fire-and-forget: analytics must never break the page.
  trackPageView(path: string): void {
    void apiClient.post('/leads/page-view', { path }).catch(() => {})
  },
}
