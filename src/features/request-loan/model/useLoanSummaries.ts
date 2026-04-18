'use client'
import { useEffect, useState } from 'react'
import { loanRepository } from '../api/loanRepository'
import { isActiveLoan, type Loan, type LoanBalance, type Installment } from '@/entities/loan'

export interface LoanSummary {
  /** Live remaining principal + interest + mora, from `/payments/balance/:id`. */
  remaining: number
  /** The next unpaid installment (earliest PENDING or OVERDUE by dueDate). */
  nextInstallment?: {
    amount: number
    dueDate: string
    number: number
    status: Installment['status']
  }
  /** Null while this loan's summary is still loading; we render a skeleton. */
  loading: boolean
  /** Set when the summary request fails — we fall back to the loan's
   *  cached `amount` without blocking the whole list. */
  error: boolean
}

/**
 * Fetches live balance + schedule summaries for every ACTIVE loan in the
 * input list, in parallel.
 *
 * The `/loans` list endpoint only returns static fields (amount, term, due
 * date) — it doesn't include the live outstanding balance (which changes
 * every time a payment clears) or the next installment (which requires the
 * full schedule). To avoid a chatty per-loan n+1 on the backend we fetch
 * these in parallel from the two existing endpoints and surface a summary
 * map keyed by loan id. Each loan's loading + error state is independent so
 * a single slow request doesn't freeze the whole list view.
 *
 * We deliberately skip closed loans (PAID/CANCELLED/REJECTED) to cut the
 * request fan-out in half on accounts with long history — the remaining
 * balance there is definitionally zero and the installments are all paid.
 */
export function useLoanSummaries(loans: Loan[]): Record<string, LoanSummary> {
  const [summaries, setSummaries] = useState<Record<string, LoanSummary>>({})

  // Stable key to detect list changes — loan ids are sufficient because the
  // summary of a given loan doesn't depend on the other loans in the list.
  const activeLoanIds = loans
    .filter(isActiveLoan)
    .map((l) => l.id)
    .sort()
    .join(',')

  useEffect(() => {
    if (!activeLoanIds) {
      setSummaries({})
      return
    }

    const ids = activeLoanIds.split(',')
    let cancelled = false

    // Seed the state so the UI can show per-loan skeletons immediately.
    setSummaries((prev) => {
      const next: Record<string, LoanSummary> = { ...prev }
      for (const id of ids) {
        if (!next[id]) next[id] = { remaining: 0, loading: true, error: false }
      }
      return next
    })

    async function loadOne(id: string) {
      try {
        // Balance + schedule in parallel — they share no data so there's no
        // point serializing. `allSettled` on the OUTER Promise.all would
        // hide rejections; instead each loan's fetch is its own Promise
        // and we downgrade both to a single-loan failure.
        const [balance, schedule] = await Promise.all([
          loanRepository.getLoanBalance(id),
          loanRepository.getSchedule(id).catch(() => [] as Installment[]),
        ])
        if (cancelled) return
        const next = findNextInstallment(schedule)
        setSummaries((prev) => ({
          ...prev,
          [id]: {
            remaining: balance.remaining,
            nextInstallment: next,
            loading: false,
            error: false,
          },
        }))
      } catch {
        if (cancelled) return
        setSummaries((prev) => ({
          ...prev,
          [id]: { remaining: 0, loading: false, error: true },
        }))
      }
    }

    for (const id of ids) void loadOne(id)

    return () => {
      cancelled = true
    }
  }, [activeLoanIds])

  return summaries
}

function findNextInstallment(schedule: Installment[]): LoanSummary['nextInstallment'] {
  // OVERDUE trumps PENDING — showing an overdue installment as "next" is
  // more actionable for the borrower than pointing at the next on-schedule
  // payment when there's already one behind.
  const unpaid = schedule
    .filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE')
    .sort((a, b) => {
      if (a.status === 'OVERDUE' && b.status !== 'OVERDUE') return -1
      if (b.status === 'OVERDUE' && a.status !== 'OVERDUE') return 1
      return a.dueDate.localeCompare(b.dueDate)
    })
  const first = unpaid[0]
  if (!first) return undefined
  return {
    amount: first.amount - first.paidAmount,
    dueDate: first.dueDate,
    number: first.installmentNumber,
    status: first.status,
  }
}
