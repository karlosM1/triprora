import type {
  PackageSize,
  PackageType,
  PackageWeightBand,
} from '../models/delivery.types.js'

/** Suggested base fee in pesos before package surcharges (driver may override). */
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

export function calculateDeliveryTotals(input: {
  packageType: PackageType
  size: PackageSize
  weightBand: PackageWeightBand
}) {
  return totalsFromDeliveryFee(calculateDeliveryBaseFare(input))
}
