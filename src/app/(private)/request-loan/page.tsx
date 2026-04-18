'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Loader2,
  ArrowRight,
  Zap,
  Layers,
  Star,
  Mail,
  CircleCheck,
  Send,
  IdCard,
  ShieldCheck,
  Lock,
  Landmark,
  Plus,
  Save,
  CircleAlert,
  Info,
} from 'lucide-react'
import { Checkbox } from '@/shared/ui/checkbox'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTheme } from 'next-themes'
import { useLoanStore, loanRepository, type SimulationResult } from '@/features/request-loan'
import type { LoanLimits } from '@/entities/loan'
import {
  bankAccountRepository,
  type BankAccount,
} from '@/features/request-loan/api/bankAccountRepository'
import { catalogRepository, type BankEntry } from '@/shared/api/catalogRepository'
import { kycRepository } from '@/features/upload-kyc'
import { useAuthStore, authRepository } from '@/features/auth'
import { legalRepository, LEGAL_DOCUMENT_TYPES, LEGAL_VERSIONS, LEGAL_URLS } from '@/features/legal'
import { formatCurrency, shortName } from '@/shared/lib/utils'
import { InfoTooltip } from '@/shared/ui/info-tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import Link from 'next/link'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'
const inputCls =
  'w-full px-3.5 py-2.5 rounded-lg border border-gray-100 dark:border-white/6 bg-[#F9FAFB] dark:bg-[#0F172A] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20 transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500'

const TOOLTIPS = {
  techFee:
    'Cubre los costos de la plataforma digital, verificación de identidad y procesamiento de tu solicitud.',
  disbursementFee:
    'Cubre la transferencia del dinero a tu cuenta. Se descuenta del monto que recibes.',
  maintenanceFee: 'Cubre la administración de tu cuenta durante la vigencia del préstamo.',
  igv: 'Impuesto General a las Ventas (18%) aplicado sobre las comisiones.',
  tcea: 'Tasa de Costo Efectivo Anual. Refleja el costo total del préstamo incluyendo intereses y comisiones.',
}

const STEP = 25

const PRODUCT_CONFIG = {
  EXPRESS: {
    minAmount: 100,
    maxAmount: 500,
    minInstallments: 1,
    maxInstallments: 1,
    frequencies: ['QUINCENAL', 'MENSUAL'] as const,
    defaultInstallments: 1,
    defaultFrequency: 'MENSUAL' as const,
    defaultAmount: 200,
    icon: Zap,
    label: 'Express',
    sublabel: '1 cuota',
    accentBg: 'bg-[#00E5FF]/10',
    borderActive: 'border-[#00E5FF]',
    textActive: 'text-[#00E5FF]',
  },
  FLEX: {
    minAmount: 100,
    maxAmount: 500,
    minInstallments: 2,
    maxInstallments: 6,
    frequencies: ['QUINCENAL', 'MENSUAL'] as const,
    defaultInstallments: 3,
    defaultFrequency: 'MENSUAL' as const,
    defaultAmount: 300,
    icon: Layers,
    label: 'Flex',
    sublabel: '2–6 cuotas',
    accentBg: 'bg-[#D4AF37]/10',
    borderActive: 'border-[#D4AF37]',
    textActive: 'text-[#D4AF37]',
  },
  PLUS: {
    minAmount: 550,
    maxAmount: 2000,
    minInstallments: 7,
    maxInstallments: 12,
    frequencies: ['MENSUAL'] as const,
    defaultInstallments: 9,
    defaultFrequency: 'MENSUAL' as const,
    defaultAmount: 1000,
    icon: Star,
    label: 'Plus',
    sublabel: '7–12 cuotas',
    accentBg: 'bg-purple-400/10',
    borderActive: 'border-purple-400',
    textActive: 'text-purple-400',
  },
} as const

type ProductKey = keyof typeof PRODUCT_CONFIG

function fmtAmt(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function range(min: number, max: number): number[] {
  const r: number[] = []
  for (let i = min; i <= max; i++) r.push(i)
  return r
}

const requestSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Ingresa un monto válido' })
    .min(100, 'El monto mínimo es S/ 100')
    .max(2000, 'El monto máximo es S/ 2,000'),
  productType: z.enum(['EXPRESS', 'FLEX', 'PLUS']),
  frequency: z.enum(['QUINCENAL', 'MENSUAL']),
  installments: z.number().min(1).max(12),
  bankAccountId: z.string().min(1, 'Selecciona una cuenta bancaria para recibir tu préstamo'),
  consentCredit: z
    .boolean()
    .refine((v) => v, { message: 'Debes autorizar la consulta crediticia' }),
  consentTerms: z
    .boolean()
    .refine((v) => v, { message: 'Debes aceptar los términos y condiciones' }),
})
type RequestInput = z.infer<typeof requestSchema>

const addAccountSchema = z.object({
  bank: z.string().min(1, 'Selecciona un banco'),
  cci: z.string().regex(/^\d{20}$/, 'El CCI debe tener exactamente 20 dígitos'),
})
type AddAccountInput = z.infer<typeof addAccountSchema>

function StepHeader({
  step,
  title,
  subtitle,
}: Readonly<{ step: number; title: string; subtitle: string }>) {
  return (
    <div className="p-6 border-b border-gray-100 dark:border-white/6">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-[#00E5FF]/15 dark:bg-[#00E5FF]/10 flex items-center justify-center text-xs font-bold text-[#0A192F] dark:text-[#00E5FF] shrink-0">
          {step}
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#0A192F] dark:text-white">{title}</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

export default function RequestLoanPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { requestLoan } = useLoanStore()
  const [kycApproved, setKycApproved] = useState<boolean | null>(null)
  const [simulation, setSimulation] = useState<SimulationResult | null>(null)
  const [simLoading, setSimLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const { resolvedTheme } = useTheme()

  // Loan config state
  const [productType, setProductType] = useState<ProductKey>('EXPRESS')

  // Límites personalizados
  const [loanLimits, setLoanLimits] = useState<LoanLimits | null>(null)
  const [limitsLoading, setLimitsLoading] = useState(true)

  // Bank account selector
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [bankMaxAccounts, setBankMaxAccounts] = useState(1)
  const [bankPaidLoans, setBankPaidLoans] = useState(0)
  const [bankAccountsLoading, setBankAccountsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addingAccount, setAddingAccount] = useState(false)
  const [bankCatalog, setBankCatalog] = useState<BankEntry[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    kycRepository
      .getStatus()
      .then((s) => setKycApproved(s.isIdentityVerified))
      .catch(() => setKycApproved(false))
  }, [])

  useEffect(() => {
    loanRepository
      .getMyLimits()
      .then(setLoanLimits)
      .catch(() => setLoanLimits(null))
      .finally(() => setLimitsLoading(false))
  }, [])

  useEffect(() => {
    bankAccountRepository
      .getMyAccounts()
      .then((result) => {
        setBankAccounts(result.accounts)
        setBankMaxAccounts(result.maxAccounts)
        setBankPaidLoans(result.paidLoansCount)
        const def = result.accounts.find((a) => a.isDefault) ?? result.accounts[0]
        if (def) form.setValue('bankAccountId', def.id)
        else setShowAddForm(true)
      })
      .catch(() => setShowAddForm(true))
      .finally(() => setBankAccountsLoading(false))
  }, [])

  useEffect(() => {
    catalogRepository
      .getBanks()
      .then((banks) => {
        setBankCatalog(banks)
        if (banks[0]) addAccountForm.setValue('bank', banks[0].id)
      })
      .catch(() => {})
  }, [])

  const form = useForm<RequestInput>({
    resolver: zodResolver(requestSchema),
    mode: 'onSubmit',
    defaultValues: {
      amount: PRODUCT_CONFIG.EXPRESS.defaultAmount,
      productType: 'EXPRESS',
      frequency: 'MENSUAL',
      installments: 1,
      bankAccountId: '',
      consentCredit: false,
      consentTerms: false,
    },
  })

  const frequency = form.watch('frequency')
  const installments = form.watch('installments')
  const selectedAccountId = form.watch('bankAccountId')
  const consentCredit = form.watch('consentCredit')
  const consentTerms = form.watch('consentTerms')

  const addAccountForm = useForm<AddAccountInput>({
    resolver: zodResolver(addAccountSchema),
    mode: 'onChange',
    defaultValues: { bank: '', cci: '' },
  })

  const amount = form.watch('amount')
  const cfg = PRODUCT_CONFIG[productType]

  // Topes efectivos: límite aprobado del usuario si existe, o absoluteMaxAmount por defecto
  const effectiveMax = (p: ProductKey): number => {
    if (loanLimits?.limits[p]) return loanLimits.limits[p].maxAmount
    return PRODUCT_CONFIG[p].maxAmount
  }
  const isProductLocked = (p: ProductKey): boolean => {
    if (!loanLimits) return false
    return !loanLimits.limits[p].available && !!loanLimits.limits[p].requiredPaidLoans
  }

  const handleProductChange = (p: ProductKey) => {
    const c = PRODUCT_CONFIG[p]
    const maxAmt = effectiveMax(p)
    setProductType(p)
    form.setValue('productType', p)
    form.setValue('amount', Math.min(c.defaultAmount, maxAmt))
    form.setValue('frequency', c.defaultFrequency)
    form.setValue('installments', c.defaultInstallments)
  }

  const handleAddAccount = addAccountForm.handleSubmit(async (values) => {
    setAddingAccount(true)
    try {
      const account = await bankAccountRepository.addAccount({
        bankName: values.bank,
        cci: values.cci,
      })
      setBankAccounts((prev) => [...prev, account])
      form.setValue('bankAccountId', account.id)
      setShowAddForm(false)
      addAccountForm.reset()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al agregar la cuenta')
    } finally {
      setAddingAccount(false)
    }
  })

  const runSimulation = useCallback(
    async (amt: number, prod: ProductKey, freq: string, inst: number) => {
      const c = PRODUCT_CONFIG[prod]
      if (!amt || amt < c.minAmount || amt > c.maxAmount) {
        setSimulation(null)
        return
      }
      setSimLoading(true)
      try {
        const result = await loanRepository.simulate({
          amount: amt,
          productType: prod,
          paymentFrequency: freq,
          numInstallments: inst,
        })
        setSimulation(result)
      } catch {
        setSimulation(null)
      } finally {
        setSimLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    const t = setTimeout(() => runSimulation(amount, productType, frequency, installments), 400)
    return () => clearTimeout(t)
  }, [amount, productType, frequency, installments, runSimulation])

  const onSubmit = async (values: RequestInput) => {
    try {
      const loan = await requestLoan({
        amount: values.amount,
        productType: values.productType,
        paymentFrequency: values.frequency,
        numInstallments: values.installments,
        bankAccountId: values.bankAccountId || undefined,
      })

      // Record the legal acceptances tied to this specific loan request.
      // Best-effort: failure here must not roll back the loan request.
      legalRepository
        .acceptMany([
          {
            documentType: LEGAL_DOCUMENT_TYPES.LOAN_TERMS,
            documentVersion: LEGAL_VERSIONS.LOAN_TERMS,
            resourceId: loan.id,
            resourceType: 'loan',
            metadata: {
              amount: values.amount,
              productType: values.productType,
              frequency: values.frequency,
              installments: values.installments,
            },
          },
          {
            documentType: LEGAL_DOCUMENT_TYPES.CREDIT_BUREAU_AUTH,
            documentVersion: LEGAL_VERSIONS.CREDIT_BUREAU_AUTH,
            resourceId: loan.id,
            resourceType: 'loan',
          },
        ])
        .catch(() => {
          /* swallow — loan request already succeeded */
        })

      toast.success('¡Solicitud enviada! Te notificaremos cuando sea aprobada.')
      router.push('/loans')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al solicitar préstamo')
    }
  }

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

  const canSubmit = form.formState.isValid && !!simulation && kycApproved === true

  // Slider fill style
  const fillColor = mounted && resolvedTheme === 'dark' ? '#D4AF37' : '#0A192F'
  const trackColor = mounted && resolvedTheme === 'dark' ? 'rgba(255,255,255,0.12)' : '#E5E7EB'
  const safeAmount = Number.isNaN(amount) ? cfg.defaultAmount : amount
  const currentMax = effectiveMax(productType)
  const fillPct = ((safeAmount - cfg.minAmount) / (currentMax - cfg.minAmount)) * 100
  const rangeStyle = {
    background: `linear-gradient(to right, ${fillColor} ${Math.max(0, Math.min(100, fillPct))}%, ${trackColor} ${Math.max(0, Math.min(100, fillPct))}%)`,
  }

  // Email not verified
  if (user && !user.emailVerified) {
    return (
      <div className="space-y-6 max-w-xl">
        <div>
          <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-1">
            Solicitar Préstamo
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Primero necesitas verificar tu correo electrónico.
          </p>
        </div>
        <div className={`${cardCls} p-8 text-center`}>
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-5">
            <Mail className="h-7 w-7 text-blue-500" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-[#0A192F] dark:text-white mb-2">
            Verifica tu correo electrónico
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            Te enviamos un enlace de verificación a{' '}
            <strong className="text-[#0A192F] dark:text-white">{user.email}</strong>. Revisa tu
            bandeja de entrada (y spam) y haz clic en el enlace.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mb-6">
            Una vez verificado, recarga la página para continuar.
          </p>
          {resendSent ? (
            <p className="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
              <CircleCheck className="h-4 w-4" aria-hidden="true" />
              Correo enviado — revisa tu bandeja
            </p>
          ) : (
            <button
              type="button"
              disabled={resendLoading}
              onClick={handleResendEmail}
              className="inline-flex items-center gap-2 bg-[#0A192F] dark:bg-[#00E5FF] text-white dark:text-[#0A192F] font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              {resendLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              Reenviar correo de verificación
            </button>
          )}
        </div>
      </div>
    )
  }

  // KYC not verified
  if (kycApproved === false) {
    return (
      <div className="space-y-6 max-w-xl">
        <div>
          <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-1">
            Solicitar Préstamo
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Primero necesitas verificar tu identidad.
          </p>
        </div>
        <div className={`${cardCls} p-8 text-center`}>
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
            <IdCard className="h-7 w-7 text-amber-500" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-[#0A192F] dark:text-white mb-2">
            Verifica tu identidad
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Para solicitar un préstamo, necesitamos verificar tu identidad con tu DNI y una selfie.
            Es rápido y seguro.
          </p>
          <Link
            href="/kyc"
            className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0A192F] font-medium px-6 py-2.5 rounded-lg hover:bg-[#B8941F] transition-colors text-sm"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Verificar identidad ahora
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-1">
            Solicitar Préstamo
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            De S/ 100 a S/ 2,000 · Aprobación en minutos
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50">
            <CircleCheck className="h-4 w-4 text-green-500" aria-hidden="true" />
            <span className="text-sm text-green-700 dark:text-green-400">
              {shortName(user.firstName, user.lastName)}, tu identidad está verificada
            </span>
          </div>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Left: form sections ───────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Section 1 — Configuración del Préstamo */}
            <div className={cardCls}>
              <StepHeader
                step={1}
                title="Configuración del Préstamo"
                subtitle="Selecciona el producto y el monto que necesitas"
              />
              <div className="p-6 space-y-6">
                {/* Amount slider */}
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      ¿Cuánto necesitas?
                    </p>
                    <span className="text-2xl font-bold text-[#0A192F] dark:text-white">
                      S/ {fmtAmt(safeAmount)}
                    </span>
                  </div>
                  {/* Máximo aprobado */}
                  {!limitsLoading && loanLimits?.score && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <CircleCheck className="h-2.5 w-2.5 text-emerald-500" aria-hidden="true" />
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Tu máximo aprobado: S/ {currentMax.toLocaleString('es-PE')}
                      </span>
                    </div>
                  )}
                  {limitsLoading && (
                    <div className="h-4 mb-3 w-44 rounded bg-gray-100 dark:bg-white/10 animate-pulse" />
                  )}
                  <input
                    type="range"
                    title="Slider de monto"
                    min={cfg.minAmount}
                    max={currentMax}
                    step={STEP}
                    value={safeAmount}
                    onChange={(e) =>
                      form.setValue('amount', Number(e.target.value), { shouldValidate: true })
                    }
                    style={rangeStyle}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-5
                      [&::-webkit-slider-thumb]:h-5
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-[#0A192F]
                      dark:[&::-webkit-slider-thumb]:bg-[#D4AF37]
                      [&::-webkit-slider-thumb]:border-2
                      [&::-webkit-slider-thumb]:border-white
                      [&::-webkit-slider-thumb]:shadow-md
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:w-5
                      [&::-moz-range-thumb]:h-5
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-[#0A192F]
                      dark:[&::-moz-range-thumb]:bg-[#D4AF37]
                      [&::-moz-range-thumb]:border-2
                      [&::-moz-range-thumb]:border-white
                      [&::-moz-range-thumb]:border-solid
                      [&::-moz-range-thumb]:shadow-md
                      [&::-moz-range-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>S/ {cfg.minAmount}</span>
                    <span>S/ {currentMax.toLocaleString('es-PE')}</span>
                  </div>
                  {form.formState.errors.amount && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.amount.message}
                    </p>
                  )}
                </div>

                {/* Product selection */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    Elige tu modalidad
                  </p>
                  <div className="flex gap-2">
                    {(Object.keys(PRODUCT_CONFIG) as ProductKey[]).map((key) => {
                      const p = PRODUCT_CONFIG[key]
                      const selected = productType === key
                      const locked = isProductLocked(key)
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleProductChange(key)}
                          disabled={locked}
                          title={
                            locked
                              ? `Requiere ${loanLimits?.limits[key]?.requiredPaidLoans}+ préstamos pagados`
                              : undefined
                          }
                          className={`flex-1 py-2.5 px-3 rounded-xl border-2 font-semibold text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                            locked
                              ? 'border-gray-200 dark:border-white/6 opacity-50 cursor-not-allowed bg-gray-50 dark:bg-white/3'
                              : selected
                                ? `${p.borderActive} ${p.accentBg} text-[#0A192F] dark:text-white`
                                : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'
                          }`}
                        >
                          {(() => {
                            const ProductIcon = locked ? Lock : p.icon
                            return (
                              <ProductIcon
                                className={`h-4 w-4 ${selected && !locked ? p.textActive : ''}`}
                                aria-hidden="true"
                              />
                            )
                          })()}
                          <span className="text-xs font-semibold">{p.label}</span>
                          <span
                            className={`text-[10px] font-normal ${selected && !locked ? 'opacity-80' : 'text-gray-400 dark:text-gray-500'}`}
                          >
                            {locked
                              ? `${loanLimits?.limits[key]?.requiredPaidLoans}+ pagados`
                              : p.sublabel}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {/* Mensaje de producto bloqueado */}
                  {productType === 'PLUS' && isProductLocked('PLUS') && (
                    <p className="text-xs text-purple-400 dark:text-purple-300 mt-2 flex items-center gap-1.5">
                      <Lock className="h-2.5 w-2.5" aria-hidden="true" /> Disponible para clientes
                      con {loanLimits?.limits.PLUS?.requiredPaidLoans ?? 10}+ préstamos pagados
                    </p>
                  )}
                </div>

                {/* Frequency + Installments */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="frequency"
                      className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2"
                    >
                      Frecuencia
                    </label>
                    {productType === 'PLUS' ? (
                      <div
                        className={`${inputCls} opacity-60 cursor-default w-full h-11.5 flex items-center`}
                      >
                        Mensual
                      </div>
                    ) : (
                      <Select
                        id="frequency"
                        value={frequency}
                        onValueChange={(v) =>
                          form.setValue('frequency', v as 'QUINCENAL' | 'MENSUAL')
                        }
                      >
                        <SelectTrigger className="w-full h-11.5 rounded-lg border-gray-100 dark:border-white/6 bg-[#F9FAFB] dark:bg-[#0F172A] text-gray-800 dark:text-gray-200 px-4 text-sm">
                          <SelectValue>
                            {{ MENSUAL: 'Mensual', QUINCENAL: 'Quincenal' }[frequency]}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MENSUAL">Mensual</SelectItem>
                          <SelectItem value="QUINCENAL">Quincenal</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="installments"
                      className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2"
                    >
                      Cuotas
                    </label>
                    {productType === 'EXPRESS' ? (
                      <div
                        className={`${inputCls} opacity-60 cursor-default w-full h-11.5 flex items-center`}
                      >
                        1 cuota
                      </div>
                    ) : (
                      <Select
                        id="installments"
                        value={String(installments)}
                        onValueChange={(v) => form.setValue('installments', Number(v))}
                      >
                        <SelectTrigger className="w-full h-11.5 rounded-lg border-gray-100 dark:border-white/6 bg-[#F9FAFB] dark:bg-[#0F172A] text-gray-800 dark:text-gray-200 px-4 text-sm">
                          <SelectValue>
                            {installments} cuota{installments > 1 ? 's' : ''}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {range(cfg.minInstallments, cfg.maxInstallments).map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} cuota{n > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 — Cuenta de Depósito */}
            <div className={cardCls}>
              <StepHeader
                step={2}
                title="Cuenta de Depósito"
                subtitle="Selecciona la cuenta donde recibirás el préstamo"
              />
              <div className="p-6">
                {bankAccountsLoading ? (
                  <div className="space-y-3">
                    <div className="h-16 rounded-lg bg-gray-100 dark:bg-white/5 animate-pulse" />
                    <div className="h-16 rounded-lg bg-gray-100 dark:bg-white/5 animate-pulse" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Saved accounts */}
                    {bankAccounts.map((account) => (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => {
                          form.setValue('bankAccountId', account.id)
                          setShowAddForm(false)
                        }}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                          selectedAccountId === account.id
                            ? 'border-[#0A192F] dark:border-[#D4AF37] bg-[#0A192F]/4 dark:bg-[#D4AF37]/8'
                            : 'border-gray-100 dark:border-white/8 hover:border-gray-200 dark:hover:border-white/15'
                        }`}
                      >
                        {/* Radio dot */}
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            selectedAccountId === account.id
                              ? 'border-[#0A192F] dark:border-[#D4AF37]'
                              : 'border-gray-300 dark:border-white/25'
                          }`}
                        >
                          {selectedAccountId === account.id && (
                            <div className="w-2 h-2 rounded-full bg-[#0A192F] dark:bg-[#D4AF37]" />
                          )}
                        </div>
                        {/* Bank icon */}
                        <div className="w-9 h-9 rounded-lg bg-[#0A192F]/8 dark:bg-white/6 flex items-center justify-center shrink-0">
                          <Landmark
                            className="h-4 w-4 text-[#0A192F] dark:text-gray-300"
                            aria-hidden="true"
                          />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-[#0A192F] dark:text-white">
                              {account.bankName}
                            </p>
                            {account.isDefault && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-yellow-700 dark:text-[#D4AF37]">
                                Principal
                              </span>
                            )}
                            {account.alias && (
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                {account.alias}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                            ••••&nbsp;••••&nbsp;••••&nbsp;{account.cci.slice(-4)}
                          </p>
                        </div>
                      </button>
                    ))}

                    {/* Add new account toggle */}
                    {!showAddForm &&
                      (bankAccounts.length >= bankMaxAccounts ? (
                        <div className="flex items-start gap-3 p-3.5 rounded-lg border border-amber-200 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-900/10 text-sm">
                          <Lock
                            className="h-3 w-3 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0"
                            aria-hidden="true"
                          />
                          <div>
                            <p className="font-medium text-amber-700 dark:text-amber-300">
                              Límite de cuentas alcanzado
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                              Con {bankPaidLoans} préstamo{bankPaidLoans !== 1 ? 's' : ''} pagado
                              {bankPaidLoans !== 1 ? 's' : ''} puedes tener hasta {bankMaxAccounts}{' '}
                              cuenta{bankMaxAccounts !== 1 ? 's' : ''}.
                              {bankMaxAccounts < 3 && (
                                <>
                                  {' '}
                                  Alcanza {bankMaxAccounts === 1 ? '3' : '10'} préstamos pagados
                                  para desbloquear{' '}
                                  {bankMaxAccounts === 1 ? 'una más' : 'una tercera'}.
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddForm(true)
                            form.setValue('bankAccountId', '')
                          }}
                          className="w-full flex items-center gap-3 p-4 rounded-lg border border-dashed border-gray-200 dark:border-white/12 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/25 hover:text-gray-700 dark:hover:text-gray-200 transition-all text-sm"
                        >
                          <Plus className="h-3 w-3" aria-hidden="true" />
                          {bankAccounts.length === 0
                            ? 'Agregar una cuenta bancaria'
                            : 'Usar una cuenta diferente'}
                        </button>
                      ))}

                    {/* Inline add form */}
                    {showAddForm && (
                      <div className="border border-gray-100 dark:border-white/8 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-[#0F172A]">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-[#0A192F] dark:text-white">
                            Nueva cuenta bancaria
                          </p>
                          {bankAccounts.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddForm(false)
                                form.setValue(
                                  'bankAccountId',
                                  bankAccounts.find((a) => a.isDefault)?.id ??
                                    bankAccounts[0]?.id ??
                                    '',
                                )
                              }}
                              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                              Banco
                            </label>
                            <Select
                              value={addAccountForm.watch('bank')}
                              onValueChange={(v) => addAccountForm.setValue('bank', v ?? '')}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue>
                                  {addAccountForm.watch('bank') || (
                                    <span className="text-muted-foreground">
                                      Seleccione su banco
                                    </span>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {bankCatalog.map((b) => (
                                  <SelectItem key={b.id} value={b.id}>
                                    {b.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {addAccountForm.formState.errors.bank && (
                              <p className="text-xs text-red-500 mt-1">
                                {addAccountForm.formState.errors.bank.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                              CCI (20 dígitos)
                            </label>
                            <input
                              type="text"
                              {...addAccountForm.register('cci', {
                                onChange: (e) =>
                                  addAccountForm.setValue(
                                    'cci',
                                    e.target.value.replaceAll(/\D/g, '').slice(0, 20),
                                  ),
                              })}
                              placeholder="00000000000000000000"
                              maxLength={20}
                              className={inputCls}
                            />
                            {addAccountForm.formState.errors.cci && (
                              <p className="text-xs text-red-500 mt-1">
                                {addAccountForm.formState.errors.cci.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddAccount}
                          disabled={addingAccount}
                          className="w-full py-2.5 rounded-lg bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] text-sm font-semibold hover:bg-[#0A192F]/90 dark:hover:bg-[#B8941F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {addingAccount ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="h-3 w-3" aria-hidden="true" />
                              Guardar y usar esta cuenta
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {form.formState.errors.bankAccountId && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <CircleAlert className="h-4 w-4" aria-hidden="true" />
                    {form.formState.errors.bankAccountId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Section 3 — Confirmación y Envío */}
            <div className={cardCls}>
              <StepHeader
                step={3}
                title="Confirmación y Envío"
                subtitle="Acepta los términos para enviar tu solicitud"
              />
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <Checkbox
                      checked={consentCredit}
                      onCheckedChange={(checked) =>
                        form.setValue('consentCredit', checked === true, { shouldValidate: true })
                      }
                      className="mt-0.5"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Autorizo a Crevo a consultar mi historial crediticio en las Centrales de
                      Riesgo (Equifax/Sentinel) conforme a la Ley N° 27489 para evaluar esta
                      solicitud.
                    </span>
                  </label>
                  {form.formState.errors.consentCredit && (
                    <p className="text-xs text-red-500 mt-1 ml-7">
                      {form.formState.errors.consentCredit.message}
                    </p>
                  )}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <Checkbox
                      checked={consentTerms}
                      onCheckedChange={(checked) =>
                        form.setValue('consentTerms', checked === true, { shouldValidate: true })
                      }
                      className="mt-0.5"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Acepto los{' '}
                      <Link
                        href={LEGAL_URLS.TERMS}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0A192F] dark:text-[#D4AF37] font-medium hover:underline"
                      >
                        Términos y Condiciones
                      </Link>{' '}
                      y la{' '}
                      <Link
                        href={LEGAL_URLS.PRIVACY}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0A192F] dark:text-[#D4AF37] font-medium hover:underline"
                      >
                        Política de Privacidad
                      </Link>{' '}
                      de Crevo, así como las condiciones específicas de este préstamo (monto,
                      cuotas, TCEA y costos detallados en el resumen).
                    </span>
                  </label>
                  {form.formState.errors.consentTerms && (
                    <p className="text-xs text-red-500 mt-1 ml-7">
                      {form.formState.errors.consentTerms.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-white/6 pt-5">
                  <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                    <Lock
                      className="h-4 w-4 text-[#0A192F] dark:text-[#D4AF37]"
                      aria-hidden="true"
                    />
                    Protegido por Ley N° 29733 · Sujeto Obligado UIF-Perú
                  </p>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full sm:w-auto bg-[#D4AF37] text-[#0A192F] font-medium px-6 py-2.5 cursor-pointer rounded-lg flex items-center justify-center gap-2 hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" aria-hidden="true" />
                        Enviar solicitud
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: simulation summary ─────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className={`${cardCls} sticky top-8`}>
              <div className="p-5 border-b border-gray-100 dark:border-white/6">
                <h2 className="text-base font-semibold text-[#0A192F] dark:text-white">
                  Resumen del préstamo
                </h2>
              </div>
              <div className="p-5">
                {simLoading || !simulation ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                    <div className="flex justify-between items-center border-t border-gray-100 dark:border-white/6 pt-3">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-12 w-full rounded-lg mt-1" />
                    <Skeleton className="h-20 w-full rounded-lg mt-1" />
                    <Skeleton className="h-10 w-full rounded-lg mt-2" />
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Monto solicitado</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {formatCurrency(simulation.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Interés (TEA {simulation.teaPercent}%)
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {formatCurrency(simulation.totalInterest)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        Com. mantenimiento <InfoTooltip text={TOOLTIPS.maintenanceFee} />
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {formatCurrency(simulation.maintenanceFeeTotal)}
                        {simulation.numInstallments > 1 && (
                          <span className="text-xs text-gray-400 ml-1">
                            ({formatCurrency(simulation.maintenanceFee)} ×{' '}
                            {simulation.numInstallments})
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between font-bold border-t border-gray-100 dark:border-white/6 pt-3">
                      <span className="text-[#0A192F] dark:text-white">Total a devolver</span>
                      <span className="text-[#0A192F] dark:text-[#D4AF37] text-base">
                        {formatCurrency(simulation.totalAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {simulation.numInstallments === 1
                          ? 'Cuota única'
                          : `${simulation.numInstallments} cuotas de`}
                      </span>
                      <span>{formatCurrency(simulation.installmentAmount)}</span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        Com. desembolso <InfoTooltip text={TOOLTIPS.disbursementFee} />
                      </span>
                      <span className="text-amber-500">
                        − {formatCurrency(simulation.disbursementFee)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-[#0A192F] dark:bg-[#D4AF37]/10 border border-[#0A192F]/20 dark:border-[#D4AF37]/30 px-4 py-3 mt-1">
                      <span className="text-xs font-medium text-white dark:text-[#D4AF37] flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" />
                        Recibes en tu cuenta
                      </span>
                      <span className="text-base font-bold text-white dark:text-[#D4AF37]">
                        {formatCurrency(simulation.netDisbursed)}
                      </span>
                    </div>

                    <div className="rounded-lg bg-gray-50 dark:bg-[#0F172A] px-3 py-3 space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <p className="font-semibold text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
                        Comisiones distribuidas
                      </p>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          Com. tecnología <InfoTooltip text={TOOLTIPS.techFee} />
                        </span>
                        <span>{formatCurrency(simulation.techFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          IGV (18%) <InfoTooltip text={TOOLTIPS.igv} />
                        </span>
                        <span>{formatCurrency(simulation.igvAmount)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-100 dark:border-white/6 pt-1.5 font-medium text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1">
                          TCEA <InfoTooltip text={TOOLTIPS.tcea} />
                        </span>
                        <span>{simulation.tceaPercent}% anual</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="w-full mt-2 bg-[#D4AF37] text-[#0A192F] font-medium py-3 cursor-pointer rounded-lg flex items-center justify-center gap-2 hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Enviando solicitud...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" aria-hidden="true" />
                          Solicitar préstamo ahora
                        </>
                      )}
                    </button>

                    {(!consentCredit || !consentTerms) && (
                      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                        <Info className="inline h-3 w-3 mr-1" aria-hidden="true" />
                        Acepta los términos en el paso 3 para continuar
                      </p>
                    )}
                  </div>
                )}

                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
                  <ShieldCheck className="inline h-3 w-3 mr-1" aria-hidden="true" />
                  Datos cifrados con AES-256 · Sujeto Obligado UIF-Perú · Ley N° 29733
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
