'use client'
import { formatDateTime } from '@/shared/lib/utils'
import { Card } from '@/shared/ui/card'
import type { SauTicketView } from '../model/types'
import { SAU_CATEGORY_LABELS } from '../lib/sauConstants'
import { SauStatusBadge } from './SauStatusBadge'

/**
 * Read-only detail view of a single SAU ticket for the consumer area.
 *
 * Shows the original submission at the top, the admin response (when it
 * lands) in a highlighted block below, and a timeline of meta fields
 * (filed / SLA / responded / closed) as supporting detail. No actions —
 * the user can only watch a ticket progress; only admins can transition
 * state, respond or close from the admin panel.
 */
export function SauTicketDetailCard({ ticket }: Readonly<{ ticket: SauTicketView }>) {
  return (
    <Card className="bg-brand-card rounded-lg border-gray-100 dark:border-white/6 p-6 sm:p-8 shadow-none space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5 border-b border-gray-100 dark:border-white/6">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
            {SAU_CATEGORY_LABELS[ticket.category]}
          </p>
          <h2 className="text-xl font-semibold text-brand-text break-words">{ticket.subject}</h2>
          <code className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-1.5 block">
            {ticket.ticketCode}
          </code>
        </div>
        <SauStatusBadge status={ticket.status} />
      </header>

      {/* User submission */}
      <section>
        <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          Tu solicitud
        </h3>
        <p className="text-sm text-brand-text leading-relaxed whitespace-pre-wrap break-words">
          {ticket.body}
        </p>
      </section>

      {/* Response (if any) */}
      {ticket.responseText ? (
        <section className="rounded-lg bg-brand-surface border border-green-200 dark:border-green-700/30 p-5">
          <h3 className="text-xs uppercase tracking-wider text-green-700 dark:text-green-400 mb-2 font-semibold">
            Respuesta del equipo de Crevo
          </h3>
          <p className="text-sm text-brand-text leading-relaxed whitespace-pre-wrap break-words mb-3">
            {ticket.responseText}
          </p>
          {ticket.respondedAt && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Respondido el {formatDateTime(ticket.respondedAt)}
            </p>
          )}
        </section>
      ) : (
        <section className="rounded-lg bg-brand-surface border border-gray-100 dark:border-white/6 p-5">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-semibold">
            Sin respuesta todavía
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Nuestro equipo revisa cada solicitud en el orden en que llega. Te avisaremos por correo
            y en la app cuando tengamos una respuesta.
          </p>
        </section>
      )}

      {/* Meta */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-gray-100 dark:border-white/6 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Recibido</dt>
          <dd className="text-brand-text font-medium">{formatDateTime(ticket.filedAt)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Plazo máximo de respuesta</dt>
          <dd className="text-brand-text font-medium">{formatDateTime(ticket.slaDeadline)}</dd>
        </div>
        {ticket.loanId && (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Préstamo relacionado</dt>
            <dd className="text-brand-text font-mono text-xs break-all">{ticket.loanId}</dd>
          </div>
        )}
      </dl>
    </Card>
  )
}
