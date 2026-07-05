import {
  DEFAULT_VAN_SIDEBAR_FILTERS,
  VAN_PRICE_FILTER_MAX,
  VAN_PRICE_FILTER_MIN,
  type DepartureTimeFilter,
  type VanSidebarFilters,
} from '@/lib/trip-search'
import { AppleCard } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'

const departureTimes: { id: DepartureTimeFilter; label: string }[] = [
  { id: 'morning', label: 'Morning (06:00 – 12:00)' },
  { id: 'afternoon', label: 'Afternoon (12:00 – 18:00)' },
  { id: 'evening', label: 'Evening (18:00 – 00:00)' },
]

type SearchFiltersProps = {
  filters: VanSidebarFilters
  onChange: (filters: VanSidebarFilters) => void
}

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  function toggleTime(id: DepartureTimeFilter) {
    onChange({
      ...filters,
      departureTimes: filters.departureTimes.includes(id)
        ? filters.departureTimes.filter((time) => time !== id)
        : [...filters.departureTimes, id],
    })
  }

  function resetFilters() {
    onChange(DEFAULT_VAN_SIDEBAR_FILTERS)
  }

  return (
    <AppleCard className="p-5">
      <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Filters</h2>

      <div className="mt-5 space-y-6">
        <fieldset>
          <legend className="text-[13px] font-medium text-[#1d1d1f]">
            Departure time
          </legend>
          <div className="mt-3 space-y-3">
            {departureTimes.map((time) => (
              <label
                key={time.id}
                className="flex cursor-pointer items-center gap-3"
              >
                <input
                  type="checkbox"
                  checked={filters.departureTimes.includes(time.id)}
                  onChange={() => toggleTime(time.id)}
                  className="size-4 rounded border-[#d2d2d7] text-[#0071e3] accent-[#0071e3]"
                />
                <span className="text-[14px] text-[#86868b]">{time.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[13px] font-medium text-[#1d1d1f]">
            Price range
          </legend>
          <div className="mt-3">
            <input
              type="range"
              min={VAN_PRICE_FILTER_MIN}
              max={VAN_PRICE_FILTER_MAX}
              step={50}
              value={filters.priceMax}
              onChange={(event) =>
                onChange({
                  ...filters,
                  priceMax: Number(event.target.value),
                })
              }
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#d2d2d7] accent-[#0071e3] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0071e3]"
            />
            <div className="mt-2 flex justify-between text-[12px] text-[#86868b]">
              <span>₱{VAN_PRICE_FILTER_MIN.toLocaleString()}</span>
              <span className="font-medium text-[#1d1d1f]">
                up to ₱{filters.priceMax.toLocaleString()}
              </span>
              <span>₱{VAN_PRICE_FILTER_MAX.toLocaleString()}</span>
            </div>
          </div>
        </fieldset>
      </div>

      <Button
        variant="ghost"
        className="mt-6 h-10 w-full rounded-full text-[14px] text-[#0066cc] hover:bg-[#0071e3]/5 hover:text-[#0077ed]"
        onClick={resetFilters}
      >
        Reset filters
      </Button>
    </AppleCard>
  )
}

export function PriorityPassCard() {
  const promoImage =
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80&auto=format&fit=crop'

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <img
        src={promoImage}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20" />
      <div className="relative p-5">
        <p className="text-[13px] font-medium tracking-wide text-white/70 uppercase">
          Offer
        </p>
        <p className="mt-1 text-[17px] font-semibold text-white">Priority Pass</p>
        <p className="mt-1 text-[13px] leading-relaxed text-white/80">
          Get 20% off your first 3 bookings this month.
        </p>
      </div>
    </div>
  )
}
