import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Headphones,
  Lightbulb,
  Wallet,
} from 'lucide-react'
import { AppleCard, PageHeader, SectionTitle } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { driverTripsQueryKey, fetchDriverTrips } from '@/lib/api/driver-trips'
import { driverWalletQueryKey, fetchDriverWallet } from '@/lib/api/wallet'
import { useAuth } from '@/lib/auth-context'
import {
  countTodayTrips,
  formatTripDateTime,
  getTripRouteLabel,
  getTripStatusLabel,
  isPastTrip,
  isUpcomingTrip,
} from '@/lib/driver-trips'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

type StatCardProps = {
  title: string
  value: string
  footer: string
}

function StatCard({ title, value, footer }: StatCardProps) {
  return (
    <AppleCard className="p-6">
      <p className="text-[13px] font-medium text-[#86868b]">{title}</p>
      <p className="mt-2 text-[32px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
        {value}
      </p>
      <p className="mt-1 text-[13px] text-[#86868b]">{footer}</p>
    </AppleCard>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <AppleCard className="border border-dashed border-[#d2d2d7] bg-transparent px-6 py-14 text-center">
      <p className="text-[17px] font-semibold text-[#1d1d1f]">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-[15px] text-[#86868b]">{description}</p>
    </AppleCard>
  )
}

function useDriverTrips() {
  return useQuery({
    queryKey: driverTripsQueryKey,
    queryFn: fetchDriverTrips,
  })
}

function publishedTripsCount(trips: { status: string }[]) {
  return trips.filter((trip) => trip.status === 'published').length
}

function StatusPill({ label, variant }: { label: string; variant: 'success' | 'draft' | 'default' }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-[12px] font-medium',
        variant === 'success' && 'bg-[#f0fdf4] text-[#248a3d]',
        variant === 'draft' && 'bg-[#fff8eb] text-[#bf4800]',
        variant === 'default' && 'bg-[#f0f7ff] text-[#0066cc]',
      )}
    >
      {label}
    </span>
  )
}

export function DriverDashboardPage() {
  const { profile } = useAuth()
  const tripsQuery = useDriverTrips()
  const trips = tripsQuery.data ?? []
  const firstName = profile?.fullName?.split(' ')[0] ?? 'Driver'

  const publishedTrips = trips.filter((trip) => trip.status === 'published')
  const upcomingTrips = publishedTrips
    .filter((trip) => isUpcomingTrip(trip))
    .sort((a, b) =>
      `${a.departureDate}T${a.departureTime}`.localeCompare(
        `${b.departureDate}T${b.departureTime}`,
      ),
    )
  const pastTrips = publishedTrips.filter((trip) => isPastTrip(trip))
  const nextTrip = upcomingTrips[0]
  const recentTrips = [...pastTrips]
    .sort((a, b) =>
      `${b.departureDate}T${b.departureTime}`.localeCompare(
        `${a.departureDate}T${a.departureTime}`,
      ),
    )
    .slice(0, 5)
  const todayCount = countTodayTrips(trips)
  const walletQuery = useQuery({
    queryKey: driverWalletQueryKey,
    queryFn: fetchDriverWallet,
  })
  const walletBalance = walletQuery.data?.balancePesos ?? 0
  const walletFooter =
    walletQuery.data?.meaning === 'platform_owes_driver'
      ? 'Platform owes you'
      : walletQuery.data?.meaning === 'driver_owes_platform'
        ? 'You owe the platform'
        : 'Settled after completed trips'

  return (
    <motion.div
      className="space-y-12"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <PageHeader
          eyebrow="Driver portal"
          title={`Welcome back, ${firstName}.`}
          subtitle={
            todayCount > 0
              ? `You have ${todayCount} trip${todayCount === 1 ? '' : 's'} scheduled for today.`
              : 'No trips scheduled for today.'
          }
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Trips completed"
          value={String(pastTrips.length)}
          footer="Published trips in the past"
        />
        <StatCard
          title="Wallet balance"
          value={walletQuery.isLoading ? '…' : `₱${walletBalance.toLocaleString()}`}
          footer={walletFooter}
        />
        <StatCard
          title="Upcoming trips"
          value={String(upcomingTrips.length)}
          footer="Published and scheduled"
        />
      </motion.div>

      <div className="grid gap-8 xl:grid-cols-[1fr_280px]">
        <motion.div variants={fadeInUp} className="space-y-8">
          {tripsQuery.isLoading ? (
            <p className="text-[15px] text-[#86868b]">Loading trips...</p>
          ) : nextTrip ? (
            <AppleCard className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#d2d2d7]/60 px-6 py-4">
                <h2 className="text-[17px] font-semibold text-[#1d1d1f]">
                  Next scheduled trip
                </h2>
                <StatusPill label={getTripStatusLabel(nextTrip)} variant="success" />
              </div>
              <div className="space-y-5 p-6">
                <div>
                  <p className="text-[13px] font-medium text-[#0066cc]">{nextTrip.id}</p>
                  <p className="mt-1 text-[19px] font-semibold text-[#1d1d1f]">
                    {getTripRouteLabel(nextTrip)}
                  </p>
                  <p className="mt-2 text-[15px] text-[#86868b]">
                    Departs {formatTripDateTime(nextTrip)}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[12px] font-medium text-[#86868b] uppercase">Pickup</p>
                    <p className="mt-1 text-[15px] text-[#1d1d1f]">
                      {nextTrip.departureLocation}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[#86868b] uppercase">Drop-off</p>
                    <p className="mt-1 text-[15px] text-[#1d1d1f]">
                      {nextTrip.arrivalLocation}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#f5f5f7] px-4 py-4 text-[14px] text-[#86868b]">
                  <p>
                    Vehicle:{' '}
                    <span className="font-medium text-[#1d1d1f]">
                      {nextTrip.vehicleName ?? 'Not set'}
                    </span>
                  </p>
                  <p className="mt-1">
                    Seats:{' '}
                    <span className="font-medium text-[#1d1d1f]">
                      {nextTrip.seatsLeft} of{' '}
                      {nextTrip.totalSeats ?? nextTrip.seatsLeft} available
                    </span>
                  </p>
                  <p className="mt-1">
                    Fare:{' '}
                    <span className="font-semibold text-[#1d1d1f]">
                      ₱{nextTrip.price.toLocaleString()}
                    </span>
                  </p>
                </div>

                <Button
                  className="h-10 rounded-full bg-[#0071e3] px-6 text-[14px] font-normal hover:bg-[#0077ed]"
                  asChild
                >
                  <Link to="/driver/trips/$tripId" params={{ tripId: nextTrip.id }}>
                    View trip details
                  </Link>
                </Button>
              </div>
            </AppleCard>
          ) : (
            <EmptyState
              title="No upcoming trips"
              description="Publish a trip to make it available for passengers."
            />
          )}

          <div>
            <SectionTitle
              title="Recent trips"
              action={
                <Link
                  to="/driver/trips"
                  className="text-[14px] text-[#0066cc] hover:underline"
                >
                  View all ›
                </Link>
              }
            />

            {recentTrips.length === 0 ? (
              <EmptyState
                title="No trip history yet"
                description="Completed trips will appear here after their departure time."
              />
            ) : (
              <AppleCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left">
                    <thead>
                      <tr className="border-b border-[#d2d2d7]/60 bg-[#f5f5f7]/50">
                        {['Trip ID', 'Date', 'Route', 'Fare', 'Status'].map((head) => (
                          <th
                            key={head}
                            className="px-6 py-3 text-[12px] font-medium text-[#86868b] uppercase"
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentTrips.map((trip) => (
                        <tr
                          key={trip.id}
                          className="border-b border-[#d2d2d7]/40 last:border-b-0"
                        >
                          <td className="px-6 py-4 text-[14px] font-medium text-[#0066cc]">
                            {trip.id}
                          </td>
                          <td className="px-6 py-4 text-[14px] text-[#86868b]">
                            {formatTripDateTime(trip)}
                          </td>
                          <td className="px-6 py-4 text-[14px] text-[#1d1d1f]">
                            {getTripRouteLabel(trip)}
                          </td>
                          <td className="px-6 py-4 text-[14px] font-medium text-[#1d1d1f]">
                            ₱{trip.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <StatusPill
                              label={getTripStatusLabel(trip)}
                              variant="default"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AppleCard>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-4">
          <AppleCard className="p-5">
            <p className="text-[13px] font-semibold text-[#1d1d1f]">Quick actions</p>
            <div className="mt-4 space-y-1">
              <Button
                variant="ghost"
                className="h-11 w-full justify-start rounded-xl px-3 text-[14px] text-[#0066cc] hover:bg-[#0071e3]/5"
                asChild
              >
                <Link to="/driver/create">
                  <CirclePlus className="size-4" />
                  Create new trip
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="h-11 w-full justify-start rounded-xl px-3 text-[14px] text-[#1d1d1f] hover:bg-[#e8e8ed]"
              >
                <Headphones className="size-4" />
                Contact support
              </Button>
              <Button
                variant="ghost"
                className="h-11 w-full justify-start rounded-xl px-3 text-[14px] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                asChild
              >
                <Link to="/driver/wallet">
                  <Wallet className="size-4" />
                  Wallet
                </Link>
              </Button>
            </div>
          </AppleCard>

          <AppleCard className="p-5">
            <p className="text-[13px] font-medium text-[#86868b]">Live status</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#34c759]" />
                <span className="text-[15px] font-medium text-[#1d1d1f]">
                  Online & available
                </span>
              </div>
              <Switch defaultChecked />
            </div>
          </AppleCard>

          <AppleCard className="bg-[#1d1d1f] p-5 text-white">
            <div className="flex items-center gap-2 text-[#2997ff]">
              <Lightbulb className="size-4" />
              <p className="text-[12px] font-medium tracking-wide uppercase">Pro tip</p>
            </div>
            <p className="mt-3 text-[17px] font-semibold">Publish early</p>
            <p className="mt-1 text-[14px] leading-relaxed text-[#a1a1a6]">
              Trips published ahead of time appear on Find Vans for passengers to book.
            </p>
            <Link
              to="/driver/create"
              className="mt-4 inline-block text-[14px] text-[#2997ff] hover:underline"
            >
              Create a trip ›
            </Link>
          </AppleCard>
        </motion.div>
      </div>
    </motion.div>
  )
}

type TripTab = 'upcoming' | 'completed' | 'cancelled'

const TRIPS_PAGE_SIZE = 6

export function DriverMyTripsPage() {
  const tripsQuery = useDriverTrips()
  const trips = tripsQuery.data ?? []
  const [activeTab, setActiveTab] = useState<TripTab>('upcoming')
  const [page, setPage] = useState(1)
  const tripsTopRef = useRef<HTMLDivElement>(null)

  const upcomingTrips = trips.filter((trip) => isUpcomingTrip(trip))
  const completedTrips = trips.filter((trip) => isPastTrip(trip))
  const cancelledTrips = trips.filter((trip) => trip.status === 'cancelled')
  const draftTrips = trips.filter((trip) => trip.status === 'draft')

  const visibleTrips =
    activeTab === 'upcoming'
      ? [...upcomingTrips, ...draftTrips]
      : activeTab === 'completed'
        ? completedTrips
        : cancelledTrips

  const totalPages = Math.max(1, Math.ceil(visibleTrips.length / TRIPS_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * TRIPS_PAGE_SIZE
    return visibleTrips.slice(start, start + TRIPS_PAGE_SIZE)
  }, [currentPage, visibleTrips])

  const tripRangeStart =
    visibleTrips.length === 0 ? 0 : (currentPage - 1) * TRIPS_PAGE_SIZE + 1
  const tripRangeEnd = Math.min(currentPage * TRIPS_PAGE_SIZE, visibleTrips.length)

  useEffect(() => {
    setPage(1)
  }, [activeTab, visibleTrips.length])

  function goToPage(nextPage: number) {
    setPage(nextPage)
    tripsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const earningsQuery = useQuery({
    queryKey: driverWalletQueryKey,
    queryFn: fetchDriverWallet,
  })
  const walletBalance = earningsQuery.data?.balancePesos ?? 0

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Driver portal"
        title="My trips."
        subtitle="Manage your upcoming assignments and review historical travel data."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total trips"
          value={String(trips.length)}
          footer={`${publishedTripsCount(trips)} published`}
        />
        <StatCard
          title="Upcoming"
          value={String(upcomingTrips.length)}
          footer="Scheduled departures"
        />
        <StatCard
          title="Wallet balance"
          value={earningsQuery.isLoading ? '…' : `₱${walletBalance.toLocaleString()}`}
          footer="From completed trip settlements"
        />
      </div>

      <div ref={tripsTopRef} className="scroll-mt-24">
        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ['upcoming', `Upcoming (${upcomingTrips.length + draftTrips.length})`],
              ['completed', 'Completed'],
              ['cancelled', 'Cancelled'],
            ] as const
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'inline-flex h-9 items-center rounded-full px-4 text-[13px] font-medium transition-colors',
                activeTab === tab
                  ? 'bg-[#1d1d1f] text-white'
                  : 'bg-[#e8e8ed] text-[#86868b] hover:text-[#1d1d1f]',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tripsQuery.isLoading ? (
          <p className="text-[15px] text-[#86868b]">Loading trips...</p>
        ) : visibleTrips.length === 0 ? (
          <EmptyState
            title="No trips in this category"
            description="Create and publish a trip to make it available for passengers."
          />
        ) : (
          <div className="space-y-4">
            {paginatedTrips.map((trip) => (
              <AppleCard key={trip.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill
                        label={getTripStatusLabel(trip)}
                        variant={
                          trip.status === 'draft'
                            ? 'draft'
                            : trip.status === 'completed'
                              ? 'success'
                              : 'default'
                        }
                      />
                      <span className="text-[13px] text-[#86868b]">{trip.id}</span>
                    </div>
                    <p className="mt-2 text-[17px] font-semibold text-[#1d1d1f]">
                      {getTripRouteLabel(trip)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4 text-[13px] text-[#86868b]">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {formatTripDateTime(trip)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Car className="size-3.5" />
                        {trip.vehicleName ?? 'Vehicle not set'}
                      </span>
                      <span>₱{trip.price.toLocaleString()} per seat</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <p className="text-[14px] text-[#86868b]">
                      <span className="font-semibold text-[#1d1d1f]">
                        {trip.seatsLeft}
                      </span>{' '}
                      seats left
                    </p>
                    {trip.status === 'draft' ? (
                      <Button
                        className="h-9 rounded-full bg-[#0071e3] px-5 text-[13px] font-normal hover:bg-[#0077ed]"
                        asChild
                      >
                        <Link
                          to="/driver/trips/$tripId/edit"
                          params={{ tripId: trip.id }}
                        >
                          Continue draft
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        className="h-9 rounded-full bg-[#0071e3] px-5 text-[13px] font-normal hover:bg-[#0077ed]"
                        asChild
                      >
                        <Link to="/driver/trips/$tripId" params={{ tripId: trip.id }}>
                          View details
                        </Link>
                      </Button>
                    )}
                    {trip.status === 'published' && (
                      <Link
                        to="/find-vans"
                        className="text-[13px] text-[#0066cc] hover:underline"
                      >
                        View on Find Vans ›
                      </Link>
                    )}
                  </div>
                </div>
              </AppleCard>
            ))}

            {visibleTrips.length > TRIPS_PAGE_SIZE && (
              <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4 ring-1 ring-black/5 sm:flex-row sm:px-6">
                <p className="text-[13px] text-[#86868b]">
                  Showing{' '}
                  <span className="font-medium text-[#1d1d1f]">
                    {tripRangeStart}–{tripRangeEnd}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-[#1d1d1f]">
                    {visibleTrips.length}
                  </span>{' '}
                  trips
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 rounded-full px-4 text-[13px] text-[#0066cc] hover:bg-[#0071e3]/5 disabled:opacity-40"
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <span className="min-w-24 text-center text-[13px] font-medium text-[#1d1d1f]">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 rounded-full px-4 text-[13px] text-[#0066cc] hover:bg-[#0071e3]/5 disabled:opacity-40"
                    disabled={currentPage >= totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
