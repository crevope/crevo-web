'use client'

import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import { simulate, type SimulationResult } from '../api/simulatorRepository'

/**
 * Ejemplo representativo exigido por SBS Res. 3274-2017 (Reglamento de
 * Transparencia) y Ley 28587: cuando se publicita un producto financiero,
 * debe exponerse un caso concreto con TEA, TCEA, plazo, monto y total a
 * pagar — ambas tasas con igual prominencia visual.
 *
 * Se calcula en vivo contra el endpoint público `/loans/simulate` usando
 * TIER_B (score 650–799, el rango promedio de un cliente nuevo que pasa
 * KYC). Los valores reflejan los parámetros vigentes en `financial_parameters`,
 * así que cualquier actualización del techo BCRP se propaga automáticamente.
 *
 * Parámetros fijos del ejemplo:
 *   - Producto EXPRESS (el más solicitado por nuevos clientes)
 *   - S/ 300, 1 cuota mensual
 *   - scoreTier: TIER_B (cliente promedio, TEA ~105%)
 */

const EXAMPLE_PARAMS = {
  amount: 300,
  productType: 'EXPRESS' as const,
  paymentFrequency: 'MENSUAL' as const,
  numInstallments: 1,
  scoreTier: 'TIER_B' as const,
}

function fmt(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function RepresentativeExample() {
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    simulate(EXAMPLE_PARAMS)
      .then((r) => { if (!cancelled) setResult(r) })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [])

  // Si el backend está caído, no rompemos la landing — simplemente ocultamos
  // el ejemplo. El simulador interactivo de arriba sigue siendo la fuente
  // principal de transparencia y cubre la obligación regulatoria.
  if (error) return null

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-[#1E293B] rounded-lg shadow-sm border border-gray-200 dark:border-white/6 p-6 md:p-8">

      <div className="flex items-start gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-white/10">
        <div className="w-10 h-10 shrink-0 rounded-lg bg-[#0A192F]/8 dark:bg-[#D4AF37]/10 flex items-center justify-center">
          <Info className="h-5 w-5 text-[#0A192F] dark:text-[#D4AF37]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#0A192F] dark:text-white">
            Ejemplo representativo
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Cálculo para un cliente con score crediticio promedio (rango 650–799).
            Tu tasa real depende de tu perfil y se detalla antes de firmar.
          </p>
        </div>
      </div>

      {!result ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monto</p>
            <p className="text-lg font-bold text-[#0A192F] dark:text-white">
              S/ {fmt(result.amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Plazo</p>
            <p className="text-lg font-bold text-[#0A192F] dark:text-white">
              {result.numInstallments} cuota{result.numInstallments > 1 ? 's' : ''} mensual{result.numInstallments > 1 ? 'es' : ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">TEA</p>
            <p className="text-lg font-bold text-[#D4AF37]">
              {result.teaPercent.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">TCEA</p>
            <p className="text-lg font-bold text-[#D4AF37]">
              {result.tceaPercent.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total a pagar</p>
            <p className="text-lg font-bold text-[#00E5FF]">
              S/ {fmt(result.totalAmount)}
            </p>
          </div>
        </div>
      )}

      <p className="mt-5 text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
        La TCEA incluye intereses, comisiones, portes e IGV y es el indicador que
        permite comparar el costo total entre diferentes ofertas de crédito. La TEA
        compensatoria respeta en todo momento el techo vigente publicado por el BCRP
        (Circular 0008-2021).
      </p>
    </div>
  )
}
