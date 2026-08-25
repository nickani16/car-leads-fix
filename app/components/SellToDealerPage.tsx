import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { BadgeCheck, CheckCircle2, ChevronDown, Clock3, Gauge, ShieldCheck, Tag } from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import SellToDealerLeadForm, { type SellToDealerFormCopy } from '@/app/components/SellToDealerLeadForm'
import { cleanSeoText } from '@/lib/market-seo'
import { getPublicLanguageAlternates, publicUrlForPath } from '@/lib/public-seo'
import {
  isPublicLanguage,
  localizePublicHref,
  translationLocale,
  type PublicLocale,
} from '@/lib/public-i18n'

type SellToDealerCopy = SellToDealerFormCopy & {
  metaTitle: string
  metaDescription: string
  heroTitle: string
  heroText: string
  alternativeText: string
  alternativeCta: string
  howTitle: string
  howSteps: Array<{ title: string; text: string }>
  benefitsTitle: string
  benefits: Array<{ title: string; text: string }>
  dealerPlanNote: string
}

type DealerContactCopy = Pick<
  SellToDealerFormCopy,
  | 'contactTitle'
  | 'contactNameLabel'
  | 'contactNamePlaceholder'
  | 'contactEmailLabel'
  | 'contactEmailPlaceholder'
  | 'contactPhoneLabel'
  | 'contactPhonePlaceholder'
  | 'contactHelp'
  | 'detailsHelp'
>

type SellToDealerBaseCopy = Omit<SellToDealerCopy, keyof DealerContactCopy>

type SellToDealerExtraCopy = {
  listingEyebrow: string
  listingTitle: string
  listingCta: string
  listingHowTitle: string
  listingHowSteps: Array<{ title: string; text: string }>
  listingBenefitsTitle: string
  listingBenefits: Array<{ title: string; text: string }>
  questionsTitle: string
  questions: Array<{ question: string; answer: string }>
}

const contactCopyByLocale: Record<Exclude<PublicLocale, 'at' | 'be'>, DealerContactCopy> = {
  sv: {
    contactTitle: 'Dina kontaktuppgifter',
    contactNameLabel: 'Namn',
    contactNamePlaceholder: 'För- och efternamn',
    contactEmailLabel: 'E-post',
    contactEmailPlaceholder: 'namn@example.com',
    contactPhoneLabel: 'Telefonnummer',
    contactPhonePlaceholder: '070 123 45 67',
    contactHelp: 'Fyll i namn, e-post och telefonnummer så handlaren kan kontakta dig.',
    detailsHelp: 'Berätta kort om skick, service, mätarställning eller annat som påverkar budet.',
  },
  en: {
    contactTitle: 'Your contact details',
    contactNameLabel: 'Name',
    contactNamePlaceholder: 'First and last name',
    contactEmailLabel: 'Email',
    contactEmailPlaceholder: 'name@example.com',
    contactPhoneLabel: 'Phone number',
    contactPhonePlaceholder: '+46 70 123 45 67',
    contactHelp: 'Enter name, email and phone number so the dealer can contact you.',
    detailsHelp: 'Tell us briefly about condition, service history, mileage or anything that affects the offer.',
  },
  de: {
    contactTitle: 'Ihre Kontaktdaten',
    contactNameLabel: 'Name',
    contactNamePlaceholder: 'Vor- und Nachname',
    contactEmailLabel: 'E-Mail',
    contactEmailPlaceholder: 'name@example.com',
    contactPhoneLabel: 'Telefonnummer',
    contactPhonePlaceholder: '+49 170 1234567',
    contactHelp: 'Geben Sie Name, E-Mail und Telefonnummer ein, damit der Händler Sie kontaktieren kann.',
    detailsHelp: 'Beschreiben Sie kurz Zustand, Servicehistorie, Kilometerstand oder andere angebotsrelevante Punkte.',
  },
  fr: {
    contactTitle: 'Vos coordonnées',
    contactNameLabel: 'Nom',
    contactNamePlaceholder: 'Prénom et nom',
    contactEmailLabel: 'E-mail',
    contactEmailPlaceholder: 'nom@example.com',
    contactPhoneLabel: 'Téléphone',
    contactPhonePlaceholder: '+33 6 12 34 56 78',
    contactHelp: 'Indiquez nom, e-mail et téléphone afin que le professionnel puisse vous contacter.',
    detailsHelp: 'Décrivez brièvement l’état, l’entretien, le kilométrage ou tout élément qui influence l’offre.',
  },
  es: {
    contactTitle: 'Tus datos de contacto',
    contactNameLabel: 'Nombre',
    contactNamePlaceholder: 'Nombre y apellidos',
    contactEmailLabel: 'Correo electrónico',
    contactEmailPlaceholder: 'nombre@example.com',
    contactPhoneLabel: 'Teléfono',
    contactPhonePlaceholder: '+34 600 123 456',
    contactHelp: 'Introduce nombre, correo y teléfono para que el concesionario pueda contactarte.',
    detailsHelp: 'Describe brevemente estado, historial de servicio, kilometraje u otros datos que afecten la oferta.',
  },
  it: {
    contactTitle: 'I tuoi contatti',
    contactNameLabel: 'Nome',
    contactNamePlaceholder: 'Nome e cognome',
    contactEmailLabel: 'E-mail',
    contactEmailPlaceholder: 'nome@example.com',
    contactPhoneLabel: 'Telefono',
    contactPhonePlaceholder: '+39 312 345 6789',
    contactHelp: 'Inserisci nome, e-mail e telefono così il concessionario può contattarti.',
    detailsHelp: 'Descrivi brevemente condizioni, tagliandi, chilometraggio o altro che può influire sull’offerta.',
  },
  nl: {
    contactTitle: 'Je contactgegevens',
    contactNameLabel: 'Naam',
    contactNamePlaceholder: 'Voor- en achternaam',
    contactEmailLabel: 'E-mail',
    contactEmailPlaceholder: 'naam@example.com',
    contactPhoneLabel: 'Telefoonnummer',
    contactPhonePlaceholder: '+31 6 12345678',
    contactHelp: 'Vul naam, e-mail en telefoonnummer in zodat de dealer contact kan opnemen.',
    detailsHelp: 'Vertel kort over staat, onderhoud, kilometerstand of andere informatie die het bod beïnvloedt.',
  },
  fi: {
    contactTitle: 'Yhteystietosi',
    contactNameLabel: 'Nimi',
    contactNamePlaceholder: 'Etu- ja sukunimi',
    contactEmailLabel: 'Sähköposti',
    contactEmailPlaceholder: 'nimi@example.com',
    contactPhoneLabel: 'Puhelinnumero',
    contactPhonePlaceholder: '+358 40 123 4567',
    contactHelp: 'Täytä nimi, sähköposti ja puhelinnumero, jotta liike voi ottaa yhteyttä.',
    detailsHelp: 'Kerro lyhyesti kunnosta, huolloista, ajokilometreistä tai muusta tarjoukseen vaikuttavasta.',
  },
  da: {
    contactTitle: 'Dine kontaktoplysninger',
    contactNameLabel: 'Navn',
    contactNamePlaceholder: 'For- og efternavn',
    contactEmailLabel: 'E-mail',
    contactEmailPlaceholder: 'navn@example.com',
    contactPhoneLabel: 'Telefonnummer',
    contactPhonePlaceholder: '+45 12 34 56 78',
    contactHelp: 'Udfyld navn, e-mail og telefonnummer, så forhandleren kan kontakte dig.',
    detailsHelp: 'Fortæl kort om stand, service, kilometertal eller andet, der påvirker buddet.',
  },
  pl: {
    contactTitle: 'Dane kontaktowe',
    contactNameLabel: 'Imię i nazwisko',
    contactNamePlaceholder: 'Imię i nazwisko',
    contactEmailLabel: 'E-mail',
    contactEmailPlaceholder: 'imie@example.com',
    contactPhoneLabel: 'Telefon',
    contactPhonePlaceholder: '+48 600 123 456',
    contactHelp: 'Wpisz imię i nazwisko, e-mail oraz telefon, aby dealer mógł się skontaktować.',
    detailsHelp: 'Opisz krótko stan, serwis, przebieg lub inne informacje wpływające na ofertę.',
  },
}

const copyByLocale: Record<Exclude<PublicLocale, 'at' | 'be'>, SellToDealerBaseCopy> = {
  sv: {
    metaTitle: 'Sälj till handlare | Autorell',
    metaDescription: 'Skicka VIN och fordonsuppgifter och låt anslutna handlare på Autorell lämna bud.',
    heroTitle: 'Sälj ditt fordon till en handlare, snabbt och tryggt.',
    heroText: 'Ange VIN och märke eller modell så kan anslutna handlare bedöma fordonet och återkomma med bud.',
    formTitle: 'Se ditt fordons värde och få handlarbud',
    formText: 'VIN hjälper handlare att identifiera rätt fordon. Du kan även skriva märke och modell fritt.',
    vinLabel: 'VIN',
    vinPlaceholder: 'Ange VIN',
    makeLabel: 'Märke eller modell',
    makePlaceholder: 'Till exempel Volvo XC60',
    modelLabel: 'Modell',
    modelPlaceholder: 'XC60',
    yearLabel: 'Årsmodell',
    yearPlaceholder: '2021',
    detailsLabel: 'Berätta om bilen',
    detailsPlaceholder: 'Skador, servicehistorik, mätarställning, däck, nycklar, utrustning och annat som en bilhandlare bör veta innan bud.',
    continue: 'Fortsätt',
    noVin: 'Vet du inte ditt VIN?',
    noVinLink: 'Ange märke manuellt',
    vinError: 'VIN ska vara 17 tecken och får inte innehålla I, O eller Q.',
    manualHelp: 'Fyll i märke, modell och årsmodell om du saknar VIN.',
    requiredError: 'Minst ett giltigt VIN eller märke, modell och årsmodell behövs.',
    submitError: 'Förfrågan kunde inte skickas just nu. Försök igen.',
    successTitle: 'Förfrågan är skickad',
    successText: 'Handlare med Growth, Professional eller Enterprise kan nu hantera ditt fordonsunderlag.',
    sending: 'Skickar...',
    alternativeText: 'Vill du sälja på annat sätt? Skapa en annons och sälj själv.',
    alternativeCta: 'Skapa annons',
    howTitle: 'Så fungerar det',
    howSteps: [
      { title: 'Berätta om fordonet', text: 'Fyll i VIN och märke eller modell. Det tar bara någon minut.' },
      { title: 'Få en bedömning', text: 'Handlare från Growth-plan och uppåt kan se underlaget.' },
      { title: 'Välj rätt bud', text: 'Jämför intresse och gå vidare med den handlare som passar bäst.' },
      { title: 'Slutför affären', text: 'Boka överlämning och kom överens om betalning direkt med handlaren.' },
    ],
    benefitsTitle: 'Fördelar med att sälja till handlare',
    benefits: [
      { title: 'Snabbare process', text: 'Få kontakt med handlare som redan arbetar med fordonsinköp.' },
      { title: 'Flera bud', text: 'Underlaget kan matchas mot företag som har rätt plan och kapacitet.' },
      { title: 'Tryggare affär', text: 'Mindre administration än att hantera alla spekulanter själv.' },
      { title: 'Flexibelt', text: 'Du kan fortfarande skapa en vanlig annons om du vill sälja privat.' },
    ],
    dealerPlanNote: 'Handlarförfrågningar visas för företagskonton med Growth, Professional eller Enterprise.',
  },
  en: {
    metaTitle: 'Sell to a dealership | Autorell',
    metaDescription: 'Submit VIN and vehicle details and let connected Autorell dealerships make offers.',
    heroTitle: 'Sell your vehicle to a dealership, fast and safely.',
    heroText: 'Enter the VIN and make or model so connected dealers can review the vehicle and respond with offers.',
    formTitle: 'See your vehicle value and get dealer offers',
    formText: 'VIN helps dealers identify the right vehicle. You can also enter make and model as free text.',
    vinLabel: 'VIN',
    vinPlaceholder: 'Enter VIN',
    makeLabel: 'Make or model',
    makePlaceholder: 'For example Volvo XC60',
    modelLabel: 'Model',
    modelPlaceholder: 'XC60',
    yearLabel: 'Model year',
    yearPlaceholder: '2021',
    detailsLabel: 'Tell us about the car',
    detailsPlaceholder: 'Damage, service history, mileage, tyres, keys, equipment and anything else a dealer should know before making an offer.',
    continue: 'Continue',
    noVin: 'Do not know your VIN?',
    noVinLink: 'Enter make manually',
    vinError: 'VIN must be 17 characters and cannot contain I, O or Q.',
    manualHelp: 'Enter make, model and model year if you do not have the VIN.',
    requiredError: 'A valid VIN or make, model and model year is required.',
    submitError: 'The request could not be sent right now. Please try again.',
    successTitle: 'Request sent',
    successText: 'Dealers on Growth, Professional or Enterprise can now handle your vehicle details.',
    sending: 'Sending...',
    alternativeText: 'Looking for another way to sell your vehicle? Create an ad and sell it yourself.',
    alternativeCta: 'Create your ad',
    howTitle: 'How it works',
    howSteps: [
      { title: 'Tell us about your vehicle', text: 'Enter VIN and make or model. It only takes a minute.' },
      { title: 'Get a valuation signal', text: 'Dealers on Growth plans and above can review the details.' },
      { title: 'Choose the right offer', text: 'Compare interest and continue with the dealership that fits best.' },
      { title: 'Complete the sale', text: 'Book handover and agree payment directly with the dealer.' },
    ],
    benefitsTitle: 'Benefits of selling to a dealership',
    benefits: [
      { title: 'Faster process', text: 'Reach dealers who already work with vehicle purchasing.' },
      { title: 'Multiple offers', text: 'Your details can be matched with companies that have the right plan and capacity.' },
      { title: 'Safer sale', text: 'Less administration than handling every private lead yourself.' },
      { title: 'Flexible', text: 'You can still create a normal listing if you want to sell privately.' },
    ],
    dealerPlanNote: 'Dealer requests are shown to company accounts on Growth, Professional or Enterprise.',
  },
  de: {
    metaTitle: 'An Händler verkaufen | Autorell',
    metaDescription: 'VIN und Fahrzeugdaten senden und Angebote von angeschlossenen Autorell-Händlern erhalten.',
    heroTitle: 'Verkaufen Sie Ihr Fahrzeug schnell und sicher an einen Händler.',
    heroText: 'Geben Sie VIN sowie Marke oder Modell ein, damit angeschlossene Händler das Fahrzeug prüfen und Angebote senden können.',
    formTitle: 'Fahrzeugwert sehen und Händlerangebote erhalten',
    formText: 'Die VIN hilft Händlern, das richtige Fahrzeug zu identifizieren. Marke und Modell können auch frei eingegeben werden.',
    vinLabel: 'VIN',
    vinPlaceholder: 'VIN eingeben',
    makeLabel: 'Marke oder Modell',
    makePlaceholder: 'Zum Beispiel Volvo XC60',
    modelLabel: 'Modell',
    modelPlaceholder: 'XC60',
    yearLabel: 'Modelljahr',
    yearPlaceholder: '2021',
    detailsLabel: 'Beschreiben Sie das Fahrzeug',
    detailsPlaceholder: 'Schäden, Servicehistorie, Kilometerstand, Reifen, Schlüssel, Ausstattung und alles, was ein Händler vor einem Angebot wissen sollte.',
    continue: 'Weiter',
    noVin: 'Sie kennen die VIN nicht?',
    noVinLink: 'Marke manuell eingeben',
    vinError: 'Die VIN muss 17 Zeichen lang sein und darf I, O oder Q nicht enthalten.',
    manualHelp: 'Geben Sie Marke, Modell und Modelljahr ein, wenn keine VIN vorhanden ist.',
    requiredError: 'Eine gültige VIN oder Marke, Modell und Modelljahr sind erforderlich.',
    submitError: 'Die Anfrage konnte gerade nicht gesendet werden. Bitte versuchen Sie es erneut.',
    successTitle: 'Anfrage gesendet',
    successText: 'Händler mit Growth, Professional oder Enterprise können Ihre Fahrzeugdaten jetzt bearbeiten.',
    sending: 'Wird gesendet...',
    alternativeText: 'Sie möchten anders verkaufen? Erstellen Sie eine Anzeige und verkaufen Sie selbst.',
    alternativeCta: 'Anzeige erstellen',
    howTitle: 'So funktioniert es',
    howSteps: [
      { title: 'Fahrzeug beschreiben', text: 'VIN und Marke oder Modell eingeben. Das dauert nur eine Minute.' },
      { title: 'Bewertung erhalten', text: 'Händler ab Growth-Plan können die Angaben prüfen.' },
      { title: 'Passendes Angebot wählen', text: 'Interesse vergleichen und mit dem passenden Händler fortfahren.' },
      { title: 'Verkauf abschließen', text: 'Übergabe buchen und Zahlung direkt mit dem Händler vereinbaren.' },
    ],
    benefitsTitle: 'Vorteile beim Verkauf an Händler',
    benefits: [
      { title: 'Schneller Prozess', text: 'Erreichen Sie Händler, die bereits Fahrzeuge ankaufen.' },
      { title: 'Mehrere Angebote', text: 'Ihre Angaben können passenden Firmen mit geeignetem Plan angezeigt werden.' },
      { title: 'Sicherer Verkauf', text: 'Weniger Aufwand als die Bearbeitung vieler privater Anfragen.' },
      { title: 'Flexibel', text: 'Sie können weiterhin eine normale Anzeige erstellen, wenn Sie privat verkaufen möchten.' },
    ],
    dealerPlanNote: 'Händleranfragen werden Firmenkonten mit Growth, Professional oder Enterprise angezeigt.',
  },
  fr: {
    metaTitle: 'Vendre à un professionnel | Autorell',
    metaDescription: 'Envoyez le VIN et les informations du véhicule pour recevoir des offres de professionnels connectés.',
    heroTitle: 'Vendez votre véhicule à un professionnel, rapidement et en toute sécurité.',
    heroText: 'Indiquez le VIN et la marque ou le modèle afin que les professionnels puissent examiner le véhicule et répondre avec une offre.',
    formTitle: 'Voir la valeur du véhicule et recevoir des offres',
    formText: 'Le VIN aide les professionnels à identifier le véhicule. Vous pouvez aussi saisir la marque et le modèle librement.',
    vinLabel: 'VIN',
    vinPlaceholder: 'Saisir le VIN',
    makeLabel: 'Marque ou modèle',
    makePlaceholder: 'Par exemple Volvo XC60',
    modelLabel: 'Modèle',
    modelPlaceholder: 'XC60',
    yearLabel: 'Année modèle',
    yearPlaceholder: '2021',
    detailsLabel: 'Décrivez la voiture',
    detailsPlaceholder: 'Dommages, historique d’entretien, kilométrage, pneus, clés, équipements et tout ce qu’un professionnel doit savoir avant de faire une offre.',
    continue: 'Continuer',
    noVin: 'Vous ne connaissez pas le VIN ?',
    noVinLink: 'Saisir la marque manuellement',
    vinError: 'Le VIN doit contenir 17 caractères et ne peut pas contenir I, O ou Q.',
    manualHelp: 'Saisissez la marque, le modèle et l’année modèle si vous n’avez pas le VIN.',
    requiredError: 'Un VIN valide ou la marque, le modèle et l’année modèle sont nécessaires.',
    submitError: 'La demande ne peut pas être envoyée pour le moment. Veuillez réessayer.',
    successTitle: 'Demande envoyée',
    successText: 'Les professionnels avec Growth, Professional ou Enterprise peuvent maintenant traiter vos informations véhicule.',
    sending: 'Envoi...',
    alternativeText: 'Vous souhaitez vendre autrement ? Créez une annonce et vendez vous-même.',
    alternativeCta: 'Créer une annonce',
    howTitle: 'Comment ça marche',
    howSteps: [
      { title: 'Décrivez le véhicule', text: 'Saisissez le VIN et la marque ou le modèle en une minute.' },
      { title: 'Recevez une estimation', text: 'Les professionnels avec Growth ou plus peuvent consulter les informations.' },
      { title: 'Choisissez la bonne offre', text: 'Comparez l’intérêt et continuez avec le professionnel adapté.' },
      { title: 'Finalisez la vente', text: 'Organisez la remise et le paiement directement avec le professionnel.' },
    ],
    benefitsTitle: 'Avantages de la vente à un professionnel',
    benefits: [
      { title: 'Processus plus rapide', text: 'Touchez des professionnels qui achètent déjà des véhicules.' },
      { title: 'Plusieurs offres', text: 'Vos informations peuvent être présentées aux entreprises adaptées.' },
      { title: 'Vente plus sûre', text: 'Moins d’administration que de gérer chaque contact privé.' },
      { title: 'Flexible', text: 'Vous pouvez toujours créer une annonce classique pour vendre à un particulier.' },
    ],
    dealerPlanNote: 'Les demandes sont visibles par les comptes entreprise Growth, Professional ou Enterprise.',
  },
  es: {
    metaTitle: 'Vender a un concesionario | Autorell',
    metaDescription: 'Envía VIN y datos del vehículo para recibir ofertas de concesionarios conectados.',
    heroTitle: 'Vende tu vehículo a un concesionario de forma rápida y segura.',
    heroText: 'Introduce el VIN y la marca o modelo para que los concesionarios revisen el vehículo y respondan con ofertas.',
    formTitle: 'Consulta el valor y recibe ofertas',
    formText: 'El VIN ayuda a identificar el vehículo. También puedes escribir marca y modelo como texto libre.',
    vinLabel: 'VIN',
    vinPlaceholder: 'Introduce el VIN',
    makeLabel: 'Marca o modelo',
    makePlaceholder: 'Por ejemplo Volvo XC60',
    modelLabel: 'Modelo',
    modelPlaceholder: 'XC60',
    yearLabel: 'Año del modelo',
    yearPlaceholder: '2021',
    detailsLabel: 'Cuéntanos sobre el coche',
    detailsPlaceholder: 'Daños, historial de servicio, kilometraje, neumáticos, llaves, equipamiento y cualquier cosa que un concesionario deba saber antes de ofertar.',
    continue: 'Continuar',
    noVin: '¿No conoces tu VIN?',
    noVinLink: 'Introduce la marca manualmente',
    vinError: 'El VIN debe tener 17 caracteres y no puede contener I, O ni Q.',
    manualHelp: 'Introduce marca, modelo y año del modelo si no tienes el VIN.',
    requiredError: 'Se necesita un VIN válido o marca, modelo y año del modelo.',
    submitError: 'La solicitud no se pudo enviar ahora. Inténtalo de nuevo.',
    successTitle: 'Solicitud enviada',
    successText: 'Los concesionarios con Growth, Professional o Enterprise ya pueden gestionar los datos del vehículo.',
    sending: 'Enviando...',
    alternativeText: '¿Quieres vender de otra forma? Crea un anuncio y véndelo tú mismo.',
    alternativeCta: 'Crear anuncio',
    howTitle: 'Cómo funciona',
    howSteps: [
      { title: 'Describe el vehículo', text: 'Introduce VIN y marca o modelo. Solo lleva un minuto.' },
      { title: 'Recibe una valoración', text: 'Los concesionarios con plan Growth o superior pueden ver los datos.' },
      { title: 'Elige la oferta adecuada', text: 'Compara el interés y continúa con el concesionario más adecuado.' },
      { title: 'Cierra la venta', text: 'Agenda la entrega y acuerda el pago directamente con el concesionario.' },
    ],
    benefitsTitle: 'Ventajas de vender a un concesionario',
    benefits: [
      { title: 'Proceso más rápido', text: 'Llega a concesionarios que ya compran vehículos.' },
      { title: 'Varias ofertas', text: 'Tus datos pueden mostrarse a empresas con el plan y capacidad adecuados.' },
      { title: 'Venta más segura', text: 'Menos administración que gestionar todos los contactos privados.' },
      { title: 'Flexible', text: 'También puedes crear un anuncio normal si quieres vender en privado.' },
    ],
    dealerPlanNote: 'Las solicitudes se muestran a cuentas de empresa Growth, Professional o Enterprise.',
  },
  it: {
    metaTitle: 'Vendi a un concessionario | Autorell',
    metaDescription: 'Invia VIN e dati del veicolo e ricevi offerte dai concessionari collegati.',
    heroTitle: 'Vendi il tuo veicolo a un concessionario, in modo rapido e sicuro.',
    heroText: 'Inserisci VIN e marca o modello così i concessionari possono valutare il veicolo e rispondere con offerte.',
    formTitle: 'Vedi il valore del veicolo e ricevi offerte',
    formText: 'Il VIN aiuta a identificare il veicolo. Puoi anche scrivere marca e modello liberamente.',
    vinLabel: 'VIN',
    vinPlaceholder: 'Inserisci VIN',
    makeLabel: 'Marca o modello',
    makePlaceholder: 'Per esempio Volvo XC60',
    modelLabel: 'Modello',
    modelPlaceholder: 'XC60',
    yearLabel: 'Anno modello',
    yearPlaceholder: '2021',
    detailsLabel: 'Descrivi l’auto',
    detailsPlaceholder: 'Danni, cronologia tagliandi, chilometraggio, pneumatici, chiavi, dotazioni e tutto ciò che un concessionario deve sapere prima di fare un’offerta.',
    continue: 'Continua',
    noVin: 'Non conosci il VIN?',
    noVinLink: 'Inserisci la marca manualmente',
    vinError: 'Il VIN deve avere 17 caratteri e non può contenere I, O o Q.',
    manualHelp: 'Inserisci marca, modello e anno modello se non hai il VIN.',
    requiredError: 'Serve un VIN valido oppure marca, modello e anno modello.',
    submitError: 'La richiesta non può essere inviata ora. Riprova.',
    successTitle: 'Richiesta inviata',
    successText: 'I concessionari con Growth, Professional o Enterprise possono ora gestire i dati del veicolo.',
    sending: 'Invio...',
    alternativeText: 'Vuoi vendere in altro modo? Crea un annuncio e vendi da solo.',
    alternativeCta: 'Crea annuncio',
    howTitle: 'Come funziona',
    howSteps: [
      { title: 'Descrivi il veicolo', text: 'Inserisci VIN e marca o modello. Serve solo un minuto.' },
      { title: 'Ricevi una valutazione', text: 'I concessionari con Growth o superiore possono vedere i dati.' },
      { title: 'Scegli l’offerta giusta', text: 'Confronta l’interesse e continua con il concessionario adatto.' },
      { title: 'Completa la vendita', text: 'Organizza la consegna e concorda il pagamento direttamente.' },
    ],
    benefitsTitle: 'Vantaggi della vendita a un concessionario',
    benefits: [
      { title: 'Processo più rapido', text: 'Raggiungi concessionari che acquistano già veicoli.' },
      { title: 'Più offerte', text: 'I dati possono essere mostrati ad aziende con piano e capacità corretti.' },
      { title: 'Vendita più sicura', text: 'Meno amministrazione rispetto alla gestione dei contatti privati.' },
      { title: 'Flessibile', text: 'Puoi sempre creare un annuncio classico se vuoi vendere privatamente.' },
    ],
    dealerPlanNote: 'Le richieste sono visibili agli account aziendali Growth, Professional o Enterprise.',
  },
  nl: {
    metaTitle: 'Aan dealer verkopen | Autorell',
    metaDescription: 'Stuur VIN en voertuiggegevens en ontvang biedingen van aangesloten dealers.',
    heroTitle: 'Verkoop je voertuig snel en veilig aan een dealer.',
    heroText: 'Vul VIN en merk of model in zodat aangesloten dealers het voertuig kunnen beoordelen en een bod kunnen sturen.',
    formTitle: 'Bekijk de waarde en ontvang dealerbiedingen',
    formText: 'VIN helpt dealers het juiste voertuig te herkennen. Je kunt merk en model ook vrij invullen.',
    vinLabel: 'VIN',
    vinPlaceholder: 'Voer VIN in',
    makeLabel: 'Merk of model',
    makePlaceholder: 'Bijvoorbeeld Volvo XC60',
    modelLabel: 'Model',
    modelPlaceholder: 'XC60',
    yearLabel: 'Modeljaar',
    yearPlaceholder: '2021',
    detailsLabel: 'Vertel over de auto',
    detailsPlaceholder: 'Schade, onderhoudshistorie, kilometerstand, banden, sleutels, uitrusting en alles wat een dealer moet weten vóór een bod.',
    continue: 'Doorgaan',
    noVin: 'Ken je het VIN niet?',
    noVinLink: 'Merk handmatig invoeren',
    vinError: 'VIN moet 17 tekens hebben en mag geen I, O of Q bevatten.',
    manualHelp: 'Vul merk, model en modeljaar in als je geen VIN hebt.',
    requiredError: 'Een geldig VIN of merk, model en modeljaar is vereist.',
    submitError: 'De aanvraag kan nu niet worden verzonden. Probeer het opnieuw.',
    successTitle: 'Aanvraag verzonden',
    successText: 'Dealers met Growth, Professional of Enterprise kunnen je voertuiggegevens nu behandelen.',
    sending: 'Verzenden...',
    alternativeText: 'Wil je anders verkopen? Maak een advertentie en verkoop zelf.',
    alternativeCta: 'Advertentie maken',
    howTitle: 'Zo werkt het',
    howSteps: [
      { title: 'Vertel over het voertuig', text: 'Vul VIN en merk of model in. Dat kost ongeveer een minuut.' },
      { title: 'Ontvang een waardesignaal', text: 'Dealers met Growth of hoger kunnen de gegevens bekijken.' },
      { title: 'Kies het juiste bod', text: 'Vergelijk interesse en ga verder met de passende dealer.' },
      { title: 'Rond de verkoop af', text: 'Plan overdracht en betaling rechtstreeks met de dealer.' },
    ],
    benefitsTitle: 'Voordelen van verkopen aan een dealer',
    benefits: [
      { title: 'Sneller proces', text: 'Bereik dealers die al voertuigen inkopen.' },
      { title: 'Meerdere biedingen', text: 'Je gegevens kunnen worden gematcht met bedrijven met het juiste plan.' },
      { title: 'Veiliger verkopen', text: 'Minder administratie dan alle particuliere leads zelf beheren.' },
      { title: 'Flexibel', text: 'Je kunt nog steeds een normale advertentie maken om privé te verkopen.' },
    ],
    dealerPlanNote: 'Dealerverzoeken worden getoond aan bedrijfsaccounts met Growth, Professional of Enterprise.',
  },
  fi: {
    metaTitle: 'Myy autoliikkeelle | Autorell',
    metaDescription: 'Lähetä VIN ja ajoneuvon tiedot ja vastaanota tarjouksia Autorellin liikkeiltä.',
    heroTitle: 'Myy ajoneuvosi liikkeelle nopeasti ja turvallisesti.',
    heroText: 'Anna VIN sekä merkki tai malli, jotta liikkeet voivat arvioida ajoneuvon ja lähettää tarjouksia.',
    formTitle: 'Näe ajoneuvon arvo ja saa liikkeiden tarjoukset',
    formText: 'VIN auttaa tunnistamaan oikean ajoneuvon. Voit myös kirjoittaa merkin ja mallin vapaasti.',
    vinLabel: 'VIN',
    vinPlaceholder: 'Syötä VIN',
    makeLabel: 'Merkki tai malli',
    makePlaceholder: 'Esimerkiksi Volvo XC60',
    modelLabel: 'Malli',
    modelPlaceholder: 'XC60',
    yearLabel: 'Vuosimalli',
    yearPlaceholder: '2021',
    detailsLabel: 'Kerro autosta',
    detailsPlaceholder: 'Vauriot, huoltohistoria, ajokilometrit, renkaat, avaimet, varusteet ja muu, mitä liikkeen pitää tietää ennen tarjousta.',
    continue: 'Jatka',
    noVin: 'Etkö tiedä VIN-numeroa?',
    noVinLink: 'Syötä merkki käsin',
    vinError: 'VIN on 17 merkkiä eikä se saa sisältää kirjaimia I, O tai Q.',
    manualHelp: 'Syötä merkki, malli ja vuosimalli, jos VIN puuttuu.',
    requiredError: 'Tarvitaan kelvollinen VIN tai merkki, malli ja vuosimalli.',
    submitError: 'Pyyntöä ei voitu lähettää juuri nyt. Yritä uudelleen.',
    successTitle: 'Pyyntö lähetetty',
    successText: 'Growth-, Professional- tai Enterprise-paketin liikkeet voivat nyt käsitellä ajoneuvotietosi.',
    sending: 'Lähetetään...',
    alternativeText: 'Haluatko myydä toisella tavalla? Luo ilmoitus ja myy itse.',
    alternativeCta: 'Luo ilmoitus',
    howTitle: 'Näin se toimii',
    howSteps: [
      { title: 'Kerro ajoneuvosta', text: 'Syötä VIN ja merkki tai malli. Se vie vain minuutin.' },
      { title: 'Saat arviosignaalin', text: 'Growth-paketista ylöspäin olevat liikkeet voivat nähdä tiedot.' },
      { title: 'Valitse sopiva tarjous', text: 'Vertaa kiinnostusta ja jatka sopivan liikkeen kanssa.' },
      { title: 'Viimeistele kauppa', text: 'Sovi luovutus ja maksu suoraan liikkeen kanssa.' },
    ],
    benefitsTitle: 'Liikkeelle myymisen edut',
    benefits: [
      { title: 'Nopeampi prosessi', text: 'Tavoita liikkeet, jotka ostavat ajoneuvoja aktiivisesti.' },
      { title: 'Useita tarjouksia', text: 'Tiedot voidaan näyttää yrityksille, joilla on oikea paketti ja kapasiteetti.' },
      { title: 'Turvallisempi kauppa', text: 'Vähemmän hallinnointia kuin jokaisen yksityisen yhteydenoton käsittely.' },
      { title: 'Joustava', text: 'Voit silti luoda tavallisen ilmoituksen, jos haluat myydä itse.' },
    ],
    dealerPlanNote: 'Tarjouspyynnöt näkyvät yritystileille Growth-, Professional- tai Enterprise-paketilla.',
  },
  da: {
    metaTitle: 'Sælg til forhandler | Autorell',
    metaDescription: 'Indsend VIN og køretøjsoplysninger og modtag bud fra tilknyttede forhandlere.',
    heroTitle: 'Sælg dit køretøj til en forhandler hurtigt og trygt.',
    heroText: 'Indtast VIN og mærke eller model, så forhandlere kan vurdere køretøjet og sende bud.',
    formTitle: 'Se køretøjets værdi og få forhandlerbud',
    formText: 'VIN hjælper forhandlere med at identificere køretøjet. Du kan også skrive mærke og model frit.',
    vinLabel: 'VIN',
    vinPlaceholder: 'Indtast VIN',
    makeLabel: 'Mærke eller model',
    makePlaceholder: 'For eksempel Volvo XC60',
    modelLabel: 'Model',
    modelPlaceholder: 'XC60',
    yearLabel: 'Modelår',
    yearPlaceholder: '2021',
    detailsLabel: 'Fortæl om bilen',
    detailsPlaceholder: 'Skader, servicehistorik, kilometertal, dæk, nøgler, udstyr og andet som en forhandler bør vide før et bud.',
    continue: 'Fortsæt',
    noVin: 'Kender du ikke dit VIN?',
    noVinLink: 'Indtast mærke manuelt',
    vinError: 'VIN skal være 17 tegn og må ikke indeholde I, O eller Q.',
    manualHelp: 'Indtast mærke, model og modelår, hvis du ikke har VIN.',
    requiredError: 'Et gyldigt VIN eller mærke, model og modelår er påkrævet.',
    submitError: 'Forespørgslen kunne ikke sendes lige nu. Prøv igen.',
    successTitle: 'Forespørgsel sendt',
    successText: 'Forhandlere med Growth, Professional eller Enterprise kan nu håndtere dine køretøjsoplysninger.',
    sending: 'Sender...',
    alternativeText: 'Vil du sælge på en anden måde? Opret en annonce og sælg selv.',
    alternativeCta: 'Opret annonce',
    howTitle: 'Sådan fungerer det',
    howSteps: [
      { title: 'Fortæl om køretøjet', text: 'Indtast VIN og mærke eller model. Det tager kun et minut.' },
      { title: 'Få en vurdering', text: 'Forhandlere med Growth og opefter kan se oplysningerne.' },
      { title: 'Vælg det rigtige bud', text: 'Sammenlign interesse og fortsæt med den rette forhandler.' },
      { title: 'Afslut salget', text: 'Aftal overdragelse og betaling direkte med forhandleren.' },
    ],
    benefitsTitle: 'Fordele ved at sælge til en forhandler',
    benefits: [
      { title: 'Hurtigere proces', text: 'Nå forhandlere, der allerede arbejder med køb af køretøjer.' },
      { title: 'Flere bud', text: 'Dine oplysninger kan matches med virksomheder med den rette plan.' },
      { title: 'Tryggere handel', text: 'Mindre administration end at håndtere alle private henvendelser.' },
      { title: 'Fleksibelt', text: 'Du kan stadig oprette en almindelig annonce, hvis du vil sælge privat.' },
    ],
    dealerPlanNote: 'Forhandlerforespørgsler vises for firmakonti med Growth, Professional eller Enterprise.',
  },
  pl: {
    metaTitle: 'Sprzedaj dealerowi | Autorell',
    metaDescription: 'Prześlij VIN i dane pojazdu, aby otrzymać oferty od dealerów Autorell.',
    heroTitle: 'Sprzedaj pojazd dealerowi szybko i bezpiecznie.',
    heroText: 'Podaj VIN oraz markę lub model, aby dealerzy mogli ocenić pojazd i wysłać oferty.',
    formTitle: 'Sprawdź wartość pojazdu i otrzymaj oferty',
    formText: 'VIN pomaga dealerom zidentyfikować właściwy pojazd. Markę i model możesz też wpisać ręcznie.',
    vinLabel: 'VIN',
    vinPlaceholder: 'Wpisz VIN',
    makeLabel: 'Marka lub model',
    makePlaceholder: 'Na przykład Volvo XC60',
    modelLabel: 'Model',
    modelPlaceholder: 'XC60',
    yearLabel: 'Rok modelowy',
    yearPlaceholder: '2021',
    detailsLabel: 'Opisz samochód',
    detailsPlaceholder: 'Uszkodzenia, historia serwisowa, przebieg, opony, kluczyki, wyposażenie i wszystko, co dealer powinien wiedzieć przed ofertą.',
    continue: 'Kontynuuj',
    noVin: 'Nie znasz VIN?',
    noVinLink: 'Wpisz markę ręcznie',
    vinError: 'VIN musi mieć 17 znaków i nie może zawierać I, O ani Q.',
    manualHelp: 'Wpisz markę, model i rok modelowy, jeśli nie masz VIN.',
    requiredError: 'Wymagany jest poprawny VIN albo marka, model i rok modelowy.',
    submitError: 'Nie można teraz wysłać zapytania. Spróbuj ponownie.',
    successTitle: 'Zapytanie wysłane',
    successText: 'Dealerzy z planem Growth, Professional lub Enterprise mogą teraz obsłużyć dane pojazdu.',
    sending: 'Wysyłanie...',
    alternativeText: 'Chcesz sprzedać inaczej? Utwórz ogłoszenie i sprzedaj samodzielnie.',
    alternativeCta: 'Utwórz ogłoszenie',
    howTitle: 'Jak to działa',
    howSteps: [
      { title: 'Opisz pojazd', text: 'Wpisz VIN oraz markę lub model. To zajmuje tylko minutę.' },
      { title: 'Otrzymaj sygnał wyceny', text: 'Dealerzy z planem Growth lub wyższym mogą zobaczyć dane.' },
      { title: 'Wybierz właściwą ofertę', text: 'Porównaj zainteresowanie i kontynuuj z odpowiednim dealerem.' },
      { title: 'Zakończ sprzedaż', text: 'Ustal przekazanie i płatność bezpośrednio z dealerem.' },
    ],
    benefitsTitle: 'Korzyści ze sprzedaży dealerowi',
    benefits: [
      { title: 'Szybszy proces', text: 'Dotrzyj do dealerów, którzy aktywnie kupują pojazdy.' },
      { title: 'Kilka ofert', text: 'Dane mogą trafić do firm z odpowiednim planem i możliwościami.' },
      { title: 'Bezpieczniejsza sprzedaż', text: 'Mniej administracji niż przy obsłudze wszystkich prywatnych kontaktów.' },
      { title: 'Elastycznie', text: 'Nadal możesz utworzyć zwykłe ogłoszenie i sprzedać prywatnie.' },
    ],
    dealerPlanNote: 'Zapytania dealerskie widzą konta firmowe Growth, Professional lub Enterprise.',
  },
}

export async function generateSellToDealerMetadata({ localeOverride }: { localeOverride?: PublicLocale } = {}): Promise<Metadata> {
  const headerStore = await headers()
  const locale = localeOverride || getRequestedLocale(headerStore)
  const copy = getSellToDealerCopy(locale)
  const canonicalPath = localeOverride ? localizePublicHref(locale, '/sell-to-dealer') : headerStore.get('x-autorell-pathname') || localizePublicHref(locale, '/sell-to-dealer')
  const title = cleanSeoText(copy.metaTitle, 55)
  const description = cleanSeoText(copy.metaDescription, 155)
  const canonical = publicUrlForPath(canonicalPath)

  return {
    title: { absolute: title },
    description,
    alternates: { canonical, languages: getPublicLanguageAlternates('/sell-to-dealer') },
    openGraph: { title, description, url: canonical, type: 'website', siteName: 'Autorell' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function SellToDealerPage({
  localeOverride,
  marketCodeOverride,
}: {
  localeOverride?: PublicLocale
  marketCodeOverride?: string
} = {}) {
  const headerStore = await headers()
  const locale = localeOverride || getRequestedLocale(headerStore)
  const marketCode = marketCodeOverride || headerStore.get('x-autorell-market') || undefined
  const copy = getSellToDealerCopy(locale)
  const extraCopy = getSellToDealerExtraCopy(locale)

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f7fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />

      <section className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-8 sm:px-8 sm:py-12">
        <div className="sell-to-dealer-hero w-full max-w-[calc(100vw-40px)] overflow-hidden rounded-[18px] border border-[#cfe0ff] bg-[#eef5ff] shadow-[0_18px_55px_rgba(16,24,40,.08)] sm:max-w-none">
          <div className="sell-to-dealer-hero-grid grid min-h-[360px] min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(440px,520px)]">
            <div className="sell-to-dealer-hero-art relative flex min-h-[320px] min-w-0 flex-col justify-between overflow-hidden px-5 py-7 sm:px-9 sm:py-10">
              <div className="relative z-10 max-w-[calc(100vw-80px)] sm:max-w-[440px]">
                <h1 className="max-w-full text-[30px] font-semibold leading-[1.04] tracking-[-.045em] [overflow-wrap:anywhere] sm:max-w-[520px] sm:text-5xl sm:tracking-[-.055em]">
                  {copy.heroTitle}
                </h1>
                <p className="mt-3 max-w-[440px] text-sm leading-6 text-[#475467]">{copy.heroText}</p>
              </div>
              <div className="relative mt-8 min-h-[160px] sm:min-h-[210px]">
                <Image
                  src="/autorell-sell-to-dealer-red-cars.png"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 650px, 92vw"
                  className="object-contain object-left-bottom"
                  priority
                />
                <OfferBubble className="left-0 top-2" value="295 000" locale={locale} />
                <OfferBubble className="bottom-8 left-2" value="319 900" locale={locale} />
                <OfferBubble className="right-3 top-1/2 hidden -translate-y-1/2 sm:flex" value="321 500" locale={locale} />
              </div>
            </div>

            <div className="sell-to-dealer-form-wrap flex min-w-0 items-center p-4 sm:p-7">
              <SellToDealerLeadForm copy={copy} locale={locale} sourceCountryCode={marketCode} />
            </div>
          </div>
          <style>{`
            .sell-to-dealer-hero:has(.dealer-lead-form[data-step="1"], .dealer-lead-form[data-step="2"], .dealer-lead-form[data-step="3"], .dealer-lead-form[data-step="4"], .dealer-lead-form[data-step="submitted"]) .sell-to-dealer-hero-grid {
              grid-template-columns: minmax(0, 1fr);
              min-height: 0;
            }

            .sell-to-dealer-hero:has(.dealer-lead-form[data-step="1"], .dealer-lead-form[data-step="2"], .dealer-lead-form[data-step="3"], .dealer-lead-form[data-step="4"], .dealer-lead-form[data-step="submitted"]) .sell-to-dealer-hero-art {
              display: none;
            }

            .sell-to-dealer-hero:has(.dealer-lead-form[data-step="1"], .dealer-lead-form[data-step="2"], .dealer-lead-form[data-step="3"], .dealer-lead-form[data-step="4"], .dealer-lead-form[data-step="submitted"]) .sell-to-dealer-form-wrap {
              align-items: stretch;
              padding: clamp(20px, 3.6vw, 44px);
            }

            .sell-to-dealer-hero:has(.dealer-lead-form[data-step="1"], .dealer-lead-form[data-step="2"], .dealer-lead-form[data-step="3"], .dealer-lead-form[data-step="4"], .dealer-lead-form[data-step="submitted"]) .dealer-lead-form {
              max-width: none;
              box-shadow: none;
            }

            @media (min-width: 1024px) {
              .sell-to-dealer-hero:has(.dealer-lead-form[data-step="1"], .dealer-lead-form[data-step="2"], .dealer-lead-form[data-step="3"], .dealer-lead-form[data-step="4"], .dealer-lead-form[data-step="submitted"]) .dealer-lead-form {
                padding: 32px;
              }
            }
          `}</style>
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-[20px] border border-[#d7e2ef] bg-white px-5 py-4 text-sm font-semibold text-[#101828] shadow-[0_10px_28px_rgba(16,24,40,.04)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="inline-flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 shrink-0 text-[#0866ff]" />
            {copy.alternativeText}
          </span>
          <Link
            href={localizePublicHref(locale, '/account/listings/new')}
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#0866ff] px-5 text-sm font-bold text-[#0866ff] transition hover:bg-[#eef5ff]"
          >
            {copy.alternativeCta}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--autorell-page-max)] px-5 pb-14 sm:px-8 sm:pb-20">
        <h2 className="text-3xl font-semibold tracking-[-.045em]">{copy.howTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {copy.howSteps.map((step, index) => (
            <article key={step.title} className="relative rounded-[16px] border border-[#d9e2ef] bg-white p-5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#98a2b3] text-xs font-bold">
                {index + 1}
              </span>
              <h3 className="mt-4 text-sm font-bold">{step.title}</h3>
              <p className="mt-2 text-xs leading-5 text-[#667085]">{step.text}</p>
            </article>
          ))}
        </div>

        <h2 className="mt-12 text-3xl font-semibold tracking-[-.045em]">{copy.benefitsTitle}</h2>
        <p className="mt-3 max-w-2xl rounded-[14px] bg-[#eef5ff] px-4 py-3 text-sm font-semibold text-[#18478f]">
          {copy.dealerPlanNote}
        </p>
        <div className="mt-6 grid overflow-hidden rounded-[16px] border border-[#d9e2ef] bg-white sm:grid-cols-2">
          {copy.benefits.map((benefit, index) => {
            const Icon = [Tag, Clock3, ShieldCheck, Gauge][index] || CheckCircle2
            return (
              <article key={benefit.title} className="grid gap-3 border-b border-[#e4eaf3] p-5 sm:grid-cols-[42px_minmax(0,1fr)] sm:border-r even:border-r-0 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e8f3ff] text-[#0866ff]">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <strong className="block text-sm">{benefit.title}</strong>
                  <span className="mt-1 block text-xs leading-5 text-[#667085]">{benefit.text}</span>
                </span>
              </article>
            )
          })}
        </div>

        <DealerPrivateListingSection copy={extraCopy} locale={locale} />
        <DealerQuestionsSection copy={extraCopy} />
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

function DealerPrivateListingSection({ copy, locale }: { copy: SellToDealerExtraCopy; locale: PublicLocale }) {
  return (
    <section className="mt-12 overflow-hidden rounded-[18px] border border-[#d7e2ef] bg-white shadow-[0_18px_55px_rgba(16,24,40,.06)]">
      <div className="grid min-h-[250px] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative z-10 flex min-h-[230px] flex-col justify-center px-6 py-8 sm:px-9">
          <Image src="/favicon-48.png" alt="" width={22} height={22} className="mb-5 h-5 w-5 rounded-[5px]" />
          <p className="text-[12px] font-bold uppercase tracking-[.04em] text-[#0866ff]">{copy.listingEyebrow}</p>
          <h2 className="mt-3 max-w-[360px] text-[28px] font-semibold leading-[1.08] tracking-[-.04em] text-[#101828] sm:text-[34px]">
            {copy.listingTitle}
          </h2>
          <Link
            href={localizePublicHref(locale, '/account/listings/new')}
            className="mt-6 inline-flex min-h-10 w-fit items-center justify-center rounded-full bg-[#0866ff] px-5 text-sm font-bold text-white transition hover:bg-[#075bd8]"
          >
            {copy.listingCta}
          </Link>
        </div>
        <div className="relative min-h-[230px] overflow-hidden bg-[#eef5ff]">
          <div className="absolute inset-y-0 -left-16 z-10 hidden w-32 skew-x-[-18deg] bg-white lg:block" aria-hidden="true" />
          <Image
            src="/autorell-private-listing-laptop.jpg"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 620px"
            className="object-cover object-center"
          />
        </div>
      </div>

      <div className="grid border-t border-[#e3eaf3] lg:grid-cols-2">
        <div className="p-6 sm:p-8 lg:border-r lg:border-[#e3eaf3]">
          <h3 className="text-[18px] font-semibold text-[#101828]">{copy.listingHowTitle}</h3>
          <ol className="mt-5 space-y-5">
            {copy.listingHowSteps.map((step, index) => (
              <li key={step.title} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-[#98a2b3] text-xs font-bold text-[#101828]">
                  {index + 1}
                </span>
                <span>
                  <strong className="block text-sm">{step.title}</strong>
                  <span className="mt-1 block text-xs leading-5 text-[#667085]">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="border-t border-[#e3eaf3] p-6 sm:p-8 lg:border-t-0">
          <h3 className="text-[18px] font-semibold text-[#101828]">{copy.listingBenefitsTitle}</h3>
          <ul className="mt-5 space-y-4">
            {copy.listingBenefits.map((benefit) => (
              <li key={benefit.title} className="grid grid-cols-[24px_minmax(0,1fr)] gap-3">
                <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-[#087a18] text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>
                  <strong className="block text-sm">{benefit.title}</strong>
                  <span className="mt-1 block text-xs leading-5 text-[#667085]">{benefit.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function DealerQuestionsSection({ copy }: { copy: SellToDealerExtraCopy }) {
  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[0.32fr_0.68fr]">
      <h2 className="text-3xl font-semibold tracking-[-.045em]">{copy.questionsTitle}</h2>
      <div className="space-y-3">
        {copy.questions.map((item) => (
          <details key={item.question} className="group rounded-[18px] border border-[#d7e2ef] bg-[#f8fbff] px-5 shadow-[0_10px_26px_rgba(16,24,40,.035)] transition-colors open:bg-[#f3f7fc]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm font-semibold text-[#101828] [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[#667085] transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="border-t border-[#dbe3ef] pb-5 pr-8 pt-4 text-sm leading-6 text-[#526174]">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function OfferBubble({ value, locale, className }: { value: string; locale: PublicLocale; className: string }) {
  return (
    <div className={`absolute z-10 inline-flex items-center gap-2 rounded-full border border-[#c9d3df] bg-white px-3 py-2 text-xs font-bold shadow-[0_12px_30px_rgba(16,24,40,.12)] ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0866ff] text-white">{currencyCode(locale)}</span>
      <span>
        <span className="block text-[10px] font-semibold text-[#475467]">{offerLabel(locale)}</span>
        {value} {currencyCode(locale)}
      </span>
    </div>
  )
}

const extraCopyByLocale: Record<Exclude<PublicLocale, 'at' | 'be'>, SellToDealerExtraCopy> = {
  sv: {
    listingEyebrow: 'Vill du sälja på annat sätt?',
    listingTitle: 'Skapa en annons och sälj själv.',
    listingCta: 'Skapa annons',
    listingHowTitle: 'Så fungerar en vanlig annons',
    listingHowSteps: [
      { title: 'Berätta om bilen', text: 'Lägg in mätarställning, utrustning, skick och bilder.' },
      { title: 'Publicera annonsen', text: 'Din annons visas på marknadsplatsen så köpare kan kontakta dig.' },
      { title: 'Hantera kontakten', text: 'Svara på frågor och boka visning eller provkörning.' },
      { title: 'Slutför affären', text: 'Kom överens om betalning, kontrakt och överlämning.' },
    ],
    listingBenefitsTitle: 'Fördelar med att annonsera på Autorell',
    listingBenefits: [
      { title: 'Gratis att publicera', text: 'Skapa en annons och välj själv om du vill köpa mer synlighet.' },
      { title: 'Publicera snabbt', text: 'Lägg till uppgifter och bilder på några minuter.' },
      { title: 'Sälj till ditt pris', text: 'Du styr priset och dialogen med köparen.' },
      { title: 'Nå fler köpare', text: 'Autorell hjälper dig att synas för rätt fordonsköpare.' },
    ],
    questionsTitle: 'Frågor?',
    questions: [
      { question: 'Vad behöver jag ange för att få handlarbud?', answer: 'VIN/chassinummer och kontaktuppgifter krävs. Ju tydligare uppgifter om skick, service och bilder du lämnar, desto enklare blir det för handlare att bedöma fordonet.' },
      { question: 'Måste jag sälja om jag får ett bud?', answer: 'Nej. Du väljer själv om du vill gå vidare med en handlare.' },
      { question: 'Vilka handlare kan se min förfrågan?', answer: 'Anslutna företagskonton med Growth, Professional eller Enterprise kan hantera handlarförfrågningar.' },
      { question: 'Kan jag även skapa en vanlig annons?', answer: 'Ja. Du kan skapa en annons och sälja själv om du vill hantera kontakten direkt med köpare.' },
      { question: 'Kostar det att skicka en förfrågan?', answer: 'Nej, det kostar inget att skicka underlaget till anslutna handlare.' },
      { question: 'Vad händer efter att jag skickat in uppgifterna?', answer: 'Din förfrågan sparas och blir tillgänglig för behöriga handlare. De kan granska fordonet, kontakta dig och lämna bud om det passar deras lager.' },
      { question: 'Kan jag ändra uppgifterna senare?', answer: 'Om något blivit fel kan du skicka in en ny förfrågan med korrekta uppgifter eller uppdatera informationen när en handlare kontaktar dig.' },
    ],
  },
  en: {
    listingEyebrow: 'Looking for another way to sell?',
    listingTitle: 'Create a listing and sell it yourself.',
    listingCta: 'Create your ad',
    listingHowTitle: 'How a listing works',
    listingHowSteps: [
      { title: 'Tell us about the car', text: 'Add mileage, features, condition and photos.' },
      { title: 'Publish your listing', text: 'Your ad appears on the marketplace so buyers can contact you.' },
      { title: 'Manage leads', text: 'Answer questions and arrange viewings or test drives.' },
      { title: 'Complete the sale', text: 'Agree payment, contract and handover with the buyer.' },
    ],
    listingBenefitsTitle: 'Advantages of listing on Autorell',
    listingBenefits: [
      { title: 'Free to publish', text: 'Create a listing and decide if you want extra visibility.' },
      { title: 'List in minutes', text: 'Add vehicle details and photos quickly.' },
      { title: 'Set your own price', text: 'You control the price and conversation with the buyer.' },
      { title: 'Reach more buyers', text: 'Autorell helps you reach relevant vehicle buyers.' },
    ],
    questionsTitle: 'Questions?',
    questions: [
      { question: 'What do I need to enter to get dealer offers?', answer: 'VIN and contact details are required. Clear condition, service and photo information helps dealers assess the vehicle.' },
      { question: 'Do I have to sell if I receive an offer?', answer: 'No. You decide if you want to continue with a dealer.' },
      { question: 'Which dealers can see my request?', answer: 'Connected company accounts on Growth, Professional or Enterprise can handle dealer requests.' },
      { question: 'Can I also create a normal listing?', answer: 'Yes. You can create an ad and sell it yourself if you want to manage buyers directly.' },
      { question: 'Does it cost anything to send a request?', answer: 'No, sending your details to connected dealers is free.' },
      { question: 'What happens after I submit my details?', answer: 'Your request is saved and made available to eligible dealers. They can review the vehicle, contact you and make an offer if it matches their buying needs.' },
      { question: 'Can I change the details later?', answer: 'If something is wrong, you can send a new request with corrected details or clarify the information when a dealer contacts you.' },
    ],
  },
  de: {
    listingEyebrow: 'Eine andere Verkaufsart?',
    listingTitle: 'Anzeige erstellen und selbst verkaufen.',
    listingCta: 'Anzeige erstellen',
    listingHowTitle: 'So funktioniert eine Anzeige',
    listingHowSteps: [
      { title: 'Fahrzeug beschreiben', text: 'Kilometerstand, Ausstattung, Zustand und Fotos hinzufügen.' },
      { title: 'Anzeige veröffentlichen', text: 'Ihre Anzeige erscheint im Marktplatz und Käufer können Kontakt aufnehmen.' },
      { title: 'Anfragen verwalten', text: 'Fragen beantworten und Besichtigung oder Probefahrt abstimmen.' },
      { title: 'Verkauf abschließen', text: 'Zahlung, Vertrag und Übergabe mit dem Käufer vereinbaren.' },
    ],
    listingBenefitsTitle: 'Vorteile einer Anzeige auf Autorell',
    listingBenefits: [
      { title: 'Kostenlos veröffentlichen', text: 'Erstellen Sie eine Anzeige und wählen Sie optional mehr Sichtbarkeit.' },
      { title: 'In Minuten online', text: 'Fahrzeugdaten und Fotos schnell hinzufügen.' },
      { title: 'Eigener Preis', text: 'Sie steuern Preis und Dialog mit dem Käufer.' },
      { title: 'Mehr Käufer erreichen', text: 'Autorell hilft, relevante Fahrzeugkäufer zu erreichen.' },
    ],
    questionsTitle: 'Fragen?',
    questions: [
      { question: 'Welche Daten brauche ich für Händlerangebote?', answer: 'VIN und Kontaktdaten sind erforderlich. Klare Angaben zu Zustand, Service und Fotos helfen Händlern bei der Bewertung.' },
      { question: 'Muss ich verkaufen, wenn ich ein Angebot erhalte?', answer: 'Nein. Sie entscheiden selbst, ob Sie mit einem Händler weitermachen.' },
      { question: 'Welche Händler sehen meine Anfrage?', answer: 'Verbundene Unternehmenskonten mit Growth, Professional oder Enterprise können Händleranfragen bearbeiten.' },
      { question: 'Kann ich auch eine normale Anzeige erstellen?', answer: 'Ja. Sie können eine Anzeige erstellen und direkt mit Käufern verkaufen.' },
      { question: 'Kostet das Senden der Anfrage etwas?', answer: 'Nein, das Senden der Unterlagen an angeschlossene Händler ist kostenlos.' },
      { question: 'Was passiert nach dem Absenden?', answer: 'Ihre Anfrage wird gespeichert und berechtigten Händlern angezeigt. Diese können das Fahrzeug prüfen, Sie kontaktieren und bei Interesse ein Angebot abgeben.' },
      { question: 'Kann ich Angaben später ändern?', answer: 'Wenn etwas falsch ist, können Sie eine neue Anfrage mit korrigierten Daten senden oder Details klären, wenn ein Händler Sie kontaktiert.' },
    ],
  },
  fr: {
    listingEyebrow: 'Une autre façon de vendre ?',
    listingTitle: 'Créez une annonce et vendez vous-même.',
    listingCta: 'Créer une annonce',
    listingHowTitle: 'Comment fonctionne une annonce',
    listingHowSteps: [
      { title: 'Décrivez le véhicule', text: 'Ajoutez kilométrage, équipement, état et photos.' },
      { title: 'Publiez l’annonce', text: 'Votre annonce apparaît sur la marketplace afin que les acheteurs vous contactent.' },
      { title: 'Gérez les contacts', text: 'Répondez aux questions et organisez visites ou essais.' },
      { title: 'Finalisez la vente', text: 'Convenez du paiement, du contrat et de la remise du véhicule.' },
    ],
    listingBenefitsTitle: 'Avantages de publier sur Autorell',
    listingBenefits: [
      { title: 'Publication gratuite', text: 'Créez une annonce et choisissez si vous souhaitez plus de visibilité.' },
      { title: 'En ligne en quelques minutes', text: 'Ajoutez rapidement les détails et photos.' },
      { title: 'Votre prix', text: 'Vous gérez le prix et la discussion avec l’acheteur.' },
      { title: 'Plus d’acheteurs', text: 'Autorell vous aide à toucher les bons acheteurs.' },
    ],
    questionsTitle: 'Questions ?',
    questions: [
      { question: 'Que faut-il saisir pour recevoir des offres ?', answer: 'Le VIN et les coordonnées sont requis. Des informations claires sur l’état, l’entretien et les photos aident les professionnels.' },
      { question: 'Dois-je vendre si je reçois une offre ?', answer: 'Non. Vous choisissez librement de continuer ou non avec un professionnel.' },
      { question: 'Quels professionnels voient ma demande ?', answer: 'Les comptes entreprises Growth, Professional ou Enterprise connectés peuvent traiter les demandes.' },
      { question: 'Puis-je aussi créer une annonce classique ?', answer: 'Oui. Vous pouvez publier une annonce et gérer directement les acheteurs.' },
      { question: 'L’envoi d’une demande est-il payant ?', answer: 'Non, l’envoi aux professionnels connectés est gratuit.' },
      { question: 'Que se passe-t-il après l’envoi ?', answer: 'Votre demande est enregistrée et visible par les professionnels autorisés. Ils peuvent examiner le véhicule, vous contacter et faire une offre si le profil correspond.' },
      { question: 'Puis-je modifier les informations ensuite ?', answer: 'Si une information est incorrecte, vous pouvez envoyer une nouvelle demande corrigée ou la préciser lorsqu’un professionnel vous contacte.' },
    ],
  },
  es: {
    listingEyebrow: '¿Otra forma de vender?',
    listingTitle: 'Crea un anuncio y vende tú mismo.',
    listingCta: 'Crear anuncio',
    listingHowTitle: 'Cómo funciona un anuncio',
    listingHowSteps: [
      { title: 'Describe el vehículo', text: 'Añade kilometraje, equipamiento, estado y fotos.' },
      { title: 'Publica el anuncio', text: 'Tu anuncio aparece en el mercado para que los compradores contacten.' },
      { title: 'Gestiona contactos', text: 'Responde preguntas y acuerda visitas o pruebas.' },
      { title: 'Cierra la venta', text: 'Acuerda pago, contrato y entrega con el comprador.' },
    ],
    listingBenefitsTitle: 'Ventajas de anunciar en Autorell',
    listingBenefits: [
      { title: 'Publicación gratis', text: 'Crea un anuncio y decide si quieres más visibilidad.' },
      { title: 'En minutos', text: 'Añade datos y fotos rápidamente.' },
      { title: 'Tu propio precio', text: 'Controlas el precio y la conversación.' },
      { title: 'Más compradores', text: 'Autorell ayuda a llegar a compradores relevantes.' },
    ],
    questionsTitle: '¿Preguntas?',
    questions: [
      { question: '¿Qué necesito para recibir ofertas?', answer: 'Se requiere VIN y datos de contacto. La información clara sobre estado, servicio y fotos ayuda al concesionario.' },
      { question: '¿Tengo que vender si recibo una oferta?', answer: 'No. Tú decides si quieres continuar con un concesionario.' },
      { question: '¿Qué concesionarios ven mi solicitud?', answer: 'Cuentas de empresa Growth, Professional o Enterprise conectadas pueden gestionar solicitudes.' },
      { question: '¿Puedo crear también un anuncio normal?', answer: 'Sí. Puedes publicar un anuncio y vender directamente a compradores.' },
      { question: '¿Cuesta enviar una solicitud?', answer: 'No, enviar los datos a concesionarios conectados es gratis.' },
      { question: '¿Qué pasa después de enviar los datos?', answer: 'La solicitud se guarda y queda disponible para concesionarios autorizados. Pueden revisar el vehículo, contactarte y hacer una oferta si encaja con sus compras.' },
      { question: '¿Puedo cambiar los datos después?', answer: 'Si algo está mal, puedes enviar una nueva solicitud corregida o aclarar la información cuando un concesionario te contacte.' },
    ],
  },
  it: {
    listingEyebrow: 'Un altro modo per vendere?',
    listingTitle: 'Crea un annuncio e vendi da solo.',
    listingCta: 'Crea annuncio',
    listingHowTitle: 'Come funziona un annuncio',
    listingHowSteps: [
      { title: 'Descrivi il veicolo', text: 'Aggiungi chilometraggio, dotazioni, condizioni e foto.' },
      { title: 'Pubblica l’annuncio', text: 'L’annuncio appare sul marketplace e gli acquirenti possono contattarti.' },
      { title: 'Gestisci i contatti', text: 'Rispondi alle domande e organizza visite o prove.' },
      { title: 'Concludi la vendita', text: 'Concorda pagamento, contratto e consegna.' },
    ],
    listingBenefitsTitle: 'Vantaggi di pubblicare su Autorell',
    listingBenefits: [
      { title: 'Pubblicazione gratuita', text: 'Crea un annuncio e scegli se aumentare la visibilità.' },
      { title: 'Online in pochi minuti', text: 'Aggiungi dettagli e foto rapidamente.' },
      { title: 'Il tuo prezzo', text: 'Gestisci prezzo e dialogo con l’acquirente.' },
      { title: 'Più acquirenti', text: 'Autorell ti aiuta a raggiungere acquirenti pertinenti.' },
    ],
    questionsTitle: 'Domande?',
    questions: [
      { question: 'Cosa serve per ricevere offerte?', answer: 'Sono richiesti VIN e contatti. Stato, manutenzione e foto aiutano i concessionari a valutare.' },
      { question: 'Devo vendere se ricevo un’offerta?', answer: 'No. Decidi tu se procedere con un concessionario.' },
      { question: 'Quali concessionari vedono la richiesta?', answer: 'Gli account aziendali Growth, Professional o Enterprise connessi possono gestire le richieste.' },
      { question: 'Posso creare anche un annuncio normale?', answer: 'Sì. Puoi pubblicare un annuncio e vendere direttamente.' },
      { question: 'Inviare una richiesta costa?', answer: 'No, l’invio ai concessionari connessi è gratuito.' },
      { question: 'Cosa succede dopo l’invio?', answer: 'La richiesta viene salvata e resa disponibile ai concessionari autorizzati. Possono valutare il veicolo, contattarti e inviare un’offerta se è interessante.' },
      { question: 'Posso modificare i dati in seguito?', answer: 'Se qualcosa è errato, puoi inviare una nuova richiesta corretta o chiarire le informazioni quando un concessionario ti contatta.' },
    ],
  },
  nl: {
    listingEyebrow: 'Op een andere manier verkopen?',
    listingTitle: 'Maak een advertentie en verkoop zelf.',
    listingCta: 'Advertentie maken',
    listingHowTitle: 'Hoe een advertentie werkt',
    listingHowSteps: [
      { title: 'Beschrijf de auto', text: 'Voeg kilometerstand, uitrusting, staat en foto’s toe.' },
      { title: 'Publiceer je advertentie', text: 'Je advertentie verschijnt op de marktplaats zodat kopers contact opnemen.' },
      { title: 'Beheer reacties', text: 'Beantwoord vragen en plan bezichtigingen of proefritten.' },
      { title: 'Rond de verkoop af', text: 'Spreek betaling, contract en overdracht af.' },
    ],
    listingBenefitsTitle: 'Voordelen van adverteren op Autorell',
    listingBenefits: [
      { title: 'Gratis publiceren', text: 'Maak een advertentie en kies zelf voor extra zichtbaarheid.' },
      { title: 'Binnen minuten online', text: 'Voeg gegevens en foto’s snel toe.' },
      { title: 'Je eigen prijs', text: 'Jij bepaalt prijs en gesprek met de koper.' },
      { title: 'Meer kopers bereiken', text: 'Autorell helpt relevante voertuigkopers te bereiken.' },
    ],
    questionsTitle: 'Vragen?',
    questions: [
      { question: 'Wat moet ik invullen voor dealerbiedingen?', answer: 'VIN en contactgegevens zijn vereist. Duidelijke info over staat, onderhoud en foto’s helpt dealers beoordelen.' },
      { question: 'Moet ik verkopen als ik een bod krijg?', answer: 'Nee. Je kiest zelf of je verdergaat met een dealer.' },
      { question: 'Welke dealers zien mijn aanvraag?', answer: 'Aangesloten bedrijfsaccounts met Growth, Professional of Enterprise kunnen aanvragen beheren.' },
      { question: 'Kan ik ook een gewone advertentie maken?', answer: 'Ja. Je kunt een advertentie plaatsen en zelf met kopers verkopen.' },
      { question: 'Kost een aanvraag iets?', answer: 'Nee, je gegevens naar aangesloten dealers sturen is gratis.' },
      { question: 'Wat gebeurt er nadat ik mijn gegevens verstuur?', answer: 'Je aanvraag wordt opgeslagen en beschikbaar gemaakt voor bevoegde dealers. Zij kunnen het voertuig beoordelen, contact opnemen en een bod doen als het past.' },
      { question: 'Kan ik de gegevens later wijzigen?', answer: 'Als iets niet klopt, kun je een nieuwe aanvraag met gecorrigeerde gegevens sturen of de informatie toelichten wanneer een dealer contact opneemt.' },
    ],
  },
  fi: {
    listingEyebrow: 'Haluatko myydä toisella tavalla?',
    listingTitle: 'Luo ilmoitus ja myy itse.',
    listingCta: 'Luo ilmoitus',
    listingHowTitle: 'Näin ilmoitus toimii',
    listingHowSteps: [
      { title: 'Kerro autosta', text: 'Lisää ajokilometrit, varusteet, kunto ja kuvat.' },
      { title: 'Julkaise ilmoitus', text: 'Ilmoitus näkyy markkinapaikalla ja ostajat voivat ottaa yhteyttä.' },
      { title: 'Hallitse yhteydenottoja', text: 'Vastaa kysymyksiin ja sovi näytöt tai koeajot.' },
      { title: 'Viimeistele kauppa', text: 'Sovi maksu, sopimus ja luovutus ostajan kanssa.' },
    ],
    listingBenefitsTitle: 'Autorell-ilmoituksen edut',
    listingBenefits: [
      { title: 'Julkaisu maksutta', text: 'Luo ilmoitus ja valitse itse lisänäkyvyys.' },
      { title: 'Julkaise minuuteissa', text: 'Lisää tiedot ja kuvat nopeasti.' },
      { title: 'Oma hintasi', text: 'Sinä hallitset hintaa ja keskustelua ostajan kanssa.' },
      { title: 'Tavoita enemmän ostajia', text: 'Autorell auttaa tavoittamaan oikeat ajoneuvo-ostajat.' },
    ],
    questionsTitle: 'Kysymyksiä?',
    questions: [
      { question: 'Mitä tarvitsen saadakseni jälleenmyyjätarjouksia?', answer: 'VIN ja yhteystiedot vaaditaan. Selkeät kunto-, huolto- ja kuvatiedot auttavat arvioinnissa.' },
      { question: 'Onko minun pakko myydä, jos saan tarjouksen?', answer: 'Ei. Päätät itse jatkatko jälleenmyyjän kanssa.' },
      { question: 'Mitkä jälleenmyyjät näkevät pyyntöni?', answer: 'Growth-, Professional- tai Enterprise-yritystilit voivat käsitellä pyyntöjä.' },
      { question: 'Voinko myös luoda tavallisen ilmoituksen?', answer: 'Kyllä. Voit julkaista ilmoituksen ja myydä suoraan ostajille.' },
      { question: 'Maksaako pyynnön lähettäminen?', answer: 'Ei, tietojen lähettäminen jälleenmyyjille on maksutonta.' },
      { question: 'Mitä tapahtuu lähettämisen jälkeen?', answer: 'Pyyntö tallennetaan ja näytetään oikeutetuille jälleenmyyjille. He voivat arvioida ajoneuvon, ottaa yhteyttä ja tehdä tarjouksen.' },
      { question: 'Voinko muuttaa tietoja myöhemmin?', answer: 'Jos jokin tieto on väärin, voit lähettää uuden korjatun pyynnön tai tarkentaa tietoja jälleenmyyjän ottaessa yhteyttä.' },
    ],
  },
  da: {
    listingEyebrow: 'Vil du sælge på en anden måde?',
    listingTitle: 'Opret en annonce og sælg selv.',
    listingCta: 'Opret annonce',
    listingHowTitle: 'Sådan fungerer en annonce',
    listingHowSteps: [
      { title: 'Fortæl om bilen', text: 'Tilføj kilometertal, udstyr, stand og billeder.' },
      { title: 'Publicer annoncen', text: 'Annoncen vises på markedspladsen, så købere kan kontakte dig.' },
      { title: 'Håndter kontakter', text: 'Svar på spørgsmål og aftal fremvisning eller prøvetur.' },
      { title: 'Afslut salget', text: 'Aftal betaling, kontrakt og overdragelse.' },
    ],
    listingBenefitsTitle: 'Fordele ved at annoncere på Autorell',
    listingBenefits: [
      { title: 'Gratis publicering', text: 'Opret en annonce og vælg selv ekstra synlighed.' },
      { title: 'Online på få minutter', text: 'Tilføj oplysninger og billeder hurtigt.' },
      { title: 'Din egen pris', text: 'Du styrer pris og dialog med køberen.' },
      { title: 'Nå flere købere', text: 'Autorell hjælper dig med at nå relevante købere.' },
    ],
    questionsTitle: 'Spørgsmål?',
    questions: [
      { question: 'Hvad skal jeg udfylde for at få forhandlerbud?', answer: 'VIN og kontaktoplysninger kræves. Tydelige oplysninger om stand, service og billeder hjælper forhandlerne.' },
      { question: 'Skal jeg sælge, hvis jeg får et bud?', answer: 'Nej. Du vælger selv, om du vil gå videre med en forhandler.' },
      { question: 'Hvilke forhandlere kan se min forespørgsel?', answer: 'Tilknyttede firmakonti med Growth, Professional eller Enterprise kan håndtere forespørgsler.' },
      { question: 'Kan jeg også oprette en almindelig annonce?', answer: 'Ja. Du kan oprette en annonce og sælge direkte til købere.' },
      { question: 'Koster det at sende en forespørgsel?', answer: 'Nej, det er gratis at sende oplysningerne til tilknyttede forhandlere.' },
      { question: 'Hvad sker der efter indsendelse?', answer: 'Din forespørgsel gemmes og vises for berettigede forhandlere. De kan gennemgå køretøjet, kontakte dig og afgive bud, hvis det passer.' },
      { question: 'Kan jeg ændre oplysninger senere?', answer: 'Hvis noget er forkert, kan du sende en ny forespørgsel med rettede oplysninger eller præcisere dem, når en forhandler kontakter dig.' },
    ],
  },
  pl: {
    listingEyebrow: 'Chcesz sprzedać inaczej?',
    listingTitle: 'Utwórz ogłoszenie i sprzedaj samodzielnie.',
    listingCta: 'Utwórz ogłoszenie',
    listingHowTitle: 'Jak działa ogłoszenie',
    listingHowSteps: [
      { title: 'Opisz auto', text: 'Dodaj przebieg, wyposażenie, stan i zdjęcia.' },
      { title: 'Opublikuj ogłoszenie', text: 'Ogłoszenie pojawi się na rynku, a kupujący mogą się kontaktować.' },
      { title: 'Zarządzaj kontaktami', text: 'Odpowiadaj na pytania i umawiaj oględziny lub jazdy próbne.' },
      { title: 'Zakończ sprzedaż', text: 'Uzgodnij płatność, umowę i przekazanie pojazdu.' },
    ],
    listingBenefitsTitle: 'Zalety ogłoszenia na Autorell',
    listingBenefits: [
      { title: 'Publikacja gratis', text: 'Utwórz ogłoszenie i zdecyduj, czy chcesz większą widoczność.' },
      { title: 'W kilka minut', text: 'Szybko dodaj dane i zdjęcia.' },
      { title: 'Twoja cena', text: 'Ty kontrolujesz cenę i rozmowę z kupującym.' },
      { title: 'Więcej kupujących', text: 'Autorell pomaga dotrzeć do właściwych kupujących.' },
    ],
    questionsTitle: 'Pytania?',
    questions: [
      { question: 'Co muszę podać, aby otrzymać oferty?', answer: 'Wymagany jest VIN i dane kontaktowe. Jasne informacje o stanie, serwisie i zdjęcia pomagają dealerom.' },
      { question: 'Czy muszę sprzedać, jeśli dostanę ofertę?', answer: 'Nie. Sam decydujesz, czy chcesz kontynuować z dealerem.' },
      { question: 'Którzy dealerzy widzą zapytanie?', answer: 'Połączone konta firmowe Growth, Professional lub Enterprise mogą obsługiwać zapytania.' },
      { question: 'Czy mogę też utworzyć zwykłe ogłoszenie?', answer: 'Tak. Możesz opublikować ogłoszenie i sprzedawać bezpośrednio kupującym.' },
      { question: 'Czy wysłanie zapytania kosztuje?', answer: 'Nie, wysłanie danych do połączonych dealerów jest bezpłatne.' },
      { question: 'Co dzieje się po wysłaniu danych?', answer: 'Zapytanie jest zapisywane i udostępniane uprawnionym dealerom. Mogą ocenić pojazd, skontaktować się i złożyć ofertę, jeśli pojazd pasuje.' },
      { question: 'Czy mogę później zmienić dane?', answer: 'Jeśli coś jest błędne, możesz wysłać nowe poprawione zapytanie albo doprecyzować informacje, gdy dealer się skontaktuje.' },
    ],
  },
}

function getSellToDealerExtraCopy(locale: PublicLocale) {
  const normalized = translationLocale(locale)
  const key = (normalized in extraCopyByLocale ? normalized : 'en') as keyof typeof extraCopyByLocale
  return extraCopyByLocale[key]
}

function getSellToDealerCopy(locale: PublicLocale) {
  const normalized = translationLocale(locale)
  const key = (normalized in copyByLocale ? normalized : 'en') as keyof typeof copyByLocale
  return { ...copyByLocale[key], ...contactCopyByLocale[key] }
}

function getRequestedLocale(headerStore: Awaited<ReturnType<typeof headers>>): PublicLocale {
  const requested = headerStore.get('x-autorell-language') || 'sv'
  return requested === 'sv' || requested === 'de' || isPublicLanguage(requested)
    ? requested
    : 'sv'
}

function currencyCode(locale: PublicLocale) {
  const normalized = translationLocale(locale)
  if (normalized === 'sv') return 'SEK'
  if (normalized === 'da') return 'DKK'
  if (normalized === 'pl') return 'PLN'
  return 'EUR'
}

function offerLabel(locale: PublicLocale) {
  const normalized = translationLocale(locale)
  if (normalized === 'sv') return 'Bud'
  if (normalized === 'de') return 'Angebot'
  if (normalized === 'fr') return 'Offre'
  if (normalized === 'es') return 'Oferta'
  if (normalized === 'it') return 'Offerta'
  if (normalized === 'nl') return 'Bod'
  if (normalized === 'fi') return 'Tarjous'
  if (normalized === 'da') return 'Bud'
  if (normalized === 'pl') return 'Oferta'
  return 'Offer'
}
