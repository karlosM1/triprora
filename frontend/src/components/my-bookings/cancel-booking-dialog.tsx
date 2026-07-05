import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import {
  bookingHistoryQueryKey,
  cancelBooking,
  upcomingBookingQueryKey,
} from '@/lib/api/bookings'
import { vanBookingQueryKey } from '@/lib/api/load-van-booking'
import { vanSeatsQueryKey, vansQueryKey } from '@/lib/api/vans'
import type { UpcomingBooking } from '@/lib/types/api'

type CancelBookingDialogProps = {
  booking: UpcomingBooking
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelBookingDialog({
  booking,
  open,
  onOpenChange,
}: CancelBookingDialogProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(booking.id),
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
      setError(null)
      onOpenChange(false)
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      setError(
        err.response?.data?.message ??
          'Unable to cancel your booking. Please try again.',
      )
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setError(null)
    onOpenChange(nextOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel booking?</AlertDialogTitle>
          <AlertDialogDescription>
            Your trip on {booking.date} at {booking.time} ({booking.route}) will
            be cancelled and your seat will be released. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className="rounded-xl bg-[#fef2f2] px-4 py-3 text-[14px] text-[#b42318] ring-1 ring-[#fecaca]">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelMutation.isPending}>
            Keep booking
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-[#bf4800] hover:bg-[#a63d00]"
            disabled={cancelMutation.isPending}
            onClick={(event) => {
              event.preventDefault()
              cancelMutation.mutate()
            }}
          >
            {cancelMutation.isPending ? 'Cancelling…' : 'Cancel booking'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
