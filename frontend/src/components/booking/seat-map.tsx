import { AppleCard, SectionTitle } from '@/components/layout/page-header'
import { cn } from '@/lib/utils'
import type { Seat } from '@/lib/booking'

type SeatMapProps = {
  seats: Seat[]
  selectedSeatId: string
  onSelectSeat: (seatId: string) => void
}

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

const SEAT_CLASS = 'size-[64px] shrink-0'

export function SeatMap({ seats, selectedSeatId, onSelectSeat }: SeatMapProps) {
  const seatById = Object.fromEntries(seats.map((s) => [s.id, s]))
  const rows = groupSeatsByRow(seats)
  const frontSeat = rows.find(({ row }) => row === 1)?.seats[0]
  const passengerRows = rows.filter(({ row }) => row !== 1)

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
          'relative flex flex-col items-center justify-center rounded-xl transition-all',
          SEAT_CLASS,
          status === 'selected' &&
            'bg-[#0071e3] text-white shadow-sm ring-2 ring-[#0071e3]/30',
          status === 'available' &&
            'bg-[#f5f5f7] text-[#86868b] ring-1 ring-[#d2d2d7] hover:ring-[#0071e3]/50',
          status === 'occupied' &&
            'cursor-not-allowed bg-[#e8e8ed] text-[#86868b]/50 ring-1 ring-transparent',
        )}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
          <path d="M4 18v-5h16v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm2-7V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4H6zm4-5a1 1 0 0 0-1 1v1h2V7a1 1 0 0 0-1-1z" />
        </svg>
        <span className="mt-0.5 text-[12px] font-medium">{seat.label}</span>
      </button>
    )
  }

  return (
    <AppleCard className="p-6 sm:p-8">
      <SectionTitle
        title="Choose your seat"
        subtitle="Select any available seat — all seats are the same price."
      />

      <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#86868b]">
        <Legend color="bg-[#f5f5f7] ring-1 ring-[#d2d2d7]" label="Available" />
        <Legend color="bg-[#e8e8ed]" label="Occupied" />
        <Legend color="bg-[#0071e3]" label="Selected" />
      </div>

      <div className="mx-auto mt-8 w-fit rounded-2xl bg-[#f5f5f7] p-6 ring-1 ring-black/5 sm:p-8">
        <div className="mb-5 flex items-center justify-center gap-2.5 rounded-xl bg-white p-5 ring-1 ring-black/5">
          <div className={cn('flex items-center justify-center rounded-xl bg-[#f5f5f7] ring-1 ring-[#d2d2d7]', SEAT_CLASS)}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-[#86868b]">
              <path d="M4 18v-5h16v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm2-7V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4H6z" />
            </svg>
          </div>
          <div className={SEAT_CLASS} aria-hidden />
          <div className={SEAT_CLASS} aria-hidden />
          {frontSeat ? renderSeat(frontSeat) : <div className={SEAT_CLASS} aria-hidden />}
        </div>

        <div className="space-y-2.5">
          {passengerRows.map(({ row, seats: rowSeats }) => (
            <div key={row} className="flex justify-center gap-2.5">
              {rowSeats.map((seat) => renderSeat(seat))}
            </div>
          ))}
        </div>
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
