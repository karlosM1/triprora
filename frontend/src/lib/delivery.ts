import type {
  PackageSize,
  PackageType,
  PackageWeightBand,
} from '@/lib/types/api'

export const PACKAGE_TYPES: { value: PackageType; label: string }[] = [
  { value: 'documents', label: 'Documents' },
  { value: 'food', label: 'Food' },
  { value: 'clothes', label: 'Clothes' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'others', label: 'Others' },
]

export const PACKAGE_WEIGHT_BANDS: {
  value: PackageWeightBand
  label: string
}[] = [
  { value: 'up_to_1kg', label: '0 – 1 kg' },
  { value: 'one_to_5kg', label: '1 – 5 kg' },
  { value: 'five_to_10kg', label: '5 – 10 kg' },
]

export const PACKAGE_SIZES: {
  value: PackageSize
  label: string
  hint: string
}[] = [
  { value: 'small', label: 'Small', hint: 'Fits in a small bag or envelope' },
  { value: 'medium', label: 'Medium', hint: 'Shoebox or small carton' },
  { value: 'large', label: 'Large', hint: 'Needs both hands / large box' },
]

/** Base delivery fee in pesos before package surcharges. */
export const DELIVERY_BASE_FEE_PESOS = 80

const PACKAGE_TYPE_SURCHARGE: Record<PackageType, number> = {
  documents: 0,
  clothes: 20,
  food: 40,
  electronics: 60,
  others: 30,
}

const PACKAGE_SIZE_SURCHARGE: Record<PackageSize, number> = {
  small: 0,
  medium: 40,
  large: 80,
}

const PACKAGE_WEIGHT_SURCHARGE: Record<PackageWeightBand, number> = {
  up_to_1kg: 0,
  one_to_5kg: 50,
  five_to_10kg: 100,
}

export type PackageDetails = {
  packageType: PackageType
  weightBand: PackageWeightBand
  size: PackageSize
  description: string
}

export type ReceiverDetails = {
  receiverName: string
  receiverPhone: string
  specialInstructions: string
}

export function packageTypeLabel(type: PackageType) {
  return PACKAGE_TYPES.find((item) => item.value === type)?.label ?? type
}

export function weightBandLabel(band: PackageWeightBand) {
  return (
    PACKAGE_WEIGHT_BANDS.find((item) => item.value === band)?.label ?? band
  )
}

export function sizeLabel(size: PackageSize) {
  return PACKAGE_SIZES.find((item) => item.value === size)?.label ?? size
}

export function calculateDeliveryBaseFare(input: {
  packageType: PackageType
  size: PackageSize
  weightBand: PackageWeightBand
}): number {
  return (
    DELIVERY_BASE_FEE_PESOS +
    PACKAGE_TYPE_SURCHARGE[input.packageType] +
    PACKAGE_SIZE_SURCHARGE[input.size] +
    PACKAGE_WEIGHT_SURCHARGE[input.weightBand]
  )
}

export function calculateDeliveryTotals(input: {
  packageType: PackageType
  size: PackageSize
  weightBand: PackageWeightBand
}) {
  return totalsFromDeliveryFee(calculateDeliveryBaseFare(input))
}

export function totalsFromDeliveryFee(baseFare: number) {
  const serviceFee = Math.round(baseFare * 0.04)
  const tax = 0
  return {
    baseFare,
    serviceFee,
    tax,
    total: baseFare + serviceFee,
  }
}
