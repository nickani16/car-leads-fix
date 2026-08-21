import type {
  PopularCarCategory,
  PopularVehicleBrand,
  SelectedVehicleCategory,
  VehicleBodyCategory,
} from '@/app/components/HomeVehicleCategoryRails'
import {
  localizePublicHref,
  type PublicLocale,
} from '@/lib/public-i18n'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'

export type HomepageCategorySeo = {
  title: string
  description: string
}

export type HomepageSellConfig = {
  title: string
  image: string
  imageAlt: string
  dealerCta: string
  privateCta: string
  dealerHref: string
  privateHref: string
}

export type HomepageCategoryPresentation = {
  slug: MarketplaceCategorySlug
  latestTitle: string
  topTitle: string
  selectedTitle: string
  selectedScrollLabel: string
  selectedCategories: SelectedVehicleCategory[]
  popularTitle: string
  popularScrollLabel: string
  popularCategories: PopularCarCategory[]
  vehicleTypesTitle: string
  vehicleTypesScrollLabel: string
  vehicleTypes: VehicleBodyCategory[]
  vehicleTypesAllLabel: string
  vehicleTypesAllHref: string
  popularBrandsTitle: string
  popularBrands: PopularVehicleBrand[]
  marketplaceHref: string
  emptyText: string
  emptyCta: string
  sell: HomepageSellConfig
  seo: HomepageCategorySeo
}

type Label = Record<PublicLocale, string>

type HomepageTypeDefinition = {
  id: string
  label: Label
  filterValue: string
  image: string
}

type HomepageSelectedDefinition = {
  id: string
  typeId?: string
  label?: Label
  filters?: Record<string, string>
  image?: string
  icon: SelectedVehicleCategory['icon']
  highlighted?: boolean
}

type HomepagePopularDefinition = {
  typeId: string
  image?: string
  imageFit?: PopularCarCategory['imageFit']
}

type HomepageBrandDefinition = {
  id: string
  title: string
  logo?: string
}

type HomepageCategoryDefinition = {
  types: HomepageTypeDefinition[]
  selected: HomepageSelectedDefinition[]
  popular: HomepagePopularDefinition[]
  brands: HomepageBrandDefinition[]
  sellImage: string
}

const label = (
  sv: string,
  en: string,
  de: string,
  fr: string,
  es: string,
  it: string,
  pl: string,
  nl: string,
  fi: string,
  da: string,
): Label => ({ sv, en, de, at: de, be: nl, fr, es, it, pl, nl, fi, da })

const vehicleTypeLabels: Record<string, Label> = {
  Halvkombi: label('Halvkombi', 'Hatchback', 'Schrägheck', 'Berline compacte', 'Hatchback', 'Berlina due volumi', 'Hatchback', 'Hatchback', 'Viistoperä', 'Hatchback'),
  Sedan: label('Sedan', 'Sedan', 'Limousine', 'Berline', 'Berlina', 'Berlina', 'Sedan', 'Sedan', 'Sedan', 'Sedan'),
  SUV: label('SUV', 'SUV', 'SUV', 'SUV', 'SUV', 'SUV', 'SUV', 'SUV', 'SUV', 'SUV'),
  Kombi: label('Kombi', 'Estate', 'Kombi', 'Break', 'Familiar', 'Station wagon', 'Kombi', 'Stationwagen', 'Farmari', 'Stationcar'),
  'Coupé': label('Coupé', 'Coupe', 'Coupé', 'Coupé', 'Coupé', 'Coupé', 'Coupé', 'Coupé', 'Coupé', 'Coupé'),
  Cabriolet: label('Cabriolet', 'Convertible', 'Cabriolet', 'Cabriolet', 'Descapotable', 'Cabriolet', 'Kabriolet', 'Cabriolet', 'Avoauto', 'Cabriolet'),
  Pickup: label('Pickup', 'Pickup', 'Pickup', 'Pick-up', 'Pickup', 'Pickup', 'Pickup', 'Pick-up', 'Avolava-auto', 'Pickup'),
  Elbil: label('Elbil', 'Electric car', 'Elektroauto', 'Voiture électrique', 'Coche eléctrico', 'Auto elettrica', 'Samochód elektryczny', 'Elektrische auto', 'Sähköauto', 'Elbil'),
  'Skåpbil': label('Skåpbil', 'Panel van', 'Kastenwagen', 'Fourgon', 'Furgón', 'Furgone', 'Furgon', 'Gesloten bestelwagen', 'Umpipakettiauto', 'Kassevogn'),
  'Crew van': label('Crew van', 'Crew van', 'Doppelkabine', 'Cabine approfondie', 'Doble cabina', 'Doppia cabina', 'Brygadówka', 'Dubbele cabine', 'Miehistöpakettiauto', 'Dobbeltkabine'),
  'Box van': label('Box van', 'Box van', 'Kofferwagen', 'Fourgon caisse', 'Furgón caja', 'Furgone cassonato', 'Furgon kontener', 'Bakwagen', 'Umpikorinen pakettiauto', 'Kassebil'),
  Kylbil: label('Kylbil', 'Refrigerated vehicle', 'Kühlfahrzeug', 'Véhicule frigorifique', 'Vehículo frigorífico', 'Veicolo frigorifero', 'Chłodnia', 'Koelwagen', 'Kylmäkuljetusauto', 'Kølebil'),
  Minibuss: label('Minibuss', 'Minibus', 'Minibus', 'Minibus', 'Minibús', 'Minibus', 'Minibus', 'Minibus', 'Minibussi', 'Minibus'),
  Flak: label('Flak', 'Flatbed', 'Pritsche', 'Plateau', 'Plataforma', 'Pianale', 'Platforma', 'Open laadbak', 'Avolava', 'Ladbil'),
  Chassi: label('Chassi', 'Chassis cab', 'Fahrgestell', 'Châssis-cabine', 'Chasis cabina', 'Telaio cabinato', 'Podwozie z kabiną', 'Chassiscabine', 'Alustaohjaamo', 'Chassiskabine'),
  Eltransport: label('Eltransport', 'Electric van', 'Elektrotransporter', 'Utilitaire électrique', 'Furgoneta eléctrica', 'Furgone elettrico', 'Elektryczny dostawczy', 'Elektrische bestelwagen', 'Sähköpakettiauto', 'Elektrisk varebil'),
  Dragbil: label('Dragbil', 'Tractor unit', 'Sattelzugmaschine', 'Tracteur routier', 'Cabeza tractora', 'Trattore stradale', 'Ciągnik siodłowy', 'Trekker', 'Vetoauto', 'Trækker'),
  'Skåp': label('Skåp', 'Box body', 'Kofferaufbau', 'Caisse fermée', 'Caja cerrada', 'Furgonatura', 'Zabudowa skrzyniowa', 'Gesloten opbouw', 'Umpikori', 'Lukket kasse'),
  Tipp: label('Tipp', 'Tipper', 'Kipper', 'Benne', 'Volquete', 'Ribaltabile', 'Wywrotka', 'Kipper', 'Kippiauto', 'Tipvogn'),
  Kranbil: label('Kranbil', 'Crane truck', 'Kranwagen', 'Camion-grue', 'Camión grúa', 'Autocarro con gru', 'Samochód z HDS', 'Kraanwagen', 'Nosturiauto', 'Kranbil'),
  Tankbil: label('Tankbil', 'Tanker', 'Tankwagen', 'Camion-citerne', 'Camión cisterna', 'Autocisterna', 'Cysterna', 'Tankwagen', 'Säiliöauto', 'Tankbil'),
  Lastväxlare: label('Lastväxlare', 'Hook lift', 'Abrollkipper', 'Ampliroll', 'Portacontenedores', 'Scarrabile', 'Hakowiec', 'Haakarm', 'Vaihtolava-auto', 'Kroghejs'),
  Betongbil: label('Betongbil', 'Concrete mixer', 'Betonmischer', 'Toupie béton', 'Hormigonera', 'Betoniera', 'Betonomieszarka', 'Betonmixer', 'Betoniauto', 'Betonblander'),
  Buss: label('Buss', 'Bus', 'Bus', 'Autobus', 'Autobús', 'Autobus', 'Autobus', 'Bus', 'Linja-auto', 'Bus'),
  Sport: label('Sport', 'Sport', 'Sport', 'Sportive', 'Deportiva', 'Sportiva', 'Sportowy', 'Sport', 'Sport', 'Sport'),
  Touring: label('Touring', 'Touring', 'Touring', 'Routière', 'Touring', 'Touring', 'Turystyczny', 'Touring', 'Matkapyörä', 'Touring'),
  Custom: label('Custom', 'Custom', 'Custom Bike', 'Custom', 'Custom', 'Custom', 'Custom', 'Custom', 'Custom', 'Custom'),
  Scooter: label('Scooter', 'Scooter', 'Roller', 'Scooter', 'Scooter', 'Scooter', 'Skuter', 'Scooter', 'Skootteri', 'Scooter'),
  'Cross / enduro': label('Cross / enduro', 'Motocross / enduro', 'Cross / Enduro', 'Cross / enduro', 'Cross / enduro', 'Cross / enduro', 'Cross / enduro', 'Cross / enduro', 'Cross / enduro', 'Cross / enduro'),
  Naked: label('Naked', 'Naked', 'Naked Bike', 'Roadster', 'Naked', 'Naked', 'Naked', 'Naked', 'Naked', 'Naked'),
  Adventure: label('Adventure', 'Adventure', 'Reiseenduro', 'Trail', 'Adventure', 'Adventure', 'Adventure', 'Allroad', 'Adventure', 'Adventure'),
  Moped: label('Moped', 'Moped', 'Moped', 'Cyclomoteur', 'Ciclomotor', 'Ciclomotore', 'Motorower', 'Bromfiets', 'Mopo', 'Knallert'),
  ATV: label('ATV', 'ATV', 'ATV', 'Quad', 'Quad', 'Quad', 'Quad', 'Quad', 'Mönkijä', 'ATV'),
  Helintegrerad: label('Helintegrerad', 'A-class motorhome', 'Integriertes Wohnmobil', 'Camping-car intégral', 'Autocaravana integral', 'Motorhome integrale', 'Kamper zintegrowany', 'Integraal camper', 'Integroitu matkailuauto', 'Integreret autocamper'),
  Halvintegrerad: label('Halvintegrerad', 'Coachbuilt motorhome', 'Teilintegriertes Wohnmobil', 'Camping-car profilé', 'Autocaravana perfilada', 'Motorhome semintegrale', 'Kamper półintegrowany', 'Halfintegraal camper', 'Puoli-integroitu matkailuauto', 'Delintegreret autocamper'),
  Alkov: label('Alkov', 'Overcab motorhome', 'Alkoven-Wohnmobil', 'Camping-car capucine', 'Autocaravana capuchina', 'Motorhome mansardato', 'Kamper alkowa', 'Alkoofcamper', 'Alkovimatkailuauto', 'Alkoveautocamper'),
  'Camper van': label('Camper van', 'Camper van', 'Camper Van', 'Fourgon aménagé', 'Cámper', 'Camper van', 'Kampervan', 'Buscamper', 'Retkeilyauto', 'Campervan'),
  'Plåtis': label('Plåtis', 'Panel van motorhome', 'Kastenwagen-Wohnmobil', 'Fourgon compact', 'Furgón camper', 'Furgonato', 'Kamper blaszany', 'Bestelbuscamper', 'Peltikuorinen matkailuauto', 'Kassevognscamper'),
  Enkelaxel: label('Enkelaxel', 'Single axle', 'Einachser', 'Simple essieu', 'Un eje', 'Asse singolo', 'Jedna oś', 'Enkelas', 'Yksiakselinen', 'Enkeltaksel'),
  Boggie: label('Boggie', 'Twin axle', 'Tandemachse', 'Double essieu', 'Doble eje', 'Doppio asse', 'Dwuosiowa', 'Dubbelas', 'Teliakselinen', 'Boggie'),
  Familjevagn: label('Familjevagn', 'Family caravan', 'Familienwohnwagen', 'Caravane familiale', 'Caravana familiar', 'Roulotte familiare', 'Przyczepa rodzinna', 'Gezinscaravan', 'Perhevaunu', 'Familiecampingvogn'),
  Vintervagn: label('Vintervagn', 'Winter caravan', 'Winterwohnwagen', 'Caravane hiver', 'Caravana de invierno', 'Roulotte invernale', 'Przyczepa zimowa', 'Wintercaravan', 'Talvivaunu', 'Vintercampingvogn'),
  'Liten husvagn': label('Liten husvagn', 'Compact caravan', 'Kompaktwohnwagen', 'Petite caravane', 'Caravana compacta', 'Roulotte compatta', 'Mała przyczepa', 'Compacte caravan', 'Pieni asuntovaunu', 'Kompakt campingvogn'),
  Traktor: label('Traktor', 'Tractor', 'Traktor', 'Tracteur', 'Tractor', 'Trattore', 'Ciągnik', 'Tractor', 'Traktori', 'Traktor'),
  Skördetröska: label('Skördetröska', 'Combine harvester', 'Mähdrescher', 'Moissonneuse-batteuse', 'Cosechadora', 'Mietitrebbia', 'Kombajn', 'Maaidorser', 'Leikkuupuimuri', 'Mejetærsker'),
  Redskap: label('Redskap', 'Implement', 'Anbaugerät', 'Outil agricole', 'Implemento', 'Attrezzatura', 'Osprzęt', 'Werktuig', 'Työlaite', 'Redskab'),
  Press: label('Press', 'Baler', 'Ballenpresse', 'Presse à balles', 'Empacadora', 'Pressa', 'Prasa', 'Balenpers', 'Paalaaja', 'Ballepresser'),
  Vagn: label('Vagn', 'Trailer', 'Anhänger', 'Remorque', 'Remolque', 'Rimorchio', 'Przyczepa', 'Aanhanger', 'Perävaunu', 'Vogn'),
  Spruta: label('Spruta', 'Sprayer', 'Spritze', 'Pulvérisateur', 'Pulverizador', 'Irroratrice', 'Opryskiwacz', 'Spuitmachine', 'Ruisku', 'Sprøjte'),
  Lastare: label('Lastare', 'Loader', 'Lader', 'Chargeur', 'Cargadora', 'Caricatore', 'Ładowarka', 'Lader', 'Kuormaaja', 'Læsser'),
  Grävmaskin: label('Grävmaskin', 'Excavator', 'Bagger', 'Pelle mécanique', 'Excavadora', 'Escavatore', 'Koparka', 'Graafmachine', 'Kaivinkone', 'Gravemaskine'),
  Minigrävare: label('Minigrävare', 'Mini excavator', 'Minibagger', 'Mini-pelle', 'Miniexcavadora', 'Miniescavatore', 'Minikoparka', 'Minigraafmachine', 'Minikaivinkone', 'Minigraver'),
  Hjullastare: label('Hjullastare', 'Wheel loader', 'Radlader', 'Chargeuse sur pneus', 'Cargadora de ruedas', 'Pala gommata', 'Ładowarka kołowa', 'Wiellader', 'Pyöräkuormaaja', 'Gummihjulslæsser'),
  Dumper: label('Dumper', 'Dumper', 'Dumper', 'Tombereau', 'Dúmper', 'Dumper', 'Wozidło', 'Dumper', 'Dumppperi', 'Dumper'),
  Dozer: label('Dozer', 'Bulldozer', 'Planierraupe', 'Bulldozer', 'Bulldozer', 'Bulldozer', 'Spycharka', 'Bulldozer', 'Puskutraktori', 'Bulldozer'),
  Vält: label('Vält', 'Roller', 'Walze', 'Compacteur', 'Rodillo', 'Rullo compressore', 'Walec', 'Wals', 'Jyrä', 'Tromle'),
  Lift: label('Lift', 'Lift', 'Arbeitsbühne', 'Nacelle', 'Plataforma elevadora', 'Piattaforma aerea', 'Podnośnik', 'Hoogwerker', 'Henkilönostin', 'Lift'),
  Kran: label('Kran', 'Crane', 'Kran', 'Grue', 'Grúa', 'Gru', 'Żuraw', 'Kraan', 'Nosturi', 'Kran'),
  Kompaktor: label('Kompaktor', 'Compactor', 'Verdichter', 'Compacteur', 'Compactador', 'Compattatore', 'Zagęszczarka', 'Verdichter', 'Tiivistyskone', 'Komprimator'),
  City: label('City', 'City bike', 'Citybike', 'Vélo de ville', 'Bicicleta urbana', 'City bike', 'Rower miejski', 'Stadsfiets', 'Kaupunkipyörä', 'Citybike'),
  Hybrid: label('Hybrid', 'Hybrid bike', 'Hybridrad', 'Vélo hybride', 'Bicicleta híbrida', 'Bici ibrida', 'Rower hybrydowy', 'Hybridefiets', 'Hybridipyörä', 'Hybridcykel'),
  Mountainbike: label('Mountainbike', 'Mountain bike', 'Mountainbike', 'VTT', 'Bicicleta de montaña', 'Mountain bike', 'Rower górski', 'Mountainbike', 'Maastopyörä', 'Mountainbike'),
  Cargo: label('Lastcykel', 'Cargo bike', 'Lastenrad', 'Vélo cargo', 'Bicicleta de carga', 'Cargo bike', 'Rower cargo', 'Bakfiets', 'Tavarapyörä', 'Ladcykel'),
  Folding: label('Hopfällbar', 'Folding bike', 'Faltrad', 'Vélo pliant', 'Bicicleta plegable', 'Bici pieghevole', 'Rower składany', 'Vouwfiets', 'Taittopyörä', 'Foldecykel'),
  Speedbike: label('Speedbike', 'Speed bike', 'S-Pedelec', 'Speed bike', 'Speed bike', 'Speed bike', 'Speed bike', 'Speedbike', 'Nopea sähköpyörä', 'Speedbike'),
  Racer: label('Racer', 'Road bike', 'Rennrad', 'Vélo de route', 'Bicicleta de carretera', 'Bici da corsa', 'Rower szosowy', 'Racefiets', 'Maantiepyörä', 'Racercykel'),
  Barncykel: label('Barncykel', 'Kids bike', 'Kinderfahrrad', 'Vélo enfant', 'Bicicleta infantil', 'Bici da bambino', 'Rower dziecięcy', 'Kinderfiets', 'Lastenpyörä', 'Børnecykel'),
}

const type = (
  id: string,
  filterValue: string,
  image: string,
): HomepageTypeDefinition => ({
  id,
  label: vehicleTypeLabels[filterValue],
  filterValue,
  image,
})

// Add future category brand logos under public/vehicle-brand-logos/<category>/ and set logo here.
const homepageCategoryDefinitions: Record<MarketplaceCategorySlug, HomepageCategoryDefinition> = {
  cars: {
    types: [
      type('hatchback', 'Halvkombi', '/category-types/cars-hatchback.png'),
      type('sedan', 'Sedan', '/category-types/cars-sedan.png'),
      type('suv', 'SUV', '/category-types/cars-suv.png'),
      type('estate', 'Kombi', '/category-types/cars-estate.png'),
      type('coupe', 'Coupé', '/category-types/cars-coupe.png'),
      type('convertible', 'Cabriolet', '/category-types/cars-convertible.png'),
      type('pickup', 'Pickup', '/category-types/cars-pickup.png'),
      type('electric-car', 'Elbil', '/category-types/cars-electric.png'),
    ],
    selected: [
      { id: 'electric', label: vehicleTypeLabels.Elbil, filters: { fuel: 'El' }, image: '/category-types/cars-electric.png', icon: 'electric', highlighted: true },
      { id: 'leasing', label: label('Leasing', 'Leasing', 'Leasing', 'Leasing', 'Leasing', 'Leasing', 'Leasing', 'Leasing', 'Leasing', 'Leasing'), filters: { mode: 'leasing', offerType: 'lease' }, image: '/category-types/cars-estate.png', icon: 'leasing' },
      { id: 'newer', label: label('Nyare bilar', 'Newer cars', 'Neuere Autos', 'Voitures récentes', 'Coches recientes', 'Auto recenti', 'Nowsze samochody', 'Nieuwere auto’s', 'Uudemmat autot', 'Nyere biler'), filters: { minYear: '2022', sort: 'published' }, image: '/category-types/cars-sedan.png', icon: 'newer' },
      { id: 'family', typeId: 'suv', icon: 'utility' },
      { id: 'coupe', typeId: 'coupe', icon: 'sport' },
      { id: 'estate', typeId: 'estate', icon: 'utility' },
      { id: 'pickup', typeId: 'pickup', icon: 'utility' },
      { id: 'hatchback', typeId: 'hatchback', icon: 'newer' },
    ],
    popular: [
      { typeId: 'suv', image: '/popular-car-categories/family-cars-v2.webp', imageFit: 'cover' },
      { typeId: 'coupe', image: '/popular-car-categories/premium-cars-v2.webp', imageFit: 'cover' },
      { typeId: 'estate', image: '/popular-car-categories/commuter-cars-v2.webp', imageFit: 'cover' },
      { typeId: 'electric-car', image: '/popular-car-categories/electric-hybrid-v2.webp', imageFit: 'cover' },
    ],
    brands: [
      ['volvo', 'Volvo', '/vehicle-brand-logos/volvo.png'],
      ['volkswagen', 'Volkswagen', '/vehicle-brand-logos/volkswagen.png'],
      ['bmw', 'BMW', '/vehicle-brand-logos/bmw.png'],
      ['audi', 'Audi', '/vehicle-brand-logos/audi.png'],
      ['mercedes-benz', 'Mercedes-Benz', '/vehicle-brand-logos/mercedes-benz.png'],
      ['toyota', 'Toyota', '/vehicle-brand-logos/toyota.png'],
      ['ford', 'Ford', '/vehicle-brand-logos/ford.png'],
      ['tesla', 'Tesla', '/vehicle-brand-logos/tesla.png'],
      ['skoda', 'Skoda', '/vehicle-brand-logos/skoda.svg'],
      ['renault', 'Renault', '/vehicle-brand-logos/renault.png'],
      ['opel', 'Opel', '/vehicle-brand-logos/opel.png'],
      ['cupra', 'Cupra', '/vehicle-brand-logos/cupra.webp'],
    ].map(([id, title, logo]) => ({ id, title, logo })),
    sellImage: '/home-categories/cars.webp',
  },
  vans: {
    types: [
      type('panel', 'Skåpbil', '/category-types/vans-panel.png'),
      type('crew', 'Crew van', '/category-types/vans-crew.png'),
      type('box', 'Box van', '/category-types/vans-box.png'),
      type('refrigerated', 'Kylbil', '/category-types/vans-refrigerated.png'),
      type('minibus', 'Minibuss', '/category-types/vans-minibus.png'),
      type('pickup', 'Pickup', '/category-types/vans-pickup.png'),
      type('flatbed', 'Flak', '/category-types/vans-pickup.png'),
      type('chassis', 'Chassi', '/category-types/vans-box.png'),
      type('electric', 'Eltransport', '/category-types/vans-electric.png'),
    ],
    selected: selectedTypes(['panel', 'crew', 'pickup', 'refrigerated', 'box', 'electric', 'minibus', 'flatbed']),
    popular: popularTypes(['pickup', 'panel', 'electric', 'crew']),
    brands: brandPlaceholders(['Mercedes-Benz', 'Volkswagen', 'Ford', 'Renault', 'Iveco', 'Peugeot']),
    sellImage: '/home-categories/vans.webp',
  },
  trucks: {
    types: [
      type('tractor-unit', 'Dragbil', '/category-types/trucks-tractor-unit.png'),
      type('box', 'Skåp', '/category-types/trucks-rigid-box.png'),
      type('flatbed', 'Flak', '/category-types/trucks-flatbed.png'),
      type('tipper', 'Tipp', '/category-types/trucks-tipper.png'),
      type('crane', 'Kranbil', '/category-types/trucks-heavy-haulage.png'),
      type('refrigerated', 'Kylbil', '/category-types/trucks-refrigerated.png'),
      type('chassis', 'Chassi', '/category-types/trucks-rigid-box.png'),
      type('tanker', 'Tankbil', '/category-types/trucks-tanker.png'),
      type('hook-lift', 'Lastväxlare', '/category-types/trucks-transporter.png'),
      type('concrete-mixer', 'Betongbil', '/category-types/trucks-tipper.png'),
      type('bus', 'Buss', '/category-types/trucks-heavy-haulage.png'),
    ],
    selected: selectedTypes(['tractor-unit', 'tipper', 'box', 'flatbed', 'tanker', 'refrigerated', 'crane', 'hook-lift']),
    popular: popularTypes(['tractor-unit', 'tipper', 'flatbed', 'box']),
    brands: brandPlaceholders(['Volvo', 'Scania', 'Mercedes-Benz', 'MAN', 'DAF', 'Iveco']),
    sellImage: '/home-categories/trucks.webp',
  },
  motorcycles: {
    types: [
      type('sport', 'Sport', '/category-types/motorcycles-sport.png'),
      type('touring', 'Touring', '/category-types/motorcycles-touring.png'),
      type('custom', 'Custom', '/category-types/motorcycles-custom.png'),
      type('scooter', 'Scooter', '/category-types/motorcycles-scooter.png'),
      type('cross-enduro', 'Cross / enduro', '/category-types/motorcycles-cruiser.png'),
      type('naked', 'Naked', '/category-types/motorcycles-naked.png'),
      type('adventure', 'Adventure', '/category-types/motorcycles-adventure.png'),
      type('moped', 'Moped', '/category-types/motorcycles-electric.png'),
      type('atv', 'ATV', '/category-types/motorcycles-cruiser.png'),
    ],
    selected: selectedTypes(['adventure', 'sport', 'touring', 'naked', 'custom', 'scooter', 'cross-enduro', 'moped']),
    popular: popularTypes(['adventure', 'sport', 'touring', 'naked']),
    brands: brandPlaceholders(['BMW', 'Honda', 'Yamaha', 'Kawasaki', 'Ducati', 'KTM']),
    sellImage: '/home-categories/motorcycles.webp',
  },
  construction: {
    types: [
      type('excavator', 'Grävmaskin', '/category-types/construction-excavator.png'),
      type('mini-excavator', 'Minigrävare', '/category-types/construction-mini-excavator.png'),
      type('wheel-loader', 'Hjullastare', '/category-types/construction-wheel-loader.png'),
      type('dumper', 'Dumper', '/category-types/construction-dump-truck.png'),
      type('dozer', 'Dozer', '/category-types/construction-bulldozer.png'),
      type('roller', 'Vält', '/category-types/construction-skid-steer.png'),
      type('lift', 'Lift', '/category-types/construction-backhoe.png'),
      type('crane', 'Kran', '/category-types/construction-crane.png'),
      type('compactor', 'Kompaktor', '/category-types/construction-skid-steer.png'),
    ],
    selected: selectedTypes(['excavator', 'wheel-loader', 'dumper', 'crane', 'mini-excavator', 'dozer', 'lift', 'roller']),
    popular: popularTypes(['excavator', 'wheel-loader', 'dumper', 'crane']),
    brands: brandPlaceholders(['Caterpillar', 'Volvo CE', 'Komatsu', 'Hitachi', 'JCB', 'Liebherr']),
    sellImage: '/home-categories/construction.webp',
  },
  motorhomes: {
    types: motorhomeTypes(),
    selected: selectedTypes(['integrated', 'semi-integrated', 'overcab', 'camper-van', 'panel-van']),
    popular: popularTypes(['integrated', 'semi-integrated', 'camper-van', 'overcab']),
    brands: brandPlaceholders(['Hymer', 'Knaus', 'Adria', 'Dethleffs', 'Bürstner', 'Carthago']),
    sellImage: '/home-categories/motorhomes.webp',
  },
  caravans: {
    types: caravanTypes(),
    selected: selectedTypes(['single-axle', 'twin-axle', 'family', 'winter', 'compact']),
    popular: popularTypes(['family', 'compact', 'twin-axle', 'winter']),
    brands: brandPlaceholders(['Kabe', 'Hobby', 'Knaus', 'Adria', 'Fendt', 'Dethleffs']),
    sellImage: '/home-categories/caravans.webp',
  },
  agriculture: {
    types: [
      type('tractor', 'Traktor', '/category-types/agriculture-tractor.png'),
      type('combine', 'Skördetröska', '/category-types/agriculture-combine.png'),
      type('implement', 'Redskap', '/category-types/agriculture-plough.png'),
      type('baler', 'Press', '/category-types/agriculture-baler.png'),
      type('trailer', 'Vagn', '/category-types/agriculture-seed-drill.png'),
      type('sprayer', 'Spruta', '/category-types/agriculture-sprayer.png'),
      type('loader', 'Lastare', '/category-types/agriculture-front-loader.png'),
    ],
    selected: selectedTypes(['tractor', 'combine', 'implement', 'baler', 'loader', 'trailer', 'sprayer']),
    popular: popularTypes(['tractor', 'combine', 'loader', 'baler']),
    brands: brandPlaceholders(['John Deere', 'New Holland', 'Massey Ferguson', 'Fendt', 'Claas', 'Valtra']),
    sellImage: '/home-categories/agriculture.webp',
  },
  'electric-bikes': {
    types: [
      type('city', 'City', '/category-types/electric-bikes-city.png'),
      type('hybrid', 'Hybrid', '/category-types/electric-bikes-trekking.png'),
      type('mountain', 'Mountainbike', '/category-types/electric-bikes-mountain.png'),
      type('cargo', 'Cargo', '/category-types/electric-bikes-cargo.png'),
      type('folding', 'Folding', '/category-types/electric-bikes-folding.png'),
      type('speed', 'Speedbike', '/category-types/electric-bikes-speed.png'),
      type('racer', 'Racer', '/category-types/electric-bikes-commuter.png'),
      type('kids', 'Barncykel', '/category-types/electric-bikes-kids.png'),
    ],
    selected: selectedTypes(['city', 'hybrid', 'mountain', 'cargo', 'folding', 'speed', 'racer', 'kids']),
    popular: popularTypes(['city', 'hybrid', 'mountain', 'cargo']),
    brands: brandPlaceholders(['Cube', 'Specialized', 'Trek', 'Giant', 'Cannondale', 'Scott']),
    sellImage: '/home-categories/electric-bikes.webp',
  },
}

function motorhomeTypes(): HomepageTypeDefinition[] {
  return [
    type('integrated', 'Helintegrerad', '/category-types/recreation-a-class.png'),
    type('semi-integrated', 'Halvintegrerad', '/category-types/recreation-coachbuilt.png'),
    type('overcab', 'Alkov', '/category-types/recreation-overcab.png'),
    type('camper-van', 'Camper van', '/category-types/recreation-camper-van.png'),
    type('panel-van', 'Plåtis', '/category-types/recreation-compact-caravan.png'),
  ]
}

function caravanTypes(): HomepageTypeDefinition[] {
  return [
    type('single-axle', 'Enkelaxel', '/category-types/recreation-compact-caravan.png'),
    type('twin-axle', 'Boggie', '/category-types/recreation-twin-axle.png'),
    type('family', 'Familjevagn', '/category-types/recreation-family-caravan.png'),
    type('winter', 'Vintervagn', '/category-types/recreation-coachbuilt.png'),
    type('compact', 'Liten husvagn', '/category-types/recreation-teardrop.png'),
  ]
}

function selectedTypes(ids: string[]): HomepageSelectedDefinition[] {
  const icons: SelectedVehicleCategory['icon'][] = ['utility', 'newer', 'sport', 'electric']
  return ids.map((typeId, index) => ({
    id: typeId,
    typeId,
    icon: icons[index % icons.length],
    highlighted: index === 0,
  }))
}

function popularTypes(ids: string[]): HomepagePopularDefinition[] {
  return ids.map((typeId) => ({ typeId, imageFit: 'contain' }))
}

function brandPlaceholders(titles: string[]): HomepageBrandDefinition[] {
  return titles.map((title) => ({
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title,
  }))
}

const categoryPluralByLocale: Record<PublicLocale, Record<MarketplaceCategorySlug, string>> = {
  sv: { cars: 'bilar', vans: 'transportbilar', trucks: 'lastbilar', motorcycles: 'motorcyklar', construction: 'entreprenadmaskiner', motorhomes: 'husbilar', caravans: 'husvagnar', agriculture: 'lantbruksmaskiner', 'electric-bikes': 'cyklar' },
  en: { cars: 'cars', vans: 'vans', trucks: 'trucks', motorcycles: 'motorcycles', construction: 'construction machinery', motorhomes: 'motorhomes', caravans: 'caravans', agriculture: 'agricultural machinery', 'electric-bikes': 'bikes' },
  de: { cars: 'Autos', vans: 'Transporter', trucks: 'Lkw', motorcycles: 'Motorräder', construction: 'Baumaschinen', motorhomes: 'Wohnmobile', caravans: 'Wohnwagen', agriculture: 'Landmaschinen', 'electric-bikes': 'Fahrräder' },
  at: { cars: 'Autos', vans: 'Transporter', trucks: 'Lkw', motorcycles: 'Motorräder', construction: 'Baumaschinen', motorhomes: 'Wohnmobile', caravans: 'Wohnwagen', agriculture: 'Landmaschinen', 'electric-bikes': 'Fahrräder' },
  be: { cars: 'auto’s', vans: 'bestelwagens', trucks: 'vrachtwagens', motorcycles: 'motorfietsen', construction: 'bouwmachines', motorhomes: 'campers', caravans: 'caravans', agriculture: 'landbouwmachines', 'electric-bikes': 'fietsen' },
  fr: { cars: 'voitures', vans: 'utilitaires', trucks: 'camions', motorcycles: 'motos', construction: 'engins de chantier', motorhomes: 'camping-cars', caravans: 'caravanes', agriculture: 'machines agricoles', 'electric-bikes': 'vélos' },
  es: { cars: 'coches', vans: 'furgonetas', trucks: 'camiones', motorcycles: 'motos', construction: 'maquinaria de construcción', motorhomes: 'autocaravanas', caravans: 'caravanas', agriculture: 'maquinaria agrícola', 'electric-bikes': 'bicicletas' },
  it: { cars: 'auto', vans: 'furgoni', trucks: 'camion', motorcycles: 'moto', construction: 'macchine edili', motorhomes: 'camper', caravans: 'roulotte', agriculture: 'macchine agricole', 'electric-bikes': 'biciclette' },
  pl: { cars: 'samochody', vans: 'samochody dostawcze', trucks: 'ciężarówki', motorcycles: 'motocykle', construction: 'maszyny budowlane', motorhomes: 'kampery', caravans: 'przyczepy kempingowe', agriculture: 'maszyny rolnicze', 'electric-bikes': 'rowery' },
  nl: { cars: 'auto’s', vans: 'bestelwagens', trucks: 'vrachtwagens', motorcycles: 'motorfietsen', construction: 'bouwmachines', motorhomes: 'campers', caravans: 'caravans', agriculture: 'landbouwmachines', 'electric-bikes': 'fietsen' },
  fi: { cars: 'autot', vans: 'pakettiautot', trucks: 'kuorma-autot', motorcycles: 'moottoripyörät', construction: 'maanrakennuskoneet', motorhomes: 'matkailuautot', caravans: 'asuntovaunut', agriculture: 'maatalouskoneet', 'electric-bikes': 'polkupyörät' },
  da: { cars: 'biler', vans: 'varebiler', trucks: 'lastbiler', motorcycles: 'motorcykler', construction: 'entreprenørmaskiner', motorhomes: 'autocampere', caravans: 'campingvogne', agriculture: 'landbrugsmaskiner', 'electric-bikes': 'cykler' },
}

const categorySingularByLocale: Record<PublicLocale, Record<MarketplaceCategorySlug, string>> = {
  sv: { cars: 'bil', vans: 'transportbil', trucks: 'lastbil', motorcycles: 'motorcykel', construction: 'entreprenadmaskin', motorhomes: 'husbil', caravans: 'husvagn', agriculture: 'lantbruksmaskin', 'electric-bikes': 'cykel' },
  en: { cars: 'car', vans: 'van', trucks: 'truck', motorcycles: 'motorcycle', construction: 'construction machine', motorhomes: 'motorhome', caravans: 'caravan', agriculture: 'agricultural machine', 'electric-bikes': 'bike' },
  de: { cars: 'Auto', vans: 'Transporter', trucks: 'Lkw', motorcycles: 'Motorrad', construction: 'Baumaschine', motorhomes: 'Wohnmobil', caravans: 'Wohnwagen', agriculture: 'Landmaschine', 'electric-bikes': 'Fahrrad' },
  at: { cars: 'Auto', vans: 'Transporter', trucks: 'Lkw', motorcycles: 'Motorrad', construction: 'Baumaschine', motorhomes: 'Wohnmobil', caravans: 'Wohnwagen', agriculture: 'Landmaschine', 'electric-bikes': 'Fahrrad' },
  be: { cars: 'auto', vans: 'bestelwagen', trucks: 'vrachtwagen', motorcycles: 'motorfiets', construction: 'bouwmachine', motorhomes: 'camper', caravans: 'caravan', agriculture: 'landbouwmachine', 'electric-bikes': 'fiets' },
  fr: { cars: 'voiture', vans: 'utilitaire', trucks: 'camion', motorcycles: 'moto', construction: 'engin de chantier', motorhomes: 'camping-car', caravans: 'caravane', agriculture: 'machine agricole', 'electric-bikes': 'vélo' },
  es: { cars: 'coche', vans: 'furgoneta', trucks: 'camión', motorcycles: 'moto', construction: 'máquina de construcción', motorhomes: 'autocaravana', caravans: 'caravana', agriculture: 'máquina agrícola', 'electric-bikes': 'bicicleta' },
  it: { cars: 'auto', vans: 'furgone', trucks: 'camion', motorcycles: 'moto', construction: 'macchina edile', motorhomes: 'camper', caravans: 'roulotte', agriculture: 'macchina agricola', 'electric-bikes': 'bicicletta' },
  pl: { cars: 'samochód', vans: 'samochód dostawczy', trucks: 'ciężarówkę', motorcycles: 'motocykl', construction: 'maszynę budowlaną', motorhomes: 'kamper', caravans: 'przyczepę kempingową', agriculture: 'maszynę rolniczą', 'electric-bikes': 'rower' },
  nl: { cars: 'auto', vans: 'bestelwagen', trucks: 'vrachtwagen', motorcycles: 'motorfiets', construction: 'bouwmachine', motorhomes: 'camper', caravans: 'caravan', agriculture: 'landbouwmachine', 'electric-bikes': 'fiets' },
  fi: { cars: 'auto', vans: 'pakettiauto', trucks: 'kuorma-auto', motorcycles: 'moottoripyörä', construction: 'maanrakennuskone', motorhomes: 'matkailuauto', caravans: 'asuntovaunu', agriculture: 'maatalouskone', 'electric-bikes': 'polkupyörä' },
  da: { cars: 'bil', vans: 'varebil', trucks: 'lastbil', motorcycles: 'motorcykel', construction: 'entreprenørmaskine', motorhomes: 'autocamper', caravans: 'campingvogn', agriculture: 'landbrugsmaskine', 'electric-bikes': 'cykel' },
}

const listingTitleTemplatesByLocale: Record<
  PublicLocale,
  { latest: string; top: string }
> = {
  sv: { latest: 'Senaste annonser för {c} i {m}', top: 'Topplistan för {c} i {m}' },
  en: { latest: 'Latest {c} listings in {m}', top: 'Top {c} listings in {m}' },
  de: { latest: 'Neueste Anzeigen für {c} in {m}', top: 'Top-Anzeigen für {c} in {m}' },
  at: { latest: 'Neueste Anzeigen für {c} in {m}', top: 'Top-Anzeigen für {c} in {m}' },
  be: { latest: 'Nieuwste advertenties voor {c} in {m}', top: 'Topadvertenties voor {c} in {m}' },
  fr: { latest: 'Dernières annonces de {c} en {m}', top: 'Meilleures annonces de {c} en {m}' },
  es: { latest: 'Últimos anuncios de {c} en {m}', top: 'Anuncios destacados de {c} en {m}' },
  it: { latest: 'Ultimi annunci di {c} in {m}', top: 'Annunci in evidenza di {c} in {m}' },
  pl: { latest: 'Najnowsze ogłoszenia: {c} w {m}', top: 'Najpopularniejsze ogłoszenia: {c} w {m}' },
  nl: { latest: 'Nieuwste advertenties voor {c} in {m}', top: 'Topadvertenties voor {c} in {m}' },
  fi: { latest: 'Uusimmat ilmoitukset: {c} {m}', top: 'Suosituimmat ilmoitukset: {c} {m}' },
  da: { latest: 'Seneste annoncer for {c} i {m}', top: 'Topannoncer for {c} i {m}' },
}

type SectionCopy = {
  selected: (category: string) => string
  popular: (category: string) => string
  types: (category: string) => string
  brands: (category: string) => string
  viewType: string
  viewAll: string
  browse: string
  europe: string
  empty: (category: string, market: string) => string
  emptyCta: string
  sellTitle: (category: string) => string
  dealerCta: string
  privateCta: string
}

const sectionCopyByLocale: Record<PublicLocale, SectionCopy> = {
  sv: sectionCopy('Utvalda {c}', 'Populära {c}', '{c} efter typ', 'Populära märken för {c}', 'Visa annonser', 'Visa alla', 'Utforska', 'I hela Europa', 'Bli först med att annonsera {c} i {m}.', 'Skapa gratis annons', 'Vill du sälja din {c}?', 'Få bud från handlare', 'Skapa privat annons'),
  en: sectionCopy('Selected {c}', 'Popular {c}', '{c} by type', 'Popular {c} brands', 'View listings', 'View all', 'Explore', 'Across Europe', 'Be the first to list a {c} in {m}.', 'Create free listing', 'Looking to sell your {c}?', 'Get dealer offers', 'Create private listing'),
  de: sectionCopy('Ausgewählte {c}', 'Beliebte {c}', '{c} nach Typ', 'Beliebte Marken für {c}', 'Anzeigen ansehen', 'Alle ansehen', 'Entdecken', 'Europaweit', 'Bieten Sie als Erster ein {c} in {m} an.', 'Kostenlos inserieren', '{c} verkaufen?', 'Händlerangebote erhalten', 'Private Anzeige erstellen'),
  at: sectionCopy('Ausgewählte {c}', 'Beliebte {c}', '{c} nach Typ', 'Beliebte Marken für {c}', 'Anzeigen ansehen', 'Alle ansehen', 'Entdecken', 'Europaweit', 'Bieten Sie als Erster ein {c} in {m} an.', 'Kostenlos inserieren', '{c} verkaufen?', 'Händlerangebote erhalten', 'Private Anzeige erstellen'),
  be: sectionCopy('Geselecteerde {c}', 'Populaire {c}', '{c} per type', 'Populaire merken voor {c}', 'Bekijk advertenties', 'Bekijk alles', 'Ontdek', 'In heel Europa', 'Plaats als eerste een {c} in {m}.', 'Gratis advertentie maken', 'Wil je jouw {c} verkopen?', 'Ontvang dealerbiedingen', 'Particuliere advertentie maken'),
  fr: sectionCopy('{c} sélectionnés', '{c} populaires', '{c} par type', 'Marques populaires de {c}', 'Voir les annonces', 'Tout voir', 'Découvrir', 'Partout en Europe', 'Soyez le premier à publier un {c} en {m}.', 'Publier gratuitement', 'Vous vendez votre {c} ?', 'Recevoir des offres pro', 'Créer une annonce privée'),
  es: sectionCopy('{c} seleccionados', '{c} populares', '{c} por tipo', 'Marcas populares de {c}', 'Ver anuncios', 'Ver todos', 'Explorar', 'En toda Europa', 'Sé el primero en anunciar un {c} en {m}.', 'Crear anuncio gratis', '¿Quieres vender tu {c}?', 'Recibir ofertas profesionales', 'Crear anuncio particular'),
  it: sectionCopy('{c} selezionati', '{c} popolari', '{c} per tipologia', 'Marchi popolari di {c}', 'Vedi annunci', 'Vedi tutti', 'Scopri', 'In tutta Europa', 'Pubblica per primo un {c} in {m}.', 'Crea annuncio gratuito', 'Vuoi vendere il tuo {c}?', 'Ricevi offerte professionali', 'Crea annuncio privato'),
  pl: sectionCopy('Wybrane: {c}', 'Popularne: {c}', '{c} według typu', 'Popularne marki: {c}', 'Zobacz ogłoszenia', 'Zobacz wszystkie', 'Przeglądaj', 'W całej Europie', 'Dodaj jako pierwszy ofertę: {c} w {m}.', 'Dodaj darmowe ogłoszenie', 'Chcesz sprzedać: {c}?', 'Otrzymaj oferty firm', 'Dodaj ogłoszenie prywatne'),
  nl: sectionCopy('Geselecteerde {c}', 'Populaire {c}', '{c} per type', 'Populaire merken voor {c}', 'Bekijk advertenties', 'Bekijk alles', 'Ontdek', 'In heel Europa', 'Plaats als eerste een {c} in {m}.', 'Gratis advertentie maken', 'Wil je jouw {c} verkopen?', 'Ontvang dealerbiedingen', 'Particuliere advertentie maken'),
  fi: sectionCopy('Valitut {c}', 'Suositut {c}', '{c} tyypin mukaan', 'Suositut merkit: {c}', 'Näytä ilmoitukset', 'Näytä kaikki', 'Tutustu', 'Koko Euroopassa', 'Ole ensimmäinen, joka lisää {c}-ilmoituksen {m}.', 'Luo ilmainen ilmoitus', 'Haluatko myydä ajoneuvon: {c}?', 'Pyydä yritystarjouksia', 'Luo yksityinen ilmoitus'),
  da: sectionCopy('Udvalgte {c}', 'Populære {c}', '{c} efter type', 'Populære mærker til {c}', 'Se annoncer', 'Se alle', 'Udforsk', 'I hele Europa', 'Bliv den første til at annoncere en {c} i {m}.', 'Opret gratis annonce', 'Vil du sælge din {c}?', 'Få tilbud fra forhandlere', 'Opret privat annonce'),
}

function sectionCopy(
  selected: string,
  popular: string,
  types: string,
  brands: string,
  viewType: string,
  viewAll: string,
  browse: string,
  europe: string,
  empty: string,
  emptyCta: string,
  sellTitle: string,
  dealerCta: string,
  privateCta: string,
): SectionCopy {
  const fill = (template: string) => (category: string) => template.replace('{c}', category)
  return {
    selected: fill(selected),
    popular: fill(popular),
    types: fill(types),
    brands: fill(brands),
    viewType,
    viewAll,
    browse,
    europe,
    empty: (category, market) => empty.replace('{c}', category).replace('{m}', market),
    emptyCta,
    sellTitle: fill(sellTitle),
    dealerCta,
    privateCta,
  }
}

export function getHomepageCategoryPresentations(
  locale: PublicLocale,
  marketLabel: string,
): Record<MarketplaceCategorySlug, HomepageCategoryPresentation> {
  return Object.fromEntries(
    (Object.keys(homepageCategoryDefinitions) as MarketplaceCategorySlug[]).map((category) => [
      category,
      getHomepageCategoryPresentation(locale, marketLabel, category),
    ]),
  ) as Record<MarketplaceCategorySlug, HomepageCategoryPresentation>
}

export function getHomepageCategoryPresentation(
  locale: PublicLocale,
  marketLabel: string,
  category: MarketplaceCategorySlug,
): HomepageCategoryPresentation {
  const definition = homepageCategoryDefinitions[category]
  const plural = categoryPluralByLocale[locale][category]
  const singular = categorySingularByLocale[locale][category]
  const copy = sectionCopyByLocale[locale]
  const listingTitles = listingTitleTemplatesByLocale[locale]
  const contextualMarketLabel = getContextualMarketLabel(locale, marketLabel)
  const typeById = new Map(definition.types.map((item) => [item.id, item]))
  const marketplaceHref = homepageMarketplaceHref(locale, category)
  const selectedCategories = definition.selected.flatMap((item) => {
    const categoryType = item.typeId ? typeById.get(item.typeId) : undefined
    if (item.typeId && !categoryType) return []
    const title = localizeLabel(locale, item.label || categoryType!.label)
    const filters = item.filters || (categoryType ? { bodyType: categoryType.filterValue } : {})
    return [{
      id: item.id,
      title,
      subtitle: copy.viewType,
      href: homepageMarketplaceHref(locale, category, filters),
      image: item.image || categoryType!.image,
      icon: item.icon,
      highlighted: item.highlighted,
    } satisfies SelectedVehicleCategory]
  })
  const popularCategories = definition.popular.flatMap((item) => {
    const categoryType = typeById.get(item.typeId)
    if (!categoryType) return []
    const title = localizeLabel(locale, categoryType.label)
    return [{
      id: categoryType.id,
      title,
      href: homepageMarketplaceHref(locale, category, { bodyType: categoryType.filterValue }),
      image: item.image || categoryType.image,
      imageFit: item.imageFit || 'contain',
      tags: [title, copy.browse, copy.europe],
    } satisfies PopularCarCategory]
  })
  const vehicleTypes = definition.types.map((item) => ({
    id: item.id,
    title: localizeLabel(locale, item.label),
    subtitle: copy.viewType,
    href: homepageMarketplaceHref(locale, category, { bodyType: item.filterValue }),
    image: item.image,
  } satisfies VehicleBodyCategory))
  const popularBrands = definition.brands.map((brand) => ({
    ...brand,
    href: homepageMarketplaceHref(locale, category, { make: brand.title }),
  } satisfies PopularVehicleBrand))

  return {
    slug: category,
    latestTitle: fillCategoryAndMarket(listingTitles.latest, plural, contextualMarketLabel),
    topTitle: fillCategoryAndMarket(listingTitles.top, plural, contextualMarketLabel),
    selectedTitle: copy.selected(titleCase(plural)),
    selectedScrollLabel: copy.selected(plural),
    selectedCategories,
    popularTitle: copy.popular(titleCase(plural)),
    popularScrollLabel: copy.popular(plural),
    popularCategories,
    vehicleTypesTitle: copy.types(titleCase(plural)),
    vehicleTypesScrollLabel: copy.types(plural),
    vehicleTypes,
    vehicleTypesAllLabel: copy.viewAll,
    vehicleTypesAllHref: marketplaceHref,
    popularBrandsTitle: copy.brands(plural),
    popularBrands,
    marketplaceHref,
    emptyText: copy.empty(singular, contextualMarketLabel),
    emptyCta: copy.emptyCta,
    sell: {
      title: copy.sellTitle(singular),
      image: definition.sellImage,
      imageAlt: categoryImageAlt(locale, plural),
      dealerCta: copy.dealerCta,
      privateCta: copy.privateCta,
      dealerHref: localizePublicHref(locale, `/sell-to-dealer?category=${category}`),
      privateHref: localizePublicHref(locale, `/account/listings/new?category=${category}`),
    },
    seo: getHomepageCategorySeo(locale, category, marketLabel),
  }
}

function fillCategoryAndMarket(template: string, category: string, market: string) {
  return template.replace('{c}', category).replace('{m}', market)
}

export function homepageMarketplaceHref(
  locale: PublicLocale,
  category: MarketplaceCategorySlug,
  filters: Record<string, string> = {},
) {
  const mode = filters.mode === 'leasing' ? 'leasing' : 'sale'
  const params = new URLSearchParams({
    categories: category,
    mode,
    offerType: mode === 'leasing' ? 'lease' : 'sale',
    ...filters,
  })
  return localizePublicHref(locale, `/marketplace/${category}?${params.toString()}`)
}

export function getHomepageCategorySeo(
  locale: PublicLocale,
  category: MarketplaceCategorySlug,
  marketLabel: string,
): HomepageCategorySeo {
  const copy = seoCopyByLocale[locale][category]
  const contextualMarketLabel = getContextualMarketLabel(locale, marketLabel)
  return {
    title: clampSeo(fillSeoMarket(copy.title, contextualMarketLabel), 65),
    description: clampSeo(fillSeoMarket(copy.description, contextualMarketLabel), 155),
  }
}

type HomepageCategorySeoCopy = Record<MarketplaceCategorySlug, HomepageCategorySeo>

const defineSeoCopy = (copy: HomepageCategorySeoCopy) => copy

const svSeoCopy = defineSeoCopy({
  cars: { title: 'Bilar till salu i {m} | Autorell', description: 'Köp ny eller begagnad bil i {m}. Jämför märken, modeller, priser och säljare eller skapa en egen bilannons på Autorell.' },
  vans: { title: 'Transportbilar till salu i {m} | Autorell', description: 'Sök skåpbilar, pickups och andra transportbilar i {m}. Jämför utrustning, pris och säljare på Autorell.' },
  trucks: { title: 'Lastbilar till salu i {m} | Autorell', description: 'Hitta dragbilar, tippbilar, kranbilar och andra lastbilar i {m}. Jämför aktuella annonser på Autorell.' },
  motorcycles: { title: 'Motorcyklar till salu i {m} | Autorell', description: 'Utforska sport-, touring- och adventuremotorcyklar i {m}. Jämför årsmodell, miltal, pris och säljare på Autorell.' },
  construction: { title: 'Entreprenadmaskiner i {m} | Autorell', description: 'Sök grävmaskiner, hjullastare, dumpers och andra entreprenadmaskiner i {m}. Jämför maskinannonser på Autorell.' },
  motorhomes: { title: 'Husbilar till salu i {m} | Autorell', description: 'Hitta helintegrerade, halvintegrerade och kompakta husbilar i {m}. Jämför annonser och säljare på Autorell.' },
  caravans: { title: 'Husvagnar till salu i {m} | Autorell', description: 'Sök familje-, vinter- och kompakta husvagnar i {m}. Jämför modeller, priser och säljare på Autorell.' },
  agriculture: { title: 'Lantbruksmaskiner i {m} | Autorell', description: 'Hitta traktorer, skördetröskor, redskap och andra lantbruksmaskiner i {m}. Jämför aktuella annonser på Autorell.' },
  'electric-bikes': { title: 'Cyklar till salu i {m} | Autorell', description: 'Sök elcyklar, stadscyklar, lastcyklar och mountainbikes i {m}. Jämför skick, pris och säljare på Autorell.' },
})

const enSeoCopy = defineSeoCopy({
  cars: { title: 'Cars for sale in {m} | Autorell', description: 'Find new and used cars in {m}. Compare makes, models, prices and sellers, or publish your own car listing on Autorell.' },
  vans: { title: 'Vans for sale in {m} | Autorell', description: 'Browse panel vans, pickups and other commercial vans in {m}. Compare specifications, prices and sellers on Autorell.' },
  trucks: { title: 'Trucks for sale in {m} | Autorell', description: 'Find tractor units, tippers, crane trucks and more in {m}. Compare current truck listings and sellers on Autorell.' },
  motorcycles: { title: 'Motorcycles for sale in {m} | Autorell', description: 'Explore sport, touring and adventure motorcycles in {m}. Compare year, mileage, price and sellers on Autorell.' },
  construction: { title: 'Construction machinery in {m} | Autorell', description: 'Search excavators, wheel loaders, dumpers and other construction machinery in {m}. Compare equipment listings on Autorell.' },
  motorhomes: { title: 'Motorhomes for sale in {m} | Autorell', description: 'Find integrated, coachbuilt and compact motorhomes in {m}. Compare layouts, prices and sellers on Autorell.' },
  caravans: { title: 'Caravans for sale in {m} | Autorell', description: 'Browse family, winter and lightweight caravans in {m}. Compare models, prices and private or trade sellers on Autorell.' },
  agriculture: { title: 'Agricultural machinery in {m} | Autorell', description: 'Find tractors, harvesters, implements and other agricultural machinery in {m}. Compare current listings on Autorell.' },
  'electric-bikes': { title: 'Bikes for sale in {m} | Autorell', description: 'Search electric, city, cargo and mountain bikes in {m}. Compare condition, price and sellers on Autorell.' },
})

const deSeoCopy = defineSeoCopy({
  cars: { title: 'Autos kaufen in {m} | Autorell', description: 'Finden Sie neue und gebrauchte Autos in {m}. Vergleichen Sie Marken, Modelle, Preise und Anbieter auf Autorell.' },
  vans: { title: 'Transporter kaufen in {m} | Autorell', description: 'Entdecken Sie Kastenwagen, Pick-ups und weitere Transporter in {m}. Vergleichen Sie Ausstattung und Preise auf Autorell.' },
  trucks: { title: 'Lkw kaufen in {m} | Autorell', description: 'Finden Sie Sattelzugmaschinen, Kipper, Kranwagen und weitere Lkw in {m}. Vergleichen Sie aktuelle Angebote auf Autorell.' },
  motorcycles: { title: 'Motorräder kaufen in {m} | Autorell', description: 'Suchen Sie Sport-, Touring- und Adventure-Motorräder in {m}. Vergleichen Sie Baujahr, Laufleistung und Preis auf Autorell.' },
  construction: { title: 'Baumaschinen kaufen in {m} | Autorell', description: 'Finden Sie Bagger, Radlader, Dumper und weitere Baumaschinen in {m}. Vergleichen Sie Maschinenangebote auf Autorell.' },
  motorhomes: { title: 'Wohnmobile kaufen in {m} | Autorell', description: 'Entdecken Sie integrierte, teilintegrierte und kompakte Wohnmobile in {m}. Vergleichen Sie Preise und Anbieter auf Autorell.' },
  caravans: { title: 'Wohnwagen kaufen in {m} | Autorell', description: 'Suchen Sie Familien-, Winter- und kompakte Wohnwagen in {m}. Vergleichen Sie Modelle, Preise und Anbieter auf Autorell.' },
  agriculture: { title: 'Landmaschinen kaufen in {m} | Autorell', description: 'Finden Sie Traktoren, Mähdrescher, Anbaugeräte und weitere Landmaschinen in {m}. Vergleichen Sie Angebote auf Autorell.' },
  'electric-bikes': { title: 'Fahrräder kaufen in {m} | Autorell', description: 'Suchen Sie E-Bikes, City-, Cargo- und Mountainbikes in {m}. Vergleichen Sie Zustand, Preis und Anbieter auf Autorell.' },
})

const nlSeoCopy = defineSeoCopy({
  cars: { title: 'Auto’s te koop in {m} | Autorell', description: 'Vind nieuwe en gebruikte auto’s in {m}. Vergelijk merken, modellen, prijzen en verkopers of plaats zelf een advertentie.' },
  vans: { title: 'Bestelwagens te koop in {m} | Autorell', description: 'Bekijk gesloten bestelwagens, pick-ups en andere bedrijfswagens in {m}. Vergelijk uitvoering en prijs op Autorell.' },
  trucks: { title: 'Vrachtwagens te koop in {m} | Autorell', description: 'Vind trekkers, kippers, kraanwagens en andere vrachtwagens in {m}. Vergelijk actuele advertenties op Autorell.' },
  motorcycles: { title: 'Motorfietsen te koop in {m} | Autorell', description: 'Ontdek sport-, touring- en adventuremotoren in {m}. Vergelijk bouwjaar, kilometerstand, prijs en verkoper op Autorell.' },
  construction: { title: 'Bouwmachines te koop in {m} | Autorell', description: 'Zoek graafmachines, wielladers, dumpers en andere bouwmachines in {m}. Vergelijk machineadvertenties op Autorell.' },
  motorhomes: { title: 'Campers te koop in {m} | Autorell', description: 'Vind integraal-, halfintegraal- en compacte campers in {m}. Vergelijk indeling, prijzen en verkopers op Autorell.' },
  caravans: { title: 'Caravans te koop in {m} | Autorell', description: 'Bekijk gezins-, winter- en compacte caravans in {m}. Vergelijk modellen, prijzen en verkopers op Autorell.' },
  agriculture: { title: 'Landbouwmachines in {m} | Autorell', description: 'Vind tractoren, maaidorsers, werktuigen en andere landbouwmachines in {m}. Vergelijk actuele advertenties op Autorell.' },
  'electric-bikes': { title: 'Fietsen te koop in {m} | Autorell', description: 'Zoek e-bikes, stads-, bak- en mountainbikes in {m}. Vergelijk staat, prijs en verkopers op Autorell.' },
})

const frSeoCopy = defineSeoCopy({
  cars: { title: 'Voitures à vendre en {m} | Autorell', description: 'Trouvez une voiture neuve ou d’occasion en {m}. Comparez marques, modèles, prix et vendeurs ou publiez votre annonce.' },
  vans: { title: 'Utilitaires à vendre en {m} | Autorell', description: 'Recherchez fourgons, pick-up et autres véhicules utilitaires en {m}. Comparez équipements, prix et vendeurs sur Autorell.' },
  trucks: { title: 'Camions à vendre en {m} | Autorell', description: 'Trouvez tracteurs routiers, bennes, camions-grues et autres poids lourds en {m}. Comparez les annonces sur Autorell.' },
  motorcycles: { title: 'Motos à vendre en {m} | Autorell', description: 'Explorez les motos sportives, routières et trail en {m}. Comparez année, kilométrage, prix et vendeurs sur Autorell.' },
  construction: { title: 'Engins de chantier en {m} | Autorell', description: 'Recherchez pelles, chargeuses, dumpers et autres engins de chantier en {m}. Comparez les annonces de matériel sur Autorell.' },
  motorhomes: { title: 'Camping-cars à vendre en {m} | Autorell', description: 'Trouvez camping-cars intégraux, profilés et fourgons compacts en {m}. Comparez agencements, prix et vendeurs sur Autorell.' },
  caravans: { title: 'Caravanes à vendre en {m} | Autorell', description: 'Découvrez caravanes familiales, hiver et compactes en {m}. Comparez modèles, prix et vendeurs sur Autorell.' },
  agriculture: { title: 'Machines agricoles en {m} | Autorell', description: 'Trouvez tracteurs, moissonneuses, outils et autres machines agricoles en {m}. Comparez les annonces sur Autorell.' },
  'electric-bikes': { title: 'Vélos à vendre en {m} | Autorell', description: 'Recherchez vélos électriques, urbains, cargo et VTT en {m}. Comparez état, prix et vendeurs sur Autorell.' },
})

const esSeoCopy = defineSeoCopy({
  cars: { title: 'Coches en venta en {m} | Autorell', description: 'Encuentra coches nuevos y usados en {m}. Compara marcas, modelos, precios y vendedores o publica tu propio anuncio.' },
  vans: { title: 'Furgonetas en venta en {m} | Autorell', description: 'Busca furgones, pickups y otros vehículos comerciales en {m}. Compara equipamiento, precio y vendedor en Autorell.' },
  trucks: { title: 'Camiones en venta en {m} | Autorell', description: 'Encuentra cabezas tractoras, volquetes, camiones grúa y más en {m}. Compara anuncios actuales en Autorell.' },
  motorcycles: { title: 'Motos en venta en {m} | Autorell', description: 'Explora motos deportivas, touring y adventure en {m}. Compara año, kilometraje, precio y vendedor en Autorell.' },
  construction: { title: 'Maquinaria de construcción en {m} | Autorell', description: 'Busca excavadoras, cargadoras, dúmperes y más maquinaria de construcción en {m}. Compara anuncios en Autorell.' },
  motorhomes: { title: 'Autocaravanas en venta en {m} | Autorell', description: 'Encuentra autocaravanas integrales, perfiladas y compactas en {m}. Compara distribución, precios y vendedores.' },
  caravans: { title: 'Caravanas en venta en {m} | Autorell', description: 'Busca caravanas familiares, de invierno y compactas en {m}. Compara modelos, precios y vendedores en Autorell.' },
  agriculture: { title: 'Maquinaria agrícola en {m} | Autorell', description: 'Encuentra tractores, cosechadoras, aperos y más maquinaria agrícola en {m}. Compara anuncios actuales en Autorell.' },
  'electric-bikes': { title: 'Bicicletas en venta en {m} | Autorell', description: 'Busca bicicletas eléctricas, urbanas, cargo y de montaña en {m}. Compara estado, precio y vendedor en Autorell.' },
})

const itSeoCopy = defineSeoCopy({
  cars: { title: 'Auto in vendita in {m} | Autorell', description: 'Trova auto nuove e usate in {m}. Confronta marchi, modelli, prezzi e venditori oppure pubblica il tuo annuncio.' },
  vans: { title: 'Furgoni in vendita in {m} | Autorell', description: 'Cerca furgoni, pickup e altri veicoli commerciali in {m}. Confronta allestimenti, prezzi e venditori su Autorell.' },
  trucks: { title: 'Camion in vendita in {m} | Autorell', description: 'Trova trattori stradali, ribaltabili, autocarri con gru e altri camion in {m}. Confronta gli annunci su Autorell.' },
  motorcycles: { title: 'Moto in vendita in {m} | Autorell', description: 'Scopri moto sportive, touring e adventure in {m}. Confronta anno, chilometraggio, prezzo e venditori su Autorell.' },
  construction: { title: 'Macchine edili in {m} | Autorell', description: 'Cerca escavatori, pale gommate, dumper e altre macchine edili in {m}. Confronta gli annunci di mezzi su Autorell.' },
  motorhomes: { title: 'Camper in vendita in {m} | Autorell', description: 'Trova camper integrali, semintegrali e compatti in {m}. Confronta disposizione, prezzi e venditori su Autorell.' },
  caravans: { title: 'Roulotte in vendita in {m} | Autorell', description: 'Cerca roulotte familiari, invernali e compatte in {m}. Confronta modelli, prezzi e venditori su Autorell.' },
  agriculture: { title: 'Macchine agricole in {m} | Autorell', description: 'Trova trattori, mietitrebbie, attrezzature e altre macchine agricole in {m}. Confronta gli annunci su Autorell.' },
  'electric-bikes': { title: 'Biciclette in vendita in {m} | Autorell', description: 'Cerca e-bike, bici da città, cargo e mountain bike in {m}. Confronta condizioni, prezzi e venditori su Autorell.' },
})

const plSeoCopy = defineSeoCopy({
  cars: { title: 'Samochody na sprzedaż w {m} | Autorell', description: 'Znajdź nowe i używane samochody w {m}. Porównaj marki, modele, ceny i sprzedawców albo dodaj własne ogłoszenie.' },
  vans: { title: 'Samochody dostawcze w {m} | Autorell', description: 'Szukaj furgonów, pickupów i innych aut dostawczych w {m}. Porównaj wyposażenie, ceny i sprzedawców w Autorell.' },
  trucks: { title: 'Ciężarówki na sprzedaż w {m} | Autorell', description: 'Znajdź ciągniki siodłowe, wywrotki, auta z HDS i inne ciężarówki w {m}. Porównaj ogłoszenia w Autorell.' },
  motorcycles: { title: 'Motocykle na sprzedaż w {m} | Autorell', description: 'Odkryj motocykle sportowe, turystyczne i adventure w {m}. Porównaj rocznik, przebieg, cenę i sprzedawcę.' },
  construction: { title: 'Maszyny budowlane w {m} | Autorell', description: 'Szukaj koparek, ładowarek, wozideł i innych maszyn budowlanych w {m}. Porównaj aktualne ogłoszenia w Autorell.' },
  motorhomes: { title: 'Kampery na sprzedaż w {m} | Autorell', description: 'Znajdź kampery zintegrowane, półintegrowane i kompaktowe w {m}. Porównaj układ, ceny i sprzedawców.' },
  caravans: { title: 'Przyczepy kempingowe w {m} | Autorell', description: 'Szukaj przyczep rodzinnych, zimowych i kompaktowych w {m}. Porównaj modele, ceny i sprzedawców w Autorell.' },
  agriculture: { title: 'Maszyny rolnicze w {m} | Autorell', description: 'Znajdź ciągniki, kombajny, osprzęt i inne maszyny rolnicze w {m}. Porównaj aktualne ogłoszenia w Autorell.' },
  'electric-bikes': { title: 'Rowery na sprzedaż w {m} | Autorell', description: 'Szukaj rowerów elektrycznych, miejskich, cargo i górskich w {m}. Porównaj stan, cenę i sprzedawców.' },
})

const fiSeoCopy = defineSeoCopy({
  cars: { title: 'Autot myynnissä {m} | Autorell', description: 'Etsi uusia ja käytettyjä autoja {m}. Vertaile merkkejä, malleja, hintoja ja myyjiä Autorellissa.' },
  vans: { title: 'Pakettiautot myynnissä {m} | Autorell', description: 'Etsi umpipakettiautoja, avolavoja ja muita hyötyajoneuvoja {m}. Vertaile varusteita ja hintoja.' },
  trucks: { title: 'Kuorma-autot myynnissä {m} | Autorell', description: 'Löydä vetoautoja, kippiautoja, nosturiautoja ja muita kuorma-autoja {m}. Vertaile ilmoituksia.' },
  motorcycles: { title: 'Moottoripyörät myynnissä {m} | Autorell', description: 'Tutustu sport-, touring- ja adventure-pyöriin {m}. Vertaile vuosimallia, ajomäärää ja hintaa.' },
  construction: { title: 'Maanrakennuskoneet {m} | Autorell', description: 'Etsi kaivukoneita, pyöräkuormaajia, dumppereita ja muita maanrakennuskoneita {m}. Vertaile ilmoituksia.' },
  motorhomes: { title: 'Matkailuautot myynnissä {m} | Autorell', description: 'Löydä integroituja, puoli-integroituja ja kompakteja matkailuautoja {m}. Vertaile hintoja ja myyjiä.' },
  caravans: { title: 'Asuntovaunut myynnissä {m} | Autorell', description: 'Etsi perhe-, talvi- ja kompakteja asuntovaunuja {m}. Vertaile malleja, hintoja ja myyjiä.' },
  agriculture: { title: 'Maatalouskoneet {m} | Autorell', description: 'Löydä traktoreita, leikkuupuimureita, työlaitteita ja muita maatalouskoneita {m}. Vertaile ilmoituksia.' },
  'electric-bikes': { title: 'Polkupyörät myynnissä {m} | Autorell', description: 'Etsi sähkö-, kaupunki-, tavara- ja maastopyöriä {m}. Vertaile kuntoa, hintaa ja myyjiä.' },
})

const daSeoCopy = defineSeoCopy({
  cars: { title: 'Biler til salg i {m} | Autorell', description: 'Find nye og brugte biler i {m}. Sammenlign mærker, modeller, priser og sælgere, eller opret din egen bilannonce.' },
  vans: { title: 'Varebiler til salg i {m} | Autorell', description: 'Søg blandt kassevogne, pickups og andre varebiler i {m}. Sammenlign udstyr, pris og sælger på Autorell.' },
  trucks: { title: 'Lastbiler til salg i {m} | Autorell', description: 'Find trækkere, tipvogne, kranbiler og andre lastbiler i {m}. Sammenlign aktuelle annoncer på Autorell.' },
  motorcycles: { title: 'Motorcykler til salg i {m} | Autorell', description: 'Udforsk sport-, touring- og adventuremotorcykler i {m}. Sammenlign årgang, kilometer, pris og sælger.' },
  construction: { title: 'Entreprenørmaskiner i {m} | Autorell', description: 'Søg gravemaskiner, gummihjulslæssere, dumpere og andre entreprenørmaskiner i {m}. Sammenlign annoncer på Autorell.' },
  motorhomes: { title: 'Autocampere til salg i {m} | Autorell', description: 'Find integrerede, delintegrerede og kompakte autocampere i {m}. Sammenlign indretning, priser og sælgere.' },
  caravans: { title: 'Campingvogne til salg i {m} | Autorell', description: 'Søg familie-, vinter- og kompakte campingvogne i {m}. Sammenlign modeller, priser og sælgere på Autorell.' },
  agriculture: { title: 'Landbrugsmaskiner i {m} | Autorell', description: 'Find traktorer, mejetærskere, redskaber og andre landbrugsmaskiner i {m}. Sammenlign aktuelle annoncer på Autorell.' },
  'electric-bikes': { title: 'Cykler til salg i {m} | Autorell', description: 'Søg el-, by-, cargo- og mountainbikes i {m}. Sammenlign stand, pris og sælgere på Autorell.' },
})

const seoCopyByLocale: Record<PublicLocale, HomepageCategorySeoCopy> = {
  sv: svSeoCopy,
  en: enSeoCopy,
  de: deSeoCopy,
  at: deSeoCopy,
  be: nlSeoCopy,
  fr: frSeoCopy,
  es: esSeoCopy,
  it: itSeoCopy,
  pl: plSeoCopy,
  nl: nlSeoCopy,
  fi: fiSeoCopy,
  da: daSeoCopy,
}

function fillSeoMarket(value: string, market: string) {
  return value.replace('{m}', market)
}

function getContextualMarketLabel(locale: PublicLocale, market: string) {
  const normalizedMarket = market.trim().toLocaleLowerCase()
  if (locale === 'pl' && normalizedMarket === 'polska') return 'Polsce'
  if (locale === 'fi' && normalizedMarket === 'suomi') return 'Suomessa'
  return market
}

function localizeLabel(locale: PublicLocale, value: Label) {
  return value[locale]
}

function categoryImageAlt(locale: PublicLocale, category: string) {
  return imageAltTemplates[locale].replace('{c}', titleCase(category))
}

const imageAltTemplates: Record<PublicLocale, string> = {
  sv: '{c} på Autorell',
  en: '{c} on Autorell',
  de: '{c} bei Autorell',
  at: '{c} bei Autorell',
  be: '{c} op Autorell',
  fr: '{c} sur Autorell',
  es: '{c} en Autorell',
  it: '{c} su Autorell',
  pl: '{c} w Autorell',
  nl: '{c} op Autorell',
  fi: '{c} Autorellissa',
  da: '{c} på Autorell',
}

function titleCase(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value
}

function clampSeo(value: string, maxLength: number) {
  const clean = value.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  const clipped = clean.slice(0, maxLength + 1)
  const lastSpace = clipped.lastIndexOf(' ')
  return clipped.slice(0, lastSpace > maxLength * 0.72 ? lastSpace : maxLength).trimEnd()
}

export const homepageCategorySlugs = Object.freeze(
  Object.keys(homepageCategoryDefinitions) as MarketplaceCategorySlug[],
)
