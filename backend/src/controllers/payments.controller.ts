import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { paymongoRequest, syncPaymentStatus } from '../lib/paymongo.js'
import { AppError } from '../utils/app-error.js'

type PaymongoPaymentIntent = {
  id: string
  attributes: {
    client_key: string
    status?: string
  }
}

type PaymongoPaymentMethod = {
  id: string
}

export async function createQrPhPayment(req: Request, res: Response) {
  const profile = req.profile!
  const amount = Number(req.body.amount)

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError('Invalid amount', 400)
  }

  // Store pesos in our DB; PayMongo API still requires centavos.
  const amountInPesos = Math.round(amount)
  const amountInCents = amountInPesos * 100

  const intentResponse = await paymongoRequest('/payment_intents', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        attributes: {
          amount: amountInCents,
          currency: 'PHP',
          payment_method_allowed: ['qrph'],
          description: 'Triprora booking',
        },
      },
    }),
  })

  const intent: PaymongoPaymentIntent = intentResponse.data
  const paymentIntentId = intent.id
  const clientKey = intent.attributes.client_key

  const methodResponse = await paymongoRequest('/payment_methods', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        attributes: {
          type: 'qrph',
          expiry_seconds: 1800,
        },
      },
    }),
  })

  const paymentMethod: PaymongoPaymentMethod = methodResponse.data

  const attachResponse = await paymongoRequest(
    `/payment_intents/${paymentIntentId}/attach`,
    {
      method: 'POST',
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: paymentMethod.id,
            client_key: clientKey,
          },
        },
      }),
    },
  )

  const attributes = attachResponse.data.attributes
  const status = attributes.status ?? 'awaiting_next_action'
  const nextActionCode = attributes.next_action?.code ?? attributes.next_action?.qrph
  const qrCodeImageUrl = nextActionCode?.image_url || null
  // PayMongo test mode: open this URL to simulate success/fail (do not scan real QR)
  const testUrl =
    nextActionCode?.test_url ||
    attributes.next_action?.redirect?.url ||
    null

  if (!qrCodeImageUrl) {
    throw new AppError('Failed to generate QR Ph code from PayMongo', 502)
  }

  await prisma.payment.create({
    data: {
      userId: profile.id,
      provider: 'paymongo',
      providerIntentId: paymentIntentId,
      providerMethodId: paymentMethod.id,
      amount: amountInPesos,
      currency: 'PHP',
      status,
      rawPayload: attachResponse.data,
    },
  })

  return res.json({
    paymentIntentId,
    clientKey,
    qrImageUrl: qrCodeImageUrl,
    testUrl,
    amount: amountInPesos,
    status,
  })
}

export async function getQrPhPaymentStatus(req: Request, res: Response) {
  const profile = req.profile!
  const { paymentIntentId } = req.params

  if (!paymentIntentId) {
    throw new AppError('paymentIntentId is required', 400)
  }

  const updated = await syncPaymentStatus(profile.id, paymentIntentId)

  return res.json({
    id: updated.providerIntentId,
    status: updated.status,
    amount: updated.amount,
    currency: updated.currency,
    paid: updated.status === 'succeeded',
  })
}
