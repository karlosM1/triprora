import { isAxiosError } from 'axios'
import { notFound } from '@tanstack/react-router'
import { fetchVanById, fetchVanSeats } from '@/lib/api/vans'
import type { Seat } from '@/lib/types/api'
import { queryClient } from '@/lib/query-client'
import { mapApiVan, type VanResult } from '@/lib/vans'

export type VanBookingData = {
  van: VanResult
  seats: Seat[]
}

export const VAN_BOOKING_STALE_TIME = 1000 * 30

export const vanBookingQueryKey = (vanId: string) =>
  ['vans', vanId, 'booking'] as const

export function vanBookingQueryOptions(vanId: string) {
  return {
    queryKey: vanBookingQueryKey(vanId),
    queryFn: () => fetchVanBooking(vanId),
    staleTime: VAN_BOOKING_STALE_TIME,
  }
}

export async function fetchVanBooking(vanId: string): Promise<VanBookingData> {
  const [van, seats] = await Promise.all([
    fetchVanById(vanId),
    fetchVanSeats(vanId),
  ])

  if (seats.length === 0) {
    throw new Error('No seats are configured for this trip yet.')
  }

  return { van: mapApiVan(van), seats }
}

export async function ensureVanBooking(vanId: string) {
  return queryClient.ensureQueryData(vanBookingQueryOptions(vanId))
}

export async function loadVanBooking(vanId: string) {
  try {
    return await ensureVanBooking(vanId)
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
