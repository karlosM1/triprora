export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'declined'

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
  status: 'pending' | 'confirmed'
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
  status: 'completed' | 'cancelled' | 'declined'
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
  status: 'pending'
}

export type PaymentMethod = 'cash'

export type CreateBookingInput = {
  userId: string
  vanId: string
  seat: string
  pickupAddress: string
  dropoffAddress: string
  paymentMethod: PaymentMethod
}

export type DriverBookingPassenger = {
  id: string
  reference: string | null
  seat: string | null
  name: string
  email: string | null
  phone: string | null
  price: string | null
  pickupAddress: string | null
  dropoffAddress: string | null
  status: 'pending' | 'confirmed' | 'declined'
  destinationReachedAt: Date | null
  bookedAt: Date
}
