import type { Prisma, Role, VanStatus } from '@prisma/client'
import { prisma } from '../lib/prisma.js'

export type TripDisplayStatus =
  | 'upcoming'
  | 'ongoing'
  | 'completed'
  | 'cancelled'
  | 'draft'

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export function deriveTripDisplayStatus(
  status: VanStatus,
  departureDate: string,
  today = todayDateString(),
): TripDisplayStatus {
  if (status === 'completed') return 'completed'
  if (status === 'cancelled') return 'cancelled'
  if (status === 'draft') return 'draft'
  if (status === 'published') {
    return departureDate > today ? 'upcoming' : 'ongoing'
  }
  return 'draft'
}

function tripStatusWhere(
  filter: TripDisplayStatus | 'all',
  today = todayDateString(),
): Prisma.VanWhereInput | undefined {
  if (filter === 'all') return undefined
  if (filter === 'completed') return { status: 'completed' }
  if (filter === 'cancelled') return { status: 'cancelled' }
  if (filter === 'draft') return { status: 'draft' }
  if (filter === 'upcoming') {
    return { status: 'published', departureDate: { gt: today } }
  }
  return { status: 'published', departureDate: { lte: today } }
}

function containsSearch(search?: string) {
  const term = search?.trim()
  if (!term) return undefined
  return { contains: term, mode: 'insensitive' as const }
}

function mergeWhere<T extends object>(
  ...parts: Array<T | undefined | null | false>
): T | undefined {
  const filtered = parts.filter(Boolean) as T[]
  if (filtered.length === 0) return undefined
  if (filtered.length === 1) return filtered[0]
  return { AND: filtered } as T
}

function eachDayLastN(days: number) {
  const result: string[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i)
    result.push(d.toISOString().slice(0, 10))
  }
  return result
}

export const AdminModel = {
  async getStats() {
    const today = todayDateString()
    const since = new Date()
    since.setUTCDate(since.getUTCDate() - 29)
    since.setUTCHours(0, 0, 0, 0)

    const [
      totalUsers,
      totalDrivers,
      totalPassengers,
      totalAdmins,
      totalSuperadmins,
      bannedUsers,
      pendingApplications,
      publishedTrips,
      draftTrips,
      completedTrips,
      cancelledTrips,
      upcomingTrips,
      ongoingTrips,
      totalBookings,
      confirmedBookings,
      recentBookings,
      recentUsers,
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({ where: { role: 'driver' } }),
      prisma.profile.count({ where: { role: 'passenger' } }),
      prisma.profile.count({ where: { role: 'admin' } }),
      prisma.profile.count({ where: { role: 'superadmin' } }),
      prisma.profile.count({ where: { isBanned: true } }),
      prisma.driverApplication.count({ where: { status: 'pending' } }),
      prisma.van.count({ where: { status: 'published' } }),
      prisma.van.count({ where: { status: 'draft' } }),
      prisma.van.count({ where: { status: 'completed' } }),
      prisma.van.count({ where: { status: 'cancelled' } }),
      prisma.van.count({
        where: { status: 'published', departureDate: { gt: today } },
      }),
      prisma.van.count({
        where: { status: 'published', departureDate: { lte: today } },
      }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'confirmed' } }),
      prisma.booking.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.profile.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
    ])

    const days = eachDayLastN(30)
    const bookingsByDay = Object.fromEntries(days.map((d) => [d, 0]))
    const usersByDay = Object.fromEntries(days.map((d) => [d, 0]))

    for (const booking of recentBookings) {
      const key = booking.createdAt.toISOString().slice(0, 10)
      if (key in bookingsByDay) bookingsByDay[key] += 1
    }
    for (const user of recentUsers) {
      const key = user.createdAt.toISOString().slice(0, 10)
      if (key in usersByDay) usersByDay[key] += 1
    }

    return {
      totalUsers,
      totalDrivers,
      totalPassengers,
      totalAdmins,
      totalSuperadmins,
      bannedUsers,
      pendingApplications,
      publishedTrips,
      draftTrips,
      completedTrips,
      cancelledTrips,
      upcomingTrips,
      ongoingTrips,
      totalBookings,
      confirmedBookings,
      usersByRole: [
        { role: 'passenger', count: totalPassengers },
        { role: 'driver', count: totalDrivers },
        { role: 'admin', count: totalAdmins },
        { role: 'superadmin', count: totalSuperadmins },
      ],
      tripsByStatus: [
        { status: 'upcoming', count: upcomingTrips },
        { status: 'ongoing', count: ongoingTrips },
        { status: 'completed', count: completedTrips },
        { status: 'cancelled', count: cancelledTrips },
        { status: 'draft', count: draftTrips },
      ],
      bookingsLast30Days: days.map((date) => ({
        date,
        count: bookingsByDay[date] ?? 0,
      })),
      usersLast30Days: days.map((date) => ({
        date,
        count: usersByDay[date] ?? 0,
      })),
    }
  },

  async listTrips(options?: {
    page?: number
    pageSize?: number
    status?: TripDisplayStatus | 'all'
    search?: string
  }) {
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 10
    const status = options?.status ?? 'all'
    const search = containsSearch(options?.search)
    const statusWhere = tripStatusWhere(status)
    const searchWhere: Prisma.VanWhereInput | undefined = search
      ? {
          OR: [
            { driver: { fullName: search } },
            { driver: { email: search } },
            { operator: { name: search } },
            { route: { departureLocation: search } },
            { route: { arrivalLocation: search } },
            { vehicle: { plateNumber: search } },
            { vehicle: { make: search } },
            { vehicle: { model: search } },
          ],
        }
      : undefined
    const where = mergeWhere(statusWhere, searchWhere)
    const today = todayDateString()

    const [total, trips] = await Promise.all([
      prisma.van.count({ where }),
      prisma.van.findMany({
        where,
        include: {
          route: true,
          vehicle: true,
          driver: {
            select: {
              fullName: true,
              email: true,
            },
          },
          operator: true,
          _count: {
            select: { bookings: true },
          },
        },
        orderBy: [{ departureDate: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return {
      items: trips.map((trip) => ({
        id: trip.id,
        route: `${trip.route.departureLocation} → ${trip.route.arrivalLocation}`,
        departureDate: trip.departureDate,
        departureTime: trip.departureTime,
        status: trip.status,
        displayStatus: deriveTripDisplayStatus(
          trip.status,
          trip.departureDate,
          today,
        ),
        price: trip.price,
        seatsLeft: trip.seatsLeft,
        totalSeats: trip.totalSeats,
        vehicleName: trip.vehicle
          ? `${trip.vehicle.make} ${trip.vehicle.model}`.trim()
          : null,
        driverName: trip.driver?.fullName ?? trip.operator.name,
        driverEmail: trip.driver?.email ?? null,
        bookingCount: trip._count.bookings,
        createdAt: trip.createdAt,
      })),
      total,
      page,
      pageSize,
    }
  },

  async listBookings(options?: {
    page?: number
    pageSize?: number
    search?: string
    status?: 'all' | 'confirmed' | 'completed' | 'cancelled'
  }) {
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 10
    const search = containsSearch(options?.search)
    const status =
      options?.status && options.status !== 'all'
        ? options.status
        : undefined
    const where = mergeWhere<Prisma.BookingWhereInput>(
      status ? { status } : undefined,
      search
        ? {
            OR: [
              { reference: search },
              { user: { fullName: search } },
              { user: { email: search } },
              { snapshot: { routeLabel: search } },
              { snapshot: { seatLabel: search } },
            ],
          }
        : undefined,
    )

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        include: {
          snapshot: true,
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return {
      items: bookings.map((booking) => ({
        id: booking.id,
        reference: booking.reference,
        route: booking.snapshot?.routeLabel ?? '',
        date: booking.snapshot?.departureDate ?? '',
        time: booking.snapshot?.departureTime ?? null,
        seat: booking.snapshot?.seatLabel ?? null,
        status: booking.status,
        price: booking.snapshot?.priceDisplay ?? null,
        passengerName: booking.user?.fullName ?? 'Guest',
        passengerEmail: booking.user?.email ?? null,
        createdAt: booking.createdAt,
      })),
      total,
      page,
      pageSize,
    }
  },

  async listUsers(options?: {
    page?: number
    pageSize?: number
    search?: string
    role?: 'all' | Role
    banned?: 'all' | 'active' | 'banned'
  }) {
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 10
    const search = containsSearch(options?.search)
    const role =
      options?.role && options.role !== 'all' ? options.role : undefined
    const banned =
      options?.banned === 'banned'
        ? true
        : options?.banned === 'active'
          ? false
          : undefined

    const where = mergeWhere<Prisma.ProfileWhereInput>(
      role ? { role } : undefined,
      banned === undefined ? undefined : { isBanned: banned },
      search
        ? {
            OR: [
              { fullName: search },
              { email: search },
              { phone: search },
            ],
          }
        : undefined,
    )

    const [total, users] = await Promise.all([
      prisma.profile.count({ where }),
      prisma.profile.findMany({
        where,
        include: {
          driverApplication: {
            select: { status: true },
          },
          _count: {
            select: { bookings: true, vans: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return {
      items: users.map((user) => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isBanned: user.isBanned,
        bannedAt: user.bannedAt,
        bannedReason: user.bannedReason,
        driverApplicationStatus: user.driverApplication?.status ?? null,
        bookingCount: user._count.bookings,
        tripCount: user._count.vans,
        createdAt: user.createdAt,
      })),
      total,
      page,
      pageSize,
    }
  },

  async listDrivers(options?: {
    page?: number
    pageSize?: number
    search?: string
    banned?: 'all' | 'active' | 'banned'
    applicationStatus?: 'all' | 'pending' | 'approved' | 'rejected'
  }) {
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 10
    const search = containsSearch(options?.search)
    const banned =
      options?.banned === 'banned'
        ? true
        : options?.banned === 'active'
          ? false
          : undefined
    const applicationStatus =
      options?.applicationStatus && options.applicationStatus !== 'all'
        ? options.applicationStatus
        : undefined

    const where = mergeWhere<Prisma.ProfileWhereInput>(
      { role: 'driver' },
      banned === undefined ? undefined : { isBanned: banned },
      applicationStatus
        ? { driverApplication: { status: applicationStatus } }
        : undefined,
      search
        ? {
            OR: [
              { fullName: search },
              { email: search },
              { phone: search },
              { city: search },
              { province: search },
              { driverApplication: { licenseNo: search } },
              { driverApplication: { firstName: search } },
              { driverApplication: { lastName: search } },
              { driverApplication: { vehicle: { plateNumber: search } } },
              { driverApplication: { vehicle: { make: search } } },
              { driverApplication: { vehicle: { model: search } } },
              { vehicles: { some: { plateNumber: search } } },
            ],
          }
        : undefined,
    )

    const [total, drivers] = await Promise.all([
      prisma.profile.count({ where }),
      prisma.profile.findMany({
        where,
        include: {
          driverApplication: {
            include: {
              vehicle: true,
              address: true,
            },
          },
          vehicles: {
            take: 1,
            orderBy: { id: 'asc' },
          },
          _count: {
            select: { vans: true, bookings: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return {
      items: drivers.map((driver) => {
        const application = driver.driverApplication
        const vehicle = application?.vehicle ?? driver.vehicles[0] ?? null
        const fullName =
          driver.fullName ??
          (application
            ? [application.firstName, application.middleName, application.lastName]
                .filter(Boolean)
                .join(' ')
            : null)

        return {
          id: driver.id,
          email: driver.email,
          fullName,
          phone: driver.phone ?? null,
          isBanned: driver.isBanned,
          licenseNo: application?.licenseNo ?? null,
          licenseType: application?.licenseType ?? null,
          licenseExpiration: application?.licenseExpiration ?? null,
          vehiclePlateNumber: vehicle?.plateNumber ?? null,
          vehicleMake: vehicle?.make ?? null,
          vehicleModel: vehicle?.model ?? null,
          vehicleYear: vehicle?.year ?? null,
          vehicleColor: vehicle?.color ?? null,
          applicationStatus: application?.status ?? null,
          city: application?.address?.city ?? driver.city ?? null,
          province: application?.address?.province ?? driver.province ?? null,
          tripCount: driver._count.vans,
          createdAt: driver.createdAt,
        }
      }),
      total,
      page,
      pageSize,
    }
  },

  async findUserById(id: string) {
    return prisma.profile.findUnique({ where: { id } })
  },

  async updateUserRole(id: string, role: Role) {
    return prisma.profile.update({
      where: { id },
      data: { role },
    })
  },
}
