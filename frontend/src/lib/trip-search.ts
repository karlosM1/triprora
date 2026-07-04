import { locationMatchesPlace } from '@/lib/places'
import type { ApiVan } from '@/lib/types/api'

export const TRIP_TYPE = 'One Way Trip' as const
export type TripType = typeof TRIP_TYPE

export type TripSearchParams = {
  from: string
  to: string
  departureDate?: string
  passengers: number
  tripType: TripType
}

export type TripSearchInput = Partial<TripSearchParams>

export const DEFAULT_TRIP_SEARCH: TripSearchParams = {
  from: 'Aurora',
  to: 'Metro Manila',
  passengers: 1,
  tripType: TRIP_TYPE,
}

export function validateTripSearch(
  search: Record<string, unknown>,
): TripSearchInput {
  const passengers = Number(search.passengers)
  const normalizedPassengers =
    Number.isFinite(passengers) && passengers >= 1 && passengers <= 14
      ? Math.floor(passengers)
      : undefined

  return {
    from:
      typeof search.from === 'string' && search.from.trim()
        ? search.from.trim()
        : undefined,
    to:
      typeof search.to === 'string' && search.to.trim()
        ? search.to.trim()
        : undefined,
    departureDate:
      typeof search.departureDate === 'string' && search.departureDate
        ? search.departureDate
        : undefined,
    passengers: normalizedPassengers,
    tripType: TRIP_TYPE,
  }
}

export function resolveTripSearch(search: TripSearchInput): TripSearchParams {
  const definedSearch = Object.fromEntries(
    Object.entries(search).filter(([, value]) => value !== undefined),
  ) as TripSearchInput

  return {
    ...DEFAULT_TRIP_SEARCH,
    ...definedSearch,
  }
}

export function filterVansByTripSearch<T extends Pick<
  ApiVan,
  'departureLocation' | 'arrivalLocation' | 'departureDate' | 'seatsLeft'
>>(
  vans: T[],
  search: TripSearchParams,
): T[] {
  return vans.filter((van) => {
    if (!locationMatchesPlace(van.departureLocation, search.from)) return false
    if (!locationMatchesPlace(van.arrivalLocation, search.to)) return false
    if (search.departureDate && van.departureDate !== search.departureDate) {
      return false
    }
    if (van.seatsLeft < search.passengers) return false
    return true
  })
}

export function formatTripSearchDate(date?: string) {
  if (!date) return null
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function parseTripSearchDate(date?: string) {
  if (!date) return undefined
  const parsed = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const todayDateInputValue = () => toDateInputValue(new Date())
