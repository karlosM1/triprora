import { api } from '@/lib/axios'

export type CreateQrPhPaymentResponse = {
  paymentIntentId: string
  clientKey: string
  qrImageUrl: string
  testUrl: string | null
  amount: number
  status: string
}

export async function createQrPhPayment(amount: number) {
  const { data } = await api.post<CreateQrPhPaymentResponse>('/payments/qrph', {
    amount,
  })
  return data
}

export type QrPhPaymentStatusResponse = {
  id: string
  status: string
  amount: number
  currency: string
  paid: boolean
}

export async function fetchQrPhPaymentStatus(paymentIntentId: string) {
  const { data } = await api.get<QrPhPaymentStatusResponse>(
    `/payments/qrph/${encodeURIComponent(paymentIntentId)}`,
  )
  return data
}
