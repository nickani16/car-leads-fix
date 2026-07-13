import { getEuCountryName } from './eu-countries'

export type MarketplaceLocationCountryCode =
  | 'DE'
  | 'FR'
  | 'IT'
  | 'ES'
  | 'NL'
  | 'BE'
  | 'SE'
  | 'PL'
  | 'AT'
  | 'DK'
  | 'FI'

export type MarketplaceRegion = {
  name: string
  municipalities: readonly string[]
  localities?: readonly string[]
}

export type MarketplaceCountryLocations = {
  countryCode: MarketplaceLocationCountryCode
  regionLabel: string
  municipalityLabel: string
  allLabel: string
  regions: readonly MarketplaceRegion[]
}

export type MarketplaceLocationEntry = {
  country: MarketplaceLocationCountryCode
  region: string
  municipality?: string
  city?: string
  kind: 'region' | 'municipality'
}

export const marketplaceLocations = [
  {
    countryCode: 'DE',
    regionLabel: 'Bundesland',
    municipalityLabel: 'Stad / Landkreis',
    allLabel: 'Hela Tyskland',
    regions: [
      { name: 'Baden-Wurttemberg', municipalities: ['Stuttgart', 'Karlsruhe', 'Mannheim', 'Freiburg im Breisgau', 'Heilbronn', 'Ulm', 'Reutlingen'] },
      { name: 'Bayern', municipalities: ['Munchen', 'Nurnberg', 'Augsburg', 'Regensburg', 'Ingolstadt', 'Wurzburg', 'Erlangen'] },
      { name: 'Berlin', municipalities: ['Berlin'] },
      { name: 'Brandenburg', municipalities: ['Potsdam', 'Cottbus', 'Brandenburg an der Havel', 'Frankfurt (Oder)'] },
      { name: 'Bremen', municipalities: ['Bremen', 'Bremerhaven'] },
      { name: 'Hamburg', municipalities: ['Hamburg'] },
      { name: 'Hessen', municipalities: ['Frankfurt am Main', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach am Main', 'Hanau'] },
      { name: 'Mecklenburg-Vorpommern', municipalities: ['Rostock', 'Schwerin', 'Neubrandenburg', 'Stralsund'] },
      { name: 'Niedersachsen', municipalities: ['Hannover', 'Braunschweig', 'Oldenburg', 'Osnabruck', 'Wolfsburg', 'Gottingen'] },
      { name: 'Nordrhein-Westfalen', municipalities: ['Koln', 'Dusseldorf', 'Dortmund', 'Essen', 'Duisburg', 'Bochum', 'Bonn', 'Munster'] },
      { name: 'Rheinland-Pfalz', municipalities: ['Mainz', 'Ludwigshafen am Rhein', 'Koblenz', 'Trier', 'Kaiserslautern'] },
      { name: 'Saarland', municipalities: ['Saarbrucken', 'Neunkirchen', 'Homburg'] },
      { name: 'Sachsen', municipalities: ['Leipzig', 'Dresden', 'Chemnitz', 'Zwickau'] },
      { name: 'Sachsen-Anhalt', municipalities: ['Halle (Saale)', 'Magdeburg', 'Dessau-Rosslau'] },
      { name: 'Schleswig-Holstein', municipalities: ['Kiel', 'Lubeck', 'Flensburg', 'Neumunster'] },
      { name: 'Thuringen', municipalities: ['Erfurt', 'Jena', 'Gera', 'Weimar'] },
    ],
  },
  {
    countryCode: 'FR',
    regionLabel: 'Region',
    municipalityLabel: 'Kommun / stad',
    allLabel: 'Hela Frankrike',
    regions: [
      { name: 'Auvergne-Rhone-Alpes', municipalities: ['Lyon', 'Grenoble', 'Saint-Etienne', 'Clermont-Ferrand', 'Villeurbanne'] },
      { name: 'Bourgogne-Franche-Comte', municipalities: ['Dijon', 'Besancon', 'Belfort', 'Chalon-sur-Saone'] },
      { name: 'Bretagne', municipalities: ['Rennes', 'Brest', 'Quimper', 'Lorient', 'Vannes'] },
      { name: 'Centre-Val de Loire', municipalities: ['Tours', 'Orleans', 'Bourges', 'Blois'] },
      { name: 'Corse', municipalities: ['Ajaccio', 'Bastia'] },
      { name: 'Grand Est', municipalities: ['Strasbourg', 'Reims', 'Metz', 'Mulhouse', 'Nancy'] },
      { name: 'Hauts-de-France', municipalities: ['Lille', 'Amiens', 'Roubaix', 'Tourcoing', 'Dunkerque'] },
      { name: 'Ile-de-France', municipalities: ['Paris', 'Boulogne-Billancourt', 'Saint-Denis', 'Versailles', 'Nanterre', 'Creteil'] },
      { name: 'Normandie', municipalities: ['Rouen', 'Caen', 'Le Havre', 'Cherbourg-en-Cotentin'] },
      { name: 'Nouvelle-Aquitaine', municipalities: ['Bordeaux', 'Limoges', 'Poitiers', 'Pau', 'La Rochelle'] },
      { name: 'Occitanie', municipalities: ['Toulouse', 'Montpellier', 'Nimes', 'Perpignan', 'Beziers'] },
      { name: 'Pays de la Loire', municipalities: ['Nantes', 'Angers', 'Le Mans', 'Saint-Nazaire'] },
      { name: 'Provence-Alpes-Cote d Azur', municipalities: ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Avignon'] },
    ],
  },
  {
    countryCode: 'IT',
    regionLabel: 'Region',
    municipalityLabel: 'Kommun / stad',
    allLabel: 'Hela Italien',
    regions: [
      { name: 'Abruzzo', municipalities: ['Pescara', 'L Aquila', 'Chieti', 'Teramo'] },
      { name: 'Basilicata', municipalities: ['Potenza', 'Matera'] },
      { name: 'Calabria', municipalities: ['Reggio Calabria', 'Catanzaro', 'Cosenza'] },
      { name: 'Campania', municipalities: ['Napoli', 'Salerno', 'Caserta', 'Benevento'] },
      { name: 'Emilia-Romagna', municipalities: ['Bologna', 'Parma', 'Modena', 'Reggio Emilia', 'Rimini'] },
      { name: 'Friuli-Venezia Giulia', municipalities: ['Trieste', 'Udine', 'Pordenone'] },
      { name: 'Lazio', municipalities: ['Roma', 'Latina', 'Frosinone', 'Viterbo'] },
      { name: 'Liguria', municipalities: ['Genova', 'La Spezia', 'Savona', 'Imperia'] },
      { name: 'Lombardia', municipalities: ['Milano', 'Brescia', 'Monza', 'Bergamo', 'Como', 'Varese'] },
      { name: 'Marche', municipalities: ['Ancona', 'Pesaro', 'Macerata'] },
      { name: 'Molise', municipalities: ['Campobasso', 'Termoli'] },
      { name: 'Piemonte', municipalities: ['Torino', 'Novara', 'Alessandria', 'Asti'] },
      { name: 'Puglia', municipalities: ['Bari', 'Taranto', 'Foggia', 'Lecce', 'Brindisi'] },
      { name: 'Sardegna', municipalities: ['Cagliari', 'Sassari', 'Olbia'] },
      { name: 'Sicilia', municipalities: ['Palermo', 'Catania', 'Messina', 'Siracusa', 'Trapani'] },
      { name: 'Toscana', municipalities: ['Firenze', 'Prato', 'Livorno', 'Pisa', 'Siena'] },
      { name: 'Trentino-Alto Adige', municipalities: ['Trento', 'Bolzano'] },
      { name: 'Umbria', municipalities: ['Perugia', 'Terni'] },
      { name: 'Valle d Aosta', municipalities: ['Aosta'] },
      { name: 'Veneto', municipalities: ['Venezia', 'Verona', 'Padova', 'Vicenza', 'Treviso'] },
    ],
  },
  {
    countryCode: 'ES',
    regionLabel: 'Region',
    municipalityLabel: 'Kommun / stad',
    allLabel: 'Hela Spanien',
    regions: [
      { name: 'Andalucia', municipalities: ['Sevilla', 'Malaga', 'Cordoba', 'Granada', 'Cadiz', 'Almeria'] },
      { name: 'Aragon', municipalities: ['Zaragoza', 'Huesca', 'Teruel'] },
      { name: 'Asturias', municipalities: ['Oviedo', 'Gijon', 'Aviles'] },
      { name: 'Illes Balears', municipalities: ['Palma', 'Ibiza', 'Manacor'] },
      { name: 'Canarias', municipalities: ['Las Palmas de Gran Canaria', 'Santa Cruz de Tenerife', 'La Laguna'] },
      { name: 'Cantabria', municipalities: ['Santander', 'Torrelavega'] },
      { name: 'Castilla-La Mancha', municipalities: ['Toledo', 'Albacete', 'Ciudad Real', 'Guadalajara'] },
      { name: 'Castilla y Leon', municipalities: ['Valladolid', 'Leon', 'Burgos', 'Salamanca'] },
      { name: 'Catalunya', municipalities: ['Barcelona', 'L Hospitalet de Llobregat', 'Badalona', 'Terrassa', 'Sabadell', 'Tarragona'] },
      { name: 'Comunidad de Madrid', municipalities: ['Madrid', 'Alcala de Henares', 'Mostoles', 'Leganes', 'Getafe'] },
      { name: 'Comunitat Valenciana', municipalities: ['Valencia', 'Alicante', 'Elche', 'Castellon de la Plana'] },
      { name: 'Extremadura', municipalities: ['Badajoz', 'Caceres', 'Merida'] },
      { name: 'Galicia', municipalities: ['A Coruna', 'Vigo', 'Santiago de Compostela', 'Ourense'] },
      { name: 'La Rioja', municipalities: ['Logrono'] },
      { name: 'Murcia', municipalities: ['Murcia', 'Cartagena', 'Lorca'] },
      { name: 'Navarra', municipalities: ['Pamplona', 'Tudela'] },
      { name: 'Pais Vasco', municipalities: ['Bilbao', 'Vitoria-Gasteiz', 'Donostia-San Sebastian'] },
    ],
  },
  {
    countryCode: 'NL',
    regionLabel: 'Provins',
    municipalityLabel: 'Kommun / stad',
    allLabel: 'Hela Nederländerna',
    regions: [
      { name: 'Drenthe', municipalities: ['Assen', 'Emmen', 'Hoogeveen'] },
      { name: 'Flevoland', municipalities: ['Almere', 'Lelystad'] },
      { name: 'Friesland', municipalities: ['Leeuwarden', 'Heerenveen', 'Sneek'] },
      { name: 'Gelderland', municipalities: ['Arnhem', 'Nijmegen', 'Apeldoorn', 'Ede'] },
      { name: 'Groningen', municipalities: ['Groningen', 'Delfzijl'] },
      { name: 'Limburg', municipalities: ['Maastricht', 'Venlo', 'Sittard-Geleen'] },
      { name: 'Noord-Brabant', municipalities: ['Eindhoven', 'Tilburg', 'Breda', 's-Hertogenbosch'] },
      { name: 'Noord-Holland', municipalities: ['Amsterdam', 'Haarlem', 'Alkmaar', 'Hilversum'] },
      { name: 'Overijssel', municipalities: ['Zwolle', 'Enschede', 'Deventer', 'Almelo'] },
      { name: 'Utrecht', municipalities: ['Utrecht', 'Amersfoort', 'Zeist'] },
      { name: 'Zeeland', municipalities: ['Middelburg', 'Vlissingen', 'Goes'] },
      { name: 'Zuid-Holland', municipalities: ['Rotterdam', 'Den Haag', 'Leiden', 'Dordrecht', 'Delft'] },
    ],
  },
  {
    countryCode: 'BE',
    regionLabel: 'Region',
    municipalityLabel: 'Kommun / stad',
    allLabel: 'Hela Belgien',
    regions: [
      { name: 'Brussels Hoofdstedelijk Gewest', municipalities: ['Brussel', 'Anderlecht', 'Schaarbeek', 'Elsene'] },
      { name: 'Vlaams Gewest', municipalities: ['Antwerpen', 'Gent', 'Brugge', 'Leuven', 'Mechelen', 'Hasselt', 'Kortrijk'] },
      { name: 'Waals Gewest', municipalities: ['Charleroi', 'Liege', 'Namur', 'Mons', 'Tournai', 'La Louviere'] },
    ],
  },
  {
    countryCode: 'SE',
    regionLabel: 'Län',
    municipalityLabel: 'Kommun',
    allLabel: 'Hela Sverige',
    regions: [
      { name: 'Blekinge', municipalities: ['Karlshamn', 'Karlskrona', 'Olofström', 'Ronneby', 'Sölvesborg'] },
      { name: 'Dalarna', municipalities: ['Avesta', 'Borlänge', 'Falun', 'Gagnef', 'Hedemora', 'Leksand', 'Ludvika', 'Malung-Sälen', 'Mora', 'Orsa', 'Rättvik', 'Smedjebacken', 'Säter', 'Vansbro', 'Älvdalen'] },
      { name: 'Gotland', municipalities: ['Gotland'] },
      { name: 'Gävleborg', municipalities: ['Bollnäs', 'Gävle', 'Hofors', 'Hudiksvall', 'Ljusdal', 'Nordanstig', 'Ockelbo', 'Ovanåker', 'Sandviken', 'Söderhamn'] },
      { name: 'Halland', municipalities: ['Falkenberg', 'Halmstad', 'Hylte', 'Kungsbacka', 'Laholm', 'Varberg'] },
      { name: 'Jämtland', municipalities: ['Berg', 'Bräcke', 'Härjedalen', 'Krokom', 'Ragunda', 'Strömsund', 'Åre', 'Östersund'] },
      { name: 'Jönköping', municipalities: ['Aneby', 'Eksjö', 'Gislaved', 'Gnosjö', 'Habo', 'Jönköping', 'Mullsjö', 'Nässjö', 'Sävsjö', 'Tranås', 'Vaggeryd', 'Vetlanda', 'Värnamo'] },
      { name: 'Kalmar', municipalities: ['Borgholm', 'Emmaboda', 'Hultsfred', 'Högsby', 'Kalmar', 'Mönsterås', 'Mörbylånga', 'Nybro', 'Oskarshamn', 'Torsås', 'Vimmerby', 'Västervik'] },
      { name: 'Kronoberg', municipalities: ['Alvesta', 'Lessebo', 'Ljungby', 'Markaryd', 'Tingsryd', 'Uppvidinge', 'Växjö', 'Älmhult'] },
      { name: 'Norrbotten', municipalities: ['Arjeplog', 'Arvidsjaur', 'Boden', 'Gällivare', 'Haparanda', 'Jokkmokk', 'Kalix', 'Kiruna', 'Luleå', 'Pajala', 'Piteå', 'Älvsbyn', 'Överkalix', 'Övertorneå'] },
      { name: 'Skåne', municipalities: ['Bjuv', 'Bromölla', 'Burlöv', 'Båstad', 'Eslöv', 'Helsingborg', 'Hässleholm', 'Höganäs', 'Hörby', 'Höör', 'Klippan', 'Kristianstad', 'Kävlinge', 'Landskrona', 'Lomma', 'Lund', 'Malmö', 'Osby', 'Perstorp', 'Simrishamn', 'Sjöbo', 'Skurup', 'Staffanstorp', 'Svalöv', 'Svedala', 'Tomelilla', 'Trelleborg', 'Vellinge', 'Ystad', 'Åstorp', 'Ängelholm', 'Örkelljunga', 'Östra Göinge'] },
      { name: 'Stockholm', municipalities: ['Botkyrka', 'Danderyd', 'Ekerö', 'Haninge', 'Huddinge', 'Järfälla', 'Lidingö', 'Nacka', 'Norrtälje', 'Nykvarn', 'Nynäshamn', 'Salem', 'Sigtuna', 'Sollentuna', 'Solna', 'Stockholm', 'Sundbyberg', 'Södertälje', 'Tyresö', 'Täby', 'Upplands Väsby', 'Upplands-Bro', 'Vallentuna', 'Vaxholm', 'Värmdö', 'Österåker'] },
      { name: 'Södermanland', municipalities: ['Eskilstuna', 'Flen', 'Gnesta', 'Katrineholm', 'Nyköping', 'Oxelösund', 'Strängnäs', 'Trosa', 'Vingåker'] },
      { name: 'Uppsala', municipalities: ['Enköping', 'Heby', 'Håbo', 'Knivsta', 'Tierp', 'Uppsala', 'Älvkarleby', 'Östhammar'] },
      { name: 'Värmland', municipalities: ['Arvika', 'Eda', 'Filipstad', 'Forshaga', 'Grums', 'Hagfors', 'Hammarö', 'Karlstad', 'Kil', 'Kristinehamn', 'Munkfors', 'Storfors', 'Sunne', 'Säffle', 'Torsby', 'Årjäng'] },
      { name: 'Västerbotten', municipalities: ['Bjurholm', 'Dorotea', 'Lycksele', 'Malå', 'Nordmaling', 'Norsjö', 'Robertsfors', 'Skellefteå', 'Sorsele', 'Storuman', 'Umeå', 'Vilhelmina', 'Vindeln', 'Vännäs', 'Åsele'] },
      { name: 'Västernorrland', municipalities: ['Härnösand', 'Kramfors', 'Sollefteå', 'Sundsvall', 'Timrå', 'Ånge', 'Örnsköldsvik'] },
      { name: 'Västmanland', municipalities: ['Arboga', 'Fagersta', 'Hallstahammar', 'Kungsör', 'Köping', 'Norberg', 'Sala', 'Skinnskatteberg', 'Surahammar', 'Västerås'] },
      { name: 'Västra Götaland', municipalities: ['Ale', 'Alingsås', 'Bengtsfors', 'Bollebygd', 'Borås', 'Dals-Ed', 'Essunga', 'Falköping', 'Färgelanda', 'Grästorp', 'Gullspång', 'Göteborg', 'Götene', 'Herrljunga', 'Hjo', 'Karlsborg', 'Kungälv', 'Lerum', 'Lidköping', 'Lilla Edet', 'Lysekil', 'Mariestad', 'Mark', 'Mellerud', 'Munkedal', 'Mölndal', 'Orust', 'Partille', 'Skara', 'Skövde', 'Sotenäs', 'Stenungsund', 'Strömstad', 'Svenljunga', 'Tanum', 'Tibro', 'Tidaholm', 'Tjörn', 'Tranemo', 'Trollhättan', 'Töreboda', 'Uddevalla', 'Ulricehamn', 'Vara', 'Vårgårda', 'Vänersborg', 'Åmål', 'Öckerö'] },
      { name: 'Örebro', municipalities: ['Askersund', 'Degerfors', 'Hallsberg', 'Hällefors', 'Karlskoga', 'Kumla', 'Laxå', 'Lekeberg', 'Lindesberg', 'Ljusnarsberg', 'Nora', 'Örebro'] },
      { name: 'Östergötland', municipalities: ['Boxholm', 'Finspång', 'Kinda', 'Linköping', 'Mjölby', 'Motala', 'Norrköping', 'Söderköping', 'Vadstena', 'Valdemarsvik', 'Ydre', 'Åtvidaberg', 'Ödeshög'] },
    ],
  },
  {
    countryCode: 'PL',
    regionLabel: 'Wojewodztwo',
    municipalityLabel: 'Kommun / stad',
    allLabel: 'Hela Polen',
    regions: [
      { name: 'Dolnoslaskie', municipalities: ['Wroclaw', 'Walbrzych', 'Legnica', 'Jelenia Gora'] },
      { name: 'Kujawsko-Pomorskie', municipalities: ['Bydgoszcz', 'Torun', 'Wloclawek', 'Grudziadz'] },
      { name: 'Lubelskie', municipalities: ['Lublin', 'Chelm', 'Zamosc'] },
      { name: 'Lubuskie', municipalities: ['Zielona Gora', 'Gorzow Wielkopolski'] },
      { name: 'Lodzkie', municipalities: ['Lodz', 'Piotrkow Trybunalski', 'Pabianice'] },
      { name: 'Malopolskie', municipalities: ['Krakow', 'Tarnow', 'Nowy Sacz'] },
      { name: 'Mazowieckie', municipalities: ['Warszawa', 'Radom', 'Plock', 'Siedlce'] },
      { name: 'Opolskie', municipalities: ['Opole', 'Kedzierzyn-Kozle', 'Nysa'] },
      { name: 'Podkarpackie', municipalities: ['Rzeszow', 'Przemysl', 'Mielec'] },
      { name: 'Podlaskie', municipalities: ['Bialystok', 'Suwalki', 'Lomza'] },
      { name: 'Pomorskie', municipalities: ['Gdansk', 'Gdynia', 'Sopot', 'Slupsk'] },
      { name: 'Slaskie', municipalities: ['Katowice', 'Czestochowa', 'Sosnowiec', 'Gliwice', 'Zabrze'] },
      { name: 'Swietokrzyskie', municipalities: ['Kielce', 'Ostrowiec Swietokrzyski'] },
      { name: 'Warminsko-Mazurskie', municipalities: ['Olsztyn', 'Elblag', 'Elk'] },
      { name: 'Wielkopolskie', municipalities: ['Poznan', 'Kalisz', 'Konin', 'Pila'] },
      { name: 'Zachodniopomorskie', municipalities: ['Szczecin', 'Koszalin', 'Swinoujscie'] },
    ],
  },
  {
    countryCode: 'AT',
    regionLabel: 'Bundesland',
    municipalityLabel: 'Kommun / stad',
    allLabel: 'Hela Österrike',
    regions: [
      { name: 'Burgenland', municipalities: ['Eisenstadt', 'Oberwart'] },
      { name: 'Karnten', municipalities: ['Klagenfurt am Worthersee', 'Villach'] },
      { name: 'Niederosterreich', municipalities: ['Sankt Polten', 'Wiener Neustadt', 'Krems an der Donau'] },
      { name: 'Oberosterreich', municipalities: ['Linz', 'Wels', 'Steyr'] },
      { name: 'Salzburg', municipalities: ['Salzburg', 'Hallein'] },
      { name: 'Steiermark', municipalities: ['Graz', 'Leoben', 'Kapfenberg'] },
      { name: 'Tirol', municipalities: ['Innsbruck', 'Kufstein', 'Worgl'] },
      { name: 'Vorarlberg', municipalities: ['Dornbirn', 'Feldkirch', 'Bregenz'] },
      { name: 'Wien', municipalities: ['Wien'] },
    ],
  },
  {
    countryCode: 'DK',
    regionLabel: 'Region',
    municipalityLabel: 'Kommun',
    allLabel: 'Hela Danmark',
    regions: [
      { name: 'Hovedstaden', municipalities: ['Kobenhavn', 'Frederiksberg', 'Gentofte', 'Hillerod', 'Bornholm'] },
      { name: 'Midtjylland', municipalities: ['Aarhus', 'Herning', 'Randers', 'Silkeborg', 'Viborg'] },
      { name: 'Nordjylland', municipalities: ['Aalborg', 'Hjorring', 'Frederikshavn', 'Thisted'] },
      { name: 'Sjaelland', municipalities: ['Roskilde', 'Koge', 'Naestved', 'Slagelse', 'Holbaek'] },
      { name: 'Syddanmark', municipalities: ['Odense', 'Esbjerg', 'Kolding', 'Vejle', 'Sonderborg'] },
    ],
  },
  {
    countryCode: 'FI',
    regionLabel: 'Landskap',
    municipalityLabel: 'Kommun / stad',
    allLabel: 'Hela Finland',
    regions: [
      { name: 'Etela-Karjala', municipalities: ['Lappeenranta', 'Imatra'] },
      { name: 'Etela-Pohjanmaa', municipalities: ['Seinajoki', 'Kauhava'] },
      { name: 'Etela-Savo', municipalities: ['Mikkeli', 'Savonlinna'] },
      { name: 'Kainuu', municipalities: ['Kajaani'] },
      { name: 'Kanta-Hame', municipalities: ['Hameenlinna', 'Riihimaki'] },
      { name: 'Keski-Pohjanmaa', municipalities: ['Kokkola'] },
      { name: 'Keski-Suomi', municipalities: ['Jyvaskyla', 'Jamsa'] },
      { name: 'Kymenlaakso', municipalities: ['Kotka', 'Kouvola'] },
      { name: 'Lappi', municipalities: ['Rovaniemi', 'Kemi', 'Tornio'] },
      { name: 'Paijat-Hame', municipalities: ['Lahti', 'Heinola'] },
      { name: 'Pirkanmaa', municipalities: ['Tampere', 'Nokia', 'Ylojarvi'] },
      { name: 'Pohjanmaa', municipalities: ['Vaasa', 'Pietarsaari'] },
      { name: 'Pohjois-Karjala', municipalities: ['Joensuu'] },
      { name: 'Pohjois-Pohjanmaa', municipalities: ['Oulu', 'Raahe'] },
      { name: 'Pohjois-Savo', municipalities: ['Kuopio', 'Iisalmi'] },
      { name: 'Satakunta', municipalities: ['Pori', 'Rauma'] },
      { name: 'Uusimaa', municipalities: ['Helsinki', 'Espoo', 'Vantaa', 'Porvoo', 'Lohja'] },
      { name: 'Varsinais-Suomi', municipalities: ['Turku', 'Salo', 'Kaarina'] },
    ],
  },
] as const satisfies readonly MarketplaceCountryLocations[]

export const swedishCounties = getMarketplaceCountryLocations('SE').regions
export const swedishMunicipalities = swedishCounties.flatMap((county) => county.municipalities)

export function getMarketplaceCountryLocations(countryCode: string) {
  const normalized = countryCode.toUpperCase()
  return marketplaceLocations.find((item) => item.countryCode === normalized) || marketplaceLocations[0]
}

export function normalizeLocationName(value: string) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('sv-SE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeSwedishLocationName(value: string) {
  return normalizeLocationName(value)
}

export function inferMarketplaceLocation({
  countryCode,
  region,
  municipality,
  city,
}: {
  countryCode?: string | null
  region?: string | null
  municipality?: string | null
  city?: string | null
}) {
  const market = getMarketplaceCountryLocations(countryCode || 'SE')
  const candidates = [municipality, city, ...splitLocationParts(municipality), ...splitLocationParts(city)]
  const regionByMunicipality = new Map(
    market.regions.flatMap((item) =>
      item.municipalities.map((name) => [normalizeLocationName(name), item.name] as const),
    ),
  )
  const municipalityByNormalized = new Map(
    market.regions.flatMap((item) =>
      item.municipalities.map((name) => [normalizeLocationName(name), name] as const),
    ),
  )
  for (const candidate of candidates) {
    const key = normalizeLocationName(candidate || '')
    const matchedMunicipality = municipalityByNormalized.get(key)
    if (matchedMunicipality) {
      return {
        region: regionByMunicipality.get(key) || '',
        municipality: matchedMunicipality,
      }
    }
  }

  const explicitRegion = market.regions.find((item) => normalizeLocationName(item.name) === normalizeLocationName(region || ''))
  return {
    region: explicitRegion?.name || region || '',
    municipality: municipality || '',
  }
}

export function marketplaceMunicipalitySearchTerms(countryCode: string, municipality: string) {
  const market = getMarketplaceCountryLocations(countryCode || 'SE')
  const key = normalizeLocationName(municipality)
  const match = market.regions.flatMap((region) => region.municipalities).find((name) => normalizeLocationName(name) === key)
  return match ? [match] : []
}

export function marketplaceRegionMunicipalitySearchTerms(countryCode: string, region: string) {
  const market = getMarketplaceCountryLocations(countryCode || 'SE')
  const regionKey = normalizeLocationQuery(region)
  const match = market.regions.find((item) => {
    const key = normalizeLocationQuery(item.name)
    return key === regionKey || key.replace(/s$/, '') === regionKey.replace(/s$/, '')
  })
  return match ? [...match.municipalities] : []
}

export function marketplaceLocationEntries(): MarketplaceLocationEntry[] {
  return marketplaceLocations.flatMap((country) =>
    country.regions.flatMap((region) =>
      region.municipalities.map((municipality) => ({
        country: country.countryCode,
        region: region.name,
        municipality,
        city: municipality,
        kind: 'municipality' as const,
      })),
    ),
  )
}

export function marketplaceRegionEntries(): MarketplaceLocationEntry[] {
  return marketplaceLocations.flatMap((country) =>
    country.regions.map((region) => ({
      country: country.countryCode,
      region: region.name,
      city: region.name,
      kind: 'region' as const,
    })),
  )
}

export function marketplaceSearchLocationTermsForQuery(query: string, countryCodes: string[] = []) {
  const queryKey = normalizeLocationQuery(query)
  if (queryKey.length < 2) {
    return {
      regions: [] as string[],
      municipalities: [] as string[],
    }
  }

  const markets = locationSearchMarkets(countryCodes)
  const regions = new Set<string>()
  const municipalities = new Set<string>()

  for (const market of markets) {
    for (const region of market.regions) {
      const regionKey = normalizeLocationQuery(region.name)
      const regionMatched = locationKeyMatches(regionKey, queryKey)
      if (regionMatched) regions.add(region.name)

      for (const municipality of region.municipalities) {
        const municipalityKey = normalizeLocationQuery(municipality)
        const municipalityMatched = locationKeyMatches(municipalityKey, queryKey)
        if (regionMatched || municipalityMatched) municipalities.add(municipality)
      }
    }
  }

  return {
    regions: [...regions],
    municipalities: [...municipalities],
  }
}

export function marketplaceListingMatchesLocationQuery({
  query,
  countryCode,
  city,
  municipality,
  countryCodes = [],
}: {
  query: string
  countryCode?: string | null
  city?: string | null
  municipality?: string | null
  countryCodes?: string[]
}) {
  const queryKey = normalizeLocationQuery(query)
  if (queryKey.length < 2) return false

  const listingCountry = String(countryCode || '').toUpperCase()
  const scopedCountries = countryCodes.map((code) => code.toUpperCase()).filter(Boolean)
  if (scopedCountries.length && listingCountry && !scopedCountries.includes(listingCountry)) return false

  const listingLocationKey = normalizeLocationQuery([municipality, city].filter(Boolean).join(' '))
  if (listingLocationKey && locationKeyMatches(listingLocationKey, queryKey)) return true

  const locationTerms = marketplaceSearchLocationTermsForQuery(
    query,
    listingCountry ? [listingCountry] : scopedCountries,
  )
  return locationTerms.municipalities.some((term) => {
    const termKey = normalizeLocationQuery(term)
    return Boolean(termKey && listingLocationKey.includes(termKey))
  })
}

const regionLabelByCountry: Record<MarketplaceLocationCountryCode, Record<string, string>> = {
  DE: { de: 'Bundesland', en: 'State', sv: 'Delstat' },
  FR: { fr: 'Region', en: 'Region', sv: 'Region' },
  IT: { it: 'Regione', en: 'Region', sv: 'Region' },
  ES: { es: 'Comunidad autonoma', en: 'Region', sv: 'Region' },
  NL: { nl: 'Provincie', en: 'Province', sv: 'Provins' },
  BE: { nl: 'Gewest', fr: 'Region', en: 'Region', sv: 'Region' },
  SE: { sv: 'Län', en: 'County', de: 'Län' },
  PL: { pl: 'Wojewodztwo', en: 'Voivodeship', sv: 'Vojvodskap' },
  AT: { de: 'Bundesland', en: 'State', sv: 'Delstat' },
  DK: { da: 'Region', en: 'Region', sv: 'Region' },
  FI: { fi: 'Maakunta', en: 'Region', sv: 'Landskap' },
}

const municipalityLabelByCountry: Record<MarketplaceLocationCountryCode, Record<string, string>> = {
  DE: { de: 'Stadt / Landkreis', en: 'City / district', sv: 'Stad / område' },
  FR: { fr: 'Commune / ville', en: 'Municipality / city', sv: 'Kommun / ort' },
  IT: { it: 'Comune / citta', en: 'Municipality / city', sv: 'Kommun / ort' },
  ES: { es: 'Municipio / ciudad', en: 'Municipality / city', sv: 'Kommun / ort' },
  NL: { nl: 'Gemeente / stad', en: 'Municipality / city', sv: 'Kommun / ort' },
  BE: { nl: 'Gemeente / stad', fr: 'Commune / ville', en: 'Municipality / city', sv: 'Kommun / ort' },
  SE: { sv: 'Kommun', en: 'Municipality', de: 'Gemeinde' },
  PL: { pl: 'Gmina / miasto', en: 'Municipality / city', sv: 'Kommun / ort' },
  AT: { de: 'Gemeinde / Stadt', en: 'Municipality / city', sv: 'Kommun / ort' },
  DK: { da: 'Kommune / by', en: 'Municipality / city', sv: 'Kommun / ort' },
  FI: { fi: 'Kunta / kaupunki', en: 'Municipality / city', sv: 'Kommun / ort' },
}

export function marketplaceRegionLabel(countryCode: string, locale = 'sv') {
  const market = getMarketplaceCountryLocations(countryCode)
  return localizedLocationLabel(regionLabelByCountry[market.countryCode], locale) || market.regionLabel
}

export function marketplaceMunicipalityLabel(countryCode: string, locale = 'sv') {
  const market = getMarketplaceCountryLocations(countryCode)
  return localizedLocationLabel(municipalityLabelByCountry[market.countryCode], locale) || market.municipalityLabel
}

export function marketAllLabel(countryCode: string, locale = 'sv') {
  const market = getMarketplaceCountryLocations(countryCode)
  if (locale === 'sv') return market.allLabel
  return getEuCountryName(countryCode, locale)
}

function localizedLocationLabel(labels: Record<string, string> | undefined, locale: string) {
  const normalizedLocale = locale === 'at' ? 'de' : locale === 'be' ? 'nl' : locale
  return labels?.[normalizedLocale] || labels?.en || ''
}

function normalizeLocationQuery(value: string) {
  return normalizeLocationName(value)
    .split(' ')
    .filter((part) => !locationQueryStopWords.has(part))
    .join(' ')
}

function locationKeyMatches(locationKey: string, queryKey: string) {
  if (!locationKey || !queryKey) return false
  const locationBase = locationKey.replace(/s$/, '')
  const queryBase = queryKey.replace(/s$/, '')
  return (
    locationKey === queryKey ||
    locationBase === queryBase ||
    (queryKey.length >= 3 && locationKey.includes(queryKey)) ||
    (locationKey.length >= 3 && queryKey.includes(locationKey)) ||
    (queryBase.length >= 3 && locationBase.includes(queryBase)) ||
    (locationBase.length >= 3 && queryBase.includes(locationBase))
  )
}

function locationSearchMarkets(countryCodes: string[]) {
  const scopes = countryCodes
    .map((code) => code.toUpperCase())
    .filter(Boolean)

  if (!scopes.length) return marketplaceLocations
  return marketplaceLocations.filter((market) => scopes.includes(market.countryCode))
}

const locationQueryStopWords = new Set([
  'lan',
  'lans',
  'region',
  'regions',
  'province',
  'provins',
  'county',
  'kommun',
  'commune',
  'municipality',
  'city',
  'stad',
  'ort',
])

function splitLocationParts(value?: string | null) {
  return String(value || '')
    .split(/[\/,|]+|\s+-\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
}
