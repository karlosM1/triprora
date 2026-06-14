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

export function isUpcomingTrip(trip: DriverTrip, now = new Date()) {
  const departure = new Date(`${trip.departureDate}T${trip.departureTime}`)
  return trip.status === 'published' && departure >= now
}

export function isPastTrip(trip: DriverTrip, now = new Date()) {
  const departure = new Date(`${trip.departureDate}T${trip.departureTime}`)
  return trip.status === 'published' && departure < now
}

export function getTripStatusLabel(trip: DriverTrip, now = new Date()) {
  if (trip.status === 'draft') return 'Draft'
  if (trip.status === 'cancelled') return 'Cancelled'
  if (isUpcomingTrip(trip, now)) return 'Confirmed'
  return 'Completed'
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
    (trip) => trip.status === 'published' && trip.departureDate === today,
  ).length
}
