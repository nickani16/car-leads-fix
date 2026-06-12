export type SwedishLocalSeoLocation = {
  slug: string
  name: string
  county: string
  areaDescription: string
  nearby: string[]
}

export const swedishLocalSeoLocations: SwedishLocalSeoLocation[] = [
  {
    slug: 'stockholm',
    name: 'Stockholm',
    county: 'Stockholms län',
    areaDescription:
      'Oavsett om bilen finns i innerstaden, Västerort eller Söderort kan du registrera den digitalt och nå professionella köpare utan att boka flera separata värderingar.',
    nearby: ['solna', 'sundbyberg', 'nacka', 'huddinge'],
  },
  {
    slug: 'botkyrka',
    name: 'Botkyrka',
    county: 'Stockholms län',
    areaDescription:
      'För bilar i exempelvis Tumba, Tullinge, Alby och Hallunda börjar försäljningen digitalt med samma tydliga fordonsunderlag för alla handlare.',
    nearby: ['huddinge', 'salem', 'sodertalje', 'stockholm'],
  },
  {
    slug: 'danderyd',
    name: 'Danderyd',
    county: 'Stockholms län',
    areaDescription:
      'Bilägare i Danderyd, Djursholm, Stocksund och Enebyberg kan samla bilens uppgifter på en plats och låta verifierade handlare bedöma samma underlag.',
    nearby: ['taby', 'sollentuna', 'solna', 'lidingo'],
  },
  {
    slug: 'ekero',
    name: 'Ekerö',
    county: 'Stockholms län',
    areaDescription:
      'Från Ekerö, Färingsö, Stenhamra och övriga Mälaröarna kan bilen registreras digitalt innan Autorell granskar underlaget för marknaden.',
    nearby: ['stockholm', 'upplands-bro', 'sodertalje', 'solna'],
  },
  {
    slug: 'haninge',
    name: 'Haninge',
    county: 'Stockholms län',
    areaDescription:
      'I Haninge, Handen, Västerhaninge och Jordbro får bilen ett strukturerat underlag som gör den enklare för flera professionella köpare att bedöma.',
    nearby: ['tyreso', 'nynashamn', 'huddinge', 'stockholm'],
  },
  {
    slug: 'huddinge',
    name: 'Huddinge',
    county: 'Stockholms län',
    areaDescription:
      'För dig i Huddinge, Flemingsberg, Segeltorp eller Trångsund är hela första steget digitalt, från registrering till granskning och eventuell budgivning.',
    nearby: ['stockholm', 'botkyrka', 'haninge', 'tyreso'],
  },
  {
    slug: 'jarfalla',
    name: 'Järfälla',
    county: 'Stockholms län',
    areaDescription:
      'Bilar i Jakobsberg, Barkarby, Viksjö och Kallhäll kan presenteras med ett enhetligt underlag för handlare i Sverige och övriga Europa.',
    nearby: ['upplands-bro', 'sollentuna', 'upplands-vasby', 'stockholm'],
  },
  {
    slug: 'lidingo',
    name: 'Lidingö',
    county: 'Stockholms län',
    areaDescription:
      'På Lidingö kan du registrera bilen hemifrån, komplettera med tydliga bilder och låta Autorell kvalitetsgranska fordonsprofilen före publicering.',
    nearby: ['stockholm', 'danderyd', 'nacka', 'solna'],
  },
  {
    slug: 'nacka',
    name: 'Nacka',
    county: 'Stockholms län',
    areaDescription:
      'Från Nacka, Sickla, Saltsjö-Boo och Älta kan du nå ett bredare handlarnätverk genom en sammanhållen digital försäljningsprocess.',
    nearby: ['stockholm', 'varmdo', 'tyreso', 'lidingo'],
  },
  {
    slug: 'norrtalje',
    name: 'Norrtälje',
    county: 'Stockholms län',
    areaDescription:
      'För bilar i Norrtälje, Rimbo, Hallstavik och Roslagen minskar den digitala processen behovet av att själv kontakta handlare på flera orter.',
    nearby: ['osteraker', 'vallentuna', 'sigtuna', 'uppsala'],
  },
  {
    slug: 'nykvarn',
    name: 'Nykvarn',
    county: 'Stockholms län',
    areaDescription:
      'I Nykvarn registrerar du bilen på några minuter och får ett gemensamt, granskat fordonsunderlag som kan nå köpare även utanför närområdet.',
    nearby: ['sodertalje', 'salem', 'botkyrka', 'stockholm'],
  },
  {
    slug: 'nynashamn',
    name: 'Nynäshamn',
    county: 'Stockholms län',
    areaDescription:
      'Bilar i Nynäshamn, Ösmo och Sorunda kan nå professionella köpare digitalt utan att geografiskt avstånd begränsar den första marknadsbedömningen.',
    nearby: ['haninge', 'tyreso', 'huddinge', 'stockholm'],
  },
  {
    slug: 'salem',
    name: 'Salem',
    county: 'Stockholms län',
    areaDescription:
      'Från Salem och Rönninge kan du skapa en komplett fordonsprofil och låta flera verifierade handlare ta ställning till samma information.',
    nearby: ['botkyrka', 'sodertalje', 'huddinge', 'nykvarn'],
  },
  {
    slug: 'sigtuna',
    name: 'Sigtuna',
    county: 'Stockholms län',
    areaDescription:
      'För bilar i Märsta, Sigtuna och Rosersberg ger Autorell ett digitalt flöde från fordonsuppgifter till granskad publicering och bud.',
    nearby: ['upplands-vasby', 'vallentuna', 'uppsala', 'sollentuna'],
  },
  {
    slug: 'sollentuna',
    name: 'Sollentuna',
    county: 'Stockholms län',
    areaDescription:
      'I Sollentuna, Häggvik, Edsberg och Rotebro kan du samla all relevant bilinformation i ett flöde och nå fler professionella köpare.',
    nearby: ['upplands-vasby', 'jarfalla', 'taby', 'solna'],
  },
  {
    slug: 'solna',
    name: 'Solna',
    county: 'Stockholms län',
    areaDescription:
      'Bilägare i Solna, Hagalund, Råsunda och Järva kan registrera bilen digitalt och följa granskning, marknadsaktivitet och bud på samma plats.',
    nearby: ['stockholm', 'sundbyberg', 'sollentuna', 'danderyd'],
  },
  {
    slug: 'sundbyberg',
    name: 'Sundbyberg',
    county: 'Stockholms län',
    areaDescription:
      'I Sundbyberg, Hallonbergen, Ursvik och Rissne får du en tydlig digital väg till professionella handlare utan att boka rundor mellan bilfirmor.',
    nearby: ['solna', 'stockholm', 'jarfalla', 'sollentuna'],
  },
  {
    slug: 'sodertalje',
    name: 'Södertälje',
    county: 'Stockholms län',
    areaDescription:
      'För bilar i Södertälje, Järna, Hölö och Enhörna skapar Autorell en strukturerad fordonsprofil som kan bedömas av ett bredare köparnätverk.',
    nearby: ['nykvarn', 'salem', 'botkyrka', 'stockholm'],
  },
  {
    slug: 'tyreso',
    name: 'Tyresö',
    county: 'Stockholms län',
    areaDescription:
      'Från Tyresö, Trollbäcken och Brevik kan du registrera bilen kostnadsfritt och låta relevanta handlare bedöma den på ett jämförbart underlag.',
    nearby: ['haninge', 'nacka', 'huddinge', 'stockholm'],
  },
  {
    slug: 'taby',
    name: 'Täby',
    county: 'Stockholms län',
    areaDescription:
      'I Täby, Arninge, Näsbypark och Gribbylund kan nyare bilar presenteras effektivt för professionella köpare i Sverige och Europa.',
    nearby: ['danderyd', 'vallentuna', 'osteraker', 'sollentuna'],
  },
  {
    slug: 'upplands-bro',
    name: 'Upplands-Bro',
    county: 'Stockholms län',
    areaDescription:
      'För bilar i Kungsängen, Bro och Brunna börjar processen digitalt och ger möjlighet att nå handlare långt utanför den lokala marknaden.',
    nearby: ['jarfalla', 'upplands-vasby', 'ekero', 'sigtuna'],
  },
  {
    slug: 'upplands-vasby',
    name: 'Upplands Väsby',
    county: 'Stockholms län',
    areaDescription:
      'I Upplands Väsby kan du fylla i bilens skick, historik och utrustning en gång och låta Autorell förbereda profilen för verifierade köpare.',
    nearby: ['sollentuna', 'sigtuna', 'vallentuna', 'jarfalla'],
  },
  {
    slug: 'vallentuna',
    name: 'Vallentuna',
    county: 'Stockholms län',
    areaDescription:
      'Från Vallentuna, Lindholmen och Karby kan bilens underlag granskas digitalt och sedan nå professionella handlare på flera marknader.',
    nearby: ['taby', 'osteraker', 'sigtuna', 'upplands-vasby'],
  },
  {
    slug: 'vaxholm',
    name: 'Vaxholm',
    county: 'Stockholms län',
    areaDescription:
      'I Vaxholm och skärgårdens närliggande områden gör den digitala registreringen det enklare att nå köpare utan onödiga resor i första steget.',
    nearby: ['osteraker', 'varmdo', 'taby', 'nacka'],
  },
  {
    slug: 'varmdo',
    name: 'Värmdö',
    county: 'Stockholms län',
    areaDescription:
      'För bilar i Gustavsberg, Hemmesta, Ingarö och övriga Värmdö kan hela fordonsprofilen förberedas och granskas digitalt.',
    nearby: ['nacka', 'vaxholm', 'tyreso', 'stockholm'],
  },
  {
    slug: 'osteraker',
    name: 'Österåker',
    county: 'Stockholms län',
    areaDescription:
      'I Åkersberga och övriga Österåker kan du nå fler handlare med ett komplett fordonsunderlag, tydliga bilder och en samlad budprocess.',
    nearby: ['vallentuna', 'taby', 'vaxholm', 'norrtalje'],
  },
  {
    slug: 'uppsala',
    name: 'Uppsala',
    county: 'Uppsala län',
    areaDescription:
      'För bilar i Uppsala med omnejd ger Autorell en digital väg till verifierade professionella köpare i både Sverige och övriga Europa.',
    nearby: ['sigtuna', 'norrtalje', 'upplands-vasby', 'stockholm'],
  },
  {
    slug: 'goteborg',
    name: 'Göteborg',
    county: 'Västra Götalands län',
    areaDescription:
      'I Göteborg kan du registrera bilen digitalt och låta professionella köpare bedöma ett granskat underlag, oavsett var deras verksamhet finns.',
    nearby: ['malmo', 'stockholm', 'uppsala'],
  },
  {
    slug: 'malmo',
    name: 'Malmö',
    county: 'Skåne län',
    areaDescription:
      'För bilägare i Malmö ger närheten till den europeiska marknaden goda förutsättningar att låta fler professionella handlare bedöma bilen.',
    nearby: ['goteborg', 'stockholm', 'uppsala'],
  },
]

const locationsBySlug = new Map(
  swedishLocalSeoLocations.map((location) => [location.slug, location])
)

export function getSwedishLocalSeoLocation(slug: string) {
  return locationsBySlug.get(slug)
}

export function getNearbySwedishLocations(location: SwedishLocalSeoLocation) {
  return location.nearby
    .map((slug) => locationsBySlug.get(slug))
    .filter((item): item is SwedishLocalSeoLocation => Boolean(item))
}

