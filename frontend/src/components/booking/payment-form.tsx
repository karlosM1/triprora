import { useState } from 'react'
import { QrCode, RefreshCw } from 'lucide-react'
import { AppleCard, SectionTitle } from '@/components/layout/page-header'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/lib/booking'
import { calculateTotals } from '@/lib/booking'
import { createQrPhPayment, fetchQrPhPaymentStatus } from '@/lib/api/payments'

type PaymentFormProps = {
  readOnly?: boolean
  /**
   * Base fare in pesos for this trip (before fees and tax).
   */
  baseFare: number
}

export function PaymentForm({ readOnly = false, baseFare }: PaymentFormProps) {
  const [method] = useState<PaymentMethod>('qrph')
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { total } = calculateTotals(baseFare)

  return (
    <AppleCard className="p-6 sm:p-8">
      <SectionTitle
        title="Pay with QR Ph"
        subtitle="Scan the QR Ph code with your banking or e‑wallet app."
      />

      <div className="mt-4 rounded-2xl bg-[#f5f5f7] p-4 text-[14px] text-[#1d1d1f]">
        <p className="font-medium">Amount to pay</p>
        <p className="mt-1 text-[22px] font-semibold tracking-[-0.02em]">
          ₱{total.toLocaleString()}
        </p>
        <p className="mt-1 text-[13px] text-[#86868b]">
          Includes service fees and taxes. You&apos;ll pay this amount via your bank
          or e‑wallet app using QR Ph.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <button
          type="button"
          disabled={readOnly || isGenerating}
          onClick={async () => {
            setError(null)
            setPaymentStatus(null)
            setIsGenerating(true)
            try {
              const payment = await createQrPhPayment(total)
              setQrImageUrl(payment.qrImageUrl)
              setPaymentIntentId(payment.paymentIntentId)
            } catch (err) {
              setError('Failed to generate QR code. Please try again.')
            } finally {
              setIsGenerating(false)
            }
          }}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[15px] font-medium transition-colors',
            'bg-[#0071e3] text-white hover:bg-[#0077ed]',
            (readOnly || isGenerating) && 'cursor-not-allowed opacity-70',
          )}
        >
          <QrCode className="size-4" />
          {isGenerating ? 'Generating QR Ph code…' : 'Generate QR Ph code'}
        </button>

        {error && (
          <p className="rounded-xl bg-[#fef2f2] px-4 py-3 text-[13px] text-[#b42318] ring-1 ring-[#fecaca]">
            {error}
          </p>
        )}

        {qrImageUrl && (
          <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-[#e5e5ea]">
            <img
              src={qrImageUrl}
              alt="QR Ph payment code"
              className="h-56 w-56 rounded-xl bg-white object-contain"
            />
            <p className="text-center text-[13px] text-[#86868b]">
              Open your banking or e‑wallet app and scan this QR Ph code to complete
              your payment.
            </p>

            {paymentIntentId && (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3 py-1.5 text-[12px] font-medium text-[#1d1d1f] ring-1 ring-[#e5e5ea] hover:bg-[#e5e5ea]"
                onClick={async () => {
                  try {
                    const status = await fetchQrPhPaymentStatus(paymentIntentId)
                    setPaymentStatus(status.status)
                  } catch {
                    setError('Unable to refresh payment status. Please try again.')
                  }
                }}
              >
                <RefreshCw className="size-3.5" />
                Refresh payment status
              </button>
            )}

            {paymentStatus && (
              <p className="text-[12px] text-[#86868b]">
                Current status:{' '}
                <span className="font-medium text-[#1d1d1f]">{paymentStatus}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </AppleCard>
  )
}
