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
