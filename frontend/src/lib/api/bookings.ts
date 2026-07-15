import { api } from '@/lib/axios'
import type {
  CreatedBooking,
  HistoryBooking,
  UpcomingBooking,
  UpdateBookingInput,
} from '@/lib/types/api'
import { DEFAULT_STALE_TIME } from '@/lib/query-client'

export type CreateBookingInput = {
  vanId: string
  seat: string
  pickupAddress: string
  dropoffAddress: string
  paymentMethod: 'qrph' | 'cash'
  paymentIntentId?: string
}

export async function createBooking(input: CreateBookingInput) {
  const { data } = await api.post<CreatedBooking>('/bookings', input)
  return data
}

export async function fetchUpcomingBooking() {
  const { data } = await api.get<UpcomingBooking | null>('/bookings/upcoming')
  return data
}

export async function fetchBookingHistory() {
  const { data } = await api.get<HistoryBooking[]>('/bookings/history')
  return data
}

export async function updateBooking(
  bookingId: string,
  input: UpdateBookingInput,
) {
  const { data } = await api.patch<UpcomingBooking>(
    `/bookings/${encodeURIComponent(bookingId)}`,
    input,
  )
  return data
}

export async function cancelBooking(bookingId: string) {
  const { data } = await api.post<HistoryBooking>(
    `/bookings/${encodeURIComponent(bookingId)}/cancel`,
  )
  return data
}

export const upcomingBookingQueryKey = ['bookings', 'upcoming'] as const
export const bookingHistoryQueryKey = ['bookings', 'history'] as const

export function upcomingBookingQueryOptions() {
  return {
    queryKey: upcomingBookingQueryKey,
    queryFn: fetchUpcomingBooking,
    staleTime: DEFAULT_STALE_TIME,
  }
}

export function bookingHistoryQueryOptions() {
  return {
    queryKey: bookingHistoryQueryKey,
    queryFn: fetchBookingHistory,
    staleTime: DEFAULT_STALE_TIME,
  }
}
