import { Clock, Phone } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import type { VanResult } from '@/lib/vans'

export function DeliveryTripCard({
  result,
  pickupAddress,
  dropoffAddress,
}: {
  result: VanResult
  pickupAddress: string
  dropoffAddress: string
}) {
  return (
    <article className="rounded-2xl bg-white p-4 ring-1 ring-black/5 transition-shadow hover:shadow-md sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex shrink-0 gap-3 lg:w-36">
          <div className="flex flex-col items-center pt-1.5">
            <div className="size-2 rounded-full border-2 border-[#0071e3] bg-white" />
            <div className="my-1 w-px flex-1 border-l border-dashed border-[#d2d2d7]" />
            <div className="size-2 rounded-full bg-[#0071e3]" />
          </div>
          <div className="flex flex-col justify-between gap-6 py-0.5">
            <div>
              <p className="text-[24px] leading-none font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                {result.departureTime}
              </p>
              <p className="mt-1 text-[13px] text-[#86868b]">
                {result.departureLocation}
              </p>
            </div>
            <div>
              <p className="text-[24px] leading-none font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                {result.arrivalTime}
              </p>
              <p className="mt-1 text-[13px] text-[#86868b]">
                {result.arrivalLocation}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 lg:px-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-medium text-[#0066cc]">
              Package delivery
            </span>
            <span className="text-[12px] text-[#86868b]">·</span>
            <span className="flex items-center gap-1 text-[12px] text-[#86868b]">
              <Clock className="size-3" />
              {result.duration}
            </span>
          </div>
          <h3 className="mt-2 text-[17px] font-semibold text-[#1d1d1f]">
            {result.driver?.name ?? result.operator}
          </h3>
          {result.vehicleName && (
            <p className="mt-1 text-[13px] text-[#86868b]">
              {result.vehicleName}
              {result.plateNumber ? ` · ${result.plateNumber}` : ''}
            </p>
          )}
          {result.driver?.phone && (
            <p className="mt-1 flex items-center gap-1 text-[13px] text-[#86868b]">
              <Phone className="size-3" />
              {result.driver.phone}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-[#d2d2d7]/60 pt-5 lg:w-44 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
          <div className="lg:text-right">
            <p className="text-[12px] text-[#86868b]">Package delivery</p>
            <p className="text-[15px] font-medium text-[#1d1d1f]">
              Fare by type, size &amp; weight
            </p>
          </div>
          <Button
            className="h-10 rounded-full bg-[#0071e3] px-6 text-[14px] font-normal hover:bg-[#0077ed]"
            asChild
          >
            <Link
              to="/send-package/$vanId"
              params={{ vanId: result.id }}
              search={{
                pickupAddress,
                dropoffAddress,
              }}
            >
              Select trip
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
