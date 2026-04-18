import Link from 'next/link'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import type { Loan } from '@/entities/loan'
import { LoanStatusBadge } from '@/entities/loan'
import { formatCurrency, formatDate } from '@/shared/lib/utils'

interface Props {
  loan: Loan
}

export function LoanCard({ loan }: Readonly<Props>) {
  const isOverdue = loan.status === 'OVERDUE'
  const isActive = loan.status === 'ACTIVE' || isOverdue

  return (
    <Link href={`/loans/${loan.id}`}>
      <div
        className={`group relative rounded-xl border bg-card p-5 transition-all duration-200
        hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20
        ${isOverdue ? 'border-destructive/30' : 'border-border/60'}
      `}
      >
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5 font-medium uppercase tracking-wide">
              Préstamo
            </p>
            <p
              className={`text-2xl font-bold ${isOverdue ? 'text-destructive' : 'text-foreground'}`}
            >
              {formatCurrency(loan.amount)}
            </p>
          </div>
          <LoanStatusBadge status={loan.status} />
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(loan.createdAt)}
          </span>
          {loan.dueDate && isActive && (
            <span
              className={`flex items-center gap-1.5 ${isOverdue ? 'text-destructive font-medium' : ''}`}
            >
              <Clock className="h-3.5 w-3.5" />
              Vence {formatDate(loan.dueDate)}
            </span>
          )}
        </div>

        {/* Arrow */}
        <div className="absolute right-5 bottom-5 flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
          Ver detalle
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Overdue glow indicator */}
        {isOverdue && (
          <span className="absolute top-3 left-3 h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
        )}
      </div>
    </Link>
  )
}
