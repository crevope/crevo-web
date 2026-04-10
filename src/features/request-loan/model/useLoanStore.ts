import { create } from 'zustand'
import { loanRepository } from '../api/loanRepository'
import type { Loan, LoanBalance, Payment, Installment, EarlyPayoffQuote } from '@/entities/loan'

interface LoanState {
  loans: Loan[]
  activeLoan: Loan | null
  selectedLoan: Loan | null
  balance: LoanBalance | null
  payments: Payment[]
  installments: Installment[]
  earlyPayoffQuote: EarlyPayoffQuote | null
  isLoading: boolean
  loadMyLoans: () => Promise<void>
  loadLoanDetails: (loanId: string) => Promise<void>
  loadEarlyPayoffQuote: (loanId: string) => Promise<void>
  requestLoan: (dto: { amount: number; productType: string; paymentFrequency: string; numInstallments: number; bankAccountId?: string }) => Promise<Loan>
  signLoan: (loanId: string) => Promise<void>
  payLoan: (loanId: string, dto: { amount: number; method: string; reference?: string }) => Promise<void>
  partialPayLoan: (loanId: string, dto: { amount: number; method: string; reference?: string }) => Promise<void>
  earlyPayoff: (loanId: string, dto: { method: string; reference?: string }) => Promise<void>
}

export const useLoanStore = create<LoanState>((set, get) => ({
  loans: [],
  activeLoan: null,
  selectedLoan: null,
  balance: null,
  payments: [],
  installments: [],
  earlyPayoffQuote: null,
  isLoading: false,

  loadMyLoans: async () => {
    set({ isLoading: true })
    try {
      const loans = await loanRepository.getMyLoans()
      const activeLoan = loans.find(l => ['APPROVED', 'SIGNED', 'ACTIVE', 'OVERDUE'].includes(l.status)) ?? null
      set({ loans, activeLoan })
    } finally {
      set({ isLoading: false })
    }
  },

  loadLoanDetails: async (loanId) => {
    set({ isLoading: true })
    try {
      const [loan, balance, payments] = await Promise.all([
        loanRepository.getLoanById(loanId),
        loanRepository.getLoanBalance(loanId),
        loanRepository.getLoanPayments(loanId),
      ])
      let installments: Installment[] = []
      if (['ACTIVE', 'OVERDUE', 'DISBURSED'].includes(loan.status)) {
        installments = await loanRepository.getSchedule(loanId).catch(() => [])
      }
      set({ selectedLoan: loan, balance, payments, installments })
    } finally {
      set({ isLoading: false })
    }
  },

  loadEarlyPayoffQuote: async (loanId) => {
    try {
      const quote = await loanRepository.getEarlyPayoffQuote(loanId)
      set({ earlyPayoffQuote: quote })
    } catch {
      set({ earlyPayoffQuote: null })
    }
  },

  requestLoan: async (dto: { amount: number; productType: string; paymentFrequency: string; numInstallments: number; bankAccountId?: string }) => {
    const loan = await loanRepository.requestLoan(dto)
    await get().loadMyLoans()
    return loan
  },

  signLoan: async (loanId) => {
    await loanRepository.signLoan(loanId)
    await get().loadMyLoans()
  },

  payLoan: async (loanId, dto) => {
    await loanRepository.payLoan(loanId, dto)
    await get().loadLoanDetails(loanId)
    await get().loadMyLoans()
  },

  partialPayLoan: async (loanId, dto) => {
    await loanRepository.partialPayment(loanId, dto)
    await get().loadLoanDetails(loanId)
    await get().loadMyLoans()
  },

  earlyPayoff: async (loanId, dto) => {
    await loanRepository.earlyPayoff({ loanId, ...dto })
    set({ earlyPayoffQuote: null })
    await get().loadLoanDetails(loanId)
    await get().loadMyLoans()
  },
}))
