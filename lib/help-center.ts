import {
  billingProductCatalog,
  formatMoneyMinor,
  getProductAmount,
  listingCategoryLabels,
  type BillingMarket,
  type ListingCategory,
} from '@/lib/billing/product-catalog'
import { localizePublicHref, translatePublic, type PublicLocale } from '@/lib/public-i18n'

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
}

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
  if (locale === 'sv') return value.sv
  if (locale === 'de' || locale === 'at') return value.de
  const override = helpCenterStringTranslations[locale]?.[value.en]
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
    'Related articles': 'Articles liés',
    'Payment and refunds': 'Paiement et remboursements',
    'Create a listing': 'Créer une annonce',
    'Business subscriptions': 'Abonnements entreprise',
  },
  es: {
    'Private listing prices': 'Precios para anuncios particulares',
    'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.': 'El anuncio básico es gratuito. Más duración y visibilidad extra muestran el mismo precio local que en el pago.',
    'Related articles': 'Artículos relacionados',
    'Payment and refunds': 'Pago y reembolsos',
    'Create a listing': 'Crear anuncio',
    'Business subscriptions': 'Suscripciones para empresas',
  },
  it: {
    'Private listing prices': 'Prezzi per annunci privati',
    'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.': 'L’annuncio base è gratuito. Durata più lunga e visibilità extra mostrano lo stesso prezzo locale del pagamento.',
    'Related articles': 'Articoli correlati',
    'Payment and refunds': 'Pagamenti e rimborsi',
    'Create a listing': 'Crea annuncio',
    'Business subscriptions': 'Abbonamenti aziendali',
  },
  pl: {
    'Private listing prices': 'Ceny ogłoszeń prywatnych',
    'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.': 'Podstawowe ogłoszenie jest bezpłatne. Dłuższy czas emisji i dodatkowa widoczność pokazują tę samą lokalną cenę co przy płatności.',
    'Related articles': 'Powiązane artykuły',
    'Payment and refunds': 'Płatności i zwroty',
    'Create a listing': 'Dodaj ogłoszenie',
    'Business subscriptions': 'Abonamenty firmowe',
  },
  nl: {
    'Private listing prices': 'Prijzen voor particuliere advertenties',
    'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.': 'De basisadvertentie is gratis. Langere looptijd en extra zichtbaarheid tonen dezelfde lokale prijs als bij het afrekenen.',
    'Related articles': 'Gerelateerde artikelen',
    'Payment and refunds': 'Betaling en terugbetalingen',
    'Create a listing': 'Advertentie plaatsen',
    'Business subscriptions': 'Bedrijfsabonnementen',
  },
  be: {
    'Private listing prices': 'Prijzen voor particuliere advertenties',
    'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.': 'De basisadvertentie is gratis. Langere looptijd en extra zichtbaarheid tonen dezelfde lokale prijs als bij het afrekenen.',
    'Related articles': 'Gerelateerde artikelen',
    'Payment and refunds': 'Betaling en terugbetalingen',
    'Create a listing': 'Advertentie plaatsen',
    'Business subscriptions': 'Bedrijfsabonnementen',
  },
  fi: {
    'Private listing prices': 'Yksityisilmoitusten hinnat',
    'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.': 'Perusilmoitus on ilmainen. Pidempi ilmoitusaika ja lisänäkyvyys näyttävät saman paikallisen hinnan kuin kassalla.',
    'Related articles': 'Aiheeseen liittyvät artikkelit',
    'Payment and refunds': 'Maksut ja hyvitykset',
    'Create a listing': 'Luo ilmoitus',
    'Business subscriptions': 'Yritystilaukset',
  },
  da: {
    'Private listing prices': 'Priser for private annoncer',
    'The basic listing is free. Longer listing time and extra visibility show the same local price as checkout.': 'Basisannoncen er gratis. Længere annoncetid og ekstra synlighed viser samme lokale pris som i checkout.',
    'Related articles': 'Relaterede artikler',
    'Payment and refunds': 'Betaling og refusioner',
    'Create a listing': 'Opret annonce',
    'Business subscriptions': 'Virksomhedsabonnementer',
  },
}
