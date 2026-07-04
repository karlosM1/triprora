import { useState } from 'react'
import { CreditCard, Lock } from 'lucide-react'
import { AppleCard, SectionTitle } from '@/components/layout/page-header'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/lib/booking'

type PaymentFormProps = {
  readOnly?: boolean
}

export function PaymentForm({ readOnly = false }: PaymentFormProps) {
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [saveCard, setSaveCard] = useState(false)

  const tabs: { id: PaymentMethod; label: string }[] = [
    { id: 'card', label: 'Card' },
    { id: 'wallet', label: 'Wallet' },
    { id: 'cash', label: 'Cash' },
  ]

  return (
    <AppleCard className="p-6 sm:p-8">
      <SectionTitle
        title="Payment"
        subtitle="All transactions are secure and encrypted."
      />

      <div className="flex gap-1 rounded-full bg-[#e8e8ed] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            disabled={readOnly}
            onClick={() => setMethod(tab.id)}
            className={cn(
              'flex-1 rounded-full py-2 text-[13px] font-medium transition-colors',
              method === tab.id
                ? 'bg-white text-[#1d1d1f] shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {method === 'card' && (
        <div className="mt-6 space-y-4">
          <Field
            label="Card number"
            placeholder="1234 5678 9012 3456"
            readOnly={readOnly}
            icon={<CreditCard className="size-4 text-[#86868b]" strokeWidth={1.75} />}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Expiry" placeholder="MM / YY" readOnly={readOnly} />
            <Field label="CVC" placeholder="•••" readOnly={readOnly} />
          </div>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={saveCard}
              disabled={readOnly}
              onChange={(e) => setSaveCard(e.target.checked)}
              className="size-4 rounded border-[#d2d2d7] accent-[#0071e3]"
            />
            <span className="text-[14px] text-[#86868b]">
              Save card for future trips
            </span>
          </label>
        </div>
      )}

      {method === 'wallet' && (
        <p className="mt-6 text-[15px] leading-relaxed text-[#86868b]">
          Pay securely with GCash, Maya, or Apple Pay.
        </p>
      )}

      {method === 'cash' && (
        <p className="mt-6 text-[15px] leading-relaxed text-[#86868b]">
          Pay your driver in cash on the day of travel. Please bring the exact
          amount shown in your booking summary.
        </p>
      )}

      {method !== 'cash' && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-[#f5f5f7] px-4 py-3">
          <Lock className="size-4 shrink-0 text-[#86868b]" strokeWidth={1.75} />
          <p className="text-[12px] text-[#86868b]">
            256-bit SSL encryption · Your payment info is never stored on our servers
          </p>
        </div>
      )}
    </AppleCard>
  )
}

function Field({
  label,
  placeholder,
  readOnly,
  icon,
}: {
  label: string
  placeholder: string
  readOnly?: boolean
  icon?: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-[#1d1d1f]">
        {label}
      </span>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          readOnly={readOnly}
          className={cn(
            'h-11 w-full rounded-xl bg-white px-4 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b]/70 ring-1 ring-[#d2d2d7] transition-all outline-none',
            'focus:ring-2 focus:ring-[#0071e3]/40',
            icon && 'pr-10',
            readOnly && 'bg-[#f5f5f7] text-[#86868b]',
          )}
        />
        {icon && (
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
            {icon}
          </span>
        )}
      </div>
    </label>
  )
}
