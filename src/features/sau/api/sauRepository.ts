import { apiClient } from '@/shared/api/client'
import type { SauTicketView, SauCategory } from '../model/types'

export interface OpenSauTicketDTO {
  category: SauCategory
  subject: string
  body: string
  /** Optional — ties the ticket to a specific loan in admin queue views. */
  loanId?: string
}

export interface SauTicketListParams {
  limit?: number
  offset?: number
}

/**
 * Thin HTTP layer over the `/api/sau` endpoints exposed by the backend for
 * authenticated users. Admin endpoints live under `/api/sau/admin/*` and are
 * consumed by `crevo-admin`, not this app.
 */
export const sauRepository = {
  async open(dto: OpenSauTicketDTO): Promise<SauTicketView> {
    const { data } = await apiClient.post('/sau', dto)
    return data.data
  },

  async mine(params: SauTicketListParams = {}): Promise<SauTicketView[]> {
    const { limit = 50, offset = 0 } = params
    const { data } = await apiClient.get('/sau/mine', { params: { limit, offset } })
    return data.data
  },

  async getOne(ticketId: string): Promise<SauTicketView> {
    const { data } = await apiClient.get(`/sau/${ticketId}`)
    return data.data
  },
}
