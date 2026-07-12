export type SeatStatus = 'available' | 'occupied' | 'selected'

export type Seat = {
  id: string
  label: string
  status: SeatStatus
}

export type PassengerDetails = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type TripAddresses = {
  pickupAddress: string
  dropoffAddress: string
}

export type PaymentMethod = 'qrph'

export function formatPrice(amount: number): string {
  return `₱${amount.toLocaleString()}`
}

export function calculateTotals(baseFare: number) {
  const serviceFee = Math.round(baseFare * 0.04)
  const tax = 0
  const total = baseFare + serviceFee

  return { baseFare, serviceFee, tax, total }
}
