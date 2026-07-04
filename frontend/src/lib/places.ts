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
    keywords: ['casiguran', 'baler'],
  },
  {
    id: 'casiguran-door-to-door',
    name: 'Casiguran, Aurora (Door-to-Door)',
    region: 'aurora',
    subtitle: 'Door-to-door pickup',
    keywords: ['casiguran', 'poblacion'],
  },
  {
    id: 'brgy-poblacion',
    name: 'Brgy. Poblacion, Casiguran',
    region: 'aurora',
    subtitle: 'Casiguran, Aurora',
  },
  {
    id: 'brgy-calabgan',
    name: 'Brgy. Calabgan, Casiguran',
    region: 'aurora',
    subtitle: 'Casiguran, Aurora',
  },
  {
    id: 'brgy-dibacong',
    name: 'Brgy. Dibacong, Casiguran',
    region: 'aurora',
    subtitle: 'Casiguran, Aurora',
  },
  {
    id: 'brgy-esteves',
    name: 'Brgy. Esteves, Casiguran',
    region: 'aurora',
    subtitle: 'Casiguran, Aurora',
  },
  {
    id: 'baler',
    name: 'Baler, Aurora',
    region: 'aurora',
    subtitle: 'Surf town',
    keywords: ['sabang'],
  },
  {
    id: 'dipaculao',
    name: 'Dipaculao, Aurora',
    region: 'aurora',
    subtitle: 'Aurora',
  },
  {
    id: 'maria-aurora',
    name: 'Maria Aurora',
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
    id: 'cubao',
    name: 'Cubao, Quezon City',
    region: 'metro-manila',
    subtitle: 'Quezon City',
    keywords: ['quezon', 'qc'],
  },
  {
    id: 'quezon-city',
    name: 'Quezon City',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['quezon', 'qc', 'cubao'],
  },
  {
    id: 'makati-cbd',
    name: 'Makati CBD',
    region: 'metro-manila',
    subtitle: 'Makati',
    keywords: ['makati', 'ayala'],
  },
  {
    id: 'pasay-naia',
    name: 'Pasay / NAIA Area',
    region: 'metro-manila',
    subtitle: 'Near the airport',
    keywords: ['pasay', 'naia', 'airport'],
  },
  {
    id: 'manila-city',
    name: 'Manila City',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['manila', 'intramuros'],
  },
  {
    id: 'taguig-bgc',
    name: 'Taguig / BGC',
    region: 'metro-manila',
    subtitle: 'Bonifacio Global City',
    keywords: ['taguig', 'bgc', 'bonifacio'],
  },
  {
    id: 'pasig',
    name: 'Pasig City',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['pasig', 'ortigas'],
  },
  {
    id: 'mandaluyong',
    name: 'Mandaluyong',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['mandaluyong', 'edsa'],
  },
  {
    id: 'marikina',
    name: 'Marikina',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
  },
  {
    id: 'paranaque',
    name: 'Parañaque',
    region: 'metro-manila',
    subtitle: 'Metro Manila',
    keywords: ['paranaque'],
  },
]

const AURORA_KEYWORDS = ['aurora', 'casiguran', 'baler', 'dipaculao']
const MANILA_KEYWORDS = [
  'manila',
  'metro manila',
  'quezon',
  'makati',
  'pasay',
  'taguig',
  'pasig',
  'cubao',
  'bgc',
  'naia',
  'mandaluyong',
  'marikina',
  'paranaque',
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
  options?: { region?: PlaceRegion; limit?: number },
): Place[] {
  const limit = options?.limit ?? 6
  const normalizedQuery = normalizeText(query)

  let candidates = options?.region
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
    ...matchingPlace.name.toLowerCase().split(/[\s,/]+/),
    ...(matchingPlace.keywords ?? []),
  ].filter((keyword) => keyword.length > 2)

  return placeKeywords.some((keyword) => normalizedLocation.includes(keyword))
}
