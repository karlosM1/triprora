import type { Request, Response } from 'express'
import { syncPaymentStatus } from '../lib/paymongo.js'
import { DeliveryModel } from '../models/delivery.model.js'
import type { PaymentMethod } from '../models/delivery.types.js'
import { AppError } from '../utils/app-error.js'

export async function createDelivery(req: Request, res: Response) {
  const delivery = await DeliveryModel.create({
    userId: req.profile!.id,
    vanId: req.body.vanId,
    pickupAddress: req.body.pickupAddress,
    dropoffAddress: req.body.dropoffAddress,
    packageType: req.body.packageType,
    weightBand: req.body.weightBand,
    size: req.body.size,
    description: req.body.description,
    receiverName: req.body.receiverName,
    receiverPhone: req.body.receiverPhone,
    specialInstructions: req.body.specialInstructions,
  })

  res.status(201).json(delivery)
}

export async function payDelivery(req: Request, res: Response) {
  const profile = req.profile!
  const paymentMethod = (req.body.paymentMethod as PaymentMethod) ?? 'qrph'
  const paymentIntentId = req.body.paymentIntentId as string | undefined

  if (paymentMethod === 'qrph') {
    if (!paymentIntentId) {
      throw new AppError('paymentIntentId is required for QR Ph payments', 400)
    }

    const payment = await syncPaymentStatus(profile.id, paymentIntentId)

    if (payment.status !== 'succeeded') {
      throw new AppError(
        'Payment is not completed yet. Please finish paying via QR Ph.',
        402,
      )
    }
  }

  const delivery = await DeliveryModel.pay({
    userId: profile.id,
    deliveryId: req.params.deliveryId,
    paymentMethod,
    paymentIntentId,
  })

  res.json(delivery)
}

export async function listDeliveries(req: Request, res: Response) {
  const filter =
    (req.query.filter as 'upcoming' | 'history' | 'all' | undefined) ?? 'all'
  const deliveries = await DeliveryModel.list(req.profile!.id, filter)
  res.json(deliveries)
}

export async function getDelivery(req: Request, res: Response) {
  const delivery = await DeliveryModel.getById(
    req.profile!.id,
    req.params.deliveryId,
  )
  res.json(delivery)
}

export async function cancelDelivery(req: Request, res: Response) {
  const delivery = await DeliveryModel.cancel(
    req.profile!.id,
    req.params.deliveryId,
  )
  res.json(delivery)
}

export async function acceptDriverDelivery(req: Request, res: Response) {
  const delivery = await DeliveryModel.acceptByDriver(
    req.params.tripId,
    req.params.deliveryId,
    req.profile!.id,
    Number(req.body.deliveryFee),
  )
  res.json(delivery)
}

export async function declineDriverDelivery(req: Request, res: Response) {
  const delivery = await DeliveryModel.declineByDriver(
    req.params.tripId,
    req.params.deliveryId,
    req.profile!.id,
  )
  res.json(delivery)
}
