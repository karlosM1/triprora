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

const featuredRoute: FeaturedRoute = {
  id: 'casiguran-manila',
  label: 'Main Route',
  title: 'Casiguran, Aurora — Metro Manila',
  availability: 'Daily Departures',
  departures: 'Morning & evening trips available',
  duration: 'Approx. 6–8 hours',
}

const businessRoute: BusinessRoute = {
  id: 'express-casiguran',
  label: 'Express Service',
  title: 'Casiguran — Cubao / Makati',
  description: 'Direct door-to-door vans with air-conditioning and comfortable seating.',
  frequency: 'Frequency: Daily departures',
}

const compactRoutes: RouteCard[] = [
  {
    id: 'cubao',
    icon: 'bus',
    name: 'Casiguran — Cubao',
    location: 'Quezon City drop-offs',
    frequency: 'Daily',
    duration: '6h 30m trip',
  },
  {
    id: 'makati',
    icon: 'building',
    name: 'Casiguran — Makati',
    location: 'Makati & BGC area',
    frequency: 'Daily',
    duration: '7h trip',
  },
  {
    id: 'pasay',
    icon: 'mountains',
    name: 'Casiguran — Pasay',
    location: 'Pasay & NAIA area',
    frequency: 'Daily',
    duration: '7h 15m trip',
  },
]

const networkStats = {
  activeTrips: '12+',
  avgWait: '15m',
}

export const ScheduleModel = {
  getAll(): SchedulesResponse {
    return {
      featuredRoute,
      businessRoute,
      compactRoutes,
      networkStats,
    }
  },
}
