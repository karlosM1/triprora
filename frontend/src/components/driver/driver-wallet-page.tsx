import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AppleCard, PageHeader, SectionTitle } from '@/components/layout/page-header'
import {
  driverWalletHistoryQueryKey,
  driverWalletQueryKey,
  driverWalletSettlementsQueryKey,
  fetchDriverWallet,
  fetchDriverWalletHistory,
  fetchDriverWalletSettlements,
  type WalletLedgerEntry,
  type WalletSettlement,
} from '@/lib/api/wallet'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

function formatPesos(amount: number) {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : ''
  return `${sign}₱${Math.abs(amount).toLocaleString()}`
}

function ledgerTypeLabel(type: string) {
  switch (type) {
    case 'cash_commission':
      return 'System fee'
    case 'settlement_adjustment':
      return 'Fee adjustment'
    case 'cashless_earnings':
      return 'Legacy cashless earnings'
    case 'payout':
      return 'Legacy payout'
    case 'manual_adjustment':
      return 'Manual adjustment'
    default:
      return type
  }
}

export function DriverWalletPage() {
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

  const wallet = walletQuery.data
  const systemFeeDue = wallet?.systemFeeDuePesos ?? Math.max(0, -(wallet?.balancePesos ?? 0))

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
          subtitle="Track the system fee you owe Crabr whenever a passenger books your trip."
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <AppleCard className="p-6">
          <p className="text-[13px] font-medium text-[#86868b]">System fees due</p>
          <p
            className={cn(
              'mt-2 text-[36px] font-semibold tracking-[-0.02em]',
              systemFeeDue > 0 ? 'text-[#b42318]' : 'text-[#1d1d1f]',
            )}
          >
            {walletQuery.isLoading ? '…' : `₱${systemFeeDue.toLocaleString()}`}
          </p>
          <p className="mt-1 text-[13px] text-[#86868b]">
            {systemFeeDue > 0
              ? 'This is the total 4% system fee from passenger bookings that you need to pay to the platform.'
              : 'No system fees outstanding right now.'}
          </p>
          <p className="mt-3 text-[12px] text-[#86868b]">
            Each new passenger booking adds the system fee to this balance. Cancelled
            or declined bookings remove that fee.
          </p>
        </AppleCard>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <SectionTitle
          title="Fee history"
          subtitle="Every system fee added or reversed on your trips."
        />
        <div className="mt-4 space-y-3">
          {(historyQuery.data?.items ?? []).length === 0 ? (
            <AppleCard className="border border-dashed border-[#d2d2d7] bg-transparent px-6 py-10 text-center">
              <p className="text-[15px] text-[#86868b]">
                No fees yet. When a passenger books your trip, the system fee will
                appear here.
              </p>
            </AppleCard>
          ) : (
            (historyQuery.data?.items ?? []).map((entry) => (
              <LedgerRow key={entry.id} entry={entry} />
            ))
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <SectionTitle
          title="Daily settlements"
          subtitle="Snapshots of system fees owed for each day."
        />
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
          Due ₱{Math.max(0, -entry.balanceAfterPesos).toLocaleString()}
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
          <dt className="text-[#86868b]">System fees</dt>
          <dd className="font-medium text-[#1d1d1f]">
            ₱{row.cashCommissionTotal.toLocaleString()}
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
