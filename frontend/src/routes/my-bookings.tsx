import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { BookingHistoryTable } from '@/components/my-bookings/booking-history-table'
import { PlanTripCta } from '@/components/my-bookings/plan-trip-cta'
import { UpcomingTripCard } from '@/components/my-bookings/upcoming-trip-card'
import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import {
  bookingHistoryQueryKey,
  fetchBookingHistory,
  fetchUpcomingBooking,
  upcomingBookingQueryKey,
} from '@/lib/api/bookings'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/my-bookings')({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: '/my-bookings' },
      })
    }
  },
  component: MyBookingsPage,
})

function MyBookingsPage() {
  const upcomingQuery = useQuery({
    queryKey: upcomingBookingQueryKey,
    queryFn: fetchUpcomingBooking,
  })
  const historyQuery = useQuery({
    queryKey: bookingHistoryQueryKey,
    queryFn: fetchBookingHistory,
  })

  const isLoading = upcomingQuery.isLoading || historyQuery.isLoading

  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="my-bookings" />

      <main className="mx-auto max-w-[980px] px-6 py-10 lg:px-8 lg:py-14">
        <PageHeader
          eyebrow="Your trips"
          title="My Bookings"
          subtitle="Manage your trips and track upcoming journeys between Aurora and Metro Manila."
        />

        <div className="mt-12 space-y-14">
          {isLoading ? (
            <p className="text-[15px] text-[#86868b]">Loading bookings...</p>
          ) : (
            <>
              {upcomingQuery.data && (
                <UpcomingTripCard booking={upcomingQuery.data} />
              )}
              {historyQuery.data && (
                <BookingHistoryTable bookings={historyQuery.data} />
              )}
            </>
          )}
          <PlanTripCta />
        </div>
      </main>

      <Footer />
    </div>
  )
}
