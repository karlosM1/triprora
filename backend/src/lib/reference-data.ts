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
