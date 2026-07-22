alter table public.marketplace_listings
  add column if not exists offer_type text not null default 'sale',
  add column if not exists lease_data jsonb not null default '{}'::jsonb,
  add column if not exists structured_data jsonb not null default '{}'::jsonb,
  add column if not exists search_document text not null default '';

alter table public.marketplace_listings
  drop constraint if exists marketplace_listings_offer_type_check;

alter table public.marketplace_listings
  add constraint marketplace_listings_offer_type_check
  check (offer_type in ('sale', 'lease', 'sale_and_lease'));

create index if not exists marketplace_listings_offer_type_idx
  on public.marketplace_listings (offer_type)
  where status = 'published';

create index if not exists marketplace_listings_structured_data_gin_idx
  on public.marketplace_listings using gin (structured_data);

create index if not exists marketplace_listings_search_document_idx
  on public.marketplace_listings using gin (to_tsvector('simple', search_document));

create index if not exists marketplace_listings_lease_data_gin_idx
  on public.marketplace_listings using gin (lease_data);

update public.marketplace_listings
set search_document = lower(trim(concat_ws(' ',
  category, title, make, model, variant, fuel_type, gearbox, body_type,
  color, condition, equipment, city, municipality, offer_type
)))
where search_document = '';
