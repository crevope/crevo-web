import { apiClient } from '@/shared/api/client'
import type { LegalDocumentType } from '../lib/legalConstants'

export interface LegalAcceptanceDTO {
  documentType: LegalDocumentType
  documentVersion: string
  resourceId?: string
  resourceType?: string
  metadata?: Record<string, unknown>
}

export interface LegalAcceptance {
  id: string
  userId: string
  documentType: LegalDocumentType
  documentVersion: string
  resourceId?: string
  resourceType?: string
  acceptedAt: string
  ipAddress?: string
  userAgent?: string
}

export interface CurrentVersionsResponse {
  versions: Record<LegalDocumentType, string>
}

export const legalRepository = {
  /** Public — fetches the currently published version of every legal document. */
  async getCurrentVersions(): Promise<CurrentVersionsResponse> {
    const { data } = await apiClient.get('/legal/current-versions')
    return data.data
  },

  /** Auth — records a single legal acceptance for the current user. */
  async accept(dto: LegalAcceptanceDTO): Promise<LegalAcceptance> {
    const { data } = await apiClient.post('/legal/accept', dto)
    return data.data
  },

  /** Auth — best-effort batch acceptance. Failures are swallowed so a single
   *  bad call does not break the primary flow (e.g. registration). The caller
   *  should still log to Sentry if it needs the failure surface. */
  async acceptMany(items: LegalAcceptanceDTO[]): Promise<void> {
    await Promise.allSettled(items.map((dto) => this.accept(dto)))
  },

  /** Auth — full acceptance history for the user (privacy dashboard). */
  async getMyAcceptances(): Promise<LegalAcceptance[]> {
    const { data } = await apiClient.get('/legal/my-acceptances')
    return data.data
  },
}
