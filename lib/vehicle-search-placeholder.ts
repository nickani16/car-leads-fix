import { translationLocale, type PublicLocale } from './public-i18n'

const vehicleSearchPlaceholders: Record<PublicLocale, string> = {
  sv: 'Sök efter märke, modell eller ort',
  en: 'Search by make, model or location',
  de: 'Nach Marke, Modell oder Ort suchen',
  at: 'Nach Marke, Modell oder Ort suchen',
  fr: 'Rechercher une marque, un modèle ou une ville',
  es: 'Buscar por marca, modelo o ubicación',
  it: 'Cerca per marca, modello o località',
  nl: 'Zoek op merk, model of plaats',
  be: 'Zoek op merk, model of plaats',
  pl: 'Marka, model lub lokalizacja',
  da: 'Søg efter mærke, model eller by',
  fi: 'Merkki, malli tai paikkakunta',
}

export function getVehicleSearchPlaceholder(locale: PublicLocale) {
  return vehicleSearchPlaceholders[locale] || vehicleSearchPlaceholders[translationLocale(locale)]
}
