import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { DeliveryStepper } from '@/components/send-package/delivery-stepper'
import { CheckoutFooter } from '@/components/booking/booking-footer'
import { Header } from '@/components/landing/header'
import { AppleCard, PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  loadVanDelivery,
  vanDeliveryQueryOptions,
} from '@/lib/api/load-van-delivery'
import {
  PACKAGE_SIZES,
  PACKAGE_TYPES,
  PACKAGE_WEIGHT_BANDS,
  calculateDeliveryTotals,
  type PackageDetails,
  type ReceiverDetails,
} from '@/lib/delivery'
import { formatPrice } from '@/lib/booking'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { PackageSize, PackageType, PackageWeightBand } from '@/lib/types/api'

export const Route = createFileRoute('/send-package/$vanId/')({
  validateSearch: (search: Record<string, unknown>) => ({
    pickupAddress: typeof search.pickupAddress === 'string' ? search.pickupAddress : '',
    dropoffAddress:
      typeof search.dropoffAddress === 'string' ? search.dropoffAddress : '',
  }),
  loader: async ({ params }) => loadVanDelivery(params.vanId),
  component: PackageDetailsPage,
})

const emptyPackage: PackageDetails = {
  packageType: 'documents',
  weightBand: 'up_to_1kg',
  size: 'small',
  description: '',
}

const emptyReceiver: ReceiverDetails = {
  receiverName: '',
  receiverPhone: '',
  specialInstructions: '',
}

function PackageDetailsPage() {
  const { vanId } = Route.useParams()
  const { pickupAddress, dropoffAddress } = Route.useSearch()
  const navigate = useNavigate()
  const { data } = useQuery(vanDeliveryQueryOptions(vanId))
  const van = data!.van

  const [addresses, setAddresses] = useState({
    pickupAddress: pickupAddress || van.departureLocation,
    dropoffAddress: dropoffAddress || van.arrivalLocation,
  })
  const [pkg, setPkg] = useState<PackageDetails>(emptyPackage)
  const [receiver, setReceiver] = useState<ReceiverDetails>(emptyReceiver)
  const [error, setError] = useState<string | null>(null)
  const fare = calculateDeliveryTotals({
    packageType: pkg.packageType,
    size: pkg.size,
    weightBand: pkg.weightBand,
  })

  function handleContinue() {
    setError(null)
    if (addresses.pickupAddress.trim().length < 5) {
      setError('Enter a more specific pickup address.')
      return
    }
    if (addresses.dropoffAddress.trim().length < 5) {
      setError('Enter a more specific drop-off address.')
      return
    }
    if (pkg.description.trim().length < 2) {
      setError('Add a short package description for the driver.')
      return
    }
    if (receiver.receiverName.trim().length < 2) {
      setError('Enter the receiver’s name.')
      return
    }
    if (receiver.receiverPhone.trim().length < 7) {
      setError('Enter a valid receiver phone number.')
      return
    }

    void navigate({
      to: '/send-package/$vanId/checkout',
      params: { vanId },
      search: {
        pickupAddress: addresses.pickupAddress.trim(),
        dropoffAddress: addresses.dropoffAddress.trim(),
        packageType: pkg.packageType,
        weightBand: pkg.weightBand,
        size: pkg.size,
        description: pkg.description.trim(),
        receiverName: receiver.receiverName.trim(),
        receiverPhone: receiver.receiverPhone.trim(),
        specialInstructions: receiver.specialInstructions.trim() || undefined,
      },
    })
  }

  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="send-package" />
      <main className="mx-auto max-w-[720px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-8"
        >
          <motion.div variants={fadeInUp}>
            <DeliveryStepper currentStep={2} />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <PageHeader
              eyebrow={`${van.departureLocation} → ${van.arrivalLocation}`}
              title="Package & receiver"
              subtitle={`Trip departs ${van.departureTime}${van.departureDate ? ` on ${van.departureDate}` : ''}. Tell the driver what you’re sending.`}
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <AppleCard className="space-y-6 p-6 sm:p-8">
              <section className="space-y-4">
                <h2 className="text-[15px] font-semibold text-[#1d1d1f]">
                  Pickup & drop-off
                </h2>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="pickup">Pickup address</Label>
                    <Input
                      id="pickup"
                      value={addresses.pickupAddress}
                      onChange={(e) =>
                        setAddresses((prev) => ({
                          ...prev,
                          pickupAddress: e.target.value,
                        }))
                      }
                      placeholder="e.g. Aurora Market"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dropoff">Drop-off address</Label>
                    <Input
                      id="dropoff"
                      value={addresses.dropoffAddress}
                      onChange={(e) =>
                        setAddresses((prev) => ({
                          ...prev,
                          dropoffAddress: e.target.value,
                        }))
                      }
                      placeholder="e.g. Maria Aurora Municipal Hall"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4 border-t border-black/5 pt-6">
                <h2 className="text-[15px] font-semibold text-[#1d1d1f]">
                  Package type
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PACKAGE_TYPES.map((option) => (
                    <ChoiceButton
                      key={option.value}
                      selected={pkg.packageType === option.value}
                      onClick={() =>
                        setPkg((prev) => ({
                          ...prev,
                          packageType: option.value as PackageType,
                        }))
                      }
                      label={option.label}
                    />
                  ))}
                </div>
              </section>

              <section className="space-y-4 border-t border-black/5 pt-6">
                <h2 className="text-[15px] font-semibold text-[#1d1d1f]">
                  Estimated weight
                </h2>
                <div className="grid gap-2 sm:grid-cols-3">
                  {PACKAGE_WEIGHT_BANDS.map((option) => (
                    <ChoiceButton
                      key={option.value}
                      selected={pkg.weightBand === option.value}
                      onClick={() =>
                        setPkg((prev) => ({
                          ...prev,
                          weightBand: option.value as PackageWeightBand,
                        }))
                      }
                      label={option.label}
                    />
                  ))}
                </div>
              </section>

              <section className="space-y-4 border-t border-black/5 pt-6">
                <h2 className="text-[15px] font-semibold text-[#1d1d1f]">
                  Package size
                </h2>
                <div className="grid gap-2 sm:grid-cols-3">
                  {PACKAGE_SIZES.map((option) => (
                    <ChoiceButton
                      key={option.value}
                      selected={pkg.size === option.value}
                      onClick={() =>
                        setPkg((prev) => ({
                          ...prev,
                          size: option.value as PackageSize,
                        }))
                      }
                      label={option.label}
                      hint={option.hint}
                    />
                  ))}
                </div>
              </section>

              <section className="space-y-1.5 border-t border-black/5 pt-6">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={pkg.description}
                  onChange={(e) =>
                    setPkg((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder='e.g. "Brown envelope"'
                  maxLength={200}
                />
              </section>

              <section className="space-y-4 border-t border-black/5 pt-6">
                <h2 className="text-[15px] font-semibold text-[#1d1d1f]">
                  Receiver
                </h2>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="receiverName">Receiver name</Label>
                    <Input
                      id="receiverName"
                      value={receiver.receiverName}
                      onChange={(e) =>
                        setReceiver((prev) => ({
                          ...prev,
                          receiverName: e.target.value,
                        }))
                      }
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="receiverPhone">Receiver phone</Label>
                    <Input
                      id="receiverPhone"
                      type="tel"
                      value={receiver.receiverPhone}
                      onChange={(e) =>
                        setReceiver((prev) => ({
                          ...prev,
                          receiverPhone: e.target.value,
                        }))
                      }
                      placeholder="09XXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="instructions">
                      Special instructions (optional)
                    </Label>
                    <textarea
                      id="instructions"
                      value={receiver.specialInstructions}
                      onChange={(e) =>
                        setReceiver((prev) => ({
                          ...prev,
                          specialInstructions: e.target.value,
                        }))
                      }
                      placeholder='e.g. "Call before arriving."'
                      rows={3}
                      className="min-h-[88px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                    />
                  </div>
                </div>
              </section>

              {error && (
                <p className="text-[14px] text-[#bf4800]" role="alert">
                  {error}
                </p>
              )}

              <div className="rounded-xl bg-[#f5f5f7] px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] text-[#86868b]">
                      Suggested estimate
                    </p>
                    <p className="mt-0.5 text-[13px] text-[#86868b]">
                      Final fee is set by the driver on accept
                    </p>
                  </div>
                  <p className="text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                    {formatPrice(fare.total)}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                className="h-11 w-full rounded-full bg-[#0071e3] text-[15px] hover:bg-[#0077ed]"
                onClick={handleContinue}
              >
                Continue to fare
              </Button>
            </AppleCard>
          </motion.div>
        </motion.div>
      </main>
      <CheckoutFooter />
    </div>
  )
}

function ChoiceButton({
  selected,
  onClick,
  label,
  hint,
}: {
  selected: boolean
  onClick: () => void
  label: string
  hint?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl px-4 py-3 text-left ring-1 transition-colors',
        selected
          ? 'bg-[#0071e3]/8 ring-[#0071e3]'
          : 'bg-[#f5f5f7] ring-transparent hover:bg-[#eeeef0]',
      )}
    >
      <span className="block text-[14px] font-medium text-[#1d1d1f]">{label}</span>
      {hint && (
        <span className="mt-0.5 block text-[12px] text-[#86868b]">{hint}</span>
      )}
    </button>
  )
}
