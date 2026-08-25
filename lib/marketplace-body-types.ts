import type { MarketplaceCategorySlug } from './marketplace'

export const marketplaceBodyTypeOptions = {
  cars: ['Halvkombi', 'Sedan', 'SUV', 'Kombi', 'Coupé', 'Cabriolet', 'Pickup'],
  vans: ['Skåpbil', 'Crew van', 'Box van', 'Kylbil', 'Minibuss', 'Pickup', 'Flak', 'Chassi'],
  trucks: ['Dragbil', 'Skåp', 'Flak', 'Tipp', 'Kranbil', 'Kylbil', 'Chassi', 'Tankbil', 'Lastväxlare', 'Betongbil', 'Buss'],
  motorcycles: ['Sport', 'Touring', 'Custom', 'Scooter', 'Cross / enduro', 'Naked', 'Adventure', 'Moped', 'ATV'],
  construction: ['Grävmaskin', 'Minigrävare', 'Hjullastare', 'Dumper', 'Dozer', 'Vält', 'Lift', 'Kran', 'Kompaktor'],
  motorhomes: ['Helintegrerad', 'Halvintegrerad', 'Alkov', 'Camper van', 'Plåtis'],
  caravans: ['Enkelaxel', 'Boggie', 'Familjevagn', 'Vintervagn', 'Liten husvagn'],
  agriculture: ['Traktor', 'Skördetröska', 'Redskap', 'Press', 'Vagn', 'Spruta', 'Lastare'],
  'electric-bikes': ['City', 'Hybrid', 'Mountainbike', 'Cargo', 'Folding', 'Speedbike', 'Racer', 'Barncykel'],
} satisfies Record<MarketplaceCategorySlug, readonly string[]>
