import type { BookingStatus, HistoryBooking, UpcomingBooking } from './booking.types.js'
import { prisma } from '../lib/prisma.js'

export type { BookingStatus, HistoryBooking, UpcomingBooking }

export const BookingModel = {
  async getUpcoming(): Promise<UpcomingBooking | null> {
    const booking = await prisma.booking.findFirst({
      where: { status: 'confirmed' },
      orderBy: { createdAt: 'desc' },
    })

    if (!booking || !booking.routeCode || !booking.image || !booking.time || !booking.seat || !booking.gate || !booking.vehicle) {
      return null
    }

    return {
      id: booking.id,
      routeCode: booking.routeCode,
      image: booking.image,
      date: booking.date,
      time: booking.time,
      seat: booking.seat,
      gate: booking.gate,
      route: booking.route,
      vehicle: booking.vehicle,
      status: 'confirmed',
    }
  },

  async getHistory(): Promise<HistoryBooking[]> {
    const bookings = await prisma.booking.findMany({
      where: { status: { in: ['completed', 'cancelled'] } },
      orderBy: { createdAt: 'desc' },
    })

    return bookings.map((booking) => ({
      id: booking.id,
      reference: booking.reference ?? '',
      date: booking.date,
      route: booking.route,
      tripType: booking.tripType ?? '',
      status: booking.status as 'completed' | 'cancelled',
      price: booking.price ?? '',
    }))
  },
}
