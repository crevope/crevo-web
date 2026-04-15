/**
 * Type constants for the Libro de Reclamaciones — must match the backend
 * `Complaint.ts` enums. String-literal unions are preferred over native enums
 * so they tree-shake and serialize cleanly when sent to the API.
 */

export const CONSUMER_DOCUMENT_TYPES = {
  DNI: 'DNI',
  CE: 'CE',
  PASSPORT: 'PASSPORT',
  RUC: 'RUC',
} as const
export type ConsumerDocumentType =
  (typeof CONSUMER_DOCUMENT_TYPES)[keyof typeof CONSUMER_DOCUMENT_TYPES]

export const PRODUCT_TYPES = {
  PRODUCT: 'PRODUCT',
  SERVICE: 'SERVICE',
} as const
export type ProductType = (typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES]

export const CLAIM_TYPES = {
  CLAIM: 'CLAIM',
  COMPLAINT: 'COMPLAINT',
} as const
export type ClaimType = (typeof CLAIM_TYPES)[keyof typeof CLAIM_TYPES]

export const COMPLAINT_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const
export type ComplaintStatus = (typeof COMPLAINT_STATUS)[keyof typeof COMPLAINT_STATUS]

export const COMPLAINT_SOURCES = {
  WEB: 'WEB',
  MOBILE: 'MOBILE',
  PHYSICAL_BOOK: 'PHYSICAL_BOOK',
} as const
export type ComplaintSource = (typeof COMPLAINT_SOURCES)[keyof typeof COMPLAINT_SOURCES]

// ─── Display labels ──────────────────────────────────────────────────────────
// Kept here so every view renders the same es-PE copy (form selects, consulta
// header, my-complaints badges). If we ever add an English version, swap this
// object for a locale-aware helper and nothing else changes.

export const DOCUMENT_TYPE_LABELS: Record<ConsumerDocumentType, string> = {
  DNI: 'DNI',
  CE: 'Carné de extranjería',
  PASSPORT: 'Pasaporte',
  RUC: 'RUC',
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  PRODUCT: 'Producto',
  SERVICE: 'Servicio',
}

export const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  CLAIM: 'Reclamo',
  COMPLAINT: 'Queja',
}

/** Short explanation of the CLAIM vs COMPLAINT distinction as INDECOPI defines it. */
export const CLAIM_TYPE_DESCRIPTIONS: Record<ClaimType, string> = {
  CLAIM:
    'Disconformidad con el producto o servicio recibido (por ejemplo: se cobró más de lo acordado, el desembolso no llegó, un error en el cálculo de intereses).',
  COMPLAINT:
    'Malestar con la atención al cliente, sin que afecte directamente al producto o servicio (por ejemplo: trato inadecuado, demora excesiva en la respuesta).',
}

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  OPEN: 'En trámite',
  CLOSED: 'Respondido',
}
