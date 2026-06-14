import { api } from '@/lib/axios'
import type { CreatedBooking, HistoryBooking, UpcomingBooking } from '@/lib/types/api'

export type CreateBookingInput = {
  vanId: string
  seat: string
  pickupAddress: string
  dropoffAddress: string
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

export const upcomingBookingQueryKey = ['bookings', 'upcoming'] as const
export const bookingHistoryQueryKey = ['bookings', 'history'] as const
