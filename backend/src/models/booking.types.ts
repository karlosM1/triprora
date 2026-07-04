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

export type CreateBookingInput = {
  userId: string
  vanId: string
  seat: string
  pickupAddress: string
  dropoffAddress: string
}
