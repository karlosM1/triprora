import { api } from '@/lib/axios'
import type { HistoryBooking, UpcomingBooking } from '@/lib/types/api'

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
