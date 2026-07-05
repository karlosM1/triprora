import type { ReactNode } from 'react'
import { Car, CreditCard, MapPin, Navigation, Phone, Shield, User } from 'lucide-react'
import { AppleCard } from '@/components/layout/page-header'
import { calculateTotals, formatPrice } from '@/lib/booking'
import type { TripAddresses } from '@/lib/booking'
import type { VanResult } from '@/lib/vans'

const VAN_IMAGE =
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80&auto=format&fit=crop'

type CheckoutSummaryProps = {
  van: VanResult
  addresses?: TripAddresses
}

function formatTripDate(departureDate?: string) {
  if (!departureDate) return 'Date TBD'
  return new Date(`${departureDate}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function CheckoutSummary({ van, addresses }: CheckoutSummaryProps) {
  const { baseFare, serviceFee, tax, total } = calculateTotals(van.price)
  const tripDate = formatTripDate(van.departureDate)
  const driver = van.driver

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <AppleCard className="overflow-hidden">
        <div className="relative aspect-[16/10]">
          <img
            src={VAN_IMAGE}
            alt={van.vehicleName ?? van.operator}
            className="size-full object-cover"
          />
          <span className="absolute top-3 left-3 rounded-full bg-[#1d1d1f]/80 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            Door-to-door
          </span>
        </div>

        <div className="p-6">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f]">
            {van.vehicleName ?? 'Van'}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px] text-[#86868b]">
            <span>{van.totalSeats ?? 13} seats</span>
          </div>

          <div className="mt-5 space-y-3 rounded-xl bg-[#f5f5f7] p-4">
            <p className="text-[12px] font-medium text-[#86868b]">Driver</p>
            <DriverDetail icon={<User className="size-3.5" />} value={driver?.name ?? van.operator} />
            {driver?.phone && (
              <DriverDetail icon={<Phone className="size-3.5" />} value={driver.phone} />
            )}
            {driver?.licenseNo && (
              <DriverDetail icon={<CreditCard className="size-3.5" />} value={driver.licenseNo} />
            )}
            <DriverDetail
              icon={<Car className="size-3.5" />}
              value={van.vehicleName ?? driver?.vehicleInfo ?? 'Van'}
            />
            {van.plateNumber && (
              <DriverDetail icon={<Car className="size-3.5" />} value={van.plateNumber} />
            )}
          </div>

          <div className="mt-5 space-y-4">
            <LocationRow
              icon={<MapPin className="size-4 text-[#0066cc]" strokeWidth={1.75} />}
              label="Pickup"
              location={addresses?.pickupAddress.trim() || van.departureLocation}
              datetime={`${tripDate} · ${van.departureTime}`}
            />
            <LocationRow
              icon={<Navigation className="size-4 text-[#0066cc]" strokeWidth={1.75} />}
              label="Destination"
              location={addresses?.dropoffAddress.trim() || van.arrivalLocation}
              datetime={`Est. arrival ${van.arrivalTime}`}
            />
          </div>

          <div className="mt-5 rounded-xl bg-[#f5f5f7] p-4">
            <div className="flex justify-between text-[14px]">
              <span className="text-[#86868b]">Base fare</span>
              <span className="text-[#1d1d1f]">{formatPrice(baseFare)}</span>
            </div>
            <div className="mt-2 flex justify-between text-[14px]">
              <span className="text-[#86868b]">Service fee</span>
              <span className="text-[#1d1d1f]">{formatPrice(serviceFee)}</span>
            </div>
            <div className="mt-2 flex justify-between text-[14px]">
              <span className="text-[#86868b]">Tax (5%)</span>
              <span className="text-[#1d1d1f]">{formatPrice(tax)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-[#d2d2d7] pt-3">
              <span className="text-[15px] font-medium text-[#1d1d1f]">Total</span>
              <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>
      </AppleCard>

      <AppleCard className="flex gap-3 p-4">
        <Shield className="size-5 shrink-0 text-[#0066cc]" strokeWidth={1.75} />
        <p className="text-[13px] leading-relaxed text-[#86868b]">
          Protected by{' '}
          <span className="font-medium text-[#1d1d1f]">Flexi-Cancel</span> — cancel
          free up to 24 hours before pickup.
        </p>
      </AppleCard>
    </div>
  )
}

function DriverDetail({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[14px]">
      <span className="text-[#86868b]">{icon}</span>
      <span className="font-medium text-[#1d1d1f]">{value}</span>
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
        <p className="text-[12px] font-medium text-[#86868b]">{label}</p>
        <p className="text-[14px] font-medium text-[#1d1d1f]">{location}</p>
        <p className="text-[12px] text-[#86868b]">{datetime}</p>
      </div>
    </div>
  )
}
