import { apiClient } from '@/shared/api/client'

export interface BankAccount {
  id: string
  userId: string
  bankName: string
  cci: string
  alias?: string
  isDefault: boolean
  createdAt: string
}

export interface BankAccountListResult {
  accounts: BankAccount[]
  maxAccounts: number
  paidLoansCount: number
}

export const bankAccountRepository = {
  async getMyAccounts(): Promise<BankAccountListResult> {
    const { data } = await apiClient.get('/bank-accounts')
    return data.data
  },
  async addAccount(dto: { bankName: string; cci: string; alias?: string; isDefault?: boolean }): Promise<BankAccount> {
    const { data } = await apiClient.post('/bank-accounts', dto)
    return data.data
  },
  async deleteAccount(id: string): Promise<void> {
    await apiClient.delete(`/bank-accounts/${id}`)
  },
  async setDefaultAccount(id: string): Promise<void> {
    await apiClient.patch(`/bank-accounts/${id}/default`, {})
  },
}
