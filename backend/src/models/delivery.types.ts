export type PackageType =
  | 'documents'
  | 'food'
  | 'clothes'
  | 'electronics'
  | 'others'

export type PackageWeightBand = 'up_to_1kg' | 'one_to_5kg' | 'five_to_10kg'

export type PackageSize = 'small' | 'medium' | 'large'

export type DeliveryStatus =
  | 'pending'
  | 'accepted'
  | 'confirmed'
  | 'picked_up'
  | 'delivered'
  | 'declined'
  | 'cancelled'

export type PaymentMethod = 'qrph' | 'cash'

export type CreateDeliveryInput = {
  userId: string
  vanId: string
  pickupAddress: string
  dropoffAddress: string
  packageType: PackageType
  weightBand: PackageWeightBand
  size: PackageSize
  description: string
  receiverName: string
  receiverPhone: string
  specialInstructions?: string
}

export type PayDeliveryInput = {
  userId: string
  deliveryId: string
  paymentMethod: PaymentMethod
  paymentIntentId?: string
}

export type CreatedDelivery = {
  id: string
  reference: string
  route: string
  date: string
  time: string
  pickupAddress: string
  dropoffAddress: string
  packageType: PackageType
  weightBand: PackageWeightBand
  size: PackageSize
  description: string
  receiverName: string
  receiverPhone: string
  specialInstructions: string | null
  vehicle: string
  operator: string
  price: string
  status: DeliveryStatus
  canPay: boolean
  paymentMethod: PaymentMethod | null
  isPaid: boolean
}

export type DeliveryListItem = {
  id: string
  reference: string
  date: string
  time: string
  route: string
  packageLabel: string
  pickupAddress: string
  dropoffAddress: string
  receiverName: string
  receiverPhone: string
  description?: string
  price: string
  status: DeliveryStatus
  canCancel: boolean
  canPay: boolean
  paymentMethod: PaymentMethod | null
  isPaid: boolean
}

export type DeliveryDetail = DeliveryListItem & {
  packageType: PackageType
  weightBand: PackageWeightBand
  size: PackageSize
  description: string
  specialInstructions: string | null
  vehicle: string
  tripType: string | null
  vanId: string | null
  baseFare: number
  serviceFee: number
  total: number
}

export type DriverDeliveryRequest = {
  id: string
  reference: string
  status: DeliveryStatus
  packageLabel: string
  description: string
  packageType: PackageType
  weightBand: PackageWeightBand
  size: PackageSize
  pickupAddress: string
  dropoffAddress: string
  receiverName: string
  receiverPhone: string
  specialInstructions: string | null
  price: string
  suggestedFee: number
  senderName: string
  senderPhone: string | null
  createdAt: string
  paymentMethod: PaymentMethod | null
  isPaid: boolean
}
