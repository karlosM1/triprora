import type { Prisma } from '@prisma/client'

/** Full layout: 1 front passenger + 3 rows of 4 rear seats. */
export const STANDARD_VAN_SEATS = 13

export function generateSeatLabels(totalSeats: number) {
  const labels: string[] = []

  // Row 1: front passenger beside driver
  labels.push('1A')

  // Rows 2–4: three rows of four seats
  for (let row = 2; row <= 4 && labels.length < totalSeats; row++) {
    for (const column of ['A', 'B', 'C', 'D']) {
      if (labels.length >= totalSeats) break
      labels.push(`${row}${column}`)
    }
  }

  return labels
}

function usesLegacyThreeColumnLayout(labels: string[]) {
  for (let row = 2; row <= 4; row++) {
    if (labels.includes(`${row}C`) && !labels.includes(`${row}D`)) {
      return true
    }
  }

  return labels.some((label) => label.startsWith('5'))
}

export function resolveTargetSeatCount(
  totalSeats: number | null | undefined,
  existingLabels: string[],
) {
  const base = totalSeats ?? existingLabels.length

  if (usesLegacyThreeColumnLayout(existingLabels)) {
    return Math.max(base, STANDARD_VAN_SEATS)
  }

  return base
}

export async function syncVanSeatLayout(
  tx: Prisma.TransactionClient,
  vanId: string,
  totalSeats: number,
) {
  const expectedLabels = generateSeatLabels(totalSeats)
  const expectedSet = new Set(expectedLabels)

  const van = await tx.van.findUnique({
    where: { id: vanId },
    include: {
      seats: {
        include: {
          bookings: {
            where: { status: { not: 'cancelled' } },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
  })

  if (!van) return expectedLabels

  const existingByLabel = new Map(van.seats.map((seat) => [seat.label, seat]))
  const missingLabels = expectedLabels.filter((label) => !existingByLabel.has(label))

  if (missingLabels.length > 0) {
    await tx.seat.createMany({
      data: missingLabels.map((label) => ({ vanId, label })),
    })
  }

  for (const seat of van.seats) {
    if (expectedSet.has(seat.label)) continue

    const isBooked = seat.status === 'occupied' || seat.bookings.length > 0
    if (!isBooked) {
      await tx.seat.delete({ where: { id: seat.id } })
    }
  }

  const refreshed = await tx.seat.findMany({
    where: { vanId },
    orderBy: { label: 'asc' },
  })

  const availableCount = refreshed.filter((seat) => seat.status === 'available').length

  await tx.van.update({
    where: { id: vanId },
    data: {
      totalSeats,
      seatsLeft: availableCount,
    },
  })

  return expectedLabels
}
