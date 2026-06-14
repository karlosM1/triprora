import { Coffee, Plug, Snowflake, Wifi } from 'lucide-react'
import { AppleCard, SectionTitle } from '@/components/layout/page-header'
import { cn } from '@/lib/utils'
import type { Seat } from '@/lib/booking'

type SeatMapProps = {
  seats: Seat[]
  selectedSeatId: string
  onSelectSeat: (seatId: string) => void
}

const amenities = [
  { icon: Snowflake, label: 'Climate' },
  { icon: Wifi, label: 'Wi‑Fi' },
  { icon: Plug, label: '110V AC' },
  { icon: Coffee, label: 'Refreshments' },
]

function groupSeatsByRow(seats: Seat[]) {
  const rows = new Map<number, Seat[]>()

  for (const seat of seats) {
    const row = Number.parseInt(seat.label, 10)
    if (Number.isNaN(row)) continue
    const rowSeats = rows.get(row) ?? []
    rowSeats.push(seat)
    rows.set(row, rowSeats)
  }

  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([row, rowSeats]) => ({
      row,
      seats: rowSeats.sort((a, b) => a.label.localeCompare(b.label)),
    }))
}

export function SeatMap({ seats, selectedSeatId, onSelectSeat }: SeatMapProps) {
  const seatById = Object.fromEntries(seats.map((s) => [s.id, s]))
  const rows = groupSeatsByRow(seats)

  function getStatus(seatId: string): Seat['status'] {
    if (seatId === selectedSeatId) return 'selected'
    return seatById[seatId]?.status ?? 'occupied'
  }

  function renderSeat(seat: Seat) {
    const status = getStatus(seat.id)
    const isClickable = status !== 'occupied'

    return (
      <button
        key={seat.id}
        type="button"
        disabled={!isClickable}
        onClick={() => onSelectSeat(seat.id)}
        className={cn(
          'relative flex size-[52px] flex-col items-center justify-center rounded-xl transition-all',
          status === 'selected' &&
            'bg-[#0071e3] text-white shadow-sm ring-2 ring-[#0071e3]/30',
          status === 'available' &&
            'bg-[#f5f5f7] text-[#86868b] ring-1 ring-[#d2d2d7] hover:ring-[#0071e3]/50',
          status === 'occupied' &&
            'cursor-not-allowed bg-[#e8e8ed] text-[#86868b]/50 ring-1 ring-transparent',
        )}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
          <path d="M4 18v-5h16v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm2-7V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4H6zm4-5a1 1 0 0 0-1 1v1h2V7a1 1 0 0 0-1-1z" />
        </svg>
        <span className="mt-0.5 text-[10px] font-medium">{seat.label}</span>
      </button>
    )
  }

  return (
    <AppleCard className="p-6 sm:p-8">
      <SectionTitle
        title="Choose your seat"
        subtitle="Select an available seat. Premium seats include extra legroom."
      />

      <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#86868b]">
        <Legend color="bg-[#f5f5f7] ring-1 ring-[#d2d2d7]" label="Available" />
        <Legend color="bg-[#e8e8ed]" label="Occupied" />
        <Legend color="bg-[#0071e3]" label="Selected" />
      </div>

      <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-[#f5f5f7] p-6 ring-1 ring-black/5">
        <div className="mb-6 flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-black/5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#f5f5f7]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 text-[#86868b]">
              <path d="M4 18v-5h16v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm2-7V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4H6z" />
            </svg>
          </div>
          <span className="text-[11px] font-medium tracking-wide text-[#86868b] uppercase">
            Front
          </span>
        </div>

        <div className="space-y-3">
          {rows.map(({ row, seats: rowSeats }, index) => (
            <div
              key={row}
              className={cn(
                'flex items-center gap-3',
                rowSeats.length === 1 ? 'justify-start' : 'justify-center',
              )}
            >
              {rowSeats.map((seat) => renderSeat(seat))}
              {index === 0 && rowSeats.length === 1 && (
                <div className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-[#e8e8ed]/60">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-[#86868b]/40">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-8">
        {amenities.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <Icon className="size-5 text-[#86868b]" strokeWidth={1.75} />
            <span className="text-[11px] font-medium text-[#86868b]">{label}</span>
          </div>
        ))}
      </div>
    </AppleCard>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('size-3 rounded-full', color)} />
      {label}
    </span>
  )
}
