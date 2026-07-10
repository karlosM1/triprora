import type { Request, Response } from 'express'

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY

if (!PAYMONGO_SECRET_KEY) {
  throw new Error('PAYMONGO_SECRET_KEY must be set')
}

const PAYMONGO_API_BASE = 'https://api.paymongo.com/v1'
const BASIC_AUTH_HEADER =
  'Basic ' + Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString('base64')

type PaymongoPaymentIntent = {
  id: string
  attributes: {
    client_key: string
  }
}

type PaymongoPaymentMethod = {
  id: string
}

type PaymongoErrorBody = {
  errors?: { detail?: string; code?: string }[]
  message?: string
}

async function paymongoRequest(path: string, init: RequestInit): Promise<any> {
  const response = await fetch(`${PAYMONGO_API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: BASIC_AUTH_HEADER,
      ...(init.headers ?? {}),
    },
  })

  const rawJson = await response.json().catch(() => null)
  const json = (rawJson ?? null) as PaymongoErrorBody | null

  if (!response.ok) {
    const message =
      (json &&
        (json.errors?.[0]?.detail ||
          json.errors?.[0]?.code ||
          json.message)) ||
      `PayMongo request failed with status ${response.status}`
    const error: any = new Error(message)
    error.status = response.status
    error.body = json
    throw error
  }

  return json
}

export async function createQrPhPayment(req: Request, res: Response) {
  const amount = Number(req.body.amount)

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' })
  }

  // PayMongo expects amount in centavos
  const amountInCents = Math.round(amount * 100)

  try {
    // 1. Create Payment Intent
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

    // 2. Create QR Ph Payment Method
    const methodResponse = await paymongoRequest('/payment_methods', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          attributes: {
            type: 'qrph',
            // Optional: 30 minutes expiry (configurable 60–9000 seconds)
            expiry_seconds: 1800,
          },
        },
      }),
    })

    const paymentMethod: PaymongoPaymentMethod = methodResponse.data

    // 3. Attach Payment Method to Intent
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
    const qrCodeImageUrl =
      attributes.next_action?.code?.image_url ||
      attributes.next_action?.qrph?.image_url ||
      null

    if (!qrCodeImageUrl) {
      return res.status(502).json({
        message: 'Failed to generate QR Ph code from PayMongo',
      })
    }

    return res.json({
      paymentIntentId,
      clientKey,
      qrImageUrl: qrCodeImageUrl,
      amount,
    })
  } catch (error: any) {
    const status =
      typeof error.status === 'number' && error.status >= 400 && error.status < 600
        ? error.status
        : 502

    return res.status(status).json({
      message:
        error.body?.errors?.[0]?.detail ||
        error.message ||
        'Failed to create QR Ph payment',
    })
  }
}

export async function getQrPhPaymentStatus(req: Request, res: Response) {
  const { paymentIntentId } = req.params

  if (!paymentIntentId) {
    return res.status(400).json({ message: 'paymentIntentId is required' })
  }

  try {
    const intentResponse = await paymongoRequest(
      `/payment_intents/${encodeURIComponent(paymentIntentId)}`,
      {
        method: 'GET',
      },
    )

    const data = intentResponse.data

    return res.json({
      id: data.id,
      status: data.attributes.status,
      amount: data.attributes.amount,
      currency: data.attributes.currency,
    })
  } catch (error: any) {
    const status =
      typeof error.status === 'number' && error.status >= 400 && error.status < 600
        ? error.status
        : 502

    return res.status(status).json({
      message:
        error.body?.errors?.[0]?.detail ||
        error.message ||
        'Failed to fetch QR Ph payment status',
    })
  }
}

