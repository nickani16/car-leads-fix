# Autorell Admin – Fas 0: nuläge, gap och säkerhetsplan

Datum: 2026-07-13  
Bas: commit `890c4f17` (samma kod som den senast verifierade produktionsversionen)  
Supabase-projekt granskat read-only: `pxtyjvrraybupolsjsmq`

## Sammanfattning

Autorell har redan en användbar första adminyta för profiler, företag, annonser, rapporter, support, statistik och personal. Den kan återanvändas, men den är ännu inte ett säkert rollstyrt kontrollcenter. Den viktigaste bristen är att läsrättigheter i praktiken ges till alla aktiva poster i `admin_users`, medan nästan alla mutationer samtidigt är låsta till `super_admin`. Det finns alltså varken minsta privilegium eller användbara specialistroller.

Fas 1 ska därför bygga en gemensam serverstyrd RBAC-kärna, en riktig responsiv adminlayout, en driftorienterad dashboard, en förbättrad audit-grund och återanvändbara navigation-/filter-/statusmönster. Befintliga kärnflöden ska inte skrivas om blint. Produktionsdatabasen eller Vercel-produktion ändras inte utan uttryckligt godkännande.

## 1. Befintliga adminfiler

### Layout, navigation och gemensam UI

- `app/admin/layout.tsx`
- `app/admin/AdminShell.tsx`
- `app/admin/AdminUI.tsx`
- `app/admin/AdminEntityActions.tsx`
- `app/admin/admin-helpers.ts`
- `lib/admin-auth.ts`
- `lib/admin-route-auth.ts`
- `lib/admin-allowlist.ts`
- `lib/supabase/admin.ts`

### Sidor

- `app/admin/page.tsx`
- `app/admin/users/page.tsx`
- `app/admin/users/[id]/page.tsx`
- `app/admin/private/page.tsx`
- `app/admin/private/[id]/page.tsx`
- `app/admin/companies/page.tsx`
- `app/admin/companies/[id]/page.tsx`
- `app/admin/listings/page.tsx`
- `app/admin/listings/[id]/page.tsx`
- `app/admin/reports/page.tsx`
- `app/admin/support/page.tsx`
- `app/admin/stats/page.tsx`
- `app/admin/settings/page.tsx`
- `app/admin/access/page.tsx`
- `app/admin/access/AccessControlPanel.tsx`
- `app/admin/ProfileAdminList.tsx`
- `app/admin/ProfileDetail.tsx`
- `app/admin/PlatformLegalEntityForm.tsx`

### Admin-API

- `app/api/admin/users/[id]/route.ts`
- `app/api/admin/marketplace-listings/[id]/route.ts`
- `app/api/admin/reports/[id]/route.ts`
- `app/api/admin/reviews/[id]/route.ts`
- `app/api/admin/staff/route.ts`
- `app/api/admin/staff/[id]/route.ts`
- `app/api/admin/legal-entity/route.ts`
- `app/api/admin/marketplace-media-retention/route.ts`
- `app/api/admin/support/tickets/route.ts`
- `app/api/admin/support/tickets/[id]/route.ts`
- `app/api/admin/support/ai/classify/route.ts`
- `app/api/admin/support/ai/suggest-reply/route.ts`
- `app/api/admin/support/ai/summarize/route.ts`
- `app/api/admin/support/ai/translate/route.ts`

## 2. Befintliga routes och funktion

| Route | Nuläge |
| --- | --- |
| `/admin` | Enkel dashboard med totaler och senaste annonser. En support-widget frågar en tabell som inte finns live. |
| `/admin/users` | Serverbaserad sökning, typ/land-filter och paginering för profiler. |
| `/admin/private` | Samma profilkomponent filtrerad till privatkonton. |
| `/admin/companies` | Samma profilkomponent filtrerad till företagskonton. |
| `/admin/users/[id]`, `/private/[id]`, `/companies/[id]` | Profil, annonser och konto-/verifieringsåtgärder. |
| `/admin/listings` | Serverbaserad sökning, status-/kategori-/landfilter och paginering. |
| `/admin/listings/[id]` | Annonsdata, riskdata, händelser och administrativa statusåtgärder. |
| `/admin/reports` | Rapportkö med sökning, statusfilter och statushantering. |
| `/admin/support` | Tvåpanelsvy och AI-routes, men live-databasen saknar de supporttabeller vyn förväntar sig. |
| `/admin/stats` | Operativa antal per konto och kategori. |
| `/admin/settings` | Read-only roll- och moderationsinformation. |
| `/admin/access` | Super-adminvy för `staff_users` och senaste auditposter. |

Det saknas separata routes för moderering, betalningar, abonnemang/paket, säkerhet, systemstatus, audit-logg, innehåll/CMS, media, nyhetsbrev, marknader/språk, fordonsdata och riktig rolladministration.

## 3. Hur adminbehörighet fungerar i dag

1. `Supabase Auth.getUser()` validerar den inloggade användaren på serversidan.
2. E-postadressen måste finnas i en hårdkodad eller miljökonfigurerad allowlist.
3. Användaren måste ha en aktiv rad i `public.admin_users`.
4. `requireAdmin()` skyddar serversidor. `requireSuperAdminRoute()` skyddar de flesta mutationer.
5. Service-role-klienten skapas endast i server-only-kod och skickas inte till klienten.

Detta är bättre än ett rent frontendskydd, men modellen har endast `role text` på `admin_users`, inga permissions och ingen gemensam kontroll per åtgärd. Navigationen filtreras inte efter behörighet. `staff_users` har rollerna `sales`, `operations`, `support`, `legal`, men är ett separat personalsystem och ger inte automatiskt adminåtkomst.

## 4. Befintlig datamodell och RLS som berör admin

### Existerande och återanvändbara tabeller

- Access: `admin_users`, `staff_users`, `admin_audit_log`
- Användare/företag: `marketplace_profiles`, `marketplace_companies`, `marketplace_company_members`, `marketplace_identity_checks`
- Annonser/moderering: `marketplace_listings`, `marketplace_listing_images`, `marketplace_listing_events`, `marketplace_listing_risk_events`, `marketplace_reports`, `marketplace_reviews`
- Ekonomi: `billing_product_prices`, `payment_orders`, `payment_audit_log`, `stripe_webhook_events`, `business_subscriptions`, `refresh_credit_balances`, `refresh_credit_ledger`
- Kommunikation: `marketplace_conversations`, `marketplace_messages`, `notifications`
- Nyhetsbrev: `newsletter_subscribers`

Alla listade publika bastabeller har RLS aktiverat. Vanliga användare kan läsa/ändra sina egna profiler och annonser enligt ägarpolicyer. Publika besökare kan bara läsa publicerade annonser och bilder. `admin_audit_log`, `staff_users` och Stripe-webhookdata har inga klientpolicyer och är endast tillgängliga via service role, vilket är en rimlig grund för server-only administration.

### Schema som kod förutsätter men som saknas live

- `admin_support_cases`
- `support_tickets`
- `support_messages`
- `support_ticket_events`
- `support_agent_profiles`
- separata `moderation_cases` / `moderation_actions`
- `security_events`, `ip_blocks`, sessionsmetadata
- CMS-, media- och kampanjtabeller

### Företagsstatus i dag

`marketplace_companies.verification_status` använder i praktiken `pending_review`, `verified` och `rejected`. Profilen duplicerar delar av statusen i `marketplace_profiles.business_verification_status`. Kravets fulla livscykel (`draft`, `submitted`, `under_review`, `more_information_required`, `approved`, `rejected`, `suspended`, `revoked`) och en separat händelsehistorik saknas.

## 5. Betalning, Stripe, support och loggning

- Stripe-webhooken och order/fulfillment är server-only och lagrar lokala order, eventstatus och betalningsaudit.
- Admin har ingen betalningsvy och ingen säker refund-/credit-route.
- Support-UI och AI-hjälproutes finns i kod men motsvarande tabeller finns inte i live-schemat.
- `admin_audit_log` lagrar actor, hårdkodad roll, action, target, reason samt before/after.
- Misslyckade adminåtgärder loggas inte konsekvent. Audit-insertfel loggas bara till serverkonsolen och stoppar inte den känsliga åtgärden.
- Audit saknar `success`, felkod, request/session-id, marknad och strukturerad känslighetsnivå.

## 6. Kritiska säkerhetsproblem

### P0 – måste lösas före bred adminlansering

1. Ingen permissionsmodell: alla aktiva admins kan läsa alla befintliga adminvyer, medan mutationer är super-admin-only.
2. Personal-API:t kan sätta en användares lösenord direkt. Det strider mot kravet och ska ersättas med ett kontrollerat återställnings-/inbjudningsflöde.
3. Ingen MFA/AAL2-kontroll för admins och ingen serverregistrerad adminsession med återkallning.
4. Live-schema och kod har drift: dashboard/support frågar tabeller som saknas; vissa mutationer försöker tyst falla tillbaka när kolumner saknas.
5. Kritiska actions kräver inte alltid anledning; audit loggar inte misslyckanden och aktörsrollen hårdkodas till `super_admin`.
6. Ingen dedikerad modereringskö trots att annonsrisker och rapporter finns.
7. Ingen rollgränstestning för direkta API-anrop.

### P1 – före full liveberedskap

8. Ingen IP-, sessions- eller säkerhetshändelselogg med retention och rollstyrd maskering.
9. Ingen origin/CSRF-kontroll uttryckt för adminmutationer.
10. Ingen read-only supportvy/impersoneringsmodell.
11. Ingen transaktionsgräns mellan resursändring, event och audit; partiella fel kan lämna ofullständig historik.
12. Supabase Security Advisor rapporterar två security-definer-vyer (`dealer_bids`, `dealer_leads`), flera funktioner med muterbar `search_path` och att leaked-password protection är avstängt. De två vyerna är en separat plattformsrisk och ska åtgärdas före live även om de inte är nya adminobjekt.

## 7. Gap-analys

| Område | Finns | Halvfärdigt | Saknas |
| --- | --- | --- | --- |
| Skyddad layout | Servervaliderad auth + allowlist | Dubblerad authkod, ingen AAL2/session registry | MFA, återkallningsbar adminsession |
| RBAC | `role` på `admin_users` | Super-admin-gate på writes | Roller, permissions, policykontroll per action |
| Navigation | Desktopsidebar + mobil horisontell list | Alla ser samma länkar | Behörighetsfiltrering, drawer, grupper, kommande områden |
| Dashboard | Grundantal + senaste annonser | Saknade fel-/betal-/verifieringswidgets | Datum/marknad/filter, health och action queues |
| Användare | Sök, filter, paginering, kontoactions | Begränsad detaljhistorik | sessioner, notes, GDPR, kontrollerad radering |
| Företag | Profil och manuell verify/reject | Duplicerad enkel status | request/event/documentmodell och full statusmaskin |
| Annonser | List/detail, risk, event, actions | Super-admin-only, få redigeringsfält | versioner, notes, bildactions, modereringscase |
| Rapporter | Enkel kö | Begränsade statusar och objekt | severity, assignee, evidence, full case timeline |
| Betalningar | Stabil servergrund och lokala tabeller | Ingen adminvy | finance-RBAC, refund/credit flows och Stripe-länkar |
| Support | UI och AI-routes i kod | Databasen saknas | komplett tabellmodell, accessgränser och audit |
| Audit | Server-only append via service role | hårdkodad roll, bara success paths | resultat/fel/session, central route, export/retention |
| Säkerhet | Riskevents per annons | ingen gemensam vy | security events, session registry, IP-block, retention |
| CMS/media/newsletter | subscriber-tabell | navigation saknas | hela redaktionella modellen och säkert mediaflöde |

## 8. Rekommenderad route- och komponentstruktur

```text
app/admin/
  layout.tsx
  page.tsx                         # operativ dashboard
  users/, companies/, listings/
  moderation/, reports/
  payments/, subscriptions/
  support/
  content/, media/, newsletters/
  markets/, vehicle-data/
  security/, analytics/
  system/, audit/, settings/
  administrators/
  _components/
    AdminShell.tsx
    AdminNavigation.tsx
    AdminMobileDrawer.tsx
    AdminCommandBar.tsx
    AdminDataView.tsx
    AdminFilters.tsx
    AdminStatusBadge.tsx
    AdminActionDialog.tsx
    AdminTimeline.tsx
lib/admin/
  auth.ts
  permissions.ts
  navigation.ts
  audit.ts
  validation.ts
  dashboard.ts
```

Server Components hämtar data. Små klientkomponenter hanterar drawer, filterdialoger och bekräftelser. Varje sida och varje mutation anropar samma serverfunktion för exakt permission; proxy får aldrig vara enda skyddet.

## 9. Rekommenderad databasmodell

### Fas 1

- `admin_roles`: stabila rollnycklar och metadata.
- `admin_permissions`: stabila permissionnycklar.
- `admin_role_permissions`: many-to-many roll → permission.
- `user_admin_roles`: användare → roll, aktivperiod, tilldelare och anledning.
- utökad `admin_audit_log`: faktisk roll, permission, success/failure, request/session-id, metadata.
- `admin_notes`: interna anteckningar med resurstyp/resurs-id.
- `admin_saved_views`: framtidssäker grund för sparade filter.

`admin_users` behålls under en kontrollerad övergång och backfillas till `user_admin_roles`. Ingen rollinformation hämtas från användarstyrd `user_metadata`. JWT-claims kan senare användas som cache, men känsliga mutationer ska fortsatt kontrollera server-/databaskällan så att rolländringar får omedelbar effekt.

### Senare faser

- `business_verification_requests`, `business_verification_documents`, `business_verification_events`
- `moderation_cases`, `moderation_actions`
- `user_reports` eller utökad `marketplace_reports`
- `support_tickets`, `support_messages`, `support_ticket_events`, `support_agent_profiles`
- privat schema för `security_events`, `user_sessions_metadata`, `ip_blocks`
- CMS/media/newsletter/system settings enligt specifikationen

## 10. Exakt scope för Fas 1

1. Central katalog för roller och permissions enligt kravet.
2. Serverfunktioner `requireAdminPermission` och route-variant med korrekt 401/403.
3. Legacy-kompatibel rollresolution så nuvarande super-admins inte låses ute innan migrationen godkänts.
4. Behörighetsfiltrerad, grupperad desktopnavigation och riktig mobil drawer.
5. Dashboard med relevanta live-tabeller, tydliga action queues och felhantering utan frågor mot tabeller som saknas.
6. Audit-hjälpare som använder faktisk roll/permission och kan logga misslyckade actions.
7. Gemensamma responsiva data-/status-/filtermönster som befintliga sidor kan migreras till gradvis.
8. Ny read-only auditvy för behöriga roller.
9. Ny administratörs-/rollöversikt; känslig rollmutation lämnas avstängd tills migration och tester är godkända.
10. Migration för RBAC/audit foundation, RLS, grants, seed och backfill – skapad men inte applicerad i produktion.
11. Enhetstester för rollmatris och direkta permissiongränser.
12. Typecheck, lint, test, build samt mobil/desktop-QA.

Fas 1 implementerar inte refund, kontoradering, IP-block, full företagsverifiering, full modereringsmotor, CMS eller nyhetsbrev. Navigationen kan visa dessa som planerade områden endast om det är tydligt att de inte är aktiva.

## 11. Återanvändning

- Behåll `createClient()` + `auth.getUser()` som identitetskontroll.
- Behåll service-role-klienten server-only.
- Behåll nuvarande serverbaserade sökning, filter och paginering.
- Behåll profil-, annons-, rapport- och statussidorna och migrera dem permission för permission.
- Behåll `marketplace_listing_events`, risk events, ordertabeller och Stripe-webhookhistorik.
- Behåll nuvarande designkomponenter där de klarar responsivitet; ersätt endast shell/navigation och duplicerade authmönster.

## 12. Migreringsordning

1. Skapa RBAC-tabeller och seedade systemroller/permissions.
2. Backfilla `admin_users` till `user_admin_roles` utan att radera legacydata.
3. Utöka auditloggen additivt.
4. Aktivera RLS, återkalla `anon`/`authenticated`, ge endast service role och eventuellt strikt own-role lookup.
5. Deploya backward-compatible serverkod.
6. Verifiera super-admin, operations, moderator, support, finance, content och analyst mot direkta API-anrop.
7. Först efter uttryckligt godkännande: applicera migration, previewtesta med riktiga roller och därefter separat produktionsbeslut.

## 13. Implementeringsordning efter Fas 1

1. Fas 2A: modereringskö, rapportcase och annonsåtgärder.
2. Fas 2B: användar-/företagsdetaljer, notes, session revocation och full verifieringsstatus.
3. Fas 3: betalningar, abonnemang, credits/refunds och supportdatamodell.
4. Fas 4: CMS och media.
5. Fas 5: nyhetsbrev och analys.
6. Fas 6: avancerad säkerhet, riskmotor och automation.

## 14. Måste vara klart före live

- MFA/AAL2 för alla admins.
- Server-RBAC på varje sida och mutation, med testad rollmatris.
- Ingen lösenordsinställning av admins; endast säkert reset/invite-flöde.
- Full audit för success och failure på känsliga actions.
- Fungerande användar-, företags-, annons-, rapport-, modererings- och betalningsöversikt.
- Tydlig företagsstatus och historik.
- Kritiska actions med anledning och bekräftelse.
- RLS/API-negative tests och verifierade direkta 401/403.
- Mobil och desktop utan kärnflödets horisontella scroll.
- Schema/code-drift eliminerad.
- Supabase Security Advisor-felen för security-definer-vyer utvärderade och åtgärdade.
- Leaked password protection aktiverad och sessions-/retentionsplan beslutad.
- Previewdeployment godkänd. Ingen produktionsdeploy utan uttryckligt godkännande.
