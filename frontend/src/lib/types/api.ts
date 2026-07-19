export type BookingStatus = 'confirmed' | 'completed' | 'cancelled'

export type UpcomingBooking = {
  id: string
  reference: string
  routeCode: string
  image: string
  date: string
  time: string
  seat: string
  pickupAddress: string
  dropoffAddress: string
  route: string
  vehicle: string
  price: string
  status: 'confirmed'
  canCancel: boolean
}

export type UpdateBookingInput = {
  seat?: string
  pickupAddress?: string
  dropoffAddress?: string
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

export type CreatedBooking = {
  id: string
  reference: string
  route: string
  date: string
  time: string
  seat: string
  pickupAddress: string
  dropoffAddress: string
  vehicle: string
  operator: string
  price: string
}

export type PackageType =
  | 'documents'
  | 'food'
  | 'clothes'
  | 'electronics'
  | 'others'

export type PackageWeightBand = 'up_to_1kg' | 'one_to_5kg' | 'five_to_10kg'

export type PackageSize = 'small' | 'medium' | 'large'

export type DeliveryStatus =
  | 'pending'
  | 'accepted'
  | 'confirmed'
  | 'picked_up'
  | 'delivered'
  | 'declined'
  | 'cancelled'

export type CreatedDelivery = {
  id: string
  reference: string
  route: string
  date: string
  time: string
  pickupAddress: string
  dropoffAddress: string
  packageType: PackageType
  weightBand: PackageWeightBand
  size: PackageSize
  description: string
  receiverName: string
  receiverPhone: string
  specialInstructions: string | null
  vehicle: string
  operator: string
  price: string
  status: DeliveryStatus
  canPay: boolean
  paymentMethod: 'cash' | null
  isPaid: boolean
}

export type DeliveryListItem = {
  id: string
  reference: string
  date: string
  time: string
  route: string
  packageLabel: string
  pickupAddress: string
  dropoffAddress: string
  receiverName: string
  receiverPhone: string
  description?: string
  price: string
  status: DeliveryStatus
  canCancel: boolean
  canPay: boolean
  paymentMethod: 'cash' | null
  isPaid: boolean
}

export type DeliveryDetail = DeliveryListItem & {
  packageType: PackageType
  weightBand: PackageWeightBand
  size: PackageSize
  description: string
  specialInstructions: string | null
  vehicle: string
  tripType: string | null
  vanId: string | null
  baseFare: number
  serviceFee: number
  total: number
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

export type VanDriver = {
  name: string
  phone: string | null
  licenseNo: string | null
  vehicleInfo: string | null
}

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
  price: number
  seatsLeft: number
  totalSeats?: number
  departureDate?: string
  tripCategory?: string | null
  vehicleName?: string | null
  plateNumber?: string | null
  driver?: VanDriver | null
}

export type SeatStatus = 'available' | 'occupied' | 'selected'

export type Seat = {
  id: string
  label: string
  status: SeatStatus
}
