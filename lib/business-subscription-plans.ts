import {
  billingProductCatalog,
  type BillingProduct,
  type BusinessPlan,
} from '@/lib/billing/product-catalog'
import { translatePublicObject, translationLocale, type PublicLocale } from '@/lib/public-i18n'

export type BillingPeriod = 'monthly' | 'annual'

export type BusinessPlanFeature = {
  label: string
  description: string
  included: boolean
}

export type BusinessSubscriptionPlan = {
  key: BusinessPlan
  name: string
  audience: string
  limit: string
  summary: string
  recommended?: boolean
  enterprise?: boolean
  features: BusinessPlanFeature[]
}

export const annualDiscount = 15

export const businessSubscriptionPlans: BusinessSubscriptionPlan[] = [
  {
    key: 'free',
    name: 'Free',
    audience: 'Start',
    limit: '10 active listings',
    summary: 'A stronger free start for dealers who want to test Autorell with real inventory and basic performance data.',
    features: [
      { label: '10 active listings', description: 'Publish up to ten active listings at the same time.', included: true },
      { label: 'Own listing management', description: 'Create, pause and update your own listings.', included: true },
      { label: 'Basic analytics', description: 'See views, saves, enquiries and listing utilisation.', included: true },
      { label: 'Company page', description: 'Not included. Free does not show a separate public company page.', included: false },
      { label: 'Team accounts', description: 'Not included. Only the account owner can work in Free.', included: false },
      { label: 'Reports and export', description: 'Export and advanced reporting start with Professional.', included: false },
    ],
  },
  {
    key: 'starter',
    name: 'Starter',
    audience: 'Small dealers',
    limit: '25 active listings',
    summary: 'For smaller inventories that need a company page and a more professional sales flow.',
    features: [
      { label: '25 active listings', description: 'For smaller inventories with recurring publishing.', included: true },
      { label: 'Company page Basic', description: 'Company name, logo and contact route are presented more clearly.', included: true },
      { label: 'Standard enquiries', description: 'Leads and messages are handled through Autorell standard flow.', included: true },
      { label: 'Team accounts', description: 'Team accounts start with Growth.', included: false },
      { label: 'Reports and export', description: 'Reports and export start with Professional.', included: false },
    ],
  },
  {
    key: 'growth',
    name: 'Growth',
    audience: 'Growing team',
    limit: '100 active listings',
    summary: 'For companies where several people work in the same account and publish listings continuously.',
    recommended: true,
    features: [
      { label: '100 active listings', description: 'For a larger active inventory.', included: true },
      { label: 'Company page Plus', description: 'Extended company presentation with a shared inventory view.', included: true },
      { label: '10 team accounts', description: 'Invite up to 10 people who can use the same company account and upload listings.', included: true },
      { label: 'Staff roles', description: 'Staff can be connected to the company listing workflow.', included: true },
      { label: 'Priority support', description: 'Included from Professional.', included: false },
    ],
  },
  {
    key: 'professional',
    name: 'Professional',
    audience: 'High volume',
    limit: '500 active listings',
    summary: 'For larger organisations with many sellers, high volume and better follow-up.',
    features: [
      { label: '500 active listings', description: 'For large inventories and a high publishing pace.', included: true },
      { label: 'Company page Pro', description: 'The best standard presentation for the company and inventory.', included: true },
      { label: '50+ team accounts', description: 'Built for larger teams where many people publish and manage listings.', included: true },
      { label: 'Reports and export', description: 'Export inventory data and follow activity over time.', included: true },
      { label: 'Priority support', description: 'Faster help with publishing, payments and account cases.', included: true },
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    audience: 'Tailored',
    limit: 'Custom quota',
    summary: 'For importers, chains and operators with custom needs for volume, team and process.',
    enterprise: true,
    features: [
      { label: 'Custom listing quota', description: 'Quota and setup are based on the company actual needs.', included: true },
      { label: 'Advanced company page', description: 'Custom presentation for larger brands or several inventories.', included: true },
      { label: 'Expanded team', description: 'Team, roles and permissions are adapted to the organisation.', included: true },
      { label: 'Data export and advisory', description: 'Deeper follow-up, onboarding and practical help.', included: true },
      { label: 'Enterprise support', description: 'Direct contact for larger flows and business-critical cases.', included: true },
    ],
  },
]

export const businessSubscriptionCopy = {
  monthly: 'Monthly',
  annual: 'Annual - save 15%',
  annualBadge: '-15%',
  annualEquivalent: 'equals about',
  perMonth: '/month',
  perYear: '/year',
  exclVat: 'excl. VAT',
  included: 'Included',
  yourPlan: 'Your plan',
  recommended: 'Recommended',
  contactUs: 'Contact us',
  currentPlanButton: 'Current plan',
}

export type BusinessSubscriptionCopy = typeof businessSubscriptionCopy & {
  eyebrow: string
  title: string
  intro: string
  currentPlan: string
  noActivePlan: string
  activeListings: string
  nextBilling: string
  cancellationScheduled: string
  openInvoice: string
  activateFree: string
  activating: string
  payCard: string
  openingStripe: string
  invoice30: string
  sendingInvoice: string
  cancelPlan: string
  freeActivated: string
  invoiceCreated: string
  companyEmail: string
  paymentTerms: string
  paymentError: string
  currentPlanBadge: string
}

export const businessSubscriptionPageCopy = {
  eyebrow: 'Business subscription',
  title: 'Choose a plan for the company',
  intro:
    'The current plan is marked clearly. Choose monthly or annual billing, and use 30-day invoice when the company should be invoiced via Stripe.',
  currentPlan: 'Current plan',
  noActivePlan: 'No active plan',
  activeListings: 'active listings',
  nextBilling: 'Next billing',
  cancellationScheduled: 'Cancellation scheduled',
  ...businessSubscriptionCopy,
  openInvoice: 'Open invoice',
  activateFree: 'Activate Free',
  activating: 'Activating...',
  payCard: 'Pay by card',
  openingStripe: 'Opening Stripe...',
  invoice30: 'Invoice 14 days',
  sendingInvoice: 'Sending invoice...',
  cancelPlan: 'Cancel plan',
  freeActivated: 'Free is activated. You can now use your 10 listing slots.',
  invoiceCreated: 'The invoice has been created and sent to',
  companyEmail: 'the company email address',
  paymentTerms: 'Payment terms: 14 days.',
  paymentError: 'Could not start the payment.',
  currentPlanBadge: 'Active plan',
}

const businessSubscriptionCopyByLocale: Partial<Record<PublicLocale, Partial<BusinessSubscriptionCopy>>> = {
  sv: {
    eyebrow: 'Företagsabonnemang',
    title: 'Välj plan för företaget',
    intro: 'Nuvarande plan markeras tydligt. Välj månads- eller årsbetalning och använd 30 dagars faktura när företaget ska faktureras via Stripe.',
    currentPlan: 'Nuvarande plan',
    noActivePlan: 'Ingen aktiv plan',
    activeListings: 'aktiva annonser',
    nextBilling: 'Nästa betalning',
    cancellationScheduled: 'Uppsägning schemalagd',
    monthly: 'Månadsvis',
    annual: 'Årsvis - spara 15%',
    annualBadge: '-15%',
    annualEquivalent: 'motsvarar cirka',
    perMonth: '/månad',
    perYear: '/år',
    exclVat: 'exkl. moms',
    included: 'Ingår',
    yourPlan: 'Din plan',
    recommended: 'Rekommenderad',
    contactUs: 'Kontakta oss',
    currentPlanButton: 'Nuvarande plan',
    openInvoice: 'Öppna faktura',
    activateFree: 'Aktivera Free',
    activating: 'Aktiverar...',
    payCard: 'Betala med kort',
    openingStripe: 'Öppnar Stripe...',
    invoice30: 'Faktura 14 dagar',
    sendingInvoice: 'Skickar faktura...',
    cancelPlan: 'Avsluta plan',
    freeActivated: 'Free är aktiverat. Du kan nu använda dina 10 annonsplatser.',
    invoiceCreated: 'Fakturan har skapats och skickats till',
    companyEmail: 'företagets e-postadress',
    paymentTerms: 'Betalningsvillkor: 14 dagar.',
    paymentError: 'Kunde inte starta betalningen.',
    currentPlanBadge: 'Aktiv plan',
  },
  de: {
    eyebrow: 'Firmenabonnement',
    title: 'Tarif für das Unternehmen wählen',
    intro: 'Der aktuelle Tarif wird deutlich markiert. Wählen Sie monatliche oder jährliche Zahlung und nutzen Sie die 30-Tage-Rechnung, wenn das Unternehmen per Stripe fakturiert werden soll.',
    currentPlan: 'Aktueller Tarif',
    noActivePlan: 'Kein aktiver Tarif',
    activeListings: 'aktive Anzeigen',
    nextBilling: 'Nächste Abrechnung',
    cancellationScheduled: 'Kündigung geplant',
    monthly: 'Monatlich',
    annual: 'Jährlich - 15% sparen',
    annualEquivalent: 'entspricht ca.',
    perMonth: '/Monat',
    perYear: '/Jahr',
    exclVat: 'zzgl. MwSt.',
    included: 'Enthalten',
    yourPlan: 'Ihr Tarif',
    recommended: 'Empfohlen',
    contactUs: 'Kontakt aufnehmen',
    currentPlanButton: 'Aktueller Tarif',
    openInvoice: 'Rechnung öffnen',
    activateFree: 'Free aktivieren',
    activating: 'Wird aktiviert...',
    payCard: 'Mit Karte bezahlen',
    openingStripe: 'Stripe wird geöffnet...',
    invoice30: '14-Tage-Rechnung',
    sendingInvoice: 'Rechnung wird gesendet...',
    cancelPlan: 'Tarif kündigen',
    freeActivated: 'Free ist aktiviert. Sie können jetzt Ihre 10 Anzeigenplätze nutzen.',
    invoiceCreated: 'Die Rechnung wurde erstellt und gesendet an',
    companyEmail: 'die Firmen-E-Mail-Adresse',
    paymentTerms: 'Zahlungsziel: 14 Tage.',
    paymentError: 'Die Zahlung konnte nicht gestartet werden.',
    currentPlanBadge: 'Aktiver Tarif',
  },
  fr: {
    eyebrow: 'Abonnement entreprise',
    title: 'Choisir une offre pour l’entreprise',
    intro: 'L’offre actuelle est clairement indiquée. Choisissez une facturation mensuelle ou annuelle, ou une facture à 30 jours via Stripe.',
    currentPlan: 'Offre actuelle',
    noActivePlan: 'Aucune offre active',
    activeListings: 'annonces actives',
    nextBilling: 'Prochaine facturation',
    cancellationScheduled: 'Résiliation planifiée',
    monthly: 'Mensuel',
    annual: 'Annuel - économisez 15%',
    annualEquivalent: 'équivaut à environ',
    perMonth: '/mois',
    perYear: '/an',
    exclVat: 'hors TVA',
    included: 'Inclus',
    yourPlan: 'Votre offre',
    recommended: 'Recommandé',
    contactUs: 'Nous contacter',
    currentPlanButton: 'Offre actuelle',
    openInvoice: 'Ouvrir la facture',
    activateFree: 'Activer Free',
    activating: 'Activation...',
    payCard: 'Payer par carte',
    openingStripe: 'Ouverture de Stripe...',
    invoice30: 'Facture 14 jours',
    sendingInvoice: 'Envoi de la facture...',
    cancelPlan: 'Résilier l’offre',
    freeActivated: 'Free est activé. Vous pouvez utiliser vos 10 emplacements d’annonce.',
    invoiceCreated: 'La facture a été créée et envoyée à',
    companyEmail: 'l’adresse e-mail de l’entreprise',
    paymentTerms: 'Conditions de paiement : 14 jours.',
    paymentError: 'Impossible de démarrer le paiement.',
    currentPlanBadge: 'Offre active',
  },
  es: {
    eyebrow: 'Suscripción de empresa',
    title: 'Elige un plan para la empresa',
    intro: 'El plan actual se marca claramente. Elige pago mensual o anual, o factura a 30 días mediante Stripe.',
    currentPlan: 'Plan actual',
    noActivePlan: 'Sin plan activo',
    activeListings: 'anuncios activos',
    nextBilling: 'Próxima facturación',
    cancellationScheduled: 'Cancelación programada',
    monthly: 'Mensual',
    annual: 'Anual - ahorra 15%',
    annualEquivalent: 'equivale a aprox.',
    perMonth: '/mes',
    perYear: '/año',
    exclVat: 'IVA no incluido',
    included: 'Incluye',
    yourPlan: 'Tu plan',
    recommended: 'Recomendado',
    contactUs: 'Contactar',
    currentPlanButton: 'Plan actual',
    openInvoice: 'Abrir factura',
    activateFree: 'Activar Free',
    activating: 'Activando...',
    payCard: 'Pagar con tarjeta',
    openingStripe: 'Abriendo Stripe...',
    invoice30: 'Factura 14 días',
    sendingInvoice: 'Enviando factura...',
    cancelPlan: 'Cancelar plan',
    freeActivated: 'Free está activado. Ya puedes usar tus 10 espacios de anuncio.',
    invoiceCreated: 'La factura se ha creado y enviado a',
    companyEmail: 'el correo de la empresa',
    paymentTerms: 'Condiciones de pago: 14 días.',
    paymentError: 'No se pudo iniciar el pago.',
    currentPlanBadge: 'Plan activo',
  },
  it: {
    eyebrow: 'Abbonamento aziendale',
    title: 'Scegli un piano per l’azienda',
    intro: 'Il piano attuale è indicato chiaramente. Scegli pagamento mensile o annuale oppure fattura a 30 giorni tramite Stripe.',
    currentPlan: 'Piano attuale',
    noActivePlan: 'Nessun piano attivo',
    activeListings: 'annunci attivi',
    nextBilling: 'Prossima fatturazione',
    cancellationScheduled: 'Cancellazione programmata',
    monthly: 'Mensile',
    annual: 'Annuale - risparmia 15%',
    annualEquivalent: 'equivale a circa',
    perMonth: '/mese',
    perYear: '/anno',
    exclVat: 'IVA esclusa',
    included: 'Incluso',
    yourPlan: 'Il tuo piano',
    recommended: 'Consigliato',
    contactUs: 'Contattaci',
    currentPlanButton: 'Piano attuale',
    openInvoice: 'Apri fattura',
    activateFree: 'Attiva Free',
    activating: 'Attivazione...',
    payCard: 'Paga con carta',
    openingStripe: 'Apertura Stripe...',
    invoice30: 'Fattura 14 giorni',
    sendingInvoice: 'Invio fattura...',
    cancelPlan: 'Annulla piano',
    freeActivated: 'Free è attivo. Ora puoi usare i tuoi 10 slot per annunci.',
    invoiceCreated: 'La fattura è stata creata e inviata a',
    companyEmail: 'l’indirizzo e-mail aziendale',
    paymentTerms: 'Termini di pagamento: 14 giorni.',
    paymentError: 'Impossibile avviare il pagamento.',
    currentPlanBadge: 'Piano attivo',
  },
  nl: {
    eyebrow: 'Zakelijk abonnement',
    title: 'Kies een plan voor het bedrijf',
    intro: 'Het huidige plan wordt duidelijk gemarkeerd. Kies maandelijkse of jaarlijkse betaling, of een factuur van 30 dagen via Stripe.',
    currentPlan: 'Huidig plan',
    noActivePlan: 'Geen actief plan',
    activeListings: 'actieve advertenties',
    nextBilling: 'Volgende facturatie',
    cancellationScheduled: 'Opzegging gepland',
    monthly: 'Maandelijks',
    annual: 'Jaarlijks - bespaar 15%',
    annualEquivalent: 'komt overeen met ongeveer',
    perMonth: '/maand',
    perYear: '/jaar',
    exclVat: 'excl. btw',
    included: 'Inbegrepen',
    yourPlan: 'Je plan',
    recommended: 'Aanbevolen',
    contactUs: 'Neem contact op',
    currentPlanButton: 'Huidig plan',
    openInvoice: 'Factuur openen',
    activateFree: 'Free activeren',
    activating: 'Activeren...',
    payCard: 'Betaal met kaart',
    openingStripe: 'Stripe openen...',
    invoice30: 'Factuur 14 dagen',
    sendingInvoice: 'Factuur verzenden...',
    cancelPlan: 'Plan annuleren',
    freeActivated: 'Free is geactiveerd. Je kunt nu je 10 advertentieplaatsen gebruiken.',
    invoiceCreated: 'De factuur is aangemaakt en verzonden naar',
    companyEmail: 'het e-mailadres van het bedrijf',
    paymentTerms: 'Betalingstermijn: 14 dagen.',
    paymentError: 'Kon de betaling niet starten.',
    currentPlanBadge: 'Actief plan',
  },
  fi: {
    eyebrow: 'Yritystilaus',
    title: 'Valitse yrityksen paketti',
    intro: 'Nykyinen paketti merkitään selkeästi. Valitse kuukausi- tai vuosilaskutus tai 30 päivän lasku Stripen kautta.',
    currentPlan: 'Nykyinen paketti',
    noActivePlan: 'Ei aktiivista pakettia',
    activeListings: 'aktiivista ilmoitusta',
    nextBilling: 'Seuraava laskutus',
    cancellationScheduled: 'Peruutus ajoitettu',
    monthly: 'Kuukausittain',
    annual: 'Vuosittain - säästä 15%',
    annualEquivalent: 'vastaa noin',
    perMonth: '/kk',
    perYear: '/vuosi',
    exclVat: 'alv 0%',
    included: 'Sisältyy',
    yourPlan: 'Pakettisi',
    recommended: 'Suositeltu',
    contactUs: 'Ota yhteyttä',
    currentPlanButton: 'Nykyinen paketti',
    openInvoice: 'Avaa lasku',
    activateFree: 'Aktivoi Free',
    activating: 'Aktivoidaan...',
    payCard: 'Maksa kortilla',
    openingStripe: 'Avataan Stripe...',
    invoice30: 'Lasku 14 päivää',
    sendingInvoice: 'Lähetetään laskua...',
    cancelPlan: 'Peru paketti',
    freeActivated: 'Free on aktivoitu. Voit nyt käyttää 10 ilmoituspaikkaasi.',
    invoiceCreated: 'Lasku on luotu ja lähetetty osoitteeseen',
    companyEmail: 'yrityksen sähköpostiosoite',
    paymentTerms: 'Maksuehto: 14 päivää.',
    paymentError: 'Maksua ei voitu aloittaa.',
    currentPlanBadge: 'Aktiivinen paketti',
  },
  da: {
    eyebrow: 'Virksomhedsabonnement',
    title: 'Vælg plan til virksomheden',
    intro: 'Den aktuelle plan markeres tydeligt. Vælg månedlig eller årlig betaling, eller brug 30 dages faktura via Stripe.',
    currentPlan: 'Nuværende plan',
    noActivePlan: 'Ingen aktiv plan',
    activeListings: 'aktive annoncer',
    nextBilling: 'Næste fakturering',
    cancellationScheduled: 'Opsigelse planlagt',
    monthly: 'Månedligt',
    annual: 'Årligt - spar 15%',
    annualEquivalent: 'svarer til ca.',
    perMonth: '/måned',
    perYear: '/år',
    exclVat: 'ekskl. moms',
    included: 'Inkluderet',
    yourPlan: 'Din plan',
    recommended: 'Anbefalet',
    contactUs: 'Kontakt os',
    currentPlanButton: 'Nuværende plan',
    openInvoice: 'Åbn faktura',
    activateFree: 'Aktiver Free',
    activating: 'Aktiverer...',
    payCard: 'Betal med kort',
    openingStripe: 'Åbner Stripe...',
    invoice30: 'Faktura 14 dage',
    sendingInvoice: 'Sender faktura...',
    cancelPlan: 'Opsig plan',
    freeActivated: 'Free er aktiveret. Du kan nu bruge dine 10 annoncepladser.',
    invoiceCreated: 'Fakturaen er oprettet og sendt til',
    companyEmail: 'virksomhedens e-mailadresse',
    paymentTerms: 'Betalingsbetingelser: 14 dage.',
    paymentError: 'Kunne ikke starte betalingen.',
    currentPlanBadge: 'Aktiv plan',
  },
  pl: {
    eyebrow: 'Abonament firmowy',
    title: 'Wybierz plan dla firmy',
    intro: 'Obecny plan jest wyraźnie oznaczony. Wybierz płatność miesięczną lub roczną albo fakturę 30 dni przez Stripe.',
    currentPlan: 'Obecny plan',
    noActivePlan: 'Brak aktywnego planu',
    activeListings: 'aktywnych ogłoszeń',
    nextBilling: 'Następne rozliczenie',
    cancellationScheduled: 'Anulowanie zaplanowane',
    monthly: 'Miesięcznie',
    annual: 'Rocznie - oszczędź 15%',
    annualEquivalent: 'odpowiada około',
    perMonth: '/mies.',
    perYear: '/rok',
    exclVat: 'bez VAT',
    included: 'W zestawie',
    yourPlan: 'Twój plan',
    recommended: 'Polecany',
    contactUs: 'Skontaktuj się',
    currentPlanButton: 'Obecny plan',
    openInvoice: 'Otwórz fakturę',
    activateFree: 'Aktywuj Free',
    activating: 'Aktywowanie...',
    payCard: 'Zapłać kartą',
    openingStripe: 'Otwieranie Stripe...',
    invoice30: 'Faktura 14 dni',
    sendingInvoice: 'Wysyłanie faktury...',
    cancelPlan: 'Anuluj plan',
    freeActivated: 'Free jest aktywny. Możesz teraz używać 10 miejsc na ogłoszenia.',
    invoiceCreated: 'Faktura została utworzona i wysłana na',
    companyEmail: 'adres e-mail firmy',
    paymentTerms: 'Termin płatności: 14 dni.',
    paymentError: 'Nie można rozpocząć płatności.',
    currentPlanBadge: 'Aktywny plan',
  },
}

const enterprisePlanTranslations: Partial<Record<PublicLocale, Partial<BusinessSubscriptionPlan>>> = {
  sv: {
    name: 'Enterprise',
    audience: 'Anpassat',
    limit: 'Individuell kvot',
    summary: 'För importörer, kedjor och aktörer med egna krav på volym, team och process.',
    features: [
      { label: 'Individuell annonskvot', description: 'Kvot och upplägg baseras på företagets faktiska behov.', included: true },
      { label: 'Avancerad företagssida', description: 'Anpassad presentation för större varumärken eller flera lager.', included: true },
      { label: 'Utökat team', description: 'Team, roller och behörigheter anpassas till organisationen.', included: true },
      { label: 'Dataexport och rådgivning', description: 'Djupare uppföljning, onboarding och praktisk hjälp.', included: true },
      { label: 'Enterprise-support', description: 'Direktkontakt för större flöden och affärskritiska ärenden.', included: true },
    ],
  },
  de: {
    audience: 'Individuell',
    limit: 'Individuelle Quote',
    summary: 'Für Importeure, Ketten und Anbieter mit eigenen Anforderungen an Volumen, Team und Prozesse.',
    features: [
      { label: 'Individuelle Anzeigenquote', description: 'Quote und Einrichtung richten sich nach dem tatsächlichen Bedarf des Unternehmens.', included: true },
      { label: 'Erweiterte Unternehmensseite', description: 'Individuelle Präsentation für größere Marken oder mehrere Bestände.', included: true },
      { label: 'Erweitertes Team', description: 'Team, Rollen und Berechtigungen werden an die Organisation angepasst.', included: true },
      { label: 'Datenexport und Beratung', description: 'Tiefere Auswertung, Onboarding und praktische Unterstützung.', included: true },
      { label: 'Enterprise-Support', description: 'Direkter Kontakt für größere Abläufe und geschäftskritische Fälle.', included: true },
    ],
  },
  fr: {
    audience: 'Sur mesure',
    limit: 'Quota personnalisé',
    summary: 'Pour les importateurs, réseaux et acteurs ayant des besoins spécifiques en volume, équipe et processus.',
    features: [
      { label: 'Quota d’annonces personnalisé', description: 'Le quota et la configuration dépendent des besoins réels de l’entreprise.', included: true },
      { label: 'Page entreprise avancée', description: 'Présentation personnalisée pour grandes marques ou plusieurs stocks.', included: true },
      { label: 'Équipe étendue', description: 'Équipe, rôles et droits adaptés à l’organisation.', included: true },
      { label: 'Export de données et conseil', description: 'Suivi plus approfondi, onboarding et aide pratique.', included: true },
      { label: 'Support Enterprise', description: 'Contact direct pour les flux importants et les cas critiques.', included: true },
    ],
  },
  es: {
    audience: 'A medida',
    limit: 'Cupo personalizado',
    summary: 'Para importadores, cadenas y operadores con necesidades propias de volumen, equipo y proceso.',
    features: [
      { label: 'Cupo de anuncios personalizado', description: 'El cupo y la configuración se basan en las necesidades reales de la empresa.', included: true },
      { label: 'Página de empresa avanzada', description: 'Presentación personalizada para marcas grandes o varios inventarios.', included: true },
      { label: 'Equipo ampliado', description: 'Equipo, roles y permisos adaptados a la organización.', included: true },
      { label: 'Exportación de datos y asesoría', description: 'Seguimiento más profundo, onboarding y ayuda práctica.', included: true },
      { label: 'Soporte Enterprise', description: 'Contacto directo para flujos grandes y casos críticos.', included: true },
    ],
  },
  it: {
    audience: 'Su misura',
    limit: 'Quota personalizzata',
    summary: 'Per importatori, gruppi e operatori con esigenze specifiche di volume, team e processo.',
    features: [
      { label: 'Quota annunci personalizzata', description: 'Quota e configurazione si basano sulle esigenze reali dell’azienda.', included: true },
      { label: 'Pagina aziendale avanzata', description: 'Presentazione personalizzata per grandi marchi o più inventari.', included: true },
      { label: 'Team ampliato', description: 'Team, ruoli e autorizzazioni adattati all’organizzazione.', included: true },
      { label: 'Export dati e consulenza', description: 'Follow-up più approfondito, onboarding e supporto pratico.', included: true },
      { label: 'Supporto Enterprise', description: 'Contatto diretto per flussi grandi e casi critici.', included: true },
    ],
  },
  nl: {
    audience: 'Op maat',
    limit: 'Aangepast quotum',
    summary: 'Voor importeurs, ketens en partijen met eigen eisen voor volume, team en proces.',
    features: [
      { label: 'Aangepast advertentiequotum', description: 'Quotum en inrichting worden gebaseerd op de werkelijke behoeften van het bedrijf.', included: true },
      { label: 'Geavanceerde bedrijfspagina', description: 'Aangepaste presentatie voor grotere merken of meerdere voorraden.', included: true },
      { label: 'Uitgebreid team', description: 'Team, rollen en rechten worden aangepast aan de organisatie.', included: true },
      { label: 'Data-export en advies', description: 'Diepere opvolging, onboarding en praktische hulp.', included: true },
      { label: 'Enterprise-support', description: 'Direct contact voor grotere processen en bedrijfskritische situaties.', included: true },
    ],
  },
  fi: {
    audience: 'Räätälöity',
    limit: 'Mukautettu kiintiö',
    summary: 'Maahantuojille, ketjuille ja toimijoille, joilla on omat vaatimukset volyymille, tiimille ja prosessille.',
    features: [
      { label: 'Mukautettu ilmoituskiintiö', description: 'Kiintiö ja käyttöönotto perustuvat yrityksen todellisiin tarpeisiin.', included: true },
      { label: 'Edistynyt yrityssivu', description: 'Mukautettu esittely suuremmille brändeille tai useille varastoille.', included: true },
      { label: 'Laajennettu tiimi', description: 'Tiimi, roolit ja oikeudet mukautetaan organisaatiolle.', included: true },
      { label: 'Dataexport ja neuvonta', description: 'Syvempi seuranta, onboarding ja käytännön apu.', included: true },
      { label: 'Enterprise-tuki', description: 'Suora yhteys suurempiin työnkulkuihin ja liiketoimintakriittisiin tilanteisiin.', included: true },
    ],
  },
  da: {
    audience: 'Skræddersyet',
    limit: 'Tilpasset kvote',
    summary: 'For importører, kæder og aktører med egne krav til volumen, team og proces.',
    features: [
      { label: 'Tilpasset annoncekvote', description: 'Kvote og opsætning baseres på virksomhedens faktiske behov.', included: true },
      { label: 'Avanceret virksomhedsside', description: 'Tilpasset præsentation for større brands eller flere lagre.', included: true },
      { label: 'Udvidet team', description: 'Team, roller og rettigheder tilpasses organisationen.', included: true },
      { label: 'Dataeksport og rådgivning', description: 'Dybere opfølgning, onboarding og praktisk hjælp.', included: true },
      { label: 'Enterprise-support', description: 'Direkte kontakt til større flows og forretningskritiske sager.', included: true },
    ],
  },
  pl: {
    audience: 'Indywidualnie',
    limit: 'Indywidualny limit',
    summary: 'Dla importerów, sieci i operatorów z własnymi wymaganiami dotyczącymi wolumenu, zespołu i procesu.',
    features: [
      { label: 'Indywidualny limit ogłoszeń', description: 'Limit i konfiguracja zależą od rzeczywistych potrzeb firmy.', included: true },
      { label: 'Zaawansowana strona firmy', description: 'Indywidualna prezentacja dla większych marek lub wielu stanów magazynowych.', included: true },
      { label: 'Rozszerzony zespół', description: 'Zespół, role i uprawnienia są dopasowane do organizacji.', included: true },
      { label: 'Eksport danych i doradztwo', description: 'Głębsza analiza, onboarding i praktyczna pomoc.', included: true },
      { label: 'Wsparcie Enterprise', description: 'Bezpośredni kontakt dla większych procesów i spraw krytycznych biznesowo.', included: true },
    ],
  },
}

export function getBusinessSubscriptionCopy(locale: PublicLocale): BusinessSubscriptionCopy {
  const normalized = translationLocale(locale)
  return {
    ...translatePublicObject(normalized, businessSubscriptionPageCopy),
    ...businessSubscriptionCopyByLocale[normalized],
  }
}

export function getBusinessSubscriptionPlans(locale: PublicLocale): BusinessSubscriptionPlan[] {
  const normalized = translationLocale(locale)
  const translatedPlans = translatePublicObject(normalized, businessSubscriptionPlans)
  const enterprisePatch = enterprisePlanTranslations[normalized]
  if (!enterprisePatch) return translatedPlans
  return translatedPlans.map((plan) =>
    plan.key === 'enterprise'
      ? { ...plan, ...enterprisePatch, features: enterprisePatch.features || plan.features }
      : plan,
  )
}

export function getBusinessPlanProduct(plan: BusinessPlan, billingPeriod: BillingPeriod): BillingProduct | null {
  const interval = billingPeriod === 'annual' ? 'year' : 'month'
  return billingProductCatalog.find((product) =>
    product.kind === 'subscription' &&
    product.businessPlan === plan &&
    product.billingInterval === interval
  ) || null
}

export function localeToIntl(locale: PublicLocale) {
  const translated = translationLocale(locale)
  if (translated === 'sv') return 'sv-SE'
  if (translated === 'de') return 'de-DE'
  if (translated === 'da') return 'da-DK'
  if (translated === 'fi') return 'fi-FI'
  if (translated === 'fr') return 'fr-FR'
  if (translated === 'it') return 'it-IT'
  if (translated === 'es') return 'es-ES'
  if (translated === 'nl') return 'nl-NL'
  if (translated === 'pl') return 'pl-PL'
  return 'en-GB'
}
