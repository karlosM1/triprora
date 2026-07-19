import { api } from '@/lib/axios'
import { DEFAULT_STALE_TIME } from '@/lib/query-client'

export type AppNotification = {
  id: string
  type: string
  title: string
  body: string
  data: Record<string, unknown> | null
  readAt: string | null
  createdAt: string
}

export type NotificationsResponse = {
  notifications: AppNotification[]
  unreadCount: number
}

export async function fetchNotifications() {
  const { data } = await api.get<NotificationsResponse>('/me/notifications')
  return data
}

export async function markNotificationRead(notificationId: string) {
  const { data } = await api.post<AppNotification>(
    `/me/notifications/${encodeURIComponent(notificationId)}/read`,
  )
  return data
}

export async function markAllNotificationsRead() {
  const { data } = await api.post<{ updated: number }>(
    '/me/notifications/read-all',
  )
  return data
}

export const notificationsQueryKey = ['me', 'notifications'] as const

export function notificationsQueryOptions() {
  return {
    queryKey: notificationsQueryKey,
    queryFn: fetchNotifications,
    staleTime: DEFAULT_STALE_TIME,
    refetchInterval: 60_000,
  }
}
