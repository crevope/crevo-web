import type { Loan, LoanStatus } from '../model/types'

export const canPay = (loan: Loan | LoanStatus) => {
  const status = typeof loan === 'string' ? loan : loan.status
  return ['ACTIVE', 'OVERDUE'].includes(status)
}

export const canSign = (loan: Loan | LoanStatus) => {
  const status = typeof loan === 'string' ? loan : loan.status
  return status === 'APPROVED'
}

export const isActiveLoan = (loan: Loan | LoanStatus) => {
  const status = typeof loan === 'string' ? loan : loan.status
  return ['APPROVED', 'SIGNED', 'DISBURSED', 'ACTIVE', 'OVERDUE'].includes(status)
}
