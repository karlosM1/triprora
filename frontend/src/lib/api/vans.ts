import { api } from '@/lib/axios'
import type { ApiVan, Seat } from '@/lib/types/api'

export async function fetchVans() {
  const { data } = await api.get<ApiVan[]>('/vans')
  return data
}

export async function fetchVanById(vanId: string) {
  const { data } = await api.get<ApiVan>(`/vans/${encodeURIComponent(vanId)}`)
  return data
}

export async function fetchVanSeats(vanId: string) {
  const { data } = await api.get<Seat[]>(
    `/vans/${encodeURIComponent(vanId)}/seats`,
  )
  return data
}

export const vansQueryKey = ['vans'] as const
export const vanQueryKey = (vanId: string) => ['vans', vanId] as const
export const vanSeatsQueryKey = (vanId: string) =>
  ['vans', vanId, 'seats'] as const

export function vansQueryOptions() {
  return {
    queryKey: vansQueryKey,
    queryFn: fetchVans,
  }
}
