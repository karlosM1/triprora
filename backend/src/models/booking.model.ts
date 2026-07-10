import type {
  CreateBookingInput,
  CreatedBooking,
  HistoryBooking,
  UpcomingBooking,
  UpdateBookingInput,
} from './booking.types.js'
import {
  canCancelBeforePickup,
  CANCELLATION_TOO_LATE_MESSAGE,
} from '../lib/booking-cancellation.js'
import { prisma } from '../lib/prisma.js'
import { presentVan, vanInclude } from '../lib/van-presenter.js'
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
  return {
    baseFare,
    serviceFee,
    tax,
    total: baseFare + serviceFee + tax,
  }
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

type BookingSnapshotView = {
  routeCode: string | null
  routeLabel: string
  imageUrl: string | null
  departureDate: string
  departureTime: string | null
  seatLabel: string
  vehicleLabel: string | null
  tripType: string | null
  priceDisplay: string
}

function toUpcomingBooking(
  bookingId: string,
  reference: string | null,
  pickupAddress: string | null,
  dropoffAddress: string | null,
  snapshot: BookingSnapshotView | null,
  canCancel: boolean,
): UpcomingBooking | null {
  if (
    !reference ||
    !snapshot ||
    !snapshot.routeCode ||
    !snapshot.imageUrl ||
    !snapshot.departureTime ||
    !snapshot.seatLabel ||
    !pickupAddress ||
    !dropoffAddress ||
    !snapshot.vehicleLabel ||
    !snapshot.priceDisplay
  ) {
    return null
  }

  return {
    id: bookingId,
    reference,
    routeCode: snapshot.routeCode,
    image: snapshot.imageUrl,
    date: snapshot.departureDate,
    time: snapshot.departureTime,
    seat: snapshot.seatLabel,
    pickupAddress,
    dropoffAddress,
    route: snapshot.routeLabel,
    vehicle: snapshot.vehicleLabel,
    price: snapshot.priceDisplay,
    status: 'confirmed',
    canCancel,
  }
}

export const BookingModel = {
  async create(input: CreateBookingInput): Promise<CreatedBooking> {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: {
          providerIntentId: input.paymentIntentId,
          userId: input.userId,
        },
      })

      if (!payment) {
        throw new AppError('Payment not found', 404)
      }

      if (payment.bookingId) {
        throw new AppError('This payment has already been used', 409)
      }

      if (payment.status !== 'succeeded') {
        // Re-check with latest DB status only; frontend polls PayMongo before this.
        throw new AppError('Payment is not completed yet', 402)
      }

      const van = await tx.van.findFirst({
        where: { id: input.vanId, status: 'published' },
        include: {
          ...vanInclude,
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

      const presented = presentVan(van)
      const fare = calculateTotal(van.price)
      if (payment.amount !== fare.total) {
        throw new AppError('Payment amount does not match booking total', 400)
      }

      const reference = createReference()
      const routeLabel = `${presented.departureLocation} → ${presented.arrivalLocation}`
      const vehicleLabel = presented.vehicleName ?? presented.operator
      const date = formatDisplayDate(van.departureDate)
      const tripType = van.tripCategory ?? presented.classType

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
          seatId: seat.id,
          reference,
          pickupAddress: input.pickupAddress.trim(),
          dropoffAddress: input.dropoffAddress.trim(),
          status: 'confirmed',
          snapshot: {
            create: {
              routeCode: van.id,
              routeLabel,
              imageUrl: DEFAULT_IMAGE,
              departureDate: date,
              departureTime: van.departureTime,
              seatLabel: input.seat,
              vehicleLabel,
              tripType,
              baseFareCents: fare.baseFare * 100,
              serviceFeeCents: fare.serviceFee * 100,
              taxCents: fare.tax * 100,
              totalCents: fare.total * 100,
              priceDisplay: formatPrice(fare.total),
            },
          },
        },
        include: { snapshot: true },
      })

      await tx.payment.update({
        where: { id: payment.id },
        data: { bookingId: booking.id },
      })

      return {
        id: booking.id,
        reference: booking.reference!,
        route: routeLabel,
        date,
        time: van.departureTime,
        seat: input.seat,
        pickupAddress: input.pickupAddress.trim(),
        dropoffAddress: input.dropoffAddress.trim(),
        vehicle: vehicleLabel,
        operator: presented.operator,
        price: formatPrice(fare.total),
      }
    })
  },

  async getUpcoming(userId: string): Promise<UpcomingBooking | null> {
    const booking = await prisma.booking.findFirst({
      where: { userId, status: 'confirmed' },
      include: { snapshot: true, van: true },
      orderBy: { createdAt: 'desc' },
    })

    if (!booking) return null

    const canCancel =
      booking.van != null
        ? canCancelBeforePickup(
            booking.van.departureDate,
            booking.van.departureTime,
          )
        : false

    return toUpcomingBooking(
      booking.id,
      booking.reference,
      booking.pickupAddress,
      booking.dropoffAddress,
      booking.snapshot,
      canCancel,
    )
  },

  async getHistory(userId: string): Promise<HistoryBooking[]> {
    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        status: { in: ['completed', 'cancelled'] },
      },
      include: { snapshot: true },
      orderBy: { createdAt: 'desc' },
    })

    return bookings.map((booking) => ({
      id: booking.id,
      reference: booking.reference ?? '',
      date: booking.snapshot?.departureDate ?? '',
      route: booking.snapshot?.routeLabel ?? '',
      tripType: booking.snapshot?.tripType ?? '',
      status: booking.status as 'completed' | 'cancelled',
      price: booking.snapshot?.priceDisplay ?? '',
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
          snapshot: true,
          van: {
            include: { seats: true },
          },
        },
      })

      if (!booking || !booking.van || !booking.snapshot) {
        throw new AppError('Booking not found', 404)
      }

      const pickupAddress = input.pickupAddress?.trim() ?? booking.pickupAddress
      const dropoffAddress = input.dropoffAddress?.trim() ?? booking.dropoffAddress
      const nextSeatLabel = input.seat?.trim() ?? booking.snapshot.seatLabel

      if (!pickupAddress || !dropoffAddress || !nextSeatLabel) {
        throw new AppError('Booking details are incomplete', 400)
      }

      let nextSeatId = booking.seatId

      if (nextSeatLabel !== booking.snapshot.seatLabel) {
        const currentSeat = booking.van.seats.find(
          (seat) => seat.label === booking.snapshot!.seatLabel,
        )
        const targetSeat = booking.van.seats.find((seat) => seat.label === nextSeatLabel)

        if (!targetSeat) {
          throw new AppError('Seat not found', 404)
        }

        if (targetSeat.status === 'occupied' && targetSeat.id !== booking.seatId) {
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

        nextSeatId = targetSeat.id
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          pickupAddress,
          dropoffAddress,
          seatId: nextSeatId,
          snapshot: {
            update: {
              seatLabel: nextSeatLabel,
            },
          },
        },
        include: { snapshot: true },
      })

      const canCancel = canCancelBeforePickup(
        booking.van.departureDate,
        booking.van.departureTime,
      )

      const upcoming = toUpcomingBooking(
        updated.id,
        updated.reference,
        updated.pickupAddress,
        updated.dropoffAddress,
        updated.snapshot,
        canCancel,
      )
      if (!upcoming) {
        throw new AppError('Unable to load updated booking', 500)
      }

      return upcoming
    })
  },

  async cancel(userId: string, bookingId: string): Promise<HistoryBooking> {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, userId, status: 'confirmed' },
        include: {
          snapshot: true,
          van: true,
        },
      })

      if (!booking || !booking.snapshot) {
        throw new AppError('Booking not found', 404)
      }

      if (!booking.van) {
        throw new AppError('Unable to cancel this booking', 400)
      }

      if (
        !canCancelBeforePickup(
          booking.van.departureDate,
          booking.van.departureTime,
        )
      ) {
        throw new AppError(CANCELLATION_TOO_LATE_MESSAGE, 400)
      }

      if (booking.seatId) {
        await tx.seat.update({
          where: { id: booking.seatId },
          data: { status: 'available' },
        })
      }

      await tx.van.update({
        where: { id: booking.van.id },
        data: { seatsLeft: { increment: 1 } },
      })

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'cancelled' },
        include: { snapshot: true },
      })

      return {
        id: updated.id,
        reference: updated.reference ?? '',
        date: updated.snapshot?.departureDate ?? '',
        route: updated.snapshot?.routeLabel ?? '',
        tripType: updated.snapshot?.tripType ?? '',
        status: 'cancelled',
        price: updated.snapshot?.priceDisplay ?? '',
      }
    })
  },
}
