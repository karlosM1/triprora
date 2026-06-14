import { AppleCard, SectionTitle } from '@/components/layout/page-header'
import { cn } from '@/lib/utils'
import type { HistoryBooking } from '@/lib/types/api'

type BookingHistoryTableProps = {
  bookings: HistoryBooking[]
}

export function BookingHistoryTable({ bookings }: BookingHistoryTableProps) {
  return (
    <section>
      <SectionTitle title="Booking history" />

      <AppleCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-[#d2d2d7]/60 bg-[#f5f5f7]/50">
                <th className="px-6 py-3 text-[12px] font-medium text-[#86868b] uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-[12px] font-medium text-[#86868b] uppercase">
                  Route
                </th>
                <th className="px-6 py-3 text-[12px] font-medium text-[#86868b] uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-[12px] font-medium text-[#86868b] uppercase">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-[#d2d2d7]/40 last:border-b-0"
                >
                  <td className="px-6 py-4">
                    <p className="text-[15px] font-medium text-[#1d1d1f]">
                      {booking.date}
                    </p>
                    <p className="text-[13px] text-[#86868b]">
                      #{booking.reference}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[15px] font-medium text-[#1d1d1f]">
                      {booking.route}
                    </p>
                    <p className="text-[13px] text-[#86868b]">
                      {booking.tripType}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4 text-right text-[15px] font-medium text-[#1d1d1f]">
                    {booking.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AppleCard>
    </section>
  )
}

function StatusBadge({ status }: { status: HistoryBooking['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-[12px] font-medium',
        status === 'completed' && 'bg-[#f0fdf4] text-[#248a3d]',
        status === 'cancelled' && 'bg-[#fff2f2] text-[#bf4800]',
      )}
    >
      {status === 'completed' ? 'Completed' : 'Cancelled'}
    </span>
  )
}
