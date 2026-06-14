import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle2, Download, Home } from 'lucide-react'
import { BookingStepper } from '@/components/booking/booking-stepper'
import { CheckoutFooter } from '@/components/booking/booking-footer'
import { CheckoutHeader } from '@/components/booking/checkout-header'
import { Button } from '@/components/ui/button'
import { loadVanBooking } from '@/lib/api/load-van-booking'
import { calculateTotals } from '@/lib/booking'

export const Route = createFileRoute('/book/$vanId/confirmation')({
  validateSearch: (search: Record<string, unknown>) => ({
    seat: (search.seat as string) || '1A',
    name: (search.name as string) || 'Guest',
    ref: (search.ref as string) || '',
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
  const { seat, name, ref } = Route.useSearch()

  const selectedSeat = seats.find((s) => s.id === seat)
  const isPremium = selectedSeat?.premium ?? false
  const { total } = calculateTotals(van.price, isPremium)
  const tripDate = formatTripDate(van.departureDate)

  return (
    <div className="min-h-svh bg-[#F8F9FB]">
      <CheckoutHeader />
      <BookingStepper currentStep={3} />

      <main className="mx-auto max-w-lg px-6 py-12 text-center lg:px-8">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="size-8 text-primary" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-foreground">
          Booking Confirmed!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you, {name}. Your reservation has been successfully processed.
        </p>

        <div className="mt-8 rounded-xl bg-white p-6 text-left shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <span className="text-xs text-muted-foreground">Booking Reference</span>
            <span className="font-mono text-sm font-bold text-primary">
              {ref || '—'}
            </span>
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Route" value={`${van.departureLocation} → ${van.arrivalLocation}`} />
            <Row label="Date" value={tripDate} />
            <Row label="Departure" value={van.departureTime} />
            <Row label="Seat" value={`${seat}${isPremium ? ' (Premium)' : ''}`} />
            <Row label="Operator" value={van.operator} />
            <Row label="Total Paid" value={`₱${total.toLocaleString()}`} bold />
          </dl>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          A confirmation email has been sent to your registered email address.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" className="rounded-lg">
            <Download className="size-4" />
            Download Receipt
          </Button>
          <Button className="rounded-lg" asChild>
            <Link to="/my-bookings">
              <Home className="size-4" />
              View My Bookings
            </Link>
          </Button>
        </div>
      </main>

      <CheckoutFooter />
    </div>
  )
}

function Row({
  label,
  value,
  bold,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={bold ? 'font-bold text-primary' : 'font-medium text-foreground'}>
        {value}
      </dd>
    </div>
  )
}
