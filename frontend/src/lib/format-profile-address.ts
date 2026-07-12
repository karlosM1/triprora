import type { Profile } from '@/lib/types/profile'

type AddressParts = Pick<
  Profile,
  'houseStreet' | 'barangay' | 'city' | 'province' | 'zipCode'
>

/** Builds a single-line address from profile fields. Returns null if incomplete. */
export function formatProfileAddress(
  profile: AddressParts | null | undefined,
): string | null {
  if (!profile) return null

  const houseStreet = profile.houseStreet?.trim() ?? ''
  const barangay = profile.barangay?.trim() ?? ''
  const city = profile.city?.trim() ?? ''
  const province = profile.province?.trim() ?? ''
  const zipCode = profile.zipCode?.trim() ?? ''

  // Require the core location pieces so we don't suggest a half-empty address.
  if (!houseStreet || !city || !province) return null

  const locality = [barangay && `Brgy. ${barangay}`, city, province]
    .filter(Boolean)
    .join(', ')

  return zipCode ? `${houseStreet}, ${locality} ${zipCode}` : `${houseStreet}, ${locality}`
}
