import type { Request, Response } from 'express'
import { WalletModel } from '../models/wallet.model.js'

export async function getDriverWallet(req: Request, res: Response) {
  const summary = await WalletModel.getSummary(req.profile!.id)
  res.json(summary)
}

export async function getDriverWalletHistory(req: Request, res: Response) {
  const history = await WalletModel.getHistory(req.profile!.id, {
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    cursor: typeof req.query.cursor === 'string' ? req.query.cursor : undefined,
  })
  res.json(history)
}

export async function getDriverWalletSettlements(req: Request, res: Response) {
  const settlements = await WalletModel.listSettlements(req.profile!.id)
  res.json(settlements)
}

export async function getDriverWalletPayouts(req: Request, res: Response) {
  const payouts = await WalletModel.listPayouts(req.profile!.id)
  res.json(payouts)
}

export async function listAdminWallets(_req: Request, res: Response) {
  const wallets = await WalletModel.listAllWallets()
  res.json(wallets)
}

export async function getAdminDriverWallet(req: Request, res: Response) {
  const detail = await WalletModel.getDriverWalletAdmin(req.params.driverId)
  res.json(detail)
}

export async function listAdminSettlements(req: Request, res: Response) {
  const date = String(req.query.date)
  const settlements = await WalletModel.listSettlementsByDate(date)
  res.json(settlements)
}

export async function finalizeAdminSettlements(req: Request, res: Response) {
  const settlements = await WalletModel.finalizeDailySettlement(req.body.date, {
    driverId: req.body.driverId,
    actorProfileId: req.profile!.id,
  })
  res.json(settlements)
}

export async function listAdminPayouts(req: Request, res: Response) {
  const status =
    typeof req.query.status === 'string' ? req.query.status : undefined
  const payouts = await WalletModel.listAllPayouts(status)
  res.json(payouts)
}

export async function updateAdminPayout(req: Request, res: Response) {
  const payout = await WalletModel.adminUpdatePayout(req.params.id, {
    status: req.body.status,
    adminNotes: req.body.adminNotes,
    actorProfileId: req.profile!.id,
  })
  res.json(payout)
}
