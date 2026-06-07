export type VanClassType = 'EXECUTIVE CLASS' | 'STANDARD CLASS'
export type VanClassVariant = 'executive' | 'standard'
export type AmenityKey =
  | 'wifi'
  | 'usb'
  | 'reclining'
  | 'ac'
  | 'luggage'
  | 'legroom'
  | 'entertainment'
  | 'snacks'
  | 'monitor'

export type Van = {
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
  totalSeats?: number
}

export type SeatStatus = 'available' | 'occupied' | 'selected'

export type Seat = {
  id: string
  label: string
  status: SeatStatus
  premium?: boolean
}

const vans: Van[] = [
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
]

const defaultSeats: Seat[] = [
  { id: '1A', label: '1A', status: 'selected', premium: true },
  { id: '2A', label: '2A', status: 'available' },
  { id: '2B', label: '2B', status: 'available' },
  { id: '3A', label: '3A', status: 'available' },
  { id: '3B', label: '3B', status: 'occupied' },
  { id: '3C', label: '3C', status: 'available' },
]

export const VanModel = {
  findAll(): Van[] {
    return vans
  },

  findById(vanId: string): Van | undefined {
    return vans.find((van) => van.id === vanId)
  },

  findSeatsByVanId(vanId: string): Seat[] | undefined {
    const van = vans.find((entry) => entry.id === vanId)
    if (!van) return undefined
    return defaultSeats
  },
}
