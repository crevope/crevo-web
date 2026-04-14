'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLoanStore } from '@/features/request-loan'
import { formatCurrency, formatDate, loanRef } from '@/shared/lib/utils'
import type { Loan } from '@/entities/loan'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'
import { Input } from '@/shared/ui/input'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'

const ACTIVE_STATUSES = ['APPROVED', 'SIGNED', 'ACTIVE', 'OVERDUE']
const REVIEW_STATUSES = ['PENDING']
const CLOSED_STATUSES = ['PAID', 'REJECTED', 'CANCELLED']

type Tab = 'activos' | 'revision' | 'cerrados'
type Sort = 'recent' | 'amount_high' | 'amount_low' | 'due_soon'

function statusBorderColor(status: string) {
  if (ACTIVE_STATUSES.includes(status)) return 'border-l-[#D4AF37]'
  if (REVIEW_STATUSES.includes(status)) return 'border-l-[#00E5FF]'
  return 'border-l-gray-300 dark:border-l-[#334155]'
}

function statusBadge(status: string) {
  if (ACTIVE_STATUSES.includes(status))
    return <span className="px-2.5 py-0.5 bg-[#D4AF37]/10 text-yellow-700 dark:text-[#D4AF37] text-xs font-medium rounded-full">Activo</span>
  if (REVIEW_STATUSES.includes(status))
    return <span className="px-2.5 py-0.5 bg-[#00E5FF]/10 text-cyan-700 dark:text-[#00E5FF] text-xs font-medium rounded-full">En revisión</span>
  if (status === 'PAID')
    return <span className="px-2.5 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">Pagado</span>
  return <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs font-medium rounded-full">{status}</span>
}

function LoanCard({ loan }: Readonly<{ loan: Loan }>) {
  const isActive = ACTIVE_STATUSES.includes(loan.status)
  const isReview = REVIEW_STATUSES.includes(loan.status)
  const isPaid = loan.status === 'PAID'
  const ref = `#${loanRef(loan.id)}`

  return (
    <div className={`${cardCls} p-6 border-l-2 ${statusBorderColor(loan.status)} hover:bg-gray-50 dark:hover:bg-[#0F172A]/50 transition-colors`}>
      <div className="flex flex-col lg:flex-row justify-between gap-6">

        {/* Left */}
        <div className="flex-1 space-y-4">
          {/* Title row */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-base font-semibold text-[#0A192F] dark:text-white">
                  Préstamo Crevo
                </h3>
                {statusBadge(loan.status)}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ref: {ref}</p>
            </div>
            <div className="text-right hidden lg:block">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monto Original</p>
              <p className="text-lg font-semibold text-[#0A192F] dark:text-white">
                {formatCurrency(loan.amount)}
              </p>
            </div>
          </div>

          {/* Data grid */}
          {isReview ? (
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#0F172A] p-3 rounded-xl border border-gray-100 dark:border-white/6">
              <i className="fa-solid fa-circle-info text-[#00E5FF]" />
              <span>Tu solicitud está siendo analizada por nuestro equipo. Recibirás una respuesta en las próximas 24-48 horas.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-white/6">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Saldo Pendiente</p>
                {/* TODO: fetch balance per loan for real remaining amount */}
                <p className="text-sm font-bold text-[#0A192F] dark:text-white">
                  {formatCurrency(loan.amount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Plazo</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {loan.termDays} días
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Próxima Cuota</p>
                {/* TODO: fetch installment schedule for due amount */}
                <p className={`text-sm font-bold ${isActive ? 'text-yellow-600 dark:text-[#D4AF37]' : 'text-gray-500 dark:text-gray-400'}`}>
                  —
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Vencimiento</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {loan.dueDate ? formatDate(loan.dueDate) : '—'}
                </p>
              </div>
            </div>
          )}

          {/* Progress bar (only for active/paid) */}
          {!isReview && (
            <div className="w-full bg-gray-200 dark:bg-[#334155] rounded-full h-1.5 mt-2">
              <div
                className={`h-1.5 rounded-full ${isPaid ? 'bg-green-500' : 'bg-[#D4AF37]'}`}
                style={{ width: isPaid ? '100%' : '50%' }}
              />
            </div>
          )}
        </div>

        {/* Right buttons */}
        <div className="flex flex-row lg:flex-col gap-2.5 justify-start lg:justify-center lg:w-44 lg:border-l lg:border-gray-100 dark:lg:border-white/6 lg:pl-5">
          {isActive && (
            <Link
              href={`/loans/${loan.id}/pay`}
              className="flex-1 lg:flex-none bg-[#D4AF37] text-[#0A192F] font-medium py-2 px-4 rounded-lg text-sm text-center hover:bg-[#B8941F] transition-colors"
            >
              Pagar ahora
            </Link>
          )}
          <Link
            href={`/loans/${loan.id}`}
            className="flex-1 lg:flex-none bg-white dark:bg-[#0F172A] hover:bg-gray-50 dark:hover:bg-[#334155] text-[#0A192F] dark:text-gray-200 py-2 px-4 rounded-lg text-sm transition-colors border border-gray-100 dark:border-white/6 text-center font-medium"
          >
            Ver detalle
          </Link>
          {isReview && (
            <button className="flex-1 lg:flex-none bg-transparent text-gray-500 dark:text-gray-400 py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 font-medium hover:bg-gray-50 dark:hover:bg-[#0F172A]">
              <i className="fa-solid fa-download text-xs" /> Contrato
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoansPage() {
  const { loans, isLoading, loadMyLoans } = useLoanStore()
  const [activeTab, setActiveTab] = useState<Tab>('activos')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<Sort>('recent')

  useEffect(() => { loadMyLoans() }, [loadMyLoans])

  const byTab = (tab: Tab) => loans.filter(l => {
    if (tab === 'activos') return ACTIVE_STATUSES.includes(l.status)
    if (tab === 'revision') return REVIEW_STATUSES.includes(l.status)
    return CLOSED_STATUSES.includes(l.status)
  })

  const sortedAndFiltered = byTab(activeTab)
    .filter(l =>
      l.id.toLowerCase().includes(search.toLowerCase()) ||
      formatCurrency(l.amount).includes(search)
    )
    .sort((a, b) => {
      if (sort === 'amount_high') return b.amount - a.amount
      if (sort === 'amount_low') return a.amount - b.amount
      if (sort === 'due_soon') return (a.dueDate ?? '').localeCompare(b.dueDate ?? '')
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const activeCount = byTab('activos').length
  const reviewCount = byTab('revision').length
  const closedCount = byTab('cerrados').length
  const totalActive = loans
    .filter(l => ACTIVE_STATUSES.includes(l.status))
    .reduce((sum, l) => sum + l.amount, 0)

  const tabs: { id: Tab; label: string; count: number; countCls: string }[] = [
    { id: 'activos', label: 'Activos', count: activeCount, countCls: 'bg-[#D4AF37]/20 text-yellow-700 dark:text-[#D4AF37]' },
    { id: 'revision', label: 'En revisión', count: reviewCount, countCls: 'bg-[#00E5FF]/20 text-cyan-700 dark:text-[#00E5FF]' },
    { id: 'cerrados', label: 'Cerrados', count: closedCount, countCls: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-0.5">Mis Préstamos</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Gestiona y consulta el estado de todos tus préstamos en Soles (S/).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
          >
            <i className="fa-regular fa-bell" />
          </Link>
          <Link
            href="/request-loan"
            className="bg-[#D4AF37] text-[#0A192F] font-medium px-6 py-2 rounded-lg cursor-pointer flex items-center gap-2 hover:bg-[#B8941F] transition-colors"
          >
            <i className="fa-solid fa-plus text-xs" />
            {' '}
            Nuevo Préstamo
          </Link>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className={`${cardCls} p-6 flex flex-col justify-between`}>
              <div className="mb-4">
                <Skeleton className="w-9 h-9 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          ))
        ) : (
          [
            { icon: 'fa-solid fa-wallet', iconBg: 'bg-[#D4AF37]/20 text-yellow-600 dark:text-[#D4AF37]', label: 'Total Activo', value: formatCurrency(totalActive) },
            { icon: 'fa-solid fa-clock-rotate-left', iconBg: 'bg-[#00E5FF]/20 text-cyan-600 dark:text-[#00E5FF]', label: 'Próximo Pago Total', value: '—' },
            { icon: 'fa-solid fa-file-invoice', iconBg: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400', label: 'Préstamos en Revisión', value: String(reviewCount) },
          ].map(s => (
            <div key={s.label} className={`${cardCls} p-6 flex flex-col justify-between`}>
              <div className="mb-4">
                <div className={`w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center`}>
                  <i className={s.icon} />
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">{s.label}</p>
                <h3 className="text-2xl font-bold text-[#0A192F] dark:text-white">{s.value}</h3>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabs + filters */}
      <div className={`${cardCls} p-4`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Tabs */}
          <div className="flex gap-6 w-full lg:w-auto border-b border-gray-100 dark:border-white/6 lg:border-none">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 lg:pb-2 font-medium text-sm transition-all border-b-[1.5px] ${activeTab === tab.id
                  ? 'text-[#0A192F] dark:text-[#D4AF37] border-[#0A192F] dark:border-[#D4AF37]'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
              >
                {tab.label}
                <span className={`ml-2 ${tab.countCls} text-xs py-0.5 px-2 rounded-full`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10" />
              <Input
                type="text"
                placeholder="Buscar préstamo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={sort} onValueChange={(val) => setSort(val as Sort)}>
                <SelectTrigger className="w-full py-2.5">
                  <SelectValue>
                    {{ recent: 'Más recientes', amount_high: 'Monto mayor', amount_low: 'Monto menor', due_soon: 'Próximo a vencer' }[sort]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más recientes</SelectItem>
                  <SelectItem value="amount_high">Monto mayor</SelectItem>
                  <SelectItem value="amount_low">Monto menor</SelectItem>
                  <SelectItem value="due_soon">Próximo a vencer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Loan list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`${cardCls} p-6 border-l-2 border-l-gray-200 dark:border-l-white/10`}>
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-6 w-24 hidden lg:block" />
                  </div>
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-white/6">
                    {[1, 2, 3, 4].map(j => (
                      <div key={j} className="space-y-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
                <div className="flex flex-row lg:flex-col gap-2.5 lg:w-44 lg:border-l lg:border-gray-100 dark:lg:border-white/6 lg:pl-5">
                  <Skeleton className="h-9 flex-1 lg:flex-none rounded-lg" />
                  <Skeleton className="h-9 flex-1 lg:flex-none rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedAndFiltered.length === 0 ? (
        <div className={`${cardCls} p-16 text-center`}>
          <i className="fa-regular fa-folder-open text-5xl text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {search ? 'No se encontraron resultados.' : 'No tienes préstamos en esta categoría.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedAndFiltered.map(loan => <LoanCard key={loan.id} loan={loan} />)}
        </div>
      )}

      {/* Support banner */}
      <div className="bg-[#0A192F] rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-[#00E5FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[#D4AF37] text-xl border border-white/20 shrink-0">
            <i className="fa-solid fa-headset" />
          </div>
          <div>
            <h4 className="text-white font-medium text-lg">¿Necesitas ayuda con tus préstamos?</h4>
            <p className="text-sm text-gray-300">Nuestro equipo de soporte está disponible 24/7 en todo el Perú.</p>
          </div>
        </div>
        <button className="w-full md:w-auto px-6 py-2.5 rounded-lg cursor-pointer border border-white/20 text-white hover:bg-white/10 transition-colors text-sm font-medium z-10 flex items-center justify-center gap-2">
          Contactar Soporte
          <i className="fa-solid fa-arrow-right text-xs" />
        </button>
      </div>
    </div>
  )
}
