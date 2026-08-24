import { translationLocale, type PublicLocale } from '@/lib/public-i18n'

export type ListingReviewNotice = {
  summary: string
  reasons: string[]
  nextStep: string
}

type ReviewCopy = {
  summary: string
  nextStep: string
  genericReason: string
  reasons: Record<string, string>
}

const copies: Record<string, ReviewCopy> = {
  sv: {
    summary: 'Publiceringen är pausad medan Autorell kontrollerar annonsuppgifterna.',
    nextStep: 'Du kan redigera annonsen under tiden. Komplettera uppgifterna nedan så blir granskningen enklare. Kontakta support om telefonnumret bara tillhör dig.',
    genericReason: 'En automatisk kontroll behöver bekräftas manuellt innan annonsen kan publiceras.',
    reasons: {
      missing_vin: 'Chassinumret (VIN) saknas. Lägg till det under Redigera om det finns tillgängligt.',
      missing_serial_number: 'Serienumret saknas. Lägg till det under Redigera om det finns tillgängligt.',
      unusually_low_price: 'Priset avviker från liknande fordon och behöver bekräftas.',
      price_outlier: 'Priset avviker från liknande fordon och behöver bekräftas.',
      new_user: 'Detta är en av kontots första annonser och därför görs en manuell grundkontroll.',
      many_listings_short_time: 'Flera annonser har skapats på kort tid och behöver kontrolleras tillsammans.',
      same_phone_multiple_accounts: 'Telefonnumret är kopplat till fler än ett konto och behöver en manuell ägarkontroll.',
      duplicate_identifier: 'Fordonsidentifieraren används redan i en annan annons.',
      duplicate_listing: 'Annonsen liknar en befintlig annons och behöver kontrolleras.',
      request_info: 'Autorell har begärt kompletterande information från dig.',
      admin_suspicious: 'Autorell behöver kontrollera annonsuppgifterna manuellt.',
    },
  },
  en: {
    summary: 'Publication is paused while Autorell checks the listing details.',
    nextStep: 'You can edit the listing while the review continues. Complete the details below to make the review easier. Contact support if the phone number belongs only to you.',
    genericReason: 'An automatic check must be confirmed manually before the listing can be published.',
    reasons: {
      missing_vin: 'The vehicle identification number (VIN) is missing. Add it under Edit if available.',
      missing_serial_number: 'The serial number is missing. Add it under Edit if available.',
      unusually_low_price: 'The price differs from similar vehicles and needs confirmation.',
      price_outlier: 'The price differs from similar vehicles and needs confirmation.',
      new_user: 'This is one of the account\'s first listings, so a manual basic check is performed.',
      many_listings_short_time: 'Several listings were created in a short period and need to be reviewed together.',
      same_phone_multiple_accounts: 'The phone number is linked to more than one account and needs a manual ownership check.',
      duplicate_identifier: 'The vehicle identifier is already used by another listing.',
      duplicate_listing: 'The listing resembles an existing listing and needs review.',
      request_info: 'Autorell has requested additional information from you.',
      admin_suspicious: 'Autorell needs to check the listing details manually.',
    },
  },
  de: {
    summary: 'Die Veröffentlichung ist pausiert, während Autorell die Anzeigendaten prüft.',
    nextStep: 'Sie können die Anzeige während der Prüfung bearbeiten. Ergänzen Sie die Angaben unten. Kontaktieren Sie den Support, wenn die Telefonnummer nur Ihnen gehört.',
    genericReason: 'Eine automatische Prüfung muss vor der Veröffentlichung manuell bestätigt werden.',
    reasons: {
      missing_vin: 'Die Fahrzeug-Identifizierungsnummer (FIN/VIN) fehlt. Ergänzen Sie sie unter Bearbeiten, falls verfügbar.',
      missing_serial_number: 'Die Seriennummer fehlt. Ergänzen Sie sie unter Bearbeiten, falls verfügbar.',
      unusually_low_price: 'Der Preis weicht von ähnlichen Fahrzeugen ab und muss bestätigt werden.',
      price_outlier: 'Der Preis weicht von ähnlichen Fahrzeugen ab und muss bestätigt werden.',
      new_user: 'Dies ist eine der ersten Anzeigen des Kontos. Deshalb erfolgt eine manuelle Grundprüfung.',
      many_listings_short_time: 'Mehrere Anzeigen wurden in kurzer Zeit erstellt und werden gemeinsam geprüft.',
      same_phone_multiple_accounts: 'Die Telefonnummer ist mit mehreren Konten verknüpft und erfordert eine manuelle Inhaberprüfung.',
      duplicate_identifier: 'Die Fahrzeugkennung wird bereits in einer anderen Anzeige verwendet.',
      duplicate_listing: 'Die Anzeige ähnelt einer bestehenden Anzeige und muss geprüft werden.',
      request_info: 'Autorell hat zusätzliche Informationen angefordert.',
      admin_suspicious: 'Autorell muss die Anzeigendaten manuell prüfen.',
    },
  },
  fr: {
    summary: 'La publication est suspendue pendant qu’Autorell vérifie les informations de l’annonce.',
    nextStep: 'Vous pouvez modifier l’annonce pendant la vérification. Complétez les informations ci-dessous. Contactez le support si le numéro de téléphone vous appartient exclusivement.',
    genericReason: 'Un contrôle automatique doit être confirmé manuellement avant la publication.',
    reasons: {
      missing_vin: 'Le numéro d’identification du véhicule (VIN) manque. Ajoutez-le dans Modifier s’il est disponible.',
      missing_serial_number: 'Le numéro de série manque. Ajoutez-le dans Modifier s’il est disponible.',
      unusually_low_price: 'Le prix diffère de véhicules similaires et doit être confirmé.',
      price_outlier: 'Le prix diffère de véhicules similaires et doit être confirmé.',
      new_user: 'Il s’agit de l’une des premières annonces du compte, une vérification manuelle est donc effectuée.',
      many_listings_short_time: 'Plusieurs annonces ont été créées rapidement et doivent être vérifiées ensemble.',
      same_phone_multiple_accounts: 'Le numéro de téléphone est lié à plusieurs comptes et nécessite un contrôle manuel du titulaire.',
      duplicate_identifier: 'L’identifiant du véhicule est déjà utilisé dans une autre annonce.',
      duplicate_listing: 'L’annonce ressemble à une annonce existante et doit être vérifiée.',
      request_info: 'Autorell vous a demandé des informations complémentaires.',
      admin_suspicious: 'Autorell doit vérifier manuellement les informations de l’annonce.',
    },
  },
  es: {
    summary: 'La publicación está pausada mientras Autorell comprueba los datos del anuncio.',
    nextStep: 'Puedes editar el anuncio durante la revisión. Completa los datos indicados. Contacta con soporte si el teléfono solo te pertenece a ti.',
    genericReason: 'Una comprobación automática debe confirmarse manualmente antes de publicar el anuncio.',
    reasons: {
      missing_vin: 'Falta el número de identificación del vehículo (VIN). Añádelo en Editar si está disponible.',
      missing_serial_number: 'Falta el número de serie. Añádelo en Editar si está disponible.',
      unusually_low_price: 'El precio difiere del de vehículos similares y debe confirmarse.',
      price_outlier: 'El precio difiere del de vehículos similares y debe confirmarse.',
      new_user: 'Es uno de los primeros anuncios de la cuenta, por lo que se realiza una revisión manual básica.',
      many_listings_short_time: 'Se han creado varios anuncios en poco tiempo y deben revisarse juntos.',
      same_phone_multiple_accounts: 'El teléfono está vinculado a más de una cuenta y necesita una comprobación manual del titular.',
      duplicate_identifier: 'El identificador del vehículo ya se usa en otro anuncio.',
      duplicate_listing: 'El anuncio se parece a otro existente y debe revisarse.',
      request_info: 'Autorell te ha solicitado información adicional.',
      admin_suspicious: 'Autorell debe comprobar manualmente los datos del anuncio.',
    },
  },
  it: {
    summary: 'La pubblicazione è sospesa mentre Autorell verifica i dati dell’annuncio.',
    nextStep: 'Puoi modificare l’annuncio durante la verifica. Completa i dati indicati. Contatta l’assistenza se il numero appartiene solo a te.',
    genericReason: 'Un controllo automatico deve essere confermato manualmente prima della pubblicazione.',
    reasons: {
      missing_vin: 'Manca il numero di identificazione del veicolo (VIN). Aggiungilo in Modifica se disponibile.',
      missing_serial_number: 'Manca il numero di serie. Aggiungilo in Modifica se disponibile.',
      unusually_low_price: 'Il prezzo differisce da veicoli simili e deve essere confermato.',
      price_outlier: 'Il prezzo differisce da veicoli simili e deve essere confermato.',
      new_user: 'Questo è uno dei primi annunci dell’account, quindi viene effettuato un controllo manuale di base.',
      many_listings_short_time: 'Sono stati creati più annunci in poco tempo e devono essere controllati insieme.',
      same_phone_multiple_accounts: 'Il numero di telefono è collegato a più account e richiede un controllo manuale del titolare.',
      duplicate_identifier: 'L’identificativo del veicolo è già usato in un altro annuncio.',
      duplicate_listing: 'L’annuncio è simile a uno esistente e deve essere verificato.',
      request_info: 'Autorell ha richiesto informazioni aggiuntive.',
      admin_suspicious: 'Autorell deve verificare manualmente i dati dell’annuncio.',
    },
  },
  nl: {
    summary: 'Publicatie is gepauzeerd terwijl Autorell de advertentiegegevens controleert.',
    nextStep: 'Je kunt de advertentie tijdens de beoordeling bewerken. Vul de onderstaande gegevens aan. Neem contact op met support als het telefoonnummer alleen van jou is.',
    genericReason: 'Een automatische controle moet handmatig worden bevestigd voordat de advertentie kan worden gepubliceerd.',
    reasons: {
      missing_vin: 'Het voertuigidentificatienummer (VIN) ontbreekt. Voeg dit onder Bewerken toe als het beschikbaar is.',
      missing_serial_number: 'Het serienummer ontbreekt. Voeg dit onder Bewerken toe als het beschikbaar is.',
      unusually_low_price: 'De prijs wijkt af van vergelijkbare voertuigen en moet worden bevestigd.',
      price_outlier: 'De prijs wijkt af van vergelijkbare voertuigen en moet worden bevestigd.',
      new_user: 'Dit is een van de eerste advertenties van het account, daarom voeren we een handmatige basiscontrole uit.',
      many_listings_short_time: 'Er zijn in korte tijd meerdere advertenties geplaatst die samen moeten worden gecontroleerd.',
      same_phone_multiple_accounts: 'Het telefoonnummer is aan meerdere accounts gekoppeld en vereist een handmatige eigenaarscontrole.',
      duplicate_identifier: 'De voertuigidentificatie wordt al in een andere advertentie gebruikt.',
      duplicate_listing: 'De advertentie lijkt op een bestaande advertentie en moet worden gecontroleerd.',
      request_info: 'Autorell heeft aanvullende informatie gevraagd.',
      admin_suspicious: 'Autorell moet de advertentiegegevens handmatig controleren.',
    },
  },
  pl: {
    summary: 'Publikacja jest wstrzymana, gdy Autorell sprawdza dane ogłoszenia.',
    nextStep: 'Możesz edytować ogłoszenie podczas weryfikacji. Uzupełnij poniższe dane. Skontaktuj się z pomocą, jeśli numer telefonu należy wyłącznie do Ciebie.',
    genericReason: 'Automatyczna kontrola musi zostać potwierdzona ręcznie przed publikacją.',
    reasons: {
      missing_vin: 'Brakuje numeru identyfikacyjnego pojazdu (VIN). Dodaj go w Edycji, jeśli jest dostępny.',
      missing_serial_number: 'Brakuje numeru seryjnego. Dodaj go w Edycji, jeśli jest dostępny.',
      unusually_low_price: 'Cena różni się od cen podobnych pojazdów i wymaga potwierdzenia.',
      price_outlier: 'Cena różni się od cen podobnych pojazdów i wymaga potwierdzenia.',
      new_user: 'To jedno z pierwszych ogłoszeń na koncie, dlatego wykonywana jest ręczna kontrola podstawowa.',
      many_listings_short_time: 'W krótkim czasie utworzono kilka ogłoszeń, które trzeba sprawdzić razem.',
      same_phone_multiple_accounts: 'Numer telefonu jest powiązany z więcej niż jednym kontem i wymaga ręcznego potwierdzenia właściciela.',
      duplicate_identifier: 'Identyfikator pojazdu jest już używany w innym ogłoszeniu.',
      duplicate_listing: 'Ogłoszenie przypomina istniejące ogłoszenie i wymaga sprawdzenia.',
      request_info: 'Autorell poprosił o dodatkowe informacje.',
      admin_suspicious: 'Autorell musi ręcznie sprawdzić dane ogłoszenia.',
    },
  },
  fi: {
    summary: 'Julkaisu on keskeytetty, kun Autorell tarkistaa ilmoituksen tiedot.',
    nextStep: 'Voit muokata ilmoitusta tarkistuksen aikana. Täydennä alla olevat tiedot. Ota yhteyttä tukeen, jos puhelinnumero kuuluu vain sinulle.',
    genericReason: 'Automaattinen tarkistus on vahvistettava manuaalisesti ennen julkaisua.',
    reasons: {
      missing_vin: 'Ajoneuvon valmistenumero (VIN) puuttuu. Lisää se Muokkaa-kohdassa, jos se on saatavilla.',
      missing_serial_number: 'Sarjanumero puuttuu. Lisää se Muokkaa-kohdassa, jos se on saatavilla.',
      unusually_low_price: 'Hinta poikkeaa vastaavista ajoneuvoista ja se on vahvistettava.',
      price_outlier: 'Hinta poikkeaa vastaavista ajoneuvoista ja se on vahvistettava.',
      new_user: 'Tämä on yksi tilin ensimmäisistä ilmoituksista, joten sille tehdään manuaalinen perustarkistus.',
      many_listings_short_time: 'Lyhyessä ajassa on luotu useita ilmoituksia, jotka tarkistetaan yhdessä.',
      same_phone_multiple_accounts: 'Puhelinnumero on liitetty useampaan tiliin ja vaatii manuaalisen omistajuuden tarkistuksen.',
      duplicate_identifier: 'Ajoneuvon tunniste on jo käytössä toisessa ilmoituksessa.',
      duplicate_listing: 'Ilmoitus muistuttaa olemassa olevaa ilmoitusta ja se on tarkistettava.',
      request_info: 'Autorell on pyytänyt sinulta lisätietoja.',
      admin_suspicious: 'Autorellin on tarkistettava ilmoituksen tiedot manuaalisesti.',
    },
  },
  da: {
    summary: 'Publiceringen er sat på pause, mens Autorell kontrollerer annonceoplysningerne.',
    nextStep: 'Du kan redigere annoncen under kontrollen. Udfyld oplysningerne nedenfor. Kontakt support, hvis telefonnummeret kun tilhører dig.',
    genericReason: 'En automatisk kontrol skal bekræftes manuelt, før annoncen kan offentliggøres.',
    reasons: {
      missing_vin: 'Køretøjets stelnummer (VIN) mangler. Tilføj det under Rediger, hvis det er tilgængeligt.',
      missing_serial_number: 'Serienummeret mangler. Tilføj det under Rediger, hvis det er tilgængeligt.',
      unusually_low_price: 'Prisen afviger fra lignende køretøjer og skal bekræftes.',
      price_outlier: 'Prisen afviger fra lignende køretøjer og skal bekræftes.',
      new_user: 'Dette er en af kontoens første annoncer, og derfor udføres en manuel grundkontrol.',
      many_listings_short_time: 'Flere annoncer er oprettet på kort tid og skal kontrolleres samlet.',
      same_phone_multiple_accounts: 'Telefonnummeret er knyttet til mere end én konto og kræver en manuel ejerskabskontrol.',
      duplicate_identifier: 'Køretøjets identifikator bruges allerede i en anden annonce.',
      duplicate_listing: 'Annoncen ligner en eksisterende annonce og skal kontrolleres.',
      request_info: 'Autorell har bedt dig om yderligere oplysninger.',
      admin_suspicious: 'Autorell skal kontrollere annonceoplysningerne manuelt.',
    },
  },
}

export function listingReviewNotice(
  locale: PublicLocale,
  riskFlags: string[],
): ListingReviewNotice {
  const copy = copies[translationLocale(locale)] || copies.en
  const reasons = Array.from(new Set(
    riskFlags.map((flag) => copy.reasons[flag] || copy.genericReason),
  ))

  return {
    summary: copy.summary,
    reasons: reasons.length ? reasons : [copy.genericReason],
    nextStep: copy.nextStep,
  }
}
