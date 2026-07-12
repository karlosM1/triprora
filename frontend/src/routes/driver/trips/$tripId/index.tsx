import { isAxiosError } from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, Calendar, Car, CheckCircle2, Users } from 'lucide-react'
import { AppleCard, PageHeader } from '@/components/layout/page-header'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { TablePagination } from '@/components/ui/table-pagination'
import { usePagination } from '@/hooks/use-pagination'
import {
  completeDriverTrip,
  driverTripDetailsQueryKey,
  driverTripDetailsQueryOptions,
  driverTripsQueryKey,
} from '@/lib/api/driver-trips'
import { queryClient } from '@/lib/query-client'
import {
  canCompleteTrip,
  formatTripDateTime,
  getTripRouteLabel,
  getTripStatusLabel,
  hasTripDeparted,
} from '@/lib/driver-trips'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/driver/trips/$tripId/')({
  loader: async ({ params }) => {
    try {
      return await queryClient.ensureQueryData(
        driverTripDetailsQueryOptions(params.tripId),
      )
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
      message={
        message.includes('status code')
          ? 'The trip details API is unavailable. Try restarting the backend server.'
          : message
      }
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
      <Link
        to="/driver/trips"
        className="inline-flex items-center gap-2 text-[14px] text-[#0066cc] hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to My Trips
      </Link>
      <AppleCard className="px-6 py-10 text-center">
        <h1 className="text-[19px] font-semibold text-[#1d1d1f]">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-[#86868b]">{message}</p>
      </AppleCard>
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

function StatusPill({
  label,
  tone,
}: {
  label: string
  tone: 'draft' | 'cancelled' | 'active' | 'completed'
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-[12px] font-medium uppercase',
        tone === 'draft' && 'bg-[#fff8eb] text-[#bf4800]',
        tone === 'cancelled' && 'bg-[#fff2f2] text-[#bf4800]',
        tone === 'completed' && 'bg-[#f0fdf4] text-[#248a3d]',
        tone === 'active' && 'bg-[#f0fdf4] text-[#248a3d]',
      )}
    >
      {label}
    </span>
  )
}

function DriverTripDetailsPage() {
  const { tripId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const detailsQuery = useQuery(driverTripDetailsQueryOptions(tripId))
  const passengers = detailsQuery.data?.passengers ?? []
  const {
    pageItems: passengerPage,
    currentPage: passengerPageNumber,
    totalPages: passengerTotalPages,
    rangeStart: passengerRangeStart,
    rangeEnd: passengerRangeEnd,
    totalItems: passengerTotalItems,
    goToPage: goToPassengerPage,
    showPagination: showPassengerPagination,
  } = usePagination(passengers)

  const completeMutation = useMutation({
    mutationFn: () => completeDriverTrip(tripId),
    onSuccess: async () => {
      setCompleteDialogOpen(false)
      await queryClient.invalidateQueries({ queryKey: driverTripsQueryKey })
      await queryClient.invalidateQueries({ queryKey: driverTripDetailsQueryKey(tripId) })
      await navigate({ to: '/driver/trips' })
    },
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

  const { trip, seats, seatsAvailable, seatsOccupied } = details
  const seatRows = groupSeatsByRow(seats)
  const statusTone =
    trip.status === 'draft'
      ? 'draft'
      : trip.status === 'cancelled'
        ? 'cancelled'
        : trip.status === 'completed'
          ? 'completed'
          : 'active'
  const showCompleteButton = canCompleteTrip(trip)
  const tripHasDeparted = hasTripDeparted(trip)

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/driver/trips"
            className="mb-4 inline-flex items-center gap-2 text-[14px] text-[#0066cc] hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to My Trips
          </Link>
          <PageHeader
            eyebrow={trip.id}
            title="Trip details."
            subtitle={getTripRouteLabel(trip)}
          />
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <StatusPill label={getTripStatusLabel(trip)} tone={statusTone} />
          {trip.status === 'draft' && (
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
          )}
          {showCompleteButton && (
            <Button
              className="h-9 rounded-full bg-[#248a3d] px-5 text-[13px] font-normal hover:bg-[#1f7a35]"
              disabled={completeMutation.isPending}
              onClick={() => setCompleteDialogOpen(true)}
            >
              <CheckCircle2 className="size-4" />
              Complete trip
            </Button>
          )}
          {completeMutation.isError && (
            <p className="max-w-56 text-right text-[13px] text-[#bf4800]">
              Failed to complete trip. Try again.
            </p>
          )}
        </div>
      </div>

      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tripHasDeparted ? 'Complete this trip?' : 'Complete trip early?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tripHasDeparted ? (
                <>
                  This will mark the trip as finished and move it to your completed
                  list. Passenger bookings will be finalized.
                </>
              ) : (
                <>
                  This trip has not departed yet (
                  {formatTripDateTime(trip)}). Are you sure you want to mark it as
                  complete even though it is not done yet? This cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={completeMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#248a3d] hover:bg-[#1f7a35]"
              disabled={completeMutation.isPending}
              onClick={() => completeMutation.mutate()}
            >
              {completeMutation.isPending ? 'Completing…' : 'Yes, complete trip'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AppleCard className="p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem
            icon={<Calendar className="size-4 text-[#86868b]" />}
            label="Departure"
            value={formatTripDateTime(trip)}
          />
          <DetailItem
            icon={<Car className="size-4 text-[#86868b]" />}
            label="Vehicle"
            value={trip.vehicleName ?? 'Not set'}
          />
          <DetailItem
            icon={<Users className="size-4 text-[#86868b]" />}
            label="Passengers"
            value={`${passengers.length} booked`}
          />
          <DetailItem
            label="Fare per seat"
            value={`₱${trip.price.toLocaleString()}`}
          />
        </div>
      </AppleCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <AppleCard className="overflow-hidden">
          <div className="border-b border-[#d2d2d7]/60 px-6 py-4">
            <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Passengers</h2>
          </div>
          {passengers.length === 0 ? (
            <p className="px-6 py-12 text-center text-[15px] text-[#86868b]">
              No passengers have booked this trip yet.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left">
                  <thead>
                    <tr className="border-b border-[#d2d2d7]/60 bg-[#f5f5f7]/50">
                      {['Passenger', 'Seat', 'Contact', 'Reference'].map((head) => (
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
                    {passengerPage.map((passenger) => (
                      <tr
                        key={passenger.id}
                        className="border-b border-[#d2d2d7]/40 last:border-b-0"
                      >
                        <td className="px-6 py-4">
                          <p className="text-[15px] font-medium text-[#1d1d1f]">
                            {passenger.name}
                          </p>
                          {passenger.email && (
                            <p className="text-[13px] text-[#86868b]">{passenger.email}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[14px] font-medium text-[#1d1d1f]">
                          {passenger.seat ?? '—'}
                        </td>
                        <td className="px-6 py-4 text-[14px] text-[#86868b]">
                          {passenger.phone ?? '—'}
                        </td>
                        <td className="px-6 py-4 font-mono text-[13px] text-[#0066cc]">
                          {passenger.reference ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {showPassengerPagination && (
                <TablePagination
                  currentPage={passengerPageNumber}
                  totalPages={passengerTotalPages}
                  rangeStart={passengerRangeStart}
                  rangeEnd={passengerRangeEnd}
                  totalItems={passengerTotalItems}
                  itemLabel="passengers"
                  onPageChange={goToPassengerPage}
                />
              )}
            </>
          )}
        </AppleCard>

        <AppleCard className="p-6">
          <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Seat summary</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <SummaryStat label="Available" value={seatsAvailable} tone="available" />
            <SummaryStat label="Booked" value={seatsOccupied} tone="occupied" />
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-[12px] text-[#86868b]">
            <Legend color="bg-[#dcfce7] ring-[#86efac]" label="Available" />
            <Legend color="bg-[#e8e8ed] ring-[#d2d2d7]" label="Booked" />
          </div>

          <div className="mt-4 rounded-xl bg-[#f5f5f7] p-4">
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
                        'flex size-10 items-center justify-center rounded-lg text-[11px] font-semibold ring-1',
                        seat.status === 'available'
                          ? 'bg-[#dcfce7] text-[#166534] ring-[#86efac]'
                          : 'bg-[#e8e8ed] text-[#86868b] ring-[#d2d2d7]',
                      )}
                    >
                      {seat.label}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </AppleCard>
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
        <p className="text-[12px] font-medium text-[#86868b] uppercase">{label}</p>
      </div>
      <p className="mt-1 text-[15px] font-medium text-[#1d1d1f]">{value}</p>
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
        'rounded-xl px-4 py-3',
        tone === 'available' ? 'bg-[#f0fdf4]' : 'bg-[#f5f5f7]',
      )}
    >
      <p className="text-[12px] font-medium text-[#86868b] uppercase">{label}</p>
      <p className="mt-1 text-[28px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
        {value}
      </p>
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
