import { createFileRoute } from '@tanstack/react-router'
import { BookingHistoryTable } from '@/components/my-bookings/booking-history-table'
import {
  MyBookingsFooter,
  PlanTripCta,
} from '@/components/my-bookings/plan-trip-cta'
import { UpcomingTripCard } from '@/components/my-bookings/upcoming-trip-card'
import { Header } from '@/components/landing/header'
import { bookingHistory, upcomingBooking } from '@/lib/bookings-data'

export const Route = createFileRoute('/my-bookings')({
  component: MyBookingsPage,
})

function MyBookingsPage() {
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
          <UpcomingTripCard booking={upcomingBooking} />
          <BookingHistoryTable bookings={bookingHistory} />
          <PlanTripCta />
        </div>
      </main>

      <MyBookingsFooter />
    </div>
  )
}
