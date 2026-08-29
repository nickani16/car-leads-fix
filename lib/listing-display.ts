import { translatePublic, type PublicLocale } from './public-client-i18n'
import { vehicleValueInEnglish } from './vehicle-translation'

type ListingChipInput = {
  fuelType?: string | null
  gearbox?: string | null
  mileageKm?: number | null
  modelYear?: string | number | null
}

export type ListingSpecChip = {
  key: string
  label: string
}

export function translateListingVehicleValue(locale: PublicLocale, value?: string | null) {
  if (!value) return ''
  const english = vehicleValueInEnglish(value)
  const direct = english
    ? staticVehicleTranslations[locale]?.[english] || localizedVehicleTypeTranslations[english]?.[locale]
    : undefined
  if (direct) return direct
  return english ? translatePublic(locale, english) : value
}

export function formatKilometers(value: number | null | undefined, locale: PublicLocale) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return ''
  return `${value.toLocaleString(numberLocale(locale))} km`
}

export function formatMileageAsMil(value: number | null | undefined, locale: PublicLocale) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return ''
  if (locale !== 'sv') return formatKilometers(value, locale)
  return `${Math.round(value / 10).toLocaleString('sv-SE')} mil`
}

export function buildListingSpecChips(input: ListingChipInput, locale: PublicLocale): ListingSpecChip[] {
  return [
    input.fuelType
      ? { key: 'fuel', label: translateListingVehicleValue(locale, input.fuelType) }
      : null,
    input.gearbox
      ? { key: 'gearbox', label: translateListingVehicleValue(locale, input.gearbox) }
      : null,
    input.mileageKm
      ? { key: 'mileage', label: formatMileageAsMil(input.mileageKm, locale) }
      : null,
    input.modelYear
      ? { key: 'year', label: String(input.modelYear) }
      : null,
  ].filter((chip): chip is ListingSpecChip => Boolean(chip?.label))
}

function numberLocale(locale: PublicLocale) {
  if (locale === 'sv') return 'sv-SE'
  if (locale === 'de') return 'de-DE'
  if (locale === 'at') return 'de-AT'
  if (locale === 'be') return 'nl-BE'
  return 'en-GB'
}

const localizedVehicleTypeTranslations: Record<string, Partial<Record<PublicLocale, string>>> = {
  'Panel van': { sv: 'Skåpbil', en: 'Panel van', de: 'Kastenwagen', at: 'Kastenwagen', be: 'Gesloten bestelwagen', fr: 'Fourgon', es: 'Furgón', it: 'Furgone', pl: 'Furgon', nl: 'Gesloten bestelwagen', fi: 'Umpipakettiauto', da: 'Kassevogn' },
  'Crew van': { sv: 'Dubbelhytt', en: 'Crew van', de: 'Doppelkabine', at: 'Doppelkabine', be: 'Dubbele cabine', fr: 'Cabine approfondie', es: 'Doble cabina', it: 'Doppia cabina', pl: 'Brygadówka', nl: 'Dubbele cabine', fi: 'Miehistöpakettiauto', da: 'Dobbeltkabine' },
  'Box van': { sv: 'Volymskåp', en: 'Box van', de: 'Kofferwagen', at: 'Kofferwagen', be: 'Bakwagen', fr: 'Fourgon caisse', es: 'Furgón caja', it: 'Furgone cassonato', pl: 'Furgon kontener', nl: 'Bakwagen', fi: 'Umpikorinen pakettiauto', da: 'Kassebil' },
  'Refrigerated van': { sv: 'Kylbil', en: 'Refrigerated van', de: 'Kühlfahrzeug', at: 'Kühlfahrzeug', be: 'Koelwagen', fr: 'Véhicule frigorifique', es: 'Vehículo frigorífico', it: 'Veicolo frigorifero', pl: 'Chłodnia', nl: 'Koelwagen', fi: 'Kylmäkuljetusauto', da: 'Kølebil' },
  'Refrigerated vehicle': { sv: 'Kylbil', en: 'Refrigerated vehicle', de: 'Kühlfahrzeug', at: 'Kühlfahrzeug', be: 'Koelwagen', fr: 'Véhicule frigorifique', es: 'Vehículo frigorífico', it: 'Veicolo frigorifero', pl: 'Chłodnia', nl: 'Koelwagen', fi: 'Kylmäkuljetusauto', da: 'Kølebil' },
  Minibus: { sv: 'Minibuss', en: 'Minibus', de: 'Minibus', at: 'Minibus', be: 'Minibus', fr: 'Minibus', es: 'Minibús', it: 'Minibus', pl: 'Minibus', nl: 'Minibus', fi: 'Minibussi', da: 'Minibus' },
  Flatbed: { sv: 'Flak', en: 'Flatbed', de: 'Pritsche', at: 'Pritsche', be: 'Open laadbak', fr: 'Plateau', es: 'Plataforma', it: 'Pianale', pl: 'Platforma', nl: 'Open laadbak', fi: 'Avolava', da: 'Ladbil' },
  'Chassis cab': { sv: 'Chassi', en: 'Chassis cab', de: 'Fahrgestell', at: 'Fahrgestell', be: 'Chassiscabine', fr: 'Châssis-cabine', es: 'Chasis cabina', it: 'Telaio cabinato', pl: 'Podwozie z kabiną', nl: 'Chassiscabine', fi: 'Alustaohjaamo', da: 'Chassiskabine' },
  Chassis: { sv: 'Chassi', en: 'Chassis', de: 'Fahrgestell', at: 'Fahrgestell', be: 'Chassiscabine', fr: 'Châssis', es: 'Chasis', it: 'Telaio', pl: 'Podwozie', nl: 'Chassis', fi: 'Alusta', da: 'Chassis' },
  'Electric van': { sv: 'Eltransport', en: 'Electric van', de: 'Elektrotransporter', at: 'Elektrotransporter', be: 'Elektrische bestelwagen', fr: 'Utilitaire électrique', es: 'Furgoneta eléctrica', it: 'Furgone elettrico', pl: 'Elektryczny dostawczy', nl: 'Elektrische bestelwagen', fi: 'Sähköpakettiauto', da: 'Elektrisk varebil' },
  'Tractor unit': { sv: 'Dragbil', en: 'Tractor unit', de: 'Sattelzugmaschine', at: 'Sattelzugmaschine', be: 'Trekker', fr: 'Tracteur routier', es: 'Cabeza tractora', it: 'Trattore stradale', pl: 'Ciągnik siodłowy', nl: 'Trekker', fi: 'Vetoauto', da: 'Trækker' },
  'Box body': { sv: 'Skåp', en: 'Box body', de: 'Kofferaufbau', at: 'Kofferaufbau', be: 'Gesloten opbouw', fr: 'Caisse fermée', es: 'Caja cerrada', it: 'Furgonatura', pl: 'Zabudowa skrzyniowa', nl: 'Gesloten opbouw', fi: 'Umpikori', da: 'Lukket kasse' },
  Tipper: { sv: 'Tipp', en: 'Tipper', de: 'Kipper', at: 'Kipper', be: 'Kipper', fr: 'Benne', es: 'Volquete', it: 'Ribaltabile', pl: 'Wywrotka', nl: 'Kipper', fi: 'Kippiauto', da: 'Tipvogn' },
  'Crane truck': { sv: 'Kranbil', en: 'Crane truck', de: 'Kranwagen', at: 'Kranwagen', be: 'Kraanwagen', fr: 'Camion-grue', es: 'Camión grúa', it: 'Autocarro con gru', pl: 'Samochód z HDS', nl: 'Kraanwagen', fi: 'Nosturiauto', da: 'Kranbil' },
  Tanker: { sv: 'Tankbil', en: 'Tanker', de: 'Tankwagen', at: 'Tankwagen', be: 'Tankwagen', fr: 'Camion-citerne', es: 'Camión cisterna', it: 'Autocisterna', pl: 'Cysterna', nl: 'Tankwagen', fi: 'Säiliöauto', da: 'Tankbil' },
  'Hook lift': { sv: 'Lastväxlare', en: 'Hook lift', de: 'Abrollkipper', at: 'Abrollkipper', be: 'Haakarm', fr: 'Ampliroll', es: 'Portacontenedores', it: 'Scarrabile', pl: 'Hakowiec', nl: 'Haakarm', fi: 'Vaihtolava-auto', da: 'Kroghejs' },
  'Concrete mixer': { sv: 'Betongbil', en: 'Concrete mixer', de: 'Betonmischer', at: 'Betonmischer', be: 'Betonmixer', fr: 'Toupie béton', es: 'Hormigonera', it: 'Betoniera', pl: 'Betonomieszarka', nl: 'Betonmixer', fi: 'Betoniauto', da: 'Betonblander' },
  Bus: { sv: 'Buss', en: 'Bus', de: 'Bus', at: 'Bus', be: 'Bus', fr: 'Autobus', es: 'Autobús', it: 'Autobus', pl: 'Autobus', nl: 'Bus', fi: 'Linja-auto', da: 'Bus' },
  Excavator: { sv: 'Grävmaskin', en: 'Excavator', de: 'Bagger', at: 'Bagger', be: 'Graafmachine', fr: 'Pelle mécanique', es: 'Excavadora', it: 'Escavatore', pl: 'Koparka', nl: 'Graafmachine', fi: 'Kaivinkone', da: 'Gravemaskine' },
  'Mini excavator': { sv: 'Minigrävare', en: 'Mini excavator', de: 'Minibagger', at: 'Minibagger', be: 'Minigraafmachine', fr: 'Mini-pelle', es: 'Miniexcavadora', it: 'Miniescavatore', pl: 'Minikoparka', nl: 'Minigraafmachine', fi: 'Minikaivinkone', da: 'Minigraver' },
  'Wheel loader': { sv: 'Hjullastare', en: 'Wheel loader', de: 'Radlader', at: 'Radlader', be: 'Wiellader', fr: 'Chargeuse sur pneus', es: 'Cargadora de ruedas', it: 'Pala gommata', pl: 'Ładowarka kołowa', nl: 'Wiellader', fi: 'Pyöräkuormaaja', da: 'Gummihjulslæsser' },
  Tractor: { sv: 'Traktor', en: 'Tractor', de: 'Traktor', at: 'Traktor', be: 'Tractor', fr: 'Tracteur', es: 'Tractor', it: 'Trattore', pl: 'Ciągnik', nl: 'Tractor', fi: 'Traktori', da: 'Traktor' },
  'Combine harvester': { sv: 'Skördetröska', en: 'Combine harvester', de: 'Mähdrescher', at: 'Mähdrescher', be: 'Maaidorser', fr: 'Moissonneuse-batteuse', es: 'Cosechadora', it: 'Mietitrebbia', pl: 'Kombajn', nl: 'Maaidorser', fi: 'Leikkuupuimuri', da: 'Mejetærsker' },
  Implement: { sv: 'Redskap', en: 'Implement', de: 'Anbaugerät', at: 'Anbaugerät', be: 'Werktuig', fr: 'Outil agricole', es: 'Implemento', it: 'Attrezzatura', pl: 'Osprzęt', nl: 'Werktuig', fi: 'Työlaite', da: 'Redskab' },
  Baler: { sv: 'Press', en: 'Baler', de: 'Ballenpresse', at: 'Ballenpresse', be: 'Balenpers', fr: 'Presse à balles', es: 'Empacadora', it: 'Pressa', pl: 'Prasa', nl: 'Balenpers', fi: 'Paalaaja', da: 'Ballepresser' },
  Sprayer: { sv: 'Spruta', en: 'Sprayer', de: 'Spritze', at: 'Spritze', be: 'Spuitmachine', fr: 'Pulvérisateur', es: 'Pulverizador', it: 'Irroratrice', pl: 'Opryskiwacz', nl: 'Spuitmachine', fi: 'Ruisku', da: 'Sprøjte' },
  Loader: { sv: 'Lastare', en: 'Loader', de: 'Lader', at: 'Lader', be: 'Lader', fr: 'Chargeur', es: 'Cargadora', it: 'Caricatore', pl: 'Ładowarka', nl: 'Lader', fi: 'Kuormaaja', da: 'Læsser' },
  'City bike': { sv: 'City', en: 'City bike', de: 'Citybike', at: 'Citybike', be: 'Stadsfiets', fr: 'Vélo de ville', es: 'Bicicleta urbana', it: 'City bike', pl: 'Rower miejski', nl: 'Stadsfiets', fi: 'Kaupunkipyörä', da: 'Citybike' },
  'Hybrid bike': { sv: 'Hybrid', en: 'Hybrid bike', de: 'Hybridrad', at: 'Hybridrad', be: 'Hybridefiets', fr: 'Vélo hybride', es: 'Bicicleta híbrida', it: 'Bici ibrida', pl: 'Rower hybrydowy', nl: 'Hybridefiets', fi: 'Hybridipyörä', da: 'Hybridcykel' },
  'Cargo bike': { sv: 'Lastcykel', en: 'Cargo bike', de: 'Lastenrad', at: 'Lastenrad', be: 'Bakfiets', fr: 'Vélo cargo', es: 'Bicicleta de carga', it: 'Cargo bike', pl: 'Rower cargo', nl: 'Bakfiets', fi: 'Tavarapyörä', da: 'Ladcykel' },
  'Folding bike': { sv: 'Hopfällbar', en: 'Folding bike', de: 'Faltrad', at: 'Faltrad', be: 'Vouwfiets', fr: 'Vélo pliant', es: 'Bicicleta plegable', it: 'Bici pieghevole', pl: 'Rower składany', nl: 'Vouwfiets', fi: 'Taittopyörä', da: 'Foldecykel' },
  'Kids bike': { sv: 'Barncykel', en: 'Kids bike', de: 'Kinderfahrrad', at: 'Kinderfahrrad', be: 'Kinderfiets', fr: 'Vélo enfant', es: 'Bicicleta infantil', it: 'Bici da bambino', pl: 'Rower dziecięcy', nl: 'Kinderfiets', fi: 'Lastenpyörä', da: 'Børnecykel' },
  Hatchback: { sv: 'Halvkombi', en: 'Hatchback', de: 'Schrägheck', at: 'Schrägheck', be: 'Hatchback', fr: 'Berline compacte', es: 'Hatchback', it: 'Berlina due volumi', pl: 'Hatchback', nl: 'Hatchback', fi: 'Viistoperä', da: 'Hatchback' },
  Sedan: { sv: 'Sedan', en: 'Sedan', de: 'Limousine', at: 'Limousine', be: 'Sedan', fr: 'Berline', es: 'Berlina', it: 'Berlina', pl: 'Sedan', nl: 'Sedan', fi: 'Sedan', da: 'Sedan' },
  SUV: { sv: 'SUV', en: 'SUV', de: 'SUV', at: 'SUV', be: 'SUV', fr: 'SUV', es: 'SUV', it: 'SUV', pl: 'SUV', nl: 'SUV', fi: 'SUV', da: 'SUV' },
  'Estate / Wagon': { sv: 'Kombi', en: 'Estate', de: 'Kombi', at: 'Kombi', be: 'Stationwagen', fr: 'Break', es: 'Familiar', it: 'Station wagon', pl: 'Kombi', nl: 'Stationwagen', fi: 'Farmari', da: 'Stationcar' },
  Convertible: { sv: 'Cabriolet', en: 'Convertible', de: 'Cabriolet', at: 'Cabriolet', be: 'Cabriolet', fr: 'Cabriolet', es: 'Descapotable', it: 'Cabriolet', pl: 'Kabriolet', nl: 'Cabriolet', fi: 'Avoauto', da: 'Cabriolet' },
  'A-class motorhome': { sv: 'Helintegrerad', en: 'A-class motorhome', de: 'Integriertes Wohnmobil', at: 'Integriertes Wohnmobil', be: 'Integraal camper', fr: 'Camping-car intégral', es: 'Autocaravana integral', it: 'Motorhome integrale', pl: 'Kamper zintegrowany', nl: 'Integraal camper', fi: 'Integroitu matkailuauto', da: 'Integreret autocamper' },
  'Coachbuilt motorhome': { sv: 'Halvintegrerad', en: 'Coachbuilt motorhome', de: 'Teilintegriertes Wohnmobil', at: 'Teilintegriertes Wohnmobil', be: 'Halfintegraal camper', fr: 'Camping-car profilé', es: 'Autocaravana perfilada', it: 'Motorhome semintegrale', pl: 'Kamper półintegrowany', nl: 'Halfintegraal camper', fi: 'Puoli-integroitu matkailuauto', da: 'Delintegreret autocamper' },
  'Overcab motorhome': { sv: 'Alkov', en: 'Overcab motorhome', de: 'Alkoven-Wohnmobil', at: 'Alkoven-Wohnmobil', be: 'Alkoofcamper', fr: 'Camping-car capucine', es: 'Autocaravana capuchina', it: 'Motorhome mansardato', pl: 'Kamper alkowa', nl: 'Alkoofcamper', fi: 'Alkovimatkailuauto', da: 'Alkoveautocamper' },
  'Camper van': { sv: 'Camper van', en: 'Camper van', de: 'Camper Van', at: 'Camper Van', be: 'Buscamper', fr: 'Fourgon aménagé', es: 'Cámper', it: 'Camper van', pl: 'Kampervan', nl: 'Buscamper', fi: 'Retkeilyauto', da: 'Campervan' },
  'Panel van motorhome': { sv: 'Plåtis', en: 'Panel van motorhome', de: 'Kastenwagen-Wohnmobil', at: 'Kastenwagen-Wohnmobil', be: 'Bestelbuscamper', fr: 'Fourgon compact', es: 'Furgón camper', it: 'Furgonato', pl: 'Kamper blaszany', nl: 'Bestelbuscamper', fi: 'Peltikuorinen matkailuauto', da: 'Kassevognscamper' },
  'Single axle': { sv: 'Enkelaxel', en: 'Single axle', de: 'Einachser', at: 'Einachser', be: 'Enkelas', fr: 'Simple essieu', es: 'Un eje', it: 'Asse singolo', pl: 'Jedna oś', nl: 'Enkelas', fi: 'Yksiakselinen', da: 'Enkeltaksel' },
  'Twin axle': { sv: 'Boggie', en: 'Twin axle', de: 'Tandemachse', at: 'Tandemachse', be: 'Dubbelas', fr: 'Double essieu', es: 'Doble eje', it: 'Doppio asse', pl: 'Dwuosiowa', nl: 'Dubbelas', fi: 'Teliakselinen', da: 'Boggie' },
  'Family caravan': { sv: 'Familjevagn', en: 'Family caravan', de: 'Familienwohnwagen', at: 'Familienwohnwagen', be: 'Gezinscaravan', fr: 'Caravane familiale', es: 'Caravana familiar', it: 'Roulotte familiare', pl: 'Przyczepa rodzinna', nl: 'Gezinscaravan', fi: 'Perhevaunu', da: 'Familiecampingvogn' },
  'Winter caravan': { sv: 'Vintervagn', en: 'Winter caravan', de: 'Winterwohnwagen', at: 'Winterwohnwagen', be: 'Wintercaravan', fr: 'Caravane hiver', es: 'Caravana de invierno', it: 'Roulotte invernale', pl: 'Przyczepa zimowa', nl: 'Wintercaravan', fi: 'Talvivaunu', da: 'Vintercampingvogn' },
  'Compact caravan': { sv: 'Liten husvagn', en: 'Compact caravan', de: 'Kompaktwohnwagen', at: 'Kompaktwohnwagen', be: 'Compacte caravan', fr: 'Petite caravane', es: 'Caravana compacta', it: 'Roulotte compatta', pl: 'Mała przyczepa', nl: 'Compacte caravan', fi: 'Pieni asuntovaunu', da: 'Kompakt campingvogn' },
  Dumper: { sv: 'Dumper', en: 'Dumper', de: 'Dumper', at: 'Dumper', be: 'Dumper', fr: 'Tombereau', es: 'Dúmper', it: 'Dumper', pl: 'Wozidło', nl: 'Dumper', fi: 'Dumppperi', da: 'Dumper' },
  Bulldozer: { sv: 'Dozer', en: 'Bulldozer', de: 'Planierraupe', at: 'Planierraupe', be: 'Bulldozer', fr: 'Bulldozer', es: 'Bulldozer', it: 'Bulldozer', pl: 'Spycharka', nl: 'Bulldozer', fi: 'Puskutraktori', da: 'Bulldozer' },
  Roller: { sv: 'Vält', en: 'Roller', de: 'Walze', at: 'Walze', be: 'Wals', fr: 'Compacteur', es: 'Rodillo', it: 'Rullo compressore', pl: 'Walec', nl: 'Wals', fi: 'Jyrä', da: 'Tromle' },
  Lift: { sv: 'Lift', en: 'Lift', de: 'Arbeitsbühne', at: 'Arbeitsbühne', be: 'Hoogwerker', fr: 'Nacelle', es: 'Plataforma elevadora', it: 'Piattaforma aerea', pl: 'Podnośnik', nl: 'Hoogwerker', fi: 'Henkilönostin', da: 'Lift' },
  Crane: { sv: 'Kran', en: 'Crane', de: 'Kran', at: 'Kran', be: 'Kraan', fr: 'Grue', es: 'Grúa', it: 'Gru', pl: 'Żuraw', nl: 'Kraan', fi: 'Nosturi', da: 'Kran' },
  Compactor: { sv: 'Kompaktor', en: 'Compactor', de: 'Verdichter', at: 'Verdichter', be: 'Verdichter', fr: 'Compacteur', es: 'Compactador', it: 'Compattatore', pl: 'Zagęszczarka', nl: 'Verdichter', fi: 'Tiivistyskone', da: 'Komprimator' },
  'Mountain bike': { sv: 'Mountainbike', en: 'Mountain bike', de: 'Mountainbike', at: 'Mountainbike', be: 'Mountainbike', fr: 'VTT', es: 'Bicicleta de montaña', it: 'Mountain bike', pl: 'Rower górski', nl: 'Mountainbike', fi: 'Maastopyörä', da: 'Mountainbike' },
  'Speed bike': { sv: 'Speedbike', en: 'Speed bike', de: 'S-Pedelec', at: 'S-Pedelec', be: 'Speedbike', fr: 'Speed bike', es: 'Speed bike', it: 'Speed bike', pl: 'Speed bike', nl: 'Speedbike', fi: 'Nopea sähköpyörä', da: 'Speedbike' },
  'Road bike': { sv: 'Racer', en: 'Road bike', de: 'Rennrad', at: 'Rennrad', be: 'Racefiets', fr: 'Vélo de route', es: 'Bicicleta de carretera', it: 'Bici da corsa', pl: 'Rower szosowy', nl: 'Racefiets', fi: 'Maantiepyörä', da: 'Racercykel' },
  Folding: { sv: 'Hopfällbar', en: 'Folding bike', de: 'Faltrad', at: 'Faltrad', be: 'Vouwfiets', fr: 'Vélo pliant', es: 'Bicicleta plegable', it: 'Bici pieghevole', pl: 'Rower składany', nl: 'Vouwfiets', fi: 'Taittopyörä', da: 'Foldecykel' },
  'Children bike': { sv: 'Barncykel', en: 'Kids bike', de: 'Kinderfahrrad', at: 'Kinderfahrrad', be: 'Kinderfiets', fr: 'Vélo enfant', es: 'Bicicleta infantil', it: 'Bici da bambino', pl: 'Rower dziecięcy', nl: 'Kinderfiets', fi: 'Lastenpyörä', da: 'Børnecykel' },
}

const staticVehicleTranslations: Partial<Record<PublicLocale, Record<string, string>>> = {
  sv: {
    'All-wheel drive': 'Fyrhjulsdrift',
    'Front-wheel drive': 'Framhjulsdrift',
    'Rear-wheel drive': 'Bakhjulsdrift',
    Automatic: 'Automat',
    Manual: 'Manuell',
    Petrol: 'Bensin',
    Diesel: 'Diesel',
    Electric: 'El',
    Hybrid: 'Hybrid',
    'Plug-in hybrid': 'Laddhybrid',
    'Estate / Wagon': 'Kombi',
    Hatchback: 'Halvkombi',
  },
  de: {
    'All-wheel drive': 'Allradantrieb',
    'Front-wheel drive': 'Frontantrieb',
    'Rear-wheel drive': 'Heckantrieb',
    Automatic: 'Automatik',
    Manual: 'Schaltgetriebe',
    Petrol: 'Benzin',
    Diesel: 'Diesel',
    Electric: 'Elektro',
    Hybrid: 'Hybrid',
    'Plug-in hybrid': 'Plug-in-Hybrid',
    'Estate / Wagon': 'Kombi',
    Hatchback: 'Schrägheck',
  },
}
