import type {
  CreateBookingInput,
  CreatedBooking,
  HistoryBooking,
  UpcomingBooking,
} from './booking.types.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/app-error.js'

export type {
  BookingStatus,
  CreateBookingInput,
  CreatedBooking,
  HistoryBooking,
  UpcomingBooking,
} from './booking.types.js'

const PREMIUM_SEAT_FEE = 150
const DEFAULT_GATE = 'Gate A'
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

function calculateTotal(baseFare: number, isPremium: boolean) {
  const premiumFee = isPremium ? PREMIUM_SEAT_FEE : 0
  const serviceFee = Math.round(baseFare * 0.05)
  const tax = Math.round((baseFare + premiumFee + serviceFee) * 0.05)
  return baseFare + premiumFee + serviceFee + tax
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
  routeCode: string | null
  image: string | null
  date: string
  time: string | null
  seat: string | null
  gate: string | null
  route: string
  vehicle: string | null
}): UpcomingBooking | null {
  if (
    !booking.routeCode ||
    !booking.image ||
    !booking.time ||
    !booking.seat ||
    !booking.gate ||
    !booking.vehicle
  ) {
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

      const isPremium = seat.premium
      const total = calculateTotal(van.price, isPremium)
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
          gate: DEFAULT_GATE,
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
        gate: DEFAULT_GATE,
        vehicle,
        operator: van.operator,
        price: formatPrice(total),
        isPremium,
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
}
