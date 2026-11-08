'use client'

import { CircleCheck } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'

const STEP = 25

function formatAmount(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const THUMB_CLASSES = `
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
  [&::-moz-range-thumb]:cursor-pointer
`

interface AmountSliderProps {
  /** Límites personalizados aún no llegaron de getMyLimits(). */
  loading: boolean
  amount: number
  minAmount: number
  maxAmount: number
  fillColor: string
  trackColor: string
  /** Muestra el badge "Tu máximo aprobado" (requiere score ya calculado). */
  showApprovedBadge: boolean
  errorMessage?: string
  onChange: (value: number) => void
}

/**
 * Placeholder que imita el layout real (monto + barra + etiquetas min/max)
 * mientras `getMyLimits()` está en vuelo. Sin esto, el monto y el slider
 * muestran brevemente el default estático (S/ 200) y "saltan" al valor
 * re-clampeado apenas resuelve la promesa.
 */
function AmountSliderSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-7 w-24" />
      </div>
      <Skeleton className="h-4 w-44 mb-3" />
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex justify-between mt-2">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  )
}

/**
 * Representación presentacional para el caso degenerado (maxAmount <=
 * minAmount, p. ej. TIER_D en su primer préstamo con currentMax == cfg.minAmount).
 * Un `<input type="range">` nativo con min == max deja el thumb pegado a la
 * IZQUIERDA en Chrome/Firefox sin importar el `value` — no hay forma de
 * corregir eso solo con `fillPct` o estilos, así que en este caso no se
 * renderiza el input nativo: se dibuja una barra ya llena con el thumb fijo
 * en el extremo derecho, deshabilitada (no hay rango para arrastrar).
 */
function DegenerateAmountBar({ fillColor }: Readonly<{ fillColor: string }>) {
  return (
    <div
      className="relative w-full h-2 rounded-full cursor-default"
      style={{ backgroundColor: fillColor }}
      role="img"
      aria-label="Monto fijo, no ajustable"
    >
      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-md"
        style={{ backgroundColor: fillColor }}
      />
    </div>
  )
}

/**
 * Slider de monto del card "¿Cuánto necesitas?". Encapsula sus tres estados
 * (cargando límites / rango degenerado / rango normal interactivo) para que
 * el componente que lo usa no tenga que conocer esos detalles — solo el
 * monto actual, los topes, y un callback de cambio que se conecta al
 * `form.setValue('amount', …)` de react-hook-form del caller.
 */
export function AmountSlider({
  loading,
  amount,
  minAmount,
  maxAmount,
  fillColor,
  trackColor,
  showApprovedBadge,
  errorMessage,
  onChange,
}: Readonly<AmountSliderProps>) {
  if (loading) return <AmountSliderSkeleton />

  const range = maxAmount - minAmount
  const fillPct = range <= 0 ? 100 : ((amount - minAmount) / range) * 100
  const clampedPct = Math.max(0, Math.min(100, fillPct))
  const rangeStyle = {
    background: `linear-gradient(to right, ${fillColor} ${clampedPct}%, ${trackColor} ${clampedPct}%)`,
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          ¿Cuánto necesitas?
        </p>
        <span className="text-2xl font-bold text-[#0A192F] dark:text-white">
          S/ {formatAmount(amount)}
        </span>
      </div>
      {showApprovedBadge && (
        <div className="flex items-center gap-1.5 mb-3">
          <CircleCheck className="h-2.5 w-2.5 text-emerald-500" aria-hidden="true" />
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Tu máximo aprobado: S/ {maxAmount.toLocaleString('es-PE')}
          </span>
        </div>
      )}
      {range <= 0 ? (
        <DegenerateAmountBar fillColor={fillColor} />
      ) : (
        <input
          type="range"
          title="Slider de monto"
          min={minAmount}
          max={maxAmount}
          step={STEP}
          value={amount}
          onChange={(e) => onChange(Number(e.target.value))}
          style={rangeStyle}
          className={`w-full h-2 rounded-full appearance-none cursor-pointer ${THUMB_CLASSES}`}
        />
      )}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
        <span>S/ {minAmount}</span>
        <span>S/ {maxAmount.toLocaleString('es-PE')}</span>
      </div>
      {errorMessage && <p className="text-red-500 text-xs mt-1">{errorMessage}</p>}
    </div>
  )
}
