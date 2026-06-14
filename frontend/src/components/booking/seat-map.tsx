import { Coffee, Plug, Snowflake, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Seat } from '@/lib/booking'

type SeatMapProps = {
  seats: Seat[]
  selectedSeatId: string
  onSelectSeat: (seatId: string) => void
}

const amenities = [
  { icon: Snowflake, label: 'Climate' },
  { icon: Wifi, label: 'High-Speed' },
  { icon: Plug, label: '110V AC' },
  { icon: Coffee, label: 'Mini Bar' },
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
          'relative flex size-14 flex-col items-center justify-center rounded-lg border-2 transition-colors',
          status === 'selected' &&
            'border-primary bg-primary/5 text-primary',
          status === 'available' &&
            'border-border bg-white text-muted-foreground hover:border-primary/50',
          status === 'occupied' &&
            'cursor-not-allowed border-transparent bg-muted text-muted-foreground/50',
        )}
      >
        {status === 'selected' && (
          <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {seat.label}
          </span>
        )}
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
          aria-hidden
        >
          <path d="M4 18v-5h16v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm2-7V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4H6zm4-5a1 1 0 0 0-1 1v1h2V7a1 1 0 0 0-1-1z" />
        </svg>
        {status !== 'selected' && (
          <span className="mt-0.5 text-[10px] font-medium">{seat.label}</span>
        )}
      </button>
    )
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <Legend color="bg-muted" label="Available" />
        <Legend color="bg-muted-foreground/30" label="Occupied" />
        <Legend color="bg-primary" label="Selected" />
      </div>

      <div className="mx-auto mt-8 max-w-sm rounded-2xl border-2 border-border/60 bg-muted/20 p-6">
        <div className="mb-6 flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-muted-foreground">
              <path d="M4 18v-5h16v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm2-7V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4H6z" />
            </svg>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Cockpit
          </div>
        </div>

        <div className="space-y-4">
          {rows.map(({ row, seats: rowSeats }, index) => (
            <div
              key={row}
              className={cn(
                'flex items-center gap-4',
                rowSeats.length === 1 ? 'justify-start' : 'justify-center',
              )}
            >
              {rowSeats.map((seat) => renderSeat(seat))}
              {index === 0 && rowSeats.length === 1 && (
                <div className="flex h-14 flex-1 items-center justify-center rounded-lg bg-muted/80">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 text-muted-foreground/40">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-6">
        {amenities.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <Icon className="size-5 text-primary" />
            <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('size-3 rounded-sm', color)} />
      {label}
    </span>
  )
}
