import type { ReactNode } from 'react'
import { MapPin, Navigation, Shield, Snowflake, Star, Wifi } from 'lucide-react'
import { calculateTotals, formatPrice } from '@/lib/booking'
import type { VanResult } from '@/lib/vans'

const VAN_IMAGE =
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80&auto=format&fit=crop'

type CheckoutSummaryProps = {
  van: VanResult
  isPremium: boolean
}

export function CheckoutSummary({ van, isPremium }: CheckoutSummaryProps) {
  const { baseFare, premiumFee, serviceFee, tax, total } = calculateTotals(
    van.price,
    isPremium,
  )

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="relative aspect-[16/10]">
          <img
            src={VAN_IMAGE}
            alt={van.operator}
            className="size-full object-cover"
          />
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-white">
            <Star className="size-3 fill-white" />
            Premium Executive
          </span>
        </div>

        <div className="p-5">
          <h3 className="text-base font-bold text-foreground">{van.operator}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>12 Seats</span>
            <span className="flex items-center gap-1">
              <Wifi className="size-3" /> WiFi
            </span>
            <span className="flex items-center gap-1">
              <Snowflake className="size-3" /> AC
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <LocationRow
              icon={<MapPin className="size-4 text-primary" />}
              label="Pickup"
              location={van.departureLocation}
              datetime={`Oct 24, 2024 • ${van.departureTime} AM`}
            />
            <LocationRow
              icon={<Navigation className="size-4 text-primary" />}
              label="Destination"
              location={van.arrivalLocation}
              datetime={`Oct 24, 2024 • ${van.arrivalTime} AM`}
            />
          </div>

          <div className="mt-5 rounded-lg bg-sky-50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Fare</span>
              <span>{formatPrice(baseFare)}</span>
            </div>
            {isPremium && (
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Premium Seat</span>
                <span>{formatPrice(premiumFee)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Service Fee</span>
              <span>{formatPrice(serviceFee)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (5%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-sky-100 pt-3">
              <span className="font-semibold text-foreground">Total Price</span>
              <span className="text-lg font-bold text-foreground">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 rounded-lg bg-sky-50 p-4">
        <Shield className="size-5 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Your reservation is protected by our{' '}
          <span className="font-semibold text-foreground">Flexi-Cancel</span>{' '}
          policy. Cancel for free up to 24 hours before pickup.
        </p>
      </div>
    </div>
  )
}

function LocationRow({
  icon,
  label,
  location,
  datetime,
}: {
  icon: ReactNode
  label: string
  location: string
  datetime: string
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground">{location}</p>
        <p className="text-xs text-muted-foreground">{datetime}</p>
      </div>
    </div>
  )
}
