import type { PublicLocale } from './public-i18n'

export type BusinessIdentityCopy = {
  companyName: string
  companyNamePlaceholder: string
  registrationNumber: string
  registrationNumberPlaceholder: string
  registrationNumberHelper: string
}

const copy: Record<PublicLocale, BusinessIdentityCopy> = {
  sv: { companyName: 'Företagsnamn', companyNamePlaceholder: 'Ange registrerat företagsnamn', registrationNumber: 'Organisationsnummer', registrationNumberPlaceholder: 'Ange organisationsnummer', registrationNumberHelper: 'Ange företagets identifierare från det officiella företagsregistret.' },
  en: { companyName: 'Company name', companyNamePlaceholder: 'Enter the registered company name', registrationNumber: 'Company registration number', registrationNumberPlaceholder: 'Enter the company registration number', registrationNumberHelper: 'Use the identifier shown in the official business register.' },
  de: { companyName: 'Firmenname', companyNamePlaceholder: 'Eingetragenen Firmennamen eingeben', registrationNumber: 'Registernummer', registrationNumberPlaceholder: 'z. B. HRB 12345', registrationNumberHelper: 'Geben Sie die Nummer aus dem zuständigen Unternehmensregister ein.' },
  at: { companyName: 'Firmenname', companyNamePlaceholder: 'Eingetragenen Firmennamen eingeben', registrationNumber: 'Firmenbuchnummer', registrationNumberPlaceholder: 'z. B. FN 123456a', registrationNumberHelper: 'Geben Sie die Firmenbuchnummer aus dem österreichischen Firmenbuch ein.' },
  be: { companyName: 'Bedrijfsnaam', companyNamePlaceholder: 'Vul de geregistreerde bedrijfsnaam in', registrationNumber: 'Ondernemingsnummer', registrationNumberPlaceholder: 'Vul het ondernemingsnummer in', registrationNumberHelper: 'Gebruik het ondernemingsnummer uit de Kruispuntbank van Ondernemingen.' },
  fr: { companyName: 'Raison sociale', companyNamePlaceholder: 'Saisissez la raison sociale', registrationNumber: 'Numéro SIREN', registrationNumberPlaceholder: 'Saisissez le numéro SIREN', registrationNumberHelper: 'Saisissez l’identifiant à 9 chiffres figurant au répertoire SIRENE.' },
  es: { companyName: 'Denominación social', companyNamePlaceholder: 'Introduce la denominación social', registrationNumber: 'NIF de la empresa', registrationNumberPlaceholder: 'Introduce el NIF de la empresa', registrationNumberHelper: 'Introduce el NIF que identifica a la empresa en el registro oficial.' },
  it: { companyName: 'Denominazione dell’impresa', companyNamePlaceholder: 'Inserisci la denominazione registrata', registrationNumber: 'Codice fiscale dell’impresa', registrationNumberPlaceholder: 'Inserisci il codice fiscale', registrationNumberHelper: 'Inserisci il codice fiscale che identifica l’impresa nel Registro Imprese.' },
  pl: { companyName: 'Nazwa firmy', companyNamePlaceholder: 'Wpisz zarejestrowaną nazwę firmy', registrationNumber: 'Identyfikator firmy', registrationNumberPlaceholder: 'Wpisz NIP, REGON lub numer KRS', registrationNumberHelper: 'Podaj oficjalny identyfikator firmy: NIP, REGON albo numer KRS.' },
  nl: { companyName: 'Bedrijfsnaam', companyNamePlaceholder: 'Vul de geregistreerde bedrijfsnaam in', registrationNumber: 'KVK-nummer', registrationNumberPlaceholder: 'Vul het KVK-nummer in', registrationNumberHelper: 'Vul het 8-cijferige nummer uit het Handelsregister in.' },
  fi: { companyName: 'Yrityksen nimi', companyNamePlaceholder: 'Anna rekisteröity yrityksen nimi', registrationNumber: 'Y-tunnus', registrationNumberPlaceholder: 'Anna Y-tunnus', registrationNumberHelper: 'Anna YTJ:n mukainen Y-tunnus, esimerkiksi 1234567-8.' },
  da: { companyName: 'Virksomhedsnavn', companyNamePlaceholder: 'Indtast det registrerede virksomhedsnavn', registrationNumber: 'CVR-nummer', registrationNumberPlaceholder: 'Indtast CVR-nummeret', registrationNumberHelper: 'Indtast virksomhedens 8-cifrede CVR-nummer.' },
}

export function getBusinessIdentityCopy(locale: PublicLocale) {
  return copy[locale]
}
