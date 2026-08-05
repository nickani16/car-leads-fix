import type { MarketplaceCategorySlug } from './marketplace'

const carAndVanBrands = [
  'Abarth',
  'Alfa Romeo',
  'Alpine',
  'Aston Martin',
  'Audi',
  'Bentley',
  'BMW',
  'BYD',
  'Cadillac',
  'Chevrolet',
  'Chrysler',
  'Citroen',
  'Cupra',
  'Dacia',
  'Dodge',
  'DS Automobiles',
  'Ferrari',
  'Fiat',
  'Ford',
  'Genesis',
  'Honda',
  'Hyundai',
  'Infiniti',
  'Isuzu',
  'Jaguar',
  'Jeep',
  'Kia',
  'Lamborghini',
  'Lancia',
  'Land Rover',
  'Lexus',
  'Lotus',
  'Lucid',
  'Maserati',
  'Mazda',
  'McLaren',
  'Mercedes-Benz',
  'MG',
  'Mini',
  'Mitsubishi',
  'Nissan',
  'Nio',
  'Opel',
  'Peugeot',
  'Polestar',
  'Porsche',
  'Renault',
  'Rolls-Royce',
  'Saab',
  'Seat',
  'Skoda',
  'Smart',
  'SsangYong',
  'Subaru',
  'Suzuki',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo',
  'XPeng',
] as const

const commercialVehicleBrands = [
  'Citroen',
  'DAF',
  'Fiat Professional',
  'Ford',
  'Fuso',
  'Iveco',
  'MAN',
  'Mercedes-Benz',
  'Nissan',
  'Opel',
  'Peugeot',
  'Renault',
  'Scania',
  'Toyota',
  'Volkswagen',
  'Volvo',
] as const

const truckBrands = [
  'DAF',
  'Fuso',
  'Hino',
  'Iveco',
  'MAN',
  'Mercedes-Benz',
  'Renault Trucks',
  'Scania',
  'Volvo',
  'Isuzu',
  'Kenworth',
  'Peterbilt',
  'Freightliner',
  'Mack',
] as const

const motorcycleBrands = [
  'Aprilia',
  'Benelli',
  'BMW Motorrad',
  'Ducati',
  'Harley-Davidson',
  'Honda',
  'Husqvarna',
  'Indian Motorcycle',
  'Kawasaki',
  'KTM',
  'Moto Guzzi',
  'MV Agusta',
  'Piaggio',
  'Royal Enfield',
  'Suzuki',
  'Triumph',
  'Vespa',
  'Yamaha',
] as const

const motorhomeBrands = [
  'Adria',
  'Benimar',
  'Buerstner',
  'Carthago',
  'Chausson',
  'Dethleffs',
  'Elnagh',
  'Frankia',
  'Hobby',
  'Hymer',
  'Knaus',
  'Laika',
  'Malibu',
  'McLouis',
  'Pilote',
  'Rapido',
  'Rimor',
  'Roller Team',
  'Sunlight',
  'Weinsberg',
] as const

const caravanBrands = [
  'Adria',
  'Bailey',
  'Buerstner',
  'Cabby',
  'Caravelair',
  'Dethleffs',
  'Eriba',
  'Fendt',
  'Hobby',
  'Kabe',
  'Kip',
  'Knaus',
  'Polar',
  'Solifer',
  'Sprite',
  'Tabbert',
  'Weinsberg',
] as const

const agricultureBrands = [
  'AGCO',
  'Case IH',
  'Challenger',
  'Claas',
  'Deutz-Fahr',
  'Fendt',
  'Ford',
  'JCB',
  'John Deere',
  'Kubota',
  'Massey Ferguson',
  'McCormick',
  'New Holland',
  'Same',
  'Valmet',
  'Valtra',
  'Zetor',
] as const

const constructionBrands = [
  'Atlas Copco',
  'Bobcat',
  'Bomag',
  'Case',
  'Caterpillar',
  'Doosan',
  'Dynapac',
  'Hitachi',
  'Hyundai Construction',
  'JCB',
  'Kobelco',
  'Komatsu',
  'Liebherr',
  'Manitou',
  'Mecalac',
  'New Holland',
  'Takeuchi',
  'Terex',
  'Volvo CE',
  'Wacker Neuson',
] as const

const bikeBrands = [
  'Bianchi',
  'Cannondale',
  'Canyon',
  'Cube',
  'Gazelle',
  'Giant',
  'Haibike',
  'Merida',
  'Riese & Mueller',
  'Scott',
  'Specialized',
  'Trek',
  'Winora',
  'Yamaha',
] as const

const brandSuggestionsByCategory: Record<MarketplaceCategorySlug, readonly string[]> = {
  cars: carAndVanBrands,
  vans: commercialVehicleBrands,
  motorcycles: motorcycleBrands,
  motorhomes: motorhomeBrands,
  caravans: caravanBrands,
  trucks: truckBrands,
  agriculture: agricultureBrands,
  construction: constructionBrands,
  'electric-bikes': bikeBrands,
}

const brandAliases: Record<string, string> = {
  'bmw motors': 'BMW',
  bmw: 'BMW',
  merc: 'Mercedes-Benz',
  mercedes: 'Mercedes-Benz',
  mb: 'Mercedes-Benz',
  vw: 'Volkswagen',
  volkswagon: 'Volkswagen',
  vovlo: 'Volvo',
  volvoce: 'Volvo CE',
  volvo: 'Volvo',
  citroen: 'Citroen',
  skoda: 'Skoda',
  peugeot: 'Peugeot',
  renult: 'Renault',
  porshe: 'Porsche',
  john: 'John Deere',
  deere: 'John Deere',
  cat: 'Caterpillar',
}

export function brandSuggestionsForCategory(category: MarketplaceCategorySlug) {
  return brandSuggestionsByCategory[category] || brandSuggestionsByCategory.cars
}

export function matchingBrandSuggestions(
  category: MarketplaceCategorySlug,
  input: string,
  limit?: number,
) {
  const query = normalizeBrandSearch(input)
  const options = brandSuggestionsForCategory(category)
  if (!query) return limit ? options.slice(0, limit) : [...options]

  const aliasMatch = brandAliases[query]
  const scored = options
    .map((brand, index) => {
      const normalizedBrand = normalizeBrandSearch(brand)
      const score =
        normalizedBrand === query ? 0 :
        normalizedBrand.startsWith(query) ? 1 :
        normalizedBrand.includes(query) ? 2 :
        aliasMatch === brand ? 3 :
        damerauLevenshtein(normalizedBrand, query) <= fuzzyThreshold(query) ? 4 :
        99
      return { brand, index, score }
    })
    .filter((item) => item.score < 99)
    .sort((left, right) => left.score - right.score || left.index - right.index)
    .map((item) => item.brand)

  if (aliasMatch && options.some((brand) => brand === aliasMatch) && !scored.includes(aliasMatch)) {
    scored.unshift(aliasMatch)
  }

  return limit ? scored.slice(0, limit) : scored
}

export function brandCorrectionSuggestion(
  category: MarketplaceCategorySlug,
  input: string,
) {
  const query = normalizeBrandSearch(input)
  if (query.length < 3) return null
  const options = brandSuggestionsForCategory(category)
  const aliasMatch = brandAliases[query]
  if (aliasMatch && options.some((brand) => brand === aliasMatch)) return aliasMatch
  const hasDirectMatch = options.some((brand) => {
    const normalizedBrand = normalizeBrandSearch(brand)
    return normalizedBrand === query || normalizedBrand.startsWith(query)
  })
  if (hasDirectMatch) return null

  let bestBrand: string | null = null
  let bestDistance = Number.POSITIVE_INFINITY
  let bestIndex = Number.POSITIVE_INFINITY
  options.forEach((brand, index) => {
    const distance = damerauLevenshtein(normalizeBrandSearch(brand), query)
    if (distance > fuzzyThreshold(query)) return
    if (distance < bestDistance || (distance === bestDistance && index < bestIndex)) {
      bestBrand = brand
      bestDistance = distance
      bestIndex = index
    }
  })

  return bestBrand
}

function normalizeBrandSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function fuzzyThreshold(query: string) {
  return query.length <= 4 ? 2 : 3
}

function damerauLevenshtein(left: string, right: string) {
  const rows = left.length + 1
  const columns = right.length + 1
  const distances = Array.from({ length: rows }, () => Array<number>(columns).fill(0))

  for (let row = 0; row < rows; row += 1) distances[row][0] = row
  for (let column = 0; column < columns; column += 1) distances[0][column] = column

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1
      distances[row][column] = Math.min(
        distances[row - 1][column] + 1,
        distances[row][column - 1] + 1,
        distances[row - 1][column - 1] + cost,
      )

      if (
        row > 1 &&
        column > 1 &&
        left[row - 1] === right[column - 2] &&
        left[row - 2] === right[column - 1]
      ) {
        distances[row][column] = Math.min(
          distances[row][column],
          distances[row - 2][column - 2] + 1,
        )
      }
    }
  }

  return distances[left.length][right.length]
}
