import type { VanResult } from '@/components/find-vans/van-result-card'
import { vanResults } from '@/components/find-vans/van-result-card'

export type SeatStatus = 'available' | 'occupied' | 'selected'

export type Seat = {
  id: string
  label: string
  status: SeatStatus
  premium?: boolean
}

export type PassengerDetails = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type PaymentMethod = 'card' | 'bank' | 'wallet'

export const PREMIUM_SEAT_FEE = 150

export const defaultSeats: Seat[] = [
  { id: '1A', label: '1A', status: 'selected', premium: true },
  { id: '2A', label: '2A', status: 'available' },
  { id: '2B', label: '2B', status: 'available' },
  { id: '3A', label: '3A', status: 'available' },
  { id: '3B', label: '3B', status: 'occupied' },
  { id: '3C', label: '3C', status: 'available' },
]

export function getVanById(vanId: string): VanResult | undefined {
  return vanResults.find((van) => van.id === vanId)
}

export function formatPrice(amount: number): string {
  return `₱${amount.toLocaleString()}`
}

export function calculateTotals(baseFare: number, premiumSeat: boolean) {
  const premiumFee = premiumSeat ? PREMIUM_SEAT_FEE : 0
  const serviceFee = Math.round(baseFare * 0.05)
  const tax = Math.round((baseFare + premiumFee + serviceFee) * 0.05)
  const total = baseFare + premiumFee + serviceFee + tax

  return { baseFare, premiumFee, serviceFee, tax, total }
}
