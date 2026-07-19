import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/layout/page-header'
import { BookingHistoryTable } from '@/components/my-bookings/booking-history-table'
import { PlanTripCta } from '@/components/my-bookings/plan-trip-cta'
import { UpcomingTripCard } from '@/components/my-bookings/upcoming-trip-card'
import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { Button } from '@/components/ui/button'
import {
  bookingHistoryQueryKey,
  bookingHistoryQueryOptions,
  upcomingBookingQueryKey,
  upcomingBookingQueryOptions,
} from '@/lib/api/bookings'
import {
  markNotificationRead,
  notificationsQueryKey,
  notificationsQueryOptions,
} from '@/lib/api/notifications'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { queryClient } from '@/lib/query-client'
import { requirePassenger } from '@/lib/route-guards'

export const Route = createFileRoute('/my-bookings')({
  beforeLoad: async () => {
    await requirePassenger('/my-bookings')
  },
  loader: () => {
    void queryClient.prefetchQuery(upcomingBookingQueryOptions())
    void queryClient.prefetchQuery(bookingHistoryQueryOptions())
    void queryClient.prefetchQuery(notificationsQueryOptions())
  },
  component: MyBookingsPage,
})

function MyBookingsPage() {
  const queryClientInstance = useQueryClient()
  const upcomingQuery = useQuery(upcomingBookingQueryOptions())
  const historyQuery = useQuery(bookingHistoryQueryOptions())
  const notificationsQuery = useQuery(notificationsQueryOptions())

  const tripCancelledAlerts = (notificationsQuery.data?.notifications ?? []).filter(
    (notification) =>
      notification.type === 'trip_cancelled' &&
      !notification.readAt &&
      (!notification.data || notification.data.kind !== 'delivery'),
  )

  const tripLifecycleAlerts = (notificationsQuery.data?.notifications ?? []).filter(
    (notification) =>
      (notification.type === 'trip_started' || notification.type === 'trip_ended') &&
      !notification.readAt &&
      (!notification.data || notification.data.kind !== 'delivery'),
  )

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClientInstance.invalidateQueries({
        queryKey: notificationsQueryKey,
      })
      await queryClientInstance.invalidateQueries({
        queryKey: upcomingBookingQueryKey,
      })
      await queryClientInstance.invalidateQueries({
        queryKey: bookingHistoryQueryKey,
      })
    },
  })

  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="my-bookings" />

      <main className="mx-auto max-w-[980px] px-6 py-10 lg:px-8 lg:py-14">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-12"
        >
          <motion.div variants={fadeInUp}>
            <PageHeader
              eyebrow="Your trips"
              title="My Bookings"
              subtitle="Manage your trips and track upcoming journeys between Aurora and Metro Manila."
            />
          </motion.div>

          {tripLifecycleAlerts.length > 0 && (
            <motion.div variants={fadeInUp} className="space-y-3">
              {tripLifecycleAlerts.map((notification) => (
                <div
                  key={notification.id}
                  className={
                    notification.type === 'trip_ended'
                      ? 'rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] px-5 py-4'
                      : 'rounded-2xl border border-[#bfdbfe] bg-[#f0f7ff] px-5 py-4'
                  }
                >
                  <p className="text-[15px] font-semibold text-[#1d1d1f]">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-[14px] text-[#86868b]">
                    {notification.body}
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-2 h-8 px-0 text-[13px] text-[#0066cc] hover:bg-transparent hover:text-[#0077ed]"
                    disabled={markReadMutation.isPending}
                    onClick={() => markReadMutation.mutate(notification.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              ))}
            </motion.div>
          )}

          {tripCancelledAlerts.length > 0 && (
            <motion.div variants={fadeInUp} className="space-y-3">
              {tripCancelledAlerts.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-2xl border border-[#f5c6a0] bg-[#fff8f2] px-5 py-4"
                >
                  <p className="text-[15px] font-semibold text-[#1d1d1f]">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-[14px] text-[#86868b]">
                    {notification.body}
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-2 h-8 px-0 text-[13px] text-[#0066cc] hover:bg-transparent hover:text-[#0077ed]"
                    disabled={markReadMutation.isPending}
                    onClick={() => markReadMutation.mutate(notification.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              ))}
            </motion.div>
          )}

          {upcomingQuery.isLoading ? (
            <motion.p
              variants={fadeInUp}
              className="text-[15px] text-[#86868b]"
            >
              Loading upcoming trip…
            </motion.p>
          ) : (
            upcomingQuery.data && (
              <motion.div variants={fadeInUp}>
                <UpcomingTripCard booking={upcomingQuery.data} />
              </motion.div>
            )
          )}
          {historyQuery.isLoading ? (
            <motion.p
              variants={fadeInUp}
              className="text-[15px] text-[#86868b]"
            >
              Loading booking history…
            </motion.p>
          ) : (
            historyQuery.data && (
              <motion.div variants={fadeInUp}>
                <BookingHistoryTable bookings={historyQuery.data} />
              </motion.div>
            )
          )}
          <PlanTripCta />
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
