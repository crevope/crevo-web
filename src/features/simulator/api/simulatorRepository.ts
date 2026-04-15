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
