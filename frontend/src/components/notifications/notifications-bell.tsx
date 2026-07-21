import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  markAllNotificationsRead,
  markNotificationRead,
  notificationsQueryKey,
  notificationsQueryOptions,
  type AppNotification,
} from '@/lib/api/notifications'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

function formatNotificationTime(iso: string) {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function notificationHref(
  notification: AppNotification,
  isDriver: boolean,
) {
  if (isDriver) return '/driver' as const
  const data = notification.data
  if (data && typeof data === 'object' && data.kind === 'delivery') {
    return '/my-deliveries' as const
  }
  return '/my-bookings' as const
}

export function NotificationsBell({
  className,
}: {
  className?: string
}) {
  const { isDriver } = useAuth()
  const queryClient = useQueryClient()
  const notificationsQuery = useQuery(notificationsQueryOptions())
  const notifications = notificationsQuery.data?.notifications ?? []
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    },
  })

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    },
  })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : 'Notifications'
          }
          className={cn(
            'relative inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[#1d1d1f]/80 transition-colors hover:bg-black/5 hover:text-[#0066cc]',
            className,
          )}
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 size-2 rounded-full bg-[#bf4800]" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        alignOffset={-40}
        sideOffset={8}
        collisionPadding={16}
        className="w-80 max-w-[calc(100vw-2rem)] gap-0 p-0"
      >
        <div className="flex items-center justify-between border-b border-black/5 px-3 py-2.5">
          <p className="text-[14px] font-semibold text-[#1d1d1f]">
            Notifications
          </p>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[12px] text-[#0066cc]"
              disabled={markAllMutation.isPending}
              onClick={() => markAllMutation.mutate()}
            >
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notificationsQuery.isLoading ? (
            <p className="px-3 py-6 text-center text-[13px] text-[#86868b]">
              Loading…
            </p>
          ) : notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-[13px] text-[#86868b]">
              No notifications yet.
            </p>
          ) : (
            notifications.map((notification) => {
              const unread = !notification.readAt
              return (
                <Link
                  key={notification.id}
                  to={notificationHref(notification, isDriver)}
                  className={cn(
                    'block border-b border-black/5 px-3 py-3 transition-colors last:border-b-0 hover:bg-[#f5f5f7]',
                    unread && 'bg-[#fff8f2]',
                  )}
                  onClick={() => {
                    if (unread) {
                      markReadMutation.mutate(notification.id)
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-medium text-[#1d1d1f]">
                      {notification.title}
                    </p>
                    {unread && (
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#bf4800]" />
                    )}
                  </div>
                  <p className="mt-1 text-[12px] leading-snug text-[#86868b]">
                    {notification.body}
                  </p>
                  <p className="mt-1.5 text-[11px] text-[#86868b]">
                    {formatNotificationTime(notification.createdAt)}
                  </p>
                </Link>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
