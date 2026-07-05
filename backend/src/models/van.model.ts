import type { Van, VanClassType, VanClassVariant } from './van.types.js'
import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import {
  ensureOperator,
  ensureRoute,
  ensureVanClass,
} from '../lib/reference-data.js'
import { presentVan, vanInclude, type VanWithRelations } from '../lib/van-presenter.js'
import { AppError } from '../utils/app-error.js'
import {
  generateSeatLabels,
  resolveTargetSeatCount,
  syncVanSeatLayout,
} from '../lib/seat-layout.js'

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
  status: 'draft' | 'published' | 'completed' | 'cancelled'
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
  bookedAt: Date
}

export type DriverTripDetails = {
  trip: DriverTrip
  seats: DriverTripSeat[]
  passengers: DriverTripPassenger[]
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
  const totalMinutes = hourPart * 60 + minutePart + hours * 60
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

function createTripId() {
  return `TRP-${Date.now().toString(36).toUpperCase()}`
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

  if (!vehicle) {
    throw new AppError('No registered vehicle found for this driver', 400)
  }

  return vehicle.id
}

export const VanModel = {
  async findAll(): Promise<Van[]> {
    const vans = await prisma.van.findMany({
      where: { status: 'published' },
      include: vanInclude,
      orderBy: [{ departureDate: 'asc' }, { departureTime: 'asc' }],
    })
    return vans.map((van) => presentVan(van))
  },

  async findByDriverId(driverId: string): Promise<DriverTrip[]> {
    const vans = await prisma.van.findMany({
      where: { driverId },
      include: vanInclude,
      orderBy: [{ departureDate: 'desc' }, { departureTime: 'desc' }],
    })
    return vans.map(toDriverTrip)
  },

  async findDriverTripDetails(
    tripId: string,
    driverId: string,
  ): Promise<DriverTripDetails | null> {
    const existingVan = await prisma.van.findFirst({
      where: { id: tripId, driverId },
      include: { seats: { orderBy: { label: 'asc' } } },
    })

    if (!existingVan) return null

    const targetSeatCount = resolveTargetSeatCount(
      existingVan.totalSeats,
      existingVan.seats.map((seat) => seat.label),
    )

    await prisma.$transaction((tx) => syncVanSeatLayout(tx, tripId, targetSeatCount))

    const van = await prisma.van.findFirst({
      where: { id: tripId, driverId },
      include: {
        ...vanInclude,
        seats: { orderBy: { label: 'asc' } },
        bookings: {
          where: { status: 'confirmed' },
          orderBy: { createdAt: 'asc' },
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
      },
    })

    if (!van) return null

    const { seats, bookings, ...tripFields } = van
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
      bookedAt: booking.createdAt,
    }))

    return {
      trip,
      seats: mappedSeats,
      passengers,
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
      include: { seats: { orderBy: { label: 'asc' } } },
    })

    if (!van || van.status !== 'published') return null

    const existingLabels = van.seats.map((seat) => seat.label)
    const targetSeatCount = resolveTargetSeatCount(van.totalSeats, existingLabels)
    const expectedLabels = await prisma.$transaction((tx) =>
      syncVanSeatLayout(tx, vanId, targetSeatCount),
    )

    const expectedSet = new Set(expectedLabels)
    const seats = await prisma.seat.findMany({
      where: { vanId, label: { in: [...expectedSet] } },
      orderBy: { label: 'asc' },
    })

    return seats.map((seat) => ({
      id: seat.label,
      label: seat.label,
      status: seat.status,
      premium: seat.premium || undefined,
    }))
  },

  async createDriverTrip(input: CreateDriverTripInput): Promise<DriverTrip> {
    const config = categoryConfig[input.tripCategory]
    const arrivalTime = addHoursToTime(input.departureTime, config.durationHours)
    const duration = formatDuration(config.durationHours)
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
    const arrivalTime = addHoursToTime(input.departureTime, config.durationHours)
    const duration = formatDuration(config.durationHours)
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

  async completeDriverTrip(
    tripId: string,
    driverId: string,
  ): Promise<DriverTrip | null> {
    const existing = await prisma.van.findFirst({
      where: { id: tripId, driverId, status: 'published' },
      select: { id: true },
    })

    if (!existing) return null

    const van = await prisma.$transaction(async (tx) => {
      await tx.booking.updateMany({
        where: { vanId: tripId, status: 'confirmed' },
        data: { status: 'completed' },
      })

      await tx.van.update({
        where: { id: tripId },
        data: { status: 'completed' },
      })

      return tx.van.findUniqueOrThrow({
        where: { id: tripId },
        include: vanInclude,
      })
    })

    return toDriverTrip(van)
  },
}
