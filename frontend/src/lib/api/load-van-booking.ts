import { isAxiosError } from 'axios'
import { notFound } from '@tanstack/react-router'
import { fetchVanById, fetchVanSeats } from '@/lib/api/vans'
import { mapApiVan } from '@/lib/vans'

export async function loadVanBooking(vanId: string) {
  try {
    const [van, seats] = await Promise.all([
      fetchVanById(vanId),
      fetchVanSeats(vanId),
    ])

    if (seats.length === 0) {
      throw new Error('No seats are configured for this trip yet.')
    }

    return { van: mapApiVan(van), seats }
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
