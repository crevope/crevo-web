import { apiClient } from '@/shared/api/client'

export type LoanProductType = 'EXPRESS' | 'FLEX' | 'PLUS'
export type PaymentFrequency = 'QUINCENAL' | 'MENSUAL'
export type ScoreTier = 'TIER_A' | 'TIER_B' | 'TIER_C' | 'TIER_D'

export interface TariffTierRate {
  tier: ScoreTier
  scoreRange: string
  tea: number
  teaPercent: number
}

export interface TariffProduct {
  type: LoanProductType
  displayName: string
  description: string
  minAmount: number
  maxAmount: number
  minInstallments: number
  maxInstallments: number
  allowedFrequencies: PaymentFrequency[]
  requiresPaidLoans: number
  rates: TariffTierRate[]
}

export interface TariffCommission {
  amountRange: string
  fee: number
}

export interface TariffCollectionFee {
  level: number
  description: string
  triggerDays: number
  fee: number
}

export interface PublicTariff {
  publishedAt: string
  bcrpMaxTea: number
  bcrpMaxTeaPercent: number
  bcrpMaxMoraAdditional: number
  bcrpMaxMoraAdditionalPercent: number
  igvRate: number
  igvRatePercent: number
  disbursementFees: TariffCommission[]
  techFeeRate: number
  techFeeRatePercent: number
  maintenanceFeeRate: number
  maintenanceFeeRatePercent: number
  collectionFees: TariffCollectionFee[]
  products: TariffProduct[]
}

/**
 * Trae el tarifario público. Endpoint sin auth — apto para llamar desde
 * componentes de la landing antes del registro.
 */
export async function getPublicTariff(): Promise<PublicTariff> {
  const { data } = await apiClient.get('/tariff')
  return data.data
}
