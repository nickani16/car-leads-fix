# Current Production

Last verified working production deployment:

- Project: `car-leads-fix`
- Production domain: `https://www.autorell.com`
- Deployment ID: `dpl_448BDVg8gxZJGTvThieHysuVe4Xs`
- Deployment URL: `https://car-leads-mvbum17rj-nikolais-projects-2c714694.vercel.app`
- Source branch metadata: `codex/autorell-mobile-foundation`
- Source commit metadata: `d0dfb7136a98194921dd2f64d0382d5b7f651f69`
- Commit message: `Redesign benefits seller page`
- Deployment source: Vercel CLI
- Vercel `gitDirty`: `1`
- Verification date: 2026-07-22

Important live routes verified against `dpl_448BDVg8gxZJGTvThieHysuVe4Xs`:

- `/se`
- `/se/marketplace`
- `/se/sell-car`
- `/se/sell-van`
- `/se/sell-construction`
- `/se/pricing`
- `/se/sell-vehicle`
- `/se/account`
- `/se/vehicle-news`

Active markets are represented through market-prefixed routes and localized public copy for Sweden, Denmark, Finland, Germany, Austria, Belgium, France, Spain, Italy, Netherlands, Poland, and English/default.

Migration status: baseline includes `supabase/migrations/20260720120000_listing_offer_and_structured_data.sql`. Production migration application must be confirmed before any new production deploy.

Known limitations:

- The verified production deployment was dirty, so `d0dfb713` alone cannot reproduce production.
- Local production build requires Supabase URL, anon key, and admin/service-role env variables.
