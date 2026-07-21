import type { Van, VanClassType, VanClassVariant } from './van.types.js'
import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import {
  ensureOperator,
  ensureRoute,
  ensureVanClass,
} from '../lib/reference-data.js'
import { createTripId } from '../lib/ids.js'
import { locationSearchTerms } from '../lib/place-match.js'
import {
  presentVan,
  vanInclude,
  vanListInclude,
  type VanWithRelations,
} from '../lib/van-presenter.js'
import { AppError } from '../utils/app-error.js'
import {
  generateSeatLabels,
} from '../lib/seat-layout.js'
import { DeliveryModel } from './delivery.model.js'
import type { DriverDeliveryRequest } from './delivery.types.js'
import { postBookingSettlement, reverseBookingSettlement } from './wallet.model.js'
import type { ListVansQuery } from '../validators/vans.validator.js'

export type { Van, VanClassType, VanClassVariant }

export type DriverTrip = {
  id: string
  classType: VanClassType
  classVariant: VanClassVariant
  departureTime: string
  departureLocation: string
  arrivalTime: string
  arrivalLocation: string
  duration: string
  operator: string
  price: number
  seatsLeft: number
  totalSeats: number | null
  departureDate: string
  tripCategory: string | null
  vehicleName: string | null
  plateNumber: string | null
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'
  driverId: string | null
  createdAt: Date
}

export type DriverTripSeat = {
  label: string
  status: 'available' | 'occupied'
  premium: boolean
}

export type DriverTripPassenger = {
  id: string
  reference: string | null
  seat: string | null
  name: string
  email: string | null
  phone: string | null
  price: string | null
  pickupAddress: string | null
  dropoffAddress: string | null
  status: 'pending' | 'confirmed'
  destinationReachedAt: Date | null
  bookedAt: Date
}

export type DriverTripDetails = {
  trip: DriverTrip
  seats: DriverTripSeat[]
  passengers: DriverTripPassenger[]
  deliveries: DriverDeliveryRequest[]
  seatsAvailable: number
  seatsOccupied: number
}

type CreateDriverTripInput = {
  driverId: string
  driverName: string | null
  departureLocation: string
  arrivalLocation: string
  departureDate: string
  departureTime: string
  durationHours: number
  tripCategory: 'express' | 'business' | 'standard'
  vehicleName: string
  plateNumber?: string
  price: number
  totalSeats: number
  status: 'draft' | 'published'
}

type UpdateDriverTripInput = Omit<CreateDriverTripInput, 'driverId' | 'driverName'>

const categoryConfig = {
  express: {
    classType: 'EXECUTIVE CLASS' as const,
    classVariant: 'executive' as const,
    durationHours: 6,
  },
  business: {
    classType: 'EXECUTIVE CLASS' as const,
    classVariant: 'executive' as const,
    durationHours: 7,
  },
  standard: {
    classType: 'STANDARD CLASS' as const,
    classVariant: 'standard' as const,
    durationHours: 8,
  },
}

function addHoursToTime(time: string, hours: number) {
  const [hourPart, minutePart] = time.split(':').map(Number)
  const addedMinutes = Math.round(hours * 60)
  const totalMinutes = hourPart * 60 + minutePart + addedMinutes
  const nextHour = Math.floor(totalMinutes / 60) % 24
  const nextMinute = totalMinutes % 60
  return `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`
}

function formatDuration(hours: number) {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  if (minutes === 0) return `${wholeHours}h`
  return `${wholeHours}h ${minutes}m`
}

function toDriverTrip(van: VanWithRelations): DriverTrip {
  const presented = presentVan(van)
  return {
    id: presented.id,
    classType: presented.classType,
    classVariant: presented.classVariant,
    departureTime: presented.departureTime,
    departureLocation: presented.departureLocation,
    arrivalTime: presented.arrivalTime,
    arrivalLocation: presented.arrivalLocation,
    duration: presented.duration,
    operator: presented.operator,
    price: presented.price,
    seatsLeft: presented.seatsLeft,
    totalSeats: presented.totalSeats ?? null,
    departureDate: presented.departureDate ?? '',
    tripCategory: presented.tripCategory ?? null,
    vehicleName: presented.vehicleName ?? null,
    plateNumber: presented.plateNumber ?? null,
    status: van.status as DriverTrip['status'],
    driverId: van.driverId,
    createdAt: van.createdAt,
  }
}

async function resolveDriverVehicleId(tx: Prisma.TransactionClient, driverId: string) {
  const vehicle = await tx.vehicle.findFirst({
    where: { ownerProfileId: driverId },
    orderBy: { id: 'asc' },
  })

  if (vehicle) return vehicle.id

  const application = await tx.driverApplication.findUnique({
    where: { profileId: driverId },
    select: { vehicleId: true, status: true },
  })

  if (application?.vehicleId) {
    return application.vehicleId
  }

  throw new AppError(
    application?.status === 'approved'
      ? 'No registered vehicle found for this driver. Contact support to re-link your vehicle.'
      : 'No registered vehicle found for this driver. Complete and get your driver application approved first.',
    400,
  )
}

function locationContainsFilter(
  field: 'departureLocation' | 'arrivalLocation',
  query?: string,
): Prisma.RouteWhereInput | undefined {
  if (!query?.trim()) return undefined
  const terms = locationSearchTerms(query)
  if (terms.length === 0) return undefined
  return {
    OR: terms.map((term) => ({
      [field]: { contains: term, mode: 'insensitive' as const },
    })),
  }
}

function departureTimeSlotFilter(
  slots: Array<'morning' | 'afternoon' | 'evening'>,
): Prisma.VanWhereInput | undefined {
  if (slots.length === 0) return undefined

  const ranges: Prisma.VanWhereInput[] = []
  for (const slot of slots) {
    if (slot === 'morning') {
      ranges.push({
        AND: [
          { departureTime: { gte: '06:00' } },
          { departureTime: { lt: '12:00' } },
        ],
      })
    } else if (slot === 'afternoon') {
      ranges.push({
        AND: [
          { departureTime: { gte: '12:00' } },
          { departureTime: { lt: '18:00' } },
        ],
      })
    } else {
      ranges.push({
        AND: [
          { departureTime: { gte: '18:00' } },
          { departureTime: { lt: '24:00' } },
        ],
      })
    }
  }

  return { OR: ranges }
}

export type VanListResult = {
  items: Van[]
  total: number
  page: number
  pageSize: number
}

async function finalizeDriverTrip(
  tripId: string,
  driverId: string,
  options: {
    routeLabel: string
    departureDate: string
    departureTime: string
    notifyPassengers: boolean
  },
  outerTx?: Prisma.TransactionClient,
): Promise<DriverTrip | null> {
  const whenLabel = [options.departureDate, options.departureTime]
    .filter(Boolean)
    .join(' at ')

  const run = async (tx: Prisma.TransactionClient) => {
    const current = await tx.van.findFirst({
      where: {
        id: tripId,
        driverId,
        status: { in: ['published', 'in_progress'] },
      },
      select: { id: true },
    })

    if (!current) return null

    const pendingBookings = await tx.booking.findMany({
      where: { vanId: tripId, status: 'pending' },
      select: { id: true, seatId: true, userId: true, reference: true },
    })

    const pendingSeatIds = pendingBookings
      .map((booking) => booking.seatId)
      .filter((seatId): seatId is string => Boolean(seatId))

    if (pendingSeatIds.length > 0) {
      await tx.seat.updateMany({
        where: { id: { in: pendingSeatIds } },
        data: { status: 'available' },
      })
    }

    if (pendingBookings.length > 0) {
      await tx.booking.updateMany({
        where: { vanId: tripId, status: 'pending' },
        data: { status: 'cancelled' },
      })
      await tx.van.update({
        where: { id: tripId },
        data: { seatsLeft: { increment: pendingBookings.length } },
      })
      for (const booking of pendingBookings) {
        await reverseBookingSettlement(tx, {
          driverId,
          bookingId: booking.id,
          actorProfileId: driverId,
          reason: 'System fee reversed (trip ended)',
        })
      }
    }

    const confirmedBookings = await tx.booking.findMany({
      where: { vanId: tripId, status: 'confirmed' },
      select: { id: true, userId: true, reference: true },
    })

    const completedAt = new Date()

    await tx.booking.updateMany({
      where: { vanId: tripId, status: 'confirmed' },
      data: {
        status: 'completed',
        destinationReachedAt: completedAt,
      },
    })

    await tx.van.update({
      where: { id: tripId },
      data: { status: 'completed' },
    })

    const bookings = await tx.booking.findMany({
      where: {
        vanId: tripId,
        status: 'completed',
        id: { in: confirmedBookings.map((booking) => booking.id) },
      },
      include: {
        snapshot: true,
        payment: true,
      },
    })

    for (const booking of bookings) {
      await postBookingSettlement(tx, {
        driverId,
        booking,
        actorProfileId: driverId,
      })
    }

    if (options.notifyPassengers && confirmedBookings.length > 0) {
      const notificationRows: Prisma.NotificationCreateManyInput[] = []
      for (const booking of confirmedBookings) {
        if (!booking.userId) continue
        const reference = booking.reference ? ` (${booking.reference})` : ''
        notificationRows.push({
          userId: booking.userId,
          type: 'trip_ended',
          title: 'Trip ended',
          body: `Your trip${reference} on ${options.routeLabel}${whenLabel ? ` (${whenLabel})` : ''} has ended. Thank you for riding with us.`,
          data: {
            tripId,
            bookingId: booking.id,
            kind: 'booking',
          },
        })
      }
      if (notificationRows.length > 0) {
        await tx.notification.createMany({ data: notificationRows })
      }
    }

    return tx.van.findUniqueOrThrow({
      where: { id: tripId },
      include: vanInclude,
    })
  }

  const van = outerTx
    ? await run(outerTx)
    : await prisma.$transaction((tx) => run(tx))

  return van ? toDriverTrip(van) : null
}

export const VanModel = {
  async findAll(query: ListVansQuery): Promise<VanListResult> {
    const {
      from,
      to,
      departureDate,
      passengers,
      priceMax,
      departureTimes,
      sort,
      page,
      pageSize,
    } = query

    const departureFilter = locationContainsFilter('departureLocation', from)
    const arrivalFilter = locationContainsFilter('arrivalLocation', to)
    const timeFilter = departureTimeSlotFilter(departureTimes)

    const where: Prisma.VanWhereInput = {
      status: 'published',
      ...(departureDate ? { departureDate } : {}),
      ...(passengers ? { seatsLeft: { gte: passengers } } : {}),
      ...(priceMax != null ? { price: { lte: priceMax } } : {}),
      ...(timeFilter ?? {}),
    }

    if (departureFilter && arrivalFilter) {
      where.route = { AND: [departureFilter, arrivalFilter] }
    } else if (departureFilter) {
      where.route = departureFilter
    } else if (arrivalFilter) {
      where.route = arrivalFilter
    }

    const orderBy: Prisma.VanOrderByWithRelationInput[] =
      sort === 'price'
        ? [{ price: 'asc' }, { departureDate: 'asc' }, { departureTime: 'asc' }]
        : [{ departureDate: 'asc' }, { departureTime: 'asc' }, { price: 'asc' }]

    const [total, vans] = await Promise.all([
      prisma.van.count({ where }),
      prisma.van.findMany({
        where,
        include: vanListInclude,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return {
      items: vans.map((van) => presentVan(van as VanWithRelations)),
      total,
      page,
      pageSize,
    }
  },

  async findByDriverId(driverId: string): Promise<DriverTrip[]> {
    // List view does not need nested driver application/vehicle joins.
    const vans = await prisma.van.findMany({
      where: { driverId },
      include: {
        route: true,
        operator: true,
        vanClass: true,
        vehicle: true,
      },
      orderBy: [{ departureDate: 'desc' }, { departureTime: 'desc' }],
    })
    return vans.map((van) => toDriverTrip(van as VanWithRelations))
  },

  async findDriverTripDetails(
    tripId: string,
    driverId: string,
  ): Promise<DriverTripDetails | null> {
    const van = await prisma.van.findFirst({
      where: { id: tripId, driverId },
      include: {
        ...vanInclude,
        seats: { orderBy: { label: 'asc' } },
        bookings: {
          where: { status: { in: ['pending', 'confirmed'] } },
          orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
          include: {
            snapshot: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        deliveries: {
          where: {
            status: {
              in: [
                'pending',
                'accepted',
                'confirmed',
                'picked_up',
                'cancelled',
                'declined',
              ],
            },
          },
          include: {
            snapshot: true,
            payment: true,
            user: { select: { fullName: true, email: true, phone: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!van) return null

    const { seats, bookings, deliveries: rawDeliveries, ...tripFields } = van
    const trip = toDriverTrip(tripFields as VanWithRelations)

    const mappedSeats: DriverTripSeat[] = seats.map((seat) => ({
      label: seat.label,
      status: seat.status === 'available' ? 'available' : 'occupied',
      premium: seat.premium,
    }))

    const passengers: DriverTripPassenger[] = bookings.map((booking) => ({
      id: booking.id,
      reference: booking.reference,
      seat: booking.snapshot?.seatLabel ?? null,
      name: booking.user?.fullName?.trim() || booking.user?.email || 'Guest',
      email: booking.user?.email ?? null,
      phone: booking.user?.phone ?? null,
      price: booking.snapshot?.priceDisplay ?? null,
      pickupAddress: booking.pickupAddress ?? null,
      dropoffAddress: booking.dropoffAddress ?? null,
      status: booking.status as DriverTripPassenger['status'],
      destinationReachedAt: booking.destinationReachedAt,
      bookedAt: booking.createdAt,
    }))

    const deliveries = DeliveryModel.mapDriverRequests(rawDeliveries)

    return {
      trip,
      seats: mappedSeats,
      passengers,
      deliveries,
      seatsAvailable: mappedSeats.filter((seat) => seat.status === 'available').length,
      seatsOccupied: mappedSeats.filter((seat) => seat.status === 'occupied').length,
    }
  },

  async findById(vanId: string): Promise<Van | null> {
    const van = await prisma.van.findFirst({
      where: {
        id: vanId,
        status: 'published',
      },
      include: vanInclude,
    })
    return van ? presentVan(van) : null
  },

  async findSeatsByVanId(vanId: string) {
    const van = await prisma.van.findUnique({
      where: { id: vanId },
      select: {
        status: true,
        seats: { orderBy: { label: 'asc' } },
      },
    })

    if (!van || van.status !== 'published') return null

    return van.seats.map((seat) => ({
      id: seat.label,
      label: seat.label,
      status: seat.status,
      premium: seat.premium || undefined,
    }))
  },

  async createDriverTrip(input: CreateDriverTripInput): Promise<DriverTrip> {
    const config = categoryConfig[input.tripCategory]
    const arrivalTime = addHoursToTime(input.departureTime, input.durationHours)
    const duration = formatDuration(input.durationHours)
    const operatorName = input.driverName?.trim() || 'Crabr Partner'
    const seatLabels = generateSeatLabels(input.totalSeats)
    const tripId = createTripId()

    const van = await prisma.$transaction(async (tx) => {
      const [operator, route, vanClass, vehicleId] = await Promise.all([
        ensureOperator(tx, operatorName),
        ensureRoute(tx, input.departureLocation, input.arrivalLocation, duration),
        ensureVanClass(tx, config.classType, config.classVariant, input.totalSeats),
        resolveDriverVehicleId(tx, input.driverId),
      ])

      const created = await tx.van.create({
        data: {
          id: tripId,
          routeId: route.id,
          operatorId: operator.id,
          vanClassId: vanClass.id,
          vehicleId,
          departureTime: input.departureTime,
          arrivalTime,
          duration,
          price: input.price,
          seatsLeft: input.totalSeats,
          totalSeats: input.totalSeats,
          departureDate: input.departureDate,
          tripCategory: input.tripCategory,
          status: input.status,
          driverId: input.driverId,
          seats: {
            create: seatLabels.map((label) => ({
              label,
              premium: false,
            })),
          },
        },
        include: vanInclude,
      })

      return tx.van.findUniqueOrThrow({
        where: { id: tripId },
        include: vanInclude,
      })
    })

    return toDriverTrip(van)
  },

  async updateDriverTrip(
    tripId: string,
    driverId: string,
    input: UpdateDriverTripInput,
  ): Promise<DriverTrip | null> {
    const existing = await prisma.van.findFirst({
      where: { id: tripId, driverId, status: 'draft' },
      select: { id: true },
    })

    if (!existing) return null

    const config = categoryConfig[input.tripCategory]
    const arrivalTime = addHoursToTime(input.departureTime, input.durationHours)
    const duration = formatDuration(input.durationHours)
    const seatLabels = generateSeatLabels(input.totalSeats)

    const van = await prisma.$transaction(async (tx) => {
      const [route, vanClass, vehicleId] = await Promise.all([
        ensureRoute(tx, input.departureLocation, input.arrivalLocation, duration),
        ensureVanClass(tx, config.classType, config.classVariant, input.totalSeats),
        resolveDriverVehicleId(tx, driverId),
      ])

      await tx.seat.deleteMany({ where: { vanId: tripId } })

      await tx.van.update({
        where: { id: tripId },
        data: {
          routeId: route.id,
          vanClassId: vanClass.id,
          vehicleId,
          departureTime: input.departureTime,
          arrivalTime,
          duration,
          price: input.price,
          seatsLeft: input.totalSeats,
          totalSeats: input.totalSeats,
          departureDate: input.departureDate,
          tripCategory: input.tripCategory,
          status: input.status,
          seats: {
            create: seatLabels.map((label) => ({
              label,
              premium: false,
            })),
          },
        },
      })

      return tx.van.findUniqueOrThrow({
        where: { id: tripId },
        include: vanInclude,
      })
    })

    return toDriverTrip(van)
  },

  async startDriverTrip(
    tripId: string,
    driverId: string,
  ): Promise<{ trip: DriverTrip; notifiedCount: number } | null> {
    const existing = await prisma.van.findFirst({
      where: { id: tripId, driverId, status: 'published' },
      include: {
        route: true,
        bookings: {
          where: { status: { in: ['pending', 'confirmed'] } },
          select: {
            id: true,
            userId: true,
            seatId: true,
            reference: true,
            status: true,
            snapshot: {
              select: {
                routeLabel: true,
                departureDate: true,
                departureTime: true,
              },
            },
          },
        },
        deliveries: {
          where: { status: 'pending' },
          select: {
            id: true,
            userId: true,
            reference: true,
            snapshot: {
              select: {
                routeLabel: true,
              },
            },
          },
        },
      },
    })

    if (!existing) return null

    const routeLabel =
      existing.bookings[0]?.snapshot?.routeLabel ??
      existing.deliveries[0]?.snapshot?.routeLabel ??
      `${existing.route.departureLocation} → ${existing.route.arrivalLocation}`
    const tripDate =
      existing.bookings[0]?.snapshot?.departureDate ?? existing.departureDate
    const tripTime =
      existing.bookings[0]?.snapshot?.departureTime ?? existing.departureTime
    const whenLabel = [tripDate, tripTime].filter(Boolean).join(' at ')

    const result = await prisma.$transaction(async (tx) => {
      const pendingBookings = existing.bookings.filter(
        (booking) => booking.status === 'pending',
      )
      const confirmedBookings = existing.bookings.filter(
        (booking) => booking.status === 'confirmed',
      )

      const pendingSeatIds = pendingBookings
        .map((booking) => booking.seatId)
        .filter((seatId): seatId is string => Boolean(seatId))

      if (pendingSeatIds.length > 0) {
        await tx.seat.updateMany({
          where: { id: { in: pendingSeatIds } },
          data: { status: 'available' },
        })
      }

      if (pendingBookings.length > 0) {
        await tx.booking.updateMany({
          where: { vanId: tripId, status: 'pending' },
          data: { status: 'cancelled' },
        })
        await tx.van.update({
          where: { id: tripId },
          data: { seatsLeft: { increment: pendingBookings.length } },
        })
        for (const booking of pendingBookings) {
          await reverseBookingSettlement(tx, {
            driverId,
            bookingId: booking.id,
            actorProfileId: driverId,
            reason: 'System fee reversed (trip started)',
          })
        }
      }

      if (existing.deliveries.length > 0) {
        await tx.delivery.updateMany({
          where: { vanId: tripId, status: 'pending' },
          data: { status: 'cancelled' },
        })
      }

      await tx.van.update({
        where: { id: tripId },
        data: { status: 'in_progress' },
      })

      const notificationRows: Prisma.NotificationCreateManyInput[] = []

      for (const booking of confirmedBookings) {
        if (!booking.userId) continue
        const reference = booking.reference ? ` (${booking.reference})` : ''
        notificationRows.push({
          userId: booking.userId,
          type: 'trip_started',
          title: 'Trip started',
          body: `Your trip${reference} on ${routeLabel}${whenLabel ? ` (${whenLabel})` : ''} has started. The driver is on the way.`,
          data: {
            tripId,
            bookingId: booking.id,
            kind: 'booking',
          },
        })
      }

      for (const booking of pendingBookings) {
        if (!booking.userId) continue
        const reference = booking.reference ? ` (${booking.reference})` : ''
        notificationRows.push({
          userId: booking.userId,
          type: 'booking_cancelled',
          title: 'Seat request cancelled',
          body: `Your pending seat request${reference} for ${routeLabel} was cancelled because the trip has started.`,
          data: {
            tripId,
            bookingId: booking.id,
            kind: 'booking',
          },
        })
      }

      for (const delivery of existing.deliveries) {
        if (!delivery.userId) continue
        const reference = delivery.reference ? ` (${delivery.reference})` : ''
        notificationRows.push({
          userId: delivery.userId,
          type: 'booking_cancelled',
          title: 'Package request cancelled',
          body: `Your pending package request${reference} for ${routeLabel} was cancelled because the trip has started.`,
          data: {
            tripId,
            deliveryId: delivery.id,
            kind: 'delivery',
          },
        })
      }

      if (notificationRows.length > 0) {
        await tx.notification.createMany({ data: notificationRows })
      }

      const van = await tx.van.findUniqueOrThrow({
        where: { id: tripId },
        include: vanInclude,
      })

      return {
        trip: toDriverTrip(van),
        notifiedCount: notificationRows.length,
      }
    })

    return result
  },

  async markPassengerDestinationReached(
    tripId: string,
    bookingId: string,
    driverId: string,
  ): Promise<{
    passenger: DriverTripPassenger
    tripEnded: boolean
    trip: DriverTrip | null
  }> {
    return prisma.$transaction(async (tx) => {
      const van = await tx.van.findFirst({
        where: { id: tripId, driverId, status: 'in_progress' },
        include: {
          route: true,
        },
      })

      if (!van) {
        throw new AppError('Trip not found or has not been started', 404)
      }

      const booking = await tx.booking.findFirst({
        where: {
          id: bookingId,
          vanId: tripId,
          status: 'confirmed',
          destinationReachedAt: null,
        },
        include: {
          snapshot: true,
          user: {
            select: { fullName: true, email: true, phone: true },
          },
        },
      })

      if (!booking) {
        throw new AppError(
          'Confirmed passenger not found or already marked as reached',
          404,
        )
      }

      const reachedAt = new Date()

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { destinationReachedAt: reachedAt },
        include: {
          snapshot: true,
          user: {
            select: { fullName: true, email: true, phone: true },
          },
        },
      })

      const remaining = await tx.booking.count({
        where: {
          vanId: tripId,
          status: 'confirmed',
          destinationReachedAt: null,
        },
      })

      let tripEnded = false
      let completedTrip: DriverTrip | null = null

      if (remaining === 0) {
        completedTrip = await finalizeDriverTrip(
          tripId,
          driverId,
          {
            routeLabel:
              booking.snapshot?.routeLabel ??
              `${van.route.departureLocation} → ${van.route.arrivalLocation}`,
            departureDate:
              booking.snapshot?.departureDate ?? van.departureDate,
            departureTime:
              booking.snapshot?.departureTime ?? van.departureTime,
            notifyPassengers: true,
          },
          tx,
        )
        tripEnded = Boolean(completedTrip)
      }

      return {
        passenger: {
          id: updated.id,
          reference: updated.reference,
          seat: updated.snapshot?.seatLabel ?? null,
          name:
            updated.user?.fullName?.trim() || updated.user?.email || 'Guest',
          email: updated.user?.email ?? null,
          phone: updated.user?.phone ?? null,
          price: updated.snapshot?.priceDisplay ?? null,
          pickupAddress: updated.pickupAddress ?? null,
          dropoffAddress: updated.dropoffAddress ?? null,
          status: 'confirmed',
          destinationReachedAt: updated.destinationReachedAt,
          bookedAt: updated.createdAt,
        },
        tripEnded,
        trip: completedTrip,
      }
    })
  },

  async completeDriverTrip(
    tripId: string,
    driverId: string,
  ): Promise<DriverTrip | null> {
    const existing = await prisma.van.findFirst({
      where: {
        id: tripId,
        driverId,
        status: { in: ['published', 'in_progress'] },
      },
      include: {
        route: true,
        bookings: {
          where: { status: 'confirmed' },
          select: {
            snapshot: {
              select: {
                routeLabel: true,
                departureDate: true,
                departureTime: true,
              },
            },
          },
          take: 1,
        },
      },
    })

    if (!existing) return null

    return finalizeDriverTrip(tripId, driverId, {
      routeLabel:
        existing.bookings[0]?.snapshot?.routeLabel ??
        `${existing.route.departureLocation} → ${existing.route.arrivalLocation}`,
      departureDate:
        existing.bookings[0]?.snapshot?.departureDate ?? existing.departureDate,
      departureTime:
        existing.bookings[0]?.snapshot?.departureTime ?? existing.departureTime,
      notifyPassengers: existing.status === 'in_progress',
    })
  },

  async cancelDriverTrip(
    tripId: string,
    driverId: string,
  ): Promise<{ trip: DriverTrip; notifiedCount: number } | null> {
    const existing = await prisma.van.findFirst({
      where: {
        id: tripId,
        driverId,
        status: { in: ['draft', 'published'] },
      },
      include: {
        route: true,
        bookings: {
          where: { status: { in: ['pending', 'confirmed'] } },
          select: {
            id: true,
            userId: true,
            seatId: true,
            reference: true,
            status: true,
            snapshot: {
              select: {
                routeLabel: true,
                departureDate: true,
                departureTime: true,
              },
            },
          },
        },
        deliveries: {
          where: {
            status: {
              in: ['pending', 'accepted', 'confirmed', 'picked_up'],
            },
          },
          select: {
            id: true,
            userId: true,
            reference: true,
            snapshot: {
              select: {
                routeLabel: true,
                departureDate: true,
                departureTime: true,
              },
            },
          },
        },
      },
    })

    if (!existing) return null

    const routeLabel =
      existing.bookings[0]?.snapshot?.routeLabel ??
      existing.deliveries[0]?.snapshot?.routeLabel ??
      `${existing.route.departureLocation} → ${existing.route.arrivalLocation}`

    const tripDate =
      existing.bookings[0]?.snapshot?.departureDate ??
      existing.deliveries[0]?.snapshot?.departureDate ??
      existing.departureDate

    const tripTime =
      existing.bookings[0]?.snapshot?.departureTime ??
      existing.deliveries[0]?.snapshot?.departureTime ??
      existing.departureTime

    const whenLabel = [tripDate, tripTime].filter(Boolean).join(' at ')

    const result = await prisma.$transaction(async (tx) => {
      const seatIds = existing.bookings
        .map((booking) => booking.seatId)
        .filter((seatId): seatId is string => Boolean(seatId))

      if (seatIds.length > 0) {
        await tx.seat.updateMany({
          where: { id: { in: seatIds } },
          data: { status: 'available' },
        })
      }

      await tx.booking.updateMany({
        where: { vanId: tripId, status: { in: ['pending', 'confirmed'] } },
        data: { status: 'cancelled' },
      })

      for (const booking of existing.bookings) {
        await reverseBookingSettlement(tx, {
          driverId,
          bookingId: booking.id,
          actorProfileId: driverId,
          reason: 'System fee reversed (trip cancelled)',
        })
      }

      await tx.delivery.updateMany({
        where: {
          vanId: tripId,
          status: {
            in: ['pending', 'accepted', 'confirmed', 'picked_up'],
          },
        },
        data: { status: 'cancelled' },
      })

      await tx.van.update({
        where: { id: tripId },
        data: {
          status: 'cancelled',
          seatsLeft: existing.totalSeats ?? existing.seatsLeft + seatIds.length,
        },
      })

      const notificationRows: Prisma.NotificationCreateManyInput[] = []

      for (const booking of existing.bookings) {
        if (!booking.userId) continue
        const reference = booking.reference ? ` (${booking.reference})` : ''
        notificationRows.push({
          userId: booking.userId,
          type: 'trip_cancelled',
          title: 'Trip cancelled',
          body: `Your booking${reference} for ${routeLabel}${whenLabel ? ` on ${whenLabel}` : ''} was cancelled by the driver.`,
          data: {
            tripId,
            bookingId: booking.id,
            kind: 'booking',
          },
        })
      }

      for (const delivery of existing.deliveries) {
        if (!delivery.userId) continue
        const reference = delivery.reference ? ` (${delivery.reference})` : ''
        notificationRows.push({
          userId: delivery.userId,
          type: 'trip_cancelled',
          title: 'Delivery trip cancelled',
          body: `Your package delivery${reference} for ${routeLabel}${whenLabel ? ` on ${whenLabel}` : ''} was cancelled because the driver cancelled the trip.`,
          data: {
            tripId,
            deliveryId: delivery.id,
            kind: 'delivery',
          },
        })
      }

      if (notificationRows.length > 0) {
        await tx.notification.createMany({ data: notificationRows })
      }

      const van = await tx.van.findUniqueOrThrow({
        where: { id: tripId },
        include: vanInclude,
      })

      return {
        trip: toDriverTrip(van),
        notifiedCount: notificationRows.length,
      }
    })

    return result
  },
}
