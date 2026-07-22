import type { BenefitsCopy } from './WhyChooseAutorellPage'
import type { PublicLocale } from '@/lib/public-i18n'

type VanCopy = Pick<BenefitsCopy, 'metaTitle' | 'metaDescription' | 'eyebrow' | 'title' | 'intro' | 'primaryCta' | 'proof' | 'stepsTitle' | 'steps' | 'seoTitle' | 'seoText' | 'faqTitle' | 'faqs'>

const commonFaqs: Record<PublicLocale, VanCopy['faqs']> = {
  sv: [
    { question: 'Är det gratis att annonsera en transportbil?', answer: 'Ja. Grundannonsen är gratis i 5 dagar. Du betalar bara om du vill annonsera längre eller öka synligheten.' },
    { question: 'Vilka transportbilar kan jag sälja?', answer: 'Du kan annonsera skåpbilar, arbetsfordon och andra transportbilar för företag eller privat bruk.' },
    { question: 'Kan jag lägga till bilder och fordonsdata?', answer: 'Ja. Lägg till bilder, tekniska uppgifter, pris och plats i samma tydliga flöde.' },
  ],
  en: [
    { question: 'Is it free to list a van?', answer: 'Yes. The core listing is free for 5 days. Pay only when you want longer publishing or more visibility.' },
    { question: 'Which vans can I sell?', answer: 'List panel vans, work vans and other commercial vehicles for business or private use.' },
    { question: 'Can I add photos and vehicle details?', answer: 'Yes. Add photos, technical details, price and location in one clear flow.' },
  ],
  de: [
    { question: 'Ist das Inserieren eines Transporters kostenlos?', answer: 'Ja. Das Basisinserat ist 5 Tage kostenlos. Sie zahlen nur für eine längere Laufzeit oder mehr Sichtbarkeit.' },
    { question: 'Welche Transporter kann ich verkaufen?', answer: 'Inserieren Sie Kastenwagen, Arbeitsfahrzeuge und andere Nutzfahrzeuge für Gewerbe oder privat.' },
    { question: 'Kann ich Bilder und Fahrzeugdaten hinzufügen?', answer: 'Ja. Ergänzen Sie Bilder, technische Daten, Preis und Standort in einem klaren Ablauf.' },
  ],
  at: [
    { question: 'Ist das Inserieren eines Transporters kostenlos?', answer: 'Ja. Das Basisinserat ist 5 Tage kostenlos. Sie zahlen nur für eine längere Laufzeit oder mehr Sichtbarkeit.' },
    { question: 'Welche Transporter kann ich verkaufen?', answer: 'Inserieren Sie Kastenwagen, Arbeitsfahrzeuge und andere Nutzfahrzeuge für Gewerbe oder privat.' },
    { question: 'Kann ich Bilder und Fahrzeugdaten hinzufügen?', answer: 'Ja. Ergänzen Sie Bilder, technische Daten, Preis und Standort in einem klaren Ablauf.' },
  ],
  fr: [
    { question: 'Publier un utilitaire est-il gratuit ?', answer: 'Oui. L’annonce de base est gratuite pendant 5 jours. Vous payez seulement pour prolonger ou gagner en visibilité.' },
    { question: 'Quels utilitaires puis-je vendre ?', answer: 'Publiez des fourgons, véhicules de travail et autres utilitaires pour professionnels ou particuliers.' },
    { question: 'Puis-je ajouter des photos et les détails du véhicule ?', answer: 'Oui. Ajoutez photos, caractéristiques, prix et lieu dans un parcours clair.' },
  ],
  be: [
    { question: 'Is een bestelwagen plaatsen gratis?', answer: 'Ja. De basisadvertentie is 5 dagen gratis. Je betaalt alleen voor langer publiceren of extra zichtbaarheid.' },
    { question: 'Welke bestelwagens kan ik verkopen?', answer: 'Plaats bestelwagens, werkvoertuigen en andere bedrijfswagens voor professioneel of privégebruik.' },
    { question: 'Kan ik foto’s en voertuiggegevens toevoegen?', answer: 'Ja. Voeg foto’s, technische gegevens, prijs en locatie toe in één duidelijk proces.' },
  ],
  es: [
    { question: '¿Es gratis anunciar una furgoneta?', answer: 'Sí. El anuncio básico es gratis durante 5 días. Solo pagas por más tiempo o visibilidad adicional.' },
    { question: '¿Qué furgonetas puedo vender?', answer: 'Publica furgonetas, vehículos de trabajo y otros vehículos comerciales para empresas o particulares.' },
    { question: '¿Puedo añadir fotos y datos del vehículo?', answer: 'Sí. Añade fotos, datos técnicos, precio y ubicación en un proceso claro.' },
  ],
  it: [
    { question: 'Pubblicare un furgone è gratuito?', answer: 'Sì. L’annuncio base è gratuito per 5 giorni. Paghi solo per più tempo o maggiore visibilità.' },
    { question: 'Quali furgoni posso vendere?', answer: 'Pubblica furgoni, veicoli da lavoro e altri veicoli commerciali per aziende o privati.' },
    { question: 'Posso aggiungere foto e dati del veicolo?', answer: 'Sì. Inserisci foto, dati tecnici, prezzo e posizione in un percorso chiaro.' },
  ],
  nl: [
    { question: 'Is een bestelwagen plaatsen gratis?', answer: 'Ja. De basisadvertentie is 5 dagen gratis. Betaal alleen voor langer publiceren of extra zichtbaarheid.' },
    { question: 'Welke bestelwagens kan ik verkopen?', answer: 'Plaats bestelwagens, werkvoertuigen en andere bedrijfswagens voor zakelijk of privégebruik.' },
    { question: 'Kan ik foto’s en voertuiggegevens toevoegen?', answer: 'Ja. Voeg foto’s, technische gegevens, prijs en locatie toe in één duidelijk proces.' },
  ],
  pl: [
    { question: 'Czy ogłoszenie vana jest bezpłatne?', answer: 'Tak. Podstawowe ogłoszenie jest bezpłatne przez 5 dni. Płacisz tylko za dłuższą publikację lub większą widoczność.' },
    { question: 'Jakie samochody dostawcze mogę sprzedać?', answer: 'Dodaj vana, samochód dostawczy lub inne auto użytkowe do celów firmowych albo prywatnych.' },
    { question: 'Czy mogę dodać zdjęcia i dane pojazdu?', answer: 'Tak. Dodaj zdjęcia, dane techniczne, cenę i lokalizację w jednym przejrzystym procesie.' },
  ],
  da: [
    { question: 'Er det gratis at annoncere en varebil?', answer: 'Ja. Grundannoncen er gratis i 5 dage. Betal kun for længere annoncering eller ekstra synlighed.' },
    { question: 'Hvilke varebiler kan jeg sælge?', answer: 'Annoncér varebiler, arbejdsbiler og andre erhvervskøretøjer til virksomhed eller privat brug.' },
    { question: 'Kan jeg tilføje billeder og køretøjsdata?', answer: 'Ja. Tilføj billeder, tekniske data, pris og placering i ét tydeligt flow.' },
  ],
  fi: [
    { question: 'Onko pakettiauton ilmoittaminen ilmaista?', answer: 'Kyllä. Perusilmoitus on ilmainen 5 päivän ajan. Maksat vain pidemmästä ajasta tai lisänäkyvyydestä.' },
    { question: 'Millaisia pakettiautoja voin myydä?', answer: 'Ilmoita pakettiautoja, työautoja ja muita hyötyajoneuvoja yritys- tai yksityiskäyttöön.' },
    { question: 'Voinko lisätä kuvia ja ajoneuvon tiedot?', answer: 'Kyllä. Lisää kuvat, tekniset tiedot, hinta ja sijainti selkeässä prosessissa.' },
  ],
}

const baseSteps = {
  sv: [{ title: 'Lägg in transportbilen', text: 'Fyll i modell, pris, plats och bilder i ett enkelt flöde för arbetsfordon.' }, { title: 'Publicera gratis', text: 'Din grundannons ligger ute gratis i 5 dagar. Förläng bara när du behöver det.' }, { title: 'Nå rätt köpare', text: 'Köpare kan hitta transportbilen via sök, kategori och marknad och kontakta dig direkt.' }],
  en: [{ title: 'Add the van', text: 'Enter the model, price, location and photos in a clear flow for work vehicles.' }, { title: 'Publish for free', text: 'Your core listing is free for 5 days. Extend it only when you need to.' }, { title: 'Reach the right buyer', text: 'Buyers find your van through search, category and market pages and contact you directly.' }],
  de: [{ title: 'Transporter eintragen', text: 'Ergänzen Sie Modell, Preis, Standort und Bilder in einem klaren Ablauf für Nutzfahrzeuge.' }, { title: 'Kostenlos veröffentlichen', text: 'Das Basisinserat ist 5 Tage kostenlos. Verlängern Sie nur bei Bedarf.' }, { title: 'Passende Käufer erreichen', text: 'Käufer finden den Transporter über Suche, Kategorie und Markt und kontaktieren Sie direkt.' }],
  at: [{ title: 'Transporter eintragen', text: 'Ergänzen Sie Modell, Preis, Standort und Bilder in einem klaren Ablauf für Nutzfahrzeuge.' }, { title: 'Kostenlos veröffentlichen', text: 'Das Basisinserat ist 5 Tage kostenlos. Verlängern Sie nur bei Bedarf.' }, { title: 'Passende Käufer erreichen', text: 'Käufer finden den Transporter über Suche, Kategorie und Markt und kontaktieren Sie direkt.' }],
  fr: [{ title: 'Ajoutez votre utilitaire', text: 'Saisissez le modèle, le prix, le lieu et les photos dans un parcours conçu pour les utilitaires.' }, { title: 'Publiez gratuitement', text: 'L’annonce de base est gratuite pendant 5 jours. Prolongez-la seulement si nécessaire.' }, { title: 'Trouvez le bon acheteur', text: 'Les acheteurs trouvent votre utilitaire par recherche, catégorie et marché, puis vous contactent.' }],
  be: [{ title: 'Voeg je bestelwagen toe', text: 'Vul model, prijs, locatie en foto’s in via een duidelijk proces voor bedrijfswagens.' }, { title: 'Gratis publiceren', text: 'De basisadvertentie is 5 dagen gratis. Verleng alleen wanneer dat nodig is.' }, { title: 'Bereik de juiste koper', text: 'Kopers vinden je bestelwagen via zoeken, categorie en markt en nemen direct contact op.' }],
  es: [{ title: 'Añade tu furgoneta', text: 'Introduce modelo, precio, ubicación y fotos en un proceso claro para vehículos comerciales.' }, { title: 'Publica gratis', text: 'El anuncio básico es gratis durante 5 días. Amplíalo solo cuando lo necesites.' }, { title: 'Llega al comprador adecuado', text: 'Los compradores encuentran tu furgoneta por búsqueda, categoría y mercado y te contactan.' }],
  it: [{ title: 'Inserisci il furgone', text: 'Aggiungi modello, prezzo, posizione e foto in un flusso pensato per i veicoli commerciali.' }, { title: 'Pubblica gratis', text: 'L’annuncio base è gratuito per 5 giorni. Prolungalo solo quando serve.' }, { title: 'Raggiungi l’acquirente giusto', text: 'Gli acquirenti trovano il furgone tramite ricerca, categoria e mercato e ti contattano.' }],
  nl: [{ title: 'Voeg je bestelwagen toe', text: 'Vul model, prijs, locatie en foto’s in via een duidelijk proces voor bedrijfswagens.' }, { title: 'Gratis publiceren', text: 'De basisadvertentie is 5 dagen gratis. Verleng alleen wanneer dat nodig is.' }, { title: 'Bereik de juiste koper', text: 'Kopers vinden je bestelwagen via zoeken, categorie en markt en nemen direct contact op.' }],
  pl: [{ title: 'Dodaj samochód dostawczy', text: 'Wpisz model, cenę, lokalizację i zdjęcia w przejrzystym procesie dla aut użytkowych.' }, { title: 'Opublikuj za darmo', text: 'Podstawowe ogłoszenie jest bezpłatne przez 5 dni. Przedłuż je tylko w razie potrzeby.' }, { title: 'Dotrzyj do właściwego kupującego', text: 'Kupujący znajdą vana przez wyszukiwarkę, kategorię i rynek i skontaktują się z Tobą.' }],
  da: [{ title: 'Opret varebilen', text: 'Indtast model, pris, placering og billeder i et tydeligt flow til erhvervskøretøjer.' }, { title: 'Udgiv gratis', text: 'Grundannoncen er gratis i 5 dage. Forlæng kun, når du har brug for det.' }, { title: 'Nå den rigtige køber', text: 'Købere finder varebilen via søgning, kategori og marked og kontakter dig direkte.' }],
  fi: [{ title: 'Lisää pakettiauto', text: 'Syötä malli, hinta, sijainti ja kuvat hyötyajoneuvoille suunnitellussa selkeässä prosessissa.' }, { title: 'Julkaise ilmaiseksi', text: 'Perusilmoitus on ilmainen 5 päivän ajan. Jatka vain tarvittaessa.' }, { title: 'Tavoita oikea ostaja', text: 'Ostajat löytävät pakettiauton haun, kategorian ja markkinan kautta ja ottavat yhteyttä.' }],
}

const labels: Record<PublicLocale, { eyebrow: string; title: string; intro: string; cta: string; proof: string; stepsTitle: string; seoTitle: string; seoText: string; faqTitle: string }> = {
  sv: { eyebrow: 'Sälj transportbil på Autorell', title: 'Sälj din transportbil gratis', intro: 'Skapa en tydlig annons på några minuter och nå köpare som söker rätt arbetsfordon.', cta: 'Kom igång gratis', proof: 'Gratis grundannons i 5 dagar. Betala bara för längre publicering eller extra synlighet.', stepsTitle: 'Tre enkla steg till en såld transportbil', seoTitle: 'Byggd för transportbilar och seriösa köpare', seoText: 'Autorell gör det enkelt att annonsera skåpbilar och andra transportbilar med rätt fordonsdata, pris, bilder och marknad på en plats.', faqTitle: 'Vanliga frågor om att sälja transportbil' },
  en: { eyebrow: 'Sell vans on Autorell', title: 'Sell your van for free', intro: 'Create a clear listing in minutes and reach buyers looking for the right work vehicle.', cta: 'Get started for free', proof: 'Free core listing for 5 days. Pay only for longer publishing or extra visibility.', stepsTitle: 'Three simple steps to sell your van', seoTitle: 'Built for vans and serious buyers', seoText: 'Autorell makes it easy to list panel vans and commercial vehicles with the right details, price, photos and market in one place.', faqTitle: 'Selling a van FAQs' },
  de: { eyebrow: 'Transporter auf Autorell verkaufen', title: 'Transporter kostenlos verkaufen', intro: 'Erstellen Sie in wenigen Minuten ein klares Inserat und erreichen Sie passende Käufer.', cta: 'Kostenlos starten', proof: '5 Tage kostenlos. Zahlen Sie nur für längere Laufzeit oder mehr Sichtbarkeit.', stepsTitle: 'Drei einfache Schritte zum Verkauf', seoTitle: 'Für Transporter und passende Käufer', seoText: 'Autorell macht es einfach, Kastenwagen und Nutzfahrzeuge mit Daten, Preis, Bildern und Markt an einem Ort zu inserieren.', faqTitle: 'Häufige Fragen zum Transporter-Verkauf' },
  at: { eyebrow: 'Transporter auf Autorell verkaufen', title: 'Transporter kostenlos verkaufen', intro: 'Erstellen Sie schnell ein klares Inserat und erreichen Sie passende Käufer in Österreich.', cta: 'Kostenlos starten', proof: '5 Tage kostenlos. Zahlen Sie nur für längere Laufzeit oder mehr Sichtbarkeit.', stepsTitle: 'Drei einfache Schritte zum Verkauf', seoTitle: 'Für Transporter und passende Käufer', seoText: 'Inserieren Sie Kastenwagen und Nutzfahrzeuge mit Daten, Preis, Bildern und österreichischem Markt an einem Ort.', faqTitle: 'Häufige Fragen zum Transporter-Verkauf' },
  fr: { eyebrow: 'Vendre son utilitaire sur Autorell', title: 'Vendez votre utilitaire gratuitement', intro: 'Créez une annonce claire en quelques minutes et touchez les acheteurs adaptés.', cta: 'Commencer gratuitement', proof: 'Gratuit pendant 5 jours. Payez seulement pour prolonger ou gagner en visibilité.', stepsTitle: 'Trois étapes simples pour vendre', seoTitle: 'Conçu pour les utilitaires et les bons acheteurs', seoText: 'Autorell facilite la publication de fourgons et utilitaires avec leurs caractéristiques, prix, photos et marché au même endroit.', faqTitle: 'Questions fréquentes sur la vente d’un utilitaire' },
  be: { eyebrow: 'Verkoop je bestelwagen op Autorell', title: 'Verkoop je bestelwagen gratis', intro: 'Maak in enkele minuten een duidelijke advertentie en bereik geïnteresseerde kopers.', cta: 'Gratis beginnen', proof: '5 dagen gratis. Betaal alleen voor langer publiceren of extra zichtbaarheid.', stepsTitle: 'Drie eenvoudige stappen naar verkoop', seoTitle: 'Voor bestelwagens en serieuze kopers', seoText: 'Autorell maakt het eenvoudig om bestelwagens en bedrijfswagens te plaatsen met gegevens, prijs, foto’s en markt op één plek.', faqTitle: 'Veelgestelde vragen over bestelwagens' },
  es: { eyebrow: 'Vende tu furgoneta en Autorell', title: 'Vende tu furgoneta gratis', intro: 'Crea un anuncio claro en pocos minutos y llega a compradores interesados.', cta: 'Empezar gratis', proof: 'Gratis durante 5 días. Paga solo por más tiempo o visibilidad adicional.', stepsTitle: 'Tres pasos sencillos para vender', seoTitle: 'Pensado para furgonetas y compradores serios', seoText: 'Autorell facilita anunciar furgonetas y vehículos comerciales con datos, precio, fotos y mercado en un solo lugar.', faqTitle: 'Preguntas frecuentes sobre vender una furgoneta' },
  it: { eyebrow: 'Vendi il tuo furgone su Autorell', title: 'Vendi il tuo furgone gratis', intro: 'Crea un annuncio chiaro in pochi minuti e raggiungi acquirenti interessati.', cta: 'Inizia gratis', proof: 'Gratis per 5 giorni. Paghi solo per più tempo o maggiore visibilità.', stepsTitle: 'Tre semplici passaggi per vendere', seoTitle: 'Pensato per furgoni e acquirenti seri', seoText: 'Autorell semplifica la pubblicazione di furgoni e veicoli commerciali con dati, prezzo, foto e mercato in un unico posto.', faqTitle: 'Domande frequenti sulla vendita di un furgone' },
  nl: { eyebrow: 'Verkoop je bestelwagen op Autorell', title: 'Verkoop je bestelwagen gratis', intro: 'Maak in enkele minuten een duidelijke advertentie en bereik geïnteresseerde kopers.', cta: 'Gratis beginnen', proof: '5 dagen gratis. Betaal alleen voor langer publiceren of extra zichtbaarheid.', stepsTitle: 'Drie eenvoudige stappen naar verkoop', seoTitle: 'Voor bestelwagens en serieuze kopers', seoText: 'Autorell maakt het eenvoudig om bestelwagens en bedrijfswagens te plaatsen met gegevens, prijs, foto’s en markt op één plek.', faqTitle: 'Veelgestelde vragen over bestelwagens' },
  pl: { eyebrow: 'Sprzedaj vana na Autorell', title: 'Sprzedaj vana za darmo', intro: 'Utwórz przejrzyste ogłoszenie w kilka minut i dotrzyj do zainteresowanych kupujących.', cta: 'Zacznij za darmo', proof: 'Za darmo przez 5 dni. Płacisz tylko za dłuższą publikację lub większą widoczność.', stepsTitle: 'Trzy proste kroki do sprzedaży', seoTitle: 'Dla vanów i poważnych kupujących', seoText: 'Autorell ułatwia publikowanie vanów i aut użytkowych z danymi, ceną, zdjęciami i rynkiem w jednym miejscu.', faqTitle: 'Najczęstsze pytania o sprzedaż vana' },
  da: { eyebrow: 'Sælg varebil på Autorell', title: 'Sælg din varebil gratis', intro: 'Opret en tydelig annonce på få minutter og nå købere, der søger det rigtige erhvervskøretøj.', cta: 'Kom gratis i gang', proof: 'Gratis i 5 dage. Betal kun for længere annoncering eller ekstra synlighed.', stepsTitle: 'Tre enkle trin til at sælge', seoTitle: 'Bygget til varebiler og seriøse købere', seoText: 'Autorell gør det enkelt at annoncere varebiler og erhvervskøretøjer med data, pris, billeder og marked samlet ét sted.', faqTitle: 'Ofte stillede spørgsmål om varebiler' },
  fi: { eyebrow: 'Myy pakettiauto Autorellissa', title: 'Myy pakettiautosi ilmaiseksi', intro: 'Luo selkeä ilmoitus muutamassa minuutissa ja tavoita oikeaa hyötyajoneuvoa etsivät ostajat.', cta: 'Aloita ilmaiseksi', proof: 'Ilmainen 5 päivää. Maksat vain pidemmästä ajasta tai lisänäkyvyydestä.', stepsTitle: 'Kolme helppoa vaihetta myyntiin', seoTitle: 'Suunniteltu pakettiautoille ja ostajille', seoText: 'Autorellissa voit ilmoittaa pakettiauton tai muun hyötyajoneuvon tiedot, hinnan, kuvat ja markkinan yhdessä paikassa.', faqTitle: 'Usein kysyttyä pakettiauton myynnistä' },
}

export function getVanBenefitsCopy(locale: PublicLocale): VanCopy {
  const labelsForLocale = labels[locale] || labels.en
  const steps = baseSteps[locale] || baseSteps.en
  return {
    metaTitle: labelsForLocale.title,
    metaDescription: labelsForLocale.intro,
    ...labelsForLocale,
    primaryCta: labelsForLocale.cta,
    steps,
    faqs: commonFaqs[locale] || commonFaqs.en,
  }
}
