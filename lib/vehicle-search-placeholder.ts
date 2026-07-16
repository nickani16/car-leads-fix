import { translationLocale, type PublicLocale } from './public-i18n'

const vehicleSearchPlaceholders: Record<PublicLocale, string> = {
  sv: 'Sök efter märke, modell eller ort',
  en: 'Search by make, model or location',
  de: 'Nach Marke, Modell oder Ort suchen',
  at: 'Nach Marke, Modell oder Ort suchen',
  fr: 'Rechercher par marque, modèle ou ville',
  es: 'Buscar por marca, modelo o ubicación',
  it: 'Cerca per marca, modello o località',
  nl: 'Zoek op merk, model of plaats',
  be: 'Zoek op merk, model of plaats',
  pl: 'Szukaj według marki, modelu lub lokalizacji',
  da: 'Søg efter mærke, model eller by',
  fi: 'Hae merkin, mallin tai paikkakunnan mukaan',
}

export function getVehicleSearchPlaceholder(locale: PublicLocale) {
  return vehicleSearchPlaceholders[locale] || vehicleSearchPlaceholders[translationLocale(locale)]
}
