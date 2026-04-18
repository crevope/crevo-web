import { LOAN_STATUS_LABELS } from '@/shared/lib/constants'
import type { LoanStatus } from '../model/types'

const STATUS_CLASSES: Record<LoanStatus, string> = {
  PENDING: 'bg-muted/60 text-muted-foreground border border-border',
  APPROVED: 'bg-accent/10 text-accent border border-accent/30',
  REJECTED: 'bg-destructive/10 text-destructive border border-destructive/30',
  SIGNED: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
  DISBURSED: 'bg-accent/10 text-accent border border-accent/30',
  ACTIVE: 'bg-primary/10 text-primary border border-primary/30',
  OVERDUE: 'bg-destructive/15 text-destructive border border-destructive/40',
  PAID: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  CANCELLED: 'bg-muted/40 text-muted-foreground border border-border',
}

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${STATUS_CLASSES[status] ?? STATUS_CLASSES.CANCELLED}`}
    >
      {LOAN_STATUS_LABELS[status] ?? status}
    </span>
  )
}
