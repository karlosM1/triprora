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
  title: 'Casiguran, Aurora to Metro Manila',
  availability: 'Daily Departures',
  departures: 'Morning & evening trips available',
  duration: 'Approx. 6–8 hours',
}

const businessRoute: BusinessRoute = {
  id: 'casiguran-baler',
  label: 'Aurora Route',
  title: 'Casiguran to Baler',
  description:
    'Door-to-door vans linking northern Aurora with the provincial capital.',
  frequency: 'Frequency: Daily departures',
}

const compactRoutes: RouteCard[] = [
  {
    id: 'baler-casiguran',
    icon: 'bus',
    name: 'Baler to Casiguran',
    location: 'Aurora Province',
    frequency: 'Daily',
    duration: '2h 30m trip',
  },
  {
    id: 'baler-dingalan',
    icon: 'mountains',
    name: 'Baler to Dingalan',
    location: 'Southern Aurora coast',
    frequency: 'Daily',
    duration: '2h trip',
  },
  {
    id: 'manila-casiguran',
    icon: 'building',
    name: 'Metro Manila to Casiguran',
    location: 'Return trips to Aurora',
    frequency: 'Daily',
    duration: '6–8h trip',
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
