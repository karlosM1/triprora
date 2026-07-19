import { isAxiosError } from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  Car,
  CheckCircle2,
  MapPin,
  Package,
  PlayCircle,
  Users,
  XCircle,
} from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { TablePagination } from '@/components/ui/table-pagination'
import { usePagination } from '@/hooks/use-pagination'
import {
  acceptDriverBooking,
  acceptDriverDelivery,
  cancelDriverTrip,
  completeDriverTrip,
  declineDriverBooking,
  declineDriverDelivery,
  driverTripDetailsQueryKey,
  driverTripDetailsQueryOptions,
  driverTripsQueryKey,
  markPassengerDestinationReached,
  startDriverTrip,
  type DriverTripDelivery,
  type DriverTripPassenger,
} from '@/lib/api/driver-trips'
import { queryClient } from '@/lib/query-client'
import {
  canCancelTrip,
  canCompleteTrip,
  canMarkDestinationReached,
  canStartTrip,
  formatTripDateTime,
  getTripRouteLabel,
  getTripStatusLabel,
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
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [startDialogOpen, setStartDialogOpen] = useState(false)
  const [packageTab, setPackageTab] = useState<'requests' | 'closed'>(
    'requests',
  )
  const detailsQuery = useQuery(driverTripDetailsQueryOptions(tripId))
  const passengers = detailsQuery.data?.passengers ?? []
  const pendingPassengers = passengers.filter((p) => p.status === 'pending')
  const confirmedPassengers = passengers.filter((p) => p.status === 'confirmed')
  const deliveries = detailsQuery.data?.deliveries ?? []
  const pendingDeliveries = deliveries.filter((d) => d.status === 'pending')
  const activeDeliveries = deliveries.filter((d) =>
    ['accepted', 'confirmed', 'picked_up'].includes(d.status),
  )
  const openDeliveries = deliveries.filter((d) =>
    ['pending', 'accepted', 'confirmed', 'picked_up'].includes(d.status),
  )
  const closedDeliveries = deliveries.filter((d) =>
    ['cancelled', 'declined'].includes(d.status),
  )
  const PACKAGE_PAGE_SIZE = 5
  const {
    pageItems: openDeliveryPage,
    currentPage: openDeliveryPageNumber,
    totalPages: openDeliveryTotalPages,
    rangeStart: openDeliveryRangeStart,
    rangeEnd: openDeliveryRangeEnd,
    totalItems: openDeliveryTotalItems,
    goToPage: goToOpenDeliveryPage,
    showPagination: showOpenDeliveryPagination,
  } = usePagination(openDeliveries, PACKAGE_PAGE_SIZE)
  const {
    pageItems: closedDeliveryPage,
    currentPage: closedDeliveryPageNumber,
    totalPages: closedDeliveryTotalPages,
    rangeStart: closedDeliveryRangeStart,
    rangeEnd: closedDeliveryRangeEnd,
    totalItems: closedDeliveryTotalItems,
    goToPage: goToClosedDeliveryPage,
    showPagination: showClosedDeliveryPagination,
  } = usePagination(closedDeliveries, PACKAGE_PAGE_SIZE)
  const {
    pageItems: passengerPage,
    currentPage: passengerPageNumber,
    totalPages: passengerTotalPages,
    rangeStart: passengerRangeStart,
    rangeEnd: passengerRangeEnd,
    totalItems: passengerTotalItems,
    goToPage: goToPassengerPage,
    showPagination: showPassengerPagination,
  } = usePagination(confirmedPassengers)

  const startMutation = useMutation({
    mutationFn: () => startDriverTrip(tripId),
    onSuccess: async () => {
      setStartDialogOpen(false)
      await queryClient.invalidateQueries({ queryKey: driverTripsQueryKey })
      await queryClient.invalidateQueries({
        queryKey: driverTripDetailsQueryKey(tripId),
      })
    },
  })

  const completeMutation = useMutation({
    mutationFn: () => completeDriverTrip(tripId),
    onSuccess: async () => {
      setCompleteDialogOpen(false)
      await queryClient.invalidateQueries({ queryKey: driverTripsQueryKey })
      await queryClient.invalidateQueries({ queryKey: driverTripDetailsQueryKey(tripId) })
      await navigate({ to: '/driver/trips' })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelDriverTrip(tripId),
    onSuccess: async () => {
      setCancelDialogOpen(false)
      await queryClient.invalidateQueries({ queryKey: driverTripsQueryKey })
      await queryClient.invalidateQueries({ queryKey: driverTripDetailsQueryKey(tripId) })
      await navigate({ to: '/driver/trips' })
    },
  })

  const reachDestinationMutation = useMutation({
    mutationFn: (bookingId: string) =>
      markPassengerDestinationReached(tripId, bookingId),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: driverTripDetailsQueryKey(tripId),
      })
      await queryClient.invalidateQueries({ queryKey: driverTripsQueryKey })
      if (result.tripEnded) {
        await navigate({ to: '/driver/trips' })
      }
    },
  })

  const acceptBookingMutation = useMutation({
    mutationFn: (bookingId: string) => acceptDriverBooking(tripId, bookingId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: driverTripDetailsQueryKey(tripId),
      })
      await queryClient.invalidateQueries({ queryKey: driverTripsQueryKey })
    },
  })

  const declineBookingMutation = useMutation({
    mutationFn: ({
      bookingId,
      reason,
    }: {
      bookingId: string
      reason?: string
    }) => declineDriverBooking(tripId, bookingId, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: driverTripDetailsQueryKey(tripId),
      })
      await queryClient.invalidateQueries({ queryKey: driverTripsQueryKey })
    },
  })

  const acceptMutation = useMutation({
    mutationFn: ({
      deliveryId,
      deliveryFee,
    }: {
      deliveryId: string
      deliveryFee: number
    }) => acceptDriverDelivery(tripId, deliveryId, deliveryFee),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: driverTripDetailsQueryKey(tripId),
      })
    },
  })

  const declineMutation = useMutation({
    mutationFn: (deliveryId: string) => declineDriverDelivery(tripId, deliveryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: driverTripDetailsQueryKey(tripId),
      })
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
          : trip.status === 'in_progress'
            ? 'active'
            : 'active'
  const showStartButton = canStartTrip(trip)
  const showCompleteButton = canCompleteTrip(trip)
  const showCancelButton = canCancelTrip(trip)
  const showReachActions = canMarkDestinationReached(trip)
  const passengerCount = confirmedPassengers.length + pendingPassengers.length
  const pendingPassengerCount = pendingPassengers.length
  const openDeliveryCount = openDeliveries.length
  const reachedCount = confirmedPassengers.filter(
    (passenger) => passenger.destinationReachedAt,
  ).length
  const actionBusy =
    startMutation.isPending ||
    completeMutation.isPending ||
    cancelMutation.isPending ||
    reachDestinationMutation.isPending

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
          <div className="flex flex-wrap items-center gap-2">
            {showCancelButton && (
              <Button
                variant="ghost"
                className="h-9 rounded-full px-5 text-[13px] font-normal text-[#bf4800] hover:bg-[#bf4800]/10 hover:text-[#bf4800]"
                disabled={actionBusy}
                onClick={() => setCancelDialogOpen(true)}
              >
                <XCircle className="size-4" />
                Cancel trip
              </Button>
            )}
            {showStartButton && (
              <Button
                className="h-9 rounded-full bg-[#0071e3] px-5 text-[13px] font-normal hover:bg-[#0077ed]"
                disabled={actionBusy}
                onClick={() => setStartDialogOpen(true)}
              >
                <PlayCircle className="size-4" />
                Start trip
              </Button>
            )}
            {showCompleteButton && (
              <Button
                className="h-9 rounded-full bg-[#248a3d] px-5 text-[13px] font-normal hover:bg-[#1f7a35]"
                disabled={actionBusy}
                onClick={() => setCompleteDialogOpen(true)}
              >
                <CheckCircle2 className="size-4" />
                End trip
              </Button>
            )}
          </div>
          {startMutation.isError && (
            <p className="max-w-56 text-right text-[13px] text-[#bf4800]">
              Failed to start trip. Try again.
            </p>
          )}
          {completeMutation.isError && (
            <p className="max-w-56 text-right text-[13px] text-[#bf4800]">
              Failed to end trip. Try again.
            </p>
          )}
          {cancelMutation.isError && (
            <p className="max-w-56 text-right text-[13px] text-[#bf4800]">
              Failed to cancel trip. Try again.
            </p>
          )}
        </div>
      </div>

      <AlertDialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmedPassengers.length > 0 ? (
                <>
                  Confirmed passengers will be notified that the trip has started.
                  The trip will leave Find Vans so new bookings cannot be made.
                  {pendingPassengerCount > 0
                    ? ` ${pendingPassengerCount} pending seat request${pendingPassengerCount === 1 ? '' : 's'} will also be cancelled.`
                    : null}
                  {pendingDeliveries.length > 0
                    ? ` ${pendingDeliveries.length} pending package request${pendingDeliveries.length === 1 ? '' : 's'} will be cancelled.`
                    : null}
                </>
              ) : pendingPassengerCount > 0 || pendingDeliveries.length > 0 ? (
                <>
                  This trip has no confirmed passengers. Pending requests will be
                  cancelled and the trip will leave Find Vans.
                </>
              ) : (
                <>
                  The trip will leave Find Vans and move to in progress. You can
                  end it when everyone has reached their destination.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={startMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#0071e3] hover:bg-[#0077ed]"
              disabled={startMutation.isPending}
              onClick={() => startMutation.mutate()}
            >
              {startMutation.isPending ? 'Starting…' : 'Yes, start trip'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the trip as ended and finalizes passenger bookings.
              {confirmedPassengers.length > 0 && reachedCount < confirmedPassengers.length
                ? ` ${confirmedPassengers.length - reachedCount} passenger${confirmedPassengers.length - reachedCount === 1 ? ' has' : 's have'} not been marked as reached yet.`
                : null}
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
              {completeMutation.isPending ? 'Ending…' : 'Yes, end trip'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              {passengerCount === 0 && openDeliveryCount === 0 ? (
                <>
                  This cannot be undone. The trip will move to your cancelled list.
                </>
              ) : passengerCount > 0 && openDeliveryCount > 0 ? (
                <>
                  This cannot be undone. {passengerCount} passenger
                  {passengerCount === 1 ? '' : 's'} will be notified and{' '}
                  {openDeliveryCount} package request
                  {openDeliveryCount === 1 ? '' : 's'} will be cancelled.
                </>
              ) : passengerCount > 0 ? (
                <>
                  This cannot be undone. {passengerCount} passenger
                  {passengerCount === 1 ? '' : 's'} with bookings will be notified
                  and their seats released.
                </>
              ) : (
                <>
                  This cannot be undone. {openDeliveryCount} package request
                  {openDeliveryCount === 1 ? '' : 's'} will be cancelled and the
                  sender notified.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              Keep trip
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#bf4800] hover:bg-[#a63f00]"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              {cancelMutation.isPending ? 'Cancelling…' : 'Yes, cancel trip'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AppleCard className="p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            value={
              showReachActions
                ? `${reachedCount}/${confirmedPassengers.length} reached`
                : `${passengers.length} booked`
            }
          />
          <DetailItem
            icon={<Package className="size-4 text-[#86868b]" />}
            label="Packages"
            value={`${pendingDeliveries.length} pending · ${activeDeliveries.length} active`}
          />
          <DetailItem
            label="Fare per seat"
            value={`₱${trip.price.toLocaleString()}`}
          />
        </div>
      </AppleCard>

      <AppleCard className="overflow-hidden">
        <div className="space-y-4 border-b border-[#d2d2d7]/60 px-6 py-4">
          <div>
            <h2 className="text-[17px] font-semibold text-[#1d1d1f]">
              Packages
            </h2>
            <p className="mt-1 text-[13px] text-[#86868b]">
              {packageTab === 'requests'
                ? 'Accept a package to unlock payment for the sender. Decline if you cannot carry it.'
                : 'Packages that were cancelled by the sender or declined by you.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['requests', `Package requests (${openDeliveries.length})`],
                ['closed', `Cancelled (${closedDeliveries.length})`],
              ] as const
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setPackageTab(tab)}
                className={cn(
                  'inline-flex h-9 w-full items-center justify-center rounded-full px-2 text-[12px] font-medium transition-colors sm:px-4 sm:text-[13px]',
                  packageTab === tab
                    ? 'bg-[#1d1d1f] text-white'
                    : 'bg-[#e8e8ed] text-[#86868b] hover:text-[#1d1d1f]',
                )}
              >
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {packageTab === 'requests' ? (
          openDeliveries.length === 0 ? (
            <p className="px-6 py-12 text-center text-[15px] text-[#86868b]">
              No package requests for this trip yet.
            </p>
          ) : (
            <>
              <div className="divide-y divide-[#d2d2d7]/60">
                {openDeliveryPage.map((delivery) => (
                  <PackageRequestRow
                    key={delivery.id}
                    delivery={delivery}
                    accepting={
                      acceptMutation.isPending &&
                      acceptMutation.variables?.deliveryId === delivery.id
                    }
                    declining={
                      declineMutation.isPending &&
                      declineMutation.variables === delivery.id
                    }
                    onAccept={(deliveryFee) =>
                      acceptMutation.mutate({
                        deliveryId: delivery.id,
                        deliveryFee,
                      })
                    }
                    onDecline={() => declineMutation.mutate(delivery.id)}
                    actionError={
                      (acceptMutation.variables?.deliveryId === delivery.id
                        ? (
                            acceptMutation.error as Error & {
                              response?: { data?: { message?: string } }
                            }
                          )?.response?.data?.message ||
                          acceptMutation.error?.message
                        : undefined) ||
                      (declineMutation.variables === delivery.id
                        ? (
                            declineMutation.error as Error & {
                              response?: { data?: { message?: string } }
                            }
                          )?.response?.data?.message ||
                          declineMutation.error?.message
                        : undefined)
                    }
                  />
                ))}
              </div>
              {showOpenDeliveryPagination && (
                <TablePagination
                  currentPage={openDeliveryPageNumber}
                  totalPages={openDeliveryTotalPages}
                  rangeStart={openDeliveryRangeStart}
                  rangeEnd={openDeliveryRangeEnd}
                  totalItems={openDeliveryTotalItems}
                  itemLabel="packages"
                  onPageChange={goToOpenDeliveryPage}
                />
              )}
            </>
          )
        ) : closedDeliveries.length === 0 ? (
          <p className="px-6 py-12 text-center text-[15px] text-[#86868b]">
            No cancelled or declined packages.
          </p>
        ) : (
          <>
            <div className="divide-y divide-[#d2d2d7]/60">
              {closedDeliveryPage.map((delivery) => (
                <PackageRequestRow
                  key={delivery.id}
                  delivery={delivery}
                  onAccept={() => undefined}
                  onDecline={() => undefined}
                />
              ))}
            </div>
            {showClosedDeliveryPagination && (
              <TablePagination
                currentPage={closedDeliveryPageNumber}
                totalPages={closedDeliveryTotalPages}
                rangeStart={closedDeliveryRangeStart}
                rangeEnd={closedDeliveryRangeEnd}
                totalItems={closedDeliveryTotalItems}
                itemLabel="packages"
                onPageChange={goToClosedDeliveryPage}
              />
            )}
          </>
        )}
      </AppleCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {pendingPassengers.length > 0 && (
            <AppleCard className="overflow-hidden">
              <div className="border-b border-[#d2d2d7]/60 px-6 py-4">
                <h2 className="text-[17px] font-semibold text-[#1d1d1f]">
                  Seat requests
                </h2>
                <p className="mt-1 text-[13px] text-[#86868b]">
                  Accept or decline passengers waiting for approval.
                </p>
              </div>
              <div className="divide-y divide-[#d2d2d7]/60">
                {pendingPassengers.map((passenger) => (
                  <SeatRequestRow
                    key={passenger.id}
                    passenger={passenger}
                    accepting={
                      acceptBookingMutation.isPending &&
                      acceptBookingMutation.variables === passenger.id
                    }
                    declining={
                      declineBookingMutation.isPending &&
                      declineBookingMutation.variables?.bookingId === passenger.id
                    }
                    onAccept={() => acceptBookingMutation.mutate(passenger.id)}
                    onDecline={(reason) =>
                      declineBookingMutation.mutate({
                        bookingId: passenger.id,
                        reason,
                      })
                    }
                    actionError={
                      (acceptBookingMutation.variables === passenger.id
                        ? (
                            acceptBookingMutation.error as Error & {
                              response?: { data?: { message?: string } }
                            }
                          )?.response?.data?.message ||
                          acceptBookingMutation.error?.message
                        : undefined) ||
                      (declineBookingMutation.variables?.bookingId === passenger.id
                        ? (
                            declineBookingMutation.error as Error & {
                              response?: { data?: { message?: string } }
                            }
                          )?.response?.data?.message ||
                          declineBookingMutation.error?.message
                        : undefined)
                    }
                  />
                ))}
              </div>
            </AppleCard>
          )}

          <AppleCard className="overflow-hidden">
            <div className="border-b border-[#d2d2d7]/60 px-6 py-4">
              <h2 className="text-[17px] font-semibold text-[#1d1d1f]">
                Confirmed passengers
              </h2>
              {showReachActions && (
                <p className="mt-1 text-[13px] text-[#86868b]">
                  Mark each passenger when they reach their destination. The trip
                  ends automatically when everyone has arrived.
                </p>
              )}
            </div>
            {confirmedPassengers.length === 0 ? (
              <p className="px-6 py-12 text-center text-[15px] text-[#86868b]">
                {pendingPassengerCount > 0
                  ? 'No confirmed passengers yet. Review seat requests above.'
                  : 'No passengers have booked this trip yet.'}
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left">
                    <thead>
                      <tr className="border-b border-[#d2d2d7]/60 bg-[#f5f5f7]/50">
                        {(showReachActions
                          ? ['Passenger', 'Seat', 'Destination', 'Status', '']
                          : ['Passenger', 'Seat', 'Contact', 'Reference']
                        ).map((head) => (
                          <th
                            key={head || 'action'}
                            className="px-6 py-3 text-[12px] font-medium text-[#86868b] uppercase"
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {passengerPage.map((passenger) => {
                        const reached = Boolean(passenger.destinationReachedAt)
                        const markingThis =
                          reachDestinationMutation.isPending &&
                          reachDestinationMutation.variables === passenger.id

                        return (
                          <tr
                            key={passenger.id}
                            className="border-b border-[#d2d2d7]/40 last:border-b-0"
                          >
                            <td className="px-6 py-4">
                              <p className="text-[15px] font-medium text-[#1d1d1f]">
                                {passenger.name}
                              </p>
                              {passenger.email && (
                                <p className="text-[13px] text-[#86868b]">
                                  {passenger.email}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4 text-[14px] font-medium text-[#1d1d1f]">
                              {passenger.seat ?? '-'}
                            </td>
                            {showReachActions ? (
                              <>
                                <td className="px-6 py-4 text-[14px] text-[#86868b]">
                                  {passenger.dropoffAddress?.trim() || '-'}
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={cn(
                                      'inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium',
                                      reached
                                        ? 'bg-[#f0fdf4] text-[#248a3d]'
                                        : 'bg-[#fff8eb] text-[#bf4800]',
                                    )}
                                  >
                                    {reached ? 'Reached' : 'On board'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {!reached && (
                                    <Button
                                      className="h-8 rounded-full bg-[#248a3d] px-4 text-[12px] font-normal hover:bg-[#1f7a35]"
                                      disabled={actionBusy}
                                      onClick={() =>
                                        reachDestinationMutation.mutate(
                                          passenger.id,
                                        )
                                      }
                                    >
                                      <MapPin className="size-3.5" />
                                      {markingThis
                                        ? 'Saving…'
                                        : 'Mark reached'}
                                    </Button>
                                  )}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-6 py-4 text-[14px] text-[#86868b]">
                                  {passenger.phone ?? '-'}
                                </td>
                                <td className="px-6 py-4 font-mono text-[13px] text-[#0066cc]">
                                  {passenger.reference ?? '-'}
                                </td>
                              </>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {reachDestinationMutation.isError && (
                  <p className="px-6 py-3 text-[13px] text-[#bf4800]">
                    Failed to mark destination reached. Try again.
                  </p>
                )}
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
        </div>

        <AppleCard className="p-6">
          <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Seat summary</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <SummaryStat label="Available" value={seatsAvailable} tone="available" />
            <SummaryStat label="Booked" value={seatsOccupied} tone="occupied" />
          </div>
          {pendingPassengerCount > 0 && (
            <p className="mt-4 text-[13px] text-[#bf4800]">
              {pendingPassengerCount} seat request
              {pendingPassengerCount === 1 ? '' : 's'} awaiting your approval.
            </p>
          )}

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
                          ? `Seat ${seat.label}: Available`
                          : `Seat ${seat.label}: Booked`
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

function SeatRequestRow({
  passenger,
  onAccept,
  onDecline,
  accepting,
  declining,
  actionError,
}: {
  passenger: DriverTripPassenger
  onAccept: () => void
  onDecline: (reason?: string) => void
  accepting?: boolean
  declining?: boolean
  actionError?: string
}) {
  const [reason, setReason] = useState('')
  const busy = Boolean(accepting || declining)

  return (
    <div className="px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-[#1d1d1f]">
            {passenger.name}
          </p>
          <p className="mt-1 text-[13px] text-[#86868b]">
            Seat {passenger.seat ?? '—'}
            {passenger.price ? ` · ${passenger.price}` : ''}
          </p>
          <div className="mt-3 space-y-1.5 text-[13px]">
            <p>
              <span className="text-[#86868b]">Pickup: </span>
              <span className="font-medium text-[#1d1d1f]">
                {passenger.pickupAddress?.trim() || '—'}
              </span>
            </p>
            <p>
              <span className="text-[#86868b]">Destination: </span>
              <span className="font-medium text-[#1d1d1f]">
                {passenger.dropoffAddress?.trim() || '—'}
              </span>
            </p>
          </div>
          {passenger.email && (
            <p className="mt-2 text-[13px] text-[#86868b]">{passenger.email}</p>
          )}
          {passenger.phone && (
            <p className="text-[13px] text-[#86868b]">{passenger.phone}</p>
          )}
          {passenger.reference && (
            <p className="mt-1 font-mono text-[12px] text-[#0066cc]">
              {passenger.reference}
            </p>
          )}
        </div>
        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-56">
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason for declining (optional)"
            maxLength={500}
            disabled={busy}
            className="min-h-20 resize-none border-[#d2d2d7] bg-white text-[13px] placeholder:text-[#86868b]"
          />
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              variant="ghost"
              className="h-9 rounded-full px-4 text-[13px] text-[#bf4800] hover:bg-[#bf4800]/10"
              disabled={busy}
              onClick={() => onDecline(reason.trim() || undefined)}
            >
              {declining ? 'Declining…' : 'Decline'}
            </Button>
            <Button
              className="h-9 rounded-full bg-[#248a3d] px-4 text-[13px] font-normal hover:bg-[#1f7a35]"
              disabled={busy}
              onClick={onAccept}
            >
              {accepting ? 'Accepting…' : 'Accept'}
            </Button>
          </div>
        </div>
      </div>
      {actionError && (
        <p className="mt-3 text-[13px] text-[#bf4800]">{actionError}</p>
      )}
    </div>
  )
}

function PackageRequestRow({
  delivery,
  onAccept,
  onDecline,
  accepting,
  declining,
  actionError,
}: {
  delivery: DriverTripDelivery
  onAccept: (deliveryFee: number) => void
  onDecline: () => void
  accepting?: boolean
  declining?: boolean
  actionError?: string
}) {
  const [deliveryFee, setDeliveryFee] = useState(
    String(delivery.suggestedFee ?? 80),
  )
  const [feeError, setFeeError] = useState<string | null>(null)

  const statusLabel =
    delivery.status === 'pending'
      ? 'Pending'
      : delivery.status === 'accepted'
        ? 'Accepted: awaiting payment'
        : delivery.status === 'confirmed'
          ? delivery.isPaid
            ? 'Paid'
            : delivery.paymentMethod === 'cash'
              ? 'Confirmed: cash due'
              : 'Confirmed'
          : delivery.status === 'picked_up'
            ? 'Picked up'
            : delivery.status === 'cancelled'
              ? 'Cancelled'
              : delivery.status === 'declined'
                ? 'Declined'
                : delivery.status

  const paymentLabel =
    delivery.paymentMethod === 'cash'
      ? delivery.isPaid
        ? 'Cash (collected)'
        : 'Cash on trip'
      : null

  const feeNumber = Number(deliveryFee)
  const platformFee = Number.isFinite(feeNumber)
    ? Math.round(feeNumber * 0.04)
    : 0
  const totalDue = Number.isFinite(feeNumber) ? feeNumber + platformFee : 0

  function handleAccept() {
    const fee = Math.floor(Number(deliveryFee))
    if (!Number.isFinite(fee) || fee < 1) {
      setFeeError('Enter a delivery fee of at least ₱1.')
      return
    }
    setFeeError(null)
    onAccept(fee)
  }

  return (
    <div className="px-6 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[13px] font-semibold text-[#0066cc]">
              {delivery.reference}
            </span>
            <span className="rounded-full bg-[#f5f5f7] px-2.5 py-0.5 text-[12px] font-medium text-[#1d1d1f]">
              {statusLabel}
            </span>
            {delivery.status !== 'pending' && (
              <span className="text-[13px] font-medium text-[#1d1d1f]">
                {delivery.price}
              </span>
            )}
          </div>
          <p className="text-[15px] font-semibold text-[#1d1d1f]">
            {delivery.packageLabel}
          </p>
          <p className="text-[14px] text-[#1d1d1f]">{delivery.description}</p>
          <p className="text-[13px] text-[#86868b]">
            {delivery.pickupAddress} → {delivery.dropoffAddress}
          </p>
          <p className="text-[13px] text-[#86868b]">
            Sender: {delivery.senderName}
            {delivery.senderPhone ? ` · ${delivery.senderPhone}` : ''}
          </p>
          <p className="text-[13px] text-[#86868b]">
            Receiver: {delivery.receiverName} · {delivery.receiverPhone}
          </p>
          {paymentLabel && (
            <p className="text-[13px] text-[#86868b]">
              Payment: {paymentLabel}
            </p>
          )}
          {delivery.specialInstructions && (
            <p className="text-[13px] text-[#86868b]">
              Note: {delivery.specialInstructions}
            </p>
          )}
        </div>
        {delivery.status === 'pending' && (
          <div className="w-full shrink-0 space-y-3 lg:w-56">
            <div className="space-y-1.5">
              <label
                htmlFor={`fee-${delivery.id}`}
                className="text-[12px] font-medium text-[#86868b]"
              >
                Your delivery fee (₱)
              </label>
              <input
                id={`fee-${delivery.id}`}
                type="number"
                min={1}
                step={1}
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#d2d2d7] bg-white px-3 text-base text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20"
              />
              <p className="text-[12px] text-[#86868b]">
                Suggested ₱{delivery.suggestedFee.toLocaleString()} · Sender
                pays ₱{totalDue.toLocaleString()} (incl. 4% fee)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-full border-[#d2d2d7] px-4 text-[13px]"
                disabled={accepting || declining}
                onClick={onDecline}
              >
                {declining ? 'Declining…' : 'Decline'}
              </Button>
              <Button
                type="button"
                className="h-9 flex-1 rounded-full bg-[#0071e3] px-4 text-[13px] hover:bg-[#0077ed]"
                disabled={accepting || declining}
                onClick={handleAccept}
              >
                {accepting ? 'Accepting…' : 'Accept'}
              </Button>
            </div>
          </div>
        )}
      </div>
      {(feeError || actionError) && (
        <p className="mt-2 text-[13px] text-[#bf4800]">
          {feeError || actionError}
        </p>
      )}
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
