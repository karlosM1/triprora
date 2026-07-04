import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TripAddressForm } from '@/components/booking/trip-address-form'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  bookingHistoryQueryKey,
  upcomingBookingQueryKey,
  updateBooking,
} from '@/lib/api/bookings'
import { vanBookingQueryKey } from '@/lib/api/load-van-booking'
import { fetchVanSeats, vanSeatsQueryKey, vansQueryKey } from '@/lib/api/vans'
import type { TripAddresses } from '@/lib/booking'
import type { UpcomingBooking } from '@/lib/types/api'
import { cn } from '@/lib/utils'

type ModifyBookingSheetProps = {
  booking: UpcomingBooking
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModifyBookingSheet({
  booking,
  open,
  onOpenChange,
}: ModifyBookingSheetProps) {
  const queryClient = useQueryClient()
  const [addresses, setAddresses] = useState<TripAddresses>({
    pickupAddress: booking.pickupAddress,
    dropoffAddress: booking.dropoffAddress,
  })
  const [selectedSeat, setSelectedSeat] = useState(booking.seat)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setAddresses({
      pickupAddress: booking.pickupAddress,
      dropoffAddress: booking.dropoffAddress,
    })
    setSelectedSeat(booking.seat)
    setError(null)
  }, [booking, open])

  const seatsQuery = useQuery({
    queryKey: vanSeatsQueryKey(booking.routeCode),
    queryFn: () => fetchVanSeats(booking.routeCode),
    enabled: open,
  })

  const modifyMutation = useMutation({
    mutationFn: () =>
      updateBooking(booking.id, {
        seat: selectedSeat,
        pickupAddress: addresses.pickupAddress,
        dropoffAddress: addresses.dropoffAddress,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: upcomingBookingQueryKey })
      queryClient.invalidateQueries({ queryKey: bookingHistoryQueryKey })
      queryClient.invalidateQueries({ queryKey: vansQueryKey })
      queryClient.invalidateQueries({
        queryKey: vanBookingQueryKey(booking.routeCode),
      })
      queryClient.invalidateQueries({
        queryKey: vanSeatsQueryKey(booking.routeCode),
      })
      onOpenChange(false)
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      setError(
        err.response?.data?.message ??
          'Unable to update your booking. Please try again.',
      )
    },
  })

  const addressesValid =
    addresses.pickupAddress.trim().length >= 5 &&
    addresses.dropoffAddress.trim().length >= 5

  const hasChanges =
    selectedSeat !== booking.seat ||
    addresses.pickupAddress.trim() !== booking.pickupAddress ||
    addresses.dropoffAddress.trim() !== booking.dropoffAddress

  const seats = seatsQuery.data ?? []
  const selectableSeats = seats.filter(
    (seat) => seat.status === 'available' || seat.id === booking.seat,
  )

  function handleSave() {
    if (!addressesValid) {
      setError('Please enter valid pickup and destination addresses.')
      return
    }

    if (!hasChanges) {
      setError('No changes to save.')
      return
    }

    setError(null)
    modifyMutation.mutate()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-[#d2d2d7]/60 bg-[#f5f5f7] sm:max-w-lg"
      >
        <SheetHeader className="border-b border-[#d2d2d7]/60 pb-4">
          <SheetTitle className="text-[19px] font-semibold text-[#1d1d1f]">
            Modify booking
          </SheetTitle>
          <SheetDescription className="text-[13px] text-[#86868b]">
            Update your pickup, destination, or seat for {booking.route}.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-4">
          <TripAddressForm values={addresses} onChange={setAddresses} />

          <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f]">
              Change seat
            </h3>
            <p className="mt-1 text-[13px] text-[#86868b]">
              All seats are the same price.
            </p>

            {seatsQuery.isLoading ? (
              <p className="mt-4 text-[14px] text-[#86868b]">Loading seats...</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectableSeats.map((seat) => {
                  const isSelected = seat.id === selectedSeat
                  const isCurrent = seat.id === booking.seat

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() => setSelectedSeat(seat.id)}
                      className={cn(
                        'flex size-11 items-center justify-center rounded-xl text-[12px] font-medium transition-all',
                        isSelected
                          ? 'bg-[#0071e3] text-white ring-2 ring-[#0071e3]/30'
                          : 'bg-[#f5f5f7] text-[#86868b] ring-1 ring-[#d2d2d7] hover:ring-[#0071e3]/50',
                      )}
                    >
                      {seat.label}
                      {isCurrent && !isSelected ? (
                        <span className="sr-only"> (current)</span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-xl bg-[#fef2f2] px-4 py-3 text-[14px] text-[#b42318] ring-1 ring-[#fecaca]">
              {error}
            </p>
          )}
        </div>

        <SheetFooter className="border-t border-[#d2d2d7]/60">
          <Button
            className="h-11 w-full rounded-full bg-[#0071e3] text-[15px] font-medium hover:bg-[#0077ed]"
            onClick={handleSave}
            disabled={modifyMutation.isPending || !addressesValid || !hasChanges}
          >
            {modifyMutation.isPending ? 'Saving changes…' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
