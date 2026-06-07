import { api } from '@/lib/axios'
import type { SchedulesResponse } from '@/lib/types/api'

export async function fetchSchedules() {
  const { data } = await api.get<SchedulesResponse>('/schedules')
  return data
}

export const schedulesQueryKey = ['schedules'] as const
