import {
  billingProductCatalog,
  formatMoneyMinor,
  getProductAmount,
  listingCategoryLabels,
  type BillingMarket,
  type ListingCategory,
} from '@/lib/billing/product-catalog'
import { localizePublicHref, translatePublic, translationLocale, type PublicLocale } from '@/lib/public-i18n'

export type HelpCenterCategoryId =
  | 'advertising'
  | 'account'
  | 'payment'
  | 'business'
  | 'safety'
  | 'export'

export type HelpCenterFilterId =
  | 'all'
  | 'account'
  | 'listings'
  | 'buying'
  | 'export'
  | 'pricing'
  | 'messages'
  | 'safety'
  | 'business'
  | 'language'

export type LocalizedText = {
  sv: string
  en: string
  de: string
} & Partial<Record<PublicLocale, string>>

export type HelpCenterArticle = {
  slug: string
  category: HelpCenterCategoryId
  title: LocalizedText
  summary: LocalizedText
  keywords: string[]
  body: LocalizedText[]
  related?: string[]
  pricingTable?: true
}

export const helpCenterCategories: Array<{
  id: HelpCenterCategoryId
  slug: string
  title: LocalizedText
  description: LocalizedText
}> = [
  {
    id: 'advertising',
    slug: 'advertising',
    title: { sv: 'Annonsering', en: 'Listing ads', de: 'Inserieren' },
    description: {
      sv: 'Skapa, ändra och publicera annonser för fordon.',
      en: 'Create, edit and publish vehicle listings.',
      de: 'Fahrzeuganzeigen erstellen, bearbeiten und veröffentlichen.',
    },
  },
  {
    id: 'account',
    slug: 'account',
    title: { sv: 'Konto & inloggning', en: 'Account & sign-in', de: 'Konto & Anmeldung' },
    description: {
      sv: 'Hjälp med konto, inloggning och kontaktuppgifter.',
      en: 'Help with accounts, sign-in and contact details.',
      de: 'Hilfe zu Konto, Anmeldung und Kontaktdaten.',
    },
  },
  {
    id: 'payment',
    slug: 'payment',
    title: { sv: 'Betalning', en: 'Payment', de: 'Zahlung' },
    description: {
      sv: 'Priser, betalning, kvitton och återbetalningar.',
      en: 'Pricing, payment, receipts and refunds.',
      de: 'Preise, Zahlung, Belege und Erstattungen.',
    },
  },
  {
    id: 'business',
    slug: 'business',
    title: { sv: 'För företag', en: 'For businesses', de: 'Für Unternehmen' },
    description: {
      sv: 'Företagskonto, lager, team och abonnemang.',
      en: 'Business accounts, inventory, teams and subscriptions.',
      de: 'Firmenkonto, Bestand, Teams und Abonnements.',
    },
  },
  {
    id: 'safety',
    slug: 'safety',
    title: { sv: 'Kundsäkerhet', en: 'Customer safety', de: 'Kundensicherheit' },
    description: {
      sv: 'Trygga affärer, verifiering och rapportering.',
      en: 'Safe deals, verification and reporting.',
      de: 'Sichere Geschäfte, Verifizierung und Meldungen.',
    },
  },
  {
    id: 'export',
    slug: 'export-transport',
    title: { sv: 'Export & transport', en: 'Export & transport', de: 'Export & Transport' },
    description: {
      sv: 'Dokument, hämtning och affärer över landsgränser.',
      en: 'Documents, pickup and cross-border deals.',
      de: 'Dokumente, Abholung und grenzüberschreitende Geschäfte.',
    },
  },
]

export const helpCenterFilters: Array<{ id: HelpCenterFilterId; title: LocalizedText }> = [
  { id: 'all', title: { sv: 'Alla', en: 'All', de: 'Alle' } },
  { id: 'account', title: { sv: 'Konton', en: 'Accounts', de: 'Konten' } },
  { id: 'listings', title: { sv: 'Annonser', en: 'Listings', de: 'Anzeigen' } },
  { id: 'buying', title: { sv: 'Köp', en: 'Buying', de: 'Kaufen' } },
  { id: 'export', title: { sv: 'Export & import', en: 'Export & import', de: 'Export & Import' } },
  { id: 'pricing', title: { sv: 'Priser', en: 'Pricing', de: 'Preise' } },
  { id: 'messages', title: { sv: 'Meddelanden', en: 'Messages', de: 'Nachrichten' } },
  { id: 'safety', title: { sv: 'Trygghet', en: 'Safety', de: 'Sicherheit' } },
  { id: 'business', title: { sv: 'Företag', en: 'Business', de: 'Unternehmen' } },
  { id: 'language', title: { sv: 'Språk', en: 'Language', de: 'Sprache' } },
]

export const helpCenterArticles: HelpCenterArticle[] = [
  article('create-listing', 'advertising', 'Så skapar du en annons', 'Create a listing', 'Anzeige erstellen', 'Lägg in kategori, uppgifter, bilder och pris innan annonsen skickas för publicering.', 'Add category, details, images and price before the listing is submitted for publishing.', 'Kategorie, Daten, Bilder und Preis erfassen, bevor die Anzeige veröffentlicht wird.', ['skapa annons', 'listing']),
  article('edit-listing', 'advertising', 'Ändra en publicerad annons', 'Edit a published listing', 'Veröffentlichte Anzeige bearbeiten', 'Du kan uppdatera pris, text, bilder och flera fordonsuppgifter från ditt konto.', 'You can update price, text, images and several vehicle details from your account.', 'Preis, Text, Bilder und mehrere Fahrzeugdaten können im Konto aktualisiert werden.', ['redigera', 'bilder']),
  article('listing-review', 'advertising', 'Granskning av annonser', 'Listing review', 'Anzeigenprüfung', 'Vissa ändringar kan granskas innan de visas publikt för att skydda köpare och säljare.', 'Some changes may be reviewed before they appear publicly to protect buyers and sellers.', 'Einige Änderungen können geprüft werden, bevor sie öffentlich sichtbar sind.', ['granskning', 'publicering']),
  article('passwordless-login', 'account', 'Logga in utan lösenord', 'Sign in without a password', 'Ohne Passwort anmelden', 'Ange e-postadressen i inloggningsrutan. Autorell skickar en engångskod till mejlen.', 'Enter your email address in the sign-in window. Autorell sends a one-time code by email.', 'Geben Sie Ihre E-Mail-Adresse ein. Autorell sendet einen Einmalcode per E-Mail.', ['login', 'kod']),
  article('private-business-account', 'account', 'Privatkonto eller företagskonto', 'Private or business account', 'Privat- oder Firmenkonto', 'Privatkonto används av privatpersoner. Företagskonto är byggt för handlare, team och återkommande annonsering.', 'Private accounts are for individuals. Business accounts are built for dealers, teams and recurring listings.', 'Privatkonten sind für Personen. Firmenkonten sind für Händler, Teams und wiederkehrende Anzeigen.', ['konto', 'företag']),
  article('contact-details', 'account', 'Uppdatera kontaktuppgifter', 'Update contact details', 'Kontaktdaten aktualisieren', 'Håll e-post, telefonnummer, namn, land och företagsinformation korrekt för support och betalning.', 'Keep email, phone, name, country and company details correct for support and payment.', 'Halten Sie E-Mail, Telefon, Name, Land und Firmendaten aktuell.', ['kontakt']),
  {
    ...article('private-listing-prices', 'payment', 'Priser för privatannonser', 'Private listing prices', 'Preise für private Anzeigen', 'Grundannonsen är gratis. Längre annonstid och extra synlighet visar samma lokala pris som i checkout.', 'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.', 'Die Basisanzeige ist kostenlos. Längere Laufzeit und mehr Sichtbarkeit zeigen denselben lokalen Preis wie im Checkout.', ['pris', 'betalning', 'checkout']),
    pricingTable: true,
    related: ['payment-refunds', 'create-listing', 'business-subscriptions'],
  },
  article('payment-refunds', 'payment', 'Betalning och återbetalning', 'Payment and refunds', 'Zahlung und Erstattung', 'Kontakta support med annons-ID, betalningsreferens och belopp om en betalning blivit fel.', 'Contact support with listing ID, payment reference and amount if a payment is incorrect.', 'Kontaktieren Sie den Support mit Anzeigen-ID, Zahlungsreferenz und Betrag.', ['återbetalning', 'kvitto']),
  article('receipts', 'payment', 'Kvitton och betalningshistorik', 'Receipts and payment history', 'Belege und Zahlungshistorie', 'Betalningar kopplas till ditt konto och relevanta annonsreferenser.', 'Payments are connected to your account and relevant listing references.', 'Zahlungen sind mit Ihrem Konto und relevanten Anzeigenreferenzen verbunden.', ['kvitto', 'betalning']),
  article('business-subscriptions', 'business', 'Företagsabonnemang', 'Business subscriptions', 'Firmenabonnements', 'Företagsplaner styr antal aktiva annonser, teamfunktioner och verktyg för lager.', 'Business plans control active listing limits, team features and inventory tools.', 'Firmenpläne steuern aktive Anzeigen, Teamfunktionen und Bestandswerkzeuge.', ['abonnemang', 'planer']),
  businessArticle(
    'inventory-listings',
    {
      sv: 'Lager och annonser',
      en: 'Inventory and listings',
      de: 'Bestand und Anzeigen',
      fr: 'Stock et annonces',
      es: 'Inventario y anuncios',
      it: 'Inventario e annunci',
      pl: 'Zapasy i ogłoszenia',
      nl: 'Voorraad en advertenties',
      be: 'Voorraad en advertenties',
      fi: 'Varasto ja ilmoitukset',
      da: 'Lager og annoncer',
      at: 'Bestand und Anzeigen',
    },
    {
      sv: 'Så hanterar företag flera fordon, aktiva annonser, status och uppföljning i Autorell.',
      en: 'How companies manage multiple vehicles, active listings, status and follow-up in Autorell.',
      de: 'So verwalten Unternehmen mehrere Fahrzeuge, aktive Anzeigen, Status und Nachverfolgung in Autorell.',
      fr: 'Comment les entreprises gèrent plusieurs véhicules, annonces actives, statuts et suivi dans Autorell.',
      es: 'Cómo las empresas gestionan vehículos, anuncios activos, estados y seguimiento en Autorell.',
      it: 'Come le aziende gestiscono veicoli, annunci attivi, stati e follow-up in Autorell.',
      pl: 'Jak firmy zarządzają pojazdami, aktywnymi ogłoszeniami, statusem i kontrolą w Autorell.',
      nl: 'Hoe bedrijven meerdere voertuigen, actieve advertenties, status en opvolging beheren in Autorell.',
      be: 'Hoe bedrijven meerdere voertuigen, actieve advertenties, status en opvolging beheren in Autorell.',
      fi: 'Näin yritykset hallitsevat useita ajoneuvoja, aktiivisia ilmoituksia, tilaa ja seurantaa Autorellissa.',
      da: 'Sådan håndterer virksomheder flere køretøjer, aktive annoncer, status og opfølgning i Autorell.',
      at: 'So verwalten Unternehmen mehrere Fahrzeuge, aktive Anzeigen, Status und Nachverfolgung in Autorell.',
    },
    [
      {
        sv: 'Företagskontot samlar era annonser på ett ställe. Ni kan publicera, pausa, uppdatera pris, följa status och se vilka annonser som behöver kompletteras.',
        en: 'The business account keeps your listings in one place. You can publish, pause, update prices, follow status and see which listings need more information.',
        de: 'Das Firmenkonto bündelt Ihre Anzeigen an einem Ort. Sie können veröffentlichen, pausieren, Preise aktualisieren, Status verfolgen und fehlende Angaben erkennen.',
        fr: 'Le compte entreprise rassemble vos annonces. Vous pouvez publier, mettre en pause, modifier les prix, suivre les statuts et voir les annonces à compléter.',
        es: 'La cuenta de empresa reúne tus anuncios. Puedes publicar, pausar, actualizar precios, seguir estados y ver qué anuncios necesitan más datos.',
        it: 'L’account aziendale riunisce gli annunci. Puoi pubblicare, mettere in pausa, aggiornare prezzi, seguire lo stato e vedere cosa va completato.',
        pl: 'Konto firmowe zbiera ogłoszenia w jednym miejscu. Możesz publikować, wstrzymywać, zmieniać ceny, śledzić status i uzupełniać braki.',
        nl: 'Het bedrijfsaccount bundelt je advertenties. Je kunt publiceren, pauzeren, prijzen aanpassen, status volgen en ontbrekende gegevens zien.',
        be: 'Het bedrijfsaccount bundelt je advertenties. Je kunt publiceren, pauzeren, prijzen aanpassen, status volgen en ontbrekende gegevens zien.',
        fi: 'Yritystili kokoaa ilmoitukset yhteen paikkaan. Voitte julkaista, keskeyttää, päivittää hintoja, seurata tilaa ja täydentää tietoja.',
        da: 'Virksomhedskontoen samler annoncerne. I kan publicere, pause, opdatere priser, følge status og se hvilke annoncer der mangler oplysninger.',
        at: 'Das Firmenkonto bündelt Ihre Anzeigen an einem Ort. Sie können veröffentlichen, pausieren, Preise aktualisieren, Status verfolgen und fehlende Angaben erkennen.',
      },
      {
        sv: 'Välj plan efter hur många aktiva annonser ni behöver samtidigt. Större team kan använda fler användare och mer strukturerad lagerhantering.',
        en: 'Choose a plan based on how many active listings you need at the same time. Larger teams can use more users and more structured inventory handling.',
        de: 'Wählen Sie den Tarif nach der Anzahl gleichzeitig aktiver Anzeigen. Größere Teams können mehr Nutzer und strukturiertere Bestandsverwaltung nutzen.',
        fr: 'Choisissez une offre selon le nombre d’annonces actives nécessaires. Les grandes équipes disposent de plus d’utilisateurs et d’une gestion plus structurée.',
        es: 'Elige el plan según los anuncios activos necesarios. Los equipos grandes pueden usar más usuarios y una gestión de inventario más estructurada.',
        it: 'Scegli il piano in base agli annunci attivi necessari. I team più grandi possono usare più utenti e una gestione inventario più strutturata.',
        pl: 'Wybierz plan według liczby aktywnych ogłoszeń. Większe zespoły mogą korzystać z większej liczby użytkowników i lepszej organizacji zapasów.',
        nl: 'Kies een plan op basis van het aantal actieve advertenties. Grotere teams kunnen meer gebruikers en gestructureerder voorraadbeheer gebruiken.',
        be: 'Kies een plan op basis van het aantal actieve advertenties. Grotere teams kunnen meer gebruikers en gestructureerder voorraadbeheer gebruiken.',
        fi: 'Valitkaa paketti aktiivisten ilmoitusten määrän mukaan. Suuremmat tiimit saavat enemmän käyttäjiä ja jäsennellymmän varastonhallinnan.',
        da: 'Vælg plan efter antal aktive annoncer. Større teams kan bruge flere brugere og mere struktureret lagerhåndtering.',
        at: 'Wählen Sie den Tarif nach der Anzahl gleichzeitig aktiver Anzeigen. Größere Teams können mehr Nutzer und strukturiertere Bestandsverwaltung nutzen.',
      },
    ],
    ['lager', 'annonser', 'inventory'],
    ['business-subscriptions', 'business-integrations', 'business-help'],
  ),
  businessArticle(
    'dealer-offers-buying',
    {
      sv: 'Köp bilar och Dealer Offers',
      en: 'Buy cars and Dealer Offers',
      de: 'Autos kaufen und Dealer Offers',
      fr: 'Acheter des voitures et Dealer Offers',
      es: 'Comprar coches y Dealer Offers',
      it: 'Acquisto auto e Dealer Offers',
      pl: 'Zakup aut i Dealer Offers',
      nl: 'Auto’s kopen en Dealer Offers',
      be: 'Auto’s kopen en Dealer Offers',
      fi: 'Autojen osto ja Dealer Offers',
      da: 'Køb biler og Dealer Offers',
      at: 'Autos kaufen und Dealer Offers',
    },
    {
      sv: 'Så använder företag marknadsplatsen och Dealer Offers för att hitta relevanta fordon.',
      en: 'How companies use the marketplace and Dealer Offers to find relevant vehicles.',
      de: 'So nutzen Unternehmen den Marktplatz und Dealer Offers, um passende Fahrzeuge zu finden.',
      fr: 'Comment les entreprises utilisent la marketplace et Dealer Offers pour trouver les bons véhicules.',
      es: 'Cómo las empresas usan el marketplace y Dealer Offers para encontrar vehículos relevantes.',
      it: 'Come le aziende usano marketplace e Dealer Offers per trovare veicoli pertinenti.',
      pl: 'Jak firmy używają marketplace i Dealer Offers, aby znaleźć właściwe pojazdy.',
      nl: 'Hoe bedrijven de marktplaats en Dealer Offers gebruiken om relevante voertuigen te vinden.',
      be: 'Hoe bedrijven de marktplaats en Dealer Offers gebruiken om relevante voertuigen te vinden.',
      fi: 'Näin yritykset käyttävät markkinapaikkaa ja Dealer Offers -toimintoa sopivien ajoneuvojen löytämiseen.',
      da: 'Sådan bruger virksomheder markedspladsen og Dealer Offers til at finde relevante køretøjer.',
      at: 'So nutzen Unternehmen den Marktplatz und Dealer Offers, um passende Fahrzeuge zu finden.',
    },
    [
      {
        sv: 'Företag kan söka fordon på marknadsplatsen med filter för kategori, marknad, pris, skick och säljartyp. Sparade sökningar hjälper teamet att följa nytt lager.',
        en: 'Companies can search the marketplace with filters for category, market, price, condition and seller type. Saved searches help the team follow new stock.',
        de: 'Unternehmen können mit Filtern für Kategorie, Markt, Preis, Zustand und Verkäufertyp suchen. Gespeicherte Suchen helfen beim Verfolgen neuer Bestände.',
        fr: 'Les entreprises peuvent filtrer par catégorie, marché, prix, état et type de vendeur. Les recherches sauvegardées aident à suivre les nouveaux stocks.',
        es: 'Las empresas pueden filtrar por categoría, mercado, precio, estado y tipo de vendedor. Las búsquedas guardadas ayudan a seguir nuevo stock.',
        it: 'Le aziende possono filtrare per categoria, mercato, prezzo, stato e tipo di venditore. Le ricerche salvate aiutano a seguire nuovi stock.',
        pl: 'Firmy mogą filtrować według kategorii, rynku, ceny, stanu i typu sprzedawcy. Zapisane wyszukiwania pomagają śledzić nowe pojazdy.',
        nl: 'Bedrijven kunnen filteren op categorie, markt, prijs, staat en verkopertype. Opgeslagen zoekopdrachten helpen nieuw aanbod volgen.',
        be: 'Bedrijven kunnen filteren op categorie, markt, prijs, staat en verkopertype. Opgeslagen zoekopdrachten helpen nieuw aanbod volgen.',
        fi: 'Yritykset voivat suodattaa kategorian, markkinan, hinnan, kunnon ja myyjätyypin mukaan. Tallennetut haut auttavat seuraamaan uutta tarjontaa.',
        da: 'Virksomheder kan filtrere efter kategori, marked, pris, stand og sælgertype. Gemte søgninger hjælper teamet med at følge nyt lager.',
        at: 'Unternehmen können mit Filtern für Kategorie, Markt, Preis, Zustand und Verkäufertyp suchen. Gespeicherte Suchen helfen beim Verfolgen neuer Bestände.',
      },
      {
        sv: 'Dealer Offers används när säljaren vill ta emot intresse från handlare. Svara tydligt, kontrollera fordonsdata och bekräfta villkor innan affär.',
        en: 'Dealer Offers are used when a seller wants interest from dealers. Reply clearly, check vehicle data and confirm terms before a deal.',
        de: 'Dealer Offers werden genutzt, wenn Verkäufer Händlerinteresse wünschen. Antworten Sie klar, prüfen Sie Fahrzeugdaten und bestätigen Sie Konditionen.',
        fr: 'Dealer Offers sert lorsqu’un vendeur veut recevoir l’intérêt de professionnels. Répondez clairement, vérifiez les données et confirmez les conditions.',
        es: 'Dealer Offers se usa cuando un vendedor quiere interés de concesionarios. Responde claramente, revisa datos y confirma condiciones.',
        it: 'Dealer Offers si usa quando un venditore vuole ricevere interesse dai concessionari. Rispondi chiaramente, verifica i dati e conferma le condizioni.',
        pl: 'Dealer Offers działa, gdy sprzedający chce otrzymać zainteresowanie od dealerów. Odpowiadaj jasno, sprawdź dane i potwierdź warunki.',
        nl: 'Dealer Offers wordt gebruikt wanneer een verkoper interesse van dealers wil ontvangen. Reageer duidelijk, controleer voertuigdata en bevestig voorwaarden.',
        be: 'Dealer Offers wordt gebruikt wanneer een verkoper interesse van dealers wil ontvangen. Reageer duidelijk, controleer voertuigdata en bevestig voorwaarden.',
        fi: 'Dealer Offers auttaa, kun myyjä haluaa kiinnostusta liikkeiltä. Vastatkaa selkeästi, tarkistakaa ajoneuvotiedot ja vahvistakaa ehdot.',
        da: 'Dealer Offers bruges, når sælger ønsker interesse fra forhandlere. Svar tydeligt, kontroller køretøjsdata og bekræft vilkår.',
        at: 'Dealer Offers werden genutzt, wenn Verkäufer Händlerinteresse wünschen. Antworten Sie klar, prüfen Sie Fahrzeugdaten und bestätigen Sie Konditionen.',
      },
    ],
    ['köp', 'dealer offers', 'bilar'],
    ['safe-deals', 'business-subscriptions', 'business-help'],
  ),
  businessArticle(
    'business-integrations',
    {
      sv: 'Integrationer',
      en: 'Integrations',
      de: 'Integrationen',
      fr: 'Intégrations',
      es: 'Integraciones',
      it: 'Integrazioni',
      pl: 'Integracje',
      nl: 'Integraties',
      be: 'Integraties',
      fi: 'Integraatiot',
      da: 'Integrationer',
      at: 'Integrationen',
    },
    {
      sv: 'Så kopplas lagerflöden, importfiler och tekniska processer till Autorell.',
      en: 'How inventory feeds, import files and technical workflows connect to Autorell.',
      de: 'Wie Bestandsfeeds, Importdateien und technische Abläufe mit Autorell verbunden werden.',
      fr: 'Comment les flux de stock, fichiers d’import et processus techniques se connectent à Autorell.',
      es: 'Cómo se conectan feeds de inventario, archivos de importación y procesos técnicos con Autorell.',
      it: 'Come collegare feed inventario, file di importazione e processi tecnici ad Autorell.',
      pl: 'Jak połączyć z Autorell feedy zapasów, pliki importu i procesy techniczne.',
      nl: 'Hoe voorraadfeeds, importbestanden en technische processen op Autorell aansluiten.',
      be: 'Hoe voorraadfeeds, importbestanden en technische processen op Autorell aansluiten.',
      fi: 'Näin varastosyötteet, tuontitiedostot ja tekniset prosessit liitetään Autorelliin.',
      da: 'Sådan kobles lagerfeeds, importfiler og tekniske processer til Autorell.',
      at: 'Wie Bestandsfeeds, Importdateien und technische Abläufe mit Autorell verbunden werden.',
    },
    [
      {
        sv: 'Integrationer används när ett företag vill uppdatera många annonser från befintliga system. Autorell kan arbeta med strukturerade filer och anpassade flöden beroende på plan.',
        en: 'Integrations are used when a company wants to update many listings from existing systems. Autorell can work with structured files and tailored flows depending on the plan.',
        de: 'Integrationen werden genutzt, wenn ein Unternehmen viele Anzeigen aus bestehenden Systemen aktualisieren möchte. Autorell kann je nach Tarif mit strukturierten Dateien und angepassten Abläufen arbeiten.',
        fr: 'Les intégrations servent à mettre à jour de nombreuses annonces depuis des systèmes existants. Autorell peut utiliser des fichiers structurés et des flux adaptés selon l’offre.',
        es: 'Las integraciones sirven para actualizar muchos anuncios desde sistemas existentes. Autorell puede trabajar con archivos estructurados y flujos adaptados según el plan.',
        it: 'Le integrazioni servono per aggiornare molti annunci da sistemi esistenti. Autorell può usare file strutturati e flussi su misura in base al piano.',
        pl: 'Integracje służą do aktualizacji wielu ogłoszeń z istniejących systemów. Autorell może pracować z plikami strukturalnymi i dopasowanymi przepływami.',
        nl: 'Integraties zijn bedoeld om veel advertenties vanuit bestaande systemen bij te werken. Autorell kan werken met gestructureerde bestanden en aangepaste stromen.',
        be: 'Integraties zijn bedoeld om veel advertenties vanuit bestaande systemen bij te werken. Autorell kan werken met gestructureerde bestanden en aangepaste stromen.',
        fi: 'Integraatioita käytetään, kun yritys haluaa päivittää useita ilmoituksia olemassa olevista järjestelmistä. Autorell tukee rakenteisia tiedostoja ja räätälöityjä virtoja.',
        da: 'Integrationer bruges, når en virksomhed vil opdatere mange annoncer fra eksisterende systemer. Autorell kan arbejde med strukturerede filer og tilpassede flows.',
        at: 'Integrationen werden genutzt, wenn ein Unternehmen viele Anzeigen aus bestehenden Systemen aktualisieren möchte. Autorell kann je nach Tarif mit strukturierten Dateien und angepassten Abläufen arbeiten.',
      },
      {
        sv: 'Förbered tydliga fält för kategori, pris, bilder, registreringsdata, plats och status. Det gör importen snabbare och minskar behovet av manuell korrigering.',
        en: 'Prepare clear fields for category, price, images, registration data, location and status. This makes import faster and reduces manual corrections.',
        de: 'Bereiten Sie klare Felder für Kategorie, Preis, Bilder, Zulassungsdaten, Standort und Status vor. Das beschleunigt den Import und reduziert Korrekturen.',
        fr: 'Préparez les champs catégorie, prix, images, données d’immatriculation, lieu et statut. L’import sera plus rapide et nécessitera moins de corrections.',
        es: 'Prepara campos claros para categoría, precio, imágenes, datos de registro, ubicación y estado. La importación será más rápida y con menos correcciones.',
        it: 'Prepara campi chiari per categoria, prezzo, immagini, dati di immatricolazione, località e stato. L’import sarà più rapido e con meno correzioni.',
        pl: 'Przygotuj pola kategorii, ceny, zdjęć, danych rejestracyjnych, lokalizacji i statusu. Import będzie szybszy i wymaga mniej poprawek.',
        nl: 'Bereid duidelijke velden voor categorie, prijs, beelden, registratiegegevens, locatie en status voor. Zo gaat import sneller en zijn minder correcties nodig.',
        be: 'Bereid duidelijke velden voor categorie, prijs, beelden, registratiegegevens, locatie en status voor. Zo gaat import sneller en zijn minder correcties nodig.',
        fi: 'Valmistelkaa selkeät kentät kategorialle, hinnalle, kuville, rekisteritiedoille, sijainnille ja tilalle. Tuonti nopeutuu ja korjaukset vähenevät.',
        da: 'Forbered tydelige felter for kategori, pris, billeder, registreringsdata, placering og status. Det gør importen hurtigere og mindsker rettelser.',
        at: 'Bereiten Sie klare Felder für Kategorie, Preis, Bilder, Zulassungsdaten, Standort und Status vor. Das beschleunigt den Import und reduziert Korrekturen.',
      },
    ],
    ['integration', 'import', 'feed'],
    ['inventory-listings', 'business-subscriptions', 'business-help'],
  ),
  businessArticle(
    'business-help',
    {
      sv: 'Företagshjälp',
      en: 'Business help',
      de: 'Unternehmenshilfe',
      fr: 'Aide aux entreprises',
      es: 'Ayuda para empresas',
      it: 'Aiuto per aziende',
      pl: 'Pomoc dla firm',
      nl: 'Hulp voor bedrijven',
      be: 'Hulp voor bedrijven',
      fi: 'Yritysapu',
      da: 'Virksomhedshjælp',
      at: 'Unternehmenshilfe',
    },
    {
      sv: 'Så får företag hjälp med konto, planer, import, annonser och pågående ärenden.',
      en: 'How companies get help with accounts, plans, imports, listings and ongoing cases.',
      de: 'So erhalten Unternehmen Hilfe zu Konto, Tarifen, Import, Anzeigen und laufenden Fällen.',
      fr: 'Comment les entreprises obtiennent de l’aide pour comptes, offres, imports, annonces et dossiers.',
      es: 'Cómo las empresas reciben ayuda con cuentas, planes, importaciones, anuncios y casos abiertos.',
      it: 'Come le aziende ricevono aiuto su account, piani, import, annunci e casi aperti.',
      pl: 'Jak firmy otrzymują pomoc dotyczącą kont, planów, importu, ogłoszeń i spraw.',
      nl: 'Hoe bedrijven hulp krijgen bij accounts, plannen, import, advertenties en lopende zaken.',
      be: 'Hoe bedrijven hulp krijgen bij accounts, plannen, import, advertenties en lopende zaken.',
      fi: 'Näin yritykset saavat apua tileihin, paketteihin, tuonteihin, ilmoituksiin ja asioihin.',
      da: 'Sådan får virksomheder hjælp til konto, planer, import, annoncer og igangværende sager.',
      at: 'So erhalten Unternehmen Hilfe zu Konto, Tarifen, Import, Anzeigen und laufenden Fällen.',
    },
    [
      {
        sv: 'Kontakta Autorell med företagsnamn, konto-e-post, marknad och en kort beskrivning av ärendet. Lägg till annons-ID, importfil eller fakturareferens när det finns.',
        en: 'Contact Autorell with company name, account email, market and a short case description. Add listing ID, import file or invoice reference when available.',
        de: 'Kontaktieren Sie Autorell mit Firmenname, Konto-E-Mail, Markt und kurzer Beschreibung. Fügen Sie Anzeigen-ID, Importdatei oder Rechnungsreferenz hinzu.',
        fr: 'Contactez Autorell avec le nom de l’entreprise, l’e-mail du compte, le marché et une brève description. Ajoutez ID d’annonce, fichier ou référence facture.',
        es: 'Contacta con Autorell indicando empresa, correo de cuenta, mercado y una breve descripción. Añade ID de anuncio, archivo o referencia de factura.',
        it: 'Contatta Autorell con nome azienda, e-mail account, mercato e breve descrizione. Aggiungi ID annuncio, file import o riferimento fattura.',
        pl: 'Skontaktuj się z Autorell, podając firmę, e-mail konta, rynek i krótki opis. Dodaj ID ogłoszenia, plik importu lub numer faktury.',
        nl: 'Neem contact op met Autorell met bedrijfsnaam, accountmail, markt en korte omschrijving. Voeg advertentie-ID, importbestand of factuurreferentie toe.',
        be: 'Neem contact op met Autorell met bedrijfsnaam, accountmail, markt en korte omschrijving. Voeg advertentie-ID, importbestand of factuurreferentie toe.',
        fi: 'Ottakaa yhteyttä Autorelliin yrityksen nimellä, tilin sähköpostilla, markkinalla ja lyhyellä kuvauksella. Lisää ilmoitus-ID, tuontitiedosto tai laskuviite.',
        da: 'Kontakt Autorell med virksomhedsnavn, konto-e-mail, marked og kort beskrivelse. Tilføj annonce-ID, importfil eller fakturareference når muligt.',
        at: 'Kontaktieren Sie Autorell mit Firmenname, Konto-E-Mail, Markt und kurzer Beschreibung. Fügen Sie Anzeigen-ID, Importdatei oder Rechnungsreferenz hinzu.',
      },
      {
        sv: 'För snabbare hjälp bör den som kontaktar oss ha rätt behörighet i företagskontot eller kunna visa att personen representerar företaget.',
        en: 'For faster help, the person contacting us should have the right permission in the business account or show that they represent the company.',
        de: 'Für schnellere Hilfe sollte die kontaktierende Person die passende Berechtigung im Firmenkonto haben oder die Vertretung des Unternehmens nachweisen.',
        fr: 'Pour une aide plus rapide, la personne doit avoir le bon accès au compte entreprise ou prouver qu’elle représente l’entreprise.',
        es: 'Para recibir ayuda más rápido, la persona debe tener permiso en la cuenta de empresa o demostrar que representa a la empresa.',
        it: 'Per ricevere aiuto più rapidamente, chi contatta deve avere permessi nell’account aziendale o dimostrare di rappresentare l’azienda.',
        pl: 'Aby uzyskać szybszą pomoc, osoba kontaktowa powinna mieć uprawnienia na koncie firmowym albo potwierdzić reprezentowanie firmy.',
        nl: 'Voor snellere hulp moet de contactpersoon rechten in het bedrijfsaccount hebben of kunnen aantonen dat die het bedrijf vertegenwoordigt.',
        be: 'Voor snellere hulp moet de contactpersoon rechten in het bedrijfsaccount hebben of kunnen aantonen dat die het bedrijf vertegenwoordigt.',
        fi: 'Nopeampaa apua varten yhteydenottajalla tulisi olla oikea käyttöoikeus yritystilillä tai näyttö yrityksen edustamisesta.',
        da: 'For hurtigere hjælp bør kontaktpersonen have den rette adgang i virksomhedskontoen eller kunne vise, at personen repræsenterer virksomheden.',
        at: 'Für schnellere Hilfe sollte die kontaktierende Person die passende Berechtigung im Firmenkonto haben oder die Vertretung des Unternehmens nachweisen.',
      },
    ],
    ['företagshjälp', 'support', 'konto'],
    ['business-subscriptions', 'inventory-listings', 'business-integrations'],
  ),
  article('company-inventory', 'business', 'Lager och flera annonser', 'Inventory and multiple listings', 'Bestand und mehrere Anzeigen', 'Företagskonton kan hantera återkommande annonsering och större lagerflöden.', 'Business accounts can manage recurring listings and larger inventory flows.', 'Firmenkonten können wiederkehrende Anzeigen und größere Bestände verwalten.', ['lager', 'import']),
  article('business-verification', 'business', 'Verifiera företagsuppgifter', 'Verify company details', 'Firmendaten verifizieren', 'Verifiering gör företagsinformationen tydligare men ersätter inte köparens egen kontroll.', 'Verification makes company details clearer but does not replace the buyer’s own checks.', 'Verifizierung macht Firmendaten klarer, ersetzt aber nicht die eigene Prüfung.', ['verifiering']),
  article('safe-deals', 'safety', 'Kontrollera innan du köper', 'Check before buying', 'Vor dem Kauf prüfen', 'Kontrollera identitet, dokument, VIN eller serienummer, historik, bilder och rimligt pris.', 'Check identity, documents, VIN or serial number, history, images and reasonable price.', 'Prüfen Sie Identität, Dokumente, VIN oder Seriennummer, Historie, Bilder und plausiblen Preis.', ['trygghet', 'köp']),
  article('report-fraud', 'safety', 'Rapportera bedrägeri eller falsk annons', 'Report fraud or a fake listing', 'Betrug oder falsche Anzeige melden', 'Använd Rapportera problem och ange annons-ID, motpart, datum och betalningsreferens när det finns.', 'Use Report a problem and include listing ID, counterparty, date and payment reference when available.', 'Nutzen Sie Problem melden und geben Sie Anzeigen-ID, Gegenpartei, Datum und Zahlungsreferenz an.', ['bedrägeri', 'rapportera']),
  article('messages-safety', 'safety', 'Betala aldrig via meddelanden', 'Never pay through messages', 'Nie über Nachrichten bezahlen', 'Skicka aldrig kortuppgifter, lösenord eller pengar på uppmaning i ett meddelande.', 'Never send card details, passwords or money because of a message.', 'Senden Sie niemals Kartendaten, Passwörter oder Geld aufgrund einer Nachricht.', ['meddelanden', 'betalning']),
  article('buy-eu', 'export', 'Köpa från ett annat EU-land', 'Buy from another EU country', 'Aus einem anderen EU-Land kaufen', 'Kom överens tidigt om pris, betalning, hämtning, transport, dokument och ansvar för registrering.', 'Agree early on price, payment, pickup, transport, documents and registration responsibility.', 'Klären Sie früh Preis, Zahlung, Abholung, Transport, Dokumente und Registrierung.', ['eu', 'import']),
  article('export-documents', 'export', 'Dokument vid export och import', 'Documents for export and import', 'Dokumente für Export und Import', 'Spara avtal, kvitto eller faktura, registreringsbevis, identitet, VIN eller serienummer och transportdokument.', 'Keep agreement, receipt or invoice, registration document, identity, VIN or serial number and transport documents.', 'Bewahren Sie Vertrag, Beleg oder Rechnung, Zulassung, Identität, VIN oder Seriennummer und Transportdokumente auf.', ['dokument']),
  article('transport-pickup', 'export', 'Hämtning och transport', 'Pickup and transport', 'Abholung und Transport', 'Bestäm vem som bokar transport, när fordonet lämnas över och vilka dokument som följer med.', 'Decide who books transport, when the vehicle is handed over and which documents are included.', 'Klären Sie, wer Transport bucht, wann übergeben wird und welche Dokumente dabei sind.', ['transport', 'hämtning']),
]

export function localizedText(locale: PublicLocale, value: LocalizedText) {
  const direct = value[locale]
  if (direct) return direct
  const normalized = translationLocale(locale)
  const normalizedDirect = value[normalized]
  if (normalizedDirect) return normalizedDirect
  if (locale === 'sv') return value.sv
  if (locale === 'de' || locale === 'at') return value.de
  const override = helpCenterStringTranslations[locale]?.[value.en] || helpCenterExtraTranslations[locale]?.[value.en]
  if (override) return override
  return translatePublic(locale, value.en)
}

export function getHelpCenterCategory(slugOrId: string) {
  return helpCenterCategories.find((item) => item.slug === slugOrId || item.id === slugOrId) || null
}

export function getHelpCenterArticle(categorySlug: string, articleSlug: string) {
  const category = getHelpCenterCategory(categorySlug)
  if (!category) return null
  return helpCenterArticles.find((item) => item.category === category.id && item.slug === articleSlug) || null
}

export function getCategoryArticles(categoryId: HelpCenterCategoryId) {
  return helpCenterArticles.filter((item) => item.category === categoryId)
}

export function helpCenterHref(locale: PublicLocale, categorySlug?: string, articleSlug?: string) {
  const path = ['/help-center', categorySlug, articleSlug].filter(Boolean).join('/')
  return localizePublicHref(locale, path)
}

export function privateListingPricesHref(locale: PublicLocale) {
  return helpCenterHref(locale, 'payment', 'private-listing-prices')
}

export function getRelatedArticles(article: HelpCenterArticle) {
  const relatedSlugs = article.related?.length
    ? article.related
    : helpCenterArticles.filter((item) => item.category === article.category && item.slug !== article.slug).slice(0, 4).map((item) => item.slug)
  return relatedSlugs
    .map((slug) => helpCenterArticles.find((item) => item.slug === slug))
    .filter((item): item is HelpCenterArticle => Boolean(item))
    .slice(0, 5)
}

export function getPricingRows(market: BillingMarket, locale: PublicLocale) {
  const numberLocale = localeTag(locale)
  const categories = Object.entries(listingCategoryLabels) as Array<[ListingCategory, string]>
  return categories.map(([category, label]) => {
    const standard = billingProductCatalog.find((product) => product.productKey === `listing.${category}.standard`)
    const premium = billingProductCatalog.find((product) => product.productKey === `listing.${category}.premium`)
    return {
      category,
      label: listingCategoryLabel(locale, category, label),
      start: freeLabel(locale),
      standard: standard ? formatProductAmount(standard, market, numberLocale) : '',
      premium: premium ? formatProductAmount(premium, market, numberLocale) : '',
    }
  })
}

export function localeTag(locale: PublicLocale) {
  const map: Record<PublicLocale, string> = {
    sv: 'sv-SE',
    en: 'en-GB',
    de: 'de-DE',
    at: 'de-AT',
    be: 'nl-BE',
    fr: 'fr-FR',
    es: 'es-ES',
    it: 'it-IT',
    pl: 'pl-PL',
    nl: 'nl-NL',
    fi: 'fi-FI',
    da: 'da-DK',
  }
  return map[locale] || 'en-GB'
}

function article(
  slug: string,
  category: HelpCenterCategoryId,
  svTitle: string,
  enTitle: string,
  deTitle: string,
  svSummary: string,
  enSummary: string,
  deSummary: string,
  keywords: string[],
): HelpCenterArticle {
  return {
    slug,
    category,
    title: { sv: svTitle, en: enTitle, de: deTitle },
    summary: { sv: svSummary, en: enSummary, de: deSummary },
    keywords,
    body: [
      { sv: svSummary, en: enSummary, de: deSummary },
      {
        sv: 'Kontrollera alltid att uppgifter, pris och kontaktväg stämmer innan du går vidare. Om något ser fel ut kan du kontakta support eller rapportera problemet.',
        en: 'Always check that details, price and contact route are correct before continuing. If something looks wrong, contact support or report the issue.',
        de: 'Prüfen Sie immer, ob Daten, Preis und Kontaktweg korrekt sind, bevor Sie fortfahren. Wenn etwas falsch wirkt, kontaktieren Sie den Support oder melden Sie das Problem.',
      },
    ],
  }
}

function businessArticle(
  slug: string,
  title: LocalizedText,
  summary: LocalizedText,
  body: LocalizedText[],
  keywords: string[],
  related: string[],
): HelpCenterArticle {
  return {
    slug,
    category: 'business',
    title,
    summary,
    keywords,
    body,
    related,
  }
}

function formatProductAmount(
  product: (typeof billingProductCatalog)[number],
  market: BillingMarket,
  locale: string,
) {
  const amount = getProductAmount(product, market)
  if (!amount) return ''
  if (amount.amountMinor === 0) return locale.startsWith('sv') ? 'Gratis' : 'Free'
  return formatMoneyMinor(amount.amountMinor, amount.currency, locale).replace(/\s+/g, ' ')
}

function freeLabel(locale: PublicLocale) {
  return {
    sv: 'Gratis',
    en: 'Free',
    de: 'Kostenlos',
    at: 'Kostenlos',
    be: 'Gratis',
    fr: 'Gratuit',
    es: 'Gratis',
    it: 'Gratis',
    pl: 'Bezpłatnie',
    nl: 'Gratis',
    fi: 'Ilmainen',
    da: 'Gratis',
  }[locale]
}

function listingCategoryLabel(locale: PublicLocale, category: ListingCategory, fallback: string) {
  return listingCategoryTranslations[locale]?.[category] || fallback
}

const listingCategoryTranslations: Partial<Record<PublicLocale, Record<ListingCategory, string>>> = {
  en: {
    cars: 'Cars',
    vans: 'Vans',
    motorcycles: 'Motorcycles',
    motorhomes: 'Motorhomes',
    caravans: 'Caravans',
    trucks: 'Trucks',
    agriculture: 'Agricultural machinery',
    construction: 'Construction machinery',
    'electric-bikes': 'Bicycles',
  },
  de: {
    cars: 'Autos',
    vans: 'Transporter',
    motorcycles: 'Motorräder',
    motorhomes: 'Wohnmobile',
    caravans: 'Wohnwagen',
    trucks: 'Lkw',
    agriculture: 'Landmaschinen',
    construction: 'Baumaschinen',
    'electric-bikes': 'Fahrräder',
  },
  at: {
    cars: 'Autos',
    vans: 'Transporter',
    motorcycles: 'Motorräder',
    motorhomes: 'Wohnmobile',
    caravans: 'Wohnwagen',
    trucks: 'Lkw',
    agriculture: 'Landmaschinen',
    construction: 'Baumaschinen',
    'electric-bikes': 'Fahrräder',
  },
  fr: {
    cars: 'Voitures',
    vans: 'Utilitaires',
    motorcycles: 'Motos',
    motorhomes: 'Camping-cars',
    caravans: 'Caravanes',
    trucks: 'Camions',
    agriculture: 'Matériel agricole',
    construction: 'Engins de chantier',
    'electric-bikes': 'Vélos',
  },
  es: {
    cars: 'Coches',
    vans: 'Furgonetas',
    motorcycles: 'Motos',
    motorhomes: 'Autocaravanas',
    caravans: 'Caravanas',
    trucks: 'Camiones',
    agriculture: 'Maquinaria agrícola',
    construction: 'Maquinaria de construcción',
    'electric-bikes': 'Bicicletas',
  },
  it: {
    cars: 'Auto',
    vans: 'Furgoni',
    motorcycles: 'Moto',
    motorhomes: 'Camper',
    caravans: 'Roulotte',
    trucks: 'Camion',
    agriculture: 'Macchine agricole',
    construction: 'Macchine movimento terra',
    'electric-bikes': 'Biciclette',
  },
  pl: {
    cars: 'Samochody',
    vans: 'Vany',
    motorcycles: 'Motocykle',
    motorhomes: 'Kampery',
    caravans: 'Przyczepy kempingowe',
    trucks: 'Ciężarówki',
    agriculture: 'Maszyny rolnicze',
    construction: 'Maszyny budowlane',
    'electric-bikes': 'Rowery',
  },
  nl: {
    cars: 'Auto’s',
    vans: 'Bestelwagens',
    motorcycles: 'Motoren',
    motorhomes: 'Campers',
    caravans: 'Caravans',
    trucks: 'Vrachtwagens',
    agriculture: 'Landbouwmachines',
    construction: 'Bouwmachines',
    'electric-bikes': 'Fietsen',
  },
  be: {
    cars: 'Auto’s',
    vans: 'Bestelwagens',
    motorcycles: 'Motoren',
    motorhomes: 'Campers',
    caravans: 'Caravans',
    trucks: 'Vrachtwagens',
    agriculture: 'Landbouwmachines',
    construction: 'Bouwmachines',
    'electric-bikes': 'Fietsen',
  },
  fi: {
    cars: 'Autot',
    vans: 'Pakettiautot',
    motorcycles: 'Moottoripyörät',
    motorhomes: 'Matkailuautot',
    caravans: 'Asuntovaunut',
    trucks: 'Kuorma-autot',
    agriculture: 'Maatalouskoneet',
    construction: 'Maarakennuskoneet',
    'electric-bikes': 'Polkupyörät',
  },
  da: {
    cars: 'Biler',
    vans: 'Varevogne',
    motorcycles: 'Motorcykler',
    motorhomes: 'Autocampere',
    caravans: 'Campingvogne',
    trucks: 'Lastbiler',
    agriculture: 'Landbrugsmaskiner',
    construction: 'Entreprenørmaskiner',
    'electric-bikes': 'Cykler',
  },
}

const helpCenterStringTranslations: Partial<Record<PublicLocale, Record<string, string>>> = {
  fr: {
    'Private listing prices': 'Tarifs des annonces privées',
    'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.': 'L’annonce de base est gratuite. Une durée plus longue et une visibilité supplémentaire affichent le même prix local qu’au paiement.',
    'Related answers': 'Réponses liées',
    'Payment and refunds': 'Paiement et remboursements',
    'Create a listing': 'Créer une annonce',
    'Business subscriptions': 'Abonnements entreprise',
  },
  es: {
    'Private listing prices': 'Precios para anuncios particulares',
    'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.': 'El anuncio básico es gratuito. Más duración y visibilidad extra muestran el mismo precio local que en el pago.',
    'Related answers': 'Respuestas relacionadas',
    'Payment and refunds': 'Pago y reembolsos',
    'Create a listing': 'Crear anuncio',
    'Business subscriptions': 'Suscripciones para empresas',
  },
  it: {
    'Private listing prices': 'Prezzi per annunci privati',
    'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.': 'L’annuncio base è gratuito. Durata più lunga e visibilità extra mostrano lo stesso prezzo locale del pagamento.',
    'Related answers': 'Risposte correlate',
    'Payment and refunds': 'Pagamenti e rimborsi',
    'Create a listing': 'Crea annuncio',
    'Business subscriptions': 'Abbonamenti aziendali',
  },
  pl: {
    'Private listing prices': 'Ceny ogłoszeń prywatnych',
    'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.': 'Podstawowe ogłoszenie jest bezpłatne. Dłuższy czas emisji i dodatkowa widoczność pokazują tę samą lokalną cenę co przy płatności.',
    'Related answers': 'Powiązane odpowiedzi',
    'Payment and refunds': 'Płatności i zwroty',
    'Create a listing': 'Dodaj ogłoszenie',
    'Business subscriptions': 'Abonamenty firmowe',
  },
  nl: {
    'Private listing prices': 'Prijzen voor particuliere advertenties',
    'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.': 'De basisadvertentie is gratis. Langere looptijd en extra zichtbaarheid tonen dezelfde lokale prijs als bij het afrekenen.',
    'Related answers': 'Gerelateerde antwoorden',
    'Payment and refunds': 'Betaling en terugbetalingen',
    'Create a listing': 'Advertentie plaatsen',
    'Business subscriptions': 'Bedrijfsabonnementen',
  },
  be: {
    'Private listing prices': 'Prijzen voor particuliere advertenties',
    'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.': 'De basisadvertentie is gratis. Langere looptijd en extra zichtbaarheid tonen dezelfde lokale prijs als bij het afrekenen.',
    'Related answers': 'Gerelateerde antwoorden',
    'Payment and refunds': 'Betaling en terugbetalingen',
    'Create a listing': 'Advertentie plaatsen',
    'Business subscriptions': 'Bedrijfsabonnementen',
  },
  fi: {
    'Private listing prices': 'Yksityisilmoitusten hinnat',
    'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.': 'Perusilmoitus on ilmainen. Pidempi ilmoitusaika ja lisänäkyvyys näyttävät saman paikallisen hinnan kuin kassalla.',
    'Related answers': 'Aiheeseen liittyvät vastaukset',
    'Payment and refunds': 'Maksut ja hyvitykset',
    'Create a listing': 'Luo ilmoitus',
    'Business subscriptions': 'Yritystilaukset',
  },
  da: {
    'Private listing prices': 'Priser for private annoncer',
    'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.': 'Basisannoncen er gratis. Længere annoncetid og ekstra synlighed viser samme lokale pris som i checkout.',
    'Related answers': 'Relaterede svar',
    'Payment and refunds': 'Betaling og refusioner',
    'Create a listing': 'Opret annonce',
    'Business subscriptions': 'Virksomhedsabonnementer',
  },
}

const helpCenterExtraTranslations: Partial<Record<PublicLocale, Record<string, string>>> = {
  fr: {
    'Edit a published listing': 'Modifier une annonce publiée',
    'Listing review': 'Vérification des annonces',
    'Sign in without a password': 'Connexion sans mot de passe',
    'Private or business account': 'Compte particulier ou entreprise',
    'Update contact details': 'Mettre à jour les coordonnées',
    'Receipts and payment history': 'Reçus et historique des paiements',
    'Inventory and multiple listings': 'Stock et annonces multiples',
    'Verify company details': 'Vérifier les informations entreprise',
    'Check before buying': 'Vérifier avant d’acheter',
    'Report fraud or a fake listing': 'Signaler une fraude ou fausse annonce',
    'Never pay through messages': 'Ne payez jamais via les messages',
    'Buy from another EU country': 'Acheter dans un autre pays de l’UE',
    'Documents for export and import': 'Documents d’export et d’import',
    'Pickup and transport': 'Enlèvement et transport',
    'Read the full answer': 'Lire la réponse complète',
    'You can update price, text, images and several vehicle details from your account.': 'Vous pouvez modifier le prix, le texte, les images et plusieurs données du véhicule depuis votre compte.',
    'Some changes may be reviewed before they appear publicly to protect buyers and sellers.': 'Certaines modifications peuvent être vérifiées avant publication afin de protéger acheteurs et vendeurs.',
    'Enter your email address in the sign-in window. Autorell sends a one-time code by email.': 'Saisissez votre e-mail dans la connexion. Autorell vous envoie un code unique par e-mail.',
    'Private accounts are for individuals. Business accounts are built for dealers, teams and recurring listings.': 'Les comptes particuliers sont pour les personnes. Les comptes entreprise sont conçus pour les professionnels, équipes et annonces régulières.',
    'Keep email, phone, name, country and company details correct for support and payment.': 'Gardez e-mail, téléphone, nom, pays et informations entreprise à jour pour le support et les paiements.',
    'Payments are connected to your account and relevant listing references.': 'Les paiements sont liés à votre compte et aux références d’annonces concernées.',
    'Business accounts can manage recurring listings and larger inventory flows.': 'Les comptes entreprise peuvent gérer des annonces régulières et des flux de stock plus importants.',
    'Verification makes company details clearer but does not replace the buyer’s own checks.': 'La vérification rend les informations entreprise plus claires mais ne remplace pas les contrôles de l’acheteur.',
    'Check identity, documents, VIN or serial number, history, images and reasonable price.': 'Vérifiez identité, documents, VIN ou numéro de série, historique, images et cohérence du prix.',
    'Use Report a problem and include listing ID, counterparty, date and payment reference when available.': 'Utilisez Signaler un problème et ajoutez ID d’annonce, partie concernée, date et référence de paiement si disponible.',
    'Never send card details, passwords or money because of a message.': 'N’envoyez jamais de données de carte, mots de passe ou argent à la suite d’un message.',
    'Agree early on price, payment, pickup, transport, documents and registration responsibility.': 'Mettez-vous d’accord tôt sur prix, paiement, enlèvement, transport, documents et responsabilité d’immatriculation.',
    'Keep agreement, receipt or invoice, registration document, identity, VIN or serial number and transport documents.': 'Conservez contrat, reçu ou facture, certificat d’immatriculation, identité, VIN ou numéro de série et documents de transport.',
    'Decide who books transport, when the vehicle is handed over and which documents are included.': 'Décidez qui réserve le transport, quand le véhicule est remis et quels documents suivent.',
  },
  es: {
    'Edit a published listing': 'Editar un anuncio publicado',
    'Listing review': 'Revisión de anuncios',
    'Sign in without a password': 'Iniciar sesión sin contraseña',
    'Private or business account': 'Cuenta particular o de empresa',
    'Update contact details': 'Actualizar datos de contacto',
    'Receipts and payment history': 'Recibos e historial de pagos',
    'Inventory and multiple listings': 'Inventario y varios anuncios',
    'Verify company details': 'Verificar datos de empresa',
    'Check before buying': 'Comprobar antes de comprar',
    'Report fraud or a fake listing': 'Denunciar fraude o anuncio falso',
    'Never pay through messages': 'Nunca pagues por mensajes',
    'Buy from another EU country': 'Comprar en otro país de la UE',
    'Documents for export and import': 'Documentos de exportación e importación',
    'Pickup and transport': 'Recogida y transporte',
    'Read the full answer': 'Leer la respuesta completa',
    'You can update price, text, images and several vehicle details from your account.': 'Puedes actualizar precio, texto, imágenes y varios datos del vehículo desde tu cuenta.',
    'Some changes may be reviewed before they appear publicly to protect buyers and sellers.': 'Algunos cambios pueden revisarse antes de mostrarse públicamente para proteger a compradores y vendedores.',
    'Enter your email address in the sign-in window. Autorell sends a one-time code by email.': 'Introduce tu correo en el inicio de sesión. Autorell envía un código único por e-mail.',
    'Private accounts are for individuals. Business accounts are built for dealers, teams and recurring listings.': 'Las cuentas particulares son para personas. Las cuentas de empresa son para concesionarios, equipos y anuncios recurrentes.',
    'Keep email, phone, name, country and company details correct for support and payment.': 'Mantén correctos correo, teléfono, nombre, país y datos de empresa para soporte y pagos.',
    'Payments are connected to your account and relevant listing references.': 'Los pagos se vinculan a tu cuenta y a las referencias de anuncio correspondientes.',
    'Business accounts can manage recurring listings and larger inventory flows.': 'Las cuentas de empresa pueden gestionar anuncios recurrentes y flujos de inventario mayores.',
    'Verification makes company details clearer but does not replace the buyer’s own checks.': 'La verificación aclara los datos de empresa, pero no sustituye las comprobaciones del comprador.',
    'Check identity, documents, VIN or serial number, history, images and reasonable price.': 'Comprueba identidad, documentos, VIN o número de serie, historial, imágenes y precio razonable.',
    'Use Report a problem and include listing ID, counterparty, date and payment reference when available.': 'Usa Denunciar un problema e incluye ID del anuncio, contraparte, fecha y referencia de pago si existe.',
    'Never send card details, passwords or money because of a message.': 'Nunca envíes datos de tarjeta, contraseñas ni dinero por indicación de un mensaje.',
    'Agree early on price, payment, pickup, transport, documents and registration responsibility.': 'Acuerda pronto precio, pago, recogida, transporte, documentos y responsabilidad de registro.',
    'Keep agreement, receipt or invoice, registration document, identity, VIN or serial number and transport documents.': 'Conserva contrato, recibo o factura, documento de registro, identidad, VIN o número de serie y documentos de transporte.',
    'Decide who books transport, when the vehicle is handed over and which documents are included.': 'Decide quién reserva el transporte, cuándo se entrega el vehículo y qué documentos se incluyen.',
  },
  it: {
    'Edit a published listing': 'Modifica un annuncio pubblicato',
    'Listing review': 'Revisione degli annunci',
    'Sign in without a password': 'Accedi senza password',
    'Private or business account': 'Account privato o aziendale',
    'Update contact details': 'Aggiorna i dati di contatto',
    'Receipts and payment history': 'Ricevute e storico pagamenti',
    'Inventory and multiple listings': 'Inventario e più annunci',
    'Verify company details': 'Verifica i dati aziendali',
    'Check before buying': 'Controlla prima di acquistare',
    'Report fraud or a fake listing': 'Segnala frode o annuncio falso',
    'Never pay through messages': 'Non pagare mai tramite messaggi',
    'Buy from another EU country': 'Acquistare da un altro paese UE',
    'Documents for export and import': 'Documenti per export e import',
    'Pickup and transport': 'Ritiro e trasporto',
    'Read the full answer': 'Leggi la risposta completa',
    'You can update price, text, images and several vehicle details from your account.': 'Puoi aggiornare prezzo, testo, immagini e vari dati del veicolo dal tuo account.',
    'Some changes may be reviewed before they appear publicly to protect buyers and sellers.': 'Alcune modifiche possono essere verificate prima della pubblicazione per proteggere acquirenti e venditori.',
    'Enter your email address in the sign-in window. Autorell sends a one-time code by email.': 'Inserisci l’e-mail nella finestra di accesso. Autorell invia un codice monouso via e-mail.',
    'Private accounts are for individuals. Business accounts are built for dealers, teams and recurring listings.': 'Gli account privati sono per persone fisiche. Gli account aziendali sono per concessionari, team e annunci ricorrenti.',
    'Keep email, phone, name, country and company details correct for support and payment.': 'Mantieni corretti e-mail, telefono, nome, paese e dati aziendali per supporto e pagamenti.',
    'Payments are connected to your account and relevant listing references.': 'I pagamenti sono collegati al tuo account e ai riferimenti degli annunci pertinenti.',
    'Business accounts can manage recurring listings and larger inventory flows.': 'Gli account aziendali gestiscono annunci ricorrenti e flussi inventario più grandi.',
    'Verification makes company details clearer but does not replace the buyer’s own checks.': 'La verifica rende più chiari i dati aziendali, ma non sostituisce i controlli dell’acquirente.',
    'Check identity, documents, VIN or serial number, history, images and reasonable price.': 'Controlla identità, documenti, VIN o numero di serie, storico, immagini e prezzo coerente.',
    'Use Report a problem and include listing ID, counterparty, date and payment reference when available.': 'Usa Segnala un problema e includi ID annuncio, controparte, data e riferimento pagamento se disponibile.',
    'Never send card details, passwords or money because of a message.': 'Non inviare mai dati carta, password o denaro su richiesta in un messaggio.',
    'Agree early on price, payment, pickup, transport, documents and registration responsibility.': 'Concorda subito prezzo, pagamento, ritiro, trasporto, documenti e responsabilità di registrazione.',
    'Keep agreement, receipt or invoice, registration document, identity, VIN or serial number and transport documents.': 'Conserva accordo, ricevuta o fattura, documento di registrazione, identità, VIN o numero di serie e documenti di trasporto.',
    'Decide who books transport, when the vehicle is handed over and which documents are included.': 'Decidi chi prenota il trasporto, quando viene consegnato il veicolo e quali documenti sono inclusi.',
  },
  pl: {
    'Edit a published listing': 'Edytuj opublikowane ogłoszenie',
    'Listing review': 'Weryfikacja ogłoszeń',
    'Sign in without a password': 'Logowanie bez hasła',
    'Private or business account': 'Konto prywatne lub firmowe',
    'Update contact details': 'Aktualizacja danych kontaktowych',
    'Receipts and payment history': 'Potwierdzenia i historia płatności',
    'Inventory and multiple listings': 'Zapasy i wiele ogłoszeń',
    'Verify company details': 'Zweryfikuj dane firmy',
    'Check before buying': 'Sprawdź przed zakupem',
    'Report fraud or a fake listing': 'Zgłoś oszustwo lub fałszywe ogłoszenie',
    'Never pay through messages': 'Nigdy nie płać przez wiadomości',
    'Buy from another EU country': 'Zakup z innego kraju UE',
    'Documents for export and import': 'Dokumenty eksportu i importu',
    'Pickup and transport': 'Odbiór i transport',
    'Read the full answer': 'Przeczytaj pełną odpowiedź',
    'You can update price, text, images and several vehicle details from your account.': 'Z konta możesz zmienić cenę, tekst, zdjęcia i wiele danych pojazdu.',
    'Some changes may be reviewed before they appear publicly to protect buyers and sellers.': 'Niektóre zmiany mogą być sprawdzane przed publikacją, aby chronić kupujących i sprzedających.',
    'Enter your email address in the sign-in window. Autorell sends a one-time code by email.': 'Wpisz e-mail w oknie logowania. Autorell wyśle jednorazowy kod e-mailem.',
    'Private accounts are for individuals. Business accounts are built for dealers, teams and recurring listings.': 'Konta prywatne są dla osób. Konta firmowe są dla dealerów, zespołów i regularnych ogłoszeń.',
    'Keep email, phone, name, country and company details correct for support and payment.': 'Dbaj o poprawny e-mail, telefon, nazwę, kraj i dane firmy dla wsparcia i płatności.',
    'Payments are connected to your account and relevant listing references.': 'Płatności są powiązane z kontem i odpowiednimi referencjami ogłoszeń.',
    'Business accounts can manage recurring listings and larger inventory flows.': 'Konta firmowe obsługują regularne ogłoszenia i większe przepływy zapasów.',
    'Verification makes company details clearer but does not replace the buyer’s own checks.': 'Weryfikacja ułatwia ocenę danych firmy, ale nie zastępuje własnych kontroli kupującego.',
    'Check identity, documents, VIN or serial number, history, images and reasonable price.': 'Sprawdź tożsamość, dokumenty, VIN lub numer seryjny, historię, zdjęcia i rozsądną cenę.',
    'Use Report a problem and include listing ID, counterparty, date and payment reference when available.': 'Użyj Zgłoś problem i podaj ID ogłoszenia, drugą stronę, datę i referencję płatności, jeśli jest.',
    'Never send card details, passwords or money because of a message.': 'Nigdy nie wysyłaj danych karty, haseł ani pieniędzy na podstawie wiadomości.',
    'Agree early on price, payment, pickup, transport, documents and registration responsibility.': 'Ustal wcześnie cenę, płatność, odbiór, transport, dokumenty i odpowiedzialność za rejestrację.',
    'Keep agreement, receipt or invoice, registration document, identity, VIN or serial number and transport documents.': 'Zachowaj umowę, paragon lub fakturę, dokument rejestracyjny, tożsamość, VIN lub numer seryjny i dokumenty transportu.',
    'Decide who books transport, when the vehicle is handed over and which documents are included.': 'Ustal, kto zamawia transport, kiedy następuje przekazanie pojazdu i jakie dokumenty są dołączone.',
  },
  nl: {
    'Edit a published listing': 'Een gepubliceerde advertentie wijzigen',
    'Listing review': 'Advertentiecontrole',
    'Sign in without a password': 'Inloggen zonder wachtwoord',
    'Private or business account': 'Particulier of zakelijk account',
    'Update contact details': 'Contactgegevens bijwerken',
    'Receipts and payment history': 'Bonnen en betaalgeschiedenis',
    'Inventory and multiple listings': 'Voorraad en meerdere advertenties',
    'Verify company details': 'Bedrijfsgegevens verifiëren',
    'Check before buying': 'Controleer voordat je koopt',
    'Report fraud or a fake listing': 'Fraude of valse advertentie melden',
    'Never pay through messages': 'Betaal nooit via berichten',
    'Buy from another EU country': 'Kopen uit een ander EU-land',
    'Documents for export and import': 'Documenten voor export en import',
    'Pickup and transport': 'Ophalen en transport',
    'Read the full answer': 'Lees het volledige antwoord',
    'You can update price, text, images and several vehicle details from your account.': 'Je kunt prijs, tekst, beelden en meerdere voertuiggegevens vanuit je account wijzigen.',
    'Some changes may be reviewed before they appear publicly to protect buyers and sellers.': 'Sommige wijzigingen kunnen worden gecontroleerd voordat ze openbaar verschijnen om kopers en verkopers te beschermen.',
    'Enter your email address in the sign-in window. Autorell sends a one-time code by email.': 'Vul je e-mailadres in bij het inloggen. Autorell stuurt een eenmalige code per e-mail.',
    'Private accounts are for individuals. Business accounts are built for dealers, teams and recurring listings.': 'Particuliere accounts zijn voor personen. Zakelijke accounts zijn voor dealers, teams en terugkerende advertenties.',
    'Keep email, phone, name, country and company details correct for support and payment.': 'Houd e-mail, telefoon, naam, land en bedrijfsgegevens juist voor support en betaling.',
    'Payments are connected to your account and relevant listing references.': 'Betalingen zijn gekoppeld aan je account en relevante advertentiereferenties.',
    'Business accounts can manage recurring listings and larger inventory flows.': 'Zakelijke accounts kunnen terugkerende advertenties en grotere voorraadstromen beheren.',
    'Verification makes company details clearer but does not replace the buyer’s own checks.': 'Verificatie maakt bedrijfsgegevens duidelijker, maar vervangt niet de eigen controles van de koper.',
    'Check identity, documents, VIN or serial number, history, images and reasonable price.': 'Controleer identiteit, documenten, VIN of serienummer, historie, beelden en redelijke prijs.',
    'Use Report a problem and include listing ID, counterparty, date and payment reference when available.': 'Gebruik Probleem melden en voeg advertentie-ID, tegenpartij, datum en betaalreferentie toe indien beschikbaar.',
    'Never send card details, passwords or money because of a message.': 'Stuur nooit kaartgegevens, wachtwoorden of geld naar aanleiding van een bericht.',
    'Agree early on price, payment, pickup, transport, documents and registration responsibility.': 'Spreek vroeg prijs, betaling, ophalen, transport, documenten en registratieverantwoordelijkheid af.',
    'Keep agreement, receipt or invoice, registration document, identity, VIN or serial number and transport documents.': 'Bewaar overeenkomst, bon of factuur, registratiedocument, identiteit, VIN of serienummer en transportdocumenten.',
    'Decide who books transport, when the vehicle is handed over and which documents are included.': 'Bepaal wie transport boekt, wanneer het voertuig wordt overgedragen en welke documenten meegaan.',
  },
  be: {
    'Edit a published listing': 'Een gepubliceerde advertentie wijzigen',
    'Listing review': 'Advertentiecontrole',
    'Sign in without a password': 'Inloggen zonder wachtwoord',
    'Private or business account': 'Particulier of zakelijk account',
    'Update contact details': 'Contactgegevens bijwerken',
    'Receipts and payment history': 'Bonnen en betaalgeschiedenis',
    'Inventory and multiple listings': 'Voorraad en meerdere advertenties',
    'Verify company details': 'Bedrijfsgegevens verifiëren',
    'Check before buying': 'Controleer voordat je koopt',
    'Report fraud or a fake listing': 'Fraude of valse advertentie melden',
    'Never pay through messages': 'Betaal nooit via berichten',
    'Buy from another EU country': 'Kopen uit een ander EU-land',
    'Documents for export and import': 'Documenten voor export en import',
    'Pickup and transport': 'Ophalen en transport',
    'Read the full answer': 'Lees het volledige antwoord',
    'You can update price, text, images and several vehicle details from your account.': 'Je kunt prijs, tekst, beelden en meerdere voertuiggegevens vanuit je account wijzigen.',
    'Some changes may be reviewed before they appear publicly to protect buyers and sellers.': 'Sommige wijzigingen kunnen worden gecontroleerd voordat ze openbaar verschijnen om kopers en verkopers te beschermen.',
    'Enter your email address in the sign-in window. Autorell sends a one-time code by email.': 'Vul je e-mailadres in bij het inloggen. Autorell stuurt een eenmalige code per e-mail.',
    'Private accounts are for individuals. Business accounts are built for dealers, teams and recurring listings.': 'Particuliere accounts zijn voor personen. Zakelijke accounts zijn voor dealers, teams en terugkerende advertenties.',
    'Keep email, phone, name, country and company details correct for support and payment.': 'Houd e-mail, telefoon, naam, land en bedrijfsgegevens juist voor support en betaling.',
    'Payments are connected to your account and relevant listing references.': 'Betalingen zijn gekoppeld aan je account en relevante advertentiereferenties.',
    'Business accounts can manage recurring listings and larger inventory flows.': 'Zakelijke accounts kunnen terugkerende advertenties en grotere voorraadstromen beheren.',
    'Verification makes company details clearer but does not replace the buyer’s own checks.': 'Verificatie maakt bedrijfsgegevens duidelijker, maar vervangt niet de eigen controles van de koper.',
    'Check identity, documents, VIN or serial number, history, images and reasonable price.': 'Controleer identiteit, documenten, VIN of serienummer, historie, beelden en redelijke prijs.',
    'Use Report a problem and include listing ID, counterparty, date and payment reference when available.': 'Gebruik Probleem melden en voeg advertentie-ID, tegenpartij, datum en betaalreferentie toe indien beschikbaar.',
    'Never send card details, passwords or money because of a message.': 'Stuur nooit kaartgegevens, wachtwoorden of geld naar aanleiding van een bericht.',
    'Agree early on price, payment, pickup, transport, documents and registration responsibility.': 'Spreek vroeg prijs, betaling, ophalen, transport, documenten en registratieverantwoordelijkheid af.',
    'Keep agreement, receipt or invoice, registration document, identity, VIN or serial number and transport documents.': 'Bewaar overeenkomst, bon of factuur, registratiedocument, identiteit, VIN of serienummer en transportdocumenten.',
    'Decide who books transport, when the vehicle is handed over and which documents are included.': 'Bepaal wie transport boekt, wanneer het voertuig wordt overgedragen en welke documenten meegaan.',
  },
  fi: {
    'Edit a published listing': 'Muokkaa julkaistua ilmoitusta',
    'Listing review': 'Ilmoituksen tarkistus',
    'Sign in without a password': 'Kirjaudu ilman salasanaa',
    'Private or business account': 'Yksityis- tai yritystili',
    'Update contact details': 'Päivitä yhteystiedot',
    'Receipts and payment history': 'Kuitit ja maksuhistoria',
    'Inventory and multiple listings': 'Varasto ja useat ilmoitukset',
    'Verify company details': 'Vahvista yritystiedot',
    'Check before buying': 'Tarkista ennen ostoa',
    'Report fraud or a fake listing': 'Ilmoita petoksesta tai väärästä ilmoituksesta',
    'Never pay through messages': 'Älä koskaan maksa viesteissä',
    'Buy from another EU country': 'Osta toisesta EU-maasta',
    'Documents for export and import': 'Vienti- ja tuontiasiakirjat',
    'Pickup and transport': 'Nouto ja kuljetus',
    'Read the full answer': 'Lue koko vastaus',
    'You can update price, text, images and several vehicle details from your account.': 'Voit päivittää hinnan, tekstin, kuvat ja useita ajoneuvotietoja tililtäsi.',
    'Some changes may be reviewed before they appear publicly to protect buyers and sellers.': 'Osa muutoksista voidaan tarkistaa ennen julkaisua ostajien ja myyjien suojaamiseksi.',
    'Enter your email address in the sign-in window. Autorell sends a one-time code by email.': 'Syötä sähköpostiosoitteesi kirjautumisessa. Autorell lähettää kertakoodin sähköpostiin.',
    'Private accounts are for individuals. Business accounts are built for dealers, teams and recurring listings.': 'Yksityistilit ovat henkilöille. Yritystilit on tehty liikkeille, tiimeille ja toistuviin ilmoituksiin.',
    'Keep email, phone, name, country and company details correct for support and payment.': 'Pidä sähköposti, puhelin, nimi, maa ja yritystiedot oikein tukea ja maksamista varten.',
    'Payments are connected to your account and relevant listing references.': 'Maksut yhdistetään tiliisi ja asiaankuuluviin ilmoitusviitteisiin.',
    'Business accounts can manage recurring listings and larger inventory flows.': 'Yritystilit voivat hallita toistuvia ilmoituksia ja suurempia varastovirtoja.',
    'Verification makes company details clearer but does not replace the buyer’s own checks.': 'Vahvistus selkeyttää yritystietoja, mutta ei korvaa ostajan omia tarkistuksia.',
    'Check identity, documents, VIN or serial number, history, images and reasonable price.': 'Tarkista henkilöllisyys, asiakirjat, VIN tai sarjanumero, historia, kuvat ja järkevä hinta.',
    'Use Report a problem and include listing ID, counterparty, date and payment reference when available.': 'Käytä Ilmoita ongelmasta -toimintoa ja lisää ilmoitus-ID, vastapuoli, päivämäärä ja maksuviite, jos ne ovat saatavilla.',
    'Never send card details, passwords or money because of a message.': 'Älä koskaan lähetä korttitietoja, salasanoja tai rahaa viestin perusteella.',
    'Agree early on price, payment, pickup, transport, documents and registration responsibility.': 'Sopikaa ajoissa hinnasta, maksusta, noudosta, kuljetuksesta, asiakirjoista ja rekisteröintivastuusta.',
    'Keep agreement, receipt or invoice, registration document, identity, VIN or serial number and transport documents.': 'Säilytä sopimus, kuitti tai lasku, rekisteriasiakirja, henkilöllisyys, VIN tai sarjanumero ja kuljetusasiakirjat.',
    'Decide who books transport, when the vehicle is handed over and which documents are included.': 'Sopikaa kuka varaa kuljetuksen, milloin ajoneuvo luovutetaan ja mitkä asiakirjat ovat mukana.',
  },
  da: {
    'Edit a published listing': 'Rediger en offentliggjort annonce',
    'Listing review': 'Annoncegennemgang',
    'Sign in without a password': 'Log ind uden adgangskode',
    'Private or business account': 'Privat- eller virksomhedskonto',
    'Update contact details': 'Opdater kontaktoplysninger',
    'Receipts and payment history': 'Kvitteringer og betalingshistorik',
    'Inventory and multiple listings': 'Lager og flere annoncer',
    'Verify company details': 'Verificer virksomhedsoplysninger',
    'Check before buying': 'Kontroller før køb',
    'Report fraud or a fake listing': 'Rapporter svindel eller falsk annonce',
    'Never pay through messages': 'Betal aldrig via beskeder',
    'Buy from another EU country': 'Køb fra et andet EU-land',
    'Documents for export and import': 'Dokumenter til eksport og import',
    'Pickup and transport': 'Afhentning og transport',
    'Read the full answer': 'Læs hele svaret',
    'You can update price, text, images and several vehicle details from your account.': 'Du kan opdatere pris, tekst, billeder og flere køretøjsoplysninger fra din konto.',
    'Some changes may be reviewed before they appear publicly to protect buyers and sellers.': 'Nogle ændringer kan blive gennemgået før offentlig visning for at beskytte købere og sælgere.',
    'Enter your email address in the sign-in window. Autorell sends a one-time code by email.': 'Indtast din e-mail i loginfeltet. Autorell sender en engangskode via e-mail.',
    'Private accounts are for individuals. Business accounts are built for dealers, teams and recurring listings.': 'Private konti er til personer. Virksomhedskonti er til forhandlere, teams og tilbagevendende annoncer.',
    'Keep email, phone, name, country and company details correct for support and payment.': 'Hold e-mail, telefon, navn, land og virksomhedsoplysninger korrekte for support og betaling.',
    'Payments are connected to your account and relevant listing references.': 'Betalinger knyttes til din konto og relevante annoncereferencer.',
    'Business accounts can manage recurring listings and larger inventory flows.': 'Virksomhedskonti kan håndtere tilbagevendende annoncer og større lagerflows.',
    'Verification makes company details clearer but does not replace the buyer’s own checks.': 'Verificering gør virksomhedsoplysninger tydeligere, men erstatter ikke køberens egne kontroller.',
    'Check identity, documents, VIN or serial number, history, images and reasonable price.': 'Kontroller identitet, dokumenter, VIN eller serienummer, historik, billeder og rimelig pris.',
    'Use Report a problem and include listing ID, counterparty, date and payment reference when available.': 'Brug Rapporter problem og angiv annonce-ID, modpart, dato og betalingsreference, når det findes.',
    'Never send card details, passwords or money because of a message.': 'Send aldrig kortoplysninger, adgangskoder eller penge på baggrund af en besked.',
    'Agree early on price, payment, pickup, transport, documents and registration responsibility.': 'Aftal tidligt pris, betaling, afhentning, transport, dokumenter og ansvar for registrering.',
    'Keep agreement, receipt or invoice, registration document, identity, VIN or serial number and transport documents.': 'Gem aftale, kvittering eller faktura, registreringsdokument, identitet, VIN eller serienummer og transportdokumenter.',
    'Decide who books transport, when the vehicle is handed over and which documents are included.': 'Aftal hvem der booker transport, hvornår køretøjet overdrages, og hvilke dokumenter der følger med.',
  },
}
