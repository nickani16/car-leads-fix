import { Building2, CheckCircle2, MapPin, Route, Store, type LucideIcon } from 'lucide-react'
import { CompanyPortalShell, getCompanyPortalContext } from '@/lib/company-portal'
import { createAdminClient } from '@/lib/supabase/admin'
import { translatePublicObject, translationLocale, type PublicLocale } from '@/lib/public-i18n'
import { generateAccountMetadata } from '@/lib/account-seo'
import { CompanyLocationForm } from './CompanyLocationForm'
import { CompanyLocationActions } from './CompanyLocationActions'

export const generateMetadata = generateAccountMetadata('company-locations')

type LocationRow = {
  id: string
  name: string | null
  location_type: string | null
  country_code: string | null
  region: string | null
  municipality: string | null
  city: string | null
  postal_code: string | null
  address_line_1: string | null
  contact_email: string | null
  contact_phone: string | null
  is_primary: boolean | null
  is_active: boolean | null
}

const baseCopy = {
  title: 'Locations and branches',
  description: 'Separate branches, showrooms and storage locations so larger dealers can manage inventory without mixing every vehicle into one company profile.',
  primaryLocation: 'Primary location',
  activeLocation: 'Active location',
  branch: 'Branch',
  showroom: 'Showroom',
  storage: 'Storage',
  headquarters: 'Headquarters',
  service: 'Service',
  other: 'Other',
  noLocationsTitle: 'No separate branches yet',
  noLocationsText: 'Start with the company profile as the main location. Branch inventory can be split into separate locations as the dealership grows.',
  addBranch: 'Add branch',
  comingNext: 'Create branches here and use the same branch names in manual listings or CSV imports.',
  routingTitle: 'How this helps larger dealers',
  routingText: 'Each branch can keep its own city, municipality, address and contact details. Listings can then be routed to the right sales team and shown more accurately in marketplace filters, maps and company pages.',
  dataTitle: 'Branch data model',
  dataText: 'The database foundation is ready for headquarters, branches, showrooms, storage and service locations with address, geo and contact fields.',
  formIntro: 'Add one physical place at a time. For groups with many locations, use the same names in the CSV branch column.',
  name: 'Name',
  type: 'Type',
  countryCode: 'Country code',
  region: 'Region',
  municipality: 'Municipality',
  city: 'City',
  postalCode: 'Postal code',
  addressLine1: 'Street address',
  contactEmail: 'Contact email',
  contactPhone: 'Contact phone',
  saveBranch: 'Save branch',
  editBranch: 'Edit branch',
  saveChanges: 'Save changes',
  deactivateBranch: 'Deactivate branch',
  deactivating: 'Deactivating',
  cancel: 'Cancel',
  saving: 'Saving',
  saved: 'Branch saved',
  saveError: 'Could not save company location.',
  updateError: 'Could not update company location.',
  deactivateError: 'Could not deactivate company location.',
}

const localeCopy: Partial<Record<ReturnType<typeof translationLocale>, Partial<typeof baseCopy>>> = {
  sv: {
    title: 'Platser och filialer',
    description: 'Separera filialer, bilhallar och lagerplatser så större handlare kan hantera lager utan att blanda alla fordon i en enda företagsprofil.',
    primaryLocation: 'Primär plats',
    activeLocation: 'Aktiv plats',
    branch: 'Filial',
    showroom: 'Bilhall',
    storage: 'Lager',
    headquarters: 'Huvudkontor',
    service: 'Service',
    other: 'Annat',
    noLocationsTitle: 'Inga separata filialer ännu',
    noLocationsText: 'Börja med företagsprofilen som huvudplats. När verksamheten växer kan lagret delas upp på separata filialer.',
    addBranch: 'Lägg till filial',
    comingNext: 'Skapa filialer här och använd samma filialnamn i manuella annonser eller CSV-importer.',
    routingTitle: 'Så hjälper det större handlare',
    routingText: 'Varje filial kan ha egen ort, kommun, adress och kontaktuppgifter. Annonser kan då styras till rätt säljteam och visas mer exakt i filter, kartor och företagssidor.',
    dataTitle: 'Datamodell för filialer',
    dataText: 'Databasgrunden stödjer huvudkontor, filialer, bilhallar, lager och serviceplatser med adress-, geo- och kontaktfält.',
    formIntro: 'Lägg till en fysisk plats i taget. För grupper med många platser används samma namn i CSV-kolumnen för filial.',
    name: 'Namn',
    type: 'Typ',
    countryCode: 'Landskod',
    region: 'Region',
    municipality: 'Kommun',
    city: 'Ort',
    postalCode: 'Postnummer',
    addressLine1: 'Gatuadress',
    contactEmail: 'Kontaktmejl',
    contactPhone: 'Kontakttelefon',
    saveBranch: 'Spara filial',
    editBranch: 'Redigera filial',
    saveChanges: 'Spara ändringar',
    deactivateBranch: 'Inaktivera filial',
    deactivating: 'Inaktiverar',
    cancel: 'Avbryt',
    saving: 'Sparar',
    saved: 'Filial sparad',
    saveError: 'Kunde inte spara filialen.',
    updateError: 'Kunde inte uppdatera filialen.',
    deactivateError: 'Kunde inte inaktivera filialen.',
  },
  de: {
    title: 'Standorte und Filialen',
    description: 'Trennen Sie Filialen, Showrooms und Lagerstandorte, damit größere Händler ihren Bestand verwalten können, ohne alle Fahrzeuge in einem Unternehmensprofil zu vermischen.',
    primaryLocation: 'Primärer Standort',
    activeLocation: 'Aktiver Standort',
    branch: 'Filiale',
    showroom: 'Showroom',
    storage: 'Lager',
    headquarters: 'Hauptsitz',
    service: 'Service',
    other: 'Sonstiges',
    noLocationsTitle: 'Noch keine separaten Filialen',
    noLocationsText: 'Starten Sie mit dem Unternehmensprofil als Hauptstandort. Mit wachsendem Bestand können Fahrzeuge auf separate Filialen verteilt werden.',
    addBranch: 'Filiale hinzufügen',
    comingNext: 'Erstellen Sie hier Filialen und verwenden Sie dieselben Filialnamen in manuellen Anzeigen oder CSV-Importen.',
    routingTitle: 'So hilft es größeren Händlern',
    routingText: 'Jede Filiale kann eigene Stadt-, Gemeinde-, Adress- und Kontaktdaten führen. Anzeigen können dann an das richtige Verkaufsteam geleitet und genauer in Filtern, Karten und Unternehmensseiten angezeigt werden.',
    dataTitle: 'Datenmodell für Filialen',
    dataText: 'Die Datenbankbasis unterstützt Hauptsitze, Filialen, Showrooms, Lager und Servicestandorte mit Adress-, Geo- und Kontaktfeldern.',
    formIntro: 'Fügen Sie jeweils einen physischen Standort hinzu. Gruppen mit vielen Standorten verwenden dieselben Namen in der CSV-Spalte für Filialen.',
    name: 'Name',
    type: 'Typ',
    countryCode: 'Ländercode',
    region: 'Region',
    municipality: 'Gemeinde',
    city: 'Stadt',
    postalCode: 'Postleitzahl',
    addressLine1: 'Straße und Hausnummer',
    contactEmail: 'Kontakt-E-Mail',
    contactPhone: 'Kontakttelefon',
    saveBranch: 'Filiale speichern',
    editBranch: 'Filiale bearbeiten',
    saveChanges: 'Änderungen speichern',
    deactivateBranch: 'Filiale deaktivieren',
    deactivating: 'Deaktiviert',
    cancel: 'Abbrechen',
    saving: 'Speichert',
    saved: 'Filiale gespeichert',
    saveError: 'Filiale konnte nicht gespeichert werden.',
    updateError: 'Filiale konnte nicht aktualisiert werden.',
    deactivateError: 'Filiale konnte nicht deaktiviert werden.',
  },
  fr: {
    title: 'Sites et agences',
    description: 'Séparez les agences, showrooms et lieux de stockage afin que les grands distributeurs gèrent leur stock sans tout mélanger dans un seul profil entreprise.',
    primaryLocation: 'Site principal',
    activeLocation: 'Site actif',
    branch: 'Agence',
    showroom: 'Showroom',
    storage: 'Stockage',
    headquarters: 'Siège',
    service: 'Service',
    other: 'Autre',
    noLocationsTitle: 'Aucune agence séparée pour le moment',
    noLocationsText: 'Commencez avec le profil entreprise comme site principal. Le stock peut ensuite être réparti par agence.',
    addBranch: 'Ajouter une agence',
    comingNext: 'Créez vos agences ici et utilisez les mêmes noms dans les annonces manuelles ou les imports CSV.',
    routingTitle: 'Utile pour les grands distributeurs',
    routingText: 'Chaque agence peut conserver sa ville, sa commune, son adresse et ses coordonnées. Les annonces peuvent être routées vers la bonne équipe et mieux apparaître dans les filtres, cartes et pages entreprise.',
    dataTitle: 'Modèle de données des agences',
    dataText: 'La base de données prend en charge sièges, agences, showrooms, stockages et sites de service avec adresse, géolocalisation et contacts.',
    formIntro: 'Ajoutez un lieu physique à la fois. Pour les groupes avec plusieurs sites, utilisez les mêmes noms dans la colonne agence du CSV.',
    name: 'Nom',
    type: 'Type',
    countryCode: 'Code pays',
    region: 'Région',
    municipality: 'Commune',
    city: 'Ville',
    postalCode: 'Code postal',
    addressLine1: 'Adresse',
    contactEmail: 'E-mail de contact',
    contactPhone: 'Téléphone de contact',
    saveBranch: 'Enregistrer l’agence',
    editBranch: 'Modifier l’agence',
    saveChanges: 'Enregistrer',
    deactivateBranch: 'Désactiver l’agence',
    deactivating: 'Désactivation',
    cancel: 'Annuler',
    saving: 'Enregistrement',
    saved: 'Agence enregistrée',
    saveError: 'Impossible d’enregistrer l’agence.',
    updateError: 'Impossible de mettre à jour l’agence.',
    deactivateError: 'Impossible de désactiver l’agence.',
  },
  es: {
    title: 'Ubicaciones y sucursales',
    description: 'Separa sucursales, salas de exposición y almacenes para que los grandes vendedores gestionen inventario sin mezclar todos los vehículos en un único perfil de empresa.',
    primaryLocation: 'Ubicación principal',
    activeLocation: 'Ubicación activa',
    branch: 'Sucursal',
    showroom: 'Exposición',
    storage: 'Almacén',
    headquarters: 'Sede central',
    service: 'Servicio',
    other: 'Otro',
    noLocationsTitle: 'Aún no hay sucursales separadas',
    noLocationsText: 'Empieza con el perfil de empresa como ubicación principal. El inventario podrá dividirse en ubicaciones separadas a medida que el concesionario crezca.',
    addBranch: 'Añadir sucursal',
    comingNext: 'Crea sucursales aquí y usa los mismos nombres en anuncios manuales o importaciones CSV.',
    routingTitle: 'Cómo ayuda a grandes vendedores',
    routingText: 'Cada sucursal puede mantener su propia ciudad, municipio, dirección y datos de contacto. Los anuncios se pueden dirigir al equipo correcto y mostrarse con más precisión en filtros, mapas y páginas de empresa.',
    dataTitle: 'Modelo de datos de sucursales',
    dataText: 'La base de datos está preparada para sedes, sucursales, exposiciones, almacenes y centros de servicio con campos de dirección, geo y contacto.',
    formIntro: 'Añade un lugar físico cada vez. Para grupos con muchas ubicaciones, usa los mismos nombres en la columna de sucursal del CSV.',
    name: 'Nombre',
    type: 'Tipo',
    countryCode: 'Código de país',
    region: 'Región',
    municipality: 'Municipio',
    city: 'Ciudad',
    postalCode: 'Código postal',
    addressLine1: 'Dirección',
    contactEmail: 'Correo de contacto',
    contactPhone: 'Teléfono de contacto',
    saveBranch: 'Guardar sucursal',
    editBranch: 'Editar sucursal',
    saveChanges: 'Guardar cambios',
    deactivateBranch: 'Desactivar sucursal',
    deactivating: 'Desactivando',
    cancel: 'Cancelar',
    saving: 'Guardando',
    saved: 'Sucursal guardada',
    saveError: 'No se pudo guardar la sucursal.',
    updateError: 'No se pudo actualizar la sucursal.',
    deactivateError: 'No se pudo desactivar la sucursal.',
  },
  it: {
    title: 'Sedi e filiali',
    description: 'Separa filiali, showroom e depositi così i concessionari più grandi possono gestire lo stock senza mescolare tutti i veicoli in un unico profilo aziendale.',
    primaryLocation: 'Sede principale',
    activeLocation: 'Sede attiva',
    branch: 'Filiale',
    showroom: 'Showroom',
    storage: 'Deposito',
    headquarters: 'Sede centrale',
    service: 'Servizio',
    other: 'Altro',
    noLocationsTitle: 'Nessuna filiale separata',
    noLocationsText: 'Inizia con il profilo aziendale come sede principale. Lo stock potrà essere diviso in sedi separate man mano che l’attività cresce.',
    addBranch: 'Aggiungi filiale',
    comingNext: 'Crea qui le filiali e usa gli stessi nomi negli annunci manuali o negli import CSV.',
    routingTitle: 'Come aiuta i grandi concessionari',
    routingText: 'Ogni filiale può mantenere città, comune, indirizzo e contatti propri. Gli annunci possono essere indirizzati al team giusto e mostrati meglio in filtri, mappe e pagine aziendali.',
    dataTitle: 'Modello dati filiali',
    dataText: 'La base dati supporta sedi centrali, filiali, showroom, depositi e sedi di servizio con campi indirizzo, geo e contatto.',
    formIntro: 'Aggiungi una sede fisica alla volta. Per gruppi con molte sedi, usa gli stessi nomi nella colonna filiale del CSV.',
    name: 'Nome',
    type: 'Tipo',
    countryCode: 'Codice paese',
    region: 'Regione',
    municipality: 'Comune',
    city: 'Città',
    postalCode: 'CAP',
    addressLine1: 'Indirizzo',
    contactEmail: 'E-mail di contatto',
    contactPhone: 'Telefono di contatto',
    saveBranch: 'Salva filiale',
    editBranch: 'Modifica filiale',
    saveChanges: 'Salva modifiche',
    deactivateBranch: 'Disattiva filiale',
    deactivating: 'Disattivazione',
    cancel: 'Annulla',
    saving: 'Salvataggio',
    saved: 'Filiale salvata',
    saveError: 'Impossibile salvare la filiale.',
    updateError: 'Impossibile aggiornare la filiale.',
    deactivateError: 'Impossibile disattivare la filiale.',
  },
  nl: {
    title: 'Locaties en vestigingen',
    description: 'Scheid vestigingen, showrooms en opslaglocaties zodat grotere dealers voorraad kunnen beheren zonder alle voertuigen in één bedrijfsprofiel te mengen.',
    primaryLocation: 'Primaire locatie',
    activeLocation: 'Actieve locatie',
    branch: 'Vestiging',
    showroom: 'Showroom',
    storage: 'Opslag',
    headquarters: 'Hoofdkantoor',
    service: 'Service',
    other: 'Overig',
    noLocationsTitle: 'Nog geen aparte vestigingen',
    noLocationsText: 'Start met het bedrijfsprofiel als hoofdlocatie. Voorraad kan later worden verdeeld over aparte vestigingen.',
    addBranch: 'Vestiging toevoegen',
    comingNext: 'Maak hier vestigingen aan en gebruik dezelfde vestigingsnamen in handmatige advertenties of CSV-imports.',
    routingTitle: 'Waarom dit helpt bij grotere dealers',
    routingText: 'Elke vestiging kan eigen plaats, gemeente, adres en contactgegevens bewaren. Advertenties kunnen dan naar het juiste verkoopteam worden gestuurd en nauwkeuriger worden getoond in filters, kaarten en bedrijfspagina’s.',
    dataTitle: 'Datamodel voor vestigingen',
    dataText: 'De databasebasis ondersteunt hoofdkantoren, vestigingen, showrooms, opslag- en servicelocaties met adres-, geo- en contactvelden.',
    formIntro: 'Voeg één fysieke locatie per keer toe. Gebruik bij groepen met veel locaties dezelfde namen in de CSV-kolom voor vestigingen.',
    name: 'Naam',
    type: 'Type',
    countryCode: 'Landcode',
    region: 'Regio',
    municipality: 'Gemeente',
    city: 'Plaats',
    postalCode: 'Postcode',
    addressLine1: 'Adres',
    contactEmail: 'Contact-e-mail',
    contactPhone: 'Contacttelefoon',
    saveBranch: 'Vestiging opslaan',
    editBranch: 'Vestiging bewerken',
    saveChanges: 'Wijzigingen opslaan',
    deactivateBranch: 'Vestiging deactiveren',
    deactivating: 'Deactiveren',
    cancel: 'Annuleren',
    saving: 'Opslaan',
    saved: 'Vestiging opgeslagen',
    saveError: 'Vestiging kon niet worden opgeslagen.',
    updateError: 'Vestiging kon niet worden bijgewerkt.',
    deactivateError: 'Vestiging kon niet worden gedeactiveerd.',
  },
  fi: {
    title: 'Toimipisteet ja haarat',
    description: 'Erota toimipisteet, näyttelytilat ja varastot, jotta suuremmat myyjät voivat hallita varastoa ilman että kaikki ajoneuvot sekoittuvat yhteen yritysprofiiliin.',
    primaryLocation: 'Ensisijainen sijainti',
    activeLocation: 'Aktiivinen sijainti',
    branch: 'Toimipiste',
    showroom: 'Näyttelytila',
    storage: 'Varasto',
    headquarters: 'Pääkonttori',
    service: 'Huolto',
    other: 'Muu',
    noLocationsTitle: 'Ei vielä erillisiä toimipisteitä',
    noLocationsText: 'Aloita yritysprofiilista pääsijaintina. Varasto voidaan myöhemmin jakaa erillisiin toimipisteisiin.',
    addBranch: 'Lisää toimipiste',
    comingNext: 'Luo toimipisteet täällä ja käytä samoja nimiä manuaalisissa ilmoituksissa tai CSV-tuonneissa.',
    routingTitle: 'Näin tämä auttaa suurempia myyjiä',
    routingText: 'Jokaisella toimipisteellä voi olla oma kaupunki, kunta, osoite ja yhteystiedot. Ilmoitukset voidaan ohjata oikealle myyntitiimille ja näyttää tarkemmin suodattimissa, kartoissa ja yrityssivuilla.',
    dataTitle: 'Toimipisteiden tietomalli',
    dataText: 'Tietokantapohja tukee pääkonttoreita, toimipisteitä, näyttelytiloja, varastoja ja huoltopisteitä osoite-, geo- ja yhteystietokentillä.',
    formIntro: 'Lisää yksi fyysinen paikka kerrallaan. Käytä usean toimipisteen ryhmissä samoja nimiä CSV:n toimipistesarakkeessa.',
    name: 'Nimi',
    type: 'Tyyppi',
    countryCode: 'Maakoodi',
    region: 'Alue',
    municipality: 'Kunta',
    city: 'Kaupunki',
    postalCode: 'Postinumero',
    addressLine1: 'Katuosoite',
    contactEmail: 'Yhteyssähköposti',
    contactPhone: 'Yhteyspuhelin',
    saveBranch: 'Tallenna toimipiste',
    editBranch: 'Muokkaa toimipistettä',
    saveChanges: 'Tallenna muutokset',
    deactivateBranch: 'Poista toimipiste käytöstä',
    deactivating: 'Poistetaan käytöstä',
    cancel: 'Peruuta',
    saving: 'Tallennetaan',
    saved: 'Toimipiste tallennettu',
    saveError: 'Toimipistettä ei voitu tallentaa.',
    updateError: 'Toimipistettä ei voitu päivittää.',
    deactivateError: 'Toimipistettä ei voitu poistaa käytöstä.',
  },
  da: {
    title: 'Lokationer og filialer',
    description: 'Adskil filialer, showrooms og lagersteder, så større forhandlere kan styre lager uden at blande alle køretøjer i én virksomhedsprofil.',
    primaryLocation: 'Primær lokation',
    activeLocation: 'Aktiv lokation',
    branch: 'Filial',
    showroom: 'Showroom',
    storage: 'Lager',
    headquarters: 'Hovedkontor',
    service: 'Service',
    other: 'Andet',
    noLocationsTitle: 'Ingen separate filialer endnu',
    noLocationsText: 'Start med virksomhedsprofilen som hovedlokation. Lager kan senere opdeles på separate filialer.',
    addBranch: 'Tilføj filial',
    comingNext: 'Opret filialer her og brug de samme filialnavne i manuelle annoncer eller CSV-importer.',
    routingTitle: 'Sådan hjælper det større forhandlere',
    routingText: 'Hver filial kan have egen by, kommune, adresse og kontaktoplysninger. Annoncer kan derefter sendes til det rigtige salgsteam og vises mere præcist i filtre, kort og virksomhedssider.',
    dataTitle: 'Datamodel for filialer',
    dataText: 'Databasegrundlaget understøtter hovedkontorer, filialer, showrooms, lagre og servicesteder med adresse-, geo- og kontaktfelter.',
    formIntro: 'Tilføj ét fysisk sted ad gangen. For grupper med mange lokationer bruges de samme navne i CSV-kolonnen for filial.',
    name: 'Navn',
    type: 'Type',
    countryCode: 'Landekode',
    region: 'Region',
    municipality: 'Kommune',
    city: 'By',
    postalCode: 'Postnummer',
    addressLine1: 'Adresse',
    contactEmail: 'Kontaktmail',
    contactPhone: 'Kontakttelefon',
    saveBranch: 'Gem filial',
    editBranch: 'Rediger filial',
    saveChanges: 'Gem ændringer',
    deactivateBranch: 'Deaktiver filial',
    deactivating: 'Deaktiverer',
    cancel: 'Annuller',
    saving: 'Gemmer',
    saved: 'Filial gemt',
    saveError: 'Filialen kunne ikke gemmes.',
    updateError: 'Filialen kunne ikke opdateres.',
    deactivateError: 'Filialen kunne ikke deaktiveres.',
  },
  pl: {
    title: 'Lokalizacje i oddziały',
    description: 'Oddziel oddziały, salony i magazyny, aby większy dealer mógł zarządzać flotą bez mieszania wszystkich pojazdów w jednym profilu firmy.',
    primaryLocation: 'Lokalizacja główna',
    activeLocation: 'Aktywna lokalizacja',
    branch: 'Oddział',
    showroom: 'Salon',
    storage: 'Magazyn',
    headquarters: 'Centrala',
    service: 'Serwis',
    other: 'Inne',
    noLocationsTitle: 'Brak osobnych oddziałów',
    noLocationsText: 'Zacznij od profilu firmy jako głównej lokalizacji. Wraz z rozwojem firmy pojazdy można podzielić między oddziały.',
    addBranch: 'Dodaj oddział',
    comingNext: 'Utwórz oddziały tutaj i używaj tych samych nazw w ręcznych ogłoszeniach lub importach CSV.',
    routingTitle: 'Jak pomaga to większym dealerom',
    routingText: 'Każdy oddział może mieć własne miasto, gminę, adres i dane kontaktowe. Ogłoszenia mogą trafiać do właściwego zespołu sprzedaży i dokładniej pojawiać się w filtrach, mapach oraz stronach firm.',
    dataTitle: 'Model danych oddziałów',
    dataText: 'Baza danych obsługuje centrale, oddziały, salony, magazyny i punkty serwisowe z polami adresu, geolokalizacji i kontaktu.',
    formIntro: 'Dodaj jedną fizyczną lokalizację naraz. Przy wielu lokalizacjach używaj tych samych nazw w kolumnie oddziału w CSV.',
    name: 'Nazwa',
    type: 'Typ',
    countryCode: 'Kod kraju',
    region: 'Region',
    municipality: 'Gmina',
    city: 'Miasto',
    postalCode: 'Kod pocztowy',
    addressLine1: 'Adres',
    contactEmail: 'E-mail kontaktowy',
    contactPhone: 'Telefon kontaktowy',
    saveBranch: 'Zapisz oddział',
    editBranch: 'Edytuj oddział',
    saveChanges: 'Zapisz zmiany',
    deactivateBranch: 'Dezaktywuj oddział',
    deactivating: 'Dezaktywacja',
    cancel: 'Anuluj',
    saving: 'Zapisywanie',
    saved: 'Oddział zapisany',
    saveError: 'Nie udało się zapisać oddziału.',
    updateError: 'Nie udało się zaktualizować oddziału.',
    deactivateError: 'Nie udało się dezaktywować oddziału.',
  },
}

function getLocationsCopy(locale: PublicLocale) {
  return {
    ...translatePublicObject(locale, baseCopy),
    ...(localeCopy[translationLocale(locale)] || {}),
  } as typeof baseCopy
}

export default async function CompanyLocationsPage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const copy = getLocationsCopy(context.locale)
  const admin = createAdminClient()
  const locations = await loadLocations(admin, context.profile.company_id)
  const fallbackLocation = !locations.length
    ? [{
        id: 'company-profile',
        name: context.profile.company_name || 'Autorell',
        location_type: 'headquarters',
        country_code: context.profile.country_code || null,
        region: null,
        municipality: null,
        city: null,
        postal_code: null,
        address_line_1: null,
        contact_email: context.profile.email || null,
        contact_phone: null,
        is_primary: true,
        is_active: true,
      }] satisfies LocationRow[]
    : []
  const visibleLocations = locations.length ? locations : fallbackLocation

  return (
    <CompanyPortalShell context={context} active="locations" title={copy.title} description={copy.description}>
      <section className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
        <div className="min-w-0 rounded-[16px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.title}</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#667085]">{copy.comingNext}</p>
          <div className="mt-5 grid gap-3">
            {visibleLocations.map((location) => (
              <LocationCard key={location.id} location={location} copy={copy} />
            ))}
          </div>
          {!locations.length ? (
            <div className="mt-4 rounded-[14px] border border-dashed border-[#b9cff7] bg-[#f7fbff] p-4">
              <p className="text-sm font-semibold text-[#101828]">{copy.noLocationsTitle}</p>
              <p className="mt-1 text-sm leading-6 text-[#667085]">{copy.noLocationsText}</p>
            </div>
          ) : null}
        </div>

        <aside className="grid min-w-0 gap-4">
          <CompanyLocationForm copy={copy} defaultCountryCode={(context.profile.country_code || 'SE').toUpperCase()} />
          <InfoCard icon={Route} title={copy.routingTitle} text={copy.routingText} />
          <InfoCard icon={Building2} title={copy.dataTitle} text={copy.dataText} />
        </aside>
      </section>
    </CompanyPortalShell>
  )
}

async function loadLocations(admin: ReturnType<typeof createAdminClient>, companyId: string | null): Promise<LocationRow[]> {
  if (!companyId) return []
  try {
    const { data, error } = await admin
      .from('marketplace_company_locations')
      .select('id,name,location_type,country_code,region,municipality,city,postal_code,address_line_1,contact_email,contact_phone,is_primary,is_active')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .order('name', { ascending: true })
      .limit(50)
    if (error || !data) return []
    return data as LocationRow[]
  } catch {
    return []
  }
}

function LocationCard({ location, copy }: { location: LocationRow; copy: typeof baseCopy }) {
  const locationType = location.location_type && location.location_type in copy
    ? copy[location.location_type as keyof typeof baseCopy]
    : copy.branch
  const place = [location.address_line_1, location.postal_code, location.city, location.municipality, location.region, location.country_code]
    .filter(Boolean)
    .join(', ')
  const contact = [location.contact_email, location.contact_phone].filter(Boolean).join(' · ')

  return (
    <article className="rounded-[14px] border border-[#e4ebf5] bg-[#fbfdff] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#eef5ff] text-[#0866ff]">
            <Store className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-[#101828]">{location.name || copy.primaryLocation}</h3>
            <p className="mt-1 text-sm font-medium text-[#667085]">{place || locationType}</p>
            {contact ? <p className="mt-1 truncate text-sm text-[#667085]">{contact}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {location.is_primary ? <Badge label={copy.primaryLocation} icon={CheckCircle2} /> : null}
          <Badge label={String(locationType)} icon={MapPin} />
        </div>
      </div>
      {location.id !== 'company-profile' ? <CompanyLocationActions location={location} copy={copy} /> : null}
    </article>
  )
}

function InfoCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <section className="rounded-[16px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
      <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#eef5ff] text-[#0866ff]">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold tracking-[-.025em] text-[#101828]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#667085]">{text}</p>
    </section>
  )
}

function Badge({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-bold text-[#0866ff]">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}
