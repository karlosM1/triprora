import type {
  CreateBookingInput,
  CreatedBooking,
  HistoryBooking,
  UpcomingBooking,
  UpdateBookingInput,
} from './booking.types.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/app-error.js'

export type {
  BookingStatus,
  CreateBookingInput,
  CreatedBooking,
  HistoryBooking,
  UpcomingBooking,
  UpdateBookingInput,
} from './booking.types.js'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=500&fit=crop'

function formatDisplayDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function calculateTotal(baseFare: number) {
  const serviceFee = Math.round(baseFare * 0.05)
  const tax = Math.round((baseFare + serviceFee) * 0.05)
  return baseFare + serviceFee + tax
}

function createBookingId() {
  return `BK-${Date.now().toString(36).toUpperCase()}`
}

function createReference() {
  return `TRP-${Date.now().toString().slice(-8)}`
}

function formatPrice(amount: number) {
  return `₱${amount.toLocaleString()}`
}

function toUpcomingBooking(booking: {
  id: string
  reference: string | null
  routeCode: string | null
  image: string | null
  date: string
  time: string | null
  seat: string | null
  pickupAddress: string | null
  dropoffAddress: string | null
  route: string
  vehicle: string | null
  price: string | null
}): UpcomingBooking | null {
  if (
    !booking.reference ||
    !booking.routeCode ||
    !booking.image ||
    !booking.time ||
    !booking.seat ||
    !booking.pickupAddress ||
    !booking.dropoffAddress ||
    !booking.vehicle ||
    !booking.price
  ) {
    return null
  }

  return {
    id: booking.id,
    reference: booking.reference,
    routeCode: booking.routeCode,
    image: booking.image,
    date: booking.date,
    time: booking.time,
    seat: booking.seat,
    pickupAddress: booking.pickupAddress,
    dropoffAddress: booking.dropoffAddress,
    route: booking.route,
    vehicle: booking.vehicle,
    price: booking.price,
    status: 'confirmed',
  }
}

export const BookingModel = {
  async create(input: CreateBookingInput): Promise<CreatedBooking> {
    return prisma.$transaction(async (tx) => {
      const van = await tx.van.findFirst({
        where: { id: input.vanId, status: 'published' },
        include: {
          seats: { where: { label: input.seat } },
        },
      })

      if (!van) {
        throw new AppError('Trip not found or no longer available', 404)
      }

      const seat = van.seats[0]
      if (!seat) {
        throw new AppError('Seat not found', 404)
      }

      if (seat.status === 'occupied') {
        throw new AppError('This seat is no longer available', 409)
      }

      if (van.seatsLeft <= 0) {
        throw new AppError('No seats remaining on this trip', 409)
      }

      const total = calculateTotal(van.price)
      const reference = createReference()
      const route = `${van.departureLocation} → ${van.arrivalLocation}`
      const vehicle = van.vehicleName ?? van.operator
      const date = formatDisplayDate(van.departureDate)

      await tx.seat.update({
        where: { id: seat.id },
        data: { status: 'occupied' },
      })

      await tx.van.update({
        where: { id: van.id },
        data: { seatsLeft: { decrement: 1 } },
      })

      const booking = await tx.booking.create({
        data: {
          id: createBookingId(),
          userId: input.userId,
          vanId: van.id,
          reference,
          routeCode: van.id,
          image: DEFAULT_IMAGE,
          date,
          time: van.departureTime,
          seat: input.seat,
          pickupAddress: input.pickupAddress.trim(),
          dropoffAddress: input.dropoffAddress.trim(),
          route,
          vehicle,
          tripType: van.tripCategory ?? van.classType,
          status: 'confirmed',
          price: formatPrice(total),
        },
      })

      return {
        id: booking.id,
        reference: booking.reference!,
        route,
        date,
        time: van.departureTime,
        seat: input.seat,
        pickupAddress: input.pickupAddress.trim(),
        dropoffAddress: input.dropoffAddress.trim(),
        vehicle,
        operator: van.operator,
        price: formatPrice(total),
      }
    })
  },

  async getUpcoming(userId: string): Promise<UpcomingBooking | null> {
    const booking = await prisma.booking.findFirst({
      where: { userId, status: 'confirmed' },
      orderBy: { createdAt: 'desc' },
    })

    if (!booking) return null
    return toUpcomingBooking(booking)
  },

  async getHistory(userId: string): Promise<HistoryBooking[]> {
    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        status: { in: ['completed', 'cancelled'] },
      },
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

  async update(
    userId: string,
    bookingId: string,
    input: UpdateBookingInput,
  ): Promise<UpcomingBooking> {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, userId, status: 'confirmed' },
        include: {
          van: {
            include: { seats: true },
          },
        },
      })

      if (!booking || !booking.van) {
        throw new AppError('Booking not found', 404)
      }

      const pickupAddress = input.pickupAddress?.trim() ?? booking.pickupAddress
      const dropoffAddress = input.dropoffAddress?.trim() ?? booking.dropoffAddress
      const nextSeat = input.seat?.trim() ?? booking.seat

      if (!pickupAddress || !dropoffAddress || !nextSeat) {
        throw new AppError('Booking details are incomplete', 400)
      }

      if (nextSeat !== booking.seat) {
        const currentSeat = booking.van.seats.find((seat) => seat.label === booking.seat)
        const targetSeat = booking.van.seats.find((seat) => seat.label === nextSeat)

        if (!targetSeat) {
          throw new AppError('Seat not found', 404)
        }

        if (targetSeat.status === 'occupied') {
          throw new AppError('This seat is no longer available', 409)
        }

        if (currentSeat) {
          await tx.seat.update({
            where: { id: currentSeat.id },
            data: { status: 'available' },
          })
        }

        await tx.seat.update({
          where: { id: targetSeat.id },
          data: { status: 'occupied' },
        })
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          pickupAddress,
          dropoffAddress,
          seat: nextSeat,
        },
      })

      const upcoming = toUpcomingBooking(updated)
      if (!upcoming) {
        throw new AppError('Unable to load updated booking', 500)
      }

      return upcoming
    })
  },
}
