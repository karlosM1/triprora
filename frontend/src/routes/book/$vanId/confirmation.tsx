import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { CheckCircle2, Download } from 'lucide-react'
import { BookingStepper } from '@/components/booking/booking-stepper'
import { CheckoutFooter } from '@/components/booking/booking-footer'
import { AppleCard, PageHeader } from '@/components/layout/page-header'
import { Header } from '@/components/landing/header'
import { Button } from '@/components/ui/button'
import { loadVanBooking } from '@/lib/api/load-van-booking'
import { calculateTotals } from '@/lib/booking'
import { fadeInUp, staggerContainer } from '@/lib/motion'

export const Route = createFileRoute('/book/$vanId/confirmation')({
  validateSearch: (search: Record<string, unknown>) => ({
    seat: (search.seat as string) || '1A',
    name: (search.name as string) || 'Guest',
    ref: (search.ref as string) || '',
    pickupAddress: (search.pickupAddress as string) || '',
    dropoffAddress: (search.dropoffAddress as string) || '',
  }),
  loader: async ({ params }) => {
    return loadVanBooking(params.vanId)
  },
  component: ConfirmationPage,
})

function formatTripDate(departureDate?: string) {
  if (!departureDate) return '—'
  return new Date(`${departureDate}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function ConfirmationPage() {
  const { van, seats } = Route.useLoaderData()
  const { seat, name, ref, pickupAddress, dropoffAddress } = Route.useSearch()

  const selectedSeat = seats.find((s) => s.id === seat)
  const isPremium = selectedSeat?.premium ?? false
  const { total } = calculateTotals(van.price, isPremium)
  const tripDate = formatTripDate(van.departureDate)
  const driver = van.driver

  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="my-bookings" />

      <main className="mx-auto max-w-[980px] px-6 py-10 lg:px-8 lg:py-14">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mx-auto max-w-lg space-y-8"
        >
          <motion.div variants={fadeInUp}>
            <BookingStepper currentStep={3} />
          </motion.div>

          <motion.div variants={fadeInUp} className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#f0fdf4]">
              <CheckCircle2 className="size-8 text-[#248a3d]" strokeWidth={1.75} />
            </div>
            <PageHeader
              className="mt-6 justify-center text-center sm:flex-col sm:items-center"
              eyebrow="Confirmed"
              title="You're all set."
              subtitle={`Thank you, ${name}. Your door-to-door trip between Aurora and Metro Manila is booked.`}
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <AppleCard className="p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <span className="text-[13px] text-[#86868b]">Booking reference</span>
                <span className="font-mono text-[15px] font-semibold text-[#0066cc]">
                  {ref || '—'}
                </span>
              </div>

              <dl className="mt-5 space-y-4">
                <Row label="Pickup" value={pickupAddress || van.departureLocation} />
                <Row label="Destination" value={dropoffAddress || van.arrivalLocation} />
                <Row label="Date" value={tripDate} />
                <Row label="Departure" value={van.departureTime} />
                <Row
                  label="Seat"
                  value={`${seat}${isPremium ? ' (Premium)' : ''}`}
                />
                <Row label="Driver" value={driver?.name ?? van.operator} />
                {driver?.phone && <Row label="Driver phone" value={driver.phone} />}
                {van.plateNumber && <Row label="Plate no." value={van.plateNumber} />}
                <Row label="Vehicle" value={van.vehicleName ?? 'Van'} />
                <Row
                  label="Total paid"
                  value={`₱${total.toLocaleString()}`}
                  highlight
                />
              </dl>
            </AppleCard>
          </motion.div>

          <motion.p
            variants={fadeInUp}
            className="text-center text-[13px] leading-relaxed text-[#86868b]"
          >
            Your driver will contact you before departure to confirm your exact
            pickup time and location.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <Button
              variant="outline"
              className="h-11 rounded-full border-[#d2d2d7] px-6 text-[14px]"
            >
              <Download className="size-4" />
              Download receipt
            </Button>
            <Button
              className="h-11 rounded-full bg-[#0071e3] px-6 text-[14px] hover:bg-[#0077ed]"
              asChild
            >
              <Link to="/my-bookings">View my bookings</Link>
            </Button>
          </motion.div>
        </motion.div>
      </main>

      <CheckoutFooter />
    </div>
  )
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between gap-4 text-[14px]">
      <dt className="text-[#86868b]">{label}</dt>
      <dd
        className={
          highlight
            ? 'text-right text-[17px] font-semibold text-[#1d1d1f]'
            : 'text-right font-medium text-[#1d1d1f]'
        }
      >
        {value}
      </dd>
    </div>
  )
}
