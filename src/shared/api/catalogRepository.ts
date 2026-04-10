import { apiClient } from '@/shared/api/client'

export interface BankEntry {
  id: string
  name: string
  fullName: string
  cciPrefix: string
}

export const catalogRepository = {
  async getBanks(): Promise<BankEntry[]> {
    const { data } = await apiClient.get('/catalogs/banks')
    return data.data
  },
}
