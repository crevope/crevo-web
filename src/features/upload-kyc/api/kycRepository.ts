import { apiClient } from '@/shared/api/client'

export type KycUserStatus =
  | 'PENDING_VERIFICATION'
  | 'KYC_UNDER_REVIEW'
  | 'VERIFIED'
  | 'KYC_REJECTED'
  | 'SUSPENDED'

/**
 * Raw state as reported by the identity-verification provider (Didit). May be
 * absent on verifications created before the provider migration.
 */
export type KycProviderStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Approved'
  | 'Declined'
  | 'In Review'
  | 'Abandoned'
  | 'Resubmitted'
  | 'Awaiting User'
  | 'Expired'
  | 'Kyc Expired'

export interface KycStatus {
  isIdentityVerified: boolean
  status: KycUserStatus
  providerStatus?: KycProviderStatus
}

export interface KycSession {
  sessionUrl: string
  verificationId: string
}

export const kycRepository = {
  async getStatus(): Promise<KycStatus> {
    const { data } = await apiClient.get('/kyc/status')
    return {
      isIdentityVerified: data.data.isIdentityVerified,
      status: data.data.status as KycUserStatus,
      providerStatus: data.data.providerStatus as KycProviderStatus | undefined,
    }
  },
  /** Creates a hosted verification session with the provider and returns the
   *  link the customer must be redirected to. */
  async createSession(): Promise<KycSession> {
    const { data } = await apiClient.post('/kyc/session')
    return {
      sessionUrl: data.data.sessionUrl,
      verificationId: data.data.verificationId,
    }
  },
  /** @deprecated The backend now uses a hosted verification flow via
   *  `createSession()`. Kept while the legacy upload route still exists on
   *  the server; removing it is a separate task. */
  async upload(files: { dniFront: File; dniBack: File; selfie: File }): Promise<KycStatus> {
    const form = new FormData()
    form.append('dni_front', files.dniFront)
    form.append('dni_back', files.dniBack)
    form.append('selfie', files.selfie)
    const { data } = await apiClient.post('/kyc/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return {
      isIdentityVerified: data.data.isIdentityVerified ?? false,
      status: (data.data.status ?? 'KYC_UNDER_REVIEW') as KycUserStatus,
    }
  },
}
