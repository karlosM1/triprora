import { api } from '@/lib/axios'
import type { Role } from '@/lib/types/profile'

export const ADMIN_PAGE_SIZE = 10

export type AdminStats = {
  totalUsers: number
  totalDrivers: number
  totalPassengers: number
  totalAdmins: number
  totalSuperadmins: number
  bannedUsers: number
  pendingApplications: number
  publishedTrips: number
  draftTrips: number
  completedTrips: number
  cancelledTrips: number
  upcomingTrips: number
  ongoingTrips: number
  totalBookings: number
  confirmedBookings: number
}

export type AdminTrip = {
  id: string
  route: string
  departureDate: string
  departureTime: string
  status: 'draft' | 'published' | 'completed' | 'cancelled'
  displayStatus?: string
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
  role: Role
  isBanned?: boolean
  bannedAt?: string | null
  bannedReason?: string | null
  driverApplicationStatus: 'pending' | 'approved' | 'rejected' | null
  bookingCount: number
  tripCount: number
  createdAt: string
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export async function fetchAdminStats() {
  const { data } = await api.get<AdminStats>('/admin/stats')
  return data
}

export async function fetchAdminTrips(params: {
  page?: number
  pageSize?: number
} = {}) {
  const { data } = await api.get<PaginatedResponse<AdminTrip>>('/admin/trips', {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? ADMIN_PAGE_SIZE,
      status: 'all',
    },
  })
  return data
}

export async function fetchAdminBookings(params: {
  page?: number
  pageSize?: number
} = {}) {
  const { data } = await api.get<PaginatedResponse<AdminBooking>>(
    '/admin/bookings',
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? ADMIN_PAGE_SIZE,
      },
    },
  )
  return data
}

export async function fetchAdminUsers(params: {
  page?: number
  pageSize?: number
} = {}) {
  const { data } = await api.get<PaginatedResponse<AdminUser>>('/admin/users', {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? ADMIN_PAGE_SIZE,
    },
  })
  return data
}

export const adminStatsQueryKey = ['admin', 'stats'] as const

export function adminTripsQueryKey(params: {
  page: number
  pageSize?: number
}) {
  return [
    'admin',
    'trips',
    {
      page: params.page,
      pageSize: params.pageSize ?? ADMIN_PAGE_SIZE,
    },
  ] as const
}

export function adminBookingsQueryKey(params: {
  page: number
  pageSize?: number
}) {
  return [
    'admin',
    'bookings',
    {
      page: params.page,
      pageSize: params.pageSize ?? ADMIN_PAGE_SIZE,
    },
  ] as const
}

export function adminUsersQueryKey(params: {
  page: number
  pageSize?: number
}) {
  return [
    'admin',
    'users',
    {
      page: params.page,
      pageSize: params.pageSize ?? ADMIN_PAGE_SIZE,
    },
  ] as const
}

export const adminUsersInvalidateKey = ['admin', 'users'] as const
