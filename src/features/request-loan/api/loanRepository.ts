import { apiClient } from '@/shared/api/client'
import { TOKEN_KEY } from '@/shared/api/client'
import type { Loan, LoanBalance, Payment, Installment, EarlyPayoffQuote } from '@/entities/loan'

export interface SimulateDTO {
  amount: number
  productType: string
  paymentFrequency: string
  numInstallments: number
}

export interface SimulationResult {
  amount: number
  tea: number
  teaPercent: number
  tcea: number
  tceaPercent: number
  disbursementFee: number
  techFee: number
  maintenanceFee: number
  maintenanceFeeTotal: number
  igvAmount: number
  netDisbursed: number
  numInstallments: number
  installmentAmount: number
  totalInterest: number
  totalAmount: number
}

export const loanRepository = {
  async simulate(dto: SimulateDTO): Promise<SimulationResult> {
    const { data } = await apiClient.post('/loans/simulate', dto)
    return data.data
  },
  async requestLoan(dto: { amount: number; productType: string; paymentFrequency: string; numInstallments: number; bankAccountId?: string }): Promise<Loan> {
    const { data } = await apiClient.post('/loans', dto)
    return data.data
  },
  async getMyLoans(): Promise<Loan[]> {
    const { data } = await apiClient.get('/loans')
    return data.data
  },
  async getLoanById(loanId: string): Promise<Loan> {
    const { data } = await apiClient.get(`/loans/${loanId}`)
    return data.data
  },
  async getLoanBalance(loanId: string): Promise<LoanBalance> {
    const { data } = await apiClient.get(`/payments/balance/${loanId}`)
    return data.data
  },
  async getLoanPayments(loanId: string): Promise<Payment[]> {
    const { data } = await apiClient.get(`/payments/history/${loanId}`)
    return data.data
  },
  async getSchedule(loanId: string): Promise<Installment[]> {
    const { data } = await apiClient.get(`/loans/${loanId}/schedule`)
    return data.data
  },
  async signLoan(loanId: string): Promise<Loan> {
    const { data } = await apiClient.post(`/loans/${loanId}/sign`, { acceptedTerms: true })
    return data.data
  },
  async payLoan(loanId: string, dto: { amount: number; method: string; reference?: string }): Promise<Payment> {
    const { data } = await apiClient.post('/payments', { loanId, ...dto })
    return data.data
  },
  async partialPayment(loanId: string, dto: { amount: number; method: string; reference?: string }): Promise<Payment> {
    const { data } = await apiClient.post('/payments/partial', { loanId, ...dto })
    return data.data
  },
  async getEarlyPayoffQuote(loanId: string): Promise<EarlyPayoffQuote> {
    const { data } = await apiClient.get(`/payments/early-payoff/${loanId}`)
    return data.data
  },
  async earlyPayoff(dto: { loanId: string; method: string; reference?: string; culqiToken?: string }): Promise<Payment> {
    const { data } = await apiClient.post('/payments/early-payoff', dto)
    return data.data
  },
  async getContractUrl(loanId: string): Promise<string> {
    const { data } = await apiClient.get(`/loans/${loanId}/contract`)
    return data.data.url
  },
  async chargeCard(dto: { loanId: string; amount: number; culqiToken: string }): Promise<Payment> {
    const { data } = await apiClient.post('/payments/charge', dto)
    return data.data
  },
  async createCheckout(dto: { loanId: string; amount: number; paymentType: 'regular' | 'early_payoff'; gateway?: 'culqi' | 'izipay' }): Promise<{ checkoutUrl: string; paymentId: string; orderId: string; gateway: string; amount: number }> {
    const { data } = await apiClient.post('/payments/checkout', { ...dto, gateway: dto.gateway ?? 'culqi' })
    return data.data
  },
  async restructureLoan(loanId: string, newNumInstallments?: number): Promise<RestructureResult> {
    const { data } = await apiClient.post(`/loans/${loanId}/restructure`, { newNumInstallments })
    return data.data
  },
  async downloadReceipt(paymentId: string): Promise<void> {
    const token = localStorage.getItem(TOKEN_KEY)
    const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'
    const response = await fetch(`${baseURL}/payments/${paymentId}/receipt`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('No se pudo descargar el comprobante')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `comprobante-${paymentId.substring(0, 8)}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  },
}

export interface RestructureResult {
  loanId: string
  restructureCount: number
  newPrincipal: number
  newInstallmentAmount: number
  newNumInstallments: number
  newDueDate: string
  capitalizedDebt: number
  schedule: {
    installmentNumber: number
    dueDate: string
    amount: number
    principal: number
    interest: number
  }[]
  message: string
}
