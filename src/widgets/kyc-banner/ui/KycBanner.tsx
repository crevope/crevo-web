import Link from 'next/link'
import { ShieldAlert, ArrowRight } from 'lucide-react'
import { getKycStatusMessage, type KycStatus } from '@/features/upload-kyc'

interface Props {
  kycStatus: Pick<KycStatus, 'status' | 'kycStatus' | 'providerStatus'>
}

export function KycBanner({ kycStatus }: Readonly<Props>) {
  const { title, description, canStart } = getKycStatusMessage(kycStatus)

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
      {/* Subtle glow */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-amber-500/5 to-transparent" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
          <ShieldAlert className="h-4.5 w-4.5 text-amber-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-200">{title}</p>
          <p className="text-xs text-amber-400/80 mt-0.5">{description}</p>
        </div>

        <Link
          href="/kyc"
          className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition-colors"
        >
          {canStart ? 'Verificar' : 'Ver estado'}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
