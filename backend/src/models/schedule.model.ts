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
  id: 'express-1',
  label: 'Express Network',
  title: 'Central Hub — Port Maritime',
  availability: '24/7 Availability',
  departures: 'Departures every 15 minutes',
  duration: 'Approx. 45 min duration',
}

const businessRoute: BusinessRoute = {
  id: 'business-1',
  label: 'Business Class',
  title: 'North Terminal — Tech District',
  description: 'Direct executive shuttles with onboard Wi-Fi.',
  frequency: 'Frequency: Every 30 mins',
}

const compactRoutes: RouteCard[] = [
  {
    id: 'airport',
    icon: 'bus',
    name: 'Airport Link',
    location: 'Terminal 1 – 4',
    frequency: 'Hourly',
    duration: '20 min trip',
  },
  {
    id: 'suburban',
    icon: 'mountains',
    name: 'Suburban Loop',
    location: 'Metro Ring',
    frequency: 'Every 2 hrs',
    duration: '55 min trip',
  },
  {
    id: 'financial',
    icon: 'building',
    name: 'Financial District',
    location: 'CBD Core',
    frequency: 'Every 20 mins',
    duration: '15 min trip',
  },
]

const networkStats = {
  activeTrips: '1,240+',
  avgWait: '02m',
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
