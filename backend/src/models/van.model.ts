import type { AmenityKey, Van, VanClassType, VanClassVariant, VanDriver } from './van.types.js'
import { prisma } from '../lib/prisma.js'

export type { AmenityKey, Van, VanClassType, VanClassVariant }

const vanSelect = {
  id: true,
  classType: true,
  classVariant: true,
  departureTime: true,
  departureLocation: true,
  arrivalTime: true,
  arrivalLocation: true,
  duration: true,
  operator: true,
  amenityKeys: true,
  price: true,
  seatsLeft: true,
  totalSeats: true,
  departureDate: true,
  tripCategory: true,
  vehicleName: true,
  plateNumber: true,
  status: true,
  driverId: true,
  createdAt: true,
  driver: {
    select: {
      fullName: true,
      phone: true,
      driverApplication: {
        select: {
          licenseNo: true,
          vehicleInfo: true,
        },
      },
    },
  },
} as const

function mapDriverInfo(
  driver: {
    fullName: string | null
    phone: string | null
    driverApplication: { licenseNo: string; vehicleInfo: string | null } | null
  } | null,
): VanDriver | null {
  if (!driver) return null
  return {
    name: driver.fullName?.trim() || 'Driver',
    phone: driver.phone,
    licenseNo: driver.driverApplication?.licenseNo ?? null,
    vehicleInfo: driver.driverApplication?.vehicleInfo ?? null,
  }
}

function mapVanRecord(
  van: {
    driver?: Parameters<typeof mapDriverInfo>[0]
    [key: string]: unknown
  },
): Van {
  const { driver, ...fields } = van
  return {
    ...(fields as Omit<Van, 'driver'>),
    driver: mapDriverInfo(driver ?? null),
  }
}

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
  amenityKeys: AmenityKey[]
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
    amenityKeys: ['wifi', 'ac'] as AmenityKey[],
    durationHours: 6,
  },
  business: {
    classType: 'EXECUTIVE CLASS' as const,
    classVariant: 'executive' as const,
    amenityKeys: ['wifi', 'ac', 'reclining'] as AmenityKey[],
    durationHours: 7,
  },
  standard: {
    classType: 'STANDARD CLASS' as const,
    classVariant: 'standard' as const,
    amenityKeys: ['ac', 'legroom'] as AmenityKey[],
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

function generateSeatLabels(totalSeats: number) {
  const labels: string[] = []
  let row = 1

  while (labels.length < totalSeats) {
    for (const column of ['A', 'B', 'C']) {
      if (labels.length >= totalSeats) break
      labels.push(`${row}${column}`)
    }
    row += 1
  }

  return labels
}

function createTripId() {
  return `TRP-${Date.now().toString(36).toUpperCase()}`
}

export const VanModel = {
  async findAll(): Promise<Van[]> {
    const vans = await prisma.van.findMany({
      where: { status: 'published' },
      select: vanSelect,
      orderBy: [{ departureDate: 'asc' }, { departureTime: 'asc' }],
    })
    return vans.map(mapVanRecord)
  },

  async findByDriverId(driverId: string): Promise<DriverTrip[]> {
    const vans = await prisma.van.findMany({
      where: { driverId },
      select: vanSelect,
      orderBy: [{ departureDate: 'desc' }, { departureTime: 'desc' }],
    })
    return vans.map((van) => {
      const mapped = mapVanRecord(van)
      const { driver: _driver, ...trip } = mapped
      return trip as DriverTrip
    })
  },

  async findDriverTripDetails(
    tripId: string,
    driverId: string,
  ): Promise<DriverTripDetails | null> {
    const van = await prisma.van.findFirst({
      where: { id: tripId, driverId },
      include: {
        seats: { orderBy: { label: 'asc' } },
        bookings: {
          where: { status: 'confirmed' },
          orderBy: { createdAt: 'asc' },
          include: {
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
    const trip = tripFields as DriverTrip

    const mappedSeats: DriverTripSeat[] = seats.map((seat) => ({
      label: seat.label,
      status: seat.status === 'available' ? 'available' : 'occupied',
      premium: seat.premium,
    }))

    const passengers: DriverTripPassenger[] = bookings.map((booking) => ({
      id: booking.id,
      reference: booking.reference,
      seat: booking.seat,
      name: booking.user?.fullName?.trim() || booking.user?.email || 'Guest',
      email: booking.user?.email ?? null,
      phone: booking.user?.phone ?? null,
      price: booking.price,
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
      select: vanSelect,
    })
    return van ? mapVanRecord(van) : null
  },

  async findSeatsByVanId(vanId: string) {
    const van = await prisma.van.findUnique({
      where: { id: vanId },
      include: { seats: { orderBy: { label: 'asc' } } },
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
    const arrivalTime = addHoursToTime(input.departureTime, config.durationHours)
    const duration = formatDuration(config.durationHours)
    const operator = input.driverName?.trim() || 'Crabi Partner'
    const seatLabels = generateSeatLabels(input.totalSeats)

    const van = await prisma.van.create({
      data: {
        id: createTripId(),
        classType: config.classType,
        classVariant: config.classVariant,
        departureTime: input.departureTime,
        departureLocation: input.departureLocation,
        arrivalTime,
        arrivalLocation: input.arrivalLocation,
        duration,
        operator,
        amenityKeys: config.amenityKeys,
        price: input.price,
        seatsLeft: input.totalSeats,
        totalSeats: input.totalSeats,
        departureDate: input.departureDate,
        tripCategory: input.tripCategory,
        vehicleName: input.vehicleName,
        plateNumber: input.plateNumber?.trim() || null,
        status: input.status,
        driverId: input.driverId,
        seats: {
          create: seatLabels.map((label) => ({
            label,
            premium: false,
          })),
        },
      },
      select: vanSelect,
    })

    return van as DriverTrip
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
      await tx.seat.deleteMany({ where: { vanId: tripId } })

      return tx.van.update({
        where: { id: tripId },
        data: {
          classType: config.classType,
          classVariant: config.classVariant,
          departureTime: input.departureTime,
          departureLocation: input.departureLocation,
          arrivalTime,
          arrivalLocation: input.arrivalLocation,
          duration,
          amenityKeys: config.amenityKeys,
          price: input.price,
          seatsLeft: input.totalSeats,
          totalSeats: input.totalSeats,
          departureDate: input.departureDate,
          tripCategory: input.tripCategory,
          vehicleName: input.vehicleName,
          plateNumber: input.plateNumber?.trim() || null,
          status: input.status,
          seats: {
            create: seatLabels.map((label) => ({
              label,
              premium: false,
            })),
          },
        },
        select: vanSelect,
      })
    })

    return van as DriverTrip
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

      return tx.van.update({
        where: { id: tripId },
        data: { status: 'completed' },
        select: vanSelect,
      })
    })

    return van as DriverTrip
  },
}
