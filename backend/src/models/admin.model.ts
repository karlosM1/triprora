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

  async listTrips() {
    const trips = await prisma.van.findMany({
      include: {
        driver: {
          select: {
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: [{ departureDate: 'desc' }, { createdAt: 'desc' }],
    })

    return trips.map((trip) => ({
      id: trip.id,
      route: `${trip.departureLocation} → ${trip.arrivalLocation}`,
      departureDate: trip.departureDate,
      departureTime: trip.departureTime,
      status: trip.status,
      price: trip.price,
      seatsLeft: trip.seatsLeft,
      totalSeats: trip.totalSeats,
      vehicleName: trip.vehicleName,
      driverName: trip.driver?.fullName ?? trip.operator,
      driverEmail: trip.driver?.email ?? null,
      bookingCount: trip._count.bookings,
      createdAt: trip.createdAt,
    }))
  },

  async listBookings() {
    const bookings = await prisma.booking.findMany({
      include: {
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
      route: booking.route,
      date: booking.date,
      time: booking.time,
      seat: booking.seat,
      status: booking.status,
      price: booking.price,
      passengerName: booking.user?.fullName ?? 'Guest',
      passengerEmail: booking.user?.email ?? null,
      createdAt: booking.createdAt,
    }))
  },

  async listUsers() {
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
