import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { BookingFooter } from '@/components/booking/booking-footer'
import { ConciergeCard, TripSummaryCard } from '@/components/booking/trip-summary-card'
import { DriverInfoCard } from '@/components/booking/driver-info-card'
import { TripAddressForm } from '@/components/booking/trip-address-form'
import { SeatMap } from '@/components/booking/seat-map'
import { PageHeader } from '@/components/layout/page-header'
import { Header } from '@/components/landing/header'
import { Button } from '@/components/ui/button'
import { loadVanBooking, vanBookingQueryOptions } from '@/lib/api/load-van-booking'
import type { TripAddresses } from '@/lib/booking'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { requirePassenger } from '@/lib/route-guards'

export const Route = createFileRoute('/book/$vanId/')({
  validateSearch: (search: Record<string, unknown>) => ({
    seat: (search.seat as string) || '1A',
    pickupAddress: (search.pickupAddress as string) || '',
    dropoffAddress: (search.dropoffAddress as string) || '',
  }),
  beforeLoad: async ({ params }) => {
    await requirePassenger(`/book/${params.vanId}`)
  },
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
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="find-vans" />
      <main className="mx-auto max-w-[980px] px-6 py-16 text-center lg:px-8">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
          {title}
        </h1>
        <p className="mt-2 text-[15px] text-[#86868b]">{message}</p>
        <Button
          className="mt-6 rounded-full bg-[#0071e3] px-6 hover:bg-[#0077ed]"
          asChild
        >
          <Link to="/find-vans">Back to find vans</Link>
        </Button>
      </main>
      <BookingFooter />
    </div>
  )
}

function SeatSelectionPage() {
  const { vanId } = Route.useParams()
  const search = Route.useSearch()
  const bookingQuery = useQuery(vanBookingQueryOptions(vanId))
  const { van, seats } = bookingQuery.data!
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
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="find-vans" />

      <main className="mx-auto max-w-[980px] px-6 py-10 lg:px-8 lg:py-14">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-10"
        >
          <motion.div variants={fadeInUp}>
            <nav className="mb-4 text-[12px] text-[#86868b]">
              <Link to="/find-vans" className="transition-colors hover:text-[#0066cc]">
                Find Vans
              </Link>
              <span className="mx-1.5">/</span>
              <span className="text-[#1d1d1f]">Book trip</span>
            </nav>
            <PageHeader
              eyebrow="Booking"
              title="Book your trip"
              subtitle={`${van.departureLocation} ↔ ${van.arrivalLocation} · ${van.vehicleName ?? van.classType.replace(' CLASS', '')}`}
            />
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col gap-8 lg:flex-row lg:items-start"
          >
            <div className="min-w-0 flex-1 space-y-6">
              <TripAddressForm values={addresses} onChange={setAddresses} />
              {!addressesValid && addressError && (
                <p className="rounded-xl bg-[#fef2f2] px-4 py-3 text-[14px] text-[#b42318] ring-1 ring-[#fecaca]">
                  {addressError}
                </p>
              )}
              <SeatMap
                seats={seatMap}
                selectedSeatId={selectedSeatId}
                onSelectSeat={setSelectedSeatId}
              />
            </div>

            <aside className="w-full shrink-0 space-y-4 lg:w-[320px]">
              <DriverInfoCard van={van} />
              <TripSummaryCard
                van={van}
                vanId={vanId}
                selectedSeat={selectedSeatId}
                addresses={addresses}
                addressesValid={addressesValid}
                onAddressError={() =>
                  setAddressError('Please enter your pickup and destination addresses.')
                }
              />
              <ConciergeCard />
            </aside>
          </motion.div>
        </motion.div>
      </main>

      <BookingFooter />
    </div>
  )
}
