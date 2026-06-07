import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { BookingHistoryTable } from '@/components/my-bookings/booking-history-table'
import {
  MyBookingsFooter,
  PlanTripCta,
} from '@/components/my-bookings/plan-trip-cta'
import { UpcomingTripCard } from '@/components/my-bookings/upcoming-trip-card'
import { Header } from '@/components/landing/header'
import {
  bookingHistoryQueryKey,
  fetchBookingHistory,
  fetchUpcomingBooking,
  upcomingBookingQueryKey,
} from '@/lib/api/bookings'

export const Route = createFileRoute('/my-bookings')({
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
    <div className="min-h-svh bg-[#F8F9FB]">
      <Header activeLink="my-bookings" showProfile />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Bookings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your institutional travel and track upcoming journeys.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading bookings...</p>
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

      <MyBookingsFooter />
    </div>
  )
}
