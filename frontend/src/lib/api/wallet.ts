import { api } from '@/lib/axios'

export type WalletSummary = {
  balancePesos: number
  currency: 'PHP'
  meaning: 'platform_owes_driver' | 'driver_owes_platform' | 'settled'
}

export type WalletLedgerEntry = {
  id: string
  type: string
  amountPesos: number
  balanceAfterPesos: number
  baseFarePesos: number | null
  commissionPesos: number | null
  earningsPesos: number | null
  reason: string
  bookingId: string | null
  payoutId: string | null
  createdAt: string
}

export type WalletSettlement = {
  id: string
  settlementDate: string
  cashCommissionTotal: number
  cashlessEarningsTotal: number
  netChange: number
  openingBalance: number
  closingBalance: number
  bookingCount: number
  status: string
  finalizedAt: string | null
}

export type DriverPayout = {
  id: string
  amountPesos: number
  status: string
  method: string
  gcashNumber: string | null
  accountName: string | null
  bankName: string | null
  accountNumber: string | null
  adminNotes: string | null
  createdAt: string
  paidAt: string | null
  driver?: {
    id: string
    fullName: string | null
    email: string
  }
}

export type AdminWalletRow = {
  id: string
  driverId: string
  balancePesos: number
  meaning: WalletSummary['meaning']
  updatedAt: string
  driver: {
    id: string
    fullName: string | null
    email: string
  }
}

export type AdminDriverWalletDetail = {
  driver: { id: string; fullName: string | null; email: string }
  wallet: WalletSummary
  history: WalletLedgerEntry[]
  settlements: WalletSettlement[]
  payouts: DriverPayout[]
}

export async function fetchDriverWallet() {
  const { data } = await api.get<WalletSummary>('/driver/wallet')
  return data
}

export async function fetchDriverWalletHistory(params?: {
  limit?: number
  cursor?: string
}) {
  const { data } = await api.get<{
    items: WalletLedgerEntry[]
    nextCursor: string | null
  }>('/driver/wallet/history', { params })
  return data
}

export async function fetchDriverWalletSettlements() {
  const { data } = await api.get<WalletSettlement[]>('/driver/wallet/settlements')
  return data
}

export async function fetchDriverWalletPayouts() {
  const { data } = await api.get<DriverPayout[]>('/driver/wallet/payouts')
  return data
}

export async function requestDriverPayout(amountPesos: number) {
  const { data } = await api.post<DriverPayout>('/driver/wallet/payouts', {
    amountPesos,
  })
  return data
}

export async function fetchAdminWallets() {
  const { data } = await api.get<AdminWalletRow[]>('/admin/wallets')
  return data
}

export async function fetchAdminDriverWallet(driverId: string) {
  const { data } = await api.get<AdminDriverWalletDetail>(
    `/admin/wallets/${encodeURIComponent(driverId)}`,
  )
  return data
}

export async function fetchAdminSettlements(date: string) {
  const { data } = await api.get<WalletSettlement[]>('/admin/settlements', {
    params: { date },
  })
  return data
}

export async function finalizeAdminSettlements(input: {
  date: string
  driverId?: string
}) {
  const { data } = await api.post<WalletSettlement[]>(
    '/admin/settlements/finalize',
    input,
  )
  return data
}

export async function fetchAdminPayouts(status?: string) {
  const { data } = await api.get<DriverPayout[]>('/admin/payouts', {
    params: status ? { status } : undefined,
  })
  return data
}

export async function updateAdminPayout(
  id: string,
  input: { status: 'approved' | 'paid' | 'rejected'; adminNotes?: string },
) {
  const { data } = await api.patch<DriverPayout>(
    `/admin/payouts/${encodeURIComponent(id)}`,
    input,
  )
  return data
}

export const driverWalletQueryKey = ['driver', 'wallet'] as const
export const driverWalletHistoryQueryKey = ['driver', 'wallet', 'history'] as const
export const driverWalletSettlementsQueryKey = [
  'driver',
  'wallet',
  'settlements',
] as const
export const driverWalletPayoutsQueryKey = ['driver', 'wallet', 'payouts'] as const

export const adminWalletsQueryKey = ['admin', 'wallets'] as const
export const adminDriverWalletQueryKey = (driverId: string) =>
  ['admin', 'wallets', driverId] as const
export const adminSettlementsQueryKey = (date: string) =>
  ['admin', 'settlements', date] as const
export const adminPayoutsQueryKey = ['admin', 'payouts'] as const
