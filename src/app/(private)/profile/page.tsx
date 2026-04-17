'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth'
import { authRepository } from '@/features/auth'
import { apiClient } from '@/shared/api/client'
import { bankAccountRepository, type BankAccount } from '@/features/request-loan/api/bankAccountRepository'
import { loanRepository } from '@/features/request-loan'
import { catalogRepository, type BankEntry } from '@/shared/api/catalogRepository'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Input } from '@/shared/ui/input'
import type { AuthUser } from '@/entities/user'
import type { LoanLimits } from '@/entities/loan'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'

type Section = 'personal' | 'banking' | 'security' | 'notifications'

const NAV_ITEMS: { id: Section; icon: string; label: string }[] = [
  { id: 'personal',      icon: 'fa-regular fa-user',          label: 'Información Personal' },
  { id: 'banking',       icon: 'fa-solid fa-building-columns', label: 'Datos Bancarios' },
  { id: 'security',      icon: 'fa-solid fa-shield-halved',    label: 'Seguridad' },
  { id: 'notifications', icon: 'fa-regular fa-bell',           label: 'Notificaciones' },
]

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  LOW:       { label: 'Bajo',     color: 'text-green-600 dark:text-green-400',   bg: 'bg-green-100 dark:bg-green-900/20' },
  MEDIUM:    { label: 'Medio',    color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
  HIGH:      { label: 'Alto',     color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/20' },
  VERY_HIGH: { label: 'Muy alto', color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-100 dark:bg-red-900/20' },
}

const TIER_CONFIG: Record<string, { label: string; desc: string; color: string }> = {
  TIER_A:  { label: 'Tier A', desc: 'Aprobación automática',  color: 'text-green-600 dark:text-green-400' },
  TIER_B:  { label: 'Tier B', desc: 'Revisión estándar',      color: 'text-[#D4AF37]' },
  TIER_C:  { label: 'Tier C', desc: 'Revisión detallada',     color: 'text-orange-500' },
  TIER_D:  { label: 'Tier D', desc: 'Revisión restrictiva',   color: 'text-red-500' },
  UNKNOWN: { label: '—',      desc: 'Sin evaluación',         color: 'text-gray-400' },
}

interface CreditScoreData {
  internalScore: number
  tier: string | null
  riskLevel: string
  isEligibleForAutoApproval: boolean
  paidLoansCount?: number
}

type NotifKey = 'paymentReminder' | 'paymentConfirm' | 'loanStatus' | 'promotions' | 'smsAlerts' | 'smsMovements' | 'smsSecurity'
type Notifs = Record<NotifKey, boolean>

const DEFAULT_NOTIFS: Notifs = {
  paymentReminder: true,
  paymentConfirm: true,
  loanStatus: true,
  promotions: false,
  smsAlerts: true,
  smsMovements: true,
  smsSecurity: true,
}

function Toggle({ checked, onChange }: Readonly<{ checked: boolean; onChange: (v: boolean) => void }>) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#0A192F] dark:bg-[#D4AF37]' : 'bg-gray-200 dark:bg-gray-600'}`}
      title="Toggle"
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

export default function ProfilePage() {
  const { user } = useAuthStore()
  const searchParams = useSearchParams()
  const initialSection = (searchParams.get('section') as Section | null)
  const [activeSection, setActiveSection] = useState<Section>(
    initialSection && ['personal', 'banking', 'security', 'notifications'].includes(initialSection)
      ? initialSection
      : 'personal'
  )
  const [profile, setProfile] = useState<AuthUser | null>(null)
  const [score, setScore] = useState<CreditScoreData | null>(null)
  const [scoreLoading, setScoreLoading] = useState(false)
  const [loanLimits, setLoanLimits] = useState<LoanLimits | null>(null)

  // 6-B: inline change-password state
  const [showPwForm, setShowPwForm] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwDone, setPwDone] = useState(false)

  // Banking state
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false)
  const [bankMaxAccounts, setBankMaxAccounts] = useState(1)
  const [bankPaidLoans, setBankPaidLoans] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ bankName: '', cci: '', alias: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [bankCatalog, setBankCatalog] = useState<BankEntry[]>([])

  // 6-C: notification preferences
  const [notifs, setNotifs] = useState<Notifs>(DEFAULT_NOTIFS)
  const [notifsLoading, setNotifsLoading] = useState(false)
  const [notifsSaving, setNotifsSaving] = useState(false)

  const loadBankAccounts = useCallback(async () => {
    setBankAccountsLoading(true)
    try {
      const result = await bankAccountRepository.getMyAccounts()
      setBankAccounts(result.accounts)
      setBankMaxAccounts(result.maxAccounts)
      setBankPaidLoans(result.paidLoansCount)
    } catch {
      toast.error('No se pudieron cargar las cuentas bancarias')
    } finally {
      setBankAccountsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeSection === 'banking') {
      loadBankAccounts()
      if (bankCatalog.length === 0) {
        catalogRepository.getBanks()
          .then(banks => { setBankCatalog(banks); setAddForm(f => ({ ...f, bankName: banks[0]?.id ?? '' })) })
          .catch(() => {})
      }
    }
  }, [activeSection, loadBankAccounts, bankCatalog.length])

  // Load full profile (phone + DNI), credit score, and notification prefs on mount
  useEffect(() => {
    authRepository.getMyProfile()
      .then(setProfile)
      .catch(() => { /* fallback to auth store user */ })

    setScoreLoading(true)
    apiClient.get('/scoring/me')
      .then(res => setScore(res.data.data))
      .catch(() => setScore(null))
      .finally(() => setScoreLoading(false))

    loanRepository.getMyLimits()
      .then(setLoanLimits)
      .catch(() => setLoanLimits(null))

    setNotifsLoading(true)
    apiClient.get('/users/me/preferences')
      .then(res => {
        const prefs = res.data.data as Record<string, boolean>
        if (prefs && Object.keys(prefs).length > 0) {
          setNotifs(prev => ({ ...prev, ...prefs }))
        }
      })
      .catch(() => { /* keep defaults */ })
      .finally(() => setNotifsLoading(false))
  }, [])

  const displayUser = profile ?? user
  if (!displayUser) return null

  const initials = `${displayUser.firstName.charAt(0)}${displayUser.lastName.charAt(0)}`.toUpperCase()

  // 6-B: change password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) { toast.error('Las contraseñas no coinciden'); return }
    if (newPw.length < 8) { toast.error('La nueva contraseña debe tener al menos 8 caracteres'); return }
    setPwLoading(true)
    try {
      await authRepository.changePassword(currentPw, newPw)
      setPwDone(true)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      toast.success('Contraseña actualizada correctamente')
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Error al cambiar la contraseña')
    } finally {
      setPwLoading(false)
    }
  }

  // 6-C: toggle preference and save to API
  const handleToggleNotif = useCallback(async (key: NotifKey, value: boolean) => {
    const next = { ...notifs, [key]: value }
    setNotifs(next)
    setNotifsSaving(true)
    try {
      await apiClient.patch('/users/me/preferences', next)
    } catch {
      // revert on failure
      setNotifs(notifs)
      toast.error('No se pudieron guardar las preferencias')
    } finally {
      setNotifsSaving(false)
    }
  }, [notifs])

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{20}$/.test(addForm.cci)) { toast.error('El CCI debe tener exactamente 20 dígitos'); return }
    setAddLoading(true)
    try {
      await bankAccountRepository.addAccount({
        bankName: addForm.bankName,
        cci: addForm.cci,
        alias: addForm.alias || undefined,
        isDefault: bankAccounts.length === 0,
      })
      toast.success('Cuenta bancaria agregada')
      setAddForm({ bankName: bankCatalog[0]?.id ?? '', cci: '', alias: '' })
      setShowAddForm(false)
      await loadBankAccounts()
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? (err as Error).message ?? 'Error al agregar cuenta')
    } finally {
      setAddLoading(false)
    }
  }

  const handleDeleteAccount = async (id: string) => {
    try {
      await bankAccountRepository.deleteAccount(id)
      toast.success('Cuenta eliminada')
      await loadBankAccounts()
    } catch {
      toast.error('No se pudo eliminar la cuenta')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await bankAccountRepository.setDefaultAccount(id)
      toast.success('Cuenta predeterminada actualizada')
      await loadBankAccounts()
    } catch {
      toast.error('No se pudo actualizar la cuenta predeterminada')
    }
  }

  const tierKey = score?.tier ?? 'UNKNOWN'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-gray-100 dark:border-white/6">
        <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-2 tracking-tight">Mi Perfil</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Gestiona tu información personal, seguridad y preferencias.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Inner sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-1 md:sticky md:top-8">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-left transition-colors ${activeSection === item.id
                  ? 'bg-[#0A192F]/5 dark:bg-[#00E5FF]/10 text-[#0A192F] dark:text-[#D4AF37]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A] hover:text-[#0A192F] dark:hover:text-white'
                  }`}
              >
                <i className={`${item.icon} w-5 text-center`} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content area */}
        <div className="grow space-y-6">

          {/* ── Personal info ──────────────────────────────────────────── */}
          {activeSection === 'personal' && (
            <>
              <div className={cardCls}>
                <div className="p-6 border-b border-gray-100 dark:border-white/6">
                  <h2 className="text-xl font-bold text-[#0A192F] dark:text-white">Información Personal</h2>
                </div>
                <div className="p-6">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-white/6">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#0A192F] to-[#00E5FF] flex items-center justify-center text-white text-3xl font-semibold shadow-md shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#0A192F] dark:text-white">
                        {displayUser.firstName} {displayUser.lastName}
                      </h3>
                      <p className="text-sm mt-0.5">
                        {displayUser.emailVerified
                          ? <span className="text-green-600 dark:text-green-400"><i className="fa-solid fa-circle-check mr-1.5" />Email verificado</span>
                          : <span className="text-red-500 dark:text-red-400"><i className="fa-solid fa-circle-xmark mr-1.5" />Email no verificado</span>}
                      </p>
                      <p className="text-sm mt-0.5">
                        {displayUser.isIdentityVerified
                          ? <span className="text-green-600 dark:text-green-400"><i className="fa-solid fa-id-card mr-1.5" />Identidad verificada</span>
                          : <span className="text-gray-500 dark:text-gray-400"><i className="fa-regular fa-id-card mr-1.5" />Identidad pendiente</span>}
                      </p>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Nombre', value: displayUser.firstName },
                      { label: 'Apellido', value: displayUser.lastName },
                      { label: 'Correo Electrónico', value: displayUser.email },
                      { label: 'DNI / CE', value: profile?.dni ?? '—' },
                      { label: 'Celular', value: profile?.phone ?? '—' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          {f.label}
                        </label>
                        <p className="text-gray-800 dark:text-gray-200 font-medium text-sm">{f.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Credit score card */}
              <div className={cardCls}>
                <div className="p-6 border-b border-gray-100 dark:border-white/6">
                  <h2 className="text-xl font-bold text-[#0A192F] dark:text-white">Perfil Crediticio</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Basado en tu historial con Crevo y fuentes externas</p>
                </div>

                {scoreLoading ? (
                  <div className="p-6 flex items-center justify-center gap-3 text-gray-400">
                    <i className="fa-solid fa-spinner animate-spin" />
                    <span className="text-sm">Cargando evaluación...</span>
                  </div>
                ) : !score ? (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                      <i className="fa-solid fa-chart-line text-gray-400 text-lg" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sin evaluación crediticia</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completa la verificación de identidad para obtener tu score.</p>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                      {/* Score */}
                      <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0F172A] rounded-xl p-5 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Score interno</p>
                        <div className="relative w-20 h-20 mb-2">
                          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-200 dark:text-white/10" />
                            <circle
                              cx="18" cy="18" r="15.9" fill="none"
                              stroke="currentColor" strokeWidth="2.5"
                              strokeDasharray={`${(score.internalScore / 999) * 100} 100`}
                              strokeLinecap="round"
                              className="text-[#00E5FF]"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#0A192F] dark:text-white">
                            {score.internalScore}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">de 999 pts</p>
                      </div>

                      {/* Risk + Tier */}
                      <div className="flex flex-col gap-4 justify-center">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Nivel de riesgo</p>
                          {(() => {
                            const cfg = RISK_CONFIG[score.riskLevel] ?? RISK_CONFIG['MEDIUM']
                            return (
                              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                                <i className="fa-solid fa-circle text-[8px]" />
                                {cfg.label}
                              </span>
                            )
                          })()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Categoría</p>
                          {(() => {
                            const cfg = TIER_CONFIG[tierKey]
                            return (
                              <div>
                                <p className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{cfg.desc}</p>
                              </div>
                            )
                          })()}
                        </div>
                      </div>

                      {/* Limits */}
                      <div className="flex flex-col gap-4 justify-center">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Tope aprobado</p>
                          {loanLimits ? (
                            <p className="text-lg font-bold text-[#0A192F] dark:text-white">
                              S/ {Math.max(
                                loanLimits.limits.EXPRESS.available ? loanLimits.limits.EXPRESS.maxAmount : 0,
                                loanLimits.limits.FLEX.available    ? loanLimits.limits.FLEX.maxAmount    : 0,
                                loanLimits.limits.PLUS.available    ? loanLimits.limits.PLUS.maxAmount    : 0,
                              ).toLocaleString('es-PE')}
                            </p>
                          ) : (
                            <p className="text-lg font-bold text-gray-400">—</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Préstamos pagados</p>
                          <p className="text-lg font-bold text-[#0A192F] dark:text-white">
                            {loanLimits?.paidLoansCount ?? '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Banking data ───────────────────────────────────────────── */}
          {activeSection === 'banking' && (
            <div className="space-y-6">
              <div className={cardCls}>
                <div className="p-6 border-b border-gray-100 dark:border-white/6">
                  <h2 className="text-xl font-bold text-[#0A192F] dark:text-white">Datos Bancarios</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Gestiona las cuentas donde recibirás tus préstamos
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Tier progress bar */}
                  {(() => {
                    const tiers = [
                      { label: '1 cuenta', required: 0 },
                      { label: '2 cuentas', required: 3 },
                      { label: '3 cuentas', required: 10 },
                    ]
                    return (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Cuentas disponibles según tu historial</p>
                        <div className="flex gap-2">
                          {tiers.map((tier, i) => {
                            const unlocked = bankPaidLoans >= tier.required
                            const isActive = i + 1 === bankMaxAccounts
                            return (
                              <div key={i} className={`flex-1 rounded-lg px-3 py-2.5 border text-center transition-colors
                                ${unlocked
                                  ? isActive
                                    ? 'border-[#0A192F] dark:border-[#D4AF37] bg-[#0A192F]/5 dark:bg-[#D4AF37]/10'
                                    : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                                  : 'border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-[#0F172A] opacity-60'
                                }`}
                              >
                                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                  {unlocked
                                    ? <i className="fa-solid fa-circle-check text-green-500 text-xs" />
                                    : <i className="fa-solid fa-lock text-gray-400 text-xs" />
                                  }
                                  <span className={`text-xs font-semibold ${unlocked ? 'text-[#0A192F] dark:text-white' : 'text-gray-400'}`}>
                                    {tier.label}
                                  </span>
                                </div>
                                {tier.required > 0 && (
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                    {tier.required} préstamos pagados
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Tienes <span className="font-semibold text-[#0A192F] dark:text-white">{bankPaidLoans}</span> préstamo(s) pagado(s) · Puedes registrar hasta <span className="font-semibold text-[#0A192F] dark:text-white">{bankMaxAccounts}</span> cuenta(s)
                        </p>
                      </div>
                    )
                  })()}

                  {/* Account list */}
                  {bankAccountsLoading ? (
                    <div className="flex items-center justify-center gap-3 py-8 text-gray-400">
                      <i className="fa-solid fa-spinner animate-spin" />
                      <span className="text-sm">Cargando cuentas...</span>
                    </div>
                  ) : bankAccounts.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                        <i className="fa-solid fa-building-columns text-xl text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sin cuentas registradas</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Agrega una cuenta CCI para recibir tus préstamos.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bankAccounts.map(account => (
                        <div key={account.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-[#0F172A]">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-[#0A192F]/5 dark:bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                              <i className="fa-solid fa-building-columns text-[#0A192F] dark:text-[#D4AF37] text-sm" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-[#0A192F] dark:text-white text-sm">{account.bankName}</span>
                                {account.isDefault && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[#0A192F]/10 dark:bg-[#D4AF37]/15 text-[#0A192F] dark:text-[#D4AF37]">
                                    <i className="fa-solid fa-star text-[8px]" />
                                    Predeterminada
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                ****{account.cci.slice(-4)}
                                {account.alias ? ` · ${account.alias}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {!account.isDefault && (
                              <button
                                onClick={() => handleSetDefault(account.id)}
                                className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1E293B] transition-colors"
                              >
                                Predeterminar
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAccount(account.id)}
                              className="text-xs px-2.5 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            >
                              <i className="fa-solid fa-trash-can" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add account */}
                  {bankAccounts.length < bankMaxAccounts && (
                    <div>
                      {!showAddForm ? (
                        <button
                          onClick={() => setShowAddForm(true)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-[#0A192F] dark:hover:border-[#D4AF37] hover:text-[#0A192F] dark:hover:text-[#D4AF37] transition-colors"
                        >
                          <i className="fa-solid fa-plus text-xs" />
                          Agregar cuenta
                        </button>
                      ) : (
                        <form onSubmit={handleAddAccount} className="space-y-3 p-4 rounded-xl border border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-[#0F172A]">
                          <p className="text-sm font-semibold text-[#0A192F] dark:text-white mb-1">Nueva cuenta bancaria</p>

                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Banco</label>
                            <Select value={addForm.bankName} onValueChange={v => setAddForm(f => ({ ...f, bankName: v ?? '' }))}>
                              <SelectTrigger className="w-full text-sm">
                                <SelectValue placeholder="Selecciona un banco" />
                              </SelectTrigger>
                              <SelectContent>
                                {bankCatalog.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">CCI (20 dígitos)</label>
                            <Input
                              type="text"
                              inputMode="numeric"
                              maxLength={20}
                              value={addForm.cci}
                              onChange={e => setAddForm(f => ({ ...f, cci: e.target.value.replace(/\D/g, '') }))}
                              placeholder="00000000000000000000"
                              required
                              className="font-mono tracking-wider"
                            />
                            <p className="text-[10px] text-gray-400 mt-0.5">{addForm.cci.length}/20 dígitos</p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Alias (opcional)</label>
                            <Input
                              type="text"
                              value={addForm.alias}
                              onChange={e => setAddForm(f => ({ ...f, alias: e.target.value }))}
                              placeholder="Ej: Cuenta principal"
                            />
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              type="submit"
                              disabled={addLoading || addForm.cci.length !== 20}
                              className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                            >
                              {addLoading && <i className="fa-solid fa-spinner animate-spin text-xs" />}
                              Guardar cuenta
                            </button>
                            <button
                              type="button"
                              onClick={() => { setShowAddForm(false); setAddForm({ bankName: bankCatalog[0]?.id ?? '', cci: '', alias: '' }) }}
                              className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1E293B] transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Security ───────────────────────────────────────────────── */}
          {activeSection === 'security' && (
            <div className={cardCls}>
              <div className="p-6 border-b border-gray-100 dark:border-white/6">
                <h2 className="text-xl font-bold text-[#0A192F] dark:text-white">Seguridad</h2>
              </div>
              <div className="p-6 space-y-6">

                {/* Change password */}
                <div className="pb-6 border-b border-gray-100 dark:border-white/6">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-[#0A192F] dark:text-white text-sm">Contraseña</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Actualiza tu contraseña actual
                      </p>
                      {pwDone && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                          <i className="fa-solid fa-circle-check" />
                          Contraseña actualizada correctamente.
                        </p>
                      )}
                    </div>
                    {!showPwForm && !pwDone && (
                      <button
                        onClick={() => setShowPwForm(true)}
                        className="shrink-0 px-4 py-2 border border-gray-100 dark:border-white/6 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
                      >
                        Cambiar
                      </button>
                    )}
                  </div>

                  {showPwForm && !pwDone && (
                    <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Contraseña actual
                        </label>
                        <Input
                          type="password"
                          value={currentPw}
                          onChange={e => setCurrentPw(e.target.value)}
                          required
                          autoComplete="current-password"
                          className="max-w-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Nueva contraseña
                        </label>
                        <Input
                          type="password"
                          value={newPw}
                          onChange={e => setNewPw(e.target.value)}
                          required
                          minLength={8}
                          autoComplete="new-password"
                          className="max-w-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Confirmar nueva contraseña
                        </label>
                        <Input
                          type="password"
                          value={confirmPw}
                          onChange={e => setConfirmPw(e.target.value)}
                          required
                          autoComplete="new-password"
                          className="max-w-sm"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={pwLoading}
                          className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        >
                          {pwLoading && <i className="fa-solid fa-spinner animate-spin text-xs" />}
                          Actualizar contraseña
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowPwForm(false); setCurrentPw(''); setNewPw(''); setConfirmPw('') }}
                          className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Biometric */}
                <div className="flex justify-between items-center pb-6 border-b border-gray-100 dark:border-white/6">
                  <div>
                    <h3 className="font-semibold text-[#0A192F] dark:text-white text-sm">Autenticación Biométrica</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Próximamente disponible en app móvil</p>
                  </div>
                  <Toggle checked={false} onChange={() => {}} />
                </div>

                {/* 2FA */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-[#0A192F] dark:text-white text-sm">Autenticación de Dos Factores (2FA)</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Próximamente disponible</p>
                  </div>
                  <Toggle checked={false} onChange={() => {}} />
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications ──────────────────────────────────────────── */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              {notifsLoading ? (
                <div className="flex items-center gap-3 text-gray-400 py-8 justify-center">
                  <i className="fa-solid fa-spinner animate-spin" />
                  <span className="text-sm">Cargando preferencias...</span>
                </div>
              ) : (
                <>
                  <div className={cardCls}>
                    <div className="p-6 border-b border-gray-100 dark:border-white/6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-[#0A192F] dark:text-white mb-0.5">Preferencias de Notificación</h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Configura cómo quieres recibir alertas</p>
                        </div>
                        {notifsSaving && (
                          <span className="text-xs text-gray-400 flex items-center gap-1.5">
                            <i className="fa-solid fa-spinner animate-spin text-[10px]" />
                            Guardando...
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Por correo electrónico</h3>
                      <div className="space-y-3">
                        {([
                          { key: 'paymentReminder' as NotifKey, label: 'Recordatorio de pago',  desc: '7 días antes de tu cuota' },
                          { key: 'paymentConfirm'  as NotifKey, label: 'Confirmación de pago',  desc: 'Al realizarse un pago exitoso' },
                          { key: 'loanStatus'      as NotifKey, label: 'Estado de solicitud',   desc: 'Actualizaciones de tu préstamo' },
                          { key: 'promotions'      as NotifKey, label: 'Ofertas y promociones', desc: 'Descuentos y nuevos productos' },
                        ]).map(item => (
                          <div key={item.key} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-[#0F172A]">
                            <div>
                              <h3 className="font-semibold text-[#0A192F] dark:text-white text-sm">{item.label}</h3>
                              <p className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</p>
                            </div>
                            <Toggle checked={notifs[item.key]} onChange={v => handleToggleNotif(item.key, v)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={cardCls}>
                    <div className="p-6">
                      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Por SMS</h3>
                      <div className="space-y-3">
                        {([
                          { key: 'smsAlerts'    as NotifKey, label: 'Alertas de pago',       desc: 'Recordatorio 1 día antes' },
                          { key: 'smsMovements' as NotifKey, label: 'Movimientos de cuenta', desc: 'Cada transacción realizada' },
                          { key: 'smsSecurity'  as NotifKey, label: 'Alertas de seguridad',  desc: 'Accesos sospechosos' },
                        ]).map(item => (
                          <div key={item.key} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-[#0F172A]">
                            <div>
                              <h3 className="font-semibold text-[#0A192F] dark:text-white text-sm">{item.label}</h3>
                              <p className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</p>
                            </div>
                            <Toggle checked={notifs[item.key]} onChange={v => handleToggleNotif(item.key, v)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
