import { Button } from '@/components/ui/button'
import { AppleCard, SectionTitle } from '@/components/layout/page-header'
import type { UpcomingBooking } from '@/lib/types/api'

type UpcomingTripCardProps = {
  booking: UpcomingBooking
}

export function UpcomingTripCard({ booking }: UpcomingTripCardProps) {
  return (
    <section>
      <SectionTitle
        title="Upcoming trip"
        action={
          <span className="rounded-full bg-[#f0f7ff] px-3 py-1 text-[12px] font-medium text-[#0066cc]">
            Confirmed
          </span>
        }
      />

      <AppleCard className="overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="relative aspect-16/10 shrink-0 lg:aspect-auto lg:w-72 xl:w-80">
            <img
              src={booking.image}
              alt={booking.route}
              className="size-full object-cover"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium tracking-wide text-white backdrop-blur-sm">
              {booking.routeCode}
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-between p-6 lg:p-8">
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
              <div className="flex shrink-0 gap-3">
                <Button
                  variant="ghost"
                  className="h-10 rounded-full px-5 text-[14px] text-[#0066cc] hover:bg-[#0071e3]/5"
                >
                  Modify
                </Button>
                <Button className="h-10 rounded-full bg-[#0071e3] px-5 text-[14px] font-normal hover:bg-[#0077ed]">
                  View ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppleCard>
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
