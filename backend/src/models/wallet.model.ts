import type {
  DriverPayout,
  DriverWallet,
  Payment,
  Prisma,
  WalletDailySettlement,
  WalletLedgerEntry,
} from '@prisma/client'
import {
  commissionFromBase,
  earningsFromBase,
  parseSettlementDate,
  startOfUtcDay,
} from '../lib/wallet.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/app-error.js'

type Tx = Prisma.TransactionClient

type BookingForSettlement = {
  id: string
  snapshot: { baseFareCents: number } | null
  payment: Payment | null
}

export type WalletSummary = {
  balancePesos: number
  currency: 'PHP'
  meaning: 'platform_owes_driver' | 'driver_owes_platform' | 'settled'
}

export type PresentedLedgerEntry = {
  id: string
  type: string
  amountPesos: number
  balanceAfterPesos: number
  baseFarePesos: number | null
  commissionPesos: number | null
  earningsPesos: number | null
  reason: string
  bookingId: string | null
  payoutId: string | null
  createdAt: string
}

export type PresentedSettlement = {
  id: string
  settlementDate: string
  cashCommissionTotal: number
  cashlessEarningsTotal: number
  netChange: number
  openingBalance: number
  closingBalance: number
  bookingCount: number
  status: string
  finalizedAt: string | null
}

export type PresentedPayout = {
  id: string
  amountPesos: number
  status: string
  method: string
  gcashNumber: string | null
  accountName: string | null
  bankName: string | null
  accountNumber: string | null
  adminNotes: string | null
  createdAt: string
  paidAt: string | null
  driver?: {
    id: string
    fullName: string | null
    email: string
  }
}

function presentLedger(entry: WalletLedgerEntry): PresentedLedgerEntry {
  return {
    id: entry.id,
    type: entry.type,
    amountPesos: entry.amountPesos,
    balanceAfterPesos: entry.balanceAfterPesos,
    baseFarePesos: entry.baseFarePesos,
    commissionPesos: entry.commissionPesos,
    earningsPesos: entry.earningsPesos,
    reason: entry.reason,
    bookingId: entry.bookingId,
    payoutId: entry.payoutId,
    createdAt: entry.createdAt.toISOString(),
  }
}

function presentSettlement(row: WalletDailySettlement): PresentedSettlement {
  return {
    id: row.id,
    settlementDate: row.settlementDate.toISOString().slice(0, 10),
    cashCommissionTotal: row.cashCommissionTotal,
    cashlessEarningsTotal: row.cashlessEarningsTotal,
    netChange: row.netChange,
    openingBalance: row.openingBalance,
    closingBalance: row.closingBalance,
    bookingCount: row.bookingCount,
    status: row.status,
    finalizedAt: row.finalizedAt?.toISOString() ?? null,
  }
}

function presentPayout(
  payout: DriverPayout & {
    driver?: { id: string; fullName: string | null; email: string }
  },
): PresentedPayout {
  return {
    id: payout.id,
    amountPesos: payout.amountPesos,
    status: payout.status,
    method: payout.method,
    gcashNumber: payout.gcashNumber,
    accountName: payout.accountName,
    bankName: payout.bankName,
    accountNumber: payout.accountNumber,
    adminNotes: payout.adminNotes,
    createdAt: payout.createdAt.toISOString(),
    paidAt: payout.paidAt?.toISOString() ?? null,
    ...(payout.driver
      ? {
          driver: {
            id: payout.driver.id,
            fullName: payout.driver.fullName,
            email: payout.driver.email,
          },
        }
      : {}),
  }
}

function balanceMeaning(balancePesos: number): WalletSummary['meaning'] {
  if (balancePesos > 0) return 'platform_owes_driver'
  if (balancePesos < 0) return 'driver_owes_platform'
  return 'settled'
}

async function writeAudit(
  tx: Tx,
  input: {
    walletId: string | null
    actorProfileId?: string | null
    action: string
    entityType: string
    entityId?: string | null
    before?: Prisma.InputJsonValue
    after?: Prisma.InputJsonValue
    metadata?: Prisma.InputJsonValue
  },
) {
  await tx.walletAuditLog.create({
    data: {
      walletId: input.walletId,
      actorProfileId: input.actorProfileId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      before: input.before,
      after: input.after,
      metadata: input.metadata,
    },
  })
}

export async function ensureWallet(tx: Tx, driverId: string): Promise<DriverWallet> {
  const existing = await tx.driverWallet.findUnique({ where: { driverId } })
  if (existing) return existing

  const created = await tx.driverWallet.create({
    data: { driverId, balancePesos: 0 },
  })

  await writeAudit(tx, {
    walletId: created.id,
    actorProfileId: driverId,
    action: 'wallet_created',
    entityType: 'DriverWallet',
    entityId: created.id,
    after: { balancePesos: 0 },
  })

  return created
}

export async function postBookingSettlement(
  tx: Tx,
  input: {
    driverId: string
    booking: BookingForSettlement
    actorProfileId?: string | null
  },
): Promise<WalletLedgerEntry | null> {
  const { driverId, booking, actorProfileId } = input

  const existing = await tx.walletLedgerEntry.findUnique({
    where: { bookingId: booking.id },
  })
  if (existing) return existing

  const payment = booking.payment
  if (!payment) {
    const wallet = await ensureWallet(tx, driverId)
    await writeAudit(tx, {
      walletId: wallet.id,
      actorProfileId: actorProfileId ?? driverId,
      action: 'booking_settlement_skipped',
      entityType: 'Booking',
      entityId: booking.id,
      metadata: { reason: 'missing_payment' },
    })
    return null
  }

  const baseFarePesos = booking.snapshot
    ? Math.round(booking.snapshot.baseFareCents / 100)
    : 0

  if (baseFarePesos <= 0) {
    const wallet = await ensureWallet(tx, driverId)
    await writeAudit(tx, {
      walletId: wallet.id,
      actorProfileId: actorProfileId ?? driverId,
      action: 'booking_settlement_skipped',
      entityType: 'Booking',
      entityId: booking.id,
      metadata: { reason: 'invalid_base_fare' },
    })
    return null
  }

  const commissionPesos = commissionFromBase(baseFarePesos)
  const earningsPesos = earningsFromBase(baseFarePesos)

  let amountPesos: number
  let type: 'cash_commission' | 'cashless_earnings'
  let reason: string

  if (payment.provider === 'cash') {
    amountPesos = -commissionPesos
    type = 'cash_commission'
    reason = 'Platform commission owed'
  } else if (payment.provider === 'paymongo') {
    if (payment.status !== 'succeeded') {
      const wallet = await ensureWallet(tx, driverId)
      await writeAudit(tx, {
        walletId: wallet.id,
        actorProfileId: actorProfileId ?? driverId,
        action: 'booking_settlement_skipped',
        entityType: 'Booking',
        entityId: booking.id,
        metadata: {
          reason: 'paymongo_not_succeeded',
          status: payment.status,
        },
      })
      return null
    }
    amountPesos = earningsPesos
    type = 'cashless_earnings'
    reason = 'Cashless earnings'
  } else {
    const wallet = await ensureWallet(tx, driverId)
    await writeAudit(tx, {
      walletId: wallet.id,
      actorProfileId: actorProfileId ?? driverId,
      action: 'booking_settlement_skipped',
      entityType: 'Booking',
      entityId: booking.id,
      metadata: { reason: 'unknown_provider', provider: payment.provider },
    })
    return null
  }

  const wallet = await ensureWallet(tx, driverId)
  const beforeBalance = wallet.balancePesos
  const balanceAfterPesos = beforeBalance + amountPesos

  const entry = await tx.walletLedgerEntry.create({
    data: {
      walletId: wallet.id,
      bookingId: booking.id,
      type,
      amountPesos,
      balanceAfterPesos,
      baseFarePesos,
      commissionPesos,
      earningsPesos,
      reason,
      idempotencyKey: `booking:${booking.id}`,
    },
  })

  await tx.driverWallet.update({
    where: { id: wallet.id },
    data: { balancePesos: balanceAfterPesos },
  })

  await writeAudit(tx, {
    walletId: wallet.id,
    actorProfileId: actorProfileId ?? driverId,
    action: 'booking_settled',
    entityType: 'WalletLedgerEntry',
    entityId: entry.id,
    before: { balancePesos: beforeBalance },
    after: {
      balancePesos: balanceAfterPesos,
      type,
      amountPesos,
      bookingId: booking.id,
    },
  })

  return entry
}

export const WalletModel = {
  async getSummary(driverId: string): Promise<WalletSummary> {
    const wallet = await prisma.$transaction(async (tx) => ensureWallet(tx, driverId))
    return {
      balancePesos: wallet.balancePesos,
      currency: 'PHP',
      meaning: balanceMeaning(wallet.balancePesos),
    }
  },

  async getHistory(
    driverId: string,
    opts: { limit?: number; cursor?: string } = {},
  ): Promise<{ items: PresentedLedgerEntry[]; nextCursor: string | null }> {
    const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100)
    const wallet = await prisma.driverWallet.findUnique({ where: { driverId } })
    if (!wallet) {
      return { items: [], nextCursor: null }
    }

    const rows = await prisma.walletLedgerEntry.findMany({
      where: { walletId: wallet.id },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(opts.cursor
        ? {
            cursor: { id: opts.cursor },
            skip: 1,
          }
        : {}),
    })

    const hasMore = rows.length > limit
    const page = hasMore ? rows.slice(0, limit) : rows
    return {
      items: page.map(presentLedger),
      nextCursor: hasMore ? page[page.length - 1]!.id : null,
    }
  },

  async listSettlements(driverId: string): Promise<PresentedSettlement[]> {
    const rows = await prisma.walletDailySettlement.findMany({
      where: { driverId },
      orderBy: { settlementDate: 'desc' },
      take: 60,
    })
    return rows.map(presentSettlement)
  },

  async listPayouts(driverId: string): Promise<PresentedPayout[]> {
    const rows = await prisma.driverPayout.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return rows.map(presentPayout)
  },

  async requestPayout(
    driverId: string,
    amountPesos: number,
  ): Promise<PresentedPayout> {
    if (!Number.isInteger(amountPesos) || amountPesos <= 0) {
      throw new AppError('Payout amount must be a positive whole number', 400)
    }

    return prisma.$transaction(async (tx) => {
      const wallet = await ensureWallet(tx, driverId)
      if (wallet.balancePesos <= 0) {
        throw new AppError('No positive balance available for payout', 400)
      }
      if (amountPesos > wallet.balancePesos) {
        throw new AppError('Payout amount exceeds available balance', 400)
      }

      const application = await tx.driverApplication.findUnique({
        where: { profileId: driverId },
        include: { bankAccount: true },
      })
      const bank = application?.bankAccount

      const payout = await tx.driverPayout.create({
        data: {
          driverId,
          amountPesos,
          status: 'requested',
          method: 'manual',
          gcashNumber: bank?.gcashNumber ?? null,
          accountName: bank?.accountName ?? null,
          bankName: bank?.bankName ?? null,
          accountNumber: bank?.accountNumber ?? null,
        },
      })

      await writeAudit(tx, {
        walletId: wallet.id,
        actorProfileId: driverId,
        action: 'payout_requested',
        entityType: 'DriverPayout',
        entityId: payout.id,
        after: { amountPesos, status: 'requested' },
      })

      return presentPayout(payout)
    })
  },

  async listAllWallets() {
    const wallets = await prisma.driverWallet.findMany({
      include: {
        driver: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return wallets.map((w) => ({
      id: w.id,
      driverId: w.driverId,
      balancePesos: w.balancePesos,
      meaning: balanceMeaning(w.balancePesos),
      updatedAt: w.updatedAt.toISOString(),
      driver: w.driver,
    }))
  },

  async getDriverWalletAdmin(driverId: string) {
    const summary = await this.getSummary(driverId)
    const history = await this.getHistory(driverId, { limit: 50 })
    const settlements = await this.listSettlements(driverId)
    const payouts = await this.listPayouts(driverId)
    const driver = await prisma.profile.findUnique({
      where: { id: driverId },
      select: { id: true, fullName: true, email: true },
    })
    if (!driver) throw new AppError('Driver not found', 404)

    return {
      driver,
      wallet: summary,
      history: history.items,
      settlements,
      payouts,
    }
  },

  async listSettlementsByDate(dateStr: string): Promise<PresentedSettlement[]> {
    const date = parseSettlementDate(dateStr)
    if (!date) throw new AppError('Invalid settlement date (YYYY-MM-DD)', 400)

    const rows = await prisma.walletDailySettlement.findMany({
      where: { settlementDate: date },
      orderBy: { driverId: 'asc' },
    })
    return rows.map(presentSettlement)
  },

  async finalizeDailySettlement(
    dateStr: string,
    opts: { driverId?: string; actorProfileId?: string } = {},
  ): Promise<PresentedSettlement[]> {
    const date = parseSettlementDate(dateStr)
    if (!date) throw new AppError('Invalid settlement date (YYYY-MM-DD)', 400)

    const dayStart = startOfUtcDay(date)
    const dayEnd = new Date(dayStart)
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1)

    const driverFilter = opts.driverId
      ? { driverId: opts.driverId }
      : undefined

    const wallets = await prisma.driverWallet.findMany({
      where: driverFilter ? { driverId: driverFilter.driverId } : undefined,
      select: { id: true, driverId: true, balancePesos: true },
    })

    const results: PresentedSettlement[] = []

    for (const wallet of wallets) {
      const settlement = await prisma.$transaction(async (tx) => {
        const existing = await tx.walletDailySettlement.findUnique({
          where: {
            driverId_settlementDate: {
              driverId: wallet.driverId,
              settlementDate: dayStart,
            },
          },
        })

        if (existing?.status === 'finalized') {
          return existing
        }

        const entries = await tx.walletLedgerEntry.findMany({
          where: {
            walletId: wallet.id,
            createdAt: { gte: dayStart, lt: dayEnd },
            type: { in: ['cash_commission', 'cashless_earnings'] },
          },
          orderBy: { createdAt: 'asc' },
        })

        if (entries.length === 0 && !existing) {
          return null
        }

        let cashCommissionTotal = 0
        let cashlessEarningsTotal = 0
        for (const entry of entries) {
          if (entry.type === 'cash_commission') {
            cashCommissionTotal += Math.abs(entry.amountPesos)
          } else if (entry.type === 'cashless_earnings') {
            cashlessEarningsTotal += entry.amountPesos
          }
        }

        const netChange = entries.reduce((sum, e) => sum + e.amountPesos, 0)
        const openingBalance =
          entries.length > 0
            ? entries[0]!.balanceAfterPesos - entries[0]!.amountPesos
            : (existing?.openingBalance ?? wallet.balancePesos)
        const closingBalance =
          entries.length > 0
            ? entries[entries.length - 1]!.balanceAfterPesos
            : (existing?.closingBalance ?? wallet.balancePesos)

        const row = await tx.walletDailySettlement.upsert({
          where: {
            driverId_settlementDate: {
              driverId: wallet.driverId,
              settlementDate: dayStart,
            },
          },
          create: {
            driverId: wallet.driverId,
            settlementDate: dayStart,
            cashCommissionTotal,
            cashlessEarningsTotal,
            netChange,
            openingBalance,
            closingBalance,
            bookingCount: entries.length,
            status: 'finalized',
            finalizedAt: new Date(),
          },
          update: {
            cashCommissionTotal,
            cashlessEarningsTotal,
            netChange,
            openingBalance,
            closingBalance,
            bookingCount: entries.length,
            status: 'finalized',
            finalizedAt: new Date(),
          },
        })

        await tx.walletLedgerEntry.updateMany({
          where: { id: { in: entries.map((e) => e.id) } },
          data: { settlementId: row.id },
        })

        await writeAudit(tx, {
          walletId: wallet.id,
          actorProfileId: opts.actorProfileId ?? null,
          action: 'settlement_finalized',
          entityType: 'WalletDailySettlement',
          entityId: row.id,
          after: {
            settlementDate: dateStr,
            cashCommissionTotal,
            cashlessEarningsTotal,
            netChange,
            bookingCount: entries.length,
          },
        })

        return row
      })

      if (settlement) results.push(presentSettlement(settlement))
    }

    return results
  },

  async listAllPayouts(status?: string): Promise<PresentedPayout[]> {
    const rows = await prisma.driverPayout.findMany({
      where: status
        ? {
            status: status as
              | 'requested'
              | 'approved'
              | 'paid'
              | 'rejected',
          }
        : undefined,
      include: {
        driver: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return rows.map(presentPayout)
  },

  async adminUpdatePayout(
    payoutId: string,
    input: {
      status: 'approved' | 'paid' | 'rejected'
      adminNotes?: string
      actorProfileId: string
    },
  ): Promise<PresentedPayout> {
    return prisma.$transaction(async (tx) => {
      const payout = await tx.driverPayout.findUnique({
        where: { id: payoutId },
        include: {
          driver: { select: { id: true, fullName: true, email: true } },
        },
      })
      if (!payout) throw new AppError('Payout not found', 404)

      if (payout.status === 'paid') {
        throw new AppError('Payout is already paid', 409)
      }
      if (payout.status === 'rejected') {
        throw new AppError('Payout is already rejected', 409)
      }

      if (input.status === 'paid') {
        const wallet = await ensureWallet(tx, payout.driverId)
        if (payout.amountPesos > wallet.balancePesos) {
          throw new AppError('Payout amount exceeds current wallet balance', 400)
        }

        const beforeBalance = wallet.balancePesos
        const balanceAfterPesos = beforeBalance - payout.amountPesos

        const entry = await tx.walletLedgerEntry.create({
          data: {
            walletId: wallet.id,
            payoutId: payout.id,
            type: 'payout',
            amountPesos: -payout.amountPesos,
            balanceAfterPesos,
            reason: 'Driver payout',
            idempotencyKey: `payout:${payout.id}`,
          },
        })

        await tx.driverWallet.update({
          where: { id: wallet.id },
          data: { balancePesos: balanceAfterPesos },
        })

        const updated = await tx.driverPayout.update({
          where: { id: payout.id },
          data: {
            status: 'paid',
            adminNotes: input.adminNotes ?? payout.adminNotes,
            reviewedBy: input.actorProfileId,
            reviewedAt: new Date(),
            paidAt: new Date(),
          },
          include: {
            driver: { select: { id: true, fullName: true, email: true } },
          },
        })

        await writeAudit(tx, {
          walletId: wallet.id,
          actorProfileId: input.actorProfileId,
          action: 'payout_paid',
          entityType: 'DriverPayout',
          entityId: payout.id,
          before: { balancePesos: beforeBalance, status: payout.status },
          after: {
            balancePesos: balanceAfterPesos,
            status: 'paid',
            ledgerEntryId: entry.id,
          },
        })

        return presentPayout(updated)
      }

      const updated = await tx.driverPayout.update({
        where: { id: payout.id },
        data: {
          status: input.status,
          adminNotes: input.adminNotes ?? payout.adminNotes,
          reviewedBy: input.actorProfileId,
          reviewedAt: new Date(),
        },
        include: {
          driver: { select: { id: true, fullName: true, email: true } },
        },
      })

      const wallet = await ensureWallet(tx, payout.driverId)
      await writeAudit(tx, {
        walletId: wallet.id,
        actorProfileId: input.actorProfileId,
        action: `payout_${input.status}`,
        entityType: 'DriverPayout',
        entityId: payout.id,
        before: { status: payout.status },
        after: { status: input.status },
      })

      return presentPayout(updated)
    })
  },
}
