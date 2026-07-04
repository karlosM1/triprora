import { api } from '@/lib/axios'

export type DriverTrip = {
  id: string
  classType: string
  classVariant: string
  departureTime: string
  departureLocation: string
  arrivalTime: string
  arrivalLocation: string
  duration: string
  operator: string
  amenityKeys: string[]
  price: number
  seatsLeft: number
  totalSeats: number | null
  departureDate: string
  tripCategory: string | null
  vehicleName: string | null
  status: 'draft' | 'published' | 'cancelled'
  driverId: string | null
  createdAt: string
}

export type DriverTripSeat = {
  label: string
  status: 'available' | 'occupied'
  premium: boolean
}

export type DriverTripPassenger = {
  id: string
  reference: string | null
  seat: string | null
  name: string
  email: string | null
  phone: string | null
  price: string | null
  bookedAt: string
}

export type DriverTripDetails = {
  trip: DriverTrip
  seats: DriverTripSeat[]
  passengers: DriverTripPassenger[]
  seatsAvailable: number
  seatsOccupied: number
}

export type CreateDriverTripPayload = {
  departureLocation: string
  arrivalLocation: string
  departureDate: string
  departureTime: string
  tripCategory: 'express' | 'business' | 'standard'
  vehicleName: string
  plateNumber?: string
  price: number
  totalSeats: number
  status: 'draft' | 'published'
}

export async function fetchDriverTrips() {
  const { data } = await api.get<DriverTrip[]>('/driver/trips')
  return data
}

export async function fetchDriverTripDetails(tripId: string) {
  const { data } = await api.get<DriverTripDetails>(
    `/driver/trips/${encodeURIComponent(tripId)}`,
  )
  return data
}

export async function createDriverTrip(payload: CreateDriverTripPayload) {
  const { data } = await api.post<DriverTrip>('/driver/trips', payload)
  return data
}

export const driverTripsQueryKey = ['driver', 'trips'] as const
export const driverTripDetailsQueryKey = (tripId: string) =>
  ['driver', 'trips', tripId] as const

export function driverTripDetailsQueryOptions(tripId: string) {
  return {
    queryKey: driverTripDetailsQueryKey(tripId),
    queryFn: () => fetchDriverTripDetails(tripId),
  }
}
