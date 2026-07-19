import { api } from '@/lib/axios'
import type {
  CreatedDelivery,
  DeliveryDetail,
  DeliveryListItem,
  PackageSize,
  PackageType,
  PackageWeightBand,
} from '@/lib/types/api'
import { DEFAULT_STALE_TIME } from '@/lib/query-client'

export type CreateDeliveryInput = {
  vanId: string
  pickupAddress: string
  dropoffAddress: string
  packageType: PackageType
  weightBand: PackageWeightBand
  size: PackageSize
  description: string
  receiverName: string
  receiverPhone: string
  specialInstructions?: string
}

export type PayDeliveryInput = {
  paymentMethod: 'cash'
}

export async function createDelivery(input: CreateDeliveryInput) {
  const { data } = await api.post<CreatedDelivery>('/deliveries', input)
  return data
}

export async function payDelivery(deliveryId: string, input: PayDeliveryInput) {
  const { data } = await api.post<CreatedDelivery>(
    `/deliveries/${encodeURIComponent(deliveryId)}/pay`,
    input,
  )
  return data
}

export async function fetchDeliveries(
  filter: 'upcoming' | 'history' | 'all' = 'all',
) {
  const { data } = await api.get<DeliveryListItem[]>('/deliveries', {
    params: { filter },
  })
  return data
}

export async function fetchDelivery(deliveryId: string) {
  const { data } = await api.get<DeliveryDetail>(
    `/deliveries/${encodeURIComponent(deliveryId)}`,
  )
  return data
}

export async function cancelDelivery(deliveryId: string) {
  const { data } = await api.post<DeliveryListItem>(
    `/deliveries/${encodeURIComponent(deliveryId)}/cancel`,
  )
  return data
}

export const deliveriesQueryKey = ['deliveries'] as const
export const upcomingDeliveriesQueryKey = ['deliveries', 'upcoming'] as const
export const historyDeliveriesQueryKey = ['deliveries', 'history'] as const
export const deliveryQueryKey = (deliveryId: string) =>
  ['deliveries', deliveryId] as const

export function upcomingDeliveriesQueryOptions() {
  return {
    queryKey: upcomingDeliveriesQueryKey,
    queryFn: () => fetchDeliveries('upcoming'),
    staleTime: DEFAULT_STALE_TIME,
  }
}

export function historyDeliveriesQueryOptions() {
  return {
    queryKey: historyDeliveriesQueryKey,
    queryFn: () => fetchDeliveries('history'),
    staleTime: DEFAULT_STALE_TIME,
  }
}

export function deliveryQueryOptions(deliveryId: string) {
  return {
    queryKey: deliveryQueryKey(deliveryId),
    queryFn: () => fetchDelivery(deliveryId),
    staleTime: DEFAULT_STALE_TIME,
  }
}
