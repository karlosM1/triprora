import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, QrCode, RefreshCw } from 'lucide-react'
import { AppleCard, SectionTitle } from '@/components/layout/page-header'
import { cn } from '@/lib/utils'
import { calculateTotals } from '@/lib/booking'
import { createQrPhPayment, fetchQrPhPaymentStatus } from '@/lib/api/payments'

type PaymentFormProps = {
  readOnly?: boolean
  baseFare: number
  onPaymentChange?: (state: {
    paymentIntentId: string | null
    paid: boolean
  }) => void
}

const POLL_INTERVAL_MS = 3000

export function PaymentForm({
  readOnly = false,
  baseFare,
  onPaymentChange,
}: PaymentFormProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)
  const [testUrl, setTestUrl] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const onPaymentChangeRef = useRef(onPaymentChange)
  onPaymentChangeRef.current = onPaymentChange

  const { total } = calculateTotals(baseFare)

  useEffect(() => {
    onPaymentChangeRef.current?.({ paymentIntentId, paid })
  }, [paymentIntentId, paid])

  useEffect(() => {
    if (!paymentIntentId || paid || readOnly) return

    let cancelled = false

    async function poll() {
      try {
        const result = await fetchQrPhPaymentStatus(paymentIntentId!)
        if (cancelled) return
        setPaymentStatus(result.status)
        if (result.paid) {
          setPaid(true)
        }
      } catch {
        // Keep polling; transient network errors shouldn't stop detection.
      }
    }

    void poll()
    const timer = window.setInterval(() => {
      void poll()
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [paymentIntentId, paid, readOnly])

  async function handleGenerateQr() {
    setError(null)
    setPaymentStatus(null)
    setPaid(false)
    setIsGenerating(true)
    try {
      const payment = await createQrPhPayment(total)
      setQrImageUrl(payment.qrImageUrl)
      setTestUrl(payment.testUrl)
      setPaymentIntentId(payment.paymentIntentId)
      setPaymentStatus(payment.status)
    } catch {
      setError('Failed to generate QR code. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleRefreshStatus() {
    if (!paymentIntentId) return
    setError(null)
    setIsChecking(true)
    try {
      const status = await fetchQrPhPaymentStatus(paymentIntentId)
      setPaymentStatus(status.status)
      if (status.paid) setPaid(true)
    } catch {
      setError('Unable to refresh payment status. Please try again.')
    } finally {
      setIsChecking(false)
    }
  }

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
        {!paid && (
          <button
            type="button"
            disabled={readOnly || isGenerating}
            onClick={handleGenerateQr}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[15px] font-medium transition-colors',
              'bg-[#0071e3] text-white hover:bg-[#0077ed]',
              (readOnly || isGenerating) && 'cursor-not-allowed opacity-70',
            )}
          >
            <QrCode className="size-4" />
            {isGenerating
              ? 'Generating QR Ph code…'
              : qrImageUrl
                ? 'Generate new QR Ph code'
                : 'Generate QR Ph code'}
          </button>
        )}

        {error && (
          <p className="rounded-xl bg-[#fef2f2] px-4 py-3 text-[13px] text-[#b42318] ring-1 ring-[#fecaca]">
            {error}
          </p>
        )}

        {paid && (
          <div className="flex items-start gap-3 rounded-2xl bg-[#ecfdf3] px-4 py-3 ring-1 ring-[#abefc6]">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#067647]" />
            <div>
              <p className="text-[14px] font-medium text-[#067647]">Payment received</p>
              <p className="mt-0.5 text-[13px] text-[#079455]">
                You can now complete your booking.
              </p>
            </div>
          </div>
        )}

        {qrImageUrl && !paid && (
          <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-[#e5e5ea]">
            <img
              src={qrImageUrl}
              alt="QR Ph payment code"
              className="h-56 w-56 rounded-xl bg-white object-contain"
            />
            <p className="text-center text-[13px] text-[#86868b]">
              In test mode, do not scan this with GCash. Use the simulate link below
              instead. We&apos;ll detect payment automatically after that.
            </p>

            {testUrl && (
              <a
                href={testUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#0071e3] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#0077ed]"
              >
                Simulate payment (PayMongo test)
              </a>
            )}

            <button
              type="button"
              disabled={isChecking}
              className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3 py-1.5 text-[12px] font-medium text-[#1d1d1f] ring-1 ring-[#e5e5ea] hover:bg-[#e5e5ea] disabled:opacity-70"
              onClick={handleRefreshStatus}
            >
              <RefreshCw className={cn('size-3.5', isChecking && 'animate-spin')} />
              {isChecking ? 'Checking…' : 'Check payment status'}
            </button>

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
