import { CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UpcomingBooking } from '@/lib/types/api'

type UpcomingTripCardProps = {
  booking: UpcomingBooking
}

export function UpcomingTripCard({ booking }: UpcomingTripCardProps) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Upcoming Trip</h2>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Confirmed
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col lg:flex-row">
          <div className="relative aspect-[16/10] shrink-0 lg:aspect-auto lg:w-72 xl:w-80">
            <img
              src={booking.image}
              alt={booking.route}
              className="size-full object-cover"
            />
            <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
              {booking.routeCode}
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-between p-5 lg:p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <DetailItem label="Date" value={booking.date} />
              <DetailItem label="Time" value={booking.time} />
              <DetailItem label="Seat" value={booking.seat} />
              <DetailItem label="Vehicle" value={booking.vehicle} />
            </div>

            <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {booking.route}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pickup: {booking.pickupAddress}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Drop-off: {booking.dropoffAddress}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  className="rounded-lg border-primary text-primary hover:bg-primary/5 hover:text-primary"
                >
                  Modify
                </Button>
                <Button className="rounded-lg px-5">View Ticket</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-foreground">{value}</p>
    </div>
  )
}
