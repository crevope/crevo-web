export const LOAN_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente', APPROVED: 'Aprobado', REJECTED: 'Rechazado',
  SIGNED: 'Firmado', DISBURSED: 'Desembolsado', ACTIVE: 'Activo',
  OVERDUE: 'En mora', PAID: 'Pagado', CANCELLED: 'Cancelado',
}

export const PAYMENT_METHODS = [
  { value: 'CARD', label: 'Tarjeta', icon: '💳' },
  { value: 'YAPE', label: 'Yape', icon: '📱' },
  { value: 'PLIN', label: 'Plin', icon: '📲' },
  { value: 'BANK_TRANSFER', label: 'Transferencia', icon: '🏦' },
  { value: 'CASH', label: 'Efectivo', icon: '💵' },
] as const

export const TOKEN_KEY = 'crevo_token'

export const CURRENT_YEAR = new Date().getFullYear()
