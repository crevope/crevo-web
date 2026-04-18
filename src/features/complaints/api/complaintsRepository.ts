import { apiClient } from '@/shared/api/client'
import type {
  ClaimType,
  ComplaintSource,
  ComplaintStatus,
  ConsumerDocumentType,
  ProductType,
} from '../lib/complaintsConstants'

/**
 * Input payload for POST /api/complaints — mirrors `FileComplaintDTO` on the
 * backend. Kept as a plain interface (no zod) because the client-side schema
 * lives in `complaintsSchemas.ts` and we don't want duplicate validation
 * surfaces drifting out of sync.
 */
export interface FileComplaintDTO {
  consumerFirstName: string
  consumerLastName: string
  consumerDocumentType: ConsumerDocumentType
  consumerDocumentNumber: string
  consumerEmail: string
  consumerPhone: string
  consumerAddress: string
  consumerIsMinor?: boolean
  guardianFullName?: string
  guardianDocumentNumber?: string

  productType: ProductType
  productDescription: string
  claimedAmount?: number
  loanId?: string

  claimType: ClaimType
  claimDetail: string
  consumerRequest: string

  source?: ComplaintSource
}

/** Receipt the API returns after a successful filing. */
export interface FiledComplaintReceipt {
  claimCode: string
  filedAt: string
  slaDeadline: string
}

/** Public-safe view of a complaint — what `/consulta/:code` returns. */
export interface PublicComplaintView {
  claimCode: string
  consumerFirstName: string
  consumerLastName: string
  consumerDocumentType: ConsumerDocumentType
  consumerDocumentNumber: string
  productType: ProductType
  productDescription: string
  claimedAmount?: number
  claimType: ClaimType
  claimDetail: string
  consumerRequest: string
  filedAt: string
  slaDeadline: string
  status: ComplaintStatus
  responseText?: string
  respondedAt?: string
}

/** Full complaint (authed views only — `my-complaints`, admin). */
export interface ComplaintView extends PublicComplaintView {
  id: string
  userId?: string
  consumerEmail: string
  consumerPhone: string
  consumerAddress: string
  consumerIsMinor: boolean
  guardianFullName?: string
  guardianDocumentNumber?: string
  loanId?: string
  filedFromIp?: string
  filedFromUserAgent?: string
  source: ComplaintSource
  respondedBy?: string
  consumerNotifiedAt?: string
  createdAt: string
  updatedAt: string
}

export const complaintsRepository = {
  /** Public — anyone can file. If the user is logged in the backend links the
   *  complaint to their account automatically via `optionalAuthMiddleware`. */
  async file(dto: FileComplaintDTO): Promise<FiledComplaintReceipt> {
    const { data } = await apiClient.post('/complaints', dto)
    return data.data
  },

  /** Public lookup — requires the claim code AND the consumer document number,
   *  passed as a query param so the code alone is useless for enumeration. */
  async consult(claimCode: string, documentNumber: string): Promise<PublicComplaintView> {
    const { data } = await apiClient.get(`/complaints/consulta/${encodeURIComponent(claimCode)}`, {
      params: { documentNumber },
    })
    return data.data
  },

  /** Auth — list the current user's complaints (newest first). */
  async listMine(options?: { limit?: number; offset?: number }): Promise<ComplaintView[]> {
    const { data } = await apiClient.get('/complaints/mine', { params: options })
    return data.data
  },
}
