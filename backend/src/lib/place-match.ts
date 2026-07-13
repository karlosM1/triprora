/** Keyword expansion for trip search place matching (mirrors frontend places logic). */

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

const PLACE_KEYWORDS: Record<string, string[]> = {
  aurora: AURORA_KEYWORDS,
  dilasag: ['dilasag'],
  casiguran: ['casiguran'],
  dinalungan: ['dinalungan'],
  dipaculao: ['dipaculao'],
  baler: ['baler', 'provincial capital', 'sabang'],
  'maria aurora': ['maria aurora'],
  'san luis': ['san luis'],
  dingalan: ['dingalan'],
  'metro manila': MANILA_KEYWORDS,
  manila: MANILA_KEYWORDS,
  caloocan: ['caloocan'],
  'las piñas': ['las pinas', 'las piñas'],
  'las pinas': ['las pinas', 'las piñas'],
  makati: ['makati'],
  malabon: ['malabon'],
  mandaluyong: ['mandaluyong'],
  marikina: ['marikina'],
  muntinlupa: ['muntinlupa'],
  navotas: ['navotas'],
  parañaque: ['paranaque', 'parañaque'],
  paranaque: ['paranaque', 'parañaque'],
  pasay: ['pasay', 'naia', 'airport'],
  pasig: ['pasig', 'ortigas'],
  pateros: ['pateros'],
  'quezon city': ['quezon', 'qc', 'cubao'],
  'san juan': ['san juan'],
  taguig: ['taguig', 'bgc', 'bonifacio'],
  valenzuela: ['valenzuela'],
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

/** Returns SQL-friendly substrings to match against a stored location string. */
export function locationSearchTerms(query: string): string[] {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) return []

  if (
    normalizedQuery.includes('metro manila') ||
    normalizedQuery === 'manila'
  ) {
    return [...MANILA_KEYWORDS]
  }

  if (normalizedQuery.includes('aurora')) {
    return [...AURORA_KEYWORDS]
  }

  for (const [place, keywords] of Object.entries(PLACE_KEYWORDS)) {
    if (
      normalizedQuery === place ||
      normalizedQuery.includes(place) ||
      keywords.some((keyword) => normalizedQuery.includes(keyword))
    ) {
      const fromName = place.split(/[\s,/()]+/).filter((token) => token.length > 2)
      return [...new Set([...fromName, ...keywords])]
    }
  }

  return [normalizedQuery]
}
