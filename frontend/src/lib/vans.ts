import type { ApiVan } from '@/lib/types/api'

export type VanResult = ApiVan

export function mapApiVan(van: ApiVan): VanResult {
  return van
}

export function mapApiVans(vans: ApiVan[]): VanResult[] {
  return vans
}
