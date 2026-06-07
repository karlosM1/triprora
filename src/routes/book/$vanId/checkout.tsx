import { useState } from 'react'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { BookingStepper } from '@/components/booking/booking-stepper'
import { CheckoutFooter } from '@/components/booking/booking-footer'
import { CheckoutHeader } from '@/components/booking/checkout-header'
import { CheckoutSummary } from '@/components/booking/checkout-summary'
import { PassengerForm } from '@/components/booking/passenger-form'
import { PaymentForm } from '@/components/booking/payment-form'
import { Button } from '@/components/ui/button'
import { defaultSeats, getVanById, type PassengerDetails } from '@/lib/booking'

export const Route = createFileRoute('/book/$vanId/checkout')({
  validateSearch: (search: Record<string, unknown>) => ({
    seat: (search.seat as string) || '1A',
  }),
  loader: ({ params }) => {
    const van = getVanById(params.vanId)
    if (!van) throw redirect({ to: '/find-vans' })
    return { van }
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
  const { van } = Route.useLoaderData()
  const { vanId } = Route.useParams()
  const { seat } = Route.useSearch()
  const navigate = useNavigate()

  const selectedSeat = defaultSeats.find((s) => s.id === seat)
  const isPremium = selectedSeat?.premium ?? false

  const [passenger, setPassenger] = useState<PassengerDetails>(emptyPassenger)
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1)

  function handleContinueToPayment() {
    setCheckoutStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCompleteBooking() {
    navigate({
      to: '/book/$vanId/confirmation',
      params: { vanId },
      search: { seat, name: `${passenger.firstName} ${passenger.lastName}`.trim() },
    })
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
              >
                Complete Booking
                <ArrowRight className="size-4" />
              </Button>
            )}

            <p className="text-center text-xs text-muted-foreground">
              <Link
                to="/book/$vanId"
                params={{ vanId }}
                search={{ seat }}
                className="text-primary hover:underline"
              >
                ← Back to seat selection
              </Link>
            </p>
          </div>

          <aside className="w-full shrink-0 lg:w-96">
            <CheckoutSummary van={van} isPremium={isPremium} />
          </aside>
        </div>
      </main>

      <CheckoutFooter />
    </div>
  )
}
