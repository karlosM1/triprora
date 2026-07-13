import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { CheckoutFooter } from '@/components/booking/booking-footer'
import {
  PaymentForm,
  type CheckoutPaymentMethod,
} from '@/components/booking/payment-form'
import { Header } from '@/components/landing/header'
import { AppleCard, PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  deliveryQueryKey,
  fetchDelivery,
  historyDeliveriesQueryKey,
  payDelivery,
  upcomingDeliveriesQueryKey,
} from '@/lib/api/deliveries'
import { formatPrice } from '@/lib/booking'
import {
  packageTypeLabel,
  sizeLabel,
  weightBandLabel,
} from '@/lib/delivery'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/my-deliveries/$deliveryId/pay')({
  beforeLoad: async ({ params }) => {
    await requireAuth(`/my-deliveries/${params.deliveryId}/pay`)
  },
  component: PayDeliveryPage,
})

function PayDeliveryPage() {
  const { deliveryId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>('qrph')
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [paymentReady, setPaymentReady] = useState(false)

  const deliveryQuery = useQuery({
    queryKey: deliveryQueryKey(deliveryId),
    queryFn: () => fetchDelivery(deliveryId),
  })

  const delivery = deliveryQuery.data
  const fare =
    delivery &&
    Number.isFinite(delivery.baseFare) &&
    Number.isFinite(delivery.serviceFee) &&
    Number.isFinite(delivery.total) &&
    delivery.total > 0
      ? {
          baseFare: delivery.baseFare,
          serviceFee: delivery.serviceFee,
          total: delivery.total,
        }
      : null

  const payMutation = useMutation({
    mutationFn: () => {
      if (paymentMethod === 'qrph' && !paymentIntentId) {
        throw new Error('Payment is required.')
      }
      return payDelivery(deliveryId, {
        paymentMethod,
        ...(paymentMethod === 'qrph' && paymentIntentId
          ? { paymentIntentId }
          : {}),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: upcomingDeliveriesQueryKey })
      queryClient.invalidateQueries({ queryKey: historyDeliveriesQueryKey })
      queryClient.invalidateQueries({ queryKey: deliveryQueryKey(deliveryId) })
      void navigate({ to: '/my-deliveries' })
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      setError(
        err.response?.data?.message ?? 'Payment failed. Please try again.',
      )
    },
  })

  if (deliveryQuery.isLoading) {
    return (
      <div className="app-page min-h-svh bg-[#f5f5f7]">
        <Header activeLink="my-deliveries" />
        <main className="mx-auto max-w-[720px] px-6 py-16">
          <p className="text-[15px] text-[#86868b]">Loading delivery…</p>
        </main>
      </div>
    )
  }

  if (!delivery) {
    return (
      <div className="app-page min-h-svh bg-[#f5f5f7]">
        <Header activeLink="my-deliveries" />
        <main className="mx-auto max-w-[720px] px-6 py-16 text-center">
          <h1 className="text-[24px] font-semibold text-[#1d1d1f]">
            Delivery not found
          </h1>
          <Button className="mt-6 rounded-full" asChild>
            <Link to="/my-deliveries">Back to deliveries</Link>
          </Button>
        </main>
      </div>
    )
  }

  if (!fare) {
    return (
      <div className="app-page min-h-svh bg-[#f5f5f7]">
        <Header activeLink="my-deliveries" />
        <main className="mx-auto max-w-[720px] px-6 py-16 text-center">
          <h1 className="text-[24px] font-semibold text-[#1d1d1f]">
            Fee not ready
          </h1>
          <p className="mt-2 text-[15px] text-[#86868b]">
            This delivery does not have a valid accepted fee yet. Ask the driver
            to accept again, then refresh.
          </p>
          <Button className="mt-6 rounded-full" asChild>
            <Link to="/my-deliveries">Back to deliveries</Link>
          </Button>
        </main>
      </div>
    )
  }

  if (!delivery.canPay) {
    return (
      <div className="app-page min-h-svh bg-[#f5f5f7]">
        <Header activeLink="my-deliveries" />
        <main className="mx-auto max-w-[720px] px-6 py-16 text-center">
          <h1 className="text-[24px] font-semibold text-[#1d1d1f]">
            Payment not available yet
          </h1>
          <p className="mt-2 text-[15px] text-[#86868b]">
            {delivery.status === 'pending'
              ? 'Wait for the driver to accept this package request.'
              : 'This delivery cannot be paid right now.'}
          </p>
          <Button className="mt-6 rounded-full" asChild>
            <Link to="/my-deliveries">Back to deliveries</Link>
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="my-deliveries" />
      <main className="mx-auto max-w-[720px] px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-8"
        >
          <motion.div variants={fadeInUp}>
            <PageHeader
              eyebrow={delivery.reference}
              title="Pay for delivery"
              subtitle="The driver accepted your package. Complete payment to confirm it."
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <AppleCard className="space-y-3 p-6">
              <Row
                label="Package"
                value={`${packageTypeLabel(delivery.packageType)} · ${sizeLabel(delivery.size)} · ${weightBandLabel(delivery.weightBand)}`}
              />
              <Row label="Route" value={delivery.route} />
              <Row label="Delivery fee" value={formatPrice(fare.baseFare)} />
              <Row label="Platform fee" value={formatPrice(fare.serviceFee)} />
              <Row label="Total" value={formatPrice(fare.total)} highlight />
            </AppleCard>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <PaymentForm
              key={`pay-${delivery.id}-${fare.total}`}
              baseFare={fare.baseFare}
              totalAmount={fare.total}
              purpose="delivery"
              onPaymentChange={(state) => {
                setPaymentMethod(state.paymentMethod)
                setPaymentIntentId(state.paymentIntentId)
                setPaymentReady(state.ready)
              }}
            />
          </motion.div>

          {error && (
            <p className="text-[14px] text-[#bf4800]" role="alert">
              {error}
            </p>
          )}

          <motion.div variants={fadeInUp}>
            <Button
              className="h-11 w-full rounded-full bg-[#0071e3] text-[15px] hover:bg-[#0077ed] sm:w-auto sm:px-8"
              disabled={payMutation.isPending || !paymentReady}
              onClick={() => {
                setError(null)
                payMutation.mutate()
              }}
            >
              {payMutation.isPending ? 'Confirming…' : 'Confirm payment'}
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
