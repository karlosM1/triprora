export type PlaceRegion = 'aurora' | 'metro-manila'

export type Place = {
  id: string
  name: string
  region: PlaceRegion
  subtitle?: string
  keywords?: string[]
}

export const PLACES: Place[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    region: 'aurora',
    subtitle: 'Province',
    keywords: [
      'dilasag',
      'casiguran',
      'dinalungan',
      'dipaculao',
      'baler',
      'maria aurora',
      'san luis',
      'dingalan',
    ],
  },
  {
    id: 'dilasag',
    name: 'Dilasag, Aurora',
    region: 'aurora',
    subtitle: 'Aurora',
  },
  {
    id: 'casiguran',
    name: 'Casiguran, Aurora',
    region: 'aurora',
    subtitle: 'Aurora',
  },
  {
    id: 'dinalungan',
    name: 'Dinalungan, Aurora',
    region: 'aurora',
    subtitle: 'Aurora',
  },
  {
    id: 'dipaculao',
    name: 'Dipaculao, Aurora',
    region: 'aurora',
    subtitle: 'Aurora',
  },
  {
    id: 'baler',
    name: 'Baler, Aurora (Provincial Capital)',
    region: 'aurora',
    subtitle: 'Aurora',
    keywords: ['baler', 'provincial capital', 'sabang'],
  },
  {
    id: 'maria-aurora',
    name: 'Maria Aurora, Aurora',
    region: 'aurora',
    subtitle: 'Aurora',
  },
  {
    id: 'san-luis',
    name: 'San Luis, Aurora',
    region: 'aurora',
    subtitle: 'Aurora',
  },
  {
    id: 'dingalan',
    name: 'Dingalan, Aurora',
    region: 'aurora',
    subtitle: 'Aurora',
  },
  {
    id: 'metro-manila',
    name: 'Metro Manila',
    region: 'metro-manila',
    subtitle: 'NCR',
    keywords: ['manila', 'ncr'],
  },
  {
    id: 'caloocan',
    name: 'Caloocan',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['caloocan'],
  },
  {
    id: 'las-pinas',
    name: 'Las Piñas',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['las pinas', 'las piñas'],
  },
  {
    id: 'makati',
    name: 'Makati',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['makati'],
  },
  {
    id: 'malabon',
    name: 'Malabon',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['malabon'],
  },
  {
    id: 'mandaluyong',
    name: 'Mandaluyong',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['mandaluyong'],
  },
  {
    id: 'manila',
    name: 'Manila',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['manila city', 'intramuros'],
  },
  {
    id: 'marikina',
    name: 'Marikina',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['marikina'],
  },
  {
    id: 'muntinlupa',
    name: 'Muntinlupa',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['muntinlupa'],
  },
  {
    id: 'navotas',
    name: 'Navotas',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['navotas'],
  },
  {
    id: 'paranaque',
    name: 'Parañaque',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['paranaque', 'parañaque'],
  },
  {
    id: 'pasay',
    name: 'Pasay',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['pasay', 'naia', 'airport'],
  },
  {
    id: 'pasig',
    name: 'Pasig',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['pasig', 'ortigas'],
  },
  {
    id: 'pateros',
    name: 'Pateros',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['pateros'],
  },
  {
    id: 'quezon-city',
    name: 'Quezon City',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['quezon', 'qc', 'cubao'],
  },
  {
    id: 'san-juan',
    name: 'San Juan',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['san juan'],
  },
  {
    id: 'taguig',
    name: 'Taguig',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['taguig', 'bgc', 'bonifacio'],
  },
  {
    id: 'valenzuela',
    name: 'Valenzuela',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['valenzuela'],
  },
]

/** Trip search place choices: Metro Manila + Aurora province + municipalities. */
export const TRIP_DESTINATION_PLACES: Place[] = [
  ...PLACES.filter((place) => place.id === 'metro-manila'),
  ...PLACES.filter((place) => place.region === 'aurora'),
]

const AURORA_KEYWORDS = [
  'aurora',
  'dilasag',
  'casiguran',
  'dinalungan',
  'dipaculao',
  'baler',
  'maria aurora',
  'san luis',
  'dingalan',
]
const MANILA_KEYWORDS = [
  'manila',
  'metro manila',
  'ncr',
  'caloocan',
  'las pinas',
  'las piñas',
  'makati',
  'malabon',
  'mandaluyong',
  'marikina',
  'muntinlupa',
  'navotas',
  'paranaque',
  'parañaque',
  'pasay',
  'pasig',
  'pateros',
  'quezon',
  'san juan',
  'taguig',
  'valenzuela',
  'cubao',
  'bgc',
  'naia',
  'ortigas',
]

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function placeSearchText(place: Place) {
  return [place.name, place.subtitle, ...(place.keywords ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function searchPlaces(
  query: string,
  options?: {
    region?: PlaceRegion
    places?: Place[]
    limit?: number
  },
): Place[] {
  const limit = options?.limit ?? 6
  const normalizedQuery = normalizeText(query)

  let candidates = options?.places
    ? options.places
    : options?.region
      ? PLACES.filter((place) => place.region === options.region)
      : PLACES

  if (!normalizedQuery) {
    return candidates.slice(0, limit)
  }

  const scored = candidates
    .map((place) => {
      const searchText = placeSearchText(place)
      const normalizedName = normalizeText(place.name)

      if (normalizedName === normalizedQuery) return { place, score: 100 }
      if (normalizedName.startsWith(normalizedQuery)) return { place, score: 80 }
      if (searchText.includes(normalizedQuery)) return { place, score: 60 }

      const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean)
      const matchedTokens = queryTokens.filter((token) =>
        searchText.includes(token),
      )
      if (matchedTokens.length > 0) {
        return { place, score: 40 + matchedTokens.length * 5 }
      }

      return null
    })
    .filter((entry): entry is { place: Place; score: number } => entry !== null)
    .sort((a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name))

  return scored.slice(0, limit).map((entry) => entry.place)
}

export function locationMatchesPlace(location: string, query: string) {
  const normalizedLocation = location.toLowerCase()
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true
  if (normalizedLocation.includes(normalizedQuery)) return true

  if (
    normalizedQuery.includes('metro manila') ||
    normalizedQuery === 'manila'
  ) {
    return MANILA_KEYWORDS.some((keyword) =>
      normalizedLocation.includes(keyword),
    )
  }

  if (normalizedQuery.includes('aurora')) {
    return AURORA_KEYWORDS.some((keyword) =>
      normalizedLocation.includes(keyword),
    )
  }

  const matchingPlace = PLACES.find(
    (place) =>
      normalizeText(place.name) === normalizedQuery ||
      place.keywords?.some((keyword) => normalizedQuery.includes(keyword)),
  )
  if (!matchingPlace) return false

  const placeKeywords = [
    ...matchingPlace.name.toLowerCase().split(/[\s,/()]+/),
    ...(matchingPlace.keywords ?? []),
  ].filter((keyword) => keyword.length > 2)

  return placeKeywords.some((keyword) => normalizedLocation.includes(keyword))
}
