import type { KycStatus } from '../api/kycRepository'

export interface KycStatusMessage {
  title: string
  description: string
  /** Whether the customer can start a brand-new verification session right now. */
  canStart: boolean
}

/**
 * Turns the raw provider status into the copy shown to the customer, falling
 * back to the coarser business status when `providerStatus` is absent (older
 * verifications created before the Didit migration).
 */
export function getKycStatusMessage(
  kycStatus: Pick<KycStatus, 'status' | 'providerStatus'>,
): KycStatusMessage {
  switch (kycStatus.providerStatus) {
    case 'In Review':
      return {
        title: 'Estamos revisando tu verificación',
        description:
          'Ya completaste el proceso. Nuestro equipo la está revisando y te avisaremos apenas tengamos el resultado.',
        canStart: false,
      }
    case 'In Progress':
    case 'Awaiting User':
    case 'Resubmitted':
      return {
        title: 'Tu verificación está en curso',
        description: 'Iniciaste el proceso pero aún te falta un paso para completarlo.',
        canStart: false,
      }
    case 'Abandoned':
    case 'Expired':
    case 'Kyc Expired':
      return {
        title: 'Tu verificación quedó a medias',
        description:
          'La sesión anterior expiró antes de completarse. Puedes iniciar una nueva cuando quieras.',
        canStart: true,
      }
    case 'Declined':
      return {
        title: 'No pudimos verificar tu identidad',
        description: 'La verificación no fue aprobada. Puedes intentarlo nuevamente.',
        canStart: true,
      }
    case 'Not Started':
    case 'Approved':
    case undefined:
      break
  }

  // No usable providerStatus — fall back to the business status.
  if (kycStatus.status === 'KYC_UNDER_REVIEW') {
    return {
      title: 'Estamos revisando tu verificación',
      description: 'Te avisaremos apenas tengamos el resultado.',
      canStart: false,
    }
  }
  if (kycStatus.status === 'KYC_REJECTED') {
    return {
      title: 'No pudimos verificar tu identidad',
      description: 'Puedes iniciar una nueva verificación cuando quieras.',
      canStart: true,
    }
  }

  return {
    title: 'Verifica tu identidad',
    description:
      'Te llevaremos a una plataforma segura para verificar tu DNI. Toma menos de 2 minutos.',
    canStart: true,
  }
}
