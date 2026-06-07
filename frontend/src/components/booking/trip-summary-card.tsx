import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/booking'
import type { VanResult } from '@/lib/vans'

type TripSummaryCardProps = {
  van: VanResult
  vanId: string
  selectedSeat: string
  isPremium: boolean
  showProceed?: boolean
}

export function TripSummaryCard({
  van,
  vanId,
  selectedSeat,
  isPremium,
  showProceed = true,
}: TripSummaryCardProps) {
  const premiumFee = isPremium ? 150 : 0
  const total = van.price + premiumFee

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="text-base font-bold text-foreground">Trip Summary</h2>

      <div className="mt-5 flex gap-3">
        <div className="flex flex-col items-center">
          <div className="size-2.5 rounded-full bg-primary" />
          <div className="my-1 w-px flex-1 border-l border-dashed border-border" />
          <div className="size-2.5 rounded-full border-2 border-border bg-white" />
        </div>
        <div className="flex flex-1 flex-col justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              Departure
            </p>
            <p className="text-sm font-medium text-foreground">
              {van.departureLocation}
            </p>
            <p className="text-xs text-muted-foreground">
              Oct 24, 2024 • {van.departureTime} AM
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              Arrival
            </p>
            <p className="text-sm font-medium text-foreground">
              {van.arrivalLocation}
            </p>
            <p className="text-xs text-muted-foreground">
              Oct 24, 2024 • {van.arrivalTime} AM
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Selected Seat</span>
          <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-700">
            {selectedSeat}
            {isPremium ? ' (Premium)' : ''}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Vehicle Class</span>
          <span className="text-sm font-bold text-foreground">
            {van.operator}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-muted/50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Base Fare</span>
          <span className="text-foreground">{formatPrice(van.price)}</span>
        </div>
        {isPremium && (
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Premium Seat Selection</span>
            <span className="text-foreground">{formatPrice(premiumFee)}</span>
          </div>
        )}
        <div className="mt-3 flex justify-between border-t border-border pt-3">
          <span className="text-sm font-medium text-foreground">
            Total Amount
          </span>
          <span className="text-lg font-bold text-primary">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {showProceed && (
        <>
          <Button className="mt-5 w-full rounded-lg py-5" asChild>
            <Link
              to="/book/$vanId/checkout"
              params={{ vanId }}
              search={{ seat: selectedSeat }}
            >
              Proceed to Payment
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Secure checkout powered by Stripe. No hidden booking fees.
          </p>
        </>
      )}
    </div>
  )
}

export function ConciergeCard() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <img
        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face"
        alt=""
        className="size-10 rounded-full object-cover"
      />
      <p className="text-xs leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Need assistance?</span>{' '}
        Our concierge is online and ready to help with your booking.
      </p>
    </div>
  )
}
