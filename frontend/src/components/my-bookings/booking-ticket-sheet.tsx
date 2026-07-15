import { Download, Ticket } from 'lucide-react'
import { AppleCard } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { UpcomingBooking } from '@/lib/types/api'

type BookingTicketSheetProps = {
  booking: UpcomingBooking
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingTicketSheet({
  booking,
  open,
  onOpenChange,
}: BookingTicketSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-[#d2d2d7]/60 bg-[#f5f5f7] sm:max-w-md"
      >
        <SheetHeader className="border-b border-[#d2d2d7]/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#f0f7ff]">
              <Ticket className="size-5 text-[#0066cc]" strokeWidth={1.75} />
            </div>
            <div>
              <SheetTitle className="text-[19px] font-semibold text-[#1d1d1f]">
                Your ticket
              </SheetTitle>
              <SheetDescription className="text-[13px] text-[#86868b]">
                Present this reference when boarding.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          <AppleCard className="overflow-hidden">
            <img
              src={booking.image}
              alt={booking.route}
              className="aspect-[16/9] w-full object-cover object-center"
            />
            <div className="p-5">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <span className="text-[12px] font-medium text-[#86868b] uppercase">
                  Reference
                </span>
                <span className="font-mono text-[15px] font-semibold text-[#0066cc]">
                  {booking.reference}
                </span>
              </div>

              <dl className="mt-4 space-y-3.5">
                <TicketRow label="Route" value={booking.route} />
                <TicketRow label="Date" value={booking.date} />
                <TicketRow label="Departure" value={booking.time} />
                <TicketRow label="Seat" value={booking.seat} />
                <TicketRow label="Vehicle" value={booking.vehicle} />
                <TicketRow label="Pickup" value={booking.pickupAddress} />
                <TicketRow label="Destination" value={booking.dropoffAddress} />
                <TicketRow label="Total paid" value={booking.price} highlight />
              </dl>
            </div>
          </AppleCard>

          <p className="text-center text-[12px] leading-relaxed text-[#86868b]">
            Your driver will contact you before departure to confirm your exact
            pickup time and location.
          </p>

          <Button
            variant="outline"
            className="h-11 w-full rounded-full border-[#d2d2d7] text-[14px]"
            onClick={() => window.print()}
          >
            <Download className="size-4" />
            Download / print ticket
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function TicketRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between gap-4 text-[14px]">
      <dt className="text-[#86868b]">{label}</dt>
      <dd
        className={
          highlight
            ? 'text-right text-[16px] font-semibold text-[#1d1d1f]'
            : 'text-right font-medium text-[#1d1d1f]'
        }
      >
        {value}
      </dd>
    </div>
  )
}
