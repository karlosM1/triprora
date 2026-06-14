import { isAxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Car, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  driverTripDetailsQueryKey,
  fetchDriverTripDetails,
} from '@/lib/api/driver-trips'
import {
  formatTripDateTime,
  getTripRouteLabel,
  getTripStatusLabel,
} from '@/lib/driver-trips'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/driver/trips/$tripId')({
  loader: async ({ params }) => {
    try {
      return await fetchDriverTripDetails(params.tripId)
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        throw notFound()
      }
      throw error
    }
  },
  notFoundComponent: TripNotFound,
  errorComponent: TripLoadError,
  component: DriverTripDetailsPage,
})

function TripNotFound() {
  return (
    <TripErrorLayout
      title="Trip not found"
      message="This trip may have been removed or you may not have access to it."
    />
  )
}

function TripLoadError({ error }: { error: unknown }) {
  const message =
    error instanceof Error
      ? error.message
      : 'Something went wrong while loading trip details.'

  return (
    <TripErrorLayout
      title="Unable to load trip"
      message={message.includes('status code')
        ? 'The trip details API is unavailable. Try restarting the backend server.'
        : message}
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
    <div className="space-y-4">
      <Button variant="ghost" className="rounded-sm px-0" asChild>
        <Link to="/driver/trips">
          <ArrowLeft className="size-4" />
          Back to My Trips
        </Link>
      </Button>
      <div className="rounded-sm border border-red-200 bg-red-50 px-5 py-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

function groupSeatsByRow(seats: { label: string; status: string; premium: boolean }[]) {
  const rows = new Map<number, typeof seats>()

  for (const seat of seats) {
    const row = Number.parseInt(seat.label, 10)
    if (Number.isNaN(row)) continue
    const rowSeats = rows.get(row) ?? []
    rowSeats.push(seat)
    rows.set(row, rowSeats)
  }

  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([row, rowSeats]) => ({
      row,
      seats: rowSeats.sort((a, b) => a.label.localeCompare(b.label)),
    }))
}

function DriverTripDetailsPage() {
  const { tripId } = Route.useParams()
  const initialData = Route.useLoaderData()
  const detailsQuery = useQuery({
    queryKey: driverTripDetailsQueryKey(tripId),
    queryFn: () => fetchDriverTripDetails(tripId),
    initialData,
  })

  const details = detailsQuery.data

  if (detailsQuery.isError) {
    return null
  }

  if (!details) {
    return (
      <TripErrorLayout
        title="Trip not found"
        message="This trip may have been removed or you may not have access to it."
      />
    )
  }

  const { trip, seats, passengers, seatsAvailable, seatsOccupied } = details
  const seatRows = groupSeatsByRow(seats)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" className="mb-2 rounded-sm px-0" asChild>
            <Link to="/driver/trips">
              <ArrowLeft className="size-4" />
              Back to My Trips
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Trip Details</h1>
          <p className="mt-1 text-muted-foreground">{trip.id}</p>
        </div>
        <Badge
          className={cn(
            'w-fit rounded-sm',
            trip.status === 'draft'
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-50'
              : trip.status === 'cancelled'
                ? 'bg-red-50 text-red-700 hover:bg-red-50'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
          )}
        >
          {getTripStatusLabel(trip).toUpperCase()}
        </Badge>
      </div>

      <Card className="rounded-sm border border-border bg-white py-0 shadow-none ring-0">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-base font-semibold">
            {getTripRouteLabel(trip)}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem
            icon={<Calendar className="size-4 text-primary" />}
            label="Departure"
            value={formatTripDateTime(trip)}
          />
          <DetailItem
            icon={<Car className="size-4 text-primary" />}
            label="Vehicle"
            value={trip.vehicleName ?? 'Not set'}
          />
          <DetailItem
            icon={<Users className="size-4 text-primary" />}
            label="Passengers"
            value={`${passengers.length} booked`}
          />
          <DetailItem
            label="Fare per seat"
            value={`₱${trip.price.toLocaleString()}`}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card className="rounded-sm border border-border bg-white py-0 shadow-none ring-0">
          <CardHeader className="border-b border-border px-5 py-4">
            <CardTitle className="text-base font-semibold">Passengers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {passengers.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No passengers have booked this trip yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold tracking-wider uppercase">
                      Passenger
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold tracking-wider uppercase">
                      Seat
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold tracking-wider uppercase">
                      Contact
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold tracking-wider uppercase">
                      Reference
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passengers.map((passenger) => (
                    <TableRow key={passenger.id}>
                      <TableCell>
                        <p className="font-medium">{passenger.name}</p>
                        {passenger.email && (
                          <p className="text-xs text-muted-foreground">{passenger.email}</p>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{passenger.seat ?? '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {passenger.phone ?? '—'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-primary">
                        {passenger.reference ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-sm border border-border bg-white py-0 shadow-none ring-0">
          <CardHeader className="border-b border-border px-5 py-4">
            <CardTitle className="text-base font-semibold">Seat Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <SummaryStat label="Available" value={seatsAvailable} tone="available" />
              <SummaryStat label="Booked" value={seatsOccupied} tone="occupied" />
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <Legend color="bg-emerald-100 ring-emerald-300" label="Available" />
              <Legend color="bg-slate-200 ring-slate-300" label="Booked" />
            </div>

            <div className="rounded-sm border border-border bg-slate-50 p-4">
              <div className="space-y-3">
                {seatRows.map(({ row, seats: rowSeats }) => (
                  <div key={row} className="flex flex-wrap justify-center gap-2">
                    {rowSeats.map((seat) => (
                      <div
                        key={seat.label}
                        title={
                          seat.status === 'available'
                            ? `Seat ${seat.label} — Available`
                            : `Seat ${seat.label} — Booked`
                        }
                        className={cn(
                          'flex size-11 flex-col items-center justify-center rounded-sm border text-[10px] font-semibold ring-1',
                          seat.status === 'available'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 ring-emerald-300'
                            : 'border-slate-200 bg-slate-200 text-slate-600 ring-slate-300',
                        )}
                      >
                        {seat.label}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
      </div>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'available' | 'occupied'
}) {
  return (
    <div
      className={cn(
        'rounded-sm border px-4 py-3',
        tone === 'available'
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-slate-200 bg-slate-100',
      )}
    >
      <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('size-3 rounded-sm ring-1', color)} />
      {label}
    </span>
  )
}
