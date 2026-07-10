import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { BookingStepper } from '@/components/booking/booking-stepper'
import { CheckoutFooter } from '@/components/booking/booking-footer'
import { CheckoutSummary } from '@/components/booking/checkout-summary'
import { PassengerForm } from '@/components/booking/passenger-form'
import {
  PaymentForm,
  type CheckoutPaymentMethod,
} from '@/components/booking/payment-form'
import { PageHeader } from '@/components/layout/page-header'
import { Header } from '@/components/landing/header'
import { Button } from '@/components/ui/button'
import {
  bookingHistoryQueryKey,
  createBooking,
  upcomingBookingQueryKey,
} from '@/lib/api/bookings'
import { loadVanBooking, vanBookingQueryKey, vanBookingQueryOptions } from '@/lib/api/load-van-booking'
import { vansQueryKey } from '@/lib/api/vans'
import type { PassengerDetails } from '@/lib/booking'
import { fadeInUp, staggerContainer } from '@/lib/motion'
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
  const { vanId } = Route.useParams()
  const { seat, pickupAddress, dropoffAddress } = Route.useSearch()
  const bookingQuery = useQuery(vanBookingQueryOptions(vanId))
  const { van } = bookingQuery.data!
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [passenger, setPassenger] = useState<PassengerDetails>(emptyPassenger)
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('qrph')
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [paymentReady, setPaymentReady] = useState(false)

  const addresses = { pickupAddress, dropoffAddress }

  const bookingMutation = useMutation({
    mutationFn: () => {
      if (paymentMethod === 'qrph' && !paymentIntentId) {
        throw new Error('Payment is required before completing booking.')
      }
      return createBooking({
        vanId,
        seat,
        pickupAddress,
        dropoffAddress,
        paymentMethod,
        ...(paymentMethod === 'qrph' && paymentIntentId
          ? { paymentIntentId }
          : {}),
      })
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: upcomingBookingQueryKey })
      queryClient.invalidateQueries({ queryKey: bookingHistoryQueryKey })
      queryClient.invalidateQueries({ queryKey: vansQueryKey })
      queryClient.invalidateQueries({ queryKey: vanBookingQueryKey(vanId) })

      navigate({
        to: '/book/$vanId/confirmation',
        params: { vanId },
        search: {
          seat,
          name: `${passenger.firstName} ${passenger.lastName}`.trim(),
          ref: booking.reference,
          pickupAddress,
          dropoffAddress,
          paymentMethod,
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
    if (!paymentReady) {
      setError(
        paymentMethod === 'cash'
          ? 'Please select cash payment before continuing.'
          : 'Please complete QR Ph payment before continuing.',
      )
      return
    }
    if (paymentMethod === 'qrph' && !paymentIntentId) {
      setError('Please complete QR Ph payment before continuing.')
      return
    }
    setError(null)
    bookingMutation.mutate()
  }

  if (!pickupAddress.trim() || !dropoffAddress.trim()) {
    return (
      <div className="app-page min-h-svh bg-[#f5f5f7]">
        <Header activeLink="find-vans" />
        <main className="mx-auto max-w-[980px] px-6 py-16 text-center lg:px-8">
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
            Addresses required
          </h1>
          <p className="mt-2 text-[15px] text-[#86868b]">
            Please enter your pickup and destination addresses before checkout.
          </p>
          <Button
            className="mt-6 rounded-full bg-[#0071e3] px-6 hover:bg-[#0077ed]"
            asChild
          >
            <Link
              to="/book/$vanId"
              params={{ vanId }}
              search={{ seat, pickupAddress, dropoffAddress }}
            >
              Back to booking
            </Link>
          </Button>
        </main>
        <CheckoutFooter />
      </div>
    )
  }

  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="find-vans" />

      <main className="mx-auto max-w-[980px] px-6 py-10 lg:px-8 lg:py-14">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-8"
        >
          <motion.div variants={fadeInUp} className="space-y-6">
            <PageHeader
              eyebrow="Checkout"
              title={checkoutStep === 1 ? 'Review your details' : 'Complete payment'}
              subtitle="Secure checkout for your door-to-door van trip."
            />
            <BookingStepper currentStep={checkoutStep === 1 ? 1 : 2} />
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col gap-8 lg:flex-row lg:items-start"
          >
            <div className="min-w-0 flex-1 space-y-5">
              <PassengerForm values={passenger} onChange={setPassenger} />

              {checkoutStep === 2 && (
                <PaymentForm
                  baseFare={van.price}
                  onPaymentChange={({
                    paymentMethod: method,
                    paymentIntentId: id,
                    ready,
                  }) => {
                    setPaymentMethod(method)
                    setPaymentIntentId(id)
                    setPaymentReady(ready)
                  }}
                />
              )}

              {error && (
                <p className="rounded-xl bg-[#fef2f2] px-4 py-3 text-[14px] text-[#b42318] ring-1 ring-[#fecaca]">
                  {error}
                </p>
              )}

              {checkoutStep === 1 ? (
                <Button
                  className="h-12 w-full rounded-full bg-[#0071e3] text-[15px] font-medium hover:bg-[#0077ed]"
                  onClick={handleContinueToPayment}
                >
                  Continue to payment
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  className="h-12 w-full rounded-full bg-[#0071e3] text-[15px] font-medium hover:bg-[#0077ed]"
                  onClick={handleCompleteBooking}
                  disabled={bookingMutation.isPending || !paymentReady}
                >
                  {bookingMutation.isPending
                    ? 'Processing…'
                    : paymentReady
                      ? 'Complete booking'
                      : 'Waiting for payment…'}
                  <ArrowRight className="size-4" />
                </Button>
              )}

              <p className="text-center text-[13px] text-[#86868b]">
                <Link
                  to="/book/$vanId"
                  params={{ vanId }}
                  search={{ seat, pickupAddress, dropoffAddress }}
                  className="text-[#0066cc] transition-colors hover:text-[#0077ed] hover:underline"
                >
                  ← Back to seat selection
                </Link>
              </p>
            </div>

            <aside className="w-full shrink-0 lg:w-[360px]">
              <CheckoutSummary van={van} addresses={addresses} />
            </aside>
          </motion.div>
        </motion.div>
      </main>

      <CheckoutFooter />
    </div>
  )
}
