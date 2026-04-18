export interface Notification {
  id: string
  title: string
  body: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}

export type NotificationType =
  | 'LOAN_APPROVED'
  | 'LOAN_REJECTED'
  | 'LOAN_DISBURSED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_REMINDER'
  | 'LOAN_OVERDUE'
  | 'LOAN_PAID'
  | 'KYC_VERIFIED'

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  LOAN_APPROVED: '✅',
  LOAN_REJECTED: '❌',
  LOAN_DISBURSED: '💸',
  PAYMENT_CONFIRMED: '💚',
  PAYMENT_REMINDER: '⏰',
  LOAN_OVERDUE: '🔴',
  LOAN_PAID: '🎉',
  KYC_VERIFIED: '🪪',
}
