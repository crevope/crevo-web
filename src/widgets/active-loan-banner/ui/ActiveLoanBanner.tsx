import Link from 'next/link'
import { TrendingUp, AlertTriangle } from 'lucide-react'
import type { Loan } from '@/entities/loan'
import { Button } from '@/shared/ui/button'
import { formatCurrency, formatDate } from '@/shared/lib/utils'

interface Props {
  loan: Loan
}

export function ActiveLoanBanner({ loan }: Readonly<Props>) {
  const isOverdue = loan.status === 'OVERDUE'

  return (
    <div
      className={`rounded-lg border p-4 flex items-start gap-3
      ${
        isOverdue
          ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
          : 'border-primary/20 bg-primary/5'
      }`}
    >
      {isOverdue ? (
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
      ) : (
        <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium text-sm ${isOverdue ? 'text-red-800 dark:text-red-200' : 'text-foreground'}`}
        >
          {isOverdue ? 'Préstamo vencido' : 'Préstamo activo'}
        </p>
        <p
          className={`text-sm mt-0.5 ${isOverdue ? 'text-red-700 dark:text-red-300' : 'text-muted-foreground'}`}
        >
          {formatCurrency(loan.amount)}
          {loan.dueDate && ` · Vence ${formatDate(loan.dueDate)}`}
        </p>
      </div>
      <Button
        asChild
        size="sm"
        variant={isOverdue ? 'destructive' : 'default'}
        className="shrink-0"
      >
        <Link href={`/loans/${loan.id}`}>Ver préstamo</Link>
      </Button>
    </div>
  )
}
