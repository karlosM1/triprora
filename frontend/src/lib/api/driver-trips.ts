import { api } from '@/lib/axios'
import { DEFAULT_STALE_TIME } from '@/lib/query-client'

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
  price: number
  seatsLeft: number
  totalSeats: number | null
  departureDate: string
  tripCategory: string | null
  vehicleName: string | null
  plateNumber: string | null
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'
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
  pickupAddress: string | null
  dropoffAddress: string | null
  status: 'pending' | 'confirmed'
  destinationReachedAt: string | null
  bookedAt: string
}

export type DriverTripDelivery = {
  id: string
  reference: string
  status: 'pending' | 'accepted' | 'confirmed' | 'picked_up' | 'delivered' | 'declined' | 'cancelled'
  packageLabel: string
  description: string
  packageType: string
  weightBand: string
  size: string
  pickupAddress: string
  dropoffAddress: string
  receiverName: string
  receiverPhone: string
  specialInstructions: string | null
  price: string
  suggestedFee: number
  senderName: string
  senderPhone: string | null
  createdAt: string
  paymentMethod: 'cash' | null
  isPaid: boolean
}

export type DriverTripDetails = {
  trip: DriverTrip
  seats: DriverTripSeat[]
  passengers: DriverTripPassenger[]
  deliveries: DriverTripDelivery[]
  seatsAvailable: number
  seatsOccupied: number
}

export type CreateDriverTripPayload = {
  departureLocation: string
  arrivalLocation: string
  departureDate: string
  departureTime: string
  durationHours: number
  tripCategory: 'express' | 'business' | 'standard'
  vehicleName: string
  plateNumber?: string
  price: number
  totalSeats: number
  status: 'draft' | 'published'
}

export type UpdateDriverTripPayload = CreateDriverTripPayload

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

export async function updateDriverTrip(
  tripId: string,
  payload: UpdateDriverTripPayload,
) {
  const { data } = await api.patch<DriverTrip>(
    `/driver/trips/${encodeURIComponent(tripId)}`,
    payload,
  )
  return data
}

export async function completeDriverTrip(tripId: string) {
  const { data } = await api.post<DriverTrip>(
    `/driver/trips/${encodeURIComponent(tripId)}/complete`,
  )
  return data
}

export type StartDriverTripResult = {
  trip: DriverTrip
  notifiedCount: number
}

export async function startDriverTrip(tripId: string) {
  const { data } = await api.post<StartDriverTripResult>(
    `/driver/trips/${encodeURIComponent(tripId)}/start`,
  )
  return data
}

export type MarkDestinationReachedResult = {
  passenger: DriverTripPassenger
  tripEnded: boolean
  trip: DriverTrip | null
}

export async function markPassengerDestinationReached(
  tripId: string,
  bookingId: string,
) {
  const { data } = await api.post<MarkDestinationReachedResult>(
    `/driver/trips/${encodeURIComponent(tripId)}/bookings/${encodeURIComponent(bookingId)}/reach-destination`,
  )
  return data
}

export type CancelDriverTripResult = {
  trip: DriverTrip
  notifiedCount: number
}

export async function cancelDriverTrip(tripId: string) {
  const { data } = await api.post<CancelDriverTripResult>(
    `/driver/trips/${encodeURIComponent(tripId)}/cancel`,
  )
  return data
}

export async function acceptDriverDelivery(
  tripId: string,
  deliveryId: string,
  deliveryFee: number,
) {
  const { data } = await api.post<DriverTripDelivery>(
    `/driver/trips/${encodeURIComponent(tripId)}/deliveries/${encodeURIComponent(deliveryId)}/accept`,
    { deliveryFee },
  )
  return data
}

export async function declineDriverDelivery(tripId: string, deliveryId: string) {
  const { data } = await api.post<DriverTripDelivery>(
    `/driver/trips/${encodeURIComponent(tripId)}/deliveries/${encodeURIComponent(deliveryId)}/decline`,
  )
  return data
}

export async function acceptDriverBooking(tripId: string, bookingId: string) {
  const { data } = await api.post<DriverTripPassenger>(
    `/driver/trips/${encodeURIComponent(tripId)}/bookings/${encodeURIComponent(bookingId)}/accept`,
  )
  return data
}

export async function declineDriverBooking(
  tripId: string,
  bookingId: string,
  reason?: string,
) {
  const { data } = await api.post<DriverTripPassenger>(
    `/driver/trips/${encodeURIComponent(tripId)}/bookings/${encodeURIComponent(bookingId)}/decline`,
    reason?.trim() ? { reason: reason.trim() } : {},
  )
  return data
}

export const driverTripsQueryKey = ['driver', 'trips'] as const
export const driverTripDetailsQueryKey = (tripId: string) =>
  ['driver', 'trips', tripId] as const

export function driverTripsQueryOptions() {
  return {
    queryKey: driverTripsQueryKey,
    queryFn: fetchDriverTrips,
    staleTime: DEFAULT_STALE_TIME,
  }
}

export function driverTripDetailsQueryOptions(tripId: string) {
  return {
    queryKey: driverTripDetailsQueryKey(tripId),
    queryFn: () => fetchDriverTripDetails(tripId),
    staleTime: DEFAULT_STALE_TIME,
  }
}
