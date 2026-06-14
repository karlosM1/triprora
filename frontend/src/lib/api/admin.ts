import { api } from '@/lib/axios'

export type AdminStats = {
  totalUsers: number
  totalDrivers: number
  totalPassengers: number
  pendingApplications: number
  publishedTrips: number
  draftTrips: number
  totalBookings: number
  confirmedBookings: number
}

export type AdminTrip = {
  id: string
  route: string
  departureDate: string
  departureTime: string
  status: 'draft' | 'published' | 'cancelled'
  price: number
  seatsLeft: number
  totalSeats: number | null
  vehicleName: string | null
  driverName: string
  driverEmail: string | null
  bookingCount: number
  createdAt: string
}

export type AdminBooking = {
  id: string
  reference: string | null
  route: string
  date: string
  time: string | null
  seat: string | null
  status: 'confirmed' | 'completed' | 'cancelled'
  price: string | null
  passengerName: string
  passengerEmail: string | null
  createdAt: string
}

export type AdminUser = {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  role: 'passenger' | 'driver' | 'admin'
  driverApplicationStatus: 'pending' | 'approved' | 'rejected' | null
  bookingCount: number
  tripCount: number
  createdAt: string
}

export async function fetchAdminStats() {
  const { data } = await api.get<AdminStats>('/admin/stats')
  return data
}

export async function fetchAdminTrips() {
  const { data } = await api.get<AdminTrip[]>('/admin/trips')
  return data
}

export async function fetchAdminBookings() {
  const { data } = await api.get<AdminBooking[]>('/admin/bookings')
  return data
}

export async function fetchAdminUsers() {
  const { data } = await api.get<AdminUser[]>('/admin/users')
  return data
}

export const adminStatsQueryKey = ['admin', 'stats'] as const
export const adminTripsQueryKey = ['admin', 'trips'] as const
export const adminBookingsQueryKey = ['admin', 'bookings'] as const
export const adminUsersQueryKey = ['admin', 'users'] as const
