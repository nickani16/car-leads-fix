export type LocationCoordinates = {
  latitude: number
  longitude: number
  approximate: boolean
}

type LocationInput = {
  latitude?: number | null
  longitude?: number | null
  city?: string | null
  municipality?: string | null
  country?: string | null
  countryCode?: string | null
}

export function resolveListingCoordinates(input: LocationInput): LocationCoordinates | null {
  if (
    typeof input.latitude === 'number' &&
    typeof input.longitude === 'number' &&
    Number.isFinite(input.latitude) &&
    Number.isFinite(input.longitude)
  ) {
    return {
      latitude: input.latitude,
      longitude: input.longitude,
      approximate: false,
    }
  }

  const cityKey = normalizeLocationName(input.city || input.municipality || '')
  const city = cityKey ? cityCoordinates[cityKey] : null
  if (city) {
    return {
      latitude: city[1],
      longitude: city[0],
      approximate: true,
    }
  }

  const countryKey = (input.countryCode || input.country || '').toUpperCase()
  const country = countryCoordinates[countryKey]
  if (country) {
    return {
      latitude: country[1],
      longitude: country[0],
      approximate: true,
    }
  }

  return null
}

export function normalizeLocationName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
}

const cityCoordinates: Record<string, [number, number]> = {
  nacka: [18.1637, 59.3105],
  stockholm: [18.0686, 59.3293],
  goteborg: [11.9746, 57.7089],
  malmo: [13.0038, 55.605],
  uppsala: [17.6389, 59.8586],
  vasteras: [16.5448, 59.6099],
  orebro: [15.2134, 59.2753],
  linkoping: [15.6214, 58.4108],
  helsingborg: [12.6945, 56.0465],
  jonkoping: [14.1618, 57.7826],
  norrkoping: [16.1924, 58.5877],
  lund: [13.191, 55.7047],
  umea: [20.263, 63.8258],
}

const countryCoordinates: Record<string, [number, number]> = {
  SE: [14.5, 57.8],
  DK: [10.0, 56.0],
  DE: [10.45, 51.16],
  NO: [8.47, 60.47],
  FI: [25.75, 61.92],
  NL: [5.29, 52.13],
  BE: [4.47, 50.5],
  FR: [2.21, 46.23],
  ES: [-3.75, 40.46],
  IT: [12.57, 41.87],
  PL: [19.15, 51.92],
  EU: [14.5, 52.0],
}
