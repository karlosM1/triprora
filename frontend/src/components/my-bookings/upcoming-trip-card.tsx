import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AppleCard, SectionTitle } from '@/components/layout/page-header'
import { BookingTicketSheet } from '@/components/my-bookings/booking-ticket-sheet'
import { CancelBookingDialog } from '@/components/my-bookings/cancel-booking-dialog'
import { ModifyBookingSheet } from '@/components/my-bookings/modify-booking-sheet'
import type { UpcomingBooking } from '@/lib/types/api'
import { cn } from '@/lib/utils'

type UpcomingTripCardProps = {
  booking: UpcomingBooking
}

export function UpcomingTripCard({ booking }: UpcomingTripCardProps) {
  const [ticketOpen, setTicketOpen] = useState(false)
  const [modifyOpen, setModifyOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const isPending = booking.status === 'pending'

  return (
    <section>
      <SectionTitle
        title={isPending ? 'Seat request' : 'Upcoming trip'}
        action={
          <span
            className={cn(
              'rounded-full px-3 py-1 text-[12px] font-medium',
              isPending
                ? 'bg-[#fff8eb] text-[#bf4800]'
                : 'bg-[#f0f7ff] text-[#0066cc]',
            )}
          >
            {isPending ? 'Awaiting driver' : 'Confirmed'}
          </span>
        }
      />

      <AppleCard className="overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="relative aspect-16/10 shrink-0 overflow-hidden lg:aspect-auto lg:w-72 xl:w-80">
            <img
              src={booking.image}
              alt={booking.route}
              className="size-full object-cover object-center"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium tracking-wide text-white backdrop-blur-sm">
              {booking.routeCode}
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-between p-6 lg:p-8">
            {isPending && (
              <p className="mb-5 text-[14px] text-[#86868b]">
                The driver still needs to accept this seat request. You’ll be
                notified when they decide.
              </p>
            )}
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <DetailItem label="Date" value={booking.date} />
              <DetailItem label="Time" value={booking.time} />
              <DetailItem label="Seat" value={booking.seat} />
              <DetailItem label="Vehicle" value={booking.vehicle} />
            </div>

            <div className="mt-6 flex flex-col gap-5 border-t border-[#d2d2d7]/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[19px] font-semibold text-[#1d1d1f]">
                  {booking.route}
                </h3>
                <p className="mt-1 text-[14px] text-[#86868b]">
                  Pickup: {booking.pickupAddress}
                </p>
                <p className="mt-0.5 text-[14px] text-[#86868b]">
                  Drop-off: {booking.dropoffAddress}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Button
                  variant="ghost"
                  className="h-10 rounded-full px-5 text-[14px] text-[#bf4800] hover:bg-[#bf4800]/5 disabled:text-[#86868b] disabled:hover:bg-transparent"
                  onClick={() => setCancelOpen(true)}
                  disabled={!booking.canCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="ghost"
                  className="h-10 rounded-full px-5 text-[14px] text-[#0066cc] hover:bg-[#0071e3]/5"
                  onClick={() => setModifyOpen(true)}
                >
                  Modify
                </Button>
                {!isPending && (
                  <Button
                    className="h-10 rounded-full bg-[#0071e3] px-5 text-[14px] font-normal hover:bg-[#0077ed]"
                    onClick={() => setTicketOpen(true)}
                  >
                    View ticket
                  </Button>
                )}
              </div>
              {!booking.canCancel && !isPending && (
                <p className="mt-3 text-[13px] text-[#86868b]">
                  Cancellations must be made at least 24 hours before pickup.
                </p>
              )}
            </div>
          </div>
        </div>
      </AppleCard>

      <BookingTicketSheet
        booking={booking}
        open={ticketOpen}
        onOpenChange={setTicketOpen}
      />
      <ModifyBookingSheet
        booking={booking}
        open={modifyOpen}
        onOpenChange={setModifyOpen}
      />
      <CancelBookingDialog
        booking={booking}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
    </section>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] font-medium text-[#86868b] uppercase">
        {label}
      </p>
      <p className="mt-1 text-[15px] font-semibold text-[#1d1d1f]">{value}</p>
    </div>
  )
}
