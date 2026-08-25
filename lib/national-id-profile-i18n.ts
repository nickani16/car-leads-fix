import type { PublicLocale } from './public-i18n'

export type NationalIdProfileCopy = {
  identityNumber: string
  identityNumberPlaceholder: string
  identityNumberHelper: string
  identityNumberSaved: string
}

const copy: Record<PublicLocale, NationalIdProfileCopy> = {
  sv: { identityNumber: 'Personnummer', identityNumberPlaceholder: 'Ange personnummer', identityNumberHelper: 'Ange ditt svenska personnummer. Numret sparas säkert och visas inte i sin helhet igen.', identityNumberSaved: 'Sparat personnummer' },
  en: { identityNumber: 'Identity number', identityNumberPlaceholder: 'Enter your identity number', identityNumberHelper: 'Enter the official identity number for your country. It is stored securely and will not be shown in full again.', identityNumberSaved: 'Saved identity number' },
  de: { identityNumber: 'Ausweis- oder Reisepassnummer', identityNumberPlaceholder: 'Ausweis- oder Reisepassnummer eingeben', identityNumberHelper: 'Geben Sie die Nummer Ihres amtlichen Ausweises ein. Sie wird sicher gespeichert und später nicht vollständig angezeigt.', identityNumberSaved: 'Gespeicherte Ausweisnummer' },
  at: { identityNumber: 'Ausweis- oder Reisepassnummer', identityNumberPlaceholder: 'Ausweis- oder Reisepassnummer eingeben', identityNumberHelper: 'Geben Sie die Nummer Ihres amtlichen Ausweises ein. Sie wird sicher gespeichert und später nicht vollständig angezeigt.', identityNumberSaved: 'Gespeicherte Ausweisnummer' },
  be: { identityNumber: 'Rijksregisternummer', identityNumberPlaceholder: 'Vul uw rijksregisternummer in', identityNumberHelper: 'Vul uw Belgische rijksregisternummer in. Het wordt veilig opgeslagen en later niet volledig weergegeven.', identityNumberSaved: 'Opgeslagen rijksregisternummer' },
  fr: { identityNumber: 'Numéro de sécurité sociale (NIR)', identityNumberPlaceholder: 'Saisissez votre numéro NIR', identityNumberHelper: 'Saisissez votre numéro d’identification officiel. Il est enregistré de manière sécurisée et ne sera plus affiché en entier.', identityNumberSaved: 'Numéro d’identité enregistré' },
  es: { identityNumber: 'DNI o NIE', identityNumberPlaceholder: 'Introduce tu DNI o NIE', identityNumberHelper: 'Introduce tu número de identidad oficial. Se guarda de forma segura y no volverá a mostrarse completo.', identityNumberSaved: 'Documento de identidad guardado' },
  it: { identityNumber: 'Codice fiscale', identityNumberPlaceholder: 'Inserisci il codice fiscale', identityNumberHelper: 'Inserisci il tuo codice fiscale. Viene salvato in modo sicuro e non sarà più mostrato per intero.', identityNumberSaved: 'Codice fiscale salvato' },
  pl: { identityNumber: 'Numer PESEL', identityNumberPlaceholder: 'Wpisz numer PESEL', identityNumberHelper: 'Wpisz swój numer PESEL. Jest przechowywany bezpiecznie i nie będzie ponownie wyświetlany w całości.', identityNumberSaved: 'Zapisany numer PESEL' },
  nl: { identityNumber: 'Burgerservicenummer (BSN)', identityNumberPlaceholder: 'Vul uw BSN in', identityNumberHelper: 'Vul uw burgerservicenummer in. Het wordt veilig opgeslagen en later niet volledig weergegeven.', identityNumberSaved: 'Opgeslagen BSN' },
  fi: { identityNumber: 'Henkilötunnus', identityNumberPlaceholder: 'Anna henkilötunnus', identityNumberHelper: 'Anna suomalainen henkilötunnuksesi. Se tallennetaan turvallisesti eikä sitä näytetä myöhemmin kokonaan.', identityNumberSaved: 'Tallennettu henkilötunnus' },
  da: { identityNumber: 'CPR-nummer', identityNumberPlaceholder: 'Indtast CPR-nummer', identityNumberHelper: 'Indtast dit danske CPR-nummer. Det gemmes sikkert og vises ikke fuldt ud igen.', identityNumberSaved: 'Gemt CPR-nummer' },
}

export function getNationalIdProfileCopy(locale: PublicLocale) {
  return copy[locale]
}
