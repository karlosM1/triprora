import { api } from '@/lib/axios'
import type {
  DestinationAddress,
  DestinationAddressPayload,
} from '@/lib/types/profile'

export async function fetchDestinationAddresses() {
  const { data } = await api.get<DestinationAddress[]>('/me/destinations')
  return data
}

export async function createDestinationAddress(payload: DestinationAddressPayload) {
  const { data } = await api.post<DestinationAddress>('/me/destinations', payload)
  return data
}

export async function updateDestinationAddress(
  id: string,
  payload: DestinationAddressPayload,
) {
  const { data } = await api.patch<DestinationAddress>(
    `/me/destinations/${id}`,
    payload,
  )
  return data
}

export async function deleteDestinationAddress(id: string) {
  await api.delete(`/me/destinations/${id}`)
}

export const destinationAddressesQueryKey = ['profile', 'destinations'] as const
