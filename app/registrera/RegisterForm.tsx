'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, ReactNode, useMemo, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  MailCheck,
  MapPin,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { euCountries, getEuCountryName } from '@/lib/eu-countries'
import {
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { FlagIcon } from '../components/PublicFooter'
import BirthDatePicker from '../components/BirthDatePicker'
import { localizedAccountError } from '@/lib/account-error-i18n'

const euDialCodes: Record<string, string> = {
  AT: '+43',
  BE: '+32',
  BG: '+359',
  HR: '+385',
  CY: '+357',
  CZ: '+420',
  DE: '+49',
  DK: '+45',
  EE: '+372',
  ES: '+34',
  FI: '+358',
  FR: '+33',
  GR: '+30',
  HU: '+36',
  IE: '+353',
  IT: '+39',
  LT: '+370',
  LU: '+352',
  LV: '+371',
  MT: '+356',
  NL: '+31',
  PL: '+48',
  PT: '+351',
  RO: '+40',
  SE: '+46',
  SI: '+386',
  SK: '+421',
}

const dialCodeEntries = Object.entries(euDialCodes).sort(
  (a, b) => b[1].length - a[1].length,
)

type RegistrationErrorCode =
  | 'register_auth_required'
  | 'register_email_unverified'
  | 'register_invalid_business'
  | 'register_invalid_private'
  | 'register_invalid_email'
  | 'register_invalid_name'
  | 'register_invalid_birth_date'
  | 'register_invalid_country'
  | 'register_invalid_phone'
  | 'register_invalid_address'
  | 'register_invalid_national_id'
  | 'register_invalid_company'
  | 'register_terms_required'
  | 'register_profile_exists'
  | 'register_identity_in_use'
  | 'register_company_in_use'
  | 'register_recovery_required'
  | 'register_failed'

type RegistrationFieldErrorCode = Extract<
  RegistrationErrorCode,
  | 'register_invalid_email'
  | 'register_invalid_name'
  | 'register_invalid_birth_date'
  | 'register_invalid_country'
  | 'register_invalid_phone'
  | 'register_invalid_address'
  | 'register_invalid_national_id'
  | 'register_invalid_company'
  | 'register_terms_required'
>

const registrationErrorCopy: Record<
  PublicLocale,
  Record<Exclude<RegistrationErrorCode, RegistrationFieldErrorCode>, string>
> = {
  sv: {
    register_auth_required: 'Logga in med e-postkoden innan du skapar kontot.',
    register_email_unverified: 'Bekräfta din e-postadress med koden innan du skapar kontot.',
    register_invalid_business: 'Kontrollera kontaktperson, företagsuppgifter, adress, telefonnummer och villkor.',
    register_invalid_private: 'Kontrollera namn, födelsedatum, adress, telefonnummer och identitetsuppgifter.',
    register_profile_exists: 'Det finns redan en kontoprofil för den här användaren.',
    register_identity_in_use: 'Identitetsuppgifterna används redan av ett annat konto. Logga in på det befintliga kontot eller kontakta supporten för säker återställning.',
    register_company_in_use: 'Företaget är redan kopplat till ett annat konto. Logga in på det befintliga företagskontot eller kontakta supporten.',
    register_recovery_required: 'Kontot kan inte återaktiveras automatiskt. Logga in på det tidigare kontot eller kontakta supporten för säker återställning.',
    register_failed: 'Kontot kunde inte skapas. Försök igen eller kontakta support.',
  },
  en: {
    register_auth_required: 'Sign in with the email code before creating your account.',
    register_email_unverified: 'Verify your email address with the code before creating your account.',
    register_invalid_business: 'Check the contact person, company details, address, phone number and terms.',
    register_invalid_private: 'Check your name, date of birth, address, phone number and identity details.',
    register_profile_exists: 'An account profile already exists for this user.',
    register_identity_in_use: 'These identity details are already used by another account. Sign in to the existing account or contact support for secure recovery.',
    register_company_in_use: 'This company is already linked to another account. Sign in to the existing business account or contact support.',
    register_recovery_required: 'This account cannot be reactivated automatically. Sign in to the previous account or contact support for secure recovery.',
    register_failed: 'The account could not be created. Try again or contact support.',
  },
  de: {
    register_auth_required: 'Melden Sie sich mit dem E-Mail-Code an, bevor Sie Ihr Konto erstellen.',
    register_email_unverified: 'Bestätigen Sie Ihre E-Mail-Adresse mit dem Code, bevor Sie Ihr Konto erstellen.',
    register_invalid_business: 'Prüfen Sie Kontaktperson, Unternehmensdaten, Adresse, Telefonnummer und Bedingungen.',
    register_invalid_private: 'Prüfen Sie Name, Geburtsdatum, Adresse, Telefonnummer und Identitätsangaben.',
    register_profile_exists: 'Für diesen Benutzer besteht bereits ein Kontoprofil.',
    register_identity_in_use: 'Diese Identitätsdaten werden bereits von einem anderen Konto verwendet. Melden Sie sich beim bestehenden Konto an oder wenden Sie sich zur sicheren Wiederherstellung an den Support.',
    register_company_in_use: 'Dieses Unternehmen ist bereits mit einem anderen Konto verknüpft. Melden Sie sich beim bestehenden Unternehmenskonto an oder kontaktieren Sie den Support.',
    register_recovery_required: 'Dieses Konto kann nicht automatisch reaktiviert werden. Melden Sie sich beim früheren Konto an oder wenden Sie sich zur sicheren Wiederherstellung an den Support.',
    register_failed: 'Das Konto konnte nicht erstellt werden. Versuchen Sie es erneut oder kontaktieren Sie den Support.',
  },
  at: {
    register_auth_required: 'Melden Sie sich mit dem E-Mail-Code an, bevor Sie Ihr Konto erstellen.',
    register_email_unverified: 'Bestätigen Sie Ihre E-Mail-Adresse mit dem Code, bevor Sie Ihr Konto erstellen.',
    register_invalid_business: 'Prüfen Sie Kontaktperson, Unternehmensdaten, Adresse, Telefonnummer und Bedingungen.',
    register_invalid_private: 'Prüfen Sie Name, Geburtsdatum, Adresse, Telefonnummer und Identitätsangaben.',
    register_profile_exists: 'Für diesen Benutzer besteht bereits ein Kontoprofil.',
    register_identity_in_use: 'Diese Identitätsdaten werden bereits von einem anderen Konto verwendet. Melden Sie sich beim bestehenden Konto an oder wenden Sie sich zur sicheren Wiederherstellung an den Support.',
    register_company_in_use: 'Dieses Unternehmen ist bereits mit einem anderen Konto verknüpft. Melden Sie sich beim bestehenden Unternehmenskonto an oder kontaktieren Sie den Support.',
    register_recovery_required: 'Dieses Konto kann nicht automatisch reaktiviert werden. Melden Sie sich beim früheren Konto an oder wenden Sie sich zur sicheren Wiederherstellung an den Support.',
    register_failed: 'Das Konto konnte nicht erstellt werden. Versuchen Sie es erneut oder kontaktieren Sie den Support.',
  },
  be: {
    register_auth_required: 'Meld je aan met de e-mailcode voordat je je account aanmaakt.',
    register_email_unverified: 'Bevestig je e-mailadres met de code voordat je je account aanmaakt.',
    register_invalid_business: 'Controleer de contactpersoon, bedrijfsgegevens, het adres, telefoonnummer en de voorwaarden.',
    register_invalid_private: 'Controleer je naam, geboortedatum, adres, telefoonnummer en identiteitsgegevens.',
    register_profile_exists: 'Er bestaat al een accountprofiel voor deze gebruiker.',
    register_identity_in_use: 'Deze identiteitsgegevens worden al door een ander account gebruikt. Meld je aan bij het bestaande account of neem contact op met support voor veilig herstel.',
    register_company_in_use: 'Dit bedrijf is al aan een ander account gekoppeld. Meld je aan bij het bestaande bedrijfsaccount of neem contact op met support.',
    register_recovery_required: 'Dit account kan niet automatisch opnieuw worden geactiveerd. Meld je aan bij het eerdere account of neem contact op met support voor veilig herstel.',
    register_failed: 'Het account kon niet worden aangemaakt. Probeer opnieuw of neem contact op met support.',
  },
  fr: {
    register_auth_required: 'Connectez-vous avec le code reçu par e-mail avant de créer votre compte.',
    register_email_unverified: 'Confirmez votre adresse e-mail avec le code avant de créer votre compte.',
    register_invalid_business: 'Vérifiez le contact, les informations de l’entreprise, l’adresse, le téléphone et les conditions.',
    register_invalid_private: 'Vérifiez votre nom, date de naissance, adresse, téléphone et justificatifs d’identité.',
    register_profile_exists: 'Un profil de compte existe déjà pour cet utilisateur.',
    register_identity_in_use: 'Ces données d’identité sont déjà utilisées par un autre compte. Connectez-vous au compte existant ou contactez l’assistance pour une récupération sécurisée.',
    register_company_in_use: 'Cette entreprise est déjà liée à un autre compte. Connectez-vous au compte professionnel existant ou contactez l’assistance.',
    register_recovery_required: 'Ce compte ne peut pas être réactivé automatiquement. Connectez-vous à l’ancien compte ou contactez l’assistance pour une récupération sécurisée.',
    register_failed: 'Le compte n’a pas pu être créé. Réessayez ou contactez le support.',
  },
  es: {
    register_auth_required: 'Inicia sesión con el código del correo antes de crear tu cuenta.',
    register_email_unverified: 'Confirma tu correo con el código antes de crear tu cuenta.',
    register_invalid_business: 'Revisa la persona de contacto, los datos de empresa, la dirección, el teléfono y las condiciones.',
    register_invalid_private: 'Revisa tu nombre, fecha de nacimiento, dirección, teléfono y datos de identidad.',
    register_profile_exists: 'Ya existe un perfil de cuenta para este usuario.',
    register_identity_in_use: 'Estos datos de identidad ya se utilizan en otra cuenta. Inicia sesión en la cuenta existente o contacta con soporte para recuperarla de forma segura.',
    register_company_in_use: 'Esta empresa ya está vinculada a otra cuenta. Inicia sesión en la cuenta de empresa existente o contacta con soporte.',
    register_recovery_required: 'Esta cuenta no se puede reactivar automáticamente. Inicia sesión en la cuenta anterior o contacta con soporte para recuperarla de forma segura.',
    register_failed: 'No se pudo crear la cuenta. Inténtalo de nuevo o contacta con soporte.',
  },
  it: {
    register_auth_required: 'Accedi con il codice ricevuto via e-mail prima di creare l’account.',
    register_email_unverified: 'Conferma l’indirizzo e-mail con il codice prima di creare l’account.',
    register_invalid_business: 'Controlla referente, dati aziendali, indirizzo, telefono e condizioni.',
    register_invalid_private: 'Controlla nome, data di nascita, indirizzo, telefono e dati identificativi.',
    register_profile_exists: 'Esiste già un profilo account per questo utente.',
    register_identity_in_use: 'Questi dati identificativi sono già usati da un altro account. Accedi all’account esistente o contatta l’assistenza per il recupero sicuro.',
    register_company_in_use: 'Questa azienda è già collegata a un altro account. Accedi all’account aziendale esistente o contatta l’assistenza.',
    register_recovery_required: 'Questo account non può essere riattivato automaticamente. Accedi all’account precedente o contatta l’assistenza per un recupero sicuro.',
    register_failed: 'Impossibile creare l’account. Riprova o contatta l’assistenza.',
  },
  pl: {
    register_auth_required: 'Zaloguj się kodem z wiadomości e-mail przed utworzeniem konta.',
    register_email_unverified: 'Potwierdź adres e-mail kodem przed utworzeniem konta.',
    register_invalid_business: 'Sprawdź osobę kontaktową, dane firmy, adres, telefon i akceptację warunków.',
    register_invalid_private: 'Sprawdź imię i nazwisko, datę urodzenia, adres, telefon i dane tożsamości.',
    register_profile_exists: 'Profil konta dla tego użytkownika już istnieje.',
    register_identity_in_use: 'Te dane tożsamości są już używane przez inne konto. Zaloguj się na istniejące konto lub skontaktuj się z pomocą, aby bezpiecznie je odzyskać.',
    register_company_in_use: 'Ta firma jest już połączona z innym kontem. Zaloguj się na istniejące konto firmowe lub skontaktuj się z pomocą.',
    register_recovery_required: 'Tego konta nie można automatycznie ponownie aktywować. Zaloguj się na poprzednie konto lub skontaktuj się z pomocą w celu bezpiecznego odzyskania.',
    register_failed: 'Nie udało się utworzyć konta. Spróbuj ponownie lub skontaktuj się z pomocą.',
  },
  nl: {
    register_auth_required: 'Meld je aan met de e-mailcode voordat je je account aanmaakt.',
    register_email_unverified: 'Bevestig je e-mailadres met de code voordat je je account aanmaakt.',
    register_invalid_business: 'Controleer de contactpersoon, bedrijfsgegevens, het adres, telefoonnummer en de voorwaarden.',
    register_invalid_private: 'Controleer je naam, geboortedatum, adres, telefoonnummer en identiteitsgegevens.',
    register_profile_exists: 'Er bestaat al een accountprofiel voor deze gebruiker.',
    register_identity_in_use: 'Deze identiteitsgegevens worden al door een ander account gebruikt. Meld je aan bij het bestaande account of neem contact op met support voor veilig herstel.',
    register_company_in_use: 'Dit bedrijf is al aan een ander account gekoppeld. Meld je aan bij het bestaande bedrijfsaccount of neem contact op met support.',
    register_recovery_required: 'Dit account kan niet automatisch opnieuw worden geactiveerd. Meld je aan bij het eerdere account of neem contact op met support voor veilig herstel.',
    register_failed: 'Het account kon niet worden aangemaakt. Probeer opnieuw of neem contact op met support.',
  },
  fi: {
    register_auth_required: 'Kirjaudu sähköpostikoodilla ennen tilin luomista.',
    register_email_unverified: 'Vahvista sähköpostiosoitteesi koodilla ennen tilin luomista.',
    register_invalid_business: 'Tarkista yhteyshenkilö, yritystiedot, osoite, puhelinnumero ja ehdot.',
    register_invalid_private: 'Tarkista nimi, syntymäaika, osoite, puhelinnumero ja henkilötiedot.',
    register_profile_exists: 'Tälle käyttäjälle on jo olemassa tiliprofiili.',
    register_identity_in_use: 'Nämä henkilötiedot ovat jo toisen tilin käytössä. Kirjaudu olemassa olevalle tilille tai ota yhteyttä tukeen turvallista palautusta varten.',
    register_company_in_use: 'Tämä yritys on jo liitetty toiseen tiliin. Kirjaudu olemassa olevalle yritystilille tai ota yhteyttä tukeen.',
    register_recovery_required: 'Tätä tiliä ei voida aktivoida automaattisesti uudelleen. Kirjaudu aiemmalle tilille tai ota yhteyttä tukeen turvallista palautusta varten.',
    register_failed: 'Tiliä ei voitu luoda. Yritä uudelleen tai ota yhteyttä tukeen.',
  },
  da: {
    register_auth_required: 'Log ind med e-mailkoden, før du opretter din konto.',
    register_email_unverified: 'Bekræft din e-mailadresse med koden, før du opretter din konto.',
    register_invalid_business: 'Kontrollér kontaktperson, virksomhedsoplysninger, adresse, telefonnummer og vilkår.',
    register_invalid_private: 'Kontrollér navn, fødselsdato, adresse, telefonnummer og identitetsoplysninger.',
    register_profile_exists: 'Der findes allerede en kontoprofil for denne bruger.',
    register_identity_in_use: 'Disse identitetsoplysninger bruges allerede af en anden konto. Log ind på den eksisterende konto, eller kontakt support for sikker gendannelse.',
    register_company_in_use: 'Denne virksomhed er allerede knyttet til en anden konto. Log ind på den eksisterende virksomhedskonto, eller kontakt support.',
    register_recovery_required: 'Denne konto kan ikke genaktiveres automatisk. Log ind på den tidligere konto, eller kontakt support for sikker gendannelse.',
    register_failed: 'Kontoen kunne ikke oprettes. Prøv igen, eller kontakt support.',
  },
}

const registrationFieldErrorCopy: Record<
  PublicLocale,
  Record<RegistrationFieldErrorCode, string>
> = {
  sv: {
    register_invalid_email: 'Kontrollera e-postadressen.',
    register_invalid_name: 'Ange både förnamn och efternamn.',
    register_invalid_birth_date: 'Kontrollera födelsedatumet. Du måste vara minst 18 år.',
    register_invalid_country: 'Välj ett giltigt land.',
    register_invalid_phone: 'Kontrollera telefonnumret och att landskoden stämmer.',
    register_invalid_address: 'Fyll i gatuadress, postnummer och ort.',
    register_invalid_national_id: 'Kontrollera personnumret. Använd ÅÅMMDD-XXXX eller YYYYMMDD-XXXX.',
    register_invalid_company: 'Fyll i företagsnamn och organisations- eller VAT-nummer.',
    register_terms_required: 'Godkänn villkoren för att skapa kontot.',
  },
  en: {
    register_invalid_email: 'Check the email address.',
    register_invalid_name: 'Enter both your first name and last name.',
    register_invalid_birth_date: 'Check the date of birth. You must be at least 18 years old.',
    register_invalid_country: 'Choose a valid country.',
    register_invalid_phone: 'Check the phone number and country code.',
    register_invalid_address: 'Enter your street address, postal code and city.',
    register_invalid_national_id: 'Check the national identity number and use your country’s official format.',
    register_invalid_company: 'Enter the company name and registration or VAT number.',
    register_terms_required: 'Accept the terms to create the account.',
  },
  de: {
    register_invalid_email: 'Überprüfen Sie die E-Mail-Adresse.',
    register_invalid_name: 'Geben Sie Vor- und Nachnamen ein.',
    register_invalid_birth_date: 'Überprüfen Sie das Geburtsdatum. Sie müssen mindestens 18 Jahre alt sein.',
    register_invalid_country: 'Wählen Sie ein gültiges Land.',
    register_invalid_phone: 'Überprüfen Sie Telefonnummer und Ländervorwahl.',
    register_invalid_address: 'Geben Sie Straße, Postleitzahl und Ort ein.',
    register_invalid_national_id: 'Überprüfen Sie die Identifikationsnummer im amtlichen Format Ihres Landes.',
    register_invalid_company: 'Geben Sie Firmenname und Handelsregister- oder Umsatzsteuer-ID ein.',
    register_terms_required: 'Akzeptieren Sie die Bedingungen, um das Konto zu erstellen.',
  },
  at: {
    register_invalid_email: 'Überprüfen Sie die E-Mail-Adresse.',
    register_invalid_name: 'Geben Sie Vor- und Nachnamen ein.',
    register_invalid_birth_date: 'Überprüfen Sie das Geburtsdatum. Sie müssen mindestens 18 Jahre alt sein.',
    register_invalid_country: 'Wählen Sie ein gültiges Land.',
    register_invalid_phone: 'Überprüfen Sie Telefonnummer und Ländervorwahl.',
    register_invalid_address: 'Geben Sie Straße, Postleitzahl und Ort ein.',
    register_invalid_national_id: 'Überprüfen Sie die Identifikationsnummer im amtlichen Format Ihres Landes.',
    register_invalid_company: 'Geben Sie Firmenname und Firmenbuch- oder Umsatzsteuer-ID ein.',
    register_terms_required: 'Akzeptieren Sie die Bedingungen, um das Konto zu erstellen.',
  },
  be: {
    register_invalid_email: 'Controleer het e-mailadres.',
    register_invalid_name: 'Vul zowel je voornaam als achternaam in.',
    register_invalid_birth_date: 'Controleer je geboortedatum. Je moet minstens 18 jaar zijn.',
    register_invalid_country: 'Kies een geldig land.',
    register_invalid_phone: 'Controleer het telefoonnummer en de landcode.',
    register_invalid_address: 'Vul straat, postcode en plaats in.',
    register_invalid_national_id: 'Controleer het nationale identificatienummer volgens het officiële formaat van je land.',
    register_invalid_company: 'Vul bedrijfsnaam en ondernemings- of btw-nummer in.',
    register_terms_required: 'Accepteer de voorwaarden om het account aan te maken.',
  },
  fr: {
    register_invalid_email: 'Vérifiez l’adresse e-mail.',
    register_invalid_name: 'Saisissez votre prénom et votre nom.',
    register_invalid_birth_date: 'Vérifiez la date de naissance. Vous devez avoir au moins 18 ans.',
    register_invalid_country: 'Choisissez un pays valide.',
    register_invalid_phone: 'Vérifiez le numéro de téléphone et l’indicatif du pays.',
    register_invalid_address: 'Saisissez l’adresse, le code postal et la ville.',
    register_invalid_national_id: 'Vérifiez le numéro d’identité selon le format officiel de votre pays.',
    register_invalid_company: 'Saisissez le nom de l’entreprise et son numéro d’immatriculation ou de TVA.',
    register_terms_required: 'Acceptez les conditions pour créer le compte.',
  },
  es: {
    register_invalid_email: 'Comprueba la dirección de correo electrónico.',
    register_invalid_name: 'Introduce el nombre y los apellidos.',
    register_invalid_birth_date: 'Comprueba la fecha de nacimiento. Debes tener al menos 18 años.',
    register_invalid_country: 'Elige un país válido.',
    register_invalid_phone: 'Comprueba el número de teléfono y el prefijo del país.',
    register_invalid_address: 'Introduce la dirección, el código postal y la localidad.',
    register_invalid_national_id: 'Comprueba el documento de identidad con el formato oficial de tu país.',
    register_invalid_company: 'Introduce la empresa y el número de registro o IVA.',
    register_terms_required: 'Acepta las condiciones para crear la cuenta.',
  },
  it: {
    register_invalid_email: 'Controlla l’indirizzo e-mail.',
    register_invalid_name: 'Inserisci nome e cognome.',
    register_invalid_birth_date: 'Controlla la data di nascita. Devi avere almeno 18 anni.',
    register_invalid_country: 'Scegli un paese valido.',
    register_invalid_phone: 'Controlla il numero di telefono e il prefisso internazionale.',
    register_invalid_address: 'Inserisci indirizzo, codice postale e città.',
    register_invalid_national_id: 'Controlla il numero identificativo nel formato ufficiale del tuo paese.',
    register_invalid_company: 'Inserisci ragione sociale e numero di registrazione o partita IVA.',
    register_terms_required: 'Accetta le condizioni per creare l’account.',
  },
  pl: {
    register_invalid_email: 'Sprawdź adres e-mail.',
    register_invalid_name: 'Podaj imię i nazwisko.',
    register_invalid_birth_date: 'Sprawdź datę urodzenia. Musisz mieć co najmniej 18 lat.',
    register_invalid_country: 'Wybierz prawidłowy kraj.',
    register_invalid_phone: 'Sprawdź numer telefonu i kod kraju.',
    register_invalid_address: 'Podaj ulicę, kod pocztowy i miejscowość.',
    register_invalid_national_id: 'Sprawdź krajowy numer identyfikacyjny w oficjalnym formacie swojego kraju.',
    register_invalid_company: 'Podaj nazwę firmy oraz numer rejestracyjny lub VAT.',
    register_terms_required: 'Zaakceptuj warunki, aby utworzyć konto.',
  },
  nl: {
    register_invalid_email: 'Controleer het e-mailadres.',
    register_invalid_name: 'Vul zowel je voornaam als achternaam in.',
    register_invalid_birth_date: 'Controleer je geboortedatum. Je moet minstens 18 jaar zijn.',
    register_invalid_country: 'Kies een geldig land.',
    register_invalid_phone: 'Controleer het telefoonnummer en de landcode.',
    register_invalid_address: 'Vul straat, postcode en plaats in.',
    register_invalid_national_id: 'Controleer het nationale identificatienummer volgens het officiële formaat van je land.',
    register_invalid_company: 'Vul bedrijfsnaam en KvK- of btw-nummer in.',
    register_terms_required: 'Accepteer de voorwaarden om het account aan te maken.',
  },
  fi: {
    register_invalid_email: 'Tarkista sähköpostiosoite.',
    register_invalid_name: 'Anna sekä etu- että sukunimi.',
    register_invalid_birth_date: 'Tarkista syntymäaika. Sinun on oltava vähintään 18-vuotias.',
    register_invalid_country: 'Valitse kelvollinen maa.',
    register_invalid_phone: 'Tarkista puhelinnumero ja maatunnus.',
    register_invalid_address: 'Anna katuosoite, postinumero ja paikkakunta.',
    register_invalid_national_id: 'Tarkista henkilötunnus maasi virallisen muodon mukaisesti.',
    register_invalid_company: 'Anna yrityksen nimi sekä rekisteri- tai ALV-numero.',
    register_terms_required: 'Hyväksy ehdot tilin luomiseksi.',
  },
  da: {
    register_invalid_email: 'Kontrollér e-mailadressen.',
    register_invalid_name: 'Angiv både fornavn og efternavn.',
    register_invalid_birth_date: 'Kontrollér fødselsdatoen. Du skal være mindst 18 år.',
    register_invalid_country: 'Vælg et gyldigt land.',
    register_invalid_phone: 'Kontrollér telefonnummer og landekode.',
    register_invalid_address: 'Angiv adresse, postnummer og by.',
    register_invalid_national_id: 'Kontrollér det nationale identitetsnummer i dit lands officielle format.',
    register_invalid_company: 'Angiv virksomhedsnavn og registrerings- eller momsnummer.',
    register_terms_required: 'Acceptér vilkårene for at oprette kontoen.',
  },
}

const nationalIdPlaceholderCopy: Record<PublicLocale, string> = {
  sv: 'Ange enligt landets officiella format',
  en: 'Use your country’s official format',
  de: 'Amtliches Format Ihres Landes verwenden',
  at: 'Amtliches Format Ihres Landes verwenden',
  be: 'Gebruik het officiële formaat van je land',
  fr: 'Utilisez le format officiel de votre pays',
  es: 'Usa el formato oficial de tu país',
  it: 'Usa il formato ufficiale del tuo paese',
  pl: 'Użyj oficjalnego formatu swojego kraju',
  nl: 'Gebruik het officiële formaat van je land',
  fi: 'Käytä maasi virallista muotoa',
  da: 'Brug dit lands officielle format',
}

const birthDateGuidanceCopy: Record<
  PublicLocale,
  { birthDatePrivateHelper: string; birthDateBusinessHelper: string; birthDateRequired: string }
> = {
  sv: { birthDatePrivateHelper: 'Välj ditt födelsedatum. Du måste vara minst 18 år.', birthDateBusinessHelper: 'Valfritt för företagskonto. Om det anges måste du vara minst 18 år.', birthDateRequired: 'Välj ditt födelsedatum för att fortsätta.' },
  en: { birthDatePrivateHelper: 'Choose your date of birth. You must be at least 18 years old.', birthDateBusinessHelper: 'Optional for business accounts. If provided, you must be at least 18 years old.', birthDateRequired: 'Choose your date of birth to continue.' },
  de: { birthDatePrivateHelper: 'Wählen Sie Ihr Geburtsdatum. Sie müssen mindestens 18 Jahre alt sein.', birthDateBusinessHelper: 'Für Unternehmenskonten optional. Bei Angabe müssen Sie mindestens 18 Jahre alt sein.', birthDateRequired: 'Wählen Sie Ihr Geburtsdatum, um fortzufahren.' },
  at: { birthDatePrivateHelper: 'Wählen Sie Ihr Geburtsdatum. Sie müssen mindestens 18 Jahre alt sein.', birthDateBusinessHelper: 'Für Unternehmenskonten optional. Bei Angabe müssen Sie mindestens 18 Jahre alt sein.', birthDateRequired: 'Wählen Sie Ihr Geburtsdatum, um fortzufahren.' },
  be: { birthDatePrivateHelper: 'Kies je geboortedatum. Je moet minimaal 18 jaar zijn.', birthDateBusinessHelper: 'Optioneel voor bedrijfsaccounts. Indien ingevuld moet je minimaal 18 jaar zijn.', birthDateRequired: 'Kies je geboortedatum om door te gaan.' },
  fr: { birthDatePrivateHelper: 'Choisissez votre date de naissance. Vous devez avoir au moins 18 ans.', birthDateBusinessHelper: 'Facultatif pour un compte professionnel. Si elle est indiquée, vous devez avoir au moins 18 ans.', birthDateRequired: 'Choisissez votre date de naissance pour continuer.' },
  es: { birthDatePrivateHelper: 'Elige tu fecha de nacimiento. Debes tener al menos 18 años.', birthDateBusinessHelper: 'Opcional para cuentas de empresa. Si se indica, debes tener al menos 18 años.', birthDateRequired: 'Elige tu fecha de nacimiento para continuar.' },
  it: { birthDatePrivateHelper: 'Scegli la data di nascita. Devi avere almeno 18 anni.', birthDateBusinessHelper: 'Facoltativa per gli account aziendali. Se indicata, devi avere almeno 18 anni.', birthDateRequired: 'Scegli la data di nascita per continuare.' },
  pl: { birthDatePrivateHelper: 'Wybierz datę urodzenia. Musisz mieć co najmniej 18 lat.', birthDateBusinessHelper: 'Opcjonalne dla kont firmowych. Jeśli podasz datę, musisz mieć co najmniej 18 lat.', birthDateRequired: 'Wybierz datę urodzenia, aby kontynuować.' },
  nl: { birthDatePrivateHelper: 'Kies je geboortedatum. Je moet minimaal 18 jaar zijn.', birthDateBusinessHelper: 'Optioneel voor bedrijfsaccounts. Indien ingevuld moet je minimaal 18 jaar zijn.', birthDateRequired: 'Kies je geboortedatum om door te gaan.' },
  fi: { birthDatePrivateHelper: 'Valitse syntymäaikasi. Sinun on oltava vähintään 18-vuotias.', birthDateBusinessHelper: 'Valinnainen yritystilille. Jos päivämäärä annetaan, sinun on oltava vähintään 18-vuotias.', birthDateRequired: 'Valitse syntymäaikasi jatkaaksesi.' },
  da: { birthDatePrivateHelper: 'Vælg din fødselsdato. Du skal være mindst 18 år.', birthDateBusinessHelper: 'Valgfrit for virksomhedskonti. Hvis datoen angives, skal du være mindst 18 år.', birthDateRequired: 'Vælg din fødselsdato for at fortsætte.' },
}

function normalizeInitialCountryCode(value?: string) {
  const normalized = (value || '').toUpperCase()
  return euDialCodes[normalized] ? normalized : 'SE'
}

function detectCountryFromPhone(value: string) {
  const compact = value.replace(/[\s()-]/g, '')
  return dialCodeEntries.find(([, dialCode]) => compact.startsWith(dialCode))?.[0]
}

function buildInitialPhone(countryCode: string) {
  return `${euDialCodes[countryCode] || '+46'} `
}

function normalizePhoneForSubmit(value: string, countryCode: string) {
  let compact = value.replace(/[\s()-]/g, '')
  if (compact.startsWith('00')) compact = `+${compact.slice(2)}`
  if (compact.startsWith('+')) return compact
  const dialCode = euDialCodes[countryCode] || ''
  return dialCode ? `${dialCode}${compact.replace(/^0+/, '')}` : compact
}

function localizedRegistrationErrorCode(
  locale: PublicLocale,
  code: RegistrationErrorCode | undefined,
) {
  if (!code) return null
  const general = registrationErrorCopy[locale] as Partial<Record<RegistrationErrorCode, string>>
  const fields = registrationFieldErrorCopy[locale] as Partial<Record<RegistrationErrorCode, string>>
  return general[code] || fields[code] || null
}

export default function RegisterForm({
  locale,
  email,
  initialCountryCode,
  initialAccountType = 'private',
}: {
  locale: PublicLocale
  email: string
  initialCountryCode?: string
  initialAccountType?: 'private' | 'business'
}) {
  const copy = getRegisterFormCopy(locale)
  const router = useRouter()
  const [accountType, setAccountType] = useState<'private' | 'business'>(initialAccountType)
  const [countryCode, setCountryCode] = useState(() =>
    normalizeInitialCountryCode(initialCountryCode),
  )
  const [phone, setPhone] = useState(() => buildInitialPhone(countryCode))
  const [birthDate, setBirthDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const countries = useMemo(
    () =>
      euCountries
        .map(([code]) => ({ code, name: getEuCountryName(code, locale) }))
        .sort((a, b) => a.name.localeCompare(b.name, locale)),
    [locale],
  )

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const legalAccepted = form.get('legalAccepted') === 'on'
    if (accountType === 'private' && !birthDate) {
      setError(copy.birthDateRequired)
      setLoading(false)
      return
    }
    const normalizedPhone = normalizePhoneForSubmit(phone, countryCode)
    try {
      const response = await fetch('/api/account/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountType,
          firstName: form.get('firstName'),
          lastName: form.get('lastName'),
          birthDate,
          nationalId: form.get('nationalId'),
          phone: normalizedPhone,
          countryCode,
          addressLine1: form.get('addressLine1'),
          addressLine2: form.get('addressLine2'),
          postalCode: form.get('postalCode'),
          city: form.get('city'),
          region: form.get('region'),
          companyName: form.get('companyName'),
          registrationNumber: form.get('registrationNumber'),
          vatNumber: form.get('vatNumber'),
          websiteUrl: form.get('websiteUrl'),
          adult18: accountType === 'private' && legalAccepted,
          acceptedMarketplaceTerms: legalAccepted,
          acceptedPurchaseTerms: legalAccepted,
          acceptedPrivacyPolicy: legalAccepted,
          confirmedRightToSellOnly: accountType === 'private' && legalAccepted,
          confirmedBusinessRightToSell: accountType === 'business' && legalAccepted,
          locale,
        }),
      })
      const result = (await response.json().catch(() => ({}))) as {
        error?: string
        code?: string
        field?: string
      }
      if (!response.ok) {
        const codedError = result.code as RegistrationErrorCode | undefined
        const localizedCodeError = localizedRegistrationErrorCode(locale, codedError)
        setError(
          localizedCodeError
            ? localizedCodeError
            : localizedAccountError(locale, result, copy.createError),
        )
        return
      }
      router.push(localizePublicHref(locale, '/account'))
      router.refresh()
    } catch {
      setError(copy.createError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="min-w-0 overflow-hidden rounded-[24px] border border-[#dce3f0] bg-white shadow-[0_28px_90px_rgba(16,24,40,.10)]"
    >
      <div className="border-b border-[#e5e9f0] bg-[#f8faff] p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#0866ff]">
          {copy.chooseAccountType}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {([
            ['private', copy.privateAccount, copy.privateDescription, UserRound],
            ['business', copy.businessAccount, copy.businessDescription, Building2],
          ] as const).map(([value, label, description, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setAccountType(value)}
              className={`min-w-0 flex min-h-28 flex-col items-start justify-center gap-2 rounded-[16px] border p-4 text-left transition ${
                accountType === value
                  ? 'border-[#0866ff] bg-white text-[#0866ff] shadow-[0_10px_28px_rgba(8,102,255,.10)]'
                  : 'border-[#dce2ed] bg-white text-[#344054] hover:border-[#aebbd0]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <strong className="text-sm font-semibold">{label}</strong>
              <span className="text-xs font-normal leading-5 text-[#667085]">{description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8 p-5 sm:p-8">
        <FormSection
          icon={UserRound}
          title={accountType === 'private' ? copy.identity : copy.contactPerson}
        >
          <Field name="firstName" label={copy.firstName} autoComplete="given-name" required />
          <Field name="lastName" label={copy.lastName} autoComplete="family-name" required />
          <BirthDatePicker
            name="birthDate"
            label={copy.birthDate}
            locale={locale}
            value={birthDate}
            onChange={setBirthDate}
            helper={accountType === 'business' ? copy.birthDateBusinessHelper : copy.birthDatePrivateHelper}
            required={accountType === 'private'}
          />
          {accountType === 'private' ? (
            <Field
              name="nationalId"
              label={copy.nationalId}
              autoComplete="off"
              placeholder={countryCode === 'SE' ? 'ÅÅMMDD-XXXX eller YYYYMMDD-XXXX' : nationalIdPlaceholderCopy[locale]}
              helper={copy.nationalIdHelper}
              required
            />
          ) : (
            <>
              <Field name="companyName" label={copy.companyName} autoComplete="organization" required />
              <Field name="registrationNumber" label={copy.registrationNumber} required />
              <Field name="vatNumber" label={copy.vatNumber} helper={copy.vatHelper} />
              <Field name="websiteUrl" label={copy.websiteUrl} type="url" autoComplete="url" helper={copy.websiteHelper} />
            </>
          )}
        </FormSection>

        <FormSection icon={MapPin} title={copy.addressCountry}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">{copy.country}</span>
            <select
              name="countryCode"
              value={countryCode}
              onChange={(event) => {
                const nextCountry = event.target.value
                const previousDialCode = euDialCodes[countryCode]
                const nextDialCode = euDialCodes[nextCountry]
                setCountryCode(nextCountry)
                setPhone((current) => {
                  const compact = current.trim()
                  if (!compact || compact === previousDialCode) return `${nextDialCode} `
                  if (compact.startsWith(previousDialCode)) {
                    return `${nextDialCode}${compact.slice(previousDialCode.length)}`
                  }
                  return current
                })
              }}
              className="h-13 w-full rounded-[14px] border border-[#d7deed] bg-white px-4 outline-none focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
              required
            >
              {countries.map(({ code, name }) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <Field name="addressLine1" label={copy.streetAddress} autoComplete="address-line1" required />
          <Field name="addressLine2" label={copy.addressLine2} autoComplete="address-line2" />
          <Field name="postalCode" label={copy.postalCode} autoComplete="postal-code" required />
          <Field name="city" label={copy.city} autoComplete="address-level2" required />
          <Field name="region" label={copy.region} autoComplete="address-level1" />
        </FormSection>

        <FormSection icon={MailCheck} title={copy.contact}>
          <div className="rounded-[14px] border border-[#cfe0ff] bg-[#f4f8ff] p-4 sm:col-span-2">
            <span className="block text-xs font-semibold uppercase tracking-[.14em] text-[#0866ff]">
              {copy.verifiedEmail}
            </span>
            <strong className="mt-1 block break-all text-sm">{email}</strong>
          </div>
          <PhoneField
            label={copy.phone}
            helper={copy.phoneHelper}
            countryCode={countryCode}
            phone={phone}
            locale={locale}
            onCountryChange={(nextCountry) => {
              const previousDialCode = euDialCodes[countryCode]
              const nextDialCode = euDialCodes[nextCountry]
              setCountryCode(nextCountry)
              setPhone((current) => {
                const compact = current.trim()
                if (!compact || compact === previousDialCode) return `${nextDialCode} `
                if (compact.startsWith(previousDialCode)) {
                  return `${nextDialCode}${compact.slice(previousDialCode.length)}`
                }
                return `${nextDialCode} `
              })
            }}
            onPhoneChange={(nextPhone) => {
              setPhone(nextPhone)
              const detectedCountry = detectCountryFromPhone(nextPhone)
              if (detectedCountry && detectedCountry !== countryCode) {
                setCountryCode(detectedCountry)
              }
            }}
          />
        </FormSection>

        <div className="rounded-[16px] border border-[#cfe0ff] bg-[#f4f8ff] p-4 text-sm leading-6 text-[#475467]">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0866ff]" />
            <p>{copy.safetyNotice}</p>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#d7deed] p-4">
          <Checkbox
            name="legalAccepted"
            label={
              <LegalConfirmationLabel
                locale={locale}
                accountType={accountType}
              />
            }
          />
        </div>

        {error ? (
          <p role="alert" className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          disabled={loading}
          className="flex min-h-13 w-full items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-6 font-semibold text-white transition hover:bg-[#0057e6] disabled:opacity-60"
        >
          <CheckCircle2 className="h-5 w-5" />
          {loading ? copy.loading : copy.createAccount}
        </button>
        <p className="text-center text-sm text-[#667085]">
          {copy.haveAccount}{' '}
          <Link href={localizePublicHref(locale, '/')} className="font-semibold text-[#0866ff]">
            {copy.signIn}
          </Link>
        </p>
      </div>
    </form>
  )
}

function Checkbox({
  name,
  label,
}: {
  name: string
  label: ReactNode
}) {
  return (
    <label className="flex gap-3 text-sm leading-6 text-[#667085]">
      <input
        name={name}
        type="checkbox"
        required
        className="mt-1 h-4 w-4 accent-[#0866ff]"
      />
      <span>{label}</span>
    </label>
  )
}

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof UserRound
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#eef4ff] text-[#0866ff]">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <h2 className="text-lg tracking-[-.02em]">{title}</h2>
      </div>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({
  label,
  helper,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; helper?: string }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input
        {...inputProps}
        className="h-13 min-w-0 w-full rounded-[14px] border border-[#d7deed] px-4 text-[#101828] outline-none transition placeholder:font-normal placeholder:text-[#7b8494] focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
      />
      {helper ? <span className="mt-1.5 block text-xs leading-5 text-[#7b8494]">{helper}</span> : null}
    </label>
  )
}

function PhoneField({
  label,
  helper,
  countryCode,
  phone,
  locale,
  onCountryChange,
  onPhoneChange,
}: {
  label: string
  helper?: string
  countryCode: string
  phone: string
  locale: PublicLocale
  onCountryChange: (countryCode: string) => void
  onPhoneChange: (phone: string) => void
}) {
  const countries = euCountries
    .map(([code]) => ({ code, name: getEuCountryName(code, locale), dialCode: euDialCodes[code] }))
    .filter((country) => country.dialCode)
    .sort((a, b) => a.name.localeCompare(b.name, locale))
  const activeDialCode = euDialCodes[countryCode] || '+46'

  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <div className="grid min-h-13 grid-cols-[132px_1fr] overflow-hidden rounded-[14px] border border-[#d7deed] bg-white transition focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10">
        <span className="relative flex min-w-0 items-center gap-2 border-r border-[#d7deed] bg-[#f8faff] px-3">
          <FlagIcon code={countryCode} size="sm" />
          <span className="text-sm font-semibold text-[#101828]">{activeDialCode}</span>
          <ChevronDown className="ml-auto h-4 w-4 text-[#667085]" />
          <select
            aria-label={label}
            value={countryCode}
            onChange={(event) => onCountryChange(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {countries.map(({ code, name, dialCode }) => (
              <option key={code} value={code}>
                {name} {dialCode}
              </option>
            ))}
          </select>
        </span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          placeholder={`${activeDialCode} 70 123 45 67`}
          required
          className="h-13 min-w-0 w-full px-4 text-[#101828] outline-none placeholder:font-normal placeholder:text-[#7b8494]"
        />
      </div>
      {helper ? <span className="mt-1.5 block text-xs leading-5 text-[#7b8494]">{helper}</span> : null}
    </label>
  )
}

function LegalConfirmationLabel({
  locale,
  accountType,
}: {
  locale: PublicLocale
  accountType: 'private' | 'business'
}) {
  const termsHref = localizePublicHref(locale, '/terms')
  const purchaseTermsHref = `${termsHref}#purchase-terms`
  const privacyHref = localizePublicHref(locale, '/privacy')
  const copy = legalConfirmationCopy[locale]

  return (
    <>
      {accountType === 'business' ? copy.businessPrefix : copy.privatePrefix}{' '}
      <Link href={termsHref} className="font-semibold text-[#0866ff]">{copy.terms}</Link>
      {copy.separator}{' '}
      <Link href={purchaseTermsHref} className="font-semibold text-[#0866ff]">{copy.purchaseTerms}</Link>
      {copy.lastSeparator}{' '}
      <Link href={privacyHref} className="font-semibold text-[#0866ff]">{copy.privacy}</Link>
      {copy.suffix}
    </>
  )
}

const legalConfirmationCopy: Record<
  PublicLocale,
  { privatePrefix: string; businessPrefix: string; terms: string; purchaseTerms: string; privacy: string; separator: string; lastSeparator: string; suffix: string }
> = {
  sv: { privatePrefix: 'Jag bekräftar att jag är minst 18 år, har rätt att sälja de objekt jag publicerar och har läst och godkänner', businessPrefix: 'Jag bekräftar att företaget har rätt att sälja objektet och att jag har läst och godkänner', terms: 'Användarvillkoren', purchaseTerms: 'Köpvillkoren', privacy: 'Integritetspolicyn', separator: ',', lastSeparator: ' och', suffix: '.' },
  en: { privatePrefix: 'I confirm that I am at least 18 years old, have the right to sell the objects I publish and have read and accept the', businessPrefix: 'I confirm that the company has the right to sell the object and that I have read and accept the', terms: 'Terms of Use', purchaseTerms: 'Purchase Terms', privacy: 'Privacy Policy', separator: ',', lastSeparator: ' and', suffix: '.' },
  de: { privatePrefix: 'Ich bestätige, dass ich mindestens 18 Jahre alt bin, zum Verkauf der veröffentlichten Objekte berechtigt bin und Folgendes gelesen habe und akzeptiere:', businessPrefix: 'Ich bestätige, dass das Unternehmen zum Verkauf des Objekts berechtigt ist und dass ich Folgendes gelesen habe und akzeptiere:', terms: 'Nutzungsbedingungen', purchaseTerms: 'Kaufbedingungen', privacy: 'Datenschutzrichtlinie', separator: ',', lastSeparator: ' und', suffix: '.' },
  at: { privatePrefix: 'Ich bestätige, dass ich mindestens 18 Jahre alt bin, zum Verkauf der veröffentlichten Objekte berechtigt bin und Folgendes gelesen habe und akzeptiere:', businessPrefix: 'Ich bestätige, dass das Unternehmen zum Verkauf des Objekts berechtigt ist und dass ich Folgendes gelesen habe und akzeptiere:', terms: 'Nutzungsbedingungen', purchaseTerms: 'Kaufbedingungen', privacy: 'Datenschutzrichtlinie', separator: ',', lastSeparator: ' und', suffix: '.' },
  be: { privatePrefix: 'Ik bevestig dat ik minimaal 18 jaar ben, het recht heb de gepubliceerde objecten te verkopen en het volgende heb gelezen en accepteer:', businessPrefix: 'Ik bevestig dat het bedrijf het recht heeft het object te verkopen en dat ik het volgende heb gelezen en accepteer:', terms: 'Gebruiksvoorwaarden', purchaseTerms: 'Aankoopvoorwaarden', privacy: 'Privacybeleid', separator: ',', lastSeparator: ' en', suffix: '.' },
  fr: { privatePrefix: 'Je confirme avoir au moins 18 ans, être autorisé à vendre les objets publiés et avoir lu et accepté les', businessPrefix: 'Je confirme que l’entreprise est autorisée à vendre l’objet et que j’ai lu et accepté les', terms: 'Conditions d’utilisation', purchaseTerms: 'Conditions d’achat', privacy: 'Politique de confidentialité', separator: ',', lastSeparator: ' et la', suffix: '.' },
  es: { privatePrefix: 'Confirmo que tengo al menos 18 años, que puedo vender los objetos publicados y que he leído y acepto los', businessPrefix: 'Confirmo que la empresa puede vender el objeto y que he leído y acepto los', terms: 'Términos de uso', purchaseTerms: 'Condiciones de compra', privacy: 'Política de privacidad', separator: ',', lastSeparator: ' y la', suffix: '.' },
  it: { privatePrefix: 'Confermo di avere almeno 18 anni, di poter vendere gli oggetti pubblicati e di aver letto e accettato i', businessPrefix: 'Confermo che l’azienda può vendere l’oggetto e che ho letto e accetto i', terms: 'Termini di utilizzo', purchaseTerms: 'Termini di acquisto', privacy: 'l’informativa sulla privacy', separator: ',', lastSeparator: ' e', suffix: '.' },
  pl: { privatePrefix: 'Potwierdzam, że mam co najmniej 18 lat, mam prawo sprzedać opublikowane przedmioty oraz że znam i akceptuję', businessPrefix: 'Potwierdzam, że firma ma prawo sprzedać przedmiot oraz że znam i akceptuję', terms: 'Warunki użytkowania', purchaseTerms: 'Warunki zakupu', privacy: 'Politykę prywatności', separator: ',', lastSeparator: ' oraz', suffix: '.' },
  nl: { privatePrefix: 'Ik bevestig dat ik minimaal 18 jaar ben, het recht heb de gepubliceerde objecten te verkopen en het volgende heb gelezen en accepteer:', businessPrefix: 'Ik bevestig dat het bedrijf het recht heeft het object te verkopen en dat ik het volgende heb gelezen en accepteer:', terms: 'Gebruiksvoorwaarden', purchaseTerms: 'Aankoopvoorwaarden', privacy: 'Privacybeleid', separator: ',', lastSeparator: ' en', suffix: '.' },
  fi: { privatePrefix: 'Vahvistan olevani vähintään 18-vuotias, että minulla on oikeus myydä julkaisemani kohteet ja että olen lukenut ja hyväksyn', businessPrefix: 'Vahvistan, että yrityksellä on oikeus myydä kohde ja että olen lukenut ja hyväksyn', terms: 'Käyttöehdot', purchaseTerms: 'Ostoehdot', privacy: 'Tietosuojakäytännön', separator: ',', lastSeparator: ' ja', suffix: '.' },
  da: { privatePrefix: 'Jeg bekræfter, at jeg er mindst 18 år, har ret til at sælge de publicerede genstande og har læst og accepterer', businessPrefix: 'Jeg bekræfter, at virksomheden har ret til at sælge genstanden, og at jeg har læst og accepterer', terms: 'Brugervilkårene', purchaseTerms: 'Købsvilkårene', privacy: 'Privatlivspolitikken', separator: ',', lastSeparator: ' og', suffix: '.' },
}

function getRegisterFormCopy(locale: PublicLocale) {
  const en = {
    chooseAccountType: 'Choose account type',
    privateAccount: 'Private account',
    businessAccount: 'Business account',
    privateDescription: 'For buying and selling in your own name',
    businessDescription: 'For inventory, trade and company listings',
    identity: 'Your identity',
    contactPerson: 'Contact person',
    firstName: 'First name',
    lastName: 'Last name',
    birthDate: 'Date of birth',
    birthDatePrivateHelper: 'Choose your date of birth. You must be at least 18 years old.',
    birthDateBusinessHelper: 'Optional for business accounts. If provided, you must be at least 18 years old.',
    birthDateRequired: 'Choose your date of birth to continue.',
    nationalId: 'National identity number',
    nationalIdHelper:
      'Checked against the country format. The number is never shown publicly.',
    companyName: 'Company name',
    registrationNumber: 'Registration number',
    vatNumber: 'VAT number',
    vatHelper: 'Checked against EU VIES when provided. The account can still be created if the check needs review.',
    websiteUrl: 'Website',
    websiteHelper: 'Optional but recommended. We compare it with the email domain as a trust signal.',
    addressCountry: 'Address and country',
    country: 'Country',
    streetAddress: 'Street address',
    addressLine2: 'Apartment, floor or c/o',
    postalCode: 'Postal code',
    city: 'City',
    region: 'Region or state',
    contact: 'Contact',
    verifiedEmail: 'Verified email address',
    phone: 'Phone number',
    phoneHelper: 'Use international format with country code.',
    safetyNotice:
      'Autorell performs automatic format, duplicate and risk checks. If something looks unusual, the account or listing may need manual verification before publication.',
    adult18: 'I am at least 18 years old',
    privateLegalConfirmation:
      'I confirm that I am at least 18 years old, have the right to sell the objects I publish and have read and accept the Terms of Use, Purchase Terms and Privacy Policy.',
    businessLegalConfirmation:
      'I confirm that the company has the right to sell the object and that I have read and accept the Terms of Use, Purchase Terms and Privacy Policy.',
    createAccount: 'Create account',
    loading: 'Checking details...',
    createError: 'The account could not be created. Check the details.',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
  }

  if (locale === 'sv') {
    return {
      ...en,
      chooseAccountType: 'Välj kontotyp',
      privateAccount: 'Privatkonto',
      businessAccount: 'Företagskonto',
      privateDescription: 'För köp och försäljning i eget namn',
      businessDescription: 'För lager, handel och företagsannonser',
      identity: 'Din identitet',
      contactPerson: 'Kontaktperson',
      firstName: 'Förnamn',
      lastName: 'Efternamn',
      birthDate: 'Födelsedatum',
      birthDatePrivateHelper: 'Välj ditt födelsedatum. Du måste vara minst 18 år.',
      birthDateBusinessHelper: 'Valfritt för företagskonto. Om det anges måste du vara minst 18 år.',
      birthDateRequired: 'Välj ditt födelsedatum för att fortsätta.',
      nationalId: 'Nationellt identitetsnummer',
      nationalIdHelper:
        'Kontrolleras mot landets format. Numret visas aldrig publikt.',
      companyName: 'Företagsnamn',
      registrationNumber: 'Organisationsnummer',
      vatNumber: 'VAT-nummer',
      vatHelper: 'Kontrolleras mot EU VIES när det anges. Kontot kan fortfarande skapas om kontrollen behöver granskas.',
      websiteUrl: 'Webbplats',
      websiteHelper: 'Frivilligt men rekommenderat. Vi jämför den med e-postdomänen som förtroendesignal.',
      addressCountry: 'Adress och land',
      country: 'Land',
      streetAddress: 'Gatuadress',
      addressLine2: 'Lägenhet, våning eller c/o',
      postalCode: 'Postnummer',
      city: 'Ort',
      region: 'Region eller delstat',
      contact: 'Kontakt',
      verifiedEmail: 'Verifierad mejladress',
      phone: 'Telefonnummer',
      phoneHelper: 'Ange internationellt format med landskod.',
      safetyNotice:
        'Autorell gör automatiska format-, dubblett- och riskkontroller. Vid avvikelse kan kontot eller en annons behöva manuell verifiering innan publicering.',
      adult18: 'Jag är minst 18 år',
      privateLegalConfirmation:
        'Jag bekräftar att jag är minst 18 år, har rätt att sälja de objekt jag publicerar och att jag har läst och godkänner Användarvillkoren, Köpvillkoren och Integritetspolicyn.',
      businessLegalConfirmation:
        'Jag bekräftar att jag har rätt att sälja objektet och att jag har läst och godkänner Användarvillkoren, Köpvillkoren samt Integritetspolicyn.',
      createAccount: 'Skapa konto',
      loading: 'Kontrollerar uppgifter...',
      createError: 'Kontot kunde inte skapas. Kontrollera uppgifterna.',
      haveAccount: 'Har du redan ett konto?',
      signIn: 'Logga in',
    }
  }

  if (locale === 'de') {
    return {
      ...en,
      chooseAccountType: 'Kontotyp wählen',
      privateAccount: 'Privatkonto',
      businessAccount: 'Unternehmenskonto',
      privateDescription: 'Für Kauf und Verkauf im eigenen Namen',
      businessDescription: 'Für Bestand, Handel und Unternehmensanzeigen',
      identity: 'Ihre Identität',
      contactPerson: 'Kontaktperson',
      firstName: 'Vorname',
      lastName: 'Nachname',
      birthDate: 'Geburtsdatum',
      birthDatePrivateHelper: 'Wählen Sie Ihr Geburtsdatum. Sie müssen mindestens 18 Jahre alt sein.',
      birthDateBusinessHelper: 'Für Unternehmenskonten optional. Bei Angabe müssen Sie mindestens 18 Jahre alt sein.',
      birthDateRequired: 'Wählen Sie Ihr Geburtsdatum, um fortzufahren.',
      nationalId: 'Nationale Identifikationsnummer',
      nationalIdHelper:
        'Wird gegen das Länderformat geprüft. Die Nummer wird nie öffentlich angezeigt.',
      companyName: 'Firmenname',
      registrationNumber: 'Handelsregisternummer',
      vatNumber: 'USt-IdNr.',
      vatHelper: 'Wird gegen EU VIES geprüft, wenn sie angegeben wird. Das Konto kann trotzdem erstellt werden, wenn die Prüfung überprüft werden muss.',
      websiteUrl: 'Website',
      websiteHelper: 'Optional, aber empfohlen. Wir vergleichen sie als Vertrauenssignal mit der E-Mail-Domain.',
      addressCountry: 'Adresse und Land',
      country: 'Land',
      streetAddress: 'Straße und Hausnummer',
      addressLine2: 'Wohnung, Etage oder c/o',
      postalCode: 'Postleitzahl',
      city: 'Stadt',
      region: 'Region oder Bundesland',
      contact: 'Kontakt',
      verifiedEmail: 'Verifizierte E-Mail-Adresse',
      phone: 'Telefonnummer',
      phoneHelper: 'Internationales Format mit Ländervorwahl verwenden.',
      safetyNotice:
        'Autorell führt automatische Format-, Dubletten- und Risikoprüfungen durch. Bei Auffälligkeiten kann das Konto oder eine Anzeige vor der Veröffentlichung manuell geprüft werden.',
      adult18: 'Ich bin mindestens 18 Jahre alt',
      privateLegalConfirmation:
        'Ich bestätige, dass ich mindestens 18 Jahre alt bin, zum Verkauf der veröffentlichten Objekte berechtigt bin und die Nutzungsbedingungen, Kaufbedingungen und Datenschutzrichtlinie gelesen und akzeptiert habe.',
      businessLegalConfirmation:
        'Ich bestätige, dass das Unternehmen zum Verkauf des Objekts berechtigt ist und dass ich die Nutzungsbedingungen, Kaufbedingungen und Datenschutzrichtlinie gelesen und akzeptiert habe.',
      createAccount: 'Konto erstellen',
      loading: 'Angaben werden geprüft...',
      createError: 'Das Konto konnte nicht erstellt werden. Prüfen Sie die Angaben.',
      haveAccount: 'Sie haben bereits ein Konto?',
      signIn: 'Anmelden',
    }
  }

  return {
    ...translatePublicObject(locale, en),
    ...birthDateGuidanceCopy[locale],
  }
}
