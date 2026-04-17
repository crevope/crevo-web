'use client'
import { Clock } from 'lucide-react'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Card } from '@/shared/ui/card'
import type { PublicComplaintView } from '../api/complaintsRepository'
import {
  CLAIM_TYPE_LABELS,
  COMPLAINT_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  PRODUCT_TYPE_LABELS,
} from '../lib/complaintsConstants'

interface Props {
  complaint: PublicComplaintView
}

const labelCls = 'text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1'
const valueCls = 'text-sm text-brand-text'

const fmtDate = (iso: string | undefined) =>
  iso
    ? new Date(iso).toLocaleString('es-PE', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'America/Lima',
    })
    : '—'

const fmtSoles = (amount?: number) =>
  amount === undefined || amount === null
    ? '—'
    : `S/ ${amount.toFixed(2)}`

/**
 * Renders the full, public-safe view of a complaint. Reused by the public
 * consulta page and the "my-complaints" list — any PII that only the backend
 * should know (IP, user-agent, responder UUID) is intentionally absent from
 * the data type itself, so we cannot accidentally leak it here.
 */
export function ComplaintDetailCard({ complaint }: Props) {
  const isClosed = complaint.status === 'CLOSED'

  return (
    <Card className="bg-brand-card rounded-lg border-gray-100 dark:border-white/6 overflow-hidden shadow-none p-0 gap-0">
      <article>

        {/* Header: code + status — navy in light / gold in dark keeps the code
             as the strongest visual anchor under the active theme. */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-6 sm:p-8 border-b border-gray-100 dark:border-white/5">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Código de reclamo</p>
            <code className="font-mono text-lg sm:text-xl font-bold text-brand-primary dark:text-brand-secondary tracking-wider">
              {complaint.claimCode}
            </code>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={complaint.status} />
            <ClaimTypeBadge claimType={complaint.claimType} />
          </div>
        </header>

        {/* Consumer summary */}
        <section className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-semibold text-brand-text mb-4 uppercase tracking-wider">
            Consumidor
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className={labelCls}>Nombre completo</dt>
              <dd className={valueCls}>{complaint.consumerFirstName} {complaint.consumerLastName}</dd>
            </div>
            <div>
              <dt className={labelCls}>Documento</dt>
              <dd className={valueCls}>
                {DOCUMENT_TYPE_LABELS[complaint.consumerDocumentType]} {complaint.consumerDocumentNumber}
              </dd>
            </div>
          </dl>
        </section>

        {/* Product / service */}
        <section className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-semibold text-brand-text mb-4 uppercase tracking-wider">
            Producto o servicio
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className={labelCls}>Tipo</dt>
              <dd className={valueCls}>{PRODUCT_TYPE_LABELS[complaint.productType]}</dd>
            </div>
            <div>
              <dt className={labelCls}>Monto reclamado</dt>
              <dd className={valueCls}>{fmtSoles(complaint.claimedAmount)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className={labelCls}>Descripción</dt>
              <dd className={valueCls}>{complaint.productDescription}</dd>
            </div>
          </dl>
        </section>

        {/* Claim body */}
        <section className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-semibold text-brand-text mb-4 uppercase tracking-wider">
            {CLAIM_TYPE_LABELS[complaint.claimType]}
          </h3>
          <dl className="space-y-4">
            <div>
              <dt className={labelCls}>Detalle</dt>
              <dd className="text-sm text-brand-text whitespace-pre-wrap leading-relaxed">
                {complaint.claimDetail}
              </dd>
            </div>
            <div>
              <dt className={labelCls}>Pedido del consumidor</dt>
              <dd className="text-sm text-brand-text whitespace-pre-wrap leading-relaxed">
                {complaint.consumerRequest}
              </dd>
            </div>
          </dl>
        </section>

        {/* Timing */}
        <section className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-semibold text-brand-text mb-4 uppercase tracking-wider">
            Fechas
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className={labelCls}>Presentado</dt>
              <dd className={valueCls}>{fmtDate(complaint.filedAt)}</dd>
            </div>
            <div>
              <dt className={labelCls}>Plazo máximo de respuesta</dt>
              <dd className={valueCls}>{fmtDate(complaint.slaDeadline)}</dd>
            </div>
            {complaint.respondedAt && (
              <div>
                <dt className={labelCls}>Respondido</dt>
                <dd className={valueCls}>{fmtDate(complaint.respondedAt)}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Provider response */}
        <section className={`p-6 sm:p-8 ${isClosed ? 'bg-brand-surface' : ''}`}>
          <h3 className="text-sm font-semibold text-brand-text mb-4 uppercase tracking-wider">
            Respuesta de Crevo
          </h3>
          {isClosed && complaint.responseText ? (
            <p className="text-sm text-brand-text whitespace-pre-wrap leading-relaxed">
              {complaint.responseText}
            </p>
          ) : (
            <Alert className="bg-[#FEF3C7] dark:bg-[#78350F]/30 border-[#FDE68A] dark:border-[#F59E0B]/30 text-[#78350F] dark:text-[#FCD34D]">
              <Clock className="h-4 w-4 text-[#B45309] dark:text-[#FBBF24]" aria-hidden="true" />
              <AlertDescription className="text-[#78350F] dark:text-[#FCD34D]">
                Tu reclamo está en trámite. Te responderemos por correo antes del{' '}
                <strong>
                  {new Date(complaint.slaDeadline).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}
                </strong>
                .
              </AlertDescription>
            </Alert>
          )}
        </section>
      </article>
    </Card>
  )
}

// ─── Status badges ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PublicComplaintView['status'] }) {
  const isClosed = status === 'CLOSED'
  return (
    <Badge
      className={`gap-1.5 ${isClosed
          ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
        }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isClosed ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
      {COMPLAINT_STATUS_LABELS[status]}
    </Badge>
  )
}

function ClaimTypeBadge({ claimType }: { claimType: PublicComplaintView['claimType'] }) {
  return (
    <Badge className="bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/5 dark:bg-white/10 dark:text-brand-text">
      {CLAIM_TYPE_LABELS[claimType]}
    </Badge>
  )
}
