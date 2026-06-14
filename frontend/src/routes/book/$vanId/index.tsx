import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BookingFooter } from '@/components/booking/booking-footer'
import { DriverInfoCard } from '@/components/booking/driver-info-card'
import { TripAddressForm } from '@/components/booking/trip-address-form'
import { TripSummaryCard } from '@/components/booking/trip-summary-card'
import { SeatMap } from '@/components/booking/seat-map'
import { Header } from '@/components/landing/header'
import { Button } from '@/components/ui/button'
import { loadVanBooking } from '@/lib/api/load-van-booking'
import type { TripAddresses } from '@/lib/booking'

export const Route = createFileRoute('/book/$vanId/')({
  validateSearch: (search: Record<string, unknown>) => ({
    seat: (search.seat as string) || '1A',
    pickupAddress: (search.pickupAddress as string) || '',
    dropoffAddress: (search.dropoffAddress as string) || '',
  }),
  loader: async ({ params }) => {
    return loadVanBooking(params.vanId)
  },
  notFoundComponent: TripNotFound,
  errorComponent: TripLoadError,
  component: SeatSelectionPage,
})

function TripNotFound() {
  return (
    <TripErrorLayout
      title="Trip not found"
      message="This trip may have been removed or is no longer available for booking."
    />
  )
}

function TripLoadError({ error }: { error: Error }) {
  return (
    <TripErrorLayout
      title="Unable to load trip"
      message={error.message || 'Something went wrong while loading seat availability.'}
    />
  )
}

function TripErrorLayout({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <div className="min-h-svh bg-[#F8F9FB]">
      <Header activeLink="find-vans" />
      <main className="mx-auto max-w-lg px-6 py-16 text-center lg:px-8">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Button className="mt-6 rounded-lg" asChild>
          <Link to="/find-vans">Back to available vans</Link>
        </Button>
      </main>
      <BookingFooter />
    </div>
  )
}

const emptyAddresses: TripAddresses = {
  pickupAddress: '',
  dropoffAddress: '',
}

function SeatSelectionPage() {
  const { van, seats } = Route.useLoaderData()
  const { vanId } = Route.useParams()
  const search = Route.useSearch()
  const defaultSeat =
    seats.find((s) => s.status === 'available')?.id ?? seats[0]?.id ?? '1A'
  const [selectedSeatId, setSelectedSeatId] = useState(
    seats.some((s) => s.id === search.seat && s.status !== 'occupied')
      ? search.seat
      : defaultSeat,
  )
  const [addresses, setAddresses] = useState<TripAddresses>({
    pickupAddress: search.pickupAddress,
    dropoffAddress: search.dropoffAddress,
  })
  const [addressError, setAddressError] = useState<string | null>(null)

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

  const addressesValid =
    addresses.pickupAddress.trim().length >= 5 &&
    addresses.dropoffAddress.trim().length >= 5

  return (
    <div className="min-h-svh bg-[#F8F9FB]">
      <Header activeLink="find-vans" />

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/find-vans" className="hover:text-primary">
            Find Vans
          </Link>
          <span className="mx-1.5">&gt;</span>
          <span>{van.operator}</span>
          <span className="mx-1.5">&gt;</span>
          <span className="text-foreground">Book Trip</span>
        </nav>

        <div className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Book Your Door-to-Door Trip
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {van.departureLocation} → {van.arrivalLocation} •{' '}
            {van.vehicleName ?? van.classType.replace(' CLASS', '')}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-6">
            <TripAddressForm values={addresses} onChange={setAddresses} />
            {!addressesValid && addressError && (
              <p className="text-sm text-destructive">{addressError}</p>
            )}
            <SeatMap
              seats={seatMap}
              selectedSeatId={selectedSeatId}
              onSelectSeat={setSelectedSeatId}
            />
          </div>

          <aside className="w-full shrink-0 space-y-4 lg:w-80">
            <DriverInfoCard van={van} />
            <TripSummaryCard
              van={van}
              vanId={vanId}
              selectedSeat={selectedSeatId}
              isPremium={isPremium}
              addresses={addresses}
              addressesValid={addressesValid}
              onAddressError={() =>
                setAddressError('Please enter your pickup and destination addresses.')
              }
            />
          </aside>
        </div>
      </main>

      <BookingFooter />
    </div>
  )
}
