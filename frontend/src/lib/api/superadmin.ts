import { api } from '@/lib/axios'
import type { Role } from '@/lib/types/profile'

export const SUPERADMIN_PAGE_SIZE = 10

export type SuperadminStats = {
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
  usersByRole: Array<{ role: string; count: number }>
  tripsByStatus: Array<{ status: string; count: number }>
  bookingsLast30Days: Array<{ date: string; count: number }>
  usersLast30Days: Array<{ date: string; count: number }>
}

export type TripDisplayStatus =
  | 'upcoming'
  | 'ongoing'
  | 'completed'
  | 'cancelled'
  | 'draft'

export type SuperadminTrip = {
  id: string
  route: string
  departureDate: string
  departureTime: string
  status: 'draft' | 'published' | 'completed' | 'cancelled'
  displayStatus: TripDisplayStatus
  price: number
  seatsLeft: number
  totalSeats: number | null
  vehicleName: string | null
  driverName: string
  driverEmail: string | null
  bookingCount: number
  createdAt: string
}

export type SuperadminBooking = {
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

export type SuperadminUser = {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  role: Role
  isBanned: boolean
  bannedAt: string | null
  bannedReason: string | null
  driverApplicationStatus: 'pending' | 'approved' | 'rejected' | null
  bookingCount: number
  tripCount: number
  createdAt: string
}

export type SuperadminDriver = {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  isBanned: boolean
  licenseNo: string | null
  licenseType: string | null
  licenseExpiration: string | null
  vehiclePlateNumber: string | null
  vehicleMake: string | null
  vehicleModel: string | null
  vehicleYear: number | null
  vehicleColor: string | null
  applicationStatus: 'pending' | 'approved' | 'rejected' | null
  city: string | null
  province: string | null
  tripCount: number
  createdAt: string
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type TripStatusFilter = TripDisplayStatus | 'all'
export type BannedFilter = 'all' | 'active' | 'banned'
export type RoleFilter = 'all' | Role
export type ApplicationStatusFilter = 'all' | 'pending' | 'approved' | 'rejected'
export type BookingStatusFilter = 'all' | 'confirmed' | 'completed' | 'cancelled'

export async function fetchSuperadminStats() {
  const { data } = await api.get<SuperadminStats>('/superadmin/stats')
  return data
}

export async function fetchSuperadminTrips(params: {
  page?: number
  pageSize?: number
  status?: TripStatusFilter
  search?: string
} = {}) {
  const { data } = await api.get<PaginatedResponse<SuperadminTrip>>(
    '/superadmin/trips',
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? SUPERADMIN_PAGE_SIZE,
        status: params.status ?? 'all',
        search: params.search || undefined,
      },
    },
  )
  return data
}

export async function fetchSuperadminBookings(params: {
  page?: number
  pageSize?: number
  search?: string
  status?: BookingStatusFilter
} = {}) {
  const { data } = await api.get<PaginatedResponse<SuperadminBooking>>(
    '/superadmin/bookings',
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? SUPERADMIN_PAGE_SIZE,
        search: params.search || undefined,
        status: params.status ?? 'all',
      },
    },
  )
  return data
}

export async function fetchSuperadminUsers(params: {
  page?: number
  pageSize?: number
  search?: string
  role?: RoleFilter
  banned?: BannedFilter
} = {}) {
  const { data } = await api.get<PaginatedResponse<SuperadminUser>>(
    '/superadmin/users',
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? SUPERADMIN_PAGE_SIZE,
        search: params.search || undefined,
        role: params.role ?? 'all',
        banned: params.banned ?? 'all',
      },
    },
  )
  return data
}

export async function fetchSuperadminDrivers(params: {
  page?: number
  pageSize?: number
  search?: string
  banned?: BannedFilter
  applicationStatus?: ApplicationStatusFilter
} = {}) {
  const { data } = await api.get<PaginatedResponse<SuperadminDriver>>(
    '/superadmin/drivers',
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? SUPERADMIN_PAGE_SIZE,
        search: params.search || undefined,
        banned: params.banned ?? 'all',
        applicationStatus: params.applicationStatus ?? 'all',
      },
    },
  )
  return data
}

export async function updateSuperadminUserRole(userId: string, role: Role) {
  const { data } = await api.patch<{ id: string; role: Role }>(
    `/superadmin/users/${userId}/role`,
    { role },
  )
  return data
}

export async function banSuperadminUser(
  userId: string,
  payload: { isBanned: boolean; reason?: string | null },
) {
  const { data } = await api.patch<{
    id: string
    isBanned: boolean
    bannedAt: string | null
    bannedReason: string | null
  }>(`/superadmin/users/${userId}/ban`, payload)
  return data
}

export async function setSuperadminUserPassword(
  userId: string,
  password: string,
) {
  const { data } = await api.patch<{ id: string; updated: boolean }>(
    `/superadmin/users/${userId}/password`,
    { password },
  )
  return data
}

export const superadminStatsQueryKey = ['superadmin', 'stats'] as const

export function superadminTripsQueryKey(params: {
  page: number
  pageSize?: number
  status?: TripStatusFilter
  search?: string
}) {
  return [
    'superadmin',
    'trips',
    {
      page: params.page,
      pageSize: params.pageSize ?? SUPERADMIN_PAGE_SIZE,
      status: params.status ?? 'all',
      search: params.search ?? '',
    },
  ] as const
}

export function superadminBookingsQueryKey(params: {
  page: number
  pageSize?: number
  search?: string
  status?: BookingStatusFilter
}) {
  return [
    'superadmin',
    'bookings',
    {
      page: params.page,
      pageSize: params.pageSize ?? SUPERADMIN_PAGE_SIZE,
      search: params.search ?? '',
      status: params.status ?? 'all',
    },
  ] as const
}

export function superadminUsersQueryKey(params: {
  page: number
  pageSize?: number
  search?: string
  role?: RoleFilter
  banned?: BannedFilter
}) {
  return [
    'superadmin',
    'users',
    {
      page: params.page,
      pageSize: params.pageSize ?? SUPERADMIN_PAGE_SIZE,
      search: params.search ?? '',
      role: params.role ?? 'all',
      banned: params.banned ?? 'all',
    },
  ] as const
}

export function superadminDriversQueryKey(params: {
  page: number
  pageSize?: number
  search?: string
  banned?: BannedFilter
  applicationStatus?: ApplicationStatusFilter
}) {
  return [
    'superadmin',
    'drivers',
    {
      page: params.page,
      pageSize: params.pageSize ?? SUPERADMIN_PAGE_SIZE,
      search: params.search ?? '',
      banned: params.banned ?? 'all',
      applicationStatus: params.applicationStatus ?? 'all',
    },
  ] as const
}

export const superadminUsersInvalidateKey = ['superadmin', 'users'] as const
