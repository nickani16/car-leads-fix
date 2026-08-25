alter table public.marketplace_listings
  add column if not exists insurance_offers jsonb not null default '[]'::jsonb;

create index if not exists marketplace_listings_insurance_offers_gin_idx
  on public.marketplace_listings using gin (insurance_offers);
