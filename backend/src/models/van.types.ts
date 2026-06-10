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
