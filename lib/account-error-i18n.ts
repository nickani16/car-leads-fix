import { translatePublic, type PublicLocale } from './public-i18n'

type ErrorLike = {
  error?: string
  code?: string
}

const errorCodeAliases: Record<string, string> = {
  listing_create_failed: 'The listing could not be created.',
  active_listing_limit_reached: 'The listing limit for the company plan has been reached.',
  subscription_not_active: 'The business subscription must be active before more listings can be created.',
  company_not_verified: 'The company must be reviewed by Autorell before new listings can be published.',
  plan_required: 'The business subscription must be active before more listings can be created.',
}

const errorMessageAliases: Array<[RegExp, string]> = [
  [/^inte inloggad\.?$/i, 'You need to sign in.'],
  [/^not authenticated\.?$/i, 'You need to sign in.'],
  [/^profilen hittades inte\.?$/i, 'The profile could not be found.'],
  [/fyll i namn.*telefon.*adress/i, 'Enter name, phone number, date of birth and full address.'],
  [/komplettera din kontoprofil/i, 'Complete your account profile before creating the listing.'],
  [/komplettera och kontrollera din konto- och adressprofil/i, 'Complete and check your account and address profile first.'],
  [/kontot .*begränsat|kontot .*begr/i, 'The account is restricted. Contact support before publishing.'],
  [/företaget behöver granskas|f.retaget beh.ver granskas/i, 'The company must be reviewed by Autorell before new listings can be published.'],
  [/godkänn annons- och betalningsvillkoren|godk.nn annons- och betalningsvillkoren/i, 'Approve the listing and payment terms.'],
  [/alla säljarbekräftelser|alla s.ljarbekr.ftelser/i, 'All seller confirmations must be approved before the listing can be created.'],
  [/välj en verifierad ort|v.lj en verifierad ort/i, 'Choose a verified place from the list, or use "My place is missing" if the place is missing.'],
  [/postnumret verkar inte vara giltigt/i, 'The postal code does not seem valid for the selected country.'],
  [/välj en giltig färg|v.lj en giltig f.rg/i, 'Choose a valid colour.'],
  [/drifttimmar krävs|drifttimmar kr.vs/i, 'Operating hours are required for machinery.'],
  [/fyll i märke eller tillverkare|fyll i m.rke eller tillverkare/i, 'Enter make or manufacturer.'],
  [/fyll i modell\.?$/i, 'Enter model.'],
  [/välj årsmodell|v.lj .rsmodell/i, 'Choose a model year between 1950+ and 2027.'],
  [/fyll i ort\.?$/i, 'Enter city.'],
  [/fyll i ett giltigt försäljningspris|fyll i ett giltigt f.rs.ljningspris/i, 'Enter a valid sale price.'],
  [/leasing kan bara användas|leasing kan bara anv.ndas/i, 'Leasing is only available for cars, vans, trucks, agricultural machinery and construction machinery.'],
  [/fyll i en giltig leasingkostnad/i, 'Enter a valid monthly leasing cost.'],
  [/ladda upp 1[-–]20 bilder/i, 'Upload 1-20 images, maximum 25 MB per image.'],
  [/ladda upp en giltig bild.*serienummerskylten/i, 'Upload a valid image of the serial number plate.'],
  [/bilderna kunde inte behandlas/i, 'The images could not be processed. Try again or remove the image that failed.'],
  [/bilderna kunde inte laddas upp/i, 'The images could not be uploaded.'],
  [/annonsen kunde inte skapas/i, 'The listing could not be created.'],
  [/annonsen kunde inte sparas/i, 'The listing could not be saved.'],
  [/annonsen kunde inte dupliceras/i, 'The listing could not be duplicated.'],
  [/åtgärden är inte tillgänglig|.tg.rden .r inte tillg.nglig/i, 'This action is not available for the listing status.'],
  [/märke, modell och årsmodell krävs|m.rke, modell och .rsmodell kr.vs/i, 'Make, model and model year are required.'],
  [/pris och ort krävs|pris och ort kr.vs/i, 'Price and city are required.'],
  [/endast företagskonton kan ladda upp logotyp|endast f.retagskonton kan ladda upp logotyp/i, 'Only business accounts can upload a logo.'],
  [/ladda upp en bildlogotyp under 2 mb/i, 'Upload an image logo under 2 MB.'],
  [/faktura kan bara användas|faktura kan bara anv.ndas/i, 'Invoice can only be used by business accounts.'],
  [/företagskonton använder abonnemang|f.retagskonton anv.nder abonnemang/i, 'Business accounts use subscriptions and cannot buy private listing packages.'],
  [/företaget måste vara godkänt|f.retaget m.ste vara godk.nt/i, 'The company must be approved before Free can be activated.'],
  [/företagsabonnemanget behöver vara aktivt|f.retagsabonnemanget beh.ver vara aktivt/i, 'The business subscription must be active before more listings can be created.'],
  [/annonsen kan lyftas igen tidigast/i, 'The listing can be boosted again no earlier than 24 hours after the last boost.'],
  [/för många inbjudningar|f.r m.nga inbjudningar/i, 'Too many invitations in a short time. Try again later.'],
  [/du är redan kopplad|du .r redan kopplad/i, 'You are already connected to the company.'],
  [/endast företagskonton kan bjuda in|endast f.retagskonton kan bjuda in/i, 'Only business accounts can invite team members.'],
  [/teamkonton ingår från growth|teamkonton ing.r fr.n growth/i, 'Team accounts are included from Growth.'],
  [/planen måste vara aktiv|planen m.ste vara aktiv/i, 'The plan must be active before team members can be invited.'],
  [/teamgränsen för planen är uppnådd|teamgr.nsen f.r planen .r uppn.dd/i, 'The team limit for the plan has been reached.'],
  [/e-postadressen är redan medlem|e-postadressen .r redan medlem/i, 'That email address is already a member or has an active invitation.'],
  [/användaren är redan kopplad|anv.ndaren .r redan kopplad/i, 'That user is already connected to the company.'],
  [/too many requests/i, 'Too many requests. Please try again shortly.'],
  [/invalid action/i, 'Invalid action.'],
  [/listing not found/i, 'Listing not found.'],
  [/this listing cannot be edited/i, 'This listing cannot be edited.'],
  [/only active or paused listings/i, 'Only active or paused listings can be marked as sold.'],
  [/selected buyer is not linked/i, 'The selected buyer is not linked to this listing.'],
  [/listing status changed/i, 'The listing status changed. Refresh and try again.'],
  [/invitation could not be sent/i, 'Invitation could not be sent.'],
]

const localizedErrorMessages: Record<string, Record<string, string>> = {
  sv: {
    'You need to sign in.': 'Du behöver logga in.',
    'The profile could not be found.': 'Profilen kunde inte hittas.',
    'Enter name, phone number, date of birth and full address.': 'Fyll i namn, telefonnummer, födelsedatum och fullständig adress.',
    'The listing could not be created.': 'Annonsen kunde inte skapas.',
    'The listing could not be saved.': 'Annonsen kunde inte sparas.',
    'The images could not be uploaded.': 'Bilderna kunde inte laddas upp.',
    'The images could not be processed. Try again or remove the image that failed.': 'Bilderna kunde inte behandlas. Försök igen eller ta bort bilden som misslyckades.',
    'Complete your account profile before creating the listing.': 'Komplettera din kontoprofil innan du skapar annonsen.',
    'Complete and check your account and address profile first.': 'Komplettera och kontrollera din konto- och adressprofil först.',
    'Approve the listing and payment terms.': 'Godkänn annons- och betalningsvillkoren.',
    'All seller confirmations must be approved before the listing can be created.': 'Alla säljarbekräftelser måste godkännas innan annonsen kan skapas.',
    'Choose a verified place from the list, or use "My place is missing" if the place is missing.': 'Välj en verifierad ort från listan, eller använd "Min ort saknas" om orten saknas.',
    'The postal code does not seem valid for the selected country.': 'Postnumret verkar inte vara giltigt för valt land.',
    'Enter make or manufacturer.': 'Fyll i märke eller tillverkare.',
    'Enter model.': 'Fyll i modell.',
    'Choose a model year between 1950+ and 2027.': 'Välj årsmodell mellan 1950+ och 2027.',
    'Enter city.': 'Fyll i ort.',
    'Enter a valid sale price.': 'Fyll i ett giltigt försäljningspris.',
    'Enter a valid monthly leasing cost.': 'Fyll i en giltig leasingkostnad per månad.',
    'The business subscription must be active before more listings can be created.': 'Företagsabonnemanget behöver vara aktivt innan fler annonser kan skapas.',
    'The company must be reviewed by Autorell before new listings can be published.': 'Företaget behöver granskas av Autorell innan nya annonser kan publiceras.',
    'Only business accounts can upload a logo.': 'Endast företagskonton kan ladda upp logotyp.',
    'Upload an image logo under 2 MB.': 'Ladda upp en bildlogotyp under 2 MB.',
    'The action could not be completed.': 'Åtgärden kunde inte genomföras.',
    'Invitation could not be sent.': 'Inbjudan kunde inte skickas.',
    'Review could not be saved.': 'Omdömet kunde inte sparas.',
  },
  de: {
    'You need to sign in.': 'Sie müssen sich anmelden.',
    'The profile could not be found.': 'Das Profil konnte nicht gefunden werden.',
    'Enter name, phone number, date of birth and full address.': 'Geben Sie Name, Telefonnummer, Geburtsdatum und vollständige Adresse ein.',
    'The listing could not be created.': 'Die Anzeige konnte nicht erstellt werden.',
    'The listing could not be saved.': 'Die Anzeige konnte nicht gespeichert werden.',
    'The images could not be uploaded.': 'Die Bilder konnten nicht hochgeladen werden.',
    'The images could not be processed. Try again or remove the image that failed.': 'Die Bilder konnten nicht verarbeitet werden. Versuchen Sie es erneut oder entfernen Sie das fehlgeschlagene Bild.',
    'Complete your account profile before creating the listing.': 'Vervollständigen Sie Ihr Kontoprofil, bevor Sie die Anzeige erstellen.',
    'Complete and check your account and address profile first.': 'Vervollständigen und prüfen Sie zuerst Ihr Konto- und Adressprofil.',
    'Approve the listing and payment terms.': 'Bestätigen Sie die Anzeigen- und Zahlungsbedingungen.',
    'All seller confirmations must be approved before the listing can be created.': 'Alle Verkäuferbestätigungen müssen genehmigt werden, bevor die Anzeige erstellt werden kann.',
    'Choose a verified place from the list, or use "My place is missing" if the place is missing.': 'Wählen Sie einen verifizierten Ort aus der Liste oder nutzen Sie „Mein Ort fehlt“, wenn der Ort fehlt.',
    'The postal code does not seem valid for the selected country.': 'Die Postleitzahl scheint für das gewählte Land nicht gültig zu sein.',
    'Enter make or manufacturer.': 'Geben Sie Marke oder Hersteller ein.',
    'Enter model.': 'Geben Sie das Modell ein.',
    'Choose a model year between 1950+ and 2027.': 'Wählen Sie ein Modelljahr zwischen 1950+ und 2027.',
    'Enter city.': 'Geben Sie den Ort ein.',
    'Enter a valid sale price.': 'Geben Sie einen gültigen Verkaufspreis ein.',
    'Enter a valid monthly leasing cost.': 'Geben Sie eine gültige monatliche Leasingrate ein.',
    'The business subscription must be active before more listings can be created.': 'Das Firmenabonnement muss aktiv sein, bevor weitere Anzeigen erstellt werden können.',
    'The company must be reviewed by Autorell before new listings can be published.': 'Das Unternehmen muss von Autorell geprüft werden, bevor neue Anzeigen veröffentlicht werden können.',
    'Only business accounts can upload a logo.': 'Nur Firmenkonten können ein Logo hochladen.',
    'Upload an image logo under 2 MB.': 'Laden Sie ein Bildlogo unter 2 MB hoch.',
    'The action could not be completed.': 'Die Aktion konnte nicht durchgeführt werden.',
    'Invitation could not be sent.': 'Die Einladung konnte nicht gesendet werden.',
    'Review could not be saved.': 'Die Bewertung konnte nicht gespeichert werden.',
  },
  fr: {
    'You need to sign in.': 'Vous devez vous connecter.',
    'The profile could not be found.': 'Le profil est introuvable.',
    'Enter name, phone number, date of birth and full address.': 'Saisissez le nom, le téléphone, la date de naissance et l’adresse complète.',
    'The listing could not be created.': 'L’annonce n’a pas pu être créée.',
    'The listing could not be saved.': 'L’annonce n’a pas pu être enregistrée.',
    'The images could not be uploaded.': 'Les images n’ont pas pu être téléversées.',
    'Complete and check your account and address profile first.': 'Complétez et vérifiez d’abord votre profil de compte et d’adresse.',
    'Approve the listing and payment terms.': 'Acceptez les conditions de l’annonce et de paiement.',
    'Choose a verified place from the list, or use "My place is missing" if the place is missing.': 'Choisissez un lieu vérifié dans la liste, ou utilisez « Mon lieu est manquant » si le lieu manque.',
    'Enter make or manufacturer.': 'Saisissez la marque ou le fabricant.',
    'Enter model.': 'Saisissez le modèle.',
    'Enter city.': 'Saisissez la ville.',
    'The business subscription must be active before more listings can be created.': 'L’abonnement entreprise doit être actif avant de créer d’autres annonces.',
    'Invitation could not be sent.': 'L’invitation n’a pas pu être envoyée.',
    'Review could not be saved.': 'L’avis n’a pas pu être enregistré.',
  },
  es: {
    'You need to sign in.': 'Debes iniciar sesión.',
    'The profile could not be found.': 'No se pudo encontrar el perfil.',
    'Enter name, phone number, date of birth and full address.': 'Introduce nombre, teléfono, fecha de nacimiento y dirección completa.',
    'The listing could not be created.': 'No se pudo crear el anuncio.',
    'The listing could not be saved.': 'No se pudo guardar el anuncio.',
    'The images could not be uploaded.': 'No se pudieron subir las imágenes.',
    'Complete and check your account and address profile first.': 'Completa y revisa primero tu perfil de cuenta y dirección.',
    'Approve the listing and payment terms.': 'Acepta las condiciones del anuncio y de pago.',
    'Choose a verified place from the list, or use "My place is missing" if the place is missing.': 'Elige una localidad verificada de la lista o usa «Falta mi localidad» si no aparece.',
    'Enter make or manufacturer.': 'Introduce marca o fabricante.',
    'Enter model.': 'Introduce el modelo.',
    'Enter city.': 'Introduce la ciudad.',
    'The business subscription must be active before more listings can be created.': 'La suscripción de empresa debe estar activa antes de crear más anuncios.',
    'Invitation could not be sent.': 'No se pudo enviar la invitación.',
    'Review could not be saved.': 'No se pudo guardar la reseña.',
  },
  it: {
    'You need to sign in.': 'Devi accedere.',
    'The profile could not be found.': 'Profilo non trovato.',
    'Enter name, phone number, date of birth and full address.': 'Inserisci nome, telefono, data di nascita e indirizzo completo.',
    'The listing could not be created.': 'Impossibile creare l’annuncio.',
    'The listing could not be saved.': 'Impossibile salvare l’annuncio.',
    'The images could not be uploaded.': 'Impossibile caricare le immagini.',
    'Complete and check your account and address profile first.': 'Completa e controlla prima il profilo account e indirizzo.',
    'Approve the listing and payment terms.': 'Accetta le condizioni dell’annuncio e di pagamento.',
    'Enter make or manufacturer.': 'Inserisci marca o produttore.',
    'Enter model.': 'Inserisci il modello.',
    'Enter city.': 'Inserisci la città.',
    'The business subscription must be active before more listings can be created.': 'L’abbonamento aziendale deve essere attivo prima di creare altri annunci.',
    'Invitation could not be sent.': 'Impossibile inviare l’invito.',
    'Review could not be saved.': 'Impossibile salvare la recensione.',
  },
  nl: {
    'You need to sign in.': 'Je moet inloggen.',
    'The profile could not be found.': 'Het profiel kon niet worden gevonden.',
    'Enter name, phone number, date of birth and full address.': 'Vul naam, telefoonnummer, geboortedatum en volledig adres in.',
    'The listing could not be created.': 'De advertentie kon niet worden aangemaakt.',
    'The listing could not be saved.': 'De advertentie kon niet worden opgeslagen.',
    'The images could not be uploaded.': 'De afbeeldingen konden niet worden geüpload.',
    'Complete and check your account and address profile first.': 'Vul eerst je account- en adresprofiel volledig in en controleer het.',
    'Approve the listing and payment terms.': 'Accepteer de advertentie- en betalingsvoorwaarden.',
    'Enter make or manufacturer.': 'Vul merk of fabrikant in.',
    'Enter model.': 'Vul het model in.',
    'Enter city.': 'Vul de plaats in.',
    'The business subscription must be active before more listings can be created.': 'Het zakelijke abonnement moet actief zijn voordat er meer advertenties kunnen worden aangemaakt.',
    'Invitation could not be sent.': 'De uitnodiging kon niet worden verzonden.',
    'Review could not be saved.': 'De beoordeling kon niet worden opgeslagen.',
  },
  pl: {
    'You need to sign in.': 'Musisz się zalogować.',
    'The profile could not be found.': 'Nie znaleziono profilu.',
    'Enter name, phone number, date of birth and full address.': 'Podaj imię i nazwisko, telefon, datę urodzenia oraz pełny adres.',
    'The listing could not be created.': 'Nie udało się utworzyć ogłoszenia.',
    'The listing could not be saved.': 'Nie udało się zapisać ogłoszenia.',
    'The images could not be uploaded.': 'Nie udało się przesłać zdjęć.',
    'Complete and check your account and address profile first.': 'Najpierw uzupełnij i sprawdź profil konta oraz adres.',
    'Approve the listing and payment terms.': 'Zaakceptuj warunki ogłoszenia i płatności.',
    'Enter make or manufacturer.': 'Podaj markę lub producenta.',
    'Enter model.': 'Podaj model.',
    'Enter city.': 'Podaj miejscowość.',
    'The business subscription must be active before more listings can be created.': 'Subskrypcja firmowa musi być aktywna, zanim można dodać więcej ogłoszeń.',
    'Invitation could not be sent.': 'Nie udało się wysłać zaproszenia.',
    'Review could not be saved.': 'Nie udało się zapisać opinii.',
  },
  fi: {
    'You need to sign in.': 'Sinun täytyy kirjautua sisään.',
    'The profile could not be found.': 'Profiilia ei löytynyt.',
    'Enter name, phone number, date of birth and full address.': 'Anna nimi, puhelinnumero, syntymäaika ja täydellinen osoite.',
    'The listing could not be created.': 'Ilmoitusta ei voitu luoda.',
    'The listing could not be saved.': 'Ilmoitusta ei voitu tallentaa.',
    'The images could not be uploaded.': 'Kuvia ei voitu ladata.',
    'Complete and check your account and address profile first.': 'Täydennä ja tarkista ensin tili- ja osoiteprofiilisi.',
    'Approve the listing and payment terms.': 'Hyväksy ilmoitus- ja maksuehdot.',
    'Enter make or manufacturer.': 'Anna merkki tai valmistaja.',
    'Enter model.': 'Anna malli.',
    'Enter city.': 'Anna paikkakunta.',
    'The business subscription must be active before more listings can be created.': 'Yritystilaus on oltava aktiivinen ennen kuin uusia ilmoituksia voi luoda.',
    'Invitation could not be sent.': 'Kutsua ei voitu lähettää.',
    'Review could not be saved.': 'Arvostelua ei voitu tallentaa.',
  },
  da: {
    'You need to sign in.': 'Du skal logge ind.',
    'The profile could not be found.': 'Profilen kunne ikke findes.',
    'Enter name, phone number, date of birth and full address.': 'Indtast navn, telefonnummer, fødselsdato og fuld adresse.',
    'The listing could not be created.': 'Annoncen kunne ikke oprettes.',
    'The listing could not be saved.': 'Annoncen kunne ikke gemmes.',
    'The images could not be uploaded.': 'Billederne kunne ikke uploades.',
    'Complete and check your account and address profile first.': 'Udfyld og kontrollér først din konto- og adresseprofil.',
    'Approve the listing and payment terms.': 'Godkend annonce- og betalingsvilkårene.',
    'Enter make or manufacturer.': 'Indtast mærke eller producent.',
    'Enter model.': 'Indtast model.',
    'Enter city.': 'Indtast by.',
    'The business subscription must be active before more listings can be created.': 'Virksomhedsabonnementet skal være aktivt, før der kan oprettes flere annoncer.',
    'Invitation could not be sent.': 'Invitationen kunne ikke sendes.',
    'Review could not be saved.': 'Anmeldelsen kunne ikke gemmes.',
  },
}

export function localizedAccountError(
  locale: PublicLocale,
  result: ErrorLike | null | undefined,
  fallback: string,
) {
  const raw = repairMojibake(String(result?.error || '').trim())
  const code = String(result?.code || '').trim()
  const fromCode = code ? errorCodeAliases[code] : ''
  const canonical = fromCode || aliasErrorMessage(raw)
  const normalizedLocale = locale === 'at' ? 'de' : locale === 'be' ? 'nl' : locale
  const known = localizedErrorMessages[normalizedLocale]?.[canonical || raw || fallback]
  return known || translatePublic(locale, canonical || raw || fallback)
}

function aliasErrorMessage(raw: string) {
  if (!raw) return ''
  const quota = raw.match(/annonskvot.*\((\d+)\/(\d+)\).*startar\s+([^,]+),?/i)
  if (quota) {
    return `The company listing quota for this period has been reached (${quota[1]}/${quota[2]}). The next quota starts ${quota[3]}, or upgrade the plan.`
  }
  const normalized = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  for (const [pattern, english] of errorMessageAliases) {
    if (pattern.test(raw) || pattern.test(normalized)) return english
  }
  return ''
}

function repairMojibake(value: string) {
  let result = value
  for (let index = 0; index < 3 && /Ã|Â/.test(result); index += 1) {
    try {
      result = decodeURIComponent(escape(result))
    } catch {
      break
    }
  }
  return result
}
