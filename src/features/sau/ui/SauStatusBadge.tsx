import type { SauStatus } from '../model/types'
import { SAU_STATUS_LABELS } from '../lib/sauConstants'

const styles: Record<SauStatus, string> = {
  OPEN: 'bg-[#00E5FF]/10 text-cyan-700 dark:text-[#00E5FF] border-[#00E5FF]/30',
  IN_REVIEW: 'bg-[#D4AF37]/10 text-yellow-700 dark:text-[#D4AF37] border-[#D4AF37]/30',
  RESPONDED:
    'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700/50',
  CLOSED:
    'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10',
}

export function SauStatusBadge({ status }: Readonly<{ status: SauStatus }>) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${styles[status]}`}
    >
      {SAU_STATUS_LABELS[status]}
    </span>
  )
}
