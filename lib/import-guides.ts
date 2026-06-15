export type ImportGuideMarket = 'de' | 'dk' | 'pl'

type ImportGuideSection = {
  title: string
  text: string
  points: string[]
}

export type ImportGuide = {
  market: ImportGuideMarket
  language: 'de' | 'da' | 'pl'
  hreflang: string
  host: string
  publicPath: string
  marketPath: string
  slug: string
  country: string
  eyebrow: string
  title: string
  description: string
  intro: string
  updatedLabel: string
  updatedDate: string
  readTime: string
  contentsLabel: string
  facts: Array<{ label: string; value: string }>
  sections: ImportGuideSection[]
  checklistTitle: string
  checklist: string[]
  faqTitle: string
  faq: Array<[string, string]>
  apply: string
  login: string
  backToMarket: string
  ctaTitle: string
  ctaText: string
  disclaimer: string
}

export const importGuides: ImportGuide[] = [
  {
    market: 'pl',
    language: 'pl',
    hreflang: 'pl-PL',
    host: 'https://www.autorell.com',
    publicPath: '/pl/guides/import-from-sweden',
    marketPath: '/pl',
    slug: 'import-from-sweden',
    country: 'Polska',
    eyebrow: 'Przewodnik dla dealerów',
    title: 'Import samochodu ze Szwecji do Polski',
    description:
      'Przewodnik B2B dla polskich dealerów: licytacja, umowa, płatność w ciągu 3 dni roboczych, kontrola Autorell, dokumenty i transport ze Szwecji.',
    intro:
      'Praktyczny przebieg zakupu dla profesjonalnych dealerów. Zobacz, co sprawdzić przed licytacją, kiedy opłacić transakcję i jak Autorell kontroluje samochód przed eksportem.',
    updatedLabel: 'Aktualizacja',
    updatedDate: '15 czerwca 2026',
    readTime: '7 min czytania',
    contentsLabel: 'W tym przewodniku',
    facts: [
      { label: 'Płatność', value: 'Do 3 dni roboczych' },
      { label: 'Kontrola', value: 'W Szwecji przez Autorell' },
      { label: 'Zakup', value: 'Wyłącznie dla firm' },
      { label: 'Logistyka', value: 'Samochód, dokumenty i eksport' },
    ],
    sections: [
      {
        title: 'Przed złożeniem oferty',
        text:
          'Każda oferta dotyczy konkretnego pojazdu zgodnie z profilem, zdjęciami i deklaracją sprzedającego. Przed licytacją dealer powinien ocenić wyposażenie, przebieg, stan, znane usterki oraz dostępne dokumenty.',
        points: [
          'Sprawdź dane firmy, numer VAT i osoby uprawnione do podpisu.',
          'Przeczytaj całą deklarację pojazdu, nie tylko podsumowanie.',
          'Uwzględnij transport, rejestrację i lokalne koszty w kalkulacji.',
        ],
      },
      {
        title: 'Po wygraniu licytacji',
        text:
          'Po zaakceptowaniu oferty cena i warunki zostają zapisane w dokumentach transakcji. Kupujący podpisuje umowę i przekazuje potwierdzoną całkowitą kwotę do Autorell w ciągu 3 dni roboczych.',
        points: [
          'Autorell przesyła dokumenty transakcji do podpisu.',
          'Płatność jest kierowana do Autorell, nie bezpośrednio do nieznanego sprzedawcy.',
          'Odbiór i wydanie dokumentów następują dopiero po potwierdzeniu środków.',
        ],
      },
      {
        title: 'Kontrola pojazdu przez Autorell',
        text:
          'Po zaksięgowaniu środków Autorell kontroluje pojazd w Szwecji i porównuje go z deklaracją sprzedającego. Sprawdzamy między innymi tożsamość pojazdu, przebieg, kontrolki, podstawowe funkcje, widoczny stan oraz zgłoszone uszkodzenia.',
        points: [
          'Istotna rozbieżność jest dokumentowana i natychmiast przekazywana kupującemu.',
          'Transakcja zostaje wstrzymana do czasu decyzji, bez cichej zmiany warunków.',
          'Kupujący może zaakceptować pisemnie nową cenę albo zakończyć transakcję zgodnie z umową.',
        ],
      },
      {
        title: 'Dokumenty, tablice i eksport',
        text:
          'Po zatwierdzonej kontroli Autorell koordynuje szwedzkie dokumenty eksportowe, odbiór oraz uzgodnioną logistykę. Dokumenty lub tablice mogą zostać wysłane przez DHL albo przekazane uzgodnionemu eksporterowi.',
        points: [
          'Transport może odbywać się lawetą, ciężarówką lub drogą morską.',
          'Sposób dostawy, termin i odbiorca są potwierdzane przed wydaniem.',
          'Kupujący otrzymuje informacje potrzebne do śledzenia kolejnego etapu.',
        ],
      },
      {
        title: 'Rejestracja w Polsce',
        text:
          'Kupujący odpowiada za polską rejestrację, podatki, homologację i pozostałe lokalne wymagania, chyba że strony uzgodniły inaczej na piśmie. Przepisy i stawki mogą się zmieniać, dlatego należy je sprawdzić dla konkretnego pojazdu przed złożeniem oferty.',
        points: [
          'Zweryfikuj lokalne wymagania dla rodzaju napędu i specyfikacji pojazdu.',
          'Zachowaj umowę, fakturę i komplet dokumentów eksportowych.',
          'W razie wątpliwości skonsultuj się z właściwym urzędem lub doradcą.',
        ],
      },
    ],
    checklistTitle: 'Lista kontrolna dealera',
    checklist: [
      'Konto dealera i numer VAT są zweryfikowane.',
      'Deklaracja, zdjęcia i znane usterki zostały ocenione.',
      'Całkowity koszt z transportem i rejestracją mieści się w kalkulacji.',
      'Osoba podpisująca umowę jest uprawniona do reprezentacji firmy.',
      'Płatność może zostać wykonana do Autorell w ciągu 3 dni roboczych.',
      'Miejsce odbioru i sposób transportu są ustalone.',
    ],
    faqTitle: 'Najczęstsze pytania',
    faq: [
      ['Kiedy muszę zapłacić za samochód?', 'Potwierdzona całkowita kwota powinna trafić do Autorell w ciągu 3 dni roboczych od wygrania i potwierdzenia transakcji.'],
      ['Co się dzieje, jeśli samochód nie zgadza się z deklaracją?', 'Autorell wstrzymuje transakcję i przekazuje kupującemu udokumentowaną rozbieżność. Strony mogą uzgodnić nową cenę na piśmie albo zakończyć transakcję zgodnie z umową.'],
      ['Czy Autorell organizuje transport do Polski?', 'Autorell koordynuje uzgodnioną logistykę i eksport. Konkretny przewoźnik, trasa, koszt i zakres są potwierdzane dla danej transakcji.'],
      ['Czy podane informacje zastępują poradę podatkową?', 'Nie. Kupujący powinien samodzielnie sprawdzić aktualne polskie wymagania podatkowe, rejestracyjne i homologacyjne dla konkretnego pojazdu.'],
    ],
    apply: 'Złóż wniosek o dostęp',
    login: 'Logowanie dealera',
    backToMarket: 'Rynek Autorell w Polsce',
    ctaTitle: 'Gotowy na zakup samochodów ze Szwecji?',
    ctaText:
      'Dołącz do zweryfikowanej sieci dealerów i licytuj pojazdy w kontrolowanym procesie B2B.',
    disclaimer:
      'Przewodnik opisuje standardowy proces Autorell i nie stanowi porady prawnej ani podatkowej. Ostateczne warunki wynikają z podpisanej umowy i informacji dotyczących konkretnego pojazdu.',
  },
  {
    market: 'dk',
    language: 'da',
    hreflang: 'da-DK',
    host: 'https://www.autorell.com',
    publicPath: '/dk/guides/import-from-sweden',
    marketPath: '/dk',
    slug: 'import-from-sweden',
    country: 'Danmark',
    eyebrow: 'Guide til bilforhandlere',
    title: 'Import af bil fra Sverige til Danmark',
    description:
      'B2B-guide til danske bilforhandlere om bud, aftale, betaling inden 3 hverdage, Autorell-kontrol, eksportdokumenter og transport fra Sverige.',
    intro:
      'En praktisk gennemgang for professionelle forhandlere. Se hvad du bør kontrollere før buddet, hvordan betalingen foregår, og hvordan Autorell verificerer bilen inden eksport.',
    updatedLabel: 'Opdateret',
    updatedDate: '15. juni 2026',
    readTime: '7 minutters læsning',
    contentsLabel: 'I denne guide',
    facts: [
      { label: 'Betaling', value: 'Inden 3 hverdage' },
      { label: 'Kontrol', value: 'I Sverige af Autorell' },
      { label: 'Adgang', value: 'Kun verificerede virksomheder' },
      { label: 'Logistik', value: 'Bil, dokumenter og eksport' },
    ],
    sections: [
      {
        title: 'Før du afgiver bud',
        text:
          'Buddet gælder den konkrete bil ud fra køretøjsprofilen, billederne og sælgerens deklaration. Gennemgå udstyr, kilometerstand, stand, kendte fejl og tilgængelige dokumenter, før du beregner dit bud.',
        points: [
          'Kontrollér virksomhedsoplysninger, momsnummer og tegningsberettiget person.',
          'Læs hele køretøjsdeklarationen og alle oplyste afvigelser.',
          'Medregn transport, registrering og danske omkostninger i kalkulen.',
        ],
      },
      {
        title: 'Efter et vindende bud',
        text:
          'Når buddet er accepteret, fastlægges pris og vilkår i transaktionsdokumenterne. Køber underskriver aftalen og overfører det bekræftede totalbeløb til Autorell inden 3 hverdage.',
        points: [
          'Autorell sender transaktionsdokumenterne til underskrift.',
          'Betalingen går til Autorell og ikke direkte til en ukendt sælger.',
          'Bil og dokumenter frigives først, når betalingen er bekræftet.',
        ],
      },
      {
        title: 'Autorell kontrollerer bilen',
        text:
          'Efter modtaget betaling kontrollerer Autorell bilen i Sverige mod sælgerens deklaration. Vi sammenholder blandt andet identitet, kilometerstand, advarselslamper, centrale funktioner, synlig stand og oplyste skader.',
        points: [
          'En væsentlig afvigelse dokumenteres og meddeles straks til køber.',
          'Handlen sættes på pause, mens køber tager stilling.',
          'Parterne kan aftale en ny pris skriftligt, eller handlen kan ophæves efter aftalen.',
        ],
      },
      {
        title: 'Dokumenter, nummerplader og eksport',
        text:
          'Efter godkendt kontrol koordinerer Autorell svenske eksportdokumenter, afhentning og den aftalte logistik. Dokumenter eller nummerplader kan sendes med DHL eller overdrages til en aftalt eksportør.',
        points: [
          'Transport kan ske med biltransport eller søtransport.',
          'Leveringsform, tidspunkt og modtager bekræftes før frigivelse.',
          'Køber holdes orienteret om næste trin i forløbet.',
        ],
      },
      {
        title: 'Registrering i Danmark',
        text:
          'Køber har ansvaret for dansk registrering, afgifter, godkendelser og øvrige lokale krav, medmindre andet er aftalt skriftligt. Regler og satser kan ændre sig og bør kontrolleres for den konkrete bil før bud.',
        points: [
          'Kontrollér danske krav for drivlinje, alder og køretøjsspecifikation.',
          'Gem aftale, faktura og alle eksportdokumenter.',
          'Indhent faglig rådgivning, hvis afgiftsgrundlaget er uklart.',
        ],
      },
    ],
    checklistTitle: 'Forhandlerens tjekliste',
    checklist: [
      'Forhandlerkonto og momsnummer er verificeret.',
      'Deklaration, billeder og kendte fejl er gennemgået.',
      'Samlet pris inklusive transport og registrering er beregnet.',
      'Underskriveren kan repræsentere virksomheden.',
      'Betaling kan gennemføres til Autorell inden 3 hverdage.',
      'Afhentningssted og transportform er aftalt.',
    ],
    faqTitle: 'Ofte stillede spørgsmål',
    faq: [
      ['Hvornår skal bilen betales?', 'Det bekræftede totalbeløb skal overføres til Autorell inden 3 hverdage efter den vundne og bekræftede handel.'],
      ['Hvad sker der, hvis bilen afviger fra deklarationen?', 'Autorell pauser handlen og sender den dokumenterede afvigelse til køber. Parterne kan skriftligt aftale en ny pris, eller handlen kan ophæves efter aftalen.'],
      ['Arrangerer Autorell transport til Danmark?', 'Autorell koordinerer den aftalte eksport og logistik. Transportør, rute, pris og præcist omfang bekræftes for den enkelte handel.'],
      ['Er guiden afgifts- eller juridisk rådgivning?', 'Nej. Køber skal kontrollere de aktuelle danske registrerings-, afgifts- og godkendelseskrav for den konkrete bil.'],
    ],
    apply: 'Ansøg om forhandleradgang',
    login: 'Forhandlerlogin',
    backToMarket: 'Autorell i Danmark',
    ctaTitle: 'Klar til at købe biler fra Sverige?',
    ctaText:
      'Bliv en del af det verificerede forhandlernetværk og byd gennem en kontrolleret B2B-proces.',
    disclaimer:
      'Guiden beskriver Autorells normale proces og er ikke juridisk eller afgiftsmæssig rådgivning. Den underskrevne aftale og oplysningerne for den konkrete bil er altid gældende.',
  },
  {
    market: 'de',
    language: 'de',
    hreflang: 'de-DE',
    host: 'https://www.autorell.de',
    publicPath: '/ratgeber/fahrzeugimport-aus-schweden',
    marketPath: '/',
    slug: 'import-from-sweden',
    country: 'Deutschland',
    eyebrow: 'Ratgeber für Autohändler',
    title: 'Fahrzeugimport aus Schweden nach Deutschland',
    description:
      'B2B-Ratgeber für deutsche Autohändler: Gebot, Vertrag, Zahlung innerhalb von 3 Werktagen, Autorell-Prüfung, Exportdokumente und Transport.',
    intro:
      'Der praktische Ablauf für professionelle Händler. Erfahren Sie, was vor dem Gebot zu prüfen ist, wie die Zahlung erfolgt und wie Autorell das Fahrzeug vor dem Export kontrolliert.',
    updatedLabel: 'Aktualisiert',
    updatedDate: '15. Juni 2026',
    readTime: '7 Minuten Lesezeit',
    contentsLabel: 'In diesem Ratgeber',
    facts: [
      { label: 'Zahlung', value: 'Innerhalb von 3 Werktagen' },
      { label: 'Prüfung', value: 'In Schweden durch Autorell' },
      { label: 'Zugang', value: 'Nur geprüfte Unternehmen' },
      { label: 'Logistik', value: 'Fahrzeug, Dokumente und Export' },
    ],
    sections: [
      {
        title: 'Vor dem Gebot',
        text:
          'Ihr Gebot bezieht sich auf das konkrete Fahrzeugprofil, die Bilder und die Verkäuferdeklaration. Prüfen Sie Ausstattung, Laufleistung, Zustand, bekannte Mängel und verfügbare Dokumente vollständig, bevor Sie Ihren Einkaufspreis festlegen.',
        points: [
          'Unternehmensdaten, Umsatzsteuer-ID und Zeichnungsberechtigung prüfen.',
          'Die vollständige Fahrzeugdeklaration und alle Abweichungen lesen.',
          'Transport, Zulassung und lokale Kosten in die Kalkulation aufnehmen.',
        ],
      },
      {
        title: 'Nach dem Zuschlag',
        text:
          'Nach Annahme des Gebots werden Preis und Bedingungen in den Transaktionsdokumenten festgehalten. Der Käufer unterzeichnet den Vertrag und überweist den bestätigten Gesamtbetrag innerhalb von 3 Werktagen an Autorell.',
        points: [
          'Autorell stellt die Transaktionsdokumente zur Unterschrift bereit.',
          'Die Käuferzahlung geht an Autorell, nicht direkt an einen unbekannten Verkäufer.',
          'Fahrzeug und Dokumente werden erst nach bestätigtem Geldeingang freigegeben.',
        ],
      },
      {
        title: 'Fahrzeugprüfung durch Autorell',
        text:
          'Nach dem Geldeingang prüft Autorell das Fahrzeug in Schweden gegen die Verkäuferdeklaration. Verglichen werden unter anderem Identität, Laufleistung, Warnleuchten, Hauptfunktionen, sichtbarer Zustand und deklarierte Schäden.',
        points: [
          'Eine wesentliche Abweichung wird dokumentiert und dem Käufer sofort mitgeteilt.',
          'Die Transaktion wird bis zur Entscheidung des Käufers pausiert.',
          'Die Parteien können schriftlich einen neuen Preis vereinbaren oder nach Vertrag abbrechen.',
        ],
      },
      {
        title: 'Dokumente, Kennzeichen und Export',
        text:
          'Nach erfolgreicher Prüfung koordiniert Autorell die schwedischen Exportdokumente, Abholung und vereinbarte Logistik. Dokumente oder Kennzeichen können per DHL versendet oder einem abgestimmten Exportpartner übergeben werden.',
        points: [
          'Der Transport kann per Fahrzeugtransporter oder Schiff erfolgen.',
          'Übergabeart, Termin und Empfänger werden vor der Freigabe bestätigt.',
          'Der Käufer erhält klare Informationen zum jeweils nächsten Schritt.',
        ],
      },
      {
        title: 'Zulassung in Deutschland',
        text:
          'Der Käufer ist für deutsche Zulassung, Steuern, Genehmigungen und weitere lokale Anforderungen verantwortlich, sofern nichts anderes schriftlich vereinbart wurde. Anforderungen können sich ändern und sollten vor dem Gebot für das konkrete Fahrzeug geprüft werden.',
        points: [
          'Lokale Anforderungen für Antrieb, Alter und Fahrzeugspezifikation prüfen.',
          'Vertrag, Rechnung und vollständige Exportdokumente aufbewahren.',
          'Bei offenen Steuer- oder Zulassungsfragen fachlichen Rat einholen.',
        ],
      },
    ],
    checklistTitle: 'Checkliste für den Fahrzeugeinkauf',
    checklist: [
      'Händlerkonto und Umsatzsteuer-ID sind geprüft.',
      'Deklaration, Bilder und bekannte Mängel wurden bewertet.',
      'Gesamtkosten inklusive Transport und Zulassung sind kalkuliert.',
      'Die unterzeichnende Person darf das Unternehmen vertreten.',
      'Die Zahlung an Autorell ist innerhalb von 3 Werktagen möglich.',
      'Abholort und Transportart sind abgestimmt.',
    ],
    faqTitle: 'Häufige Fragen',
    faq: [
      ['Wann muss das Fahrzeug bezahlt werden?', 'Der bestätigte Gesamtbetrag ist innerhalb von 3 Werktagen nach dem gewonnenen und bestätigten Geschäft an Autorell zu überweisen.'],
      ['Was passiert bei einer Abweichung von der Deklaration?', 'Autorell pausiert die Transaktion und informiert den Käufer mit der dokumentierten Abweichung. Die Parteien können schriftlich einen neuen Preis vereinbaren oder nach Vertrag abbrechen.'],
      ['Organisiert Autorell den Transport nach Deutschland?', 'Autorell koordiniert den vereinbarten Export und die Logistik. Transporteur, Route, Kosten und genauer Umfang werden für die jeweilige Transaktion bestätigt.'],
      ['Ersetzt dieser Ratgeber eine Steuer- oder Rechtsberatung?', 'Nein. Der Käufer muss die aktuellen deutschen Steuer-, Zulassungs- und Genehmigungsanforderungen für das konkrete Fahrzeug selbst prüfen.'],
    ],
    apply: 'Händlerzugang beantragen',
    login: 'Händler-Login',
    backToMarket: 'Autorell Deutschland',
    ctaTitle: 'Bereit für Fahrzeuge aus Schweden?',
    ctaText:
      'Werden Sie Teil des geprüften Händlernetzwerks und bieten Sie in einem kontrollierten B2B-Prozess.',
    disclaimer:
      'Der Ratgeber beschreibt den üblichen Autorell-Prozess und ist keine Rechts- oder Steuerberatung. Maßgeblich sind der unterzeichnete Vertrag und die Angaben zum konkreten Fahrzeug.',
  },
]

export function getImportGuide(market: string, slug: string) {
  return importGuides.find(
    (guide) => guide.market === market && guide.slug === slug,
  )
}

export function getImportGuideForMarket(market: string) {
  return importGuides.find((guide) => guide.market === market)
}

export function getImportGuideAlternates() {
  return Object.fromEntries([
    ...importGuides.map((guide) => [
      guide.hreflang,
      `${guide.host}${guide.publicPath}`,
    ]),
    ['x-default', 'https://www.autorell.com/how-it-works'],
  ])
}

export function getImportGuidePaths(host: 'de' | 'en') {
  return importGuides
    .filter((guide) =>
      host === 'de'
        ? guide.host.endsWith('autorell.de')
        : guide.host.endsWith('autorell.com'),
    )
    .map((guide) => guide.publicPath)
}
