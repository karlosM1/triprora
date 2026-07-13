import { isAxiosError } from 'axios'
import { notFound } from '@tanstack/react-router'
import { fetchVanById } from '@/lib/api/vans'
import { queryClient } from '@/lib/query-client'
import { mapApiVan, type VanResult } from '@/lib/vans'

export type VanDeliveryData = {
  van: VanResult
}

export const VAN_DELIVERY_STALE_TIME = 1000 * 30

export const vanDeliveryQueryKey = (vanId: string) =>
  ['vans', vanId, 'delivery'] as const

export function vanDeliveryQueryOptions(vanId: string) {
  return {
    queryKey: vanDeliveryQueryKey(vanId),
    queryFn: async (): Promise<VanDeliveryData> => {
      const van = await fetchVanById(vanId)
      return { van: mapApiVan(van) }
    },
    staleTime: VAN_DELIVERY_STALE_TIME,
  }
}

export async function loadVanDelivery(vanId: string) {
  try {
    return await queryClient.ensureQueryData(vanDeliveryQueryOptions(vanId))
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      throw notFound()
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error('Unable to load this trip. Please try again.')
  }
}
