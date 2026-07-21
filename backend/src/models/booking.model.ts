import { Prisma } from '@prisma/client'
import type {
  CreateBookingInput,
  CreatedBooking,
  DriverBookingPassenger,
  HistoryBooking,
  UpcomingBooking,
  UpdateBookingInput,
} from './booking.types.js'
import {
  canCancelBeforePickup,
  CANCELLATION_TOO_LATE_MESSAGE,
} from '../lib/booking-cancellation.js'
import { createBookingId, createBookingReference } from '../lib/ids.js'
import { prisma } from '../lib/prisma.js'
import { presentVan, vanInclude } from '../lib/van-presenter.js'
import { AppError } from '../utils/app-error.js'
import {
  postBookingSettlement,
  reverseBookingSettlement,
} from './wallet.model.js'

export type {
  BookingStatus,
  CreateBookingInput,
  CreatedBooking,
  HistoryBooking,
  PaymentMethod,
  UpcomingBooking,
  UpdateBookingInput,
} from './booking.types.js'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1603292444039-af0812cb5226?w=800&h=500&fit=crop&q=80'

function resolveBookingImage(imageUrl: string) {
  if (
    imageUrl.includes('photo-1544620347-c4fd4a3d5957') ||
    imageUrl.includes('photo-1559050695-edde77c73609') ||
    imageUrl.includes('photo-1603292444039-af0812cb5226')
  ) {
    return DEFAULT_IMAGE
  }
  return imageUrl
}

function formatDisplayDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function calculateTotal(baseFare: number) {
  const serviceFee = Math.round(baseFare * 0.04)
  const tax = 0
  return {
    baseFare,
    serviceFee,
    tax,
    total: baseFare + serviceFee,
  }
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
  status: 'pending' | 'confirmed',
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
    image: resolveBookingImage(snapshot.imageUrl),
    date: snapshot.departureDate,
    time: snapshot.departureTime,
    seat: snapshot.seatLabel,
    pickupAddress,
    dropoffAddress,
    route: snapshot.routeLabel,
    vehicle: snapshot.vehicleLabel,
    price: snapshot.priceDisplay,
    status,
    canCancel,
  }
}

export const BookingModel = {
  async create(input: CreateBookingInput): Promise<CreatedBooking> {
    // Retry only on unique-constraint collisions from the random id/reference.
    // Seat/seatsLeft conflicts throw AppError(409) and are NOT retried.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await BookingModel.createOnce(input)
      } catch (error) {
        const isUniqueCollision =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        if (isUniqueCollision && attempt < 2) continue
        throw error
      }
    }
    throw new AppError('Could not create booking. Please try again.', 500)
  },

  async createOnce(input: CreateBookingInput): Promise<CreatedBooking> {
    return prisma.$transaction(async (tx) => {
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

      // Atomically claim the seat: the WHERE clause is re-evaluated against the
      // latest committed row, so two concurrent bookings cannot both succeed.
      const seatClaim = await tx.seat.updateMany({
        where: { id: seat.id, status: { not: 'occupied' } },
        data: { status: 'occupied' },
      })
      if (seatClaim.count === 0) {
        throw new AppError('This seat is no longer available', 409)
      }

      // Atomically decrement remaining seats only if capacity is left.
      const capacityClaim = await tx.van.updateMany({
        where: { id: van.id, seatsLeft: { gt: 0 } },
        data: { seatsLeft: { decrement: 1 } },
      })
      if (capacityClaim.count === 0) {
        throw new AppError('No seats remaining on this trip', 409)
      }

      const presented = presentVan(van)
      const fare = calculateTotal(van.price)

      const reference = createBookingReference()
      const routeLabel = `${presented.departureLocation} → ${presented.arrivalLocation}`
      const vehicleLabel = presented.vehicleName ?? presented.operator
      const date = formatDisplayDate(van.departureDate)
      const tripType = van.tripCategory ?? presented.classType

      const bookingId = createBookingId()

      const booking = await tx.booking.create({
        data: {
          id: bookingId,
          userId: input.userId,
          vanId: van.id,
          seatId: seat.id,
          reference,
          pickupAddress: input.pickupAddress.trim(),
          dropoffAddress: input.dropoffAddress.trim(),
          status: 'pending',
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

      await tx.payment.create({
        data: {
          userId: input.userId,
          bookingId: booking.id,
          provider: 'cash',
          providerIntentId: `cash_${booking.id}`,
          amount: fare.total,
          currency: 'PHP',
          status: 'pending',
        },
      })

      if (van.driverId) {
        const settled = await tx.booking.findUniqueOrThrow({
          where: { id: booking.id },
          include: { snapshot: true, payment: true },
        })
        await postBookingSettlement(tx, {
          driverId: van.driverId,
          booking: settled,
          actorProfileId: input.userId,
        })
      }

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
        status: 'pending' as const,
      }
    })
  },

  async getUpcoming(userId: string): Promise<UpcomingBooking | null> {
    const booking = await prisma.booking.findFirst({
      where: { userId, status: { in: ['pending', 'confirmed'] } },
      include: { snapshot: true, van: true },
      orderBy: [
        { status: 'asc' }, // confirmed before pending alphabetically? Actually 'confirmed' < 'pending' so confirmed first
        { createdAt: 'desc' },
      ],
    })

    if (!booking) return null

    const status = booking.status as 'pending' | 'confirmed'
    const canCancel =
      status === 'pending'
        ? true
        : booking.van != null
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
      status,
    )
  },

  async getHistory(userId: string): Promise<HistoryBooking[]> {
    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        status: { in: ['completed', 'cancelled', 'declined'] },
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
      status: booking.status as 'completed' | 'cancelled' | 'declined',
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
        where: {
          id: bookingId,
          userId,
          status: { in: ['pending', 'confirmed'] },
        },
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

        if (targetSeat.id !== booking.seatId) {
          // Atomically claim the new seat before releasing the old one.
          const claim = await tx.seat.updateMany({
            where: { id: targetSeat.id, status: { not: 'occupied' } },
            data: { status: 'occupied' },
          })
          if (claim.count === 0) {
            throw new AppError('This seat is no longer available', 409)
          }

          if (currentSeat) {
            await tx.seat.update({
              where: { id: currentSeat.id },
              data: { status: 'available' },
            })
          }
        }

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

      const canCancel =
        booking.status === 'pending'
          ? true
          : canCancelBeforePickup(
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
        booking.status as 'pending' | 'confirmed',
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
        where: {
          id: bookingId,
          userId,
          status: { in: ['pending', 'confirmed'] },
        },
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
        booking.status === 'confirmed' &&
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

      if (booking.van.driverId) {
        await reverseBookingSettlement(tx, {
          driverId: booking.van.driverId,
          bookingId,
          actorProfileId: userId,
          reason: 'System fee reversed (booking cancelled)',
        })
      }

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

  async acceptByDriver(
    tripId: string,
    bookingId: string,
    driverId: string,
  ): Promise<DriverBookingPassenger> {
    const van = await prisma.van.findFirst({
      where: { id: tripId, driverId, status: 'published' },
      select: { id: true },
    })
    if (!van) {
      throw new AppError('Trip not found or not available', 404)
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, vanId: tripId, status: 'pending' },
      include: {
        snapshot: true,
        user: {
          select: { fullName: true, email: true, phone: true },
        },
      },
    })

    if (!booking) {
      throw new AppError('Seat request not found or already handled', 404)
    }

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'confirmed' },
        include: {
          snapshot: true,
          user: {
            select: { fullName: true, email: true, phone: true },
          },
        },
      })

      if (booking.userId) {
        const routeLabel = booking.snapshot?.routeLabel ?? 'your trip'
        const seatLabel = booking.snapshot?.seatLabel
        await tx.notification.create({
          data: {
            userId: booking.userId,
            type: 'booking_accepted',
            title: 'Seat request accepted',
            body: `Your seat request${booking.reference ? ` (${booking.reference})` : ''}${seatLabel ? ` for seat ${seatLabel}` : ''} on ${routeLabel} was accepted by the driver.`,
            data: {
              tripId,
              bookingId: booking.id,
              kind: 'booking',
            },
          },
        })
      }

      return next
    })

    return {
      id: updated.id,
      reference: updated.reference,
      seat: updated.snapshot?.seatLabel ?? null,
      name: updated.user?.fullName?.trim() || updated.user?.email || 'Guest',
      email: updated.user?.email ?? null,
      phone: updated.user?.phone ?? null,
      price: updated.snapshot?.priceDisplay ?? null,
      pickupAddress: updated.pickupAddress ?? null,
      dropoffAddress: updated.dropoffAddress ?? null,
      status: 'confirmed',
      destinationReachedAt: updated.destinationReachedAt,
      bookedAt: updated.createdAt,
    }
  },

  async declineByDriver(
    tripId: string,
    bookingId: string,
    driverId: string,
    reason?: string | null,
  ): Promise<DriverBookingPassenger> {
    const van = await prisma.van.findFirst({
      where: { id: tripId, driverId },
      select: { id: true },
    })
    if (!van) {
      throw new AppError('Trip not found', 404)
    }

    const declineReason = reason?.trim() || null

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, vanId: tripId, status: 'pending' },
      include: {
        snapshot: true,
        user: {
          select: { fullName: true, email: true, phone: true },
        },
      },
    })

    if (!booking) {
      throw new AppError('Seat request not found or already handled', 404)
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (booking.seatId) {
        await tx.seat.update({
          where: { id: booking.seatId },
          data: { status: 'available' },
        })
      }

      await tx.van.update({
        where: { id: tripId },
        data: { seatsLeft: { increment: 1 } },
      })

      const next = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'declined' },
        include: {
          snapshot: true,
          user: {
            select: { fullName: true, email: true, phone: true },
          },
        },
      })

      await reverseBookingSettlement(tx, {
        driverId,
        bookingId,
        actorProfileId: driverId,
        reason: 'System fee reversed (seat request declined)',
      })

      if (booking.userId) {
        const routeLabel = booking.snapshot?.routeLabel ?? 'your trip'
        const seatLabel = booking.snapshot?.seatLabel
        const reasonSuffix = declineReason
          ? ` Reason: ${declineReason}`
          : ''
        await tx.notification.create({
          data: {
            userId: booking.userId,
            type: 'booking_declined',
            title: 'Seat request declined',
            body: `Your seat request${booking.reference ? ` (${booking.reference})` : ''}${seatLabel ? ` for seat ${seatLabel}` : ''} on ${routeLabel} was declined by the driver.${reasonSuffix} You can book another seat or trip.`,
            data: {
              tripId,
              bookingId: booking.id,
              kind: 'booking',
              ...(declineReason ? { reason: declineReason } : {}),
            },
          },
        })
      }

      return next
    })

    return {
      id: updated.id,
      reference: updated.reference,
      seat: updated.snapshot?.seatLabel ?? null,
      name: updated.user?.fullName?.trim() || updated.user?.email || 'Guest',
      email: updated.user?.email ?? null,
      phone: updated.user?.phone ?? null,
      price: updated.snapshot?.priceDisplay ?? null,
      pickupAddress: updated.pickupAddress ?? null,
      dropoffAddress: updated.dropoffAddress ?? null,
      status: 'declined',
      destinationReachedAt: null,
      bookedAt: updated.createdAt,
    }
  },
}
