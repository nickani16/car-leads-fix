# AUTORELL DEVELOPMENT RULES

## Viktigt

Följ alltid dessa regler innan några ändringar görs.

## Skyddade delar

Ändra aldrig startsidan utan uttryckligt godkännande.

Ändra aldrig:

* Header
* Footer
* Navigation
* Globala komponenter
* Designsystem

utan uttryckligt godkännande.

## Vid nya funktioner

Skapa alltid en plan först.

Beskriv:

* Vad som ska ändras
* Vilka filer som påverkas
* Eventuella risker

innan implementation påbörjas.

## Vid redesign

Bygg redesign på separat testsida först.

Exempel:

/design-v2

eller

/category-v2

Den befintliga sidan får inte skrivas över direkt.

## Kodkvalitet

* Återanvänd komponenter
* Undvik duplicerad kod
* Följ befintlig struktur
* Följ befintlig design

## Osäkerhet

Om det råder osäkerhet kring en ändring:

STOPPA

och be om godkännande innan implementation.

## Prioritet

1. Stabilitet
2. Användarupplevelse
3. Design
4. Nya funktioner

Ingen ny funktion får försämra befintliga sidor.

## Performance & Production Rules

Alla nya funktioner ska utvecklas med prestanda och skalbarhet i åtanke.

### Rendering

* Använd statisk rendering när det är möjligt.
* Använd endast dynamisk rendering när funktionaliteten kräver det.
* Undvik onödiga `headers()`, `cookies()` och `dynamic = "force-dynamic"`.

### Cache

* Publika annonser, kategorisidor och sökresultat får cacheas.
* Privat användardata får aldrig cacheas publikt.
* Alla ändringar av annonser (publicera, redigera, sälja, pausa, radera eller godkänna) ska invalidiera relevant cache direkt.

### API

* Undvik upprepade API-anrop från listor och kortkomponenter.
* Gemensam data ska hämtas en gång och återanvändas.
* Hämta endast de fält som faktiskt används.

### Säkerhet

* Service Role-nycklar får aldrig exponeras i frontend.
* Följ alltid Supabase RLS.
* Admin-, konto-, dealer- och meddelanderutter ska alltid vara privata.

### Kvalitetssäkring

Efter varje större uppgift ska följande genomföras:

* npm run lint
* npm run build

Sammanfatta alltid:

* vilka filer som ändrats
* eventuella risker
* påverkan på prestanda
* om lösningen är säker för produktion
