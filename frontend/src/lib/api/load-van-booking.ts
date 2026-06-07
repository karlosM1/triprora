import { redirect } from '@tanstack/react-router'
import { fetchVanById, fetchVanSeats } from '@/lib/api/vans'
import { mapApiVan } from '@/lib/vans'

export async function loadVanBooking(vanId: string) {
  try {
    const [van, seats] = await Promise.all([
      fetchVanById(vanId),
      fetchVanSeats(vanId),
    ])

    return { van: mapApiVan(van), seats }
  } catch {
    throw redirect({ to: '/find-vans' })
  }
}
