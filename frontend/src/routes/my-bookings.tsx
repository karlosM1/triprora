import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/layout/page-header'
import { BookingHistoryTable } from '@/components/my-bookings/booking-history-table'
import { PlanTripCta } from '@/components/my-bookings/plan-trip-cta'
import { UpcomingTripCard } from '@/components/my-bookings/upcoming-trip-card'
import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import {
  bookingHistoryQueryOptions,
  upcomingBookingQueryOptions,
} from '@/lib/api/bookings'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { queryClient } from '@/lib/query-client'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/my-bookings')({
  beforeLoad: async () => {
    await requireAuth('/my-bookings')
  },
  loader: () => {
    void queryClient.prefetchQuery(upcomingBookingQueryOptions())
    void queryClient.prefetchQuery(bookingHistoryQueryOptions())
  },
  component: MyBookingsPage,
})

function MyBookingsPage() {
  const upcomingQuery = useQuery(upcomingBookingQueryOptions())
  const historyQuery = useQuery(bookingHistoryQueryOptions())

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
