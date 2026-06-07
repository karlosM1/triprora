export type BookingStatus = 'confirmed' | 'completed' | 'cancelled'

export type UpcomingBooking = {
  id: string
  routeCode: string
  image: string
  date: string
  time: string
  seat: string
  gate: string
  route: string
  vehicle: string
  status: 'confirmed'
}

export type HistoryBooking = {
  id: string
  reference: string
  date: string
  route: string
  tripType: string
  status: 'completed' | 'cancelled'
  price: string
}

export type RouteCard = {
  id: string
  icon: 'bus' | 'mountains' | 'building'
  name: string
  location: string
  frequency: string
  duration: string
}

export type FeaturedRoute = {
  id: string
  label: string
  title: string
  availability: string
  departures: string
  duration: string
}

export type BusinessRoute = {
  id: string
  label: string
  title: string
  description: string
  frequency: string
}

export type SchedulesResponse = {
  featuredRoute: FeaturedRoute
  businessRoute: BusinessRoute
  compactRoutes: RouteCard[]
  networkStats: {
    activeTrips: string
    avgWait: string
  }
}

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

export type ApiVan = {
  id: string
  classType: 'EXECUTIVE CLASS' | 'STANDARD CLASS'
  classVariant: 'executive' | 'standard'
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
