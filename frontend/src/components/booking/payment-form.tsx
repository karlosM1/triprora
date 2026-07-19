import { useEffect, useRef } from 'react'
import { Banknote, CheckCircle2 } from 'lucide-react'
import { AppleCard, SectionTitle } from '@/components/layout/page-header'
import { calculateTotals } from '@/lib/booking'

export type CheckoutPaymentMethod = 'cash'

type PaymentFormProps = {
  readOnly?: boolean
  baseFare: number
  /** When set, used as the charged amount instead of recalculating from baseFare. */
  totalAmount?: number
  purpose?: 'trip' | 'delivery'
  onPaymentChange?: (state: {
    paymentMethod: CheckoutPaymentMethod
    ready: boolean
  }) => void
}

export function PaymentForm({
  readOnly = false,
  baseFare,
  totalAmount,
  purpose = 'trip',
  onPaymentChange,
}: PaymentFormProps) {
  const onPaymentChangeRef = useRef(onPaymentChange)
  onPaymentChangeRef.current = onPaymentChange

  const calculatedTotal = calculateTotals(baseFare).total
  const total =
    typeof totalAmount === 'number' && Number.isFinite(totalAmount) && totalAmount > 0
      ? Math.round(totalAmount)
      : calculatedTotal

  useEffect(() => {
    onPaymentChangeRef.current?.({
      paymentMethod: 'cash',
      ready: !readOnly,
    })
  }, [readOnly])

  return (
    <AppleCard className="p-6 sm:p-8">
      <SectionTitle
        title="Cash payment"
        subtitle="Pay this amount in cash to your driver."
      />

      <div className="mt-4 rounded-2xl bg-[#f5f5f7] p-4 text-[14px] text-[#1d1d1f]">
        <p className="flex items-center gap-2 font-medium">
          <Banknote className="size-4" />
          Amount to pay
        </p>
        <p className="mt-1 text-[22px] font-semibold tracking-[-0.02em]">
          ₱{total.toLocaleString()}
        </p>
        <p className="mt-1 text-[13px] text-[#86868b]">
          Includes the 4% platform fee. Pay this amount in cash to your driver.
        </p>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#ecfdf3] px-4 py-3 ring-1 ring-[#abefc6]">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#067647]" />
        <div>
          <p className="text-[14px] font-medium text-[#067647]">Cash on trip</p>
          <p className="mt-0.5 text-[13px] text-[#079455]">
            {purpose === 'delivery'
              ? 'Your delivery will be confirmed now. Pay this amount in cash to your driver.'
              : 'Your seat will be reserved now. Bring exact change when possible.'}
          </p>
        </div>
      </div>
    </AppleCard>
  )
}
