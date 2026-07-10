import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { AppleCard, PageHeader, SectionTitle } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  driverWalletHistoryQueryKey,
  driverWalletPayoutsQueryKey,
  driverWalletQueryKey,
  driverWalletSettlementsQueryKey,
  fetchDriverWallet,
  fetchDriverWalletHistory,
  fetchDriverWalletPayouts,
  fetchDriverWalletSettlements,
  requestDriverPayout,
  type WalletLedgerEntry,
  type WalletSettlement,
  type DriverPayout,
} from '@/lib/api/wallet'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

function formatPesos(amount: number) {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : ''
  return `${sign}₱${Math.abs(amount).toLocaleString()}`
}

function balanceLabel(meaning: string, balance: number) {
  if (meaning === 'platform_owes_driver') {
    return `Platform owes you ₱${balance.toLocaleString()}`
  }
  if (meaning === 'driver_owes_platform') {
    return `You owe the platform ₱${Math.abs(balance).toLocaleString()}`
  }
  return 'Balance settled'
}

function ledgerTypeLabel(type: string) {
  switch (type) {
    case 'cash_commission':
      return 'Cash commission'
    case 'cashless_earnings':
      return 'Cashless earnings'
    case 'payout':
      return 'Payout'
    case 'settlement_adjustment':
      return 'Settlement adjustment'
    case 'manual_adjustment':
      return 'Manual adjustment'
    default:
      return type
  }
}

export function DriverWalletPage() {
  const queryClient = useQueryClient()
  const [payoutAmount, setPayoutAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  const walletQuery = useQuery({
    queryKey: driverWalletQueryKey,
    queryFn: fetchDriverWallet,
  })
  const historyQuery = useQuery({
    queryKey: driverWalletHistoryQueryKey,
    queryFn: () => fetchDriverWalletHistory({ limit: 30 }),
  })
  const settlementsQuery = useQuery({
    queryKey: driverWalletSettlementsQueryKey,
    queryFn: fetchDriverWalletSettlements,
  })
  const payoutsQuery = useQuery({
    queryKey: driverWalletPayoutsQueryKey,
    queryFn: fetchDriverWalletPayouts,
  })

  const payoutMutation = useMutation({
    mutationFn: (amountPesos: number) => requestDriverPayout(amountPesos),
    onSuccess: () => {
      setPayoutAmount('')
      setError(null)
      queryClient.invalidateQueries({ queryKey: driverWalletQueryKey })
      queryClient.invalidateQueries({ queryKey: driverWalletPayoutsQueryKey })
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      setError(err.response?.data?.message ?? 'Failed to request payout.')
    },
  })

  const wallet = walletQuery.data
  const maxPayout = Math.max(0, wallet?.balancePesos ?? 0)

  function handleRequestPayout() {
    const amount = Number(payoutAmount)
    if (!Number.isInteger(amount) || amount <= 0) {
      setError('Enter a whole peso amount greater than zero.')
      return
    }
    if (amount > maxPayout) {
      setError('Amount exceeds available balance.')
      return
    }
    setError(null)
    payoutMutation.mutate(amount)
  }

  return (
    <motion.div
      className="space-y-10"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <PageHeader
          eyebrow="Driver portal"
          title="Wallet."
          subtitle="Your balance is the source of truth for commissions, cashless earnings, and payouts."
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-2">
        <AppleCard className="p-6">
          <p className="text-[13px] font-medium text-[#86868b]">Current balance</p>
          <p
            className={cn(
              'mt-2 text-[36px] font-semibold tracking-[-0.02em]',
              (wallet?.balancePesos ?? 0) > 0 && 'text-[#248a3d]',
              (wallet?.balancePesos ?? 0) < 0 && 'text-[#b42318]',
              (wallet?.balancePesos ?? 0) === 0 && 'text-[#1d1d1f]',
            )}
          >
            {walletQuery.isLoading
              ? '…'
              : `₱${(wallet?.balancePesos ?? 0).toLocaleString()}`}
          </p>
          <p className="mt-1 text-[13px] text-[#86868b]">
            {wallet
              ? balanceLabel(wallet.meaning, wallet.balancePesos)
              : 'Loading balance…'}
          </p>
          <p className="mt-3 text-[12px] text-[#86868b]">
            Entries post when you complete a trip. Cash bookings debit commission;
            cashless bookings credit your earnings.
          </p>
        </AppleCard>

        <AppleCard className="p-6">
          <SectionTitle title="Request payout" subtitle="Available when your balance is positive." />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 text-[13px] text-[#86868b]">
              Amount (₱)
              <input
                type="number"
                min={1}
                max={maxPayout || undefined}
                step={1}
                value={payoutAmount}
                disabled={maxPayout <= 0 || payoutMutation.isPending}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-[#d2d2d7] bg-white px-3 text-[15px] text-[#1d1d1f] outline-none focus:border-[#0071e3]"
              />
            </label>
            <Button
              className="h-11 rounded-full bg-[#0071e3] px-6 hover:bg-[#0077ed]"
              disabled={maxPayout <= 0 || payoutMutation.isPending}
              onClick={handleRequestPayout}
            >
              {payoutMutation.isPending ? 'Requesting…' : 'Request'}
            </Button>
          </div>
          {maxPayout <= 0 && (
            <p className="mt-3 text-[13px] text-[#86868b]">
              No positive balance available for payout.
            </p>
          )}
          {error && (
            <p className="mt-3 rounded-xl bg-[#fef2f2] px-4 py-3 text-[13px] text-[#b42318] ring-1 ring-[#fecaca]">
              {error}
            </p>
          )}
        </AppleCard>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <SectionTitle title="Wallet history" subtitle="Immutable ledger of every balance change." />
        <div className="mt-4 space-y-3">
          {(historyQuery.data?.items ?? []).length === 0 ? (
            <AppleCard className="border border-dashed border-[#d2d2d7] bg-transparent px-6 py-10 text-center">
              <p className="text-[15px] text-[#86868b]">
                No ledger entries yet. Complete a trip to post earnings or commissions.
              </p>
            </AppleCard>
          ) : (
            (historyQuery.data?.items ?? []).map((entry) => (
              <LedgerRow key={entry.id} entry={entry} />
            ))
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle title="Daily settlements" subtitle="Snapshots of cash vs cashless activity." />
          <div className="mt-4 space-y-3">
            {(settlementsQuery.data ?? []).length === 0 ? (
              <AppleCard className="border border-dashed border-[#d2d2d7] bg-transparent px-6 py-8 text-center">
                <p className="text-[14px] text-[#86868b]">No settlements yet.</p>
              </AppleCard>
            ) : (
              (settlementsQuery.data ?? []).map((row) => (
                <SettlementRow key={row.id} row={row} />
              ))
            )}
          </div>
        </div>

        <div>
          <SectionTitle title="Payouts" subtitle="Requests and payment status." />
          <div className="mt-4 space-y-3">
            {(payoutsQuery.data ?? []).length === 0 ? (
              <AppleCard className="border border-dashed border-[#d2d2d7] bg-transparent px-6 py-8 text-center">
                <p className="text-[14px] text-[#86868b]">No payout requests yet.</p>
              </AppleCard>
            ) : (
              (payoutsQuery.data ?? []).map((payout) => (
                <PayoutRow key={payout.id} payout={payout} />
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function LedgerRow({ entry }: { entry: WalletLedgerEntry }) {
  return (
    <AppleCard className="flex items-start justify-between gap-4 p-4">
      <div>
        <p className="text-[14px] font-medium text-[#1d1d1f]">
          {ledgerTypeLabel(entry.type)}
        </p>
        <p className="mt-0.5 text-[13px] text-[#86868b]">{entry.reason}</p>
        <p className="mt-1 text-[12px] text-[#86868b]">
          {new Date(entry.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="text-right">
        <p
          className={cn(
            'text-[15px] font-semibold',
            entry.amountPesos > 0 && 'text-[#248a3d]',
            entry.amountPesos < 0 && 'text-[#b42318]',
          )}
        >
          {formatPesos(entry.amountPesos)}
        </p>
        <p className="mt-0.5 text-[12px] text-[#86868b]">
          Bal ₱{entry.balanceAfterPesos.toLocaleString()}
        </p>
      </div>
    </AppleCard>
  )
}

function SettlementRow({ row }: { row: WalletSettlement }) {
  return (
    <AppleCard className="p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-medium text-[#1d1d1f]">{row.settlementDate}</p>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
            row.status === 'finalized'
              ? 'bg-[#f0fdf4] text-[#248a3d]'
              : 'bg-[#fff8eb] text-[#bf4800]',
          )}
        >
          {row.status}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
        <div>
          <dt className="text-[#86868b]">Cash commissions</dt>
          <dd className="font-medium text-[#1d1d1f]">
            ₱{row.cashCommissionTotal.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-[#86868b]">Cashless earnings</dt>
          <dd className="font-medium text-[#1d1d1f]">
            ₱{row.cashlessEarningsTotal.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-[#86868b]">Net change</dt>
          <dd className="font-medium text-[#1d1d1f]">{formatPesos(row.netChange)}</dd>
        </div>
        <div>
          <dt className="text-[#86868b]">Bookings</dt>
          <dd className="font-medium text-[#1d1d1f]">{row.bookingCount}</dd>
        </div>
      </dl>
    </AppleCard>
  )
}

function PayoutRow({ payout }: { payout: DriverPayout }) {
  return (
    <AppleCard className="flex items-start justify-between gap-4 p-4">
      <div>
        <p className="text-[14px] font-medium text-[#1d1d1f]">
          ₱{payout.amountPesos.toLocaleString()}
        </p>
        <p className="mt-0.5 text-[12px] text-[#86868b]">
          {new Date(payout.createdAt).toLocaleString()}
        </p>
      </div>
      <span
        className={cn(
          'rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize',
          payout.status === 'paid' && 'bg-[#f0fdf4] text-[#248a3d]',
          payout.status === 'requested' && 'bg-[#f0f7ff] text-[#0066cc]',
          payout.status === 'approved' && 'bg-[#fff8eb] text-[#bf4800]',
          payout.status === 'rejected' && 'bg-[#fef2f2] text-[#b42318]',
        )}
      >
        {payout.status}
      </span>
    </AppleCard>
  )
}
