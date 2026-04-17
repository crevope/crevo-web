import type { SauCategory, SauStatus } from '../model/types'

export const SAU_CATEGORY_LABELS: Record<SauCategory, string> = {
  QUERY: 'Consulta',
  SUGGESTION: 'Sugerencia',
  COMPLAINT: 'Reclamo SAU',
}

export const SAU_CATEGORY_DESCRIPTIONS: Record<SauCategory, string> = {
  QUERY:
    'Una duda sobre tu cuenta, una tasa, un pago, un documento, o cualquier aspecto del producto.',
  SUGGESTION:
    'Una idea para mejorar la plataforma o un comentario sobre tu experiencia con Crevo.',
  COMPLAINT:
    'Una queja formal sobre la atención recibida o un incumplimiento del servicio. Si tu reclamo es sobre el producto en sí, usa el Libro de Reclamaciones (INDECOPI).',
}

export const SAU_STATUS_LABELS: Record<SauStatus, string> = {
  OPEN: 'Recibido',
  IN_REVIEW: 'En revisión',
  RESPONDED: 'Respondido',
  CLOSED: 'Cerrado',
}

/**
 * SLA regulatorio del SAU: **30 días calendario** desde la apertura.
 * (Circular SBS G-184-2015 Art. 11). Lo usamos únicamente como dato
 * informativo — el `slaDeadline` real viene calculado desde el backend.
 */
export const SAU_SLA_DAYS = 30
