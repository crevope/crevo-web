'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { getPublicTariff, type PublicTariff } from '../api/tariffRepository'

/**
 * Tabla del tarifario público. Se hidrata contra `/api/tariff`, que devuelve
 * los valores vigentes en `financial_parameters`. Cualquier actualización del
 * techo BCRP (BcrpRateSyncJob) se refleja automáticamente sin despliegue.
 */
export function TariffTable() {
  const [tariff, setTariff] = useState<PublicTariff | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getPublicTariff()
      .then((t) => {
        if (!cancelled) setTariff(t)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            No pudimos cargar el tarifario en este momento.
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
            Vuelve a intentarlo en unos minutos. Si el problema persiste, escríbenos a{' '}
            <a href="mailto:soporte@crevo.pe" className="underline">
              soporte@crevo.pe
            </a>
            .
          </p>
        </div>
      </div>
    )
  }

  if (!tariff) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 dark:border-[#334155] p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    )
  }

  const fmtMoney = (n: number) =>
    `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  const fmtMoney2 = (n: number) =>
    `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const fmtFreq = (freqs: string[]) =>
    freqs.map((f) => (f === 'QUINCENAL' ? 'Quincenal' : 'Mensual')).join(' / ')

  return (
    <div className="space-y-12">
      {/* ── Techo BCRP vigente ──────────────────────────────────────── */}
      <section className="rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10 p-6">
        <h2 className="text-lg font-semibold text-[#0A192F] dark:text-[#D4AF37] mb-2">
          Tasa máxima BCRP vigente
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
          El Banco Central de Reserva del Perú (BCRP) publica cada semestre la tasa de interés
          compensatoria máxima para créditos de consumo en moneda nacional (Circular 0008-2021).
          Ninguna TEA aplicada por Crevo supera este techo.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-md p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              TEA máxima compensatoria
            </p>
            <p className="text-2xl font-bold text-[#0A192F] dark:text-white mt-1">
              {tariff.bcrpMaxTeaPercent.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Serie PD38590DD — actualización automática
            </p>
          </div>
          <div className="bg-white dark:bg-[#0F172A] rounded-md p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Tasa máxima de mora adicional
            </p>
            <p className="text-2xl font-bold text-[#0A192F] dark:text-white mt-1">
              {tariff.bcrpMaxMoraAdditionalPercent.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Aplicable solo sobre la cuota vencida
            </p>
          </div>
        </div>
      </section>

      {/* ── Productos ───────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-4">
          Productos y tasas (TEA) por perfil de score
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          Cada cliente recibe una TEA según su score crediticio. La TEA mostrada en el simulador y
          en el contrato siempre refleja tu tier. La TCEA (costo total anual efectivo) se calcula
          sumando intereses, comisiones, portes e IGV y se detalla en la Hoja Resumen antes de
          firmar.
        </p>

        <div className="space-y-6">
          {tariff.products.map((product) => (
            <div
              key={product.type}
              className="rounded-lg border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 dark:border-[#334155]">
                <div className="flex flex-wrap items-baseline gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-[#0A192F] dark:text-white">
                    {product.displayName}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#0F172A] text-gray-600 dark:text-gray-400 font-mono">
                    {product.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Monto
                    </dt>
                    <dd className="text-sm font-medium text-[#0A192F] dark:text-white mt-0.5">
                      {fmtMoney(product.minAmount)} – {fmtMoney(product.maxAmount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Cuotas
                    </dt>
                    <dd className="text-sm font-medium text-[#0A192F] dark:text-white mt-0.5">
                      {product.minInstallments === product.maxInstallments
                        ? product.minInstallments
                        : `${product.minInstallments} – ${product.maxInstallments}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Frecuencia
                    </dt>
                    <dd className="text-sm font-medium text-[#0A192F] dark:text-white mt-0.5">
                      {fmtFreq(product.allowedFrequencies)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Requisito
                    </dt>
                    <dd className="text-sm font-medium text-[#0A192F] dark:text-white mt-0.5">
                      {product.requiresPaidLoans === 0
                        ? 'Sin historial previo'
                        : `${product.requiresPaidLoans}+ pagados`}
                    </dd>
                  </div>
                </dl>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-[#0F172A]/50">
                    <TableHead className="text-[#0A192F] dark:text-gray-300">Tier</TableHead>
                    <TableHead className="text-[#0A192F] dark:text-gray-300">
                      Rango de score
                    </TableHead>
                    <TableHead className="text-right text-[#0A192F] dark:text-gray-300">
                      TEA aplicable
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.rates.map((rate) => (
                    <TableRow key={rate.tier}>
                      <TableCell className="font-mono text-xs text-gray-600 dark:text-gray-400">
                        {rate.tier.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                        {rate.scoreRange}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-[#D4AF37]">
                        {rate.teaPercent.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comisiones ──────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-4">
          Comisiones y costos asociados
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          Todas las comisiones están sujetas a IGV ({tariff.igvRatePercent.toFixed(0)}%) y se
          incluyen en la TCEA. Ver la Hoja Resumen antes de firmar para el detalle en soles aplicado
          a tu préstamo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-[#334155]">
              <h3 className="text-sm font-semibold text-[#0A192F] dark:text-white">
                Comisión de desembolso
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Cargo único descontado del monto desembolsado.
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-[#0F172A]/50">
                  <TableHead className="text-[#0A192F] dark:text-gray-300">Tramo</TableHead>
                  <TableHead className="text-right text-[#0A192F] dark:text-gray-300">
                    Comisión
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tariff.disbursementFees.map((fee) => (
                  <TableRow key={fee.amountRange}>
                    <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                      {fee.amountRange}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-[#0A192F] dark:text-white">
                      {fmtMoney2(fee.fee)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-5">
            <h3 className="text-sm font-semibold text-[#0A192F] dark:text-white mb-4">
              Comisiones periódicas
            </h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Comisión de tecnología
                </dt>
                <dd className="mt-1">
                  <span className="text-xl font-bold text-[#0A192F] dark:text-white">
                    {tariff.techFeeRatePercent.toFixed(2)}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    del principal, prorrateado por cuota
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Comisión de mantenimiento
                </dt>
                <dd className="mt-1">
                  <span className="text-xl font-bold text-[#0A192F] dark:text-white">
                    {tariff.maintenanceFeeRatePercent.toFixed(2)}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    por período de pago
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  IGV
                </dt>
                <dd className="mt-1">
                  <span className="text-xl font-bold text-[#0A192F] dark:text-white">
                    {tariff.igvRatePercent.toFixed(2)}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    aplicado sobre comisiones
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ── Gastos de cobranza ──────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-4">
          Gastos de cobranza por mora
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          Estos cargos se aplican únicamente si la cuota no es pagada dentro del plazo. Se rigen por
          la política de cobranza de Crevo (Ley 27598 — prohíbe el hostigamiento y establece
          horarios permitidos de contacto).
        </p>

        <div className="rounded-lg border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-[#0F172A]/50">
                <TableHead className="text-[#0A192F] dark:text-gray-300">Nivel</TableHead>
                <TableHead className="text-[#0A192F] dark:text-gray-300">Gestión</TableHead>
                <TableHead className="text-[#0A192F] dark:text-gray-300">Desde</TableHead>
                <TableHead className="text-right text-[#0A192F] dark:text-gray-300">
                  Cargo
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tariff.collectionFees.map((cf) => (
                <TableRow key={cf.level}>
                  <TableCell className="font-mono text-xs text-gray-600 dark:text-gray-400">
                    {cf.level}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                    {cf.description}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                    Día {cf.triggerDays}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-[#0A192F] dark:text-white">
                    {fmtMoney2(cf.fee)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed border-t border-gray-100 dark:border-[#334155] pt-6">
        Tarifario actualizado al{' '}
        {new Date(tariff.publishedAt).toLocaleString('es-PE', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
        . Los valores reflejan los parámetros vigentes publicados por Crevo en
        `financial_parameters`. El techo BCRP se sincroniza de forma automática con la serie
        PD38590DD. Para casos particulares que no aparezcan aquí, escríbenos a{' '}
        <a href="mailto:soporte@crevo.pe" className="underline">
          soporte@crevo.pe
        </a>
        .
      </p>
    </div>
  )
}
