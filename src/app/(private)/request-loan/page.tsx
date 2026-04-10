'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, ArrowRight } from 'lucide-react'
import { Checkbox } from '@/shared/ui/checkbox'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTheme } from 'next-themes'
import { useLoanStore, loanRepository, type SimulationResult } from '@/features/request-loan'
import { kycRepository } from '@/features/upload-kyc'
import { useAuthStore, authRepository } from '@/features/auth'
import { formatCurrency, shortName } from '@/shared/lib/utils'
import { InfoTooltip } from '@/shared/ui/info-tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import Link from 'next/link'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'
const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-gray-100 dark:border-white/6 bg-[#F9FAFB] dark:bg-[#0F172A] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20 transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500'

const TOOLTIPS = {
  techFee: 'Cubre los costos de la plataforma digital, verificación de identidad y procesamiento de tu solicitud.',
  disbursementFee: 'Cubre la transferencia del dinero a tu cuenta. Se descuenta del monto que recibes.',
  maintenanceFee: 'Cubre la administración de tu cuenta durante la vigencia del préstamo.',
  igv: 'Impuesto General a las Ventas (18%) aplicado sobre las comisiones.',
  tcea: 'Tasa de Costo Efectivo Anual. Refleja el costo total del préstamo incluyendo intereses y comisiones.',
}

const STEP = 25

const PRODUCT_CONFIG = {
  EXPRESS: {
    minAmount: 100, maxAmount: 500, minInstallments: 1, maxInstallments: 1,
    frequencies: ['QUINCENAL', 'MENSUAL'] as const,
    defaultInstallments: 1, defaultFrequency: 'MENSUAL' as const, defaultAmount: 200,
    icon: 'fa-solid fa-bolt', label: 'Express', sublabel: '1 cuota',
    accentBg: 'bg-[#00E5FF]/10', borderActive: 'border-[#00E5FF]', textActive: 'text-[#00E5FF]',
  },
  FLEX: {
    minAmount: 100, maxAmount: 500, minInstallments: 2, maxInstallments: 6,
    frequencies: ['QUINCENAL', 'MENSUAL'] as const,
    defaultInstallments: 3, defaultFrequency: 'MENSUAL' as const, defaultAmount: 300,
    icon: 'fa-solid fa-layer-group', label: 'Flex', sublabel: '2–6 cuotas',
    accentBg: 'bg-[#D4AF37]/10', borderActive: 'border-[#D4AF37]', textActive: 'text-[#D4AF37]',
  },
  PLUS: {
    minAmount: 550, maxAmount: 2000, minInstallments: 7, maxInstallments: 12,
    frequencies: ['MENSUAL'] as const,
    defaultInstallments: 9, defaultFrequency: 'MENSUAL' as const, defaultAmount: 1000,
    icon: 'fa-solid fa-star', label: 'Plus', sublabel: '7–12 cuotas',
    accentBg: 'bg-purple-400/10', borderActive: 'border-purple-400', textActive: 'text-purple-400',
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

const BANKS = ['BCP', 'Interbank', 'BBVA Perú', 'Scotiabank', 'BanBif', 'Banco de la Nación', 'Otro']

const requestSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Ingresa un monto válido' })
    .min(100, 'El monto mínimo es S/ 100')
    .max(2000, 'El monto máximo es S/ 2,000'),
  productType: z.enum(['EXPRESS', 'FLEX', 'PLUS']),
})
type RequestInput = z.infer<typeof requestSchema>

function StepHeader({ step, title, subtitle }: Readonly<{ step: number; title: string; subtitle: string }>) {
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
  const [frequency, setFrequency] = useState<'QUINCENAL' | 'MENSUAL'>('MENSUAL')
  const [installments, setInstallments] = useState(1)

  // TODO: connect bank/CCI fields to API submission
  const [bank, setBank] = useState('')
  const [cci, setCci] = useState('')
  const [consentCredit, setConsentCredit] = useState(false)
  const [consentTerms, setConsentTerms] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    kycRepository.getStatus()
      .then(s => setKycApproved(s.isIdentityVerified))
      .catch(() => setKycApproved(false))
  }, [])

  const form = useForm<RequestInput>({
    resolver: zodResolver(requestSchema),
    defaultValues: { amount: PRODUCT_CONFIG.EXPRESS.defaultAmount, productType: 'EXPRESS' },
  })

  const amount = form.watch('amount')
  const cfg = PRODUCT_CONFIG[productType]

  const handleProductChange = (p: ProductKey) => {
    const c = PRODUCT_CONFIG[p]
    setProductType(p)
    form.setValue('productType', p)
    form.setValue('amount', c.defaultAmount)
    setFrequency(c.defaultFrequency)
    setInstallments(c.defaultInstallments)
  }

  const runSimulation = useCallback(async (amt: number, prod: ProductKey, freq: string, inst: number) => {
    const c = PRODUCT_CONFIG[prod]
    if (!amt || amt < c.minAmount || amt > c.maxAmount) { setSimulation(null); return }
    setSimLoading(true)
    try {
      const result = await loanRepository.simulate({ amount: amt, productType: prod, paymentFrequency: freq, numInstallments: inst })
      setSimulation(result)
    } catch {
      setSimulation(null)
    } finally {
      setSimLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => runSimulation(amount, productType, frequency, installments), 400)
    return () => clearTimeout(t)
  }, [amount, productType, frequency, installments, runSimulation])

  const onSubmit = async (values: RequestInput) => {
    try {
      await requestLoan({
        amount: values.amount,
        productType: values.productType,
        paymentFrequency: frequency,
        numInstallments: installments,
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

  const canSubmit = !form.formState.isSubmitting && !!simulation && kycApproved !== null && consentCredit && consentTerms

  // Slider fill style
  const fillColor = mounted && resolvedTheme === 'dark' ? '#D4AF37' : '#0A192F'
  const trackColor = mounted && resolvedTheme === 'dark' ? 'rgba(255,255,255,0.12)' : '#E5E7EB'
  const safeAmount = Number.isNaN(amount) ? cfg.defaultAmount : amount
  const fillPct = ((safeAmount - cfg.minAmount) / (cfg.maxAmount - cfg.minAmount)) * 100
  const rangeStyle = { background: `linear-gradient(to right, ${fillColor} ${fillPct}%, ${trackColor} ${fillPct}%)` }

  // Email not verified
  if (user && !user.emailVerified) {
    return (
      <div className="space-y-6 max-w-xl">
        <div>
          <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-1">Solicitar Préstamo</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Primero necesitas verificar tu correo electrónico.</p>
        </div>
        <div className={`${cardCls} p-8 text-center`}>
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-5">
            <i className="fa-solid fa-envelope text-2xl text-blue-500" />
          </div>
          <h2 className="text-base font-semibold text-[#0A192F] dark:text-white mb-2">Verifica tu correo electrónico</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            Te enviamos un enlace de verificación a <strong className="text-[#0A192F] dark:text-white">{user.email}</strong>.
            Revisa tu bandeja de entrada (y spam) y haz clic en el enlace.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mb-6">
            Una vez verificado, recarga la página para continuar.
          </p>
          {resendSent ? (
            <p className="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
              <i className="fa-solid fa-circle-check" />
              Correo enviado — revisa tu bandeja
            </p>
          ) : (
            <button
              type="button"
              disabled={resendLoading}
              onClick={handleResendEmail}
              className="inline-flex items-center gap-2 bg-[#0A192F] dark:bg-[#00E5FF] text-white dark:text-[#0A192F] font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              {resendLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <i className="fa-solid fa-paper-plane" />
              }
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
          <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-1">Solicitar Préstamo</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Primero necesitas verificar tu identidad.</p>
        </div>
        <div className={`${cardCls} p-8 text-center`}>
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
            <i className="fa-solid fa-id-card text-2xl text-amber-500" />
          </div>
          <h2 className="text-base font-semibold text-[#0A192F] dark:text-white mb-2">Verifica tu identidad</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Para solicitar un préstamo, necesitamos verificar tu identidad con tu DNI y una selfie. Es rápido y seguro.
          </p>
          <Link
            href="/kyc"
            className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0A192F] font-medium px-6 py-2.5 rounded-lg hover:bg-[#B8941F] transition-colors text-sm"
          >
            <i className="fa-solid fa-shield-halved" />
            {' '}
            Verificar identidad ahora
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
          <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-1">Solicitar Préstamo</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">De S/ 100 a S/ 2,000 · Aprobación en minutos</p>
        </div>
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50">
            <i className="fa-solid fa-circle-check text-green-500 text-sm" />
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
              <StepHeader step={1} title="Configuración del Préstamo" subtitle="Selecciona el producto y el monto que necesitas" />
              <div className="p-6 space-y-6">

                {/* Amount slider */}
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">¿Cuánto necesitas?</p>
                    <span className="text-2xl font-bold text-[#0A192F] dark:text-white">
                      S/ {fmtAmt(safeAmount)}
                    </span>
                  </div>
                  <input
                    type="range"
                    title="Slider de monto"
                    min={cfg.minAmount}
                    max={cfg.maxAmount}
                    step={STEP}
                    value={safeAmount}
                    onChange={(e) => form.setValue('amount', Number(e.target.value), { shouldValidate: true })}
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
                    <span>S/ {cfg.maxAmount.toLocaleString('es-PE')}</span>
                  </div>
                  {form.formState.errors.amount && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.amount.message}</p>
                  )}
                </div>

                {/* Product selection */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Elige tu modalidad</p>
                  <div className="flex gap-2">
                    {(Object.keys(PRODUCT_CONFIG) as ProductKey[]).map((key) => {
                      const p = PRODUCT_CONFIG[key]
                      const selected = productType === key
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleProductChange(key)}
                          className={`flex-1 py-2.5 px-3 rounded-xl border-2 font-semibold text-sm transition-all flex flex-col items-center justify-center gap-1 ${selected
                            ? `${p.borderActive} ${p.accentBg} text-[#0A192F] dark:text-white`
                            : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'
                            }`}
                        >
                          <i className={`${p.icon} text-sm ${selected ? p.textActive : ''}`} />
                          <span className="text-xs font-semibold">{p.label}</span>
                          <span className={`text-[10px] font-normal ${selected ? 'opacity-80' : 'text-gray-400 dark:text-gray-500'}`}>{p.sublabel}</span>
                        </button>
                      )
                    })}
                  </div>
                  {/* PLUS badge */}
                  {productType === 'PLUS' && (
                    <p className="text-xs text-purple-400 dark:text-purple-300 mt-2 flex items-center gap-1.5">
                      <i className="fa-solid fa-lock text-[10px]" />
                      {' '}
                      Disponible para clientes con 10+ préstamos pagados
                    </p>
                  )}
                </div>

                {/* Frequency + Installments */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="frequency" className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Frecuencia
                    </label>
                    {productType === 'PLUS' ? (
                      <div className={`${inputCls} opacity-60 cursor-default w-full h-11.5 flex items-center`}>Mensual</div>
                    ) : (
                      <Select id="frequency" value={frequency} onValueChange={(v) => setFrequency(v as 'QUINCENAL' | 'MENSUAL')}>
                        <SelectTrigger className="w-full h-11.5 rounded-lg border-gray-100 dark:border-white/6 bg-[#F9FAFB] dark:bg-[#0F172A] text-gray-800 dark:text-gray-200 px-4 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MENSUAL">Mensual</SelectItem>
                          <SelectItem value="QUINCENAL">Quincenal</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <label htmlFor="installments" className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Cuotas
                    </label>
                    {productType === 'EXPRESS' ? (
                      <div className={`${inputCls} opacity-60 cursor-default w-full h-11.5 flex items-center`}>1 cuota</div>
                    ) : (
                      <Select id="installments" value={String(installments)} onValueChange={(v) => setInstallments(Number(v))}>
                        <SelectTrigger className="w-full h-11.5 rounded-lg border-gray-100 dark:border-white/6 bg-[#F9FAFB] dark:bg-[#0F172A] text-gray-800 dark:text-gray-200 px-4 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {range(cfg.minInstallments, cfg.maxInstallments).map(n => (
                            <SelectItem key={n} value={String(n)}>{n} cuota{n > 1 ? 's' : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 — Cuenta de Depósito (CCI) */}
            <div className={cardCls}>
              <StepHeader step={2} title="Cuenta de Depósito (CCI)" subtitle="Ingresa la cuenta donde recibirás el préstamo" />
              <div className="p-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-lg p-3 mb-5 flex items-start gap-3">
                  <i className="fa-solid fa-circle-info text-blue-500 dark:text-blue-400 mt-0.5 shrink-0 text-sm" />
                  <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                    Esta es la cuenta donde depositaremos tu préstamo una vez aprobado. Asegúrate de que esté a tu nombre y sea válida en Perú.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bank" className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Banco</label>
                    {/* TODO: connect bank to API submission */}
                    <Select id="bank" value={bank} onValueChange={v => setBank(v ?? '')}>
                      <SelectTrigger className="w-full py-2.5">
                        <SelectValue placeholder="Seleccione su banco" />
                      </SelectTrigger>
                      <SelectContent>
                        {BANKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="cci" className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">CCI (20 dígitos)</label>
                    {/* TODO: connect CCI to API submission */}
                    <input
                      type="text"
                      id="cci"
                      value={cci}
                      onChange={e => setCci(e.target.value.replaceAll(/\D/g, '').slice(0, 20))}
                      placeholder="00000000000000000000"
                      maxLength={20}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 — Confirmación y Envío */}
            <div className={cardCls}>
              <StepHeader step={3} title="Confirmación y Envío" subtitle="Acepta los términos para enviar tu solicitud" />
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <Checkbox
                      checked={consentCredit}
                      onCheckedChange={checked => setConsentCredit(checked)}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Autorizo a Solvo a consultar mi historial crediticio en las Centrales de Riesgo (Equifax/Sentinel) conforme a la normativa SBS para evaluar esta solicitud.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <Checkbox
                      checked={consentTerms}
                      onCheckedChange={checked => setConsentTerms(checked)}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Acepto los{' '}
                      <Link href="#" className="text-[#0A192F] dark:text-[#D4AF37] font-medium hover:underline">Términos y Condiciones</Link>
                      {' '}y la{' '}
                      <Link href="#" className="text-[#0A192F] dark:text-[#D4AF37] font-medium hover:underline">Política de Privacidad</Link>
                      {' '}de Solvo.
                    </span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-white/6 pt-5">
                  <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                    <i className="fa-solid fa-lock text-[#0A192F] dark:text-[#D4AF37]" />
                    Protegido por Ley N° 29733 · Regulado por SBS
                  </p>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full sm:w-auto bg-[#D4AF37] text-[#0A192F] font-medium px-6 py-2.5 cursor-pointer rounded-lg flex items-center justify-center gap-2 hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {form.formState.isSubmitting
                      ? <><Loader2 className="h-4 w-4 animate-spin" />Enviando...</>
                      : <><i className="fa-solid fa-paper-plane" />Enviar solicitud</>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: simulation summary ─────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className={`${cardCls} sticky top-8`}>
              <div className="p-5 border-b border-gray-100 dark:border-white/6">
                <h2 className="text-base font-semibold text-[#0A192F] dark:text-white">Resumen del préstamo</h2>
              </div>
              <div className="p-5">
                {simLoading || !simulation ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
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
                      <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(simulation.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Interés (TEA {simulation.teaPercent}%)</span>
                      <span className="text-gray-800 dark:text-gray-200">{formatCurrency(simulation.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        Com. mantenimiento <InfoTooltip text={TOOLTIPS.maintenanceFee} />
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {formatCurrency(simulation.maintenanceFeeTotal)}
                        {simulation.numInstallments > 1 && (
                          <span className="text-xs text-gray-400 ml-1">
                            ({formatCurrency(simulation.maintenanceFee)} × {simulation.numInstallments})
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between font-bold border-t border-gray-100 dark:border-white/6 pt-3">
                      <span className="text-[#0A192F] dark:text-white">Total a devolver</span>
                      <span className="text-[#0A192F] dark:text-[#D4AF37] text-base">{formatCurrency(simulation.totalAmount)}</span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{simulation.numInstallments === 1 ? 'Cuota única' : `${simulation.numInstallments} cuotas de`}</span>
                      <span>{formatCurrency(simulation.installmentAmount)}</span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        Com. desembolso <InfoTooltip text={TOOLTIPS.disbursementFee} />
                      </span>
                      <span className="text-amber-500">− {formatCurrency(simulation.disbursementFee)}</span>
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
                      <p className="font-semibold text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Comisiones distribuidas</p>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">Com. tecnología <InfoTooltip text={TOOLTIPS.techFee} /></span>
                        <span>{formatCurrency(simulation.techFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">IGV (18%) <InfoTooltip text={TOOLTIPS.igv} /></span>
                        <span>{formatCurrency(simulation.igvAmount)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-100 dark:border-white/6 pt-1.5 font-medium text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1">TCEA <InfoTooltip text={TOOLTIPS.tcea} /></span>
                        <span>{simulation.tceaPercent}% anual</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="w-full mt-2 bg-[#D4AF37] text-[#0A192F] font-medium py-3 cursor-pointer rounded-lg flex items-center justify-center gap-2 hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {form.formState.isSubmitting
                        ? <><Loader2 className="h-4 w-4 animate-spin" />Enviando solicitud...</>
                        : <><i className="fa-solid fa-paper-plane" />Solicitar préstamo ahora</>}
                    </button>

                    {(!consentCredit || !consentTerms) && (
                      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                        <i className="fa-solid fa-circle-info mr-1" />
                        Acepta los términos en el paso 3 para continuar
                      </p>
                    )}
                  </div>
                )}

                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
                  <i className="fa-solid fa-shield-halved mr-1" />
                  Datos cifrados · Regulado por SBS · Ley N° 29733
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
