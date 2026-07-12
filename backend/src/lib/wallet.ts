export const PLATFORM_COMMISSION_RATE = 0.04

export function commissionFromBase(baseFarePesos: number) {
  return Math.round(baseFarePesos * PLATFORM_COMMISSION_RATE)
}

export function earningsFromBase(baseFarePesos: number) {
  return baseFarePesos - commissionFromBase(baseFarePesos)
}

export function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function parseSettlementDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return date
}
