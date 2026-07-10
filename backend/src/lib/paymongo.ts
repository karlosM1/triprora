import { prisma } from './prisma.js'
import { AppError } from '../utils/app-error.js'

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY

if (!PAYMONGO_SECRET_KEY) {
  throw new Error('PAYMONGO_SECRET_KEY must be set')
}

const PAYMONGO_API_BASE = 'https://api.paymongo.com/v1'
const BASIC_AUTH_HEADER =
  'Basic ' + Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString('base64')

type PaymongoErrorBody = {
  errors?: { detail?: string; code?: string }[]
  message?: string
}

export async function paymongoRequest(path: string, init: RequestInit = {}) {
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
    throw new AppError(message, response.status >= 400 && response.status < 600 ? response.status : 502)
  }

  return json as any
}

export async function syncPaymentStatus(userId: string, paymentIntentId: string) {
  const payment = await prisma.payment.findFirst({
    where: {
      providerIntentId: paymentIntentId,
      userId,
    },
  })

  if (!payment) {
    throw new AppError('Payment not found', 404)
  }

  const intentResponse = await paymongoRequest(
    `/payment_intents/${encodeURIComponent(paymentIntentId)}`,
    { method: 'GET' },
  )

  const data = intentResponse.data
  const status = data.attributes.status as string

  return prisma.payment.update({
    where: { id: payment.id },
    data: {
      status,
      rawPayload: data,
    },
  })
}
