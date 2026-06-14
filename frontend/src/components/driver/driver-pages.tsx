import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Calendar,
  Car,
  CirclePlus,
  Headphones,
  Lightbulb,
  MoreHorizontal,
  Truck,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { driverTripsQueryKey, fetchDriverTrips } from '@/lib/api/driver-trips'
import { useAuth } from '@/lib/auth-context'
import {
  countTodayTrips,
  formatTripDateTime,
  getTripRouteLabel,
  getTripStatusLabel,
  isPastTrip,
  isUpcomingTrip,
  sumPotentialEarnings,
} from '@/lib/driver-trips'
import { cn } from '@/lib/utils'

type StatCardProps = {
  title: string
  value: string
  footer: string
  icon: React.ReactNode
}

function StatCard({ title, value, footer, icon }: StatCardProps) {
  return (
    <Card className="rounded-sm border border-border bg-white py-0 shadow-none ring-0">
      <CardContent className="relative px-5 py-5">
        <div className="absolute top-0 left-0 h-full w-1 rounded-l-sm bg-primary" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {title}
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{footer}</p>
          </div>
          <div className="rounded-sm bg-primary/5 p-2 text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="rounded-sm border border-dashed border-border bg-white py-0 shadow-none ring-0">
      <CardContent className="px-5 py-10 text-center">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
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

export function DriverDashboardPage() {
  const { profile } = useAuth()
  const tripsQuery = useDriverTrips()
  const trips = tripsQuery.data ?? []
  const firstName = profile?.fullName?.split(' ')[0] ?? 'Driver'

  const publishedTrips = trips.filter((trip) => trip.status === 'published')
  const upcomingTrips = publishedTrips.filter((trip) => isUpcomingTrip(trip)).sort((a, b) =>
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
  const earnings = sumPotentialEarnings(publishedTrips)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {todayCount > 0
            ? `You have ${todayCount} trip${todayCount === 1 ? '' : 's'} scheduled for today.`
            : 'No trips scheduled for today.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Trips Completed"
          value={String(pastTrips.length)}
          footer="Published trips in the past"
          icon={<Truck className="size-5" />}
        />
        <StatCard
          title="Total Earnings"
          value={`₱${earnings.toLocaleString()}`}
          footer={`${publishedTrips.length} published trip${publishedTrips.length === 1 ? '' : 's'}`}
          icon={<Wallet className="size-5" />}
        />
        <StatCard
          title="Upcoming Trips"
          value={String(upcomingTrips.length)}
          footer="Published and scheduled"
          icon={<Calendar className="size-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {tripsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading trips...</p>
          ) : nextTrip ? (
            <Card className="overflow-hidden rounded-sm border border-border bg-white py-0 shadow-none ring-0">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
                <CardTitle className="text-base font-semibold">
                  Next Scheduled Trip
                </CardTitle>
                <Badge className="rounded-sm border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  {getTripStatusLabel(nextTrip).toUpperCase()}
                </Badge>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-primary">{nextTrip.id}</p>
                    <p className="mt-0.5 font-medium">{getTripRouteLabel(nextTrip)}</p>
                    <p className="mt-3 text-lg font-bold text-primary">
                      Departs {formatTripDateTime(nextTrip)}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Pickup
                      </p>
                      <p className="mt-0.5 text-sm font-medium">
                        {nextTrip.departureLocation}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Dropoff
                      </p>
                      <p className="mt-0.5 text-sm font-medium">
                        {nextTrip.arrivalLocation}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-sm border border-border bg-slate-50 px-4 py-3 text-sm">
                    <p>
                      <span className="text-muted-foreground">Vehicle:</span>{' '}
                      {nextTrip.vehicleName ?? 'Not set'}
                    </p>
                    <p className="mt-1">
                      <span className="text-muted-foreground">Seats:</span>{' '}
                      {nextTrip.seatsLeft} of {nextTrip.totalSeats ?? nextTrip.seatsLeft}{' '}
                      available
                    </p>
                    <p className="mt-1">
                      <span className="text-muted-foreground">Fare:</span>{' '}
                      <span className="font-semibold">₱{nextTrip.price.toLocaleString()}</span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button className="rounded-sm" asChild>
                      <Link to="/driver/trips/$tripId" params={{ tripId: nextTrip.id }}>
                        View Trip Details
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-sm">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              title="No upcoming trips"
              description="Publish a trip to make it available for passengers."
            />
          )}

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Trips</h2>
              <Link
                to="/driver/trips"
                className="text-sm font-medium text-primary hover:underline"
              >
                View All
              </Link>
            </div>

            {recentTrips.length === 0 ? (
              <EmptyState
                title="No trip history yet"
                description="Completed trips will appear here after their departure time."
              />
            ) : (
              <Card className="rounded-sm border border-border bg-white py-0 shadow-none ring-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[11px] font-semibold tracking-wider uppercase">
                        Trip ID
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold tracking-wider uppercase">
                        Date
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold tracking-wider uppercase">
                        Route
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold tracking-wider uppercase">
                        Fare
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold tracking-wider uppercase">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTrips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell className="font-medium text-primary">{trip.id}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatTripDateTime(trip)}
                        </TableCell>
                        <TableCell>{getTripRouteLabel(trip)}</TableCell>
                        <TableCell className="font-medium">
                          ₱{trip.price.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="rounded-sm border-primary/20 bg-primary/5 text-primary"
                          >
                            {getTripStatusLabel(trip).toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="rounded-sm border border-border bg-white py-0 shadow-none ring-0">
            <CardHeader className="px-4 py-4">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 px-2 pb-4">
              <Button
                variant="ghost"
                className="h-auto w-full justify-start rounded-sm bg-primary/5 px-3 py-3 text-primary hover:bg-primary/10 hover:text-primary"
                asChild
              >
                <Link to="/driver/create">
                  <CirclePlus className="size-4" />
                  Create New Trip
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="h-auto w-full justify-start rounded-sm px-3 py-3"
              >
                <Headphones className="size-4" />
                Contact Support
              </Button>
              <Button
                variant="ghost"
                className="h-auto w-full justify-start rounded-sm px-3 py-3"
                asChild
              >
                <Link to="/driver/trips">
                  <Wallet className="size-4" />
                  My Trips
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-sm border border-border bg-white py-0 shadow-none ring-0">
            <CardContent className="px-4 py-4">
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Live Status
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium">Online & Available</span>
                </div>
                <Switch defaultChecked className="rounded-sm" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-sm border border-primary/10 bg-primary/5 py-0 shadow-none ring-0">
            <CardContent className="px-4 py-4">
              <div className="flex items-center gap-2 text-primary">
                <Lightbulb className="size-4" />
                <p className="text-[11px] font-semibold tracking-wider uppercase">
                  Pro Tip
                </p>
              </div>
              <p className="mt-2 text-sm font-semibold">Publish early</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Trips published ahead of time appear on Find Vans for passengers to
                book.
              </p>
              <Link
                to="/driver/create"
                className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
              >
                Create a trip →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

type TripTab = 'upcoming' | 'completed' | 'cancelled'

export function DriverMyTripsPage() {
  const tripsQuery = useDriverTrips()
  const trips = tripsQuery.data ?? []
  const [activeTab, setActiveTab] = useState<TripTab>('upcoming')

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

  const earnings = sumPotentialEarnings(completedTrips)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your upcoming assignments and review historical travel data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-sm border border-border bg-white py-0 shadow-none ring-0">
          <CardContent className="px-5 py-5">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Total Trips
            </p>
            <p className="mt-2 text-3xl font-bold text-primary">{trips.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {publishedTripsCount(trips)} published
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-sm border border-border bg-white py-0 shadow-none ring-0">
          <CardContent className="px-5 py-5">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Upcoming
            </p>
            <p className="mt-2 text-3xl font-bold">{upcomingTrips.length}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-sm bg-slate-100">
              <div
                className="h-full rounded-sm bg-teal-500"
                style={{
                  width:
                    trips.length === 0
                      ? '0%'
                      : `${Math.round((upcomingTrips.length / trips.length) * 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-sm border border-border bg-white py-0 shadow-none ring-0">
          <CardContent className="px-5 py-5">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Completed Earnings
            </p>
            <p className="mt-2 text-3xl font-bold">₱{earnings.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">Based on booked seats</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex gap-6 border-b border-border">
          {(
            [
              ['upcoming', `Upcoming Trips (${upcomingTrips.length + draftTrips.length})`],
              ['completed', 'Completed Trips'],
              ['cancelled', 'Cancelled'],
            ] as const
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'border-b-2 pb-3 text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tripsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading trips...</p>
        ) : visibleTrips.length === 0 ? (
          <EmptyState
            title="No trips in this category"
            description="Create and publish a trip to make it available for passengers."
          />
        ) : (
          <div className="space-y-4">
            {visibleTrips.map((trip) => (
              <Card
                key={trip.id}
                className="overflow-hidden rounded-sm border border-border bg-white py-0 shadow-none ring-0"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={cn(
                          'rounded-sm',
                          trip.status === 'draft'
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-50'
                            : isUpcomingTrip(trip)
                              ? 'bg-primary/5 text-primary hover:bg-primary/5'
                              : 'bg-teal-50 text-teal-700 hover:bg-teal-50',
                        )}
                      >
                        {getTripStatusLabel(trip)}
                      </Badge>
                      <span className="text-xs font-medium text-muted-foreground">
                        {trip.id}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold">{getTripRouteLabel(trip)}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
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
                    <p className="text-sm">
                      <span className="text-muted-foreground">Seats </span>
                      <span className="font-semibold">{trip.seatsLeft} left</span>
                    </p>
                    <Button variant="outline" className="rounded-sm" asChild>
                      <Link to="/driver/trips/$tripId" params={{ tripId: trip.id }}>
                        View Trip Details
                      </Link>
                    </Button>
                    {trip.status === 'published' && (
                      <Button variant="ghost" className="rounded-sm px-0 text-primary" asChild>
                        <Link to="/find-vans">View on Find Vans</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
