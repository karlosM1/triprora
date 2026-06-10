import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const vans = [
  {
    id: '1',
    classType: 'EXECUTIVE CLASS',
    classVariant: 'executive',
    departureTime: '05:30',
    departureLocation: 'Manila (PITX)',
    arrivalTime: '10:45',
    arrivalLocation: 'Baguio (Victory)',
    duration: '5h 15m',
    operator: 'Highland Express Elite',
    amenityKeys: ['wifi', 'usb', 'reclining', 'ac', 'luggage'],
    price: 1250,
    seatsLeft: 4,
  },
  {
    id: '2',
    classType: 'STANDARD CLASS',
    classVariant: 'standard',
    departureTime: '07:00',
    departureLocation: 'Cubao Terminal',
    arrivalTime: '12:30',
    arrivalLocation: 'Baguio Plaza',
    duration: '5h 30m',
    operator: 'Mountain Star Transport',
    amenityKeys: ['legroom', 'reclining', 'ac', 'entertainment'],
    price: 850,
    seatsLeft: 12,
  },
  {
    id: '3',
    classType: 'EXECUTIVE CLASS',
    classVariant: 'executive',
    departureTime: '08:45',
    departureLocation: 'Pasay (PITX)',
    arrivalTime: '14:00',
    arrivalLocation: 'Baguio Proper',
    duration: '5h 15m',
    operator: 'Cool Ride Van Lines',
    amenityKeys: ['wifi', 'snacks', 'reclining', 'ac', 'luggage'],
    price: 1400,
    seatsLeft: 7,
  },
] as const

const defaultSeats = [
  { label: '1A', status: 'selected' as const, premium: true },
  { label: '2A', status: 'available' as const },
  { label: '2B', status: 'available' as const },
  { label: '3A', status: 'available' as const },
  { label: '3B', status: 'occupied' as const },
  { label: '3C', status: 'available' as const },
]

const upcomingBooking = {
  id: '1',
  routeCode: 'SFX-NAPA',
  image:
    'https://images.unsplash.com/photo-1501594907352-04cda38fdcb0?w=800&q=80&auto=format&fit=crop',
  date: 'Nov 14',
  time: '08:30 AM',
  seat: '1A',
  gate: 'Main',
  route: 'San Francisco to Napa Valley',
  vehicle: 'Luxury Commuter Van • Institutional Fleet 402',
  status: 'confirmed' as const,
}

const bookingHistory = [
  {
    id: '2',
    reference: 'VR-9082',
    date: 'Oct 28, 2024',
    route: 'Silicon Valley Corporate Hub',
    tripType: 'Round Trip',
    status: 'completed' as const,
    price: '$45.00',
  },
  {
    id: '3',
    reference: 'VR-8711',
    date: 'Oct 15, 2024',
    route: 'Oakland Tech Corridor',
    tripType: 'One Way',
    status: 'completed' as const,
    price: '$28.50',
  },
  {
    id: '4',
    reference: 'VR-7622',
    date: 'Sep 30, 2024',
    route: 'San Francisco Airport',
    tripType: 'One Way',
    status: 'cancelled' as const,
    price: '$0.00',
  },
]

async function main() {
  await prisma.seat.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.van.deleteMany()

  for (const van of vans) {
    await prisma.van.create({
      data: {
        ...van,
        seats: {
          create: defaultSeats.map((seat) => ({
            label: seat.label,
            status: seat.status,
            premium: seat.premium ?? false,
          })),
        },
      },
    })
  }

  await prisma.booking.create({ data: upcomingBooking })

  for (const booking of bookingHistory) {
    await prisma.booking.create({ data: booking })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
