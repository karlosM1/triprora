import type { AmenityKey } from '../models/van.types.js'
import type { Prisma } from '@prisma/client'

type TransactionClient = Prisma.TransactionClient

export async function ensureOperator(tx: TransactionClient, name: string) {
  return tx.operator.upsert({
    where: { name },
    create: { name },
    update: {},
  })
}

export async function ensureRoute(
  tx: TransactionClient,
  departureLocation: string,
  arrivalLocation: string,
  typicalDuration?: string,
) {
  return tx.route.upsert({
    where: {
      departureLocation_arrivalLocation: {
        departureLocation,
        arrivalLocation,
      },
    },
    create: {
      departureLocation,
      arrivalLocation,
      typicalDuration: typicalDuration ?? null,
    },
    update: {
      typicalDuration: typicalDuration ?? undefined,
    },
  })
}

export async function ensureVanClass(
  tx: TransactionClient,
  classType: string,
  classVariant: string,
  baseCapacity?: number,
) {
  return tx.vanClass.upsert({
    where: {
      classType_classVariant: {
        classType,
        classVariant,
      },
    },
    create: {
      classType,
      classVariant,
      baseCapacity: baseCapacity ?? null,
    },
    update: {
      baseCapacity: baseCapacity ?? undefined,
    },
  })
}

export async function ensureAmenities(tx: TransactionClient, keys: AmenityKey[]) {
  const amenities = await Promise.all(
    keys.map((key) =>
      tx.amenity.upsert({
        where: { key },
        create: { key },
        update: {},
      }),
    ),
  )
  return amenities
}

export async function syncVanAmenities(
  tx: TransactionClient,
  vanId: string,
  keys: AmenityKey[],
) {
  await tx.vanAmenity.deleteMany({ where: { vanId } })
  const amenities = await ensureAmenities(tx, keys)
  if (amenities.length === 0) return

  await tx.vanAmenity.createMany({
    data: amenities.map((amenity) => ({
      vanId,
      amenityId: amenity.id,
    })),
  })
}

export async function seedDefaultAmenities(tx: TransactionClient) {
  const keys: AmenityKey[] = [
    'wifi',
    'usb',
    'reclining',
    'ac',
    'luggage',
    'legroom',
    'entertainment',
    'snacks',
    'monitor',
  ]
  await ensureAmenities(tx, keys)
}
