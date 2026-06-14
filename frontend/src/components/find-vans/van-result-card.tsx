import { Clock, Phone, User } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { VanResult } from '@/lib/vans'

export function VanResultCard({ result }: { result: VanResult }) {
  const isLowAvailability = result.seatsLeft <= 5

  return (
    <article className="rounded-2xl bg-white p-6 ring-1 ring-black/5 transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <ScheduleColumn result={result} />
        <DetailsColumn result={result} />
        <PricingColumn
          price={result.price}
          seatsLeft={result.seatsLeft}
          isLowAvailability={isLowAvailability}
          vanId={result.id}
        />
      </div>
    </article>
  )
}

function ScheduleColumn({ result }: { result: VanResult }) {
  return (
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
  )
}

function DetailsColumn({ result }: { result: VanResult }) {
  return (
    <div className="min-w-0 flex-1 lg:px-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-medium text-[#0066cc]">
          {result.classType}
        </span>
        <span className="text-[12px] text-[#86868b]">·</span>
        <span className="text-[12px] font-medium text-[#1d1d1f]">
          Door-to-door
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
      {result.driver?.licenseNo && (
        <p className="mt-0.5 flex items-center gap-1 text-[13px] text-[#86868b]">
          <User className="size-3" />
          License: {result.driver.licenseNo}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {result.amenities.map((amenity) => (
          <span
            key={amenity.label}
            className="flex items-center gap-1 text-[12px] text-[#86868b]"
          >
            <amenity.icon className="size-3 shrink-0" />
            {amenity.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function PricingColumn({
  price,
  seatsLeft,
  isLowAvailability,
  vanId,
}: {
  price: number
  seatsLeft: number
  isLowAvailability: boolean
  vanId: string
}) {
  return (
    <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-[#d2d2d7]/60 pt-5 lg:w-44 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
      <div className="lg:text-right">
        <p className="text-[12px] text-[#86868b]">From</p>
        <p className="text-[28px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
          ₱{price.toLocaleString()}
        </p>
        <p
          className={cn(
            'mt-0.5 text-[13px]',
            isLowAvailability ? 'font-medium text-[#bf4800]' : 'text-[#86868b]',
          )}
        >
          {isLowAvailability
            ? `${seatsLeft} seats left`
            : `${seatsLeft} seats available`}
        </p>
      </div>
      <Button
        className="h-10 rounded-full bg-[#0071e3] px-6 text-[14px] font-normal hover:bg-[#0077ed]"
        asChild
      >
        <Link to="/book/$vanId" params={{ vanId }} search={{ seat: '1A' }}>
          Select seat
        </Link>
      </Button>
    </div>
  )
}
