import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { AppleCard, PageHeader, SectionTitle } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  adminDriverWalletQueryKey,
  adminSettlementsQueryKey,
  adminWalletsQueryKey,
  fetchAdminDriverWallet,
  fetchAdminSettlements,
  fetchAdminWallets,
  finalizeAdminSettlements,
  type AdminWalletRow,
  type WalletSettlement,
} from '@/lib/api/wallet'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

function todayIsoDate() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatPesos(amount: number) {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : ''
  return `${sign}₱${Math.abs(amount).toLocaleString()}`
}

function feesDueFor(wallet: Pick<AdminWalletRow, 'systemFeeDuePesos' | 'balancePesos'>) {
  return wallet.systemFeeDuePesos ?? Math.max(0, -wallet.balancePesos)
}

export function AdminWalletPage() {
  const queryClient = useQueryClient()
  const [settlementDate, setSettlementDate] = useState(todayIsoDate)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const walletsQuery = useQuery({
    queryKey: adminWalletsQueryKey,
    queryFn: fetchAdminWallets,
  })

  const settlementsQuery = useQuery({
    queryKey: adminSettlementsQueryKey(settlementDate),
    queryFn: () => fetchAdminSettlements(settlementDate),
  })

  const detailQuery = useQuery({
    queryKey: adminDriverWalletQueryKey(selectedDriverId ?? ''),
    queryFn: () => fetchAdminDriverWallet(selectedDriverId!),
    enabled: Boolean(selectedDriverId),
  })

  const finalizeMutation = useMutation({
    mutationFn: () => finalizeAdminSettlements({ date: settlementDate }),
    onSuccess: (rows) => {
      setMessage(`Finalized ${rows.length} settlement(s) for ${settlementDate}.`)
      queryClient.invalidateQueries({
        queryKey: adminSettlementsQueryKey(settlementDate),
      })
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      setMessage(err.response?.data?.message ?? 'Failed to finalize settlements.')
    },
  })

  const wallets = walletsQuery.data ?? []
  const totals = useMemo(() => {
    const feesDue = wallets.reduce((sum, w) => sum + feesDueFor(w), 0)
    return { feesDue, count: wallets.length }
  }, [wallets])

  return (
    <motion.div
      className="space-y-10"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <PageHeader
          eyebrow="Admin"
          title="Driver wallets."
          subtitle="System fees drivers owe from passenger bookings, plus daily settlements."
        />
      </motion.div>

      {message && (
        <motion.p
          variants={fadeInUp}
          className="rounded-xl bg-[#f5f5f7] px-4 py-3 text-[13px] text-[#1d1d1f]"
        >
          {message}
        </motion.p>
      )}

      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-2">
        <AppleCard className="p-5">
          <p className="text-[13px] text-[#86868b]">Wallets</p>
          <p className="mt-1 text-[28px] font-semibold text-[#1d1d1f]">{totals.count}</p>
        </AppleCard>
        <AppleCard className="p-5">
          <p className="text-[13px] text-[#86868b]">System fees due</p>
          <p className="mt-1 text-[28px] font-semibold text-[#b42318]">
            ₱{totals.feesDue.toLocaleString()}
          </p>
        </AppleCard>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <SectionTitle title="All wallets" subtitle="Select a driver to inspect ledger detail." />
        <div className="mt-4 space-y-2">
          {wallets.length === 0 ? (
            <AppleCard className="border border-dashed border-[#d2d2d7] bg-transparent px-6 py-10 text-center">
              <p className="text-[14px] text-[#86868b]">No driver wallets yet.</p>
            </AppleCard>
          ) : (
            wallets.map((wallet) => (
              <WalletListRow
                key={wallet.id}
                wallet={wallet}
                selected={selectedDriverId === wallet.driverId}
                onSelect={() => setSelectedDriverId(wallet.driverId)}
              />
            ))
          )}
        </div>
      </motion.div>

      {selectedDriverId && detailQuery.data && (
        <motion.div variants={fadeInUp}>
          <AppleCard className="p-6">
            <SectionTitle
              title={detailQuery.data.driver.fullName ?? detailQuery.data.driver.email}
              subtitle={`System fees due ₱${feesDueFor(detailQuery.data.wallet).toLocaleString()}`}
            />
            <div className="mt-4 space-y-2">
              {detailQuery.data.history.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between border-b border-black/5 py-2 text-[13px] last:border-0"
                >
                  <div>
                    <p className="font-medium text-[#1d1d1f]">{entry.reason}</p>
                    <p className="text-[#86868b]">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p
                    className={cn(
                      'font-semibold',
                      entry.amountPesos > 0 && 'text-[#248a3d]',
                      entry.amountPesos < 0 && 'text-[#b42318]',
                    )}
                  >
                    {formatPesos(entry.amountPesos)}
                  </p>
                </div>
              ))}
            </div>
          </AppleCard>
        </motion.div>
      )}

      <motion.div variants={fadeInUp}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            title="Daily settlements"
            subtitle="Finalize a day to snapshot system fees owed."
          />
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-[13px] text-[#86868b]">
              Date
              <input
                type="date"
                value={settlementDate}
                onChange={(e) => setSettlementDate(e.target.value)}
                className="mt-1.5 block h-10 rounded-xl border border-[#d2d2d7] bg-white px-3 text-[14px] text-[#1d1d1f]"
              />
            </label>
            <Button
              className="h-10 rounded-full bg-[#0071e3] px-5 hover:bg-[#0077ed]"
              disabled={finalizeMutation.isPending}
              onClick={() => finalizeMutation.mutate()}
            >
              {finalizeMutation.isPending ? 'Finalizing…' : 'Finalize day'}
            </Button>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {(settlementsQuery.data ?? []).length === 0 ? (
            <AppleCard className="border border-dashed border-[#d2d2d7] bg-transparent px-6 py-8 text-center">
              <p className="text-[14px] text-[#86868b]">
                No settlements for this date.
              </p>
            </AppleCard>
          ) : (
            (settlementsQuery.data ?? []).map((row) => (
              <SettlementAdminRow key={row.id} row={row} />
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function WalletListRow({
  wallet,
  selected,
  onSelect,
}: {
  wallet: AdminWalletRow
  selected: boolean
  onSelect: () => void
}) {
  const due = feesDueFor(wallet)
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left ring-1 transition-colors',
        selected ? 'ring-[#0071e3]' : 'ring-[#e5e5ea] hover:bg-[#fafafa]',
      )}
    >
      <div>
        <p className="text-[14px] font-medium text-[#1d1d1f]">
          {wallet.driver.fullName ?? wallet.driver.email}
        </p>
        <p className="text-[12px] text-[#86868b]">{wallet.driver.email}</p>
      </div>
      <p
        className={cn(
          'text-[15px] font-semibold',
          due > 0 ? 'text-[#b42318]' : 'text-[#1d1d1f]',
        )}
      >
        ₱{due.toLocaleString()}
      </p>
    </button>
  )
}

function SettlementAdminRow({ row }: { row: WalletSettlement }) {
  return (
    <AppleCard className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="text-[14px] font-medium text-[#1d1d1f]">{row.settlementDate}</p>
        <p className="text-[12px] text-[#86868b]">
          System fees ₱{row.cashCommissionTotal.toLocaleString()} · Net{' '}
          {formatPesos(row.netChange)}
        </p>
      </div>
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
    </AppleCard>
  )
}
