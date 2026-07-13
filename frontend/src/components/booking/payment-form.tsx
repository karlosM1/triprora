import { useEffect, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { Banknote, CheckCircle2, QrCode, RefreshCw } from 'lucide-react'
import { AppleCard, SectionTitle } from '@/components/layout/page-header'
import { cn } from '@/lib/utils'
import { calculateTotals } from '@/lib/booking'
import { createQrPhPayment, fetchQrPhPaymentStatus } from '@/lib/api/payments'

export type CheckoutPaymentMethod = 'qrph' | 'cash'

type PaymentFormProps = {
  readOnly?: boolean
  baseFare: number
  /** When set, used as the charged amount instead of recalculating from baseFare. */
  totalAmount?: number
  purpose?: 'trip' | 'delivery'
  onPaymentChange?: (state: {
    paymentMethod: CheckoutPaymentMethod
    paymentIntentId: string | null
    ready: boolean
  }) => void
}

const POLL_INTERVAL_MS = 3000

export function PaymentForm({
  readOnly = false,
  baseFare,
  totalAmount,
  purpose = 'trip',
  onPaymentChange,
}: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('qrph')
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

  const calculatedTotal = calculateTotals(baseFare).total
  const total =
    typeof totalAmount === 'number' && Number.isFinite(totalAmount) && totalAmount > 0
      ? Math.round(totalAmount)
      : calculatedTotal
  const ready = paymentMethod === 'cash' || paid

  useEffect(() => {
    onPaymentChangeRef.current?.({
      paymentMethod,
      paymentIntentId: paymentMethod === 'qrph' ? paymentIntentId : null,
      ready,
    })
  }, [paymentMethod, paymentIntentId, ready])

  useEffect(() => {
    if (paymentMethod !== 'qrph' || !paymentIntentId || paid || readOnly) return

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
  }, [paymentMethod, paymentIntentId, paid, readOnly])

  function handleSelectMethod(method: CheckoutPaymentMethod) {
    if (readOnly || method === paymentMethod) return
    setError(null)
    setPaymentMethod(method)
  }

  async function handleGenerateQr() {
    if (paid) return

    setError(null)
    setPaymentStatus(null)
    setIsGenerating(true)
    try {
      const payment = await createQrPhPayment(total)
      setQrImageUrl(payment.qrImageUrl)
      setTestUrl(payment.testUrl)
      setPaymentIntentId(payment.paymentIntentId)
      setPaymentStatus(payment.status)
      setPaid(false)
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined
      setError(message || 'Failed to generate QR code. Please try again.')
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
        title="Choose payment method"
        subtitle="Pay now with QR Ph, or pay cash to your driver on the day of travel."
      />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={readOnly}
          onClick={() => handleSelectMethod('qrph')}
          className={cn(
            'flex flex-col items-start gap-1 rounded-2xl px-4 py-3 text-left ring-1 transition-colors',
            paymentMethod === 'qrph'
              ? 'bg-[#0071e3]/8 ring-[#0071e3]'
              : 'bg-[#f5f5f7] ring-transparent hover:bg-[#ebebed]',
            readOnly && 'cursor-not-allowed opacity-70',
          )}
        >
          <span className="flex items-center gap-2 text-[14px] font-medium text-[#1d1d1f]">
            <QrCode className="size-4" />
            QR Ph
          </span>
          <span className="text-[12px] text-[#86868b]">Pay now via bank or e‑wallet</span>
        </button>

        <button
          type="button"
          disabled={readOnly}
          onClick={() => handleSelectMethod('cash')}
          className={cn(
            'flex flex-col items-start gap-1 rounded-2xl px-4 py-3 text-left ring-1 transition-colors',
            paymentMethod === 'cash'
              ? 'bg-[#0071e3]/8 ring-[#0071e3]'
              : 'bg-[#f5f5f7] ring-transparent hover:bg-[#ebebed]',
            readOnly && 'cursor-not-allowed opacity-70',
          )}
        >
          <span className="flex items-center gap-2 text-[14px] font-medium text-[#1d1d1f]">
            <Banknote className="size-4" />
            Cash
          </span>
          <span className="text-[12px] text-[#86868b]">Pay the driver on trip day</span>
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-[#f5f5f7] p-4 text-[14px] text-[#1d1d1f]">
        <p className="font-medium">Amount to pay</p>
        <p className="mt-1 text-[22px] font-semibold tracking-[-0.02em]">
          ₱{total.toLocaleString()}
        </p>
        <p className="mt-1 text-[13px] text-[#86868b]">
          {paymentMethod === 'cash'
            ? 'Includes the 4% system fee. Pay this amount in cash to your driver.'
            : 'Includes the 4% system fee. You\u2019ll pay this amount via your bank or e\u2011wallet app using QR Ph.'}
        </p>
      </div>

      {paymentMethod === 'cash' ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#ecfdf3] px-4 py-3 ring-1 ring-[#abefc6]">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#067647]" />
          <div>
            <p className="text-[14px] font-medium text-[#067647]">Cash on trip selected</p>
            <p className="mt-0.5 text-[13px] text-[#079455]">
              {purpose === 'delivery'
                ? 'Your delivery will be confirmed now. Pay this amount in cash to your driver.'
                : 'Your seat will be reserved now. Bring exact change when possible.'}
            </p>
          </div>
        </div>
      ) : (
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
      )}
    </AppleCard>
  )
}
