import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { BookingStepper } from '@/components/booking/booking-stepper'
import { CheckoutFooter } from '@/components/booking/booking-footer'
import { CheckoutHeader } from '@/components/booking/checkout-header'
import { CheckoutSummary } from '@/components/booking/checkout-summary'
import { PassengerForm } from '@/components/booking/passenger-form'
import { PaymentForm } from '@/components/booking/payment-form'
import { Button } from '@/components/ui/button'
import {
  bookingHistoryQueryKey,
  createBooking,
  upcomingBookingQueryKey,
} from '@/lib/api/bookings'
import { loadVanBooking } from '@/lib/api/load-van-booking'
import { vansQueryKey } from '@/lib/api/vans'
import type { PassengerDetails } from '@/lib/booking'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/book/$vanId/checkout')({
  validateSearch: (search: Record<string, unknown>) => ({
    seat: (search.seat as string) || '1A',
    pickupAddress: (search.pickupAddress as string) || '',
    dropoffAddress: (search.dropoffAddress as string) || '',
  }),
  beforeLoad: async ({ params, search }) => {
    const pickup = (search.pickupAddress as string) || ''
    const dropoff = (search.dropoffAddress as string) || ''
    await requireAuth(
      `/book/${params.vanId}/checkout?seat=${search.seat ?? '1A'}&pickupAddress=${encodeURIComponent(pickup)}&dropoffAddress=${encodeURIComponent(dropoff)}`,
    )
  },
  loader: async ({ params }) => {
    return loadVanBooking(params.vanId)
  },
  component: CheckoutPage,
})

const emptyPassenger: PassengerDetails = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
}

function CheckoutPage() {
  const { van, seats } = Route.useLoaderData()
  const { vanId } = Route.useParams()
  const { seat, pickupAddress, dropoffAddress } = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const selectedSeat = seats.find((s) => s.id === seat)
  const isPremium = selectedSeat?.premium ?? false

  const [passenger, setPassenger] = useState<PassengerDetails>(emptyPassenger)
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1)
  const [error, setError] = useState<string | null>(null)

  const addresses = { pickupAddress, dropoffAddress }

  const bookingMutation = useMutation({
    mutationFn: () =>
      createBooking({
        vanId,
        seat,
        pickupAddress,
        dropoffAddress,
      }),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: upcomingBookingQueryKey })
      queryClient.invalidateQueries({ queryKey: bookingHistoryQueryKey })
      queryClient.invalidateQueries({ queryKey: vansQueryKey })
      queryClient.invalidateQueries({ queryKey: ['vans', vanId] })

      navigate({
        to: '/book/$vanId/confirmation',
        params: { vanId },
        search: {
          seat,
          name: `${passenger.firstName} ${passenger.lastName}`.trim(),
          ref: booking.reference,
          pickupAddress,
          dropoffAddress,
        },
      })
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      setError(err.response?.data?.message ?? 'Failed to complete booking. Please try again.')
    },
  })

  function handleContinueToPayment() {
    setError(null)
    setCheckoutStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCompleteBooking() {
    setError(null)
    bookingMutation.mutate()
  }

  if (!pickupAddress.trim() || !dropoffAddress.trim()) {
    return (
      <div className="min-h-svh bg-[#F8F9FB]">
        <CheckoutHeader />
        <main className="mx-auto max-w-lg px-6 py-16 text-center lg:px-8">
          <h1 className="text-xl font-bold text-foreground">Addresses Required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please enter your pickup and destination addresses before checkout.
          </p>
          <Button className="mt-6 rounded-lg" asChild>
            <Link to="/book/$vanId" params={{ vanId }} search={{ seat }}>
              Back to booking
            </Link>
          </Button>
        </main>
        <CheckoutFooter />
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-[#F8F9FB]">
      <CheckoutHeader />
      <BookingStepper currentStep={checkoutStep === 1 ? 1 : 2} />

      <main className="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-5">
            <PassengerForm values={passenger} onChange={setPassenger} />

            {checkoutStep === 2 && <PaymentForm />}

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                {error}
              </p>
            )}

            {checkoutStep === 1 ? (
              <Button
                className="w-full rounded-lg py-5 text-base"
                onClick={handleContinueToPayment}
              >
                Continue to Payment
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                className="w-full rounded-lg py-5 text-base"
                onClick={handleCompleteBooking}
                disabled={bookingMutation.isPending}
              >
                {bookingMutation.isPending ? 'Processing...' : 'Complete Booking'}
                <ArrowRight className="size-4" />
              </Button>
            )}

            <p className="text-center text-xs text-muted-foreground">
              <Link
                to="/book/$vanId"
                params={{ vanId }}
                search={{ seat, pickupAddress, dropoffAddress }}
                className="text-primary hover:underline"
              >
                ← Back to seat selection
              </Link>
            </p>
          </div>

          <aside className="w-full shrink-0 lg:w-96">
            <CheckoutSummary van={van} isPremium={isPremium} addresses={addresses} />
          </aside>
        </div>
      </main>

      <CheckoutFooter />
    </div>
  )
}
