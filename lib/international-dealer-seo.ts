export type DealerSeoLocale = 'de' | 'en'

export type DealerSeoLocation = {
  slug: string
  name: string
  region: string
  marketNote: string
  logisticsNote: string
  demand: [string, string, string]
}

export const germanDealerCities: DealerSeoLocation[] = [
  {
    slug: 'berlin',
    name: 'Berlin',
    region: 'Berlin-Brandenburg',
    marketNote:
      'Berlin verbindet eine große regionale Fahrzeugnachfrage mit einem schnell wachsenden Bestand an elektrifizierten und digital vermarkteten Fahrzeugen.',
    logisticsNote:
      'Die Lage im Nordosten Deutschlands schafft gute Verbindungen nach Skandinavien, Polen und in weitere europäische Absatzmärkte.',
    demand: ['Elektro & Hybrid', 'SUV & Crossover', 'Junge Gebrauchte'],
  },
  {
    slug: 'hamburg',
    name: 'Hamburg',
    region: 'Norddeutschland',
    marketNote:
      'Hamburg ist ein wichtiger Handels-, Hafen- und Logistikstandort mit professioneller Nachfrage nach modernen Fahrzeugen für den regionalen und internationalen Wiederverkauf.',
    logisticsNote:
      'Kurze Wege Richtung Skandinavien und leistungsfähige Logistik machen Hamburg zu einem natürlichen Knotenpunkt für grenzüberschreitenden Fahrzeughandel.',
    demand: ['Elektrofahrzeuge', 'Premium-Limousinen', 'Leichte Nutzfahrzeuge'],
  },
  {
    slug: 'muenchen',
    name: 'München',
    region: 'Bayern',
    marketNote:
      'Der Münchner Markt ist geprägt von hoher Kaufkraft, starken Premiumsegmenten und einer wachsenden Nachfrage nach jungen Elektro- und Hybridfahrzeugen.',
    logisticsNote:
      'Von Bayern bestehen direkte Handelsachsen nach Österreich, Italien, Tschechien und in weitere zentrale EU-Märkte.',
    demand: ['Premium & Business', 'Plug-in-Hybrid', 'SUV & Allrad'],
  },
  {
    slug: 'koeln',
    name: 'Köln',
    region: 'Nordrhein-Westfalen',
    marketNote:
      'Köln liegt in einer der größten europäischen Automobilregionen und bietet Händlern Zugang zu einem dichten privaten und gewerblichen Absatzmarkt.',
    logisticsNote:
      'Die Nähe zu Belgien, den Niederlanden und dem Ruhrgebiet unterstützt schnelle grenzüberschreitende Einkaufs- und Verkaufsprozesse.',
    demand: ['Kompaktklasse', 'Elektro & Hybrid', 'Flottenfahrzeuge'],
  },
  {
    slug: 'frankfurt',
    name: 'Frankfurt am Main',
    region: 'Hessen',
    marketNote:
      'Frankfurt verbindet einen starken Business-Car-Markt mit zentraler Lage und professionellen Händlerstrukturen im Rhein-Main-Gebiet.',
    logisticsNote:
      'Die zentrale Verkehrslage erleichtert Verteilung und Abholung in nahezu alle deutschen und angrenzenden europäischen Regionen.',
    demand: ['Business-Fahrzeuge', 'Premium-Kombi', 'Elektrofahrzeuge'],
  },
  {
    slug: 'stuttgart',
    name: 'Stuttgart',
    region: 'Baden-Württemberg',
    marketNote:
      'Stuttgart gehört zu Europas wichtigsten Automobilstandorten und bietet besondere Nachfrage nach hochwertigen, technisch gut dokumentierten Fahrzeugen.',
    logisticsNote:
      'Die Region ist eng mit Süddeutschland, Frankreich, der Schweiz und Österreich verbunden.',
    demand: ['Premiumfahrzeuge', 'Hybrid & Elektro', 'Sportliche Modelle'],
  },
  {
    slug: 'duesseldorf',
    name: 'Düsseldorf',
    region: 'Nordrhein-Westfalen',
    marketNote:
      'Düsseldorf ist ein kaufkräftiger Handelsstandort mit dichtem Händlernetz und hoher Nachfrage nach modernen Fahrzeugen mit klarer Historie.',
    logisticsNote:
      'Benelux, Ruhrgebiet und Rheinland sind von Düsseldorf aus schnell erreichbar.',
    demand: ['Premium & Executive', 'SUV & Crossover', 'Elektrofahrzeuge'],
  },
  {
    slug: 'dortmund',
    name: 'Dortmund',
    region: 'Ruhrgebiet',
    marketNote:
      'Dortmund liegt im Zentrum eines großen, vielfältigen Fahrzeugmarktes mit hoher Umschlaggeschwindigkeit und zahlreichen professionellen Käufern.',
    logisticsNote:
      'Das Ruhrgebiet bietet kurze Wege zu mehreren Millionen Endkunden und zu wichtigen europäischen Transportrouten.',
    demand: ['Volumenmodelle', 'SUV & Kombi', 'Junge Gebrauchte'],
  },
  {
    slug: 'essen',
    name: 'Essen',
    region: 'Ruhrgebiet',
    marketNote:
      'Essen bietet Zugang zu einem der dichtesten Fahrzeughandelsräume Deutschlands und eignet sich besonders für Händler mit breitem Bestandsmix.',
    logisticsNote:
      'Die zentrale Lage im Ruhrgebiet unterstützt effiziente Abholung, Aufbereitung und Weiterverteilung.',
    demand: ['Kompakt & Mittelklasse', 'Hybridfahrzeuge', 'Flottenrückläufer'],
  },
  {
    slug: 'leipzig',
    name: 'Leipzig',
    region: 'Sachsen',
    marketNote:
      'Leipzig wächst als Automobil- und Logistikstandort und gewinnt für moderne, elektrifizierte und digital gehandelte Fahrzeuge an Bedeutung.',
    logisticsNote:
      'Die Stadt verbindet ostdeutsche Märkte mit Polen, Tschechien und den zentralen europäischen Handelskorridoren.',
    demand: ['Elektrofahrzeuge', 'Junge Gebrauchte', 'Kompakt-SUV'],
  },
  {
    slug: 'bremen',
    name: 'Bremen',
    region: 'Nordwestdeutschland',
    marketNote:
      'Bremen kombiniert Fahrzeuglogistik, Hafenkompetenz und einen aktiven norddeutschen Händlerstandort.',
    logisticsNote:
      'Die Nähe zu Seehäfen sowie zu Hamburg und den Niederlanden unterstützt flexible Import- und Exportwege.',
    demand: ['Exportfahrzeuge', 'Elektro & Hybrid', 'Kombi & SUV'],
  },
  {
    slug: 'dresden',
    name: 'Dresden',
    region: 'Sachsen',
    marketNote:
      'Dresden bietet einen technologieorientierten Markt mit wachsender Nachfrage nach effizienten, jüngeren Fahrzeugen.',
    logisticsNote:
      'Die Lage nahe Tschechien und Polen eröffnet Händlern zusätzliche grenzüberschreitende Absatzmöglichkeiten.',
    demand: ['Elektro & Hybrid', 'Kompaktklasse', 'Familien-SUV'],
  },
  {
    slug: 'hannover',
    name: 'Hannover',
    region: 'Niedersachsen',
    marketNote:
      'Hannover ist ein zentraler Handels- und Messestandort mit starkem Flotten-, Nutzfahrzeug- und Gebrauchtwagengeschäft.',
    logisticsNote:
      'Die Kreuzung wichtiger Nord-Süd- und Ost-West-Routen ermöglicht eine effiziente nationale Verteilung.',
    demand: ['Flottenfahrzeuge', 'Kombi & SUV', 'Leichte Nutzfahrzeuge'],
  },
  {
    slug: 'nuernberg',
    name: 'Nürnberg',
    region: 'Bayern',
    marketNote:
      'Nürnberg bedient einen großen süddeutschen Einzugsbereich und bietet Nachfrage nach gut dokumentierten modernen Bestandsfahrzeugen.',
    logisticsNote:
      'Die Region verbindet Bayern mit Tschechien, Österreich und den zentralen deutschen Handelsachsen.',
    demand: ['Junge Gebrauchte', 'SUV & Crossover', 'Hybridfahrzeuge'],
  },
  {
    slug: 'mannheim',
    name: 'Mannheim',
    region: 'Rhein-Neckar',
    marketNote:
      'Mannheim liegt in einer wirtschaftsstarken Metropolregion mit professioneller Nachfrage nach Geschäfts-, Flotten- und Privatfahrzeugen.',
    logisticsNote:
      'Rhein-Neckar verbindet Südwestdeutschland mit Frankreich, Benelux und wichtigen Binnenlogistikwegen.',
    demand: ['Business-Kombi', 'Flottenrückläufer', 'Elektrofahrzeuge'],
  },
  {
    slug: 'karlsruhe',
    name: 'Karlsruhe',
    region: 'Baden-Württemberg',
    marketNote:
      'Karlsruhe verbindet Technologie, hohe regionale Kaufkraft und eine gute Nachfrage nach modernen, effizienten Fahrzeugen.',
    logisticsNote:
      'Frankreich, die Schweiz und das Rhein-Main-Gebiet sind über kurze Handelswege erreichbar.',
    demand: ['Elektro & Hybrid', 'Premium-Kompakt', 'Familienfahrzeuge'],
  },
  {
    slug: 'muenster',
    name: 'Münster',
    region: 'Nordrhein-Westfalen',
    marketNote:
      'Münster bietet ein kaufkräftiges regionales Umfeld und Nachfrage nach gepflegten, jüngeren Fahrzeugen mit transparenter Historie.',
    logisticsNote:
      'Die Nähe zu Niedersachsen, Ruhrgebiet und Niederlanden erweitert den erreichbaren Händlermarkt.',
    demand: ['Kombi & SUV', 'Elektrofahrzeuge', 'Junge Gebrauchte'],
  },
  {
    slug: 'bonn',
    name: 'Bonn',
    region: 'Rheinland',
    marketNote:
      'Bonn liegt in einem kaufkräftigen Rheinmarkt mit hoher Relevanz für Business-, Premium- und elektrifizierte Fahrzeuge.',
    logisticsNote:
      'Köln, Benelux und das Rhein-Main-Gebiet sind schnell erreichbar.',
    demand: ['Business & Premium', 'Plug-in-Hybrid', 'Elektro-SUV'],
  },
]

export const europeanDealerCountries: DealerSeoLocation[] = [
  {
    slug: 'germany',
    name: 'Germany',
    region: 'Central Europe',
    marketNote:
      'Germany is one of Europe’s deepest professional vehicle markets, with strong dealer demand across premium, volume and electrified segments.',
    logisticsNote:
      'Its central position and mature logistics network support efficient onward distribution across the EU.',
    demand: ['Electric & hybrid', 'Premium inventory', 'SUV & crossover'],
  },
  {
    slug: 'netherlands',
    name: 'the Netherlands',
    region: 'Benelux',
    marketNote:
      'The Dutch market combines high digital adoption with strong demand for efficient, well-documented and increasingly electric vehicles.',
    logisticsNote:
      'Dense port and road infrastructure makes the Netherlands a practical gateway for European vehicle trade.',
    demand: ['Electric vehicles', 'Efficient hybrids', 'Compact models'],
  },
  {
    slug: 'belgium',
    name: 'Belgium',
    region: 'Benelux',
    marketNote:
      'Belgium has a highly connected dealer market with meaningful demand for company cars, premium vehicles and electrified inventory.',
    logisticsNote:
      'Its location between France, Germany, Luxembourg and the Netherlands enables flexible cross-border resale.',
    demand: ['Company cars', 'Premium estates', 'Plug-in hybrids'],
  },
  {
    slug: 'france',
    name: 'France',
    region: 'Western Europe',
    marketNote:
      'France offers one of Europe’s largest consumer markets and broad dealer demand for modern vehicles across urban and regional segments.',
    logisticsNote:
      'Strong north-south corridors connect French dealers to Benelux, Germany, Spain and Mediterranean markets.',
    demand: ['Electric vehicles', 'Compact cars', 'Family crossovers'],
  },
  {
    slug: 'spain',
    name: 'Spain',
    region: 'Southern Europe',
    marketNote:
      'Spain has a large, diverse used-car market with growing interest in newer efficient vehicles and documented European supply.',
    logisticsNote:
      'Major logistics corridors connect Spanish dealers with France, Portugal and key port markets.',
    demand: ['Efficient petrol', 'Hybrid vehicles', 'SUV & crossover'],
  },
  {
    slug: 'italy',
    name: 'Italy',
    region: 'Southern Europe',
    marketNote:
      'Italy combines a large independent dealer sector with strong regional demand for compact, premium and efficient modern vehicles.',
    logisticsNote:
      'Northern Italian hubs provide onward access to Austria, Switzerland, France and the wider Mediterranean market.',
    demand: ['Compact premium', 'Hybrid vehicles', 'Urban crossovers'],
  },
  {
    slug: 'austria',
    name: 'Austria',
    region: 'Central Europe',
    marketNote:
      'Austria is a quality-focused market where documented condition, efficient powertrains and all-weather capability matter to dealers.',
    logisticsNote:
      'The country links Germany, Italy and Central and Eastern European markets through established transport corridors.',
    demand: ['SUV & all-wheel drive', 'Electric vehicles', 'Premium estates'],
  },
  {
    slug: 'denmark',
    name: 'Denmark',
    region: 'Nordic Europe',
    marketNote:
      'Denmark is a digitally mature automotive market with rapidly increasing demand for electric and low-emission vehicles.',
    logisticsNote:
      'Direct Nordic and German connections make Denmark well positioned for cross-border sourcing.',
    demand: ['Electric vehicles', 'Compact crossovers', 'Efficient hybrids'],
  },
  {
    slug: 'finland',
    name: 'Finland',
    region: 'Nordic Europe',
    marketNote:
      'Finland values reliable, winter-ready vehicles with transparent service history and practical specifications.',
    logisticsNote:
      'Nordic shipping and road links enable structured sourcing from Sweden and onward Baltic connections.',
    demand: ['All-wheel drive', 'Electric & hybrid', 'Estate vehicles'],
  },
  {
    slug: 'poland',
    name: 'Poland',
    region: 'Central Europe',
    marketNote:
      'Poland is one of Europe’s most active cross-border used-vehicle markets, with broad dealer demand and high inventory turnover.',
    logisticsNote:
      'Its scale and central-eastern location support distribution into Germany, the Baltics, Czechia and neighbouring markets.',
    demand: ['Young used vehicles', 'SUV & estate', 'Efficient diesel & hybrid'],
  },
  {
    slug: 'czechia',
    name: 'Czechia',
    region: 'Central Europe',
    marketNote:
      'Czechia has a strong automotive economy and professional demand for newer, well-specified European vehicles.',
    logisticsNote:
      'Prague and the national motorway network connect dealers efficiently with Germany, Austria, Poland and Slovakia.',
    demand: ['Estate vehicles', 'SUV & crossover', 'Business inventory'],
  },
  {
    slug: 'portugal',
    name: 'Portugal',
    region: 'Southern Europe',
    marketNote:
      'Portugal has growing demand for modern, efficient European vehicles supported by a professional independent dealer sector.',
    logisticsNote:
      'Iberian road and port links connect Portuguese dealers with Spain and wider European supply.',
    demand: ['Efficient compact cars', 'Hybrid vehicles', 'Urban SUV'],
  },
  {
    slug: 'ireland',
    name: 'Ireland',
    region: 'Western Europe',
    marketNote:
      'Ireland has strong demand for newer efficient vehicles, though right-hand-drive requirements make careful stock selection essential.',
    logisticsNote:
      'Dealer opportunities are best suited to compatible specifications and planned sea transport.',
    demand: ['Right-hand drive', 'Electric vehicles', 'Family SUV'],
  },
  {
    slug: 'estonia',
    name: 'Estonia',
    region: 'Baltic Europe',
    marketNote:
      'Estonia is a digitally advanced market with professional interest in transparent, modern Nordic vehicle supply.',
    logisticsNote:
      'Baltic sea links create efficient routes from Sweden and Finland into the regional dealer network.',
    demand: ['Nordic specifications', 'Electric vehicles', 'SUV & all-wheel drive'],
  },
  {
    slug: 'latvia',
    name: 'Latvia',
    region: 'Baltic Europe',
    marketNote:
      'Latvia is an established Baltic trading hub with demand for younger vehicles and clear technical documentation.',
    logisticsNote:
      'Riga connects Nordic sea routes with road distribution throughout the Baltics and Eastern Europe.',
    demand: ['Young used vehicles', 'SUV & estate', 'Premium inventory'],
  },
  {
    slug: 'lithuania',
    name: 'Lithuania',
    region: 'Baltic Europe',
    marketNote:
      'Lithuania has a highly active professional vehicle trade and significant experience in cross-border sourcing and resale.',
    logisticsNote:
      'Its road and port infrastructure supports distribution across the Baltics, Poland and nearby markets.',
    demand: ['Dealer stock', 'SUV & crossover', 'Modern premium'],
  },
  {
    slug: 'romania',
    name: 'Romania',
    region: 'Southeastern Europe',
    marketNote:
      'Romania offers a large and developing dealer market with demand for newer European vehicles at competitive total cost.',
    logisticsNote:
      'Established central European routes connect Romanian buyers with supply markets across the EU.',
    demand: ['Young used vehicles', 'Efficient engines', 'Family SUV'],
  },
  {
    slug: 'croatia',
    name: 'Croatia',
    region: 'Southeastern Europe',
    marketNote:
      'Croatia has a growing professional vehicle market with demand shaped by urban buyers, tourism and regional resale.',
    logisticsNote:
      'The country connects Central Europe with Adriatic and Balkan markets.',
    demand: ['Compact SUV', 'Efficient hybrids', 'Fleet vehicles'],
  },
  {
    slug: 'slovenia',
    name: 'Slovenia',
    region: 'Central Europe',
    marketNote:
      'Slovenia is a compact but well-connected market where modern specifications and documented condition support dealer confidence.',
    logisticsNote:
      'Its position between Austria, Italy, Croatia and Hungary makes it a useful regional trading point.',
    demand: ['Estate & SUV', 'Hybrid vehicles', 'Young used cars'],
  },
  {
    slug: 'luxembourg',
    name: 'Luxembourg',
    region: 'Western Europe',
    marketNote:
      'Luxembourg is a premium-oriented market with high company-car penetration and demand for well-equipped newer vehicles.',
    logisticsNote:
      'Immediate access to Germany, France and Belgium supports a highly international dealer environment.',
    demand: ['Premium company cars', 'Electric vehicles', 'Executive SUV'],
  },
]

export function getDealerSeoLocations(locale: DealerSeoLocale) {
  return locale === 'de' ? germanDealerCities : europeanDealerCountries
}

export function getDealerSeoLocation(
  locale: DealerSeoLocale,
  slug: string,
) {
  return getDealerSeoLocations(locale).find((location) => location.slug === slug)
}

export function getDealerSeoPublicPath(
  locale: DealerSeoLocale,
  slug?: string,
) {
  const base = locale === 'de' ? '/haendler' : '/dealers'
  return slug ? `${base}/${slug}` : base
}
