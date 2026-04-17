/**
 * SAU (Sistema de Atención al Usuario) — SBS Circular G-184-2015.
 *
 * Types mirror the backend `toUserJSON()` shape. Admin-only fields (internal
 * assignee, audit trail) are intentionally omitted because the consumer
 * endpoints never return them.
 */

export type SauCategory = 'QUERY' | 'SUGGESTION' | 'COMPLAINT'

export type SauStatus = 'OPEN' | 'IN_REVIEW' | 'RESPONDED' | 'CLOSED'

/** User-facing view of a SAU ticket (returned by `/api/sau/mine` and `/api/sau/:id`). */
export interface SauTicketView {
  id: string
  ticketCode: string
  category: SauCategory
  subject: string
  body: string
  loanId?: string | null
  filedAt: string
  slaDeadline: string
  status: SauStatus
  responseText?: string | null
  respondedAt?: string | null
  consumerNotifiedAt?: string | null
}
