import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { BadgeCheck, CheckCircle2, Clock3, Gauge, ShieldCheck, Sparkles, Tag } from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import SellToDealerLeadForm, { type SellToDealerFormCopy } from '@/app/components/SellToDealerLeadForm'
import { cleanSeoText } from '@/lib/market-seo'
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

export async function generateSellToDealerMetadata(): Promise<Metadata> {
  const headerStore = await headers()
  const locale = getRequestedLocale(headerStore)
  const copy = getSellToDealerCopy(locale)
  const canonicalPath = headerStore.get('x-autorell-pathname') || localizePublicHref(locale, '/sell-to-dealer')

  return {
    title: { absolute: cleanSeoText(copy.metaTitle, 65) },
    description: cleanSeoText(copy.metaDescription, 155),
    alternates: { canonical: `https://www.autorell.com${canonicalPath}` },
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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f7fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />

      <section className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-8 sm:px-8 sm:py-12">
        <div className="w-full max-w-[calc(100vw-40px)] overflow-hidden rounded-[18px] border border-[#cfe0ff] bg-[#eef5ff] shadow-[0_18px_55px_rgba(16,24,40,.08)] sm:max-w-none">
          <div className="grid min-h-[360px] min-w-0 lg:grid-cols-[minmax(0,1fr)_390px]">
            <div className="relative flex min-h-[320px] min-w-0 flex-col justify-between overflow-hidden px-5 py-7 sm:px-9 sm:py-10">
              <div className="relative z-10 max-w-[calc(100vw-80px)] sm:max-w-[440px]">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0866ff] shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h1 className="mt-5 max-w-full text-[30px] font-semibold leading-[1.04] tracking-[-.045em] [overflow-wrap:anywhere] sm:max-w-[520px] sm:text-5xl sm:tracking-[-.055em]">
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

            <div className="flex min-w-0 items-center p-4 sm:p-7">
              <SellToDealerLeadForm copy={copy} />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-[16px] border border-[#98a2b3] bg-white px-5 py-4 text-sm font-semibold text-[#101828] sm:flex-row sm:items-center sm:justify-between">
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
      </section>

      <PublicFooter locale={locale} />
    </main>
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
