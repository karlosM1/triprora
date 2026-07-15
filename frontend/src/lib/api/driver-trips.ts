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
  price: number
  seatsLeft: number
  totalSeats: number | null
  departureDate: string
  tripCategory: string | null
  vehicleName: string | null
  plateNumber: string | null
  status: 'draft' | 'published' | 'completed' | 'cancelled'
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
  paymentMethod: 'qrph' | 'cash' | null
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

export const driverTripsQueryKey = ['driver', 'trips'] as const
export const driverTripDetailsQueryKey = (tripId: string) =>
  ['driver', 'trips', tripId] as const

export function driverTripDetailsQueryOptions(tripId: string) {
  return {
    queryKey: driverTripDetailsQueryKey(tripId),
    queryFn: () => fetchDriverTripDetails(tripId),
  }
}
