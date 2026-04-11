export interface Loan {
  id: string
  userId: string
  amount: number
  // ── Comisiones ─────────────────────────────────────────────────────────────
  disbursementFee: number      // comisión de desembolso — se descuenta del monto recibido
  techFee: number              // comisión de tecnología — ítem separado
  maintenanceFee: number       // comisión de mantenimiento por cuota
  maintenanceFeeTotal: number  // maintenanceFee × numInstallments
  igvAmount: number            // IGV 18% sobre comisiones
  netDisbursed: number         // monto que recibe el cliente (amount - disbursementFee)
  // ── Totales ────────────────────────────────────────────────────────────────
  totalInterest: number
  totalAmount: number
  currency: string
  // ── Producto ───────────────────────────────────────────────────────────────
  termDays: number
  numInstallments: number
  installmentAmount: number
  interestRate: number
  tcea: number
  tier: string
  status: LoanStatus
  restructureCount: number
  dueDate?: string
  contractUrl?: string
  summaryUrl?: string
  scheduleUrl?: string
  rejectionReason?: string
  disbursedAt?: string
  createdAt: string
  updatedAt: string
}

export type LoanStatus =
  | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SIGNED'
  | 'DISBURSED' | 'ACTIVE' | 'OVERDUE' | 'PAID' | 'CANCELLED'

export interface LoanBalance {
  loanId: string
  totalAmount: number
  totalPaid: number
  remaining: number
  isFullyPaid: boolean
  currency: string
  dueDate?: string
  isOverdue: boolean
  moraLevel: number
  moraAccrued: number
  collectionFeesAccrued: number
  daysOverdue: number
}

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED'

export interface Payment {
  id: string
  loanId: string
  amount: number
  currency: string
  method: string
  status: PaymentStatus
  reference?: string
  paidAt: string
}

export type InstallmentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'RESTRUCTURED'

export interface Installment {
  id: string
  loanId: string
  installmentNumber: number
  dueDate: string
  principal: number
  interest: number
  amount: number
  paidAmount: number
  status: InstallmentStatus
  paymentId?: string  // ID del pago que cubrió esta cuota (disponible si status === 'PAID')
}

export interface ProductLimitInfo {
  minAmount: number
  maxAmount: number
  available: boolean
  requiredPaidLoans?: number
}

export interface LoanLimits {
  tier: string | null
  score: number | null
  paidLoansCount: number
  limits: {
    EXPRESS: ProductLimitInfo
    FLEX: ProductLimitInfo
    PLUS: ProductLimitInfo
  }
}

export interface EarlyPayoffQuote {
  loanId: string
  // Desglose
  outstandingPrincipal: number
  accruedInterest: number
  accruedMaintenanceFee: number
  moraAccrued: number
  collectionFeesAccrued: number
  daysElapsed: number
  // Totales
  payoffAmount: number
  interestSaved: number
  originalTotal: number
  currency: string
  installmentsRemaining: number
}
