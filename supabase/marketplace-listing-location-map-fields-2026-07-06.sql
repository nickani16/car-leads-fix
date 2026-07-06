alter table public.marketplace_listings
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists country text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

update public.marketplace_listings
set country = coalesce(nullif(country, ''), country_code)
where nullif(country, '') is null
  and country_code is not null;

create index if not exists marketplace_listings_location_coordinates_idx
  on public.marketplace_listings (latitude, longitude)
  where latitude is not null and longitude is not null;
