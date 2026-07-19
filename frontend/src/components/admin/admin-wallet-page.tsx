import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { AppleCard, PageHeader, SectionTitle } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  adminDriverWalletQueryKey,
  adminPayoutsQueryKey,
  adminSettlementsQueryKey,
  adminWalletsQueryKey,
  fetchAdminDriverWallet,
  fetchAdminPayouts,
  fetchAdminSettlements,
  fetchAdminWallets,
  finalizeAdminSettlements,
  updateAdminPayout,
  type AdminWalletRow,
  type DriverPayout,
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

export function AdminWalletPage() {
  const queryClient = useQueryClient()
  const [settlementDate, setSettlementDate] = useState(todayIsoDate)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [payoutFilter, setPayoutFilter] = useState<string>('')
  const [message, setMessage] = useState<string | null>(null)

  const walletsQuery = useQuery({
    queryKey: adminWalletsQueryKey,
    queryFn: fetchAdminWallets,
  })

  const settlementsQuery = useQuery({
    queryKey: adminSettlementsQueryKey(settlementDate),
    queryFn: () => fetchAdminSettlements(settlementDate),
  })

  const payoutsQuery = useQuery({
    queryKey: [...adminPayoutsQueryKey, payoutFilter] as const,
    queryFn: () => fetchAdminPayouts(payoutFilter || undefined),
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

  const payoutMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: 'approved' | 'paid' | 'rejected'
    }) => updateAdminPayout(id, { status }),
    onSuccess: () => {
      setMessage('Payout updated.')
      queryClient.invalidateQueries({ queryKey: adminPayoutsQueryKey })
      queryClient.invalidateQueries({ queryKey: adminWalletsQueryKey })
      if (selectedDriverId) {
        queryClient.invalidateQueries({
          queryKey: adminDriverWalletQueryKey(selectedDriverId),
        })
      }
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      setMessage(err.response?.data?.message ?? 'Failed to update payout.')
    },
  })

  const wallets = walletsQuery.data ?? []
  const totals = useMemo(() => {
    const positive = wallets
      .filter((w) => w.balancePesos > 0)
      .reduce((sum, w) => sum + w.balancePesos, 0)
    const negative = wallets
      .filter((w) => w.balancePesos < 0)
      .reduce((sum, w) => sum + w.balancePesos, 0)
    return { positive, negative, count: wallets.length }
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
          subtitle="Balances, daily settlements, and payout approvals."
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

      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-3">
        <AppleCard className="p-5">
          <p className="text-[13px] text-[#86868b]">Wallets</p>
          <p className="mt-1 text-[28px] font-semibold text-[#1d1d1f]">{totals.count}</p>
        </AppleCard>
        <AppleCard className="p-5">
          <p className="text-[13px] text-[#86868b]">Owed to drivers</p>
          <p className="mt-1 text-[28px] font-semibold text-[#248a3d]">
            ₱{totals.positive.toLocaleString()}
          </p>
        </AppleCard>
        <AppleCard className="p-5">
          <p className="text-[13px] text-[#86868b]">Owed by drivers</p>
          <p className="mt-1 text-[28px] font-semibold text-[#b42318]">
            ₱{Math.abs(totals.negative).toLocaleString()}
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
              subtitle={`Balance ₱${detailQuery.data.wallet.balancePesos.toLocaleString()}`}
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
        <SectionTitle
          title="Daily settlements"
          subtitle="Finalize a calendar day to snapshot cash commissions owed to the platform."
        />
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-[13px] text-[#86868b]">
            Date
            <input
              type="date"
              value={settlementDate}
              onChange={(e) => setSettlementDate(e.target.value)}
              className="mt-1.5 block h-11 rounded-xl border border-[#d2d2d7] bg-white px-3 text-base text-[#1d1d1f]"
            />
          </label>
          <Button
            className="h-11 rounded-full bg-[#0071e3] px-5 hover:bg-[#0077ed]"
            disabled={finalizeMutation.isPending}
            onClick={() => finalizeMutation.mutate()}
          >
            {finalizeMutation.isPending ? 'Finalizing…' : 'Finalize day'}
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          {(settlementsQuery.data ?? []).length === 0 ? (
            <AppleCard className="border border-dashed border-[#d2d2d7] bg-transparent px-6 py-8 text-center">
              <p className="text-[14px] text-[#86868b]">
                No settlements for this date yet.
              </p>
            </AppleCard>
          ) : (
            (settlementsQuery.data ?? []).map((row) => (
              <SettlementAdminRow key={row.id} row={row} />
            ))
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <SectionTitle title="Payouts" subtitle="Approve, reject, or mark paid." />
        <div className="mt-4 flex flex-wrap gap-2">
          {['', 'requested', 'approved', 'paid', 'rejected'].map((status) => (
            <button
              key={status || 'all'}
              type="button"
              onClick={() => setPayoutFilter(status)}
              className={cn(
                'rounded-full px-3 py-1.5 text-[12px] font-medium capitalize',
                payoutFilter === status
                  ? 'bg-[#1d1d1f] text-white'
                  : 'bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]',
              )}
            >
              {status || 'all'}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {(payoutsQuery.data ?? []).length === 0 ? (
            <AppleCard className="border border-dashed border-[#d2d2d7] bg-transparent px-6 py-8 text-center">
              <p className="text-[14px] text-[#86868b]">No payouts found.</p>
            </AppleCard>
          ) : (
            (payoutsQuery.data ?? []).map((payout) => (
              <PayoutAdminRow
                key={payout.id}
                payout={payout}
                busy={payoutMutation.isPending}
                onUpdate={(status) =>
                  payoutMutation.mutate({ id: payout.id, status })
                }
              />
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
          wallet.balancePesos > 0 && 'text-[#248a3d]',
          wallet.balancePesos < 0 && 'text-[#b42318]',
        )}
      >
        ₱{wallet.balancePesos.toLocaleString()}
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
          Cash commissions ₱{row.cashCommissionTotal.toLocaleString()} · Net{' '}
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

function PayoutAdminRow({
  payout,
  busy,
  onUpdate,
}: {
  payout: DriverPayout
  busy: boolean
  onUpdate: (status: 'approved' | 'paid' | 'rejected') => void
}) {
  return (
    <AppleCard className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-medium text-[#1d1d1f]">
            ₱{payout.amountPesos.toLocaleString()} ·{' '}
            {payout.driver?.fullName ?? payout.driver?.email ?? 'Driver'}
          </p>
          <p className="mt-0.5 text-[12px] text-[#86868b]">
            {payout.gcashNumber
              ? `GCash ${payout.gcashNumber}`
              : payout.accountNumber
                ? `${payout.bankName ?? 'Bank'} ${payout.accountNumber}`
                : 'No destination on file'}
          </p>
          <p className="mt-0.5 text-[12px] text-[#86868b]">
            {new Date(payout.createdAt).toLocaleString()} · {payout.status}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {payout.status === 'requested' && (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                className="rounded-full"
                onClick={() => onUpdate('approved')}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                className="rounded-full"
                onClick={() => onUpdate('rejected')}
              >
                Reject
              </Button>
            </>
          )}
          {(payout.status === 'requested' || payout.status === 'approved') && (
            <Button
              size="sm"
              disabled={busy}
              className="rounded-full bg-[#0071e3] hover:bg-[#0077ed]"
              onClick={() => onUpdate('paid')}
            >
              Mark paid
            </Button>
          )}
        </div>
      </div>
    </AppleCard>
  )
}
