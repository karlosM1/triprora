import { History } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HistoryBooking } from '@/lib/types/api'

type BookingHistoryTableProps = {
  bookings: HistoryBooking[]
}

export function BookingHistoryTable({ bookings }: BookingHistoryTableProps) {
  return (
    <section>
      <div className="flex items-center gap-2">
        <History className="size-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">Booking History</h2>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-5 py-3 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Date
                </th>
                <th className="px-5 py-3 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Route
                </th>
                <th className="px-5 py-3 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-foreground">
                      {booking.date}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Booking #{booking.reference}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-foreground">
                      {booking.route}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.tripType}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-foreground">
                    {booking.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function StatusBadge({ status }: { status: HistoryBooking['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
        status === 'completed' && 'bg-emerald-100 text-emerald-700',
        status === 'cancelled' && 'bg-red-100 text-red-600',
      )}
    >
      {status === 'completed' ? 'Completed' : 'Cancelled'}
    </span>
  )
}
