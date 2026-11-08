import { apiClient } from '@/shared/api/client'

export type LoanProductType = 'EXPRESS' | 'FLEX' | 'PLUS'
export type PaymentFrequency = 'QUINCENAL' | 'MENSUAL'
/** Tiers internos de Crevo. TIER_A = score ≥ 800 (mejor), TIER_D = 400–549. */
export type ScoreTier = 'TIER_A' | 'TIER_B' | 'TIER_C' | 'TIER_D'

export interface SimulateParams {
  amount: number
  productType: LoanProductType
  paymentFrequency: PaymentFrequency
  numInstallments: number
  /** Opcional. Si se omite, el backend asume TIER_A (mejor tasa).
   *  Para ejemplos regulatorios "representativos" se recomienda TIER_B,
   *  que corresponde al score promedio de un cliente nuevo (650–799). */
  scoreTier?: ScoreTier
  /** Modo referencial: fuerza el scoreTier explícito e ignora la personalización
   *  por sesión. Úsalo en widgets ilustrativos fijos (Ejemplo representativo SBS)
   *  para que NO muestren el tier real de un usuario logueado. */
  referential?: boolean
}

export interface ScheduleItem {
  installmentNumber: number
  dueDate: string
  principal: number
  interest: number
  maintenanceFee: number
  techFeePerPeriod: number
  igvPerPeriod: number
  amount: number
}

export interface SimulationResult {
  amount: number
  scoreTier: string
  tea: number
  teaPercent: number
  tcea: number
  tceaPercent: number
  disbursementFee: number
  techFee: number
  maintenanceFee: number
  maintenanceFeeTotal: number
  igvAmount: number
  netDisbursed: number
  numInstallments: number
  periodDays: number
  termDays: number
  installmentAmount: number
  totalInterest: number
  totalAmount: number
  schedule: ScheduleItem[]
}

export async function simulate(params: SimulateParams): Promise<SimulationResult> {
  const { data } = await apiClient.post('/loans/simulate', params)
  return data.data
}

/**
 * Descarga la Hoja Resumen preliminar (Res. SBS 3274-2017) en PDF.
 *
 * El endpoint acepta sesión opcional: si el usuario está autenticado, el PDF
 * sale personalizado con su nombre y DNI; si no, se emite con el rótulo
 * genérico "Cliente prospectivo". En ambos casos la Hoja es preliminar y
 * queda sujeta a evaluación crediticia al solicitar el préstamo.
 */
export async function downloadSummary(params: SimulateParams): Promise<void> {
  const response = await apiClient.post('/loans/simulate/summary', params, {
    responseType: 'blob',
  })

  // Preferir el filename que manda el backend en Content-Disposition;
  // si no está accesible (CORS no expone la cabecera), caemos a uno basado
  // en X-Simulation-Ref, y si tampoco está, un genérico con timestamp.
  const disposition: string | undefined = response.headers['content-disposition']
  const simRef: string | undefined = response.headers['x-simulation-ref']
  let filename = `hoja_resumen_preliminar_${simRef ?? Date.now()}.pdf`
  if (disposition) {
    const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
    if (match) filename = decodeURIComponent(match[1])
  }

  const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Cedemos el objeto tras un tick para no cancelar la descarga en Firefox.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
