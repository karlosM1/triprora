import type { DriverTrip } from '@/lib/api/driver-trips'

export function formatTripDateTime(trip: Pick<DriverTrip, 'departureDate' | 'departureTime'>) {
  const date = new Date(`${trip.departureDate}T${trip.departureTime}`)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatTripDate(trip: Pick<DriverTrip, 'departureDate'>) {
  const date = new Date(`${trip.departureDate}T00:00:00`)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getTripRouteLabel(
  trip: Pick<DriverTrip, 'departureLocation' | 'arrivalLocation'>,
) {
  return `${trip.departureLocation} → ${trip.arrivalLocation}`
}

export function isUpcomingTrip(trip: DriverTrip) {
  return trip.status === 'published' || trip.status === 'in_progress'
}

export function isPastTrip(trip: DriverTrip) {
  return trip.status === 'completed'
}

export function canStartTrip(trip: DriverTrip) {
  return trip.status === 'published'
}

export function canCompleteTrip(trip: DriverTrip) {
  return trip.status === 'in_progress'
}

export function canCancelTrip(trip: DriverTrip) {
  return trip.status === 'draft' || trip.status === 'published'
}

export function canMarkDestinationReached(trip: DriverTrip) {
  return trip.status === 'in_progress'
}

export function hasTripDeparted(trip: DriverTrip, now = new Date()) {
  const departure = new Date(`${trip.departureDate}T${trip.departureTime}`)
  return departure <= now
}

export function getTripStatusLabel(trip: DriverTrip) {
  if (trip.status === 'draft') return 'Draft'
  if (trip.status === 'cancelled') return 'Cancelled'
  if (trip.status === 'completed') return 'Completed'
  if (trip.status === 'in_progress') return 'In progress'
  return 'Confirmed'
}

export function sumPotentialEarnings(trips: DriverTrip[]) {
  return trips.reduce((total, trip) => {
    const bookedSeats = (trip.totalSeats ?? 0) - trip.seatsLeft
    return total + bookedSeats * trip.price
  }, 0)
}

export function countTodayTrips(trips: DriverTrip[], now = new Date()) {
  const today = now.toISOString().slice(0, 10)
  return trips.filter(
    (trip) =>
      (trip.status === 'published' || trip.status === 'in_progress') &&
      trip.departureDate === today,
  ).length
}
