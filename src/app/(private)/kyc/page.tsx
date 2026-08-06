'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  Loader2,
  RefreshCw,
  IdCard,
  ShieldCheck,
  HandCoins,
  Home,
  Clock,
  Check,
  CircleX,
  Lock,
  ArrowRight,
} from 'lucide-react'
import {
  kycRepository,
  getKycStatusMessage,
  type KycStatus,
  type KycProviderStatus,
} from '@/features/upload-kyc'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'

// Didit returns here once the borrower finishes; the webhook may still be in flight.
const RETURN_POLL_INTERVAL_MS = 3000
const RETURN_POLL_ATTEMPTS = 10

// Terminal provider states. Listed as what IS settled, not what isn't — `Not
// Started`/`In Progress` are where a fresh verification starts, not a stop condition.
const SETTLED_PROVIDER_STATUSES: readonly KycProviderStatus[] = [
  'Approved',
  'Declined',
  'In Review',
  'Abandoned',
  'Expired',
  'Kyc Expired',
]

function KycVerified() {
  return (
    <div className={`${cardCls} p-10 text-center`}>
      <div className="w-24 h-24 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
        <ShieldCheck className="h-10 w-10 text-green-500" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-3 tracking-tight">
        ¡Identidad Verificada!
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
        Tu cuenta está completamente verificada. Ya puedes solicitar préstamos de hasta S/ 2,000.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/request-loan"
          className="bg-[#D4AF37] text-[#0A192F] font-semibold px-8 py-3 rounded-lg hover:bg-[#B8941F] transition-colors flex items-center justify-center gap-2"
        >
          <HandCoins className="h-4 w-4" aria-hidden="true" />
          Solicitar préstamo
        </a>
        <a
          href="/dashboard"
          className="bg-white dark:bg-[#0F172A] text-[#0A192F] dark:text-gray-200 font-medium px-8 py-3 rounded-lg border border-gray-100 dark:border-white/6 hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors flex items-center justify-center gap-2"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Ir al dashboard
        </a>
      </div>
    </div>
  )
}

function KycWaiting({
  title,
  description,
  onRefresh,
}: Readonly<{ title: string; description: string; onRefresh: () => void }>) {
  return (
    <div className={`${cardCls} p-8 text-center`}>
      <div className="w-20 h-20 rounded-full bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-5">
        <Clock className="h-9 w-9 text-yellow-500" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-2 tracking-tight">
        {title}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
        {description}
      </p>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-lg border border-gray-100 dark:border-white/6 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Verificar estado
      </button>
    </div>
  )
}

function KycStartAction({
  title,
  description,
  tone,
  isStarting,
  onStart,
}: Readonly<{
  title: string
  description: string
  tone: 'neutral' | 'danger'
  isStarting: boolean
  onStart: () => void
}>) {
  const isDanger = tone === 'danger'
  return (
    <div className={`${cardCls} p-8 text-center ${isDanger ? 'border-l-2 border-l-red-400' : ''}`}>
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
          isDanger ? 'bg-red-50 dark:bg-red-900/30' : 'bg-[#D4AF37]/10'
        }`}
      >
        {isDanger ? (
          <CircleX className="h-9 w-9 text-red-500" aria-hidden="true" />
        ) : (
          <IdCard className="h-9 w-9 text-[#D4AF37]" aria-hidden="true" />
        )}
      </div>
      <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-2 tracking-tight">
        {title}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
        {description}
      </p>
      <button
        onClick={onStart}
        disabled={isStarting}
        className="w-full max-w-xs mx-auto bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isStarting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirigiendo...
          </>
        ) : (
          <>
            Iniciar verificación
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>
      <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
        <Lock className="inline h-3 w-3 mr-1" aria-hidden="true" />
        Te llevaremos a una plataforma segura para completar la verificación
      </p>
    </div>
  )
}

function KycPolling() {
  return (
    <div className={`${cardCls} p-8 text-center`}>
      <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-5">
        <Loader2 className="h-9 w-9 text-[#D4AF37] animate-spin" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-2 tracking-tight">
        Estamos procesando tu verificación
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
        Esto puede tomar unos segundos.
      </p>
    </div>
  )
}

function KycPageContent() {
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  const searchParams = useSearchParams()
  // `verificationSessionId` marks a return from Didit; its `status` is user-controlled, never trusted.
  const isReturningFromProvider = !!searchParams.get('verificationSessionId')
  const [isWaitingForWebhook, setIsWaitingForWebhook] = useState(isReturningFromProvider)

  const loadStatus = () => {
    kycRepository
      .getStatus()
      .then(setKycStatus)
      .catch(() => setKycStatus({ status: 'PENDING_VERIFICATION', isIdentityVerified: false }))
  }

  useEffect(() => {
    loadStatus()
  }, [])

  useEffect(() => {
    if (!isReturningFromProvider) return

    let attempts = 0
    let cancelled = false

    const tick = async () => {
      attempts += 1
      try {
        const fresh = await kycRepository.getStatus()
        if (cancelled) return
        setKycStatus(fresh)
        const settled =
          fresh.isIdentityVerified ||
          (fresh.providerStatus !== undefined &&
            SETTLED_PROVIDER_STATUSES.includes(fresh.providerStatus))
        if (settled || attempts >= RETURN_POLL_ATTEMPTS) {
          setIsWaitingForWebhook(false)
          return
        }
      } catch {
        if (attempts >= RETURN_POLL_ATTEMPTS) {
          setIsWaitingForWebhook(false)
          return
        }
      }
      if (!cancelled) handle = setTimeout(tick, RETURN_POLL_INTERVAL_MS)
    }

    let handle = setTimeout(tick, RETURN_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [isReturningFromProvider])

  const handleStartVerification = async () => {
    setIsStarting(true)
    try {
      const { sessionUrl } = await kycRepository.createSession()
      window.location.href = sessionUrl
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'No pudimos iniciar la verificación')
      setIsStarting(false)
    }
  }

  if (!kycStatus) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0A192F] dark:text-[#D4AF37]" />
      </div>
    )
  }

  const message = getKycStatusMessage(kycStatus)
  const isDeclined = kycStatus.providerStatus === 'Declined' || kycStatus.status === 'KYC_REJECTED'
  const needsAction = !kycStatus.isIdentityVerified && message.canStart
  const isWaiting = !kycStatus.isIdentityVerified && !message.canStart

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-1 tracking-tight">
          Verificación de Identidad
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Requerida para solicitar préstamos en Crevo
        </p>
      </div>

      {/* Progress indicator */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { step: 1, label: 'Inicia verificación', done: !needsAction, active: needsAction },
          { step: 2, label: 'En revisión', done: kycStatus.isIdentityVerified, active: isWaiting },
          { step: 3, label: 'Verificado', done: kycStatus.isIdentityVerified, active: false },
        ].map((s) => (
          <div
            key={s.step}
            className={`p-4 rounded-lg text-center border transition-colors ${
              s.done
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50'
                : s.active
                  ? 'bg-[#D4AF37]/10 dark:bg-[#D4AF37]/10 border-[#D4AF37]/30'
                  : 'bg-gray-50 dark:bg-[#0F172A] border-gray-100 dark:border-white/6'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold ${
                s.done
                  ? 'bg-green-500 text-white'
                  : s.active
                    ? 'bg-[#D4AF37] text-[#0A192F]'
                    : 'bg-gray-200 dark:bg-[#334155] text-gray-500 dark:text-gray-400'
              }`}
            >
              {s.done ? <Check className="h-3 w-3" aria-hidden="true" /> : s.step}
            </div>
            <p
              className={`text-xs font-medium ${s.done ? 'text-green-700 dark:text-green-400' : s.active ? 'text-[#0A192F] dark:text-[#D4AF37]' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Status views */}
      {isWaitingForWebhook ? (
        <KycPolling />
      ) : (
        <>
          {kycStatus.isIdentityVerified && <KycVerified />}
          {isWaiting && (
            <KycWaiting
              title={message.title}
              description={message.description}
              onRefresh={loadStatus}
            />
          )}
          {needsAction && (
            <KycStartAction
              title={message.title}
              description={message.description}
              tone={isDeclined ? 'danger' : 'neutral'}
              isStarting={isStarting}
              onStart={handleStartVerification}
            />
          )}
        </>
      )}
    </div>
  )
}

export default function KycPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-[#0A192F] dark:text-[#D4AF37]" />
        </div>
      }
    >
      <KycPageContent />
    </Suspense>
  )
}
