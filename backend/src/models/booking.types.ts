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

export type CreatedBooking = {
  id: string
  reference: string
  route: string
  date: string
  time: string
  seat: string
  gate: string
  vehicle: string
  operator: string
  price: string
  isPremium: boolean
}

export type CreateBookingInput = {
  userId: string
  vanId: string
  seat: string
}
