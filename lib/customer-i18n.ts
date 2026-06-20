export const customerLocales = [
  'en',
  'fr',
  'es',
  'it',
  'pl',
  'nl',
  'pt',
  'fi',
  'da',
  'cs',
  'ro',
  'bg',
  'hr',
  'el',
  'hu',
  'sk',
  'sl',
  'et',
  'lv',
  'lt',
] as const

export type CustomerLocale = (typeof customerLocales)[number]

export const customerPageKeys = [
  'sell-car',
  'how-it-works',
  'about',
  'contact',
  'faq',
  'privacy',
  'cookies',
  'terms',
  'gdpr',
] as const

export type CustomerPageKey = (typeof customerPageKeys)[number]

type CustomerCopy = {
  language: string
  nav: [string, string, string, string, string]
  hero: [string, string, string]
  trust: [string, string, string]
  process: [string, string, string, string]
  pages: Record<CustomerPageKey, [string, string]>
  form: {
    labels: [string, string, string, string, string, string, string, string]
    submit: string
    sending: string
    error: string
    success: string
    consent: string
  }
  faq: Array<[string, string]>
  legal: [string, string, string, string, string]
  footer: string
  cookieSettings: string
}

const en: CustomerCopy = {
  language: 'English',
  nav: ['Sell your car', 'How it works', 'About us', 'FAQ', 'Contact'],
  hero: [
    'Sell your car with European reach',
    'A clear, secure way to sell your car.',
    'Submit your vehicle free of charge. Autorell reviews the information, tests professional demand and guides you through offer, verification, payment and collection.',
  ],
  trust: ['Free submission', 'Verified professional buyers', 'You decide whether to sell'],
  process: ['Submit the vehicle', 'We review the information', 'Receive an offer', 'Verification, payment and collection'],
  pages: {
    'sell-car': ['Sell your car', 'Tell us about the vehicle. The enquiry is free and does not oblige you to sell.'],
    'how-it-works': ['How it works', 'From vehicle details to a completed transaction in four clear stages.'],
    about: ['About Autorell', 'Autorell connects vehicle owners with verified professional demand through a structured and secure process.'],
    contact: ['Contact us', 'Send your question to the Autorell team.'],
    faq: ['Frequently asked questions', 'Answers about eligibility, offers, inspections, payment and collection.'],
    privacy: ['Privacy policy', 'How Autorell processes personal data and protects your rights.'],
    cookies: ['Cookie policy', 'How essential cookies and consent-based analytics are used.'],
    terms: ['Terms and conditions', 'The rules for submitting a vehicle and completing a sale through Autorell.'],
    gdpr: ['Your GDPR rights', 'Access, correction, deletion, restriction, portability and objection.'],
  },
  form: {
    labels: ['Registration number', 'Make', 'Model', 'Model year', 'Mileage (km)', 'City', 'Phone number', 'Email address'],
    submit: 'Send for review',
    sending: 'Sending…',
    error: 'Check the required fields and try again.',
    success: 'Thank you. Your vehicle has been sent for review.',
    consent: 'I have read the privacy policy and accept the terms.',
  },
  faq: [
    ['Does it cost anything?', 'No. Submitting a vehicle is free and does not oblige you to accept an offer.'],
    ['Who sees my information?', 'Verified professional buyers see relevant vehicle data. Private contact details remain protected.'],
    ['Is an offer binding?', 'The exact conditions are shown before you decide. Verification may be required before completion.'],
    ['How do payment and collection work?', 'Autorell coordinates the documented payment and collection process after an accepted offer.'],
  ],
  legal: [
    'Autorell AB is responsible for the processing of personal data.',
    'We process contact, vehicle, communication and transaction information needed to provide the service.',
    'Information is used to review vehicles, manage enquiries, prevent fraud and complete agreements.',
    'Necessary information may be shared with approved buyers and service providers involved in the transaction.',
    'Contact info@autorell.com to exercise your rights or ask a privacy question.',
  ],
  footer: 'A clearer route from vehicle owner to professional European demand.',
  cookieSettings: 'Cookie settings',
}

const translations: Record<CustomerLocale, CustomerCopy> = {
  en,
  fr: {
    ...en,
    language: 'Français',
    nav: ['Vendre ma voiture', 'Comment ça marche', 'À propos', 'FAQ', 'Contact'],
    hero: ['Vendez votre voiture avec une portée européenne', 'Une façon claire et sécurisée de vendre votre voiture.', 'Décrivez gratuitement votre véhicule. Autorell analyse les informations, mesure la demande professionnelle et vous accompagne pour l’offre, le contrôle, le paiement et l’enlèvement.'],
    trust: ['Dépôt gratuit', 'Acheteurs professionnels vérifiés', 'Vous décidez de vendre'],
    process: ['Décrivez le véhicule', 'Nous vérifions les informations', 'Recevez une offre', 'Contrôle, paiement et enlèvement'],
    pages: {
      'sell-car': ['Vendre ma voiture', 'Décrivez votre véhicule. La demande est gratuite et sans engagement.'],
      'how-it-works': ['Comment ça marche', 'Des informations du véhicule à la transaction en quatre étapes claires.'],
      about: ['À propos d’Autorell', 'Autorell relie les propriétaires à une demande professionnelle vérifiée dans un processus structuré et sécurisé.'],
      contact: ['Nous contacter', 'Envoyez votre question à l’équipe Autorell.'],
      faq: ['Questions fréquentes', 'Réponses sur les critères, les offres, le contrôle, le paiement et l’enlèvement.'],
      privacy: ['Politique de confidentialité', 'Comment Autorell traite les données personnelles et protège vos droits.'],
      cookies: ['Politique relative aux cookies', 'Utilisation des cookies essentiels et des statistiques soumises au consentement.'],
      terms: ['Conditions générales', 'Règles applicables au dépôt d’un véhicule et à sa vente via Autorell.'],
      gdpr: ['Vos droits RGPD', 'Accès, rectification, effacement, limitation, portabilité et opposition.'],
    },
    form: { labels: ['Immatriculation', 'Marque', 'Modèle', 'Année modèle', 'Kilométrage (km)', 'Ville', 'Téléphone', 'E-mail'], submit: 'Envoyer pour examen', sending: 'Envoi…', error: 'Vérifiez les champs obligatoires.', success: 'Merci. Votre véhicule a été envoyé pour examen.', consent: 'J’ai lu la politique de confidentialité et j’accepte les conditions.' },
    faq: [['Est-ce payant ?', 'Non. Le dépôt est gratuit et ne vous oblige pas à accepter une offre.'], ['Qui voit mes informations ?', 'Les acheteurs vérifiés voient les données utiles du véhicule. Vos coordonnées restent protégées.'], ['Une offre est-elle contraignante ?', 'Les conditions exactes sont présentées avant votre décision.'], ['Comment fonctionnent le paiement et l’enlèvement ?', 'Autorell coordonne un processus documenté après acceptation.']],
    legal: ['Autorell AB est responsable du traitement des données personnelles.', 'Nous traitons les coordonnées, les données du véhicule, les communications et les informations de transaction nécessaires.', 'Les données servent à examiner le véhicule, gérer la demande, prévenir la fraude et exécuter les accords.', 'Les informations nécessaires peuvent être partagées avec des acheteurs agréés et des prestataires impliqués.', 'Contactez info@autorell.com pour exercer vos droits.'],
    footer: 'Une voie plus claire entre le propriétaire et la demande professionnelle européenne.',
    cookieSettings: 'Paramètres des cookies',
  },
  es: {
    ...en,
    language: 'Español',
    nav: ['Vender mi coche', 'Cómo funciona', 'Sobre nosotros', 'Preguntas', 'Contacto'],
    hero: ['Venda su coche con alcance europeo', 'Una forma clara y segura de vender su coche.', 'Envíe los datos del vehículo gratis. Autorell revisa la información, comprueba la demanda profesional y coordina oferta, verificación, pago y recogida.'],
    trust: ['Envío gratuito', 'Compradores profesionales verificados', 'Usted decide si vende'],
    process: ['Envíe el vehículo', 'Revisamos la información', 'Reciba una oferta', 'Verificación, pago y recogida'],
    pages: {
      'sell-car': ['Vender mi coche', 'Cuéntenos sobre el vehículo. La solicitud es gratuita y sin compromiso.'],
      'how-it-works': ['Cómo funciona', 'De los datos del vehículo a la operación en cuatro pasos claros.'],
      about: ['Sobre Autorell', 'Autorell conecta propietarios con demanda profesional verificada mediante un proceso estructurado y seguro.'],
      contact: ['Contacto', 'Envíe su consulta al equipo de Autorell.'],
      faq: ['Preguntas frecuentes', 'Respuestas sobre requisitos, ofertas, inspección, pago y recogida.'],
      privacy: ['Política de privacidad', 'Cómo trata Autorell los datos personales y protege sus derechos.'],
      cookies: ['Política de cookies', 'Uso de cookies esenciales y analítica basada en consentimiento.'],
      terms: ['Términos y condiciones', 'Reglas para enviar un vehículo y completar una venta con Autorell.'],
      gdpr: ['Sus derechos RGPD', 'Acceso, rectificación, supresión, limitación, portabilidad y oposición.'],
    },
    form: { labels: ['Matrícula', 'Marca', 'Modelo', 'Año', 'Kilometraje (km)', 'Ciudad', 'Teléfono', 'Correo electrónico'], submit: 'Enviar para revisión', sending: 'Enviando…', error: 'Revise los campos obligatorios.', success: 'Gracias. Su vehículo se ha enviado para revisión.', consent: 'He leído la política de privacidad y acepto las condiciones.' },
    faq: [['¿Tiene coste?', 'No. Enviar un vehículo es gratuito y no obliga a aceptar una oferta.'], ['¿Quién ve mis datos?', 'Los compradores verificados ven datos relevantes del vehículo; sus contactos permanecen protegidos.'], ['¿La oferta es vinculante?', 'Las condiciones exactas se muestran antes de decidir.'], ['¿Cómo funcionan el pago y la recogida?', 'Autorell coordina el proceso documentado tras aceptar una oferta.']],
    legal: ['Autorell AB es responsable del tratamiento de datos personales.', 'Tratamos datos de contacto, vehículo, comunicaciones y transacción necesarios para el servicio.', 'Los datos se usan para revisar vehículos, gestionar consultas, prevenir fraude y completar acuerdos.', 'La información necesaria puede compartirse con compradores aprobados y proveedores implicados.', 'Contacte con info@autorell.com para ejercer sus derechos.'],
    footer: 'Una ruta más clara entre el propietario y la demanda profesional europea.',
    cookieSettings: 'Configuración de cookies',
  },
  it: {
    ...en,
    language: 'Italiano',
    nav: ['Vendi la tua auto', 'Come funziona', 'Chi siamo', 'FAQ', 'Contatti'],
    hero: ['Vendi la tua auto con una portata europea', 'Un modo chiaro e sicuro per vendere la tua auto.', 'Invia gratuitamente i dati del veicolo. Autorell verifica le informazioni e coordina offerta, controllo, pagamento e ritiro.'],
    trust: ['Invio gratuito', 'Acquirenti professionali verificati', 'Decidi tu se vendere'],
    process: ['Invia il veicolo', 'Verifichiamo i dati', 'Ricevi un’offerta', 'Controllo, pagamento e ritiro'],
    pages: {
      'sell-car': ['Vendi la tua auto', 'Descrivi il veicolo. La richiesta è gratuita e senza impegno.'],
      'how-it-works': ['Come funziona', 'Dai dati del veicolo alla vendita in quattro fasi chiare.'],
      about: ['Chi è Autorell', 'Autorell collega i proprietari a una domanda professionale verificata con un processo sicuro.'],
      contact: ['Contatti', 'Invia la tua domanda al team Autorell.'],
      faq: ['Domande frequenti', 'Risposte su requisiti, offerte, controlli, pagamento e ritiro.'],
      privacy: ['Informativa sulla privacy', 'Come Autorell tratta i dati personali e tutela i tuoi diritti.'],
      cookies: ['Informativa sui cookie', 'Uso dei cookie essenziali e delle analisi basate sul consenso.'],
      terms: ['Termini e condizioni', 'Regole per inviare un veicolo e completare una vendita con Autorell.'],
      gdpr: ['I tuoi diritti GDPR', 'Accesso, rettifica, cancellazione, limitazione, portabilità e opposizione.'],
    },
    form: { labels: ['Targa', 'Marca', 'Modello', 'Anno', 'Chilometraggio (km)', 'Città', 'Telefono', 'E-mail'], submit: 'Invia per la verifica', sending: 'Invio…', error: 'Controlla i campi obbligatori.', success: 'Grazie. Il veicolo è stato inviato per la verifica.', consent: 'Ho letto l’informativa privacy e accetto i termini.' },
    faq: [['Il servizio è gratuito?', 'Sì. L’invio è gratuito e non obbliga ad accettare un’offerta.'], ['Chi vede i miei dati?', 'Gli acquirenti verificati vedono i dati utili del veicolo; i contatti restano protetti.'], ['L’offerta è vincolante?', 'Le condizioni esatte sono mostrate prima della decisione.'], ['Come funzionano pagamento e ritiro?', 'Autorell coordina il processo documentato dopo l’accettazione.']],
    legal: ['Autorell AB è titolare del trattamento dei dati personali.', 'Trattiamo dati di contatto, veicolo, comunicazione e transazione necessari al servizio.', 'I dati servono a valutare veicoli, gestire richieste, prevenire frodi e completare accordi.', 'Le informazioni necessarie possono essere condivise con acquirenti approvati e fornitori coinvolti.', 'Scrivi a info@autorell.com per esercitare i tuoi diritti.'],
    footer: 'Un percorso più chiaro tra proprietari e domanda professionale europea.',
    cookieSettings: 'Impostazioni cookie',
  },
  pl: {
    ...en,
    language: 'Polski',
    nav: ['Sprzedaj samochód', 'Jak to działa', 'O nas', 'FAQ', 'Kontakt'],
    hero: ['Sprzedaj samochód z europejskim zasięgiem', 'Przejrzysty i bezpieczny sposób sprzedaży samochodu.', 'Prześlij dane pojazdu bezpłatnie. Autorell sprawdzi informacje i skoordynuje ofertę, weryfikację, płatność oraz odbiór.'],
    trust: ['Bezpłatne zgłoszenie', 'Zweryfikowani profesjonalni kupujący', 'Ty decydujesz o sprzedaży'],
    process: ['Zgłoś pojazd', 'Sprawdzamy informacje', 'Otrzymaj ofertę', 'Weryfikacja, płatność i odbiór'],
    pages: {
      'sell-car': ['Sprzedaj samochód', 'Opisz pojazd. Zgłoszenie jest bezpłatne i niezobowiązujące.'],
      'how-it-works': ['Jak to działa', 'Od danych pojazdu do transakcji w czterech jasnych krokach.'],
      about: ['O Autorell', 'Autorell łączy właścicieli pojazdów ze zweryfikowanym profesjonalnym popytem.'],
      contact: ['Kontakt', 'Wyślij pytanie do zespołu Autorell.'],
      faq: ['Najczęstsze pytania', 'Odpowiedzi o kryteriach, ofertach, kontroli, płatności i odbiorze.'],
      privacy: ['Polityka prywatności', 'Jak Autorell przetwarza dane osobowe i chroni Twoje prawa.'],
      cookies: ['Polityka plików cookie', 'Zasady używania niezbędnych plików cookie i analityki za zgodą.'],
      terms: ['Warunki korzystania', 'Zasady zgłoszenia pojazdu i realizacji sprzedaży przez Autorell.'],
      gdpr: ['Twoje prawa RODO', 'Dostęp, sprostowanie, usunięcie, ograniczenie, przenoszenie i sprzeciw.'],
    },
    form: { labels: ['Numer rejestracyjny', 'Marka', 'Model', 'Rok modelowy', 'Przebieg (km)', 'Miasto', 'Telefon', 'E-mail'], submit: 'Wyślij do oceny', sending: 'Wysyłanie…', error: 'Sprawdź wymagane pola.', success: 'Dziękujemy. Pojazd został wysłany do oceny.', consent: 'Zapoznałem się z polityką prywatności i akceptuję warunki.' },
    faq: [['Czy zgłoszenie kosztuje?', 'Nie. Zgłoszenie jest bezpłatne i nie zobowiązuje do przyjęcia oferty.'], ['Kto widzi moje dane?', 'Zweryfikowani kupujący widzą dane pojazdu, a dane kontaktowe pozostają chronione.'], ['Czy oferta jest wiążąca?', 'Dokładne warunki zobaczysz przed podjęciem decyzji.'], ['Jak działa płatność i odbiór?', 'Autorell koordynuje udokumentowany proces po akceptacji oferty.']],
    legal: ['Autorell AB jest administratorem danych osobowych.', 'Przetwarzamy dane kontaktowe, pojazdu, komunikacji i transakcji potrzebne do świadczenia usługi.', 'Dane służą do oceny pojazdów, obsługi zgłoszeń, zapobiegania oszustwom i realizacji umów.', 'Niezbędne informacje mogą być udostępniane zatwierdzonym kupującym i usługodawcom.', 'Napisz na info@autorell.com, aby skorzystać ze swoich praw.'],
    footer: 'Prostsza droga od właściciela pojazdu do europejskiego profesjonalnego popytu.',
    cookieSettings: 'Ustawienia plików cookie',
  },
  nl: localized('Nederlands', ['Auto verkopen', 'Zo werkt het', 'Over ons', 'FAQ', 'Contact'], ['Verkoop uw auto met Europees bereik', 'Een duidelijke en veilige manier om uw auto te verkopen.', 'Dien uw voertuig gratis in. Autorell beoordeelt de informatie en begeleidt aanbod, controle, betaling en ophaling.'], ['Gratis aanmelden', 'Geverifieerde professionele kopers', 'U beslist of u verkoopt'], ['Voertuig aanmelden', 'Wij controleren de informatie', 'Ontvang een aanbod', 'Controle, betaling en ophaling'], ['Kenteken', 'Merk', 'Model', 'Modeljaar', 'Kilometerstand', 'Plaats', 'Telefoonnummer', 'E-mailadres'], ['Versturen voor beoordeling', 'Bezig met versturen…', 'Controleer de verplichte velden.', 'Bedankt. Uw voertuig is verzonden voor beoordeling.', 'Ik heb het privacybeleid gelezen en accepteer de voorwaarden.'], 'Cookie-instellingen'),
  pt: localized('Português', ['Vender o carro', 'Como funciona', 'Sobre nós', 'FAQ', 'Contacto'], ['Venda o seu carro com alcance europeu', 'Uma forma clara e segura de vender o seu carro.', 'Envie gratuitamente os dados do veículo. A Autorell coordena proposta, verificação, pagamento e recolha.'], ['Submissão gratuita', 'Compradores profissionais verificados', 'Você decide se vende'], ['Envie o veículo', 'Verificamos os dados', 'Receba uma proposta', 'Verificação, pagamento e recolha'], ['Matrícula', 'Marca', 'Modelo', 'Ano', 'Quilometragem', 'Cidade', 'Telefone', 'E-mail'], ['Enviar para análise', 'A enviar…', 'Verifique os campos obrigatórios.', 'Obrigado. O veículo foi enviado para análise.', 'Li a política de privacidade e aceito os termos.'], 'Definições de cookies'),
  fi: localized('Suomi', ['Myy autosi', 'Näin se toimii', 'Tietoa meistä', 'UKK', 'Yhteystiedot'], ['Myy autosi Euroopan laajuisesti', 'Selkeä ja turvallinen tapa myydä auto.', 'Lähetä ajoneuvon tiedot maksutta. Autorell koordinoi tarjouksen, tarkastuksen, maksun ja noudon.'], ['Maksuton ilmoitus', 'Vahvistetut ammattiostajat', 'Sinä päätät myynnistä'], ['Lähetä ajoneuvo', 'Tarkistamme tiedot', 'Saat tarjouksen', 'Tarkastus, maksu ja nouto'], ['Rekisterinumero', 'Merkki', 'Malli', 'Vuosimalli', 'Ajokilometrit', 'Kaupunki', 'Puhelin', 'Sähköposti'], ['Lähetä arvioitavaksi', 'Lähetetään…', 'Tarkista pakolliset kentät.', 'Kiitos. Ajoneuvo on lähetetty arvioitavaksi.', 'Olen lukenut tietosuojakäytännön ja hyväksyn ehdot.'], 'Evästeasetukset'),
  da: localized('Dansk', ['Sælg din bil', 'Sådan fungerer det', 'Om os', 'FAQ', 'Kontakt'], ['Sælg din bil med europæisk rækkevidde', 'En klar og sikker måde at sælge din bil på.', 'Indsend bilens oplysninger gratis. Autorell koordinerer tilbud, kontrol, betaling og afhentning.'], ['Gratis indsendelse', 'Verificerede professionelle købere', 'Du beslutter, om du vil sælge'], ['Indsend bilen', 'Vi gennemgår oplysningerne', 'Modtag et tilbud', 'Kontrol, betaling og afhentning'], ['Registreringsnummer', 'Mærke', 'Model', 'Modelår', 'Kilometerstand', 'By', 'Telefon', 'E-mail'], ['Send til vurdering', 'Sender…', 'Kontrollér de obligatoriske felter.', 'Tak. Bilen er sendt til vurdering.', 'Jeg har læst privatlivspolitikken og accepterer vilkårene.'], 'Cookieindstillinger'),
  cs: localized('Čeština', ['Prodat auto', 'Jak to funguje', 'O nás', 'Časté dotazy', 'Kontakt'], ['Prodejte auto s evropským dosahem', 'Jasný a bezpečný způsob prodeje auta.', 'Odešlete údaje o vozidle zdarma. Autorell koordinuje nabídku, kontrolu, platbu a převzetí.'], ['Bezplatné odeslání', 'Ověření profesionální kupující', 'O prodeji rozhodujete vy'], ['Odešlete vozidlo', 'Prověříme údaje', 'Získejte nabídku', 'Kontrola, platba a převzetí'], ['Registrační značka', 'Značka', 'Model', 'Modelový rok', 'Kilometry', 'Město', 'Telefon', 'E-mail'], ['Odeslat k posouzení', 'Odesílání…', 'Zkontrolujte povinná pole.', 'Děkujeme. Vozidlo bylo odesláno k posouzení.', 'Přečetl/a jsem zásady ochrany osobních údajů a souhlasím s podmínkami.'], 'Nastavení cookies'),
  ro: localized('Română', ['Vinde mașina', 'Cum funcționează', 'Despre noi', 'Întrebări', 'Contact'], ['Vinde mașina cu acoperire europeană', 'O modalitate clară și sigură de a vinde mașina.', 'Trimite gratuit datele vehiculului. Autorell coordonează oferta, verificarea, plata și ridicarea.'], ['Trimitere gratuită', 'Cumpărători profesioniști verificați', 'Tu decizi dacă vinzi'], ['Trimite vehiculul', 'Verificăm informațiile', 'Primește o ofertă', 'Verificare, plată și ridicare'], ['Număr de înmatriculare', 'Marcă', 'Model', 'An', 'Kilometraj', 'Oraș', 'Telefon', 'E-mail'], ['Trimite pentru evaluare', 'Se trimite…', 'Verifică rubricile obligatorii.', 'Mulțumim. Vehiculul a fost trimis pentru evaluare.', 'Am citit politica de confidențialitate și accept condițiile.'], 'Setări cookie'),
  bg: localized('Български', ['Продайте автомобила', 'Как работи', 'За нас', 'Въпроси', 'Контакт'], ['Продайте автомобила си с европейски обхват', 'Ясен и сигурен начин да продадете автомобила си.', 'Изпратете данните безплатно. Autorell координира офертата, проверката, плащането и получаването.'], ['Безплатно изпращане', 'Проверени професионални купувачи', 'Вие решавате дали да продадете'], ['Изпратете автомобила', 'Проверяваме данните', 'Получете оферта', 'Проверка, плащане и получаване'], ['Регистрационен номер', 'Марка', 'Модел', 'Година', 'Пробег', 'Град', 'Телефон', 'Имейл'], ['Изпрати за оценка', 'Изпращане…', 'Проверете задължителните полета.', 'Благодарим. Автомобилът е изпратен за оценка.', 'Прочетох политиката за поверителност и приемам условията.'], 'Настройки за бисквитки'),
  hr: localized('Hrvatski', ['Prodaj automobil', 'Kako funkcionira', 'O nama', 'Česta pitanja', 'Kontakt'], ['Prodajte automobil uz europski doseg', 'Jasan i siguran način prodaje automobila.', 'Pošaljite podatke besplatno. Autorell koordinira ponudu, provjeru, plaćanje i preuzimanje.'], ['Besplatna prijava', 'Provjereni profesionalni kupci', 'Vi odlučujete o prodaji'], ['Pošaljite vozilo', 'Provjeravamo podatke', 'Primite ponudu', 'Provjera, plaćanje i preuzimanje'], ['Registracija', 'Marka', 'Model', 'Godina', 'Kilometraža', 'Grad', 'Telefon', 'E-pošta'], ['Pošalji na procjenu', 'Slanje…', 'Provjerite obavezna polja.', 'Hvala. Vozilo je poslano na procjenu.', 'Pročitao/la sam pravila privatnosti i prihvaćam uvjete.'], 'Postavke kolačića'),
  el: localized('Ελληνικά', ['Πουλήστε το αυτοκίνητο', 'Πώς λειτουργεί', 'Σχετικά με εμάς', 'Συχνές ερωτήσεις', 'Επικοινωνία'], ['Πουλήστε το αυτοκίνητό σας με ευρωπαϊκή εμβέλεια', 'Ένας σαφής και ασφαλής τρόπος πώλησης.', 'Υποβάλετε δωρεάν τα στοιχεία. Η Autorell συντονίζει προσφορά, έλεγχο, πληρωμή και παραλαβή.'], ['Δωρεάν υποβολή', 'Επαληθευμένοι επαγγελματίες αγοραστές', 'Εσείς αποφασίζετε'], ['Υποβάλετε το όχημα', 'Ελέγχουμε τα στοιχεία', 'Λάβετε προσφορά', 'Έλεγχος, πληρωμή και παραλαβή'], ['Αριθμός κυκλοφορίας', 'Μάρκα', 'Μοντέλο', 'Έτος', 'Χιλιόμετρα', 'Πόλη', 'Τηλέφωνο', 'Email'], ['Αποστολή για αξιολόγηση', 'Αποστολή…', 'Ελέγξτε τα υποχρεωτικά πεδία.', 'Ευχαριστούμε. Το όχημα στάλθηκε για αξιολόγηση.', 'Διάβασα την πολιτική απορρήτου και αποδέχομαι τους όρους.'], 'Ρυθμίσεις cookies'),
  hu: localized('Magyar', ['Autó eladása', 'Hogyan működik', 'Rólunk', 'GYIK', 'Kapcsolat'], ['Adja el autóját európai eléréssel', 'Átlátható és biztonságos autóértékesítés.', 'Küldje be ingyenesen az adatokat. Az Autorell koordinálja az ajánlatot, ellenőrzést, fizetést és átvételt.'], ['Ingyenes beküldés', 'Ellenőrzött szakmai vevők', 'Ön dönt az eladásról'], ['Jármű beküldése', 'Adatok ellenőrzése', 'Ajánlat fogadása', 'Ellenőrzés, fizetés és átvétel'], ['Rendszám', 'Márka', 'Modell', 'Évjárat', 'Kilométer', 'Város', 'Telefon', 'E-mail'], ['Küldés értékelésre', 'Küldés…', 'Ellenőrizze a kötelező mezőket.', 'Köszönjük. A járművet elküldtük értékelésre.', 'Elolvastam az adatvédelmi tájékoztatót és elfogadom a feltételeket.'], 'Cookie-beállítások'),
  sk: localized('Slovenčina', ['Predať auto', 'Ako to funguje', 'O nás', 'Časté otázky', 'Kontakt'], ['Predajte auto s európskym dosahom', 'Jasný a bezpečný spôsob predaja auta.', 'Odošlite údaje bezplatne. Autorell koordinuje ponuku, kontrolu, platbu a prevzatie.'], ['Bezplatné odoslanie', 'Overení profesionálni kupujúci', 'O predaji rozhodujete vy'], ['Odošlite vozidlo', 'Skontrolujeme údaje', 'Získajte ponuku', 'Kontrola, platba a prevzatie'], ['Evidenčné číslo', 'Značka', 'Model', 'Rok', 'Kilometre', 'Mesto', 'Telefón', 'E-mail'], ['Odoslať na posúdenie', 'Odosielanie…', 'Skontrolujte povinné polia.', 'Ďakujeme. Vozidlo bolo odoslané na posúdenie.', 'Prečítal/a som si zásady ochrany osobných údajov a súhlasím s podmienkami.'], 'Nastavenia cookies'),
  sl: localized('Slovenščina', ['Prodajte avto', 'Kako deluje', 'O nas', 'Pogosta vprašanja', 'Kontakt'], ['Prodajte avto z evropskim dosegom', 'Jasen in varen način prodaje avtomobila.', 'Podatke pošljite brezplačno. Autorell usklajuje ponudbo, pregled, plačilo in prevzem.'], ['Brezplačna prijava', 'Preverjeni profesionalni kupci', 'Vi odločate o prodaji'], ['Pošljite vozilo', 'Preverimo podatke', 'Prejmite ponudbo', 'Pregled, plačilo in prevzem'], ['Registrska številka', 'Znamka', 'Model', 'Letnik', 'Kilometri', 'Mesto', 'Telefon', 'E-pošta'], ['Pošlji v pregled', 'Pošiljanje…', 'Preverite obvezna polja.', 'Hvala. Vozilo je bilo poslano v pregled.', 'Prebral/a sem pravilnik o zasebnosti in sprejemam pogoje.'], 'Nastavitve piškotkov'),
  et: localized('Eesti', ['Müü auto', 'Kuidas see toimib', 'Meist', 'KKK', 'Kontakt'], ['Müü oma auto Euroopa ulatuses', 'Selge ja turvaline viis auto müümiseks.', 'Esita sõiduki andmed tasuta. Autorell koordineerib pakkumise, kontrolli, makse ja äraveo.'], ['Tasuta esitamine', 'Kontrollitud professionaalsed ostjad', 'Sina otsustad müügi'], ['Esita sõiduk', 'Kontrollime andmeid', 'Saa pakkumine', 'Kontroll, makse ja äravedu'], ['Registreerimisnumber', 'Mark', 'Mudel', 'Aasta', 'Läbisõit', 'Linn', 'Telefon', 'E-post'], ['Saada hindamisele', 'Saatmine…', 'Kontrolli kohustuslikke välju.', 'Täname. Sõiduk saadeti hindamisele.', 'Olen lugenud privaatsuspoliitikat ja nõustun tingimustega.'], 'Küpsiste seaded'),
  lv: localized('Latviešu', ['Pārdot auto', 'Kā tas darbojas', 'Par mums', 'BUJ', 'Kontakti'], ['Pārdodiet auto ar Eiropas mēroga sasniedzamību', 'Skaidrs un drošs veids, kā pārdot auto.', 'Iesniedziet datus bez maksas. Autorell koordinē piedāvājumu, pārbaudi, samaksu un saņemšanu.'], ['Bezmaksas iesniegšana', 'Pārbaudīti profesionāli pircēji', 'Jūs izlemjat par pārdošanu'], ['Iesniedziet auto', 'Pārbaudām informāciju', 'Saņemiet piedāvājumu', 'Pārbaude, samaksa un saņemšana'], ['Reģistrācijas numurs', 'Marka', 'Modelis', 'Gads', 'Nobraukums', 'Pilsēta', 'Tālrunis', 'E-pasts'], ['Nosūtīt izvērtēšanai', 'Nosūtīšana…', 'Pārbaudiet obligātos laukus.', 'Paldies. Auto nosūtīts izvērtēšanai.', 'Esmu izlasījis privātuma politiku un piekrītu noteikumiem.'], 'Sīkdatņu iestatījumi'),
  lt: localized('Lietuvių', ['Parduoti automobilį', 'Kaip tai veikia', 'Apie mus', 'DUK', 'Kontaktai'], ['Parduokite automobilį Europos mastu', 'Aiškus ir saugus būdas parduoti automobilį.', 'Pateikite duomenis nemokamai. Autorell koordinuoja pasiūlymą, patikrą, mokėjimą ir paėmimą.'], ['Nemokamas pateikimas', 'Patikrinti profesionalūs pirkėjai', 'Jūs sprendžiate dėl pardavimo'], ['Pateikite automobilį', 'Patikriname informaciją', 'Gaukite pasiūlymą', 'Patikra, mokėjimas ir paėmimas'], ['Registracijos numeris', 'Markė', 'Modelis', 'Metai', 'Rida', 'Miestas', 'Telefonas', 'El. paštas'], ['Siųsti vertinimui', 'Siunčiama…', 'Patikrinkite privalomus laukus.', 'Ačiū. Automobilis išsiųstas vertinimui.', 'Perskaičiau privatumo politiką ir sutinku su sąlygomis.'], 'Slapukų nustatymai'),
}

function localized(
  language: string,
  nav: CustomerCopy['nav'],
  hero: CustomerCopy['hero'],
  trust: CustomerCopy['trust'],
  process: CustomerCopy['process'],
  labels: CustomerCopy['form']['labels'],
  form: [string, string, string, string, string],
  cookieSettings: string,
): CustomerCopy {
  const [sell, how, about, faq, contact] = nav
  return {
    ...en,
    language,
    nav,
    hero,
    trust,
    process,
    pages: {
      ...en.pages,
      'sell-car': [sell, hero[2]],
      'how-it-works': [how, hero[2]],
      about: [about, hero[2]],
      contact: [contact, hero[2]],
      faq: [faq, hero[2]],
    },
    form: {
      labels,
      submit: form[0],
      sending: form[1],
      error: form[2],
      success: form[3],
      consent: form[4],
    },
    footer: hero[2],
    cookieSettings,
  }
}

export function isCustomerLocale(value: string): value is CustomerLocale {
  return customerLocales.includes(value as CustomerLocale)
}

export function isCustomerPageKey(value: string): value is CustomerPageKey {
  return customerPageKeys.includes(value as CustomerPageKey)
}

export function getCustomerCopy(locale: CustomerLocale) {
  return translations[locale]
}

export function customerHref(locale: CustomerLocale, page: CustomerPageKey | '') {
  return page ? `/${locale}/${page}` : `/${locale}`
}

export function getCustomerAlternates(page: CustomerPageKey | '') {
  const suffix = page ? `/${page}` : ''
  return Object.fromEntries([
    ...customerLocales.map((locale) => [
      locale,
      `https://www.autorell.com/${locale}${suffix}`,
    ]),
    ['sv-SE', `https://www.autorell.se${page === 'sell-car' ? '/salj-bil' : ''}`],
    ['de-DE', `https://www.autorell.de${page === 'sell-car' ? '/fahrzeuge' : ''}`],
    ['x-default', `https://www.autorell.com/en${suffix}`],
  ])
}
