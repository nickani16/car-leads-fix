const translations: Record<string, string> = {
  // Swedish body types
  Kombi: 'Estate / Wagon',
  Halvkombi: 'Hatchback',
  'Minibuss / MPV': 'MPV',
  Transportbil: 'Van',
  Annat: 'Other',

  // German body types
  Limousine: 'Sedan',
  Schrägheck: 'Hatchback',
  'Van / MPV': 'MPV',
  Transporter: 'Van',
  Sonstige: 'Other',

  // Swedish technical values
  Bensin: 'Petrol',
  El: 'Electric',
  Laddhybrid: 'Plug-in hybrid',
  Etanol: 'Ethanol',
  Automat: 'Automatic',
  Manuell: 'Manual',
  Framhjulsdrift: 'Front-wheel drive',
  Bakhjulsdrift: 'Rear-wheel drive',
  Fyrhjulsdrift: 'All-wheel drive',

  // German technical values
  Benzin: 'Petrol',
  Elektro: 'Electric',
  'Plug-in-Hybrid': 'Plug-in hybrid',
  Automatik: 'Automatic',
  Schaltgetriebe: 'Manual',
  Frontantrieb: 'Front-wheel drive',
  Heckantrieb: 'Rear-wheel drive',
  Allradantrieb: 'All-wheel drive',

  // Swedish condition values
  'Full servicehistorik': 'Full service history',
  'Delvis servicehistorik': 'Partial service history',
  'Ingen servicehistorik': 'No service history',
  'Inga kända skador': 'No known damage',
  'Mindre kosmetiska skador': 'Minor cosmetic damage',
  'Större skador': 'Significant damage',
  Krockskada: 'Accident damage',
  'Inga varningslampor': 'No warning lights',
  'Varningslampor finns': 'Warning lights present',
  Nya: 'New',
  'Bra skick': 'Good condition',
  Slitna: 'Worn',
  'Endast sommardäck': 'Summer tires only',
  'Endast vinterdäck': 'Winter tires only',
  'Sommar- och vinterdäck': 'Summer and winter tires',
  'Året runt-däck': 'All-season tires',
  Ja: 'Yes',
  Nej: 'No',
  'Så snart som möjligt': 'As soon as possible',
  'Inom 1–2 veckor': 'Within 1–2 weeks',
  'Inom en månad': 'Within one month',
  'Inom 2–3 månader': 'Within 2–3 months',
  Osäker: 'Not sure',

  // German condition values
  'Lückenlose Servicehistorie': 'Full service history',
  'Teilweise Servicehistorie': 'Partial service history',
  'Keine Servicehistorie': 'No service history',
  'Keine bekannten Schäden': 'No known damage',
  'Kleine kosmetische Schäden': 'Minor cosmetic damage',
  'Größere Schäden': 'Significant damage',
  Unfallschaden: 'Accident damage',
  'Keine Warnleuchten': 'No warning lights',
  'Warnleuchten aktiv': 'Warning lights present',
  Neu: 'New',
  'Guter Zustand': 'Good condition',
  Abgenutzt: 'Worn',
  'Nur Sommerreifen': 'Summer tires only',
  'Nur Winterreifen': 'Winter tires only',
  'Sommer- und Winterreifen': 'Summer and winter tires',
  Ganzjahresreifen: 'All-season tires',
  Nein: 'No',
  'So schnell wie möglich': 'As soon as possible',
  'Innerhalb 1–2 Wochen': 'Within 1–2 weeks',
  'Innerhalb eines Monats': 'Within one month',
  'Innerhalb 2–3 Monaten': 'Within 2–3 months',
  Unsicher: 'Not sure',
}

export function vehicleValueInEnglish(value?: string | null) {
  if (!value) return undefined
  return translations[value.trim()] || value.trim()
}

export function canonicalVehicleValue(value?: string | null) {
  return vehicleValueInEnglish(value) || null
}
