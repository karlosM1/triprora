import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Clock3, Download } from 'lucide-react'
import { BookingStepper } from '@/components/booking/booking-stepper'
import { CheckoutFooter } from '@/components/booking/booking-footer'
import { AppleCard, PageHeader } from '@/components/layout/page-header'
import { Header } from '@/components/landing/header'
import { Button } from '@/components/ui/button'
import { loadVanBooking, vanBookingQueryOptions } from '@/lib/api/load-van-booking'
import { calculateTotals } from '@/lib/booking'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { requirePassenger } from '@/lib/route-guards'

export const Route = createFileRoute('/book/$vanId/confirmation')({
  validateSearch: (search: Record<string, unknown>) => ({
    seat: (search.seat as string) || '1A',
    name: (search.name as string) || 'Guest',
    ref: (search.ref as string) || '',
    pickupAddress: (search.pickupAddress as string) || '',
    dropoffAddress: (search.dropoffAddress as string) || '',
    paymentMethod: 'cash' as const,
  }),
  beforeLoad: async ({ params }) => {
    await requirePassenger(`/book/${params.vanId}/confirmation`)
  },
  loader: async ({ params }) => {
    return loadVanBooking(params.vanId)
  },
  component: ConfirmationPage,
})

function formatTripDate(departureDate?: string) {
  if (!departureDate) return '-'
  return new Date(`${departureDate}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function ConfirmationPage() {
  const { vanId } = Route.useParams()
  const { seat, name, ref, pickupAddress, dropoffAddress } =
    Route.useSearch()
  const bookingQuery = useQuery(vanBookingQueryOptions(vanId))
  const { van } = bookingQuery.data!

  const { total } = calculateTotals(van.price)
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
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#fff8eb]">
              <Clock3 className="size-8 text-[#bf4800]" strokeWidth={1.75} />
            </div>
            <PageHeader
              className="mt-6 justify-center text-center sm:flex-col sm:items-center"
              eyebrow="Awaiting approval"
              title="Request sent."
              subtitle={`Thank you, ${name}. Your seat request is waiting for the driver to accept it.`}
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <AppleCard className="p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <span className="text-[13px] text-[#86868b]">Booking reference</span>
                <span className="font-mono text-[15px] font-semibold text-[#0066cc]">
                  {ref || '-'}
                </span>
              </div>

              <dl className="mt-5 space-y-4">
                <Row label="Pickup" value={pickupAddress || van.departureLocation} />
                <Row label="Destination" value={dropoffAddress || van.arrivalLocation} />
                <Row label="Date" value={tripDate} />
                <Row label="Departure" value={van.departureTime} />
                <Row label="Seat" value={seat} />
                <Row label="Driver" value={driver?.name ?? van.operator} />
                {driver?.phone && <Row label="Driver phone" value={driver.phone} />}
                {van.plateNumber && <Row label="Plate no." value={van.plateNumber} />}
                <Row label="Vehicle" value={van.vehicleName ?? 'Van'} />
                <Row
                  label="Amount due"
                  value={`₱${total.toLocaleString()}`}
                  highlight
                />
                <Row label="Payment" value="Cash on trip (after approval)" />
              </dl>
            </AppleCard>
          </motion.div>

          <motion.p
            variants={fadeInUp}
            className="text-center text-[13px] leading-relaxed text-[#86868b]"
          >
            You’ll be notified when the driver accepts or declines your request.
            Your seat is held until then.
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
