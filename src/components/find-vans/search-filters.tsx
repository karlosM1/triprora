import { useState } from 'react'
import { Button } from '@/components/ui/button'

const departureTimes = [
  { id: 'morning', label: 'Morning (06:00 - 12:00)' },
  { id: 'afternoon', label: 'Afternoon (12:00 - 18:00)' },
  { id: 'evening', label: 'Evening (18:00 - 00:00)' },
]

const vanTypes = [
  { id: 'standard', label: 'Standard (14-seater)' },
  { id: 'executive', label: 'Executive (9-seater)' },
  { id: 'luxury', label: 'Luxury (6-seater)' },
]

export function SearchFilters() {
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [priceMax, setPriceMax] = useState(2500)
  const [vanType, setVanType] = useState<string | null>(null)

  function toggleTime(id: string) {
    setSelectedTimes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    )
  }

  function resetFilters() {
    setSelectedTimes([])
    setPriceMax(2500)
    setVanType(null)
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="text-base font-bold text-foreground">Refine Search</h2>

      <div className="mt-5 space-y-5">
        <fieldset>
          <legend className="text-sm font-semibold text-foreground">
            Departure Time
          </legend>
          <div className="mt-3 space-y-2.5">
            {departureTimes.map((time) => (
              <label
                key={time.id}
                className="flex cursor-pointer items-center gap-2.5"
              >
                <input
                  type="checkbox"
                  checked={selectedTimes.includes(time.id)}
                  onChange={() => toggleTime(time.id)}
                  className="size-4 rounded border-border text-primary accent-primary"
                />
                <span className="text-sm text-muted-foreground">
                  {time.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-foreground">
            Price Range
          </legend>
          <div className="mt-3">
            <input
              type="range"
              min={500}
              max={2500}
              step={50}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>₱500</span>
              <span>₱2,500</span>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-foreground">
            Van Type
          </legend>
          <div className="mt-3 space-y-2.5">
            {vanTypes.map((type) => (
              <label
                key={type.id}
                className="flex cursor-pointer items-center gap-2.5"
              >
                <input
                  type="radio"
                  name="vanType"
                  checked={vanType === type.id}
                  onChange={() => setVanType(type.id)}
                  className="size-4 border-border text-primary accent-primary"
                />
                <span className="text-sm text-muted-foreground">
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <Button
        variant="outline"
        className="mt-6 w-full rounded-lg border-primary text-primary hover:bg-primary/5 hover:text-primary"
        onClick={resetFilters}
      >
        Reset All Filters
      </Button>
    </div>
  )
}

export function PriorityPassCard() {
  const promoImage =
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80&auto=format&fit=crop'

  return (
    <div className="relative overflow-hidden rounded-xl">
      <img
        src={promoImage}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-primary/95 via-primary/70 to-primary/40" />
      <div className="relative p-5">
        <p className="text-sm font-bold text-white">Priority Pass</p>
        <p className="mt-1 text-xs leading-relaxed text-white/85">
          Get 20% off your first 3 bookings this month.
        </p>
      </div>
    </div>
  )
}
