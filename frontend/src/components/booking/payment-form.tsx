import { useState } from 'react'
import { CreditCard } from 'lucide-react'
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
    { id: 'bank', label: 'Bank' },
    { id: 'wallet', label: 'Wallet' },
  ]

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-2">
        <CreditCard className="size-4 text-primary" />
        <h2 className="text-base font-bold text-foreground">Payment Method</h2>
      </div>

      <div className="mt-5 flex rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            disabled={readOnly}
            onClick={() => setMethod(tab.id)}
            className={cn(
              'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
              method === tab.id
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {method === 'card' && (
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">
              Card Number
            </span>
            <div className="relative mt-1.5">
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                readOnly={readOnly}
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 pr-10 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 read-only:bg-muted/30"
              />
              <CreditCard className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                Expiry Date
              </span>
              <input
                type="text"
                placeholder="MM / YY"
                readOnly={readOnly}
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 read-only:bg-muted/30"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                CVC
              </span>
              <input
                type="text"
                placeholder="•••"
                readOnly={readOnly}
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 read-only:bg-muted/30"
              />
            </label>
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={saveCard}
              disabled={readOnly}
              onChange={(e) => setSaveCard(e.target.checked)}
              className="size-4 rounded border-border accent-primary"
            />
            <span className="text-sm text-muted-foreground">
              Save card for future reservations
            </span>
          </label>
        </div>
      )}

      {method === 'bank' && (
        <p className="mt-5 text-sm text-muted-foreground">
          Bank transfer details will be provided after booking confirmation.
        </p>
      )}

      {method === 'wallet' && (
        <p className="mt-5 text-sm text-muted-foreground">
          Pay securely with GCash, Maya, or Apple Pay at checkout.
        </p>
      )}
    </div>
  )
}
