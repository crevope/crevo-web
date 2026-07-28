'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Loader2,
  Mail,
  IdCard,
  HandCoins,
  Bell,
  Plus,
  ShieldCheck,
  Rocket,
  Check,
  CircleCheck,
  Send,
  Wallet,
  ArrowRight,
  Calendar,
  FileSignature,
  GraduationCap,
  Lightbulb,
  LineChart,
  PiggyBank,
  FolderOpen,
  Headphones,
  ArrowLeftRight,
  Clock,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { authRepository } from '@/features/auth'
import { useLoanStore } from '@/features/request-loan'
import { useNotificationStore } from '@/features/notifications'
import { kycRepository } from '@/features/upload-kyc'
import { formatCurrency, formatDate, loanRef } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'

const ONBOARDING_STEPS = [
  {
    id: 'email' as const,
    icon: Mail,
    title: 'Verifica tu email',
    desc: 'Confirma tu correo para activar tu cuenta.',
  },
  {
    id: 'kyc' as const,
    icon: IdCard,
    title: 'Verifica tu identidad',
    desc: 'DNI + selfie. Menos de 2 minutos.',
  },
  {
    id: 'loan' as const,
    icon: HandCoins,
    title: 'Solicita tu primer préstamo',
    desc: 'Hasta S/ 2,000 con aprobación en minutos.',
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { loans, activeLoan, isLoading, loadMyLoans } = useLoanStore()
  const { unreadCount, load: loadNotifications } = useNotificationStore()
  const [kycApproved, setKycApproved] = useState(false)
  const [kycLoading, setKycLoading] = useState(true)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  useEffect(() => {
    loadMyLoans()
    loadNotifications()
    kycRepository
      .getStatus()
      .then((s) => setKycApproved(s.isIdentityVerified))
      .catch(() => {})
      .finally(() => setKycLoading(false))
  }, [loadMyLoans, loadNotifications])

  const activeLoans = loans.filter((l) =>
    ['APPROVED', 'SIGNED', 'ACTIVE', 'OVERDUE'].includes(l.status),
  )
  const pendingLoans = loans.filter((l) => l.status === 'PENDING')
  const recentActivity = loans.slice(0, 3)

  const emailVerified = user?.emailVerified ?? false
  const hasLoan = loans.length > 0
  const completedSteps = [emailVerified, kycApproved, hasLoan].filter(Boolean).length
  const allStepsComplete = emailVerified && kycApproved && hasLoan
  const activeStepId = !emailVerified ? 'email' : !kycApproved ? 'kyc' : !hasLoan ? 'loan' : null

  const handleResendEmail = async () => {
    if (!user?.email) return
    setResendLoading(true)
    try {
      await authRepository.resendVerification(user.email)
      setResendSent(true)
    } catch {
      toast.error('No se pudo enviar el correo. Intenta de nuevo.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-1 tracking-tight">
            Resumen de tu cuenta
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Aquí tienes el estado actual de tus finanzas y préstamos en Soles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors relative"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#1E293B]" />
            )}
          </Link>
          {kycApproved && !activeLoan && (
            <Link
              href="/request-loan"
              className="bg-[#D4AF37] text-[#0A192F] font-medium px-6 py-2 rounded-lg cursor-pointer flex items-center gap-2 hover:bg-[#B8941F] transition-colors"
            >
              <Plus className="h-3 w-3" aria-hidden="true" /> Nuevo Préstamo
            </Link>
          )}
        </div>
      </div>

      {/* Banners + Onboarding */}
      {kycLoading || isLoading ? (
        <div className="space-y-4">
          <div
            className={`${cardCls} p-4 flex items-center justify-between border-l-2 border-l-gray-200 dark:border-l-white/10`}
          >
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-3 w-72" />
              </div>
            </div>
            <Skeleton className="h-4 w-20 shrink-0" />
          </div>
          <div className={`${cardCls} p-6`}>
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-7 w-24 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Security Banner */}
          <div
            className={`${cardCls} p-4 flex items-center justify-between border-l-2 border-l-[#00E5FF]`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF]">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-[#0A192F] dark:text-white font-medium text-sm">
                  Protección de cuenta activada
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  Tu información financiera está protegida con cifrado AES-256 de nivel bancario.
                </p>
              </div>
            </div>
            <Link
              href="/security-info"
              className="text-sm text-[#00E5FF] font-medium hover:text-[#0A192F] dark:hover:text-[#D4AF37] transition-colors shrink-0 whitespace-nowrap"
            >
              Ver detalles
            </Link>
          </div>

          {/* Onboarding Stepper */}
          {!allStepsComplete && (
            <div className={`${cardCls} p-6`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center">
                    <Rocket className="h-4 w-4 text-[#00E5FF]" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#0A192F] dark:text-white">
                      Primeros pasos
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {completedSteps} de 3 completados
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-28 h-1.5 bg-gray-100 dark:bg-[#0F172A] rounded-full overflow-hidden">
                    <div
                      className="h-1.5 bg-[#00E5FF] rounded-full transition-all duration-500"
                      style={{ width: `${(completedSteps / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                    {Math.round((completedSteps / 3) * 100)}%
                  </span>
                </div>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative">
                {/* Connector line (desktop) */}
                <div className="hidden sm:block absolute top-5 left-[calc(33.33%-12px)] right-[calc(33.33%-12px)] h-px bg-gray-100 dark:bg-white/6 z-0" />

                {ONBOARDING_STEPS.map((step) => {
                  const isComplete =
                    step.id === 'email' ? emailVerified : step.id === 'kyc' ? kycApproved : hasLoan
                  const isActive = step.id === activeStepId

                  return (
                    <div
                      key={step.id}
                      className={`relative z-10 flex flex-col items-center text-center gap-2.5 p-4 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#00E5FF]/5 dark:bg-[#00E5FF]/5 border border-[#00E5FF]/20'
                          : ''
                      }`}
                    >
                      {/* Circle */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ring-4 transition-all ${
                          isComplete
                            ? 'bg-green-500 text-white ring-green-100 dark:ring-green-900/30'
                            : isActive
                              ? 'bg-[#00E5FF] text-[#0A192F] ring-[#00E5FF]/20'
                              : 'bg-gray-100 dark:bg-[#0F172A] text-gray-400 dark:text-gray-500 ring-transparent'
                        }`}
                      >
                        {isComplete ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          (() => {
                            const StepIcon = step.icon
                            return <StepIcon className="h-4 w-4" aria-hidden="true" />
                          })()
                        )}
                      </div>

                      {/* Label */}
                      <div>
                        <p
                          className={`text-sm font-semibold leading-tight ${
                            isComplete
                              ? 'text-green-600 dark:text-green-400'
                              : isActive
                                ? 'text-[#0A192F] dark:text-white'
                                : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {step.title}
                        </p>
                        <p
                          className={`text-xs mt-0.5 leading-relaxed ${
                            isActive
                              ? 'text-gray-500 dark:text-gray-400'
                              : 'text-gray-400 dark:text-gray-600'
                          }`}
                        >
                          {step.desc}
                        </p>
                      </div>

                      {/* CTA */}
                      {isComplete && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CircleCheck className="h-2.5 w-2.5" aria-hidden="true" />
                          Completado
                        </span>
                      )}

                      {isActive &&
                        step.id === 'email' &&
                        (resendSent ? (
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <CircleCheck className="h-2.5 w-2.5" aria-hidden="true" />
                            Correo enviado — revisa tu bandeja
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={resendLoading}
                            onClick={handleResendEmail}
                            className="text-xs font-semibold bg-[#0A192F] dark:bg-[#00E5FF] text-white dark:text-[#0A192F] px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {resendLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Send className="h-2.5 w-2.5" aria-hidden="true" />
                            )}
                            Reenviar correo
                          </button>
                        ))}

                      {isActive && step.id === 'kyc' && (
                        <Link
                          href="/kyc"
                          className="text-xs font-semibold bg-[#0A192F] dark:bg-[#00E5FF] text-white dark:text-[#0A192F] px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Verificar ahora
                        </Link>
                      )}

                      {isActive && step.id === 'loan' && (
                        <Link
                          href="/request-loan"
                          className="text-xs font-semibold bg-[#D4AF37] text-[#0A192F] px-4 py-1.5 rounded-lg hover:bg-[#B8941F] transition-colors"
                        >
                          Solicitar préstamo
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hero card — total pending balance */}
        <div
          className="col-span-1 md:col-span-2 lg:col-span-1 rounded-lg p-8 relative overflow-hidden shadow-xl"
          style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1A365D 100%)' }}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#00E5FF]/20 rounded-full blur-2xl" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-xl" />
          <div className="relative z-10 flex flex-col h-full gap-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-300 font-medium text-sm mb-1">Saldo Pendiente Total</p>
                {isLoading ? (
                  <Skeleton className="h-10 w-36 bg-white/10" />
                ) : (
                  <h2 className="text-4xl font-bold text-white tracking-tight">
                    {activeLoan ? formatCurrency(activeLoan.amount) : 'S/ 0.00'}
                  </h2>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[#D4AF37]">
                <Wallet className="h-6 w-6" aria-hidden="true" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                <span className="text-gray-200 text-sm font-medium">
                  {activeLoan ? 'Préstamo activo' : 'Sin préstamos activos'}
                </span>
                {activeLoan && (
                  <span className="text-[#D4AF37] font-bold text-sm">{activeLoan.status}</span>
                )}
              </div>
              {/* ── Tasas del préstamo activo (transparencia SBS Res. 3274-2017)
                  TEA y TCEA se muestran con igual prominencia. El detalle
                  completo está en /loans/[id]. */}
              {activeLoan && (
                <div className="flex gap-2.5">
                  <div className="flex-1 bg-white/10 rounded-lg p-3">
                    <p className="text-[11px] text-gray-300 mb-0.5">TEA</p>
                    <p className="text-white font-bold text-sm">
                      {(activeLoan.interestRate * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="flex-1 bg-white/10 rounded-lg p-3">
                    <p className="text-[11px] text-gray-300 mb-0.5">TCEA</p>
                    <p className="text-white font-bold text-sm">
                      {(activeLoan.tcea * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}
              {activeLoan ? (
                <div className="flex gap-2.5">
                  <Link
                    href={`/loans/${activeLoan.id}/pay`}
                    className="flex-1 bg-[#D4AF37] text-[#0A192F] py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-center text-sm"
                  >
                    Pagar Ahora
                  </Link>
                  <Link
                    href={`/loans/${activeLoan.id}`}
                    className="w-12 bg-white/10 text-white py-3 rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center justify-center"
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => kycApproved && router.push('/request-loan')}
                  disabled={!kycApproved}
                  className="w-full bg-[#D4AF37] text-[#0A192F] py-3 rounded-xl font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {kycApproved ? 'Solicitar Préstamo' : 'Verificar Identidad Primero'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active loans count */}
        <div className={`${cardCls} p-6 flex flex-col justify-between`}>
          <div className="flex justify-between items-start mb-4">
            <div className="w-9 h-9 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
              <Calendar className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="px-2.5 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full">
              {activeLoans.length > 0 ? 'Activo' : 'Sin actividad'}
            </span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
              Préstamos Activos
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-12 mb-2" />
            ) : (
              <h3 className="text-2xl font-bold text-[#0A192F] dark:text-white mb-2">
                {activeLoans.length}
              </h3>
            )}
            {activeLoan?.dueDate ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Vence el {formatDate(activeLoan.dueDate)}
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeLoans.length === 0
                  ? 'No tienes préstamos activos.'
                  : 'Revisa tus préstamos.'}
              </p>
            )}
          </div>
          {activeLoans.length > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-100 dark:bg-[#0F172A] rounded-full h-2 mb-2">
                <div
                  className="bg-[#D4AF37] h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, (activeLoans.length / Math.max(loans.length, 1)) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                <span>Préstamos activos</span>
                <span>
                  {activeLoans.length}/{loans.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pending loans */}
        <div className={`${cardCls} p-6 flex flex-col justify-between`}>
          <div className="flex justify-between items-start mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 flex items-center justify-center">
              <FileSignature className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
              {pendingLoans.length > 0 ? 'En revisión' : 'Sin solicitudes'}
            </span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
              Solicitudes Pendientes
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-10 mb-2" />
            ) : (
              <h3 className="text-xl font-bold text-[#0A192F] dark:text-white mb-2">
                {pendingLoans.length}
              </h3>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pendingLoans.length > 0
                ? 'Analizando historial crediticio...'
                : kycApproved
                  ? 'Puedes solicitar un nuevo préstamo.'
                  : 'Verifica tu identidad para solicitar.'}
            </p>
          </div>
          {kycApproved && !activeLoan && (
            <Link
              href="/request-loan"
              className="w-full mt-4 py-3 rounded-xl border border-gray-100 dark:border-white/6 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-[#0F172A] hover:border-[#0A192F] dark:hover:border-[#D4AF37] hover:text-[#0A192F] dark:hover:text-[#D4AF37] transition-colors text-sm flex items-center justify-center"
            >
              Ver estado detallado
            </Link>
          )}
        </div>
      </div>

      {/* Quick access */}
      <div>
        <h3 className="text-lg font-semibold text-[#0A192F] dark:text-white mb-4">
          Accesos Rápidos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: HandCoins,
              label: 'Solicitar Préstamo',
              color: 'text-[#00E5FF]',
              bg: 'bg-[#00E5FF]/10',
              href: '/request-loan',
              hoverBorder: 'hover:border-[#00E5FF]',
            },
            {
              icon: Wallet,
              label: 'Mis Préstamos',
              color: 'text-[#0A192F] dark:text-[#D4AF37]',
              bg: 'bg-[#0A192F]/5 dark:bg-[#D4AF37]/10',
              href: '/loans',
              hoverBorder: 'hover:border-[#0A192F] dark:hover:border-[#D4AF37]',
            },
            {
              icon: ArrowLeftRight,
              label: 'Hacer Pago',
              color: 'text-[#0A192F] dark:text-[#D4AF37]',
              bg: 'bg-[#0A192F]/5 dark:bg-[#D4AF37]/10',
              href: activeLoan ? `/loans/${activeLoan.id}/pay` : '/loans',
              hoverBorder: 'hover:border-[#0A192F] dark:hover:border-[#D4AF37]',
            },
            {
              icon: Headphones,
              label: 'Ayuda',
              color: 'text-[#0A192F] dark:text-[#D4AF37]',
              bg: 'bg-[#0A192F]/5 dark:bg-[#D4AF37]/10',
              href: '#',
              hoverBorder: 'hover:border-[#0A192F] dark:hover:border-[#D4AF37]',
            },
          ].map((item) => {
            const ItemIcon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`${cardCls} p-4 flex flex-col items-center justify-center gap-3 ${item.hoverBorder} transition-colors group`}
              >
                <div
                  className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform`}
                >
                  <ItemIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#0A192F] dark:group-hover:text-white text-center">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Financial Education */}
      <div className={`${cardCls} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF]">
              <GraduationCap className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-[#0A192F] dark:text-white">
              Educación Financiera
            </h3>
          </div>
          <Link href="/learn" className="text-sm text-[#00E5FF] font-medium hover:underline">
            Ver más consejos
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Lightbulb,
              iconBg: 'bg-blue-500',
              cardBg:
                'bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/40 dark:to-blue-800/20',
              border: 'border-blue-200 dark:border-blue-700/50',
              title: 'Cómo mejorar tu historial crediticio',
              text: 'Paga tus cuotas a tiempo y mantén un buen comportamiento de pago para acceder a mejores tasas.',
            },
            {
              icon: LineChart,
              iconBg: 'bg-green-500',
              cardBg:
                'bg-linear-to-br from-green-50 to-green-100/50 dark:from-green-900/40 dark:to-green-800/20',
              border: 'border-green-200 dark:border-green-700/50',
              title: 'Gestiona tu endeudamiento',
              text: 'No comprometas más del 30% de tus ingresos en el pago de deudas mensuales.',
            },
            {
              icon: PiggyBank,
              iconBg: 'bg-yellow-500',
              cardBg:
                'bg-linear-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/40 dark:to-yellow-800/20',
              border: 'border-yellow-200 dark:border-yellow-700/50',
              title: 'Ahorra para emergencias',
              text: 'Mantén un fondo de emergencia equivalente a 3-6 meses de tus gastos fijos.',
            },
          ].map((card) => {
            const CardIcon = card.icon
            return (
              <div
                key={card.title}
                className={`p-4 rounded-xl ${card.cardBg} border ${card.border}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center text-white shrink-0 mt-0.5`}
                  >
                    <CardIcon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#0A192F] dark:text-white text-sm mb-1.5">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {card.text}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity + Account Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Recent activity */}
        <div className={`lg:col-span-2 ${cardCls} p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-[#0A192F] dark:text-white">
              Actividad Reciente
            </h3>
            <Link href="/loans" className="text-sm text-[#00E5FF] font-medium hover:underline">
              Ver todo
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl">
                  <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                    <Skeleton className="h-3 w-14 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="py-12 text-center">
              <FolderOpen
                className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3"
                aria-hidden="true"
              />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No hay actividad reciente.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((loan) => (
                <Link
                  key={loan.id}
                  href={`/loans/${loan.id}`}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#334155]"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                      ${
                        loan.status === 'PAID'
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : loan.status === 'PENDING'
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400'
                            : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                      }`}
                    >
                      {loan.status === 'PAID' ? (
                        <Check className="h-5 w-5" aria-hidden="true" />
                      ) : loan.status === 'PENDING' ? (
                        <Clock className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Wallet className="h-5 w-5" aria-hidden="true" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-[#0A192F] dark:text-white font-medium text-sm">
                        Préstamo #{loanRef(loan.id)}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(loan.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-[#0A192F] dark:text-white">
                      {formatCurrency(loan.amount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{loan.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Account data */}
        <div className="space-y-6">
          {/* Pre-approval promo */}
          {kycApproved && !activeLoan && (
            <div
              className={`${cardCls} p-6 border border-[#D4AF37]/50 relative overflow-hidden bg-linear-to-br from-white dark:from-[#1E293B] to-yellow-50 dark:to-yellow-900/10`}
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#D4AF37]/20 rounded-full blur-xl" />
              <div className="relative z-10">
                <span className="inline-block px-2 py-0.5 bg-[#D4AF37]/10 text-yellow-800 dark:text-[#D4AF37] text-xs font-medium rounded mb-3 uppercase tracking-wider">
                  Disponible
                </span>
                <h3 className="text-xl font-bold text-[#0A192F] dark:text-white mb-2">
                  Solicita tu préstamo
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Estás verificado. Obtén hasta{' '}
                  <strong className="text-[#0A192F] dark:text-[#D4AF37]">S/ 2,000</strong> con
                  aprobación en minutos.
                </p>
                <Link
                  href="/request-loan"
                  className="w-full bg-[#D4AF37] text-[#0A192F] font-medium py-3 rounded-lg text-sm cursor-pointer hover:bg-[#B8941F] transition-colors flex items-center justify-center"
                >
                  Ver Oferta
                </Link>
              </div>
            </div>
          )}

          {/* Account summary */}
          <div className={`${cardCls} p-6`}>
            <h3 className="text-base font-semibold text-[#0A192F] dark:text-white mb-4">
              Datos de Cuenta
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i, idx, arr) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center ${idx < arr.length - 1 ? 'pb-3 border-b border-gray-100 dark:border-white/6' : ''}`}
                  >
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Titular', value: user ? `${user.firstName} ${user.lastName}` : '–' },
                  { label: 'Email', value: user?.email ?? '–' },
                  {
                    label: 'Email',
                    value: user?.emailVerified
                      ? '✓ Email verificado'
                      : '⚠ Pendiente de verificación',
                  },
                  {
                    label: 'Estado KYC',
                    value: kycApproved ? '✓ Identidad verificada' : 'Pendiente de verificación',
                  },
                ].map((item, i, arr) => (
                  <div
                    key={`${item.label}-${i}`}
                    className={`flex justify-between items-center ${i < arr.length - 1 ? 'pb-3 border-b border-gray-100 dark:border-white/6' : ''}`}
                  >
                    <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                    <span
                      className={`text-sm font-medium text-right max-w-[55%] truncate ${
                        item.value.startsWith('✓')
                          ? 'text-green-600 dark:text-green-400'
                          : item.value.startsWith('⚠')
                            ? 'text-amber-500'
                            : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
