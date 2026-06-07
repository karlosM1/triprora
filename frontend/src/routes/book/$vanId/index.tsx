import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BookingFooter } from '@/components/booking/booking-footer'
import { ConciergeCard, TripSummaryCard } from '@/components/booking/trip-summary-card'
import { SeatMap } from '@/components/booking/seat-map'
import { Header } from '@/components/landing/header'
import { loadVanBooking } from '@/lib/api/load-van-booking'

export const Route = createFileRoute('/book/$vanId/')({
  validateSearch: (search: Record<string, unknown>) => ({
    seat: (search.seat as string) || '1A',
  }),
  loader: async ({ params }) => {
    return loadVanBooking(params.vanId)
  },
  component: SeatSelectionPage,
})

function SeatSelectionPage() {
  const { van, seats } = Route.useLoaderData()
  const { vanId } = Route.useParams()
  const { seat: initialSeat } = Route.useSearch()
  const [selectedSeatId, setSelectedSeatId] = useState(initialSeat)

  const selectedSeat = seats.find((s) => s.id === selectedSeatId)
  const isPremium = selectedSeat?.premium ?? false

  const seatMap = seats.map((s) => ({
    ...s,
    status:
      s.id === selectedSeatId
        ? ('selected' as const)
        : s.status === 'occupied'
          ? ('occupied' as const)
          : ('available' as const),
  }))

  return (
    <div className="min-h-svh bg-[#F8F9FB]">
      <Header activeLink="my-bookings" />

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/find-vans" className="hover:text-primary">
            Fleet
          </Link>
          <span className="mx-1.5">&gt;</span>
          <span>{van.operator}</span>
          <span className="mx-1.5">&gt;</span>
          <span className="text-foreground">Seat Selection</span>
        </nav>

        <div className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Select Your Preferred Seat
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {van.classType.replace(' CLASS', '')} Van • {van.id.padStart(3, '0')} Route
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1">
            <SeatMap
              seats={seatMap}
              selectedSeatId={selectedSeatId}
              onSelectSeat={setSelectedSeatId}
            />
          </div>

          <aside className="w-full shrink-0 space-y-4 lg:w-80">
            <TripSummaryCard
              van={van}
              vanId={vanId}
              selectedSeat={selectedSeatId}
              isPremium={isPremium}
            />
            <ConciergeCard />
          </aside>
        </div>
      </main>

      <BookingFooter />
    </div>
  )
}
