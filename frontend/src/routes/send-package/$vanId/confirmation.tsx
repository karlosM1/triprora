import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { CheckoutFooter } from '@/components/booking/booking-footer'
import { DeliveryStepper } from '@/components/send-package/delivery-stepper'
import { Header } from '@/components/landing/header'
import { AppleCard, PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  loadVanDelivery,
  vanDeliveryQueryOptions,
} from '@/lib/api/load-van-delivery'
import { formatPrice } from '@/lib/booking'
import {
  calculateDeliveryTotals,
  packageTypeLabel,
  sizeLabel,
  weightBandLabel,
} from '@/lib/delivery'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import type {
  PackageSize,
  PackageType,
  PackageWeightBand,
} from '@/lib/types/api'

export const Route = createFileRoute('/send-package/$vanId/confirmation')({
  validateSearch: (search: Record<string, unknown>) => {
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
      ref: typeof search.ref === 'string' ? search.ref : '',
      deliveryId:
        typeof search.deliveryId === 'string' ? search.deliveryId : '',
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
      description:
        typeof search.description === 'string' ? search.description : '',
      receiverName:
        typeof search.receiverName === 'string' ? search.receiverName : '',
      receiverPhone:
        typeof search.receiverPhone === 'string' ? search.receiverPhone : '',
      specialInstructions:
        typeof search.specialInstructions === 'string'
          ? search.specialInstructions
          : undefined,
      status: search.status === 'accepted' ? 'accepted' : 'pending',
    }
  },
  loader: async ({ params }) => loadVanDelivery(params.vanId),
  component: DeliveryConfirmationPage,
})

function formatTripDate(departureDate?: string) {
  if (!departureDate) return '—'
  return new Date(`${departureDate}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function DeliveryConfirmationPage() {
  const { vanId } = Route.useParams()
  const search = Route.useSearch()
  const { data } = useQuery(vanDeliveryQueryOptions(vanId))
  const van = data!.van
  const { total } = calculateDeliveryTotals({
    packageType: search.packageType,
    size: search.size,
    weightBand: search.weightBand,
  })

  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="my-deliveries" />
      <main className="mx-auto max-w-[980px] px-6 py-10 lg:px-8 lg:py-14">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mx-auto max-w-lg space-y-8"
        >
          <motion.div variants={fadeInUp}>
            <DeliveryStepper currentStep={4} />
          </motion.div>

          <motion.div variants={fadeInUp} className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#fff4e5]">
              <Clock className="size-8 text-[#bf4800]" strokeWidth={1.75} />
            </div>
            <PageHeader
              className="mt-6 justify-center text-center sm:flex-col sm:items-center"
              eyebrow="Request sent"
              title="Waiting for the driver."
              subtitle={`Your package request ${search.ref || ''} was sent to ${van.driver?.name ?? van.operator}. You’ll be able to pay once they accept.`}
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <AppleCard className="p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <span className="text-[13px] text-[#86868b]">
                  Delivery reference
                </span>
                <span className="font-mono text-[15px] font-semibold text-[#0066cc]">
                  {search.ref || '—'}
                </span>
              </div>
              <dl className="mt-5 space-y-4">
                <Row label="Status" value="Pending driver acceptance" />
                <Row label="Pickup" value={search.pickupAddress} />
                <Row label="Drop-off" value={search.dropoffAddress} />
                <Row label="Date" value={formatTripDate(van.departureDate)} />
                <Row label="Departure" value={van.departureTime} />
                <Row
                  label="Package"
                  value={`${packageTypeLabel(search.packageType)} · ${sizeLabel(search.size)} · ${weightBandLabel(search.weightBand)}`}
                />
                <Row label="Description" value={search.description} />
                <Row label="Receiver" value={search.receiverName} />
                <Row label="Estimated total" value={formatPrice(total)} highlight />
              </dl>
            </AppleCard>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <Button
              className="h-11 rounded-full bg-[#0071e3] px-6 text-[14px] hover:bg-[#0077ed]"
              asChild
            >
              <Link to="/my-deliveries">View my deliveries</Link>
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-full border-[#d2d2d7] px-6 text-[14px]"
              asChild
            >
              <Link to="/send-package">Send another package</Link>
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
