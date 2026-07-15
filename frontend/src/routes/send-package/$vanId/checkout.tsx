import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { CheckoutFooter } from '@/components/booking/booking-footer'
import { DeliveryStepper } from '@/components/send-package/delivery-stepper'
import { Header } from '@/components/landing/header'
import { AppleCard, PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  createDelivery,
  deliveriesQueryKey,
  historyDeliveriesQueryKey,
  upcomingDeliveriesQueryKey,
} from '@/lib/api/deliveries'
import {
  loadVanDelivery,
  vanDeliveryQueryKey,
  vanDeliveryQueryOptions,
} from '@/lib/api/load-van-delivery'
import { vansQueryKey } from '@/lib/api/vans'
import { formatPrice } from '@/lib/booking'
import {
  calculateDeliveryTotals,
  packageTypeLabel,
  sizeLabel,
  weightBandLabel,
} from '@/lib/delivery'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { requireAuth } from '@/lib/route-guards'
import type {
  PackageSize,
  PackageType,
  PackageWeightBand,
} from '@/lib/types/api'

function validateDeliveryCheckoutSearch(search: Record<string, unknown>) {
  const packageTypes = [
    'documents',
    'food',
    'clothes',
    'electronics',
    'others',
  ] as const
  const weightBands = ['up_to_1kg', 'one_to_5kg', 'five_to_10kg'] as const
  const sizes = ['small', 'medium', 'large'] as const

  return {
    pickupAddress:
      typeof search.pickupAddress === 'string' ? search.pickupAddress : '',
    dropoffAddress:
      typeof search.dropoffAddress === 'string' ? search.dropoffAddress : '',
    packageType: packageTypes.includes(search.packageType as PackageType)
      ? (search.packageType as PackageType)
      : ('documents' as PackageType),
    weightBand: weightBands.includes(search.weightBand as PackageWeightBand)
      ? (search.weightBand as PackageWeightBand)
      : ('up_to_1kg' as PackageWeightBand),
    size: sizes.includes(search.size as PackageSize)
      ? (search.size as PackageSize)
      : ('small' as PackageSize),
    description: typeof search.description === 'string' ? search.description : '',
    receiverName:
      typeof search.receiverName === 'string' ? search.receiverName : '',
    receiverPhone:
      typeof search.receiverPhone === 'string' ? search.receiverPhone : '',
    specialInstructions:
      typeof search.specialInstructions === 'string'
        ? search.specialInstructions
        : undefined,
  }
}

export const Route = createFileRoute('/send-package/$vanId/checkout')({
  validateSearch: validateDeliveryCheckoutSearch,
  beforeLoad: async ({ params, search }) => {
    const qs = new URLSearchParams({
      pickupAddress: String(search.pickupAddress ?? ''),
      dropoffAddress: String(search.dropoffAddress ?? ''),
      packageType: String(search.packageType ?? 'documents'),
      weightBand: String(search.weightBand ?? 'up_to_1kg'),
      size: String(search.size ?? 'small'),
      description: String(search.description ?? ''),
      receiverName: String(search.receiverName ?? ''),
      receiverPhone: String(search.receiverPhone ?? ''),
    })
    if (search.specialInstructions) {
      qs.set('specialInstructions', String(search.specialInstructions))
    }
    await requireAuth(`/send-package/${params.vanId}/checkout?${qs.toString()}`)
  },
  loader: async ({ params }) => loadVanDelivery(params.vanId),
  component: DeliveryCheckoutPage,
})

function DeliveryCheckoutPage() {
  const { vanId } = Route.useParams()
  const search = Route.useSearch()
  const { data } = useQuery(vanDeliveryQueryOptions(vanId))
  const van = data!.van
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const { baseFare, serviceFee, total } = calculateDeliveryTotals({
    packageType: search.packageType,
    size: search.size,
    weightBand: search.weightBand,
  })

  const requestMutation = useMutation({
    mutationFn: () =>
      createDelivery({
        vanId,
        pickupAddress: search.pickupAddress,
        dropoffAddress: search.dropoffAddress,
        packageType: search.packageType,
        weightBand: search.weightBand,
        size: search.size,
        description: search.description,
        receiverName: search.receiverName,
        receiverPhone: search.receiverPhone,
        specialInstructions: search.specialInstructions,
      }),
    onSuccess: (delivery) => {
      queryClient.invalidateQueries({ queryKey: deliveriesQueryKey })
      queryClient.invalidateQueries({ queryKey: upcomingDeliveriesQueryKey })
      queryClient.invalidateQueries({ queryKey: historyDeliveriesQueryKey })
      queryClient.invalidateQueries({ queryKey: vansQueryKey })
      queryClient.invalidateQueries({ queryKey: vanDeliveryQueryKey(vanId) })

      void navigate({
        to: '/send-package/$vanId/confirmation',
        params: { vanId },
        search: {
          ref: delivery.reference,
          deliveryId: delivery.id,
          pickupAddress: search.pickupAddress,
          dropoffAddress: search.dropoffAddress,
          packageType: search.packageType,
          weightBand: search.weightBand,
          size: search.size,
          description: search.description,
          receiverName: search.receiverName,
          receiverPhone: search.receiverPhone,
          specialInstructions: search.specialInstructions,
          status: 'pending',
        },
      })
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      setError(
        err.response?.data?.message ??
          'Failed to send package request. Please try again.',
      )
    },
  })

  if (
    !search.pickupAddress.trim() ||
    !search.dropoffAddress.trim() ||
    !search.description.trim() ||
    !search.receiverName.trim() ||
    !search.receiverPhone.trim()
  ) {
    return (
      <div className="app-page min-h-svh bg-[#f5f5f7]">
        <Header activeLink="send-package" />
        <main className="mx-auto max-w-[980px] px-6 py-16 text-center lg:px-8">
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
            Package details required
          </h1>
          <p className="mt-2 text-[15px] text-[#86868b]">
            Complete package and receiver details before requesting delivery.
          </p>
          <Button
            className="mt-6 rounded-full bg-[#0071e3] px-6 hover:bg-[#0077ed]"
            asChild
          >
            <Link
              to="/send-package/$vanId"
              params={{ vanId }}
              search={{
                pickupAddress: search.pickupAddress,
                dropoffAddress: search.dropoffAddress,
              }}
            >
              Back to package details
            </Link>
          </Button>
        </main>
        <CheckoutFooter />
      </div>
    )
  }

  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="send-package" />
      <main className="mx-auto max-w-[980px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-8"
        >
          <motion.div variants={fadeInUp}>
            <DeliveryStepper currentStep={3} />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <PageHeader
              eyebrow="Review request"
              title="Request delivery"
              subtitle="Send this package request to the driver. They will set the delivery fee when they accept, then you can pay."
            />
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <motion.div variants={fadeInUp} className="space-y-6">
              <AppleCard className="space-y-4 p-6">
                <h2 className="text-[15px] font-semibold text-[#1d1d1f]">
                  Delivery summary
                </h2>
                <dl className="space-y-3 text-[14px]">
                  <Row label="Pickup" value={search.pickupAddress} />
                  <Row label="Drop-off" value={search.dropoffAddress} />
                  <Row
                    label="Package"
                    value={`${packageTypeLabel(search.packageType)} · ${sizeLabel(search.size)} · ${weightBandLabel(search.weightBand)}`}
                  />
                  <Row label="Description" value={search.description} />
                  <Row label="Receiver" value={search.receiverName} />
                  <Row label="Receiver phone" value={search.receiverPhone} />
                  {search.specialInstructions && (
                    <Row
                      label="Instructions"
                      value={search.specialInstructions}
                    />
                  )}
                  <Row
                    label="Trip"
                    value={`${van.departureLocation} → ${van.arrivalLocation} · ${van.departureTime}`}
                  />
                  <Row
                    label="Driver"
                    value={van.driver?.name ?? van.operator}
                  />
                </dl>
              </AppleCard>

              <p className="rounded-xl bg-[#fff8e8] px-4 py-3 text-[13px] text-[#8a6a00]">
                No payment yet. The driver reviews this request and sets the
                delivery fee. After they accept, you can pay from My Deliveries.
              </p>

              {error && (
                <p className="text-[14px] text-[#bf4800]" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="button"
                className="h-11 w-full rounded-full bg-[#0071e3] text-[15px] hover:bg-[#0077ed] sm:w-auto sm:px-8"
                disabled={requestMutation.isPending}
                onClick={() => {
                  setError(null)
                  requestMutation.mutate()
                }}
              >
                {requestMutation.isPending
                  ? 'Sending request…'
                  : 'Request Delivery'}
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <AppleCard className="space-y-3 p-6 lg:sticky lg:top-24">
                <h2 className="text-[15px] font-semibold text-[#1d1d1f]">
                  Suggested estimate
                </h2>
                <p className="text-[12px] text-[#86868b]">
                  Based on package type, size &amp; weight. Final fee is set by
                  the driver.
                </p>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#86868b]">Delivery fee</span>
                  <span className="font-medium text-[#1d1d1f]">
                    {formatPrice(baseFare)}
                  </span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#86868b]">Platform fee</span>
                  <span className="font-medium text-[#1d1d1f]">
                    {formatPrice(serviceFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-black/5 pt-3 text-[17px] font-semibold text-[#1d1d1f]">
                  <span>Suggested total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </AppleCard>
            </motion.div>
          </div>
        </motion.div>
      </main>
      <CheckoutFooter />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-[#86868b]">{label}</dt>
      <dd className="text-right font-medium text-[#1d1d1f]">{value}</dd>
    </div>
  )
}
