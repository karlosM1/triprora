import { randomBytes } from 'node:crypto'

// Crockford-style base32 without ambiguous characters (no I, L, O, U).
// Length 32 is a power of two, so `byte % 32` introduces no modulo bias.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function randomCode(length: number): string {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i]! % ALPHABET.length]
  }
  return out
}

/** Opaque, non-sequential primary key for bookings (e.g. BK-3F7K9Q2M4X8T). */
export function createBookingId(): string {
  return `BK-${randomCode(12)}`
}

/** Human-facing, non-enumerable booking reference (e.g. TRP-7Q2M9X4K). */
export function createBookingReference(): string {
  return `TRP-${randomCode(8)}`
}

/** Opaque, non-sequential primary key for deliveries. */
export function createDeliveryId(): string {
  return `DL-${randomCode(12)}`
}

/** Human-facing, non-enumerable delivery reference. */
export function createDeliveryReference(): string {
  return `PKG-${randomCode(8)}`
}

/** Opaque, non-sequential primary key for driver trips (vans). */
export function createTripId(): string {
  return `TRP-${randomCode(12)}`
}
