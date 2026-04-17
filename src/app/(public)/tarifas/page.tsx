import { LegalPageLayout } from '@/features/legal/ui/LegalPageLayout'
import { TariffTable } from '@/features/tariff/ui/TariffTable'
import { buildMetadata } from '@/shared/seo/buildMetadata'

export const metadata = buildMetadata({
  title: 'Tarifario',
  description:
    'Tarifario público de Crevo: TEA por producto, comisiones, IGV, techo BCRP vigente y gastos de cobranza. Cumple SBS Res. 3274-2017 y Ley 28587.',
  path: '/tarifas',
  keywords: ['tarifas crevo', 'tea préstamos perú', 'comisiones préstamos', 'tasa máxima bcrp'],
})

/**
 * Tarifario público. Obligatorio bajo:
 *   - SBS Res. 3274-2017 (Reglamento de Transparencia de Información)
 *   - Ley 28587 (Protección al Consumidor de Servicios Financieros)
 *   - Art. 5 y 6 del Código del Consumidor (Ley 29571)
 *
 * La tabla se hidrata con `/api/tariff` (sin auth). Si el backend no responde
 * muestra un mensaje de fallback pero la página sigue navegable (los enlaces
 * legales del footer no dependen del fetch).
 */
export default function TariffPage() {
  return (
    <LegalPageLayout
      title="Tarifario"
      version="2026-04-15"
      effectiveDate="15 de abril de 2026"
      currentHref="/tarifas"
      proseWrap={false}
      intro={
        `Este tarifario reúne las tasas de interés (TEA), comisiones, ` +
        `IGV y gastos de cobranza vigentes en Crevo. Los valores mostrados ` +
        `corresponden a los máximos publicados; tu tasa y costo real se ` +
        `calculan en el simulador y quedan detallados en la Hoja Resumen que ` +
        `recibes antes de firmar el contrato. Publicado en cumplimiento de la ` +
        `Resolución SBS 3274-2017 y la Ley 28587.`
      }
    >
      <TariffTable />
    </LegalPageLayout>
  )
}
