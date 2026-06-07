import { Clock } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { VanResult } from '@/lib/vans'

export function VanResultCard({ result }: { result: VanResult }) {
  const isLowAvailability = result.seatsLeft <= 5

  return (
    <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
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
        <div className="size-2 rounded-full border-2 border-primary bg-white" />
        <div className="my-1 w-px flex-1 border-l border-dashed border-muted-foreground/40" />
        <div className="size-2 rounded-full bg-primary" />
      </div>

      <div className="flex flex-col justify-between gap-6 py-0.5">
        <div>
          <p className="text-2xl leading-none font-bold text-foreground">
            {result.departureTime}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {result.departureLocation}
          </p>
        </div>
        <div>
          <p className="text-2xl leading-none font-bold text-foreground">
            {result.arrivalTime}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
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
        <span
          className={cn(
            'rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase',
            result.classVariant === 'executive'
              ? 'bg-primary/10 text-primary'
              : 'bg-sky-100 text-sky-700',
          )}
        >
          {result.classType}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {result.duration}
        </span>
      </div>

      <h3 className="mt-2 text-base font-bold text-foreground">
        {result.operator}
      </h3>

      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
        {result.amenities.map((amenity) => (
          <span
            key={amenity.label}
            className="flex items-center gap-1 text-xs text-muted-foreground"
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
    <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-border pt-4 lg:w-44 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
      <div className="lg:text-right">
        <p className="text-xs text-muted-foreground">Price starts at</p>
        <p className="text-2xl font-bold text-primary">
          ₱{price.toLocaleString()}
        </p>
        <p
          className={cn(
            'mt-0.5 text-xs font-medium',
            isLowAvailability ? 'text-red-600' : 'text-muted-foreground',
          )}
        >
          {isLowAvailability
            ? `${seatsLeft} seats left!`
            : `${seatsLeft} seats available`}
        </p>
      </div>
      <Button className="rounded-lg px-5" asChild>
        <Link to="/book/$vanId" params={{ vanId }} search={{ seat: '1A' }}>
          Select Seat
        </Link>
      </Button>
    </div>
  )
}
