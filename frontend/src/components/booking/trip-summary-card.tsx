import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { AppleCard } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/booking'
import type { TripAddresses } from '@/lib/booking'
import type { VanResult } from '@/lib/vans'

type TripSummaryCardProps = {
  van: VanResult
  vanId: string
  selectedSeat: string
  addresses?: TripAddresses
  addressesValid?: boolean
  onAddressError?: () => void
  showProceed?: boolean
}

function formatTripDate(departureDate?: string) {
  if (!departureDate) return 'Date TBD'
  return new Date(`${departureDate}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function TripSummaryCard({
  van,
  vanId,
  selectedSeat,
  addresses,
  addressesValid = true,
  onAddressError,
  showProceed = true,
}: TripSummaryCardProps) {
  const total = van.price
  const tripDate = formatTripDate(van.departureDate)

  function handleProceedClick(event: React.MouseEvent) {
    if (!addressesValid) {
      event.preventDefault()
      onAddressError?.()
    }
  }

  return (
    <AppleCard className="p-6">
      <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Trip summary</h2>

      <div className="mt-5 flex gap-3">
        <div className="flex flex-col items-center pt-1">
          <div className="size-2.5 rounded-full bg-[#0071e3]" />
          <div className="my-1 w-px flex-1 border-l border-dashed border-[#d2d2d7]" />
          <div className="size-2.5 rounded-full border-2 border-[#d2d2d7] bg-white" />
        </div>
        <div className="flex flex-1 flex-col justify-between gap-5">
          <div>
            <p className="text-[12px] font-medium text-[#86868b]">Pickup</p>
            <p className="text-[15px] font-medium text-[#1d1d1f]">
              {addresses?.pickupAddress.trim() || van.departureLocation}
            </p>
            <p className="mt-0.5 text-[13px] text-[#86868b]">
              {tripDate} · Departs {van.departureTime}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#86868b]">Destination</p>
            <p className="text-[15px] font-medium text-[#1d1d1f]">
              {addresses?.dropoffAddress.trim() || van.arrivalLocation}
            </p>
            <p className="mt-0.5 text-[13px] text-[#86868b]">
              Est. arrival {van.arrivalTime} · {van.duration}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-black/5 pt-5">
        <SummaryRow label="Seat">
          <span className="inline-flex rounded-full bg-[#f0f7ff] px-3 py-1 text-[12px] font-medium text-[#0066cc]">
            {selectedSeat}
          </span>
        </SummaryRow>
        <SummaryRow label="Driver" value={van.driver?.name ?? van.operator} />
        {van.plateNumber && (
          <SummaryRow label="Plate no." value={van.plateNumber} />
        )}
      </div>

      <div className="mt-5 rounded-xl bg-[#f5f5f7] p-4">
        <div className="flex justify-between text-[14px]">
          <span className="text-[#86868b]">Base fare</span>
          <span className="text-[#1d1d1f]">{formatPrice(van.price)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-[#d2d2d7] pt-3">
          <span className="text-[15px] font-medium text-[#1d1d1f]">Total</span>
          <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {showProceed && (
        <>
          <Button
            className="mt-5 h-12 w-full rounded-full bg-[#0071e3] text-[15px] font-medium hover:bg-[#0077ed]"
            asChild
          >
            <Link
              to="/book/$vanId/checkout"
              params={{ vanId }}
              search={{
                seat: selectedSeat,
                pickupAddress: addresses?.pickupAddress ?? '',
                dropoffAddress: addresses?.dropoffAddress ?? '',
              }}
              onClick={handleProceedClick}
            >
              Continue to payment
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <p className="mt-3 text-center text-[12px] text-[#86868b]">
            Secure checkout. No hidden fees.
          </p>
        </>
      )}
    </AppleCard>
  )
}

function SummaryRow({
  label,
  value,
  children,
}: {
  label: string
  value?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[14px] text-[#86868b]">{label}</span>
      {children ?? (
        <span className="text-[14px] font-medium text-[#1d1d1f]">{value}</span>
      )}
    </div>
  )
}

export function ConciergeCard() {
  return (
    <AppleCard className="flex items-center gap-3 p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f0f7ff] text-[13px] font-semibold text-[#0066cc]">
        TP
      </div>
      <p className="text-[13px] leading-relaxed text-[#86868b]">
        <span className="font-medium text-[#1d1d1f]">Need help?</span> Contact
        your driver after booking for pickup coordination.
      </p>
    </AppleCard>
  )
}
