import type { AmenityKey, Seat, SeatStatus, Van, VanClassType, VanClassVariant } from './van.types.js'
import { prisma } from '../lib/prisma.js'

export type { AmenityKey, Seat, SeatStatus, Van, VanClassType, VanClassVariant }

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
} as const

export const VanModel = {
  async findAll(): Promise<Van[]> {
    const vans = await prisma.van.findMany({
      select: vanSelect,
      orderBy: { departureTime: 'asc' },
    })
    return vans as Van[]
  },

  async findById(vanId: string): Promise<Van | null> {
    const van = await prisma.van.findUnique({
      where: { id: vanId },
      select: vanSelect,
    })
    return van as Van | null
  },

  async findSeatsByVanId(vanId: string): Promise<Seat[] | null> {
    const van = await prisma.van.findUnique({
      where: { id: vanId },
      include: { seats: { orderBy: { label: 'asc' } } },
    })

    if (!van) return null

    return van.seats.map((seat) => ({
      id: seat.label,
      label: seat.label,
      status: seat.status as SeatStatus,
      premium: seat.premium || undefined,
    }))
  },
}
