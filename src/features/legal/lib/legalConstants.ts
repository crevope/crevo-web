/**
 * Legal document types — must match the backend enum
 * (`src/domain/entities/LegalAcceptance.ts` → LegalDocumentType).
 *
 * Versions are mirrored from the backend's `LegalVersionsCatalog`. The frontend
 * passes the version it has rendered when calling POST /legal/accept; the
 * backend rejects mismatches so the user only ever accepts the exact text
 * displayed in the page they read.
 */

export const LEGAL_DOCUMENT_TYPES = {
  TERMS: 'TERMS',
  PRIVACY: 'PRIVACY',
  COOKIES: 'COOKIES',
  LOAN_TERMS: 'LOAN_TERMS',
  CREDIT_BUREAU_AUTH: 'CREDIT_BUREAU_AUTH',
} as const

export type LegalDocumentType = (typeof LEGAL_DOCUMENT_TYPES)[keyof typeof LEGAL_DOCUMENT_TYPES]

/**
 * Mirror of CURRENT_LEGAL_VERSIONS in the backend. Bumping a version here
 * MUST be done together with the backend bump — if they diverge, the backend
 * will reject every acceptance until they match again.
 */
export const LEGAL_VERSIONS: Record<LegalDocumentType, string> = {
  TERMS: '2026-04-15',
  PRIVACY: '2026-04-15',
  COOKIES: '2026-04-15',
  LOAN_TERMS: '2026-04-15',
  CREDIT_BUREAU_AUTH: '2026-04-15',
}

/** Public URLs of every legal document — single source of truth for links. */
export const LEGAL_URLS = {
  TERMS: '/terminos-y-condiciones',
  PRIVACY: '/politica-de-privacidad',
  COOKIES: '/politica-de-cookies',
} as const

/** Company contact data shown on every legal page — single source of truth. */
export const LEGAL_COMPANY = {
  brand: 'Crevo',
  legalName: '[Razón social — pendiente de constitución]',
  ruc: '[RUC — pendiente]',
  address: '[Domicilio fiscal — pendiente]',
  email: 'legal@crevo.pe',
  privacyEmail: 'privacidad@crevo.pe',
  supportEmail: 'soporte@crevo.pe',
  domain: 'crevo.pe',
} as const
