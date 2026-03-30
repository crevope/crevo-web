'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { Zap, TrendingUp, Star, Info } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import Link from 'next/link'
import { simulate, type SimulationResult, type LoanProductType, type PaymentFrequency } from '../api/simulatorRepository'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

// ─── Config por producto ──────────────────────────────────────────────────────

const STEP = 25

const PRODUCT_CONFIG = {
  EXPRESS: {
    minAmount: 100,
    maxAmount: 500,
    minInstallments: 1,
    maxInstallments: 1,
    frequencies: ['QUINCENAL', 'MENSUAL'] as PaymentFrequency[],
    defaultInstallments: 1,
    defaultFrequency: 'MENSUAL' as PaymentFrequency,
    defaultAmount: 200,
  },
  FLEX: {
    minAmount: 100,
    maxAmount: 500,
    minInstallments: 2,
    maxInstallments: 6,
    frequencies: ['QUINCENAL', 'MENSUAL'] as PaymentFrequency[],
    defaultInstallments: 3,
    defaultFrequency: 'MENSUAL' as PaymentFrequency,
    defaultAmount: 300,
  },
  PLUS: {
    minAmount: 550,
    maxAmount: 2000,
    minInstallments: 7,
    maxInstallments: 12,
    frequencies: ['MENSUAL'] as PaymentFrequency[],
    defaultInstallments: 9,
    defaultFrequency: 'MENSUAL' as PaymentFrequency,
    defaultAmount: 1000,
  },
} as const

function fmt(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function range(min: number, max: number): number[] {
  const result: number[] = []
  for (let i = min; i <= max; i++) result.push(i)
  return result
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LoanSimulator() {
  const [product, setProduct] = useState<LoanProductType>('EXPRESS')
  const [amount, setAmount] = useState<number>(PRODUCT_CONFIG.EXPRESS.defaultAmount)
  const [frequency, setFrequency] = useState<PaymentFrequency>(PRODUCT_CONFIG.EXPRESS.defaultFrequency)
  const [installments, setInstallments] = useState<number>(PRODUCT_CONFIG.EXPRESS.defaultInstallments)

  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  const cfg = PRODUCT_CONFIG[product]

  // When product changes, reset controls to product defaults
  const handleProductChange = (p: LoanProductType) => {
    const c = PRODUCT_CONFIG[p]
    setProduct(p)
    setAmount(c.defaultAmount)
    setFrequency(c.defaultFrequency)
    setInstallments(c.defaultInstallments)
  }

  const runSimulation = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await simulate({
        amount,
        productType: product,
        paymentFrequency: frequency,
        numInstallments: installments,
      })
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al calcular')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [amount, product, frequency, installments])

  useEffect(() => {
    const timer = setTimeout(runSimulation, 500)
    return () => clearTimeout(timer)
  }, [runSimulation])

  const isDark = mounted && resolvedTheme === 'dark'
  const fillColor = isDark ? '#D4AF37' : '#0A192F'
  const trackColor = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'
  const fillPct = ((amount - cfg.minAmount) / (cfg.maxAmount - cfg.minAmount)) * 100
  const rangeStyle = { background: `linear-gradient(to right, ${fillColor} ${fillPct}%, ${trackColor} ${fillPct}%)` }
  const totalFees = result ? result.techFee + result.maintenanceFeeTotal + result.igvAmount : null
  const freqLabel = frequency === 'MENSUAL' ? 'mensual' : 'quincenal'

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* ── Controls ───────────────────────────────────────────────── */}
        <div className="space-y-8">

          {/* Producto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Producto
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleProductChange('EXPRESS')}
                className={`flex-1 py-3 px-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${product === 'EXPRESS'
                  ? 'border-[#00E5FF] bg-[#00E5FF]/10 text-[#0A192F] dark:text-white'
                  : 'border-gray-200 dark:border-[#334155] text-gray-500 hover:border-[#00E5FF] hover:text-[#00E5FF]'
                  }`}
              >
                <Zap className="h-4 w-4 text-[#00E5FF] shrink-0" />
                Express
              </button>
              <button
                type="button"
                onClick={() => handleProductChange('FLEX')}
                className={`flex-1 py-3 px-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${product === 'FLEX'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#0A192F] dark:text-white'
                  : 'border-gray-200 dark:border-[#334155] text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                  }`}
              >
                <TrendingUp className="h-4 w-4 shrink-0" />
                Flex
              </button>
              <button
                type="button"
                onClick={() => handleProductChange('PLUS')}
                className={`flex-1 py-3 px-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${product === 'PLUS'
                  ? 'border-purple-400 bg-purple-400/10 text-[#0A192F] dark:text-white'
                  : 'border-gray-200 dark:border-[#334155] text-gray-500 hover:border-purple-400 hover:text-purple-400'
                  }`}
              >
                <Star className="h-4 w-4 shrink-0" />
                Plus
              </button>
            </div>

            {/* Plus badge */}
            {product === 'PLUS' && (
              <p className="text-xs text-purple-400 dark:text-purple-300 mt-2 flex items-center gap-1.5">
                <i className="fa-solid fa-lock text-[10px]" />
                Disponible para clientes con 10+ préstamos pagados
              </p>
            )}
          </div>

          {/* Monto */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                ¿Cuánto necesitas?
              </label>
              <span className="text-2xl font-bold text-[#0A192F] dark:text-white">
                S/ {fmt(amount)}
              </span>
            </div>
            <input
              type="range"
              title="Slider de monto"
              min={cfg.minAmount}
              max={cfg.maxAmount}
              step={STEP}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
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
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>S/ {cfg.minAmount}</span>
              <span>S/ {cfg.maxAmount}</span>
            </div>
          </div>

          {/* Frecuencia + Cuotas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="frequency" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Frecuencia
              </label>
              {/* PLUS: solo mensual — mostrar como texto fijo */}
              {product === 'PLUS' ? (
                <div className="w-full h-10 rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0F172A] flex items-center px-3 text-sm text-gray-500 dark:text-gray-400 opacity-70">
                  Mensual
                </div>
              ) : (
                <Select
                  value={frequency}
                  onValueChange={(val) => setFrequency(val as PaymentFrequency)}
                >
                  <SelectTrigger className="w-full h-10 rounded-md border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F172A] text-gray-700 dark:text-white px-3 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUINCENAL">Quincenal</SelectItem>
                    <SelectItem value="MENSUAL">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <label htmlFor="numInstallments" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Cuotas
              </label>
              {/* EXPRESS: solo 1 cuota, sin selector */}
              {product === 'EXPRESS' ? (
                <div className="w-full h-10 rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0F172A] flex items-center px-3 text-sm text-gray-500 dark:text-gray-400 opacity-70">
                  1 cuota
                </div>
              ) : (
                <Select
                  value={String(installments)}
                  onValueChange={(val) => setInstallments(Number(val))}
                >
                  <SelectTrigger className="w-full h-10 rounded-md border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F172A] text-gray-700 dark:text-white px-3 text-sm">
                    <SelectValue />
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

        {/* ── Summary Card (navy) ────────────────────────────────────── */}
        <div className="bg-linear-to-br from-[#0A192F] to-[#0A192F]/90 dark:bg-[#0F172A] rounded-2xl p-6 sm:p-7 text-white flex flex-col justify-between shadow-lg relative overflow-hidden border border-gray-700/30">

          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#00E5FF]/20 to-transparent rounded-bl-full z-0" />

          <div className="relative z-10 flex-1">
            <h3 className="text-lg font-semibold text-gray-300 mb-6 border-b border-gray-700 pb-4">
              Resumen de tu préstamo
            </h3>

            {loading || !result ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32 bg-white/10" />
                    <Skeleton className="h-4 w-20 bg-white/10" />
                  </div>
                ))}
                <div className="w-full h-px bg-gray-700 my-1" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-28 bg-white/10" />
                  <Skeleton className="h-5 w-24 bg-white/10" />
                </div>
                <Skeleton className="h-16 w-full rounded-xl bg-white/10 mt-2" />
              </div>
            ) : error ? (
              <p className="text-red-400 text-sm py-4">{error}</p>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Monto solicitado</span>
                    <span className="font-semibold">S/ {fmt(result.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Interés (TEA {result.teaPercent.toFixed(0)}%)</span>
                    <span className="font-semibold text-[#D4AF37]">S/ {fmt(result.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Comisiones e IGV</span>
                    <span className="font-semibold">S/ {fmt(totalFees!)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Plazo</span>
                    <span className="font-semibold">{result.numInstallments} cuota{result.numInstallments > 1 ? 's' : ''} {freqLabel}{result.numInstallments > 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full h-px bg-gray-700 my-2" />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold">Total a devolver</span>
                    <span className="font-bold text-[#00E5FF]">S/ {fmt(result.totalAmount)}</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/10 backdrop-blur-sm">
                  <div className="text-center">
                    <span className="block text-sm text-gray-300 mb-1">
                      Tu cuota {freqLabel} será de
                    </span>
                    <span className="text-3xl font-bold text-white">
                      S/ {fmt(result.installmentAmount)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <Link
            href="/register"
            className="w-full py-3 bg-linear-to-r from-[#D4AF37] to-[#E5C158] text-[#0A192F] font-bold rounded-xl hover:opacity-90 transition-opacity relative z-10 shadow-[0_4px_14px_0_rgba(212,175,55,0.39)] text-center block mt-2"
          >
            Solicitar ahora
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 text-xs text-gray-500 text-center flex items-start justify-center gap-2">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <p className="max-w-2xl">
          Simulación referencial. Los valores reales, incluyendo TEA y TCEA, se calcularán en base
          a tu perfil crediticio y serán detallados en tu propuesta oficial antes de aceptar el
          préstamo. Solvo Plus requiere mínimo 10 préstamos cancelados. Regulado por la SBS.
        </p>
      </div>
    </>
  )
}
