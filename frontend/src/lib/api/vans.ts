import { api } from '@/lib/axios'
import type { ApiVan, Seat } from '@/lib/types/api'
import type { DepartureTimeFilter } from '@/lib/trip-search'
import { DEFAULT_STALE_TIME } from '@/lib/query-client'

export type VanListSort = 'price' | 'departure'

export type VanListParams = {
  from?: string
  to?: string
  departureDate?: string
  passengers?: number
  priceMax?: number
  departureTimes?: DepartureTimeFilter[]
  sort?: VanListSort
  page?: number
  pageSize?: number
}

export type VanListResponse = {
  items: ApiVan[]
  total: number
  page: number
  pageSize: number
}

export async function fetchVans(params: VanListParams = {}) {
  const { data } = await api.get<VanListResponse>('/vans', {
    params: {
      from: params.from,
      to: params.to,
      departureDate: params.departureDate,
      passengers: params.passengers,
      priceMax: params.priceMax,
      departureTimes:
        params.departureTimes && params.departureTimes.length > 0
          ? params.departureTimes.join(',')
          : undefined,
      sort: params.sort,
      page: params.page,
      pageSize: params.pageSize,
    },
  })
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

export function vansListQueryKey(params: VanListParams) {
  return [...vansQueryKey, params] as const
}

export const vanQueryKey = (vanId: string) => ['vans', vanId] as const
export const vanSeatsQueryKey = (vanId: string) =>
  ['vans', vanId, 'seats'] as const

export function vansQueryOptions(params: VanListParams = {}) {
  return {
    queryKey: vansListQueryKey(params),
    queryFn: () => fetchVans(params),
    staleTime: DEFAULT_STALE_TIME,
  }
}
