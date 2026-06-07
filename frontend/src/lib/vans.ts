import {
  Armchair,
  Luggage,
  Monitor,
  Plug,
  Snowflake,
  Tv,
  UtensilsCrossed,
  Wifi,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AmenityKey, ApiVan } from '@/lib/types/api'

type Amenity = {
  icon: LucideIcon
  label: string
}

export type VanResult = Omit<ApiVan, 'amenityKeys'> & {
  amenities: Amenity[]
}

export const amenityMap: Record<AmenityKey, Amenity> = {
  wifi: { icon: Wifi, label: 'Free WiFi' },
  usb: { icon: Plug, label: 'USB Ports' },
  reclining: { icon: Armchair, label: 'Reclining' },
  ac: { icon: Snowflake, label: 'Full AC' },
  luggage: { icon: Luggage, label: 'Luggage Room' },
  legroom: { icon: Armchair, label: 'Extra Legroom' },
  entertainment: { icon: Tv, label: 'Entertainment' },
  snacks: { icon: UtensilsCrossed, label: 'Free Snacks' },
  monitor: { icon: Monitor, label: 'Entertainment' },
}

export function mapApiVan(van: ApiVan): VanResult {
  return {
    ...van,
    amenities: van.amenityKeys.map((key) => amenityMap[key]),
  }
}

export function mapApiVans(vans: ApiVan[]): VanResult[] {
  return vans.map(mapApiVan)
}
