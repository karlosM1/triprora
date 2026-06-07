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

const upcomingBooking: UpcomingBooking = {
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
  status: 'confirmed',
}

const bookingHistory: HistoryBooking[] = [
  {
    id: '1',
    reference: 'VR-9082',
    date: 'Oct 28, 2024',
    route: 'Silicon Valley Corporate Hub',
    tripType: 'Round Trip',
    status: 'completed',
    price: '$45.00',
  },
  {
    id: '2',
    reference: 'VR-8711',
    date: 'Oct 15, 2024',
    route: 'Oakland Tech Corridor',
    tripType: 'One Way',
    status: 'completed',
    price: '$28.50',
  },
  {
    id: '3',
    reference: 'VR-7622',
    date: 'Sep 30, 2024',
    route: 'San Francisco Airport',
    tripType: 'One Way',
    status: 'cancelled',
    price: '$0.00',
  },
]

export const BookingModel = {
  getUpcoming(): UpcomingBooking {
    return upcomingBooking
  },

  getHistory(): HistoryBooking[] {
    return bookingHistory
  },
}
