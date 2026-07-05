export const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000

export const CANCELLATION_TOO_LATE_MESSAGE =
  'Bookings can only be cancelled at least 24 hours before pickup.'

export function getPickupDateTime(
  departureDate: string,
  departureTime: string,
): Date | null {
  if (!departureDate || !departureTime) return null

  const pickup = new Date(`${departureDate}T${departureTime}`)
  if (Number.isNaN(pickup.getTime())) return null

  return pickup
}

export function canCancelBeforePickup(
  departureDate: string,
  departureTime: string,
  now = new Date(),
): boolean {
  const pickup = getPickupDateTime(departureDate, departureTime)
  if (!pickup) return false

  return pickup.getTime() - now.getTime() >= CANCELLATION_WINDOW_MS
}
