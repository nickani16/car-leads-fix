import type { PublicLocale } from './public-i18n'

type NationalIdProfileCopy = {
  label: string
  helper: string
  placeholder: string
  saved: string
  invalid: string
  inUse: string
}

const countryPlaceholders: Record<string, string> = {
  AT: 'Ausweis-/Passnr.: PA1234567',
  BE: 'RN: 84.12.25-123.45',
  DE: 'Ausweis-/Passnr.: L01X00T47',
  DK: 'CPR: DDMMYY-XXXX',
  ES: 'DNI 12345678Z / NIE X1234567L',
  FI: 'HETU: 131052-308T',
  FR: 'NIR: 1 84 12 75 056 789 01',
  IT: 'Codice fiscale: RSSMRA80A01H501U',
  NL: 'BSN: 123456782',
  PL: 'PESEL: 44051401359',
  SE: 'ÅÅMMDD-XXXX / YYYYMMDD-XXXX',
}

const localeCopy: Record<PublicLocale, Omit<NationalIdProfileCopy, 'placeholder'>> = {
  sv: { label: 'Personnummer', helper: 'Används bara för kontosäkerhet och kontroll. Uppgiften visas aldrig offentligt.', saved: 'Personnumret är säkert registrerat och visas maskerat.', invalid: 'Kontrollera personnumrets format.', inUse: 'Personnumret är redan kopplat till ett annat konto.' },
  en: { label: 'Personal ID number', helper: 'Used only for account security and verification. It is never shown publicly.', saved: 'The personal ID is securely registered and shown masked.', invalid: 'Check the personal ID format.', inUse: 'This personal ID is already linked to another account.' },
  de: { label: 'Ausweis- oder Reisepassnummer', helper: 'Wird nur für Kontosicherheit und Prüfung verwendet und nie öffentlich angezeigt.', saved: 'Die Identitätsnummer ist sicher hinterlegt und wird maskiert angezeigt.', invalid: 'Prüfen Sie das Format der Identitätsnummer.', inUse: 'Diese Identitätsnummer ist bereits mit einem anderen Konto verknüpft.' },
  at: { label: 'Ausweis- oder Reisepassnummer', helper: 'Wird nur für Kontosicherheit und Prüfung verwendet und nie öffentlich angezeigt.', saved: 'Die Identitätsnummer ist sicher hinterlegt und wird maskiert angezeigt.', invalid: 'Prüfen Sie das Format der Identitätsnummer.', inUse: 'Diese Identitätsnummer ist bereits mit einem anderen Konto verknüpft.' },
  be: { label: 'Rijksregisternummer', helper: 'Alleen gebruikt voor accountbeveiliging en controle. Wordt nooit openbaar getoond.', saved: 'Het rijksregisternummer is veilig opgeslagen en wordt gemaskeerd weergegeven.', invalid: 'Controleer het formaat van het rijksregisternummer.', inUse: 'Dit rijksregisternummer is al aan een ander account gekoppeld.' },
  fr: { label: 'Numéro de sécurité sociale (NIR)', helper: 'Utilisé uniquement pour la sécurité et la vérification du compte. Jamais affiché publiquement.', saved: 'Le numéro est enregistré de manière sécurisée et affiché sous forme masquée.', invalid: 'Vérifiez le format du numéro.', inUse: 'Ce numéro est déjà associé à un autre compte.' },
  es: { label: 'DNI o NIE', helper: 'Solo se usa para seguridad y verificación de la cuenta. Nunca se muestra públicamente.', saved: 'El documento está guardado de forma segura y se muestra enmascarado.', invalid: 'Comprueba el formato del DNI o NIE.', inUse: 'Este documento ya está vinculado a otra cuenta.' },
  it: { label: 'Codice fiscale', helper: 'Usato solo per sicurezza e verifica dell’account. Non viene mai mostrato pubblicamente.', saved: 'Il codice fiscale è salvato in modo sicuro e visualizzato in forma mascherata.', invalid: 'Controlla il formato del codice fiscale.', inUse: 'Questo codice fiscale è già collegato a un altro account.' },
  pl: { label: 'PESEL', helper: 'Używany tylko do zabezpieczenia i weryfikacji konta. Nigdy nie jest wyświetlany publicznie.', saved: 'Numer PESEL jest bezpiecznie zapisany i wyświetlany w formie zamaskowanej.', invalid: 'Sprawdź format numeru PESEL.', inUse: 'Ten numer PESEL jest już powiązany z innym kontem.' },
  nl: { label: 'Burgerservicenummer (BSN)', helper: 'Alleen gebruikt voor accountbeveiliging en controle. Wordt nooit openbaar getoond.', saved: 'Het BSN is veilig opgeslagen en wordt gemaskeerd weergegeven.', invalid: 'Controleer het formaat van het BSN.', inUse: 'Dit BSN is al aan een ander account gekoppeld.' },
  fi: { label: 'Henkilötunnus', helper: 'Käytetään vain tilin turvallisuuteen ja tarkistukseen. Sitä ei näytetä julkisesti.', saved: 'Henkilötunnus on tallennettu turvallisesti ja näytetään peitettynä.', invalid: 'Tarkista henkilötunnuksen muoto.', inUse: 'Tämä henkilötunnus on jo liitetty toiseen tiliin.' },
  da: { label: 'CPR-nummer', helper: 'Bruges kun til kontosikkerhed og kontrol. Vises aldrig offentligt.', saved: 'CPR-nummeret er gemt sikkert og vises maskeret.', invalid: 'Kontrollér CPR-nummerets format.', inUse: 'Dette CPR-nummer er allerede knyttet til en anden konto.' },
}

export function getNationalIdProfileCopy(locale: PublicLocale, countryCode: string): NationalIdProfileCopy {
  return {
    ...localeCopy[locale],
    placeholder: countryPlaceholders[countryCode.toUpperCase()] || localeCopy[locale].label,
  }
}
