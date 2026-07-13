import { prisma } from '../lib/prisma.js'

export const AdminModel = {
  async getStats() {
    const [
      totalUsers,
      totalDrivers,
      totalPassengers,
      pendingApplications,
      publishedTrips,
      draftTrips,
      totalBookings,
      confirmedBookings,
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({ where: { role: 'driver' } }),
      prisma.profile.count({ where: { role: 'passenger' } }),
      prisma.driverApplication.count({ where: { status: 'pending' } }),
      prisma.van.count({ where: { status: 'published' } }),
      prisma.van.count({ where: { status: 'draft' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'confirmed' } }),
    ])

    return {
      totalUsers,
      totalDrivers,
      totalPassengers,
      pendingApplications,
      publishedTrips,
      draftTrips,
      totalBookings,
      confirmedBookings,
    }
  },

  async listTrips(options?: { page?: number; pageSize?: number }) {
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 100
    const trips = await prisma.van.findMany({
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
    })

    return trips.map((trip) => ({
      id: trip.id,
      route: `${trip.route.departureLocation} → ${trip.route.arrivalLocation}`,
      departureDate: trip.departureDate,
      departureTime: trip.departureTime,
      status: trip.status,
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
    }))
  },

  async listBookings() {
    const bookings = await prisma.booking.findMany({
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
      take: 100,
    })

    return bookings.map((booking) => ({
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
    }))
  },

  async listUsers(options?: { page?: number; pageSize?: number }) {
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 100
    const users = await prisma.profile.findMany({
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
    })

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      driverApplicationStatus: user.driverApplication?.status ?? null,
      bookingCount: user._count.bookings,
      tripCount: user._count.vans,
      createdAt: user.createdAt,
    }))
  },
}
