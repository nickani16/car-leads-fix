alter table public.marketplace_listings
  add column if not exists location_source text not null default 'verified',
  add column if not exists geo_place_code text,
  add column if not exists geo_area_id text,
  add column if not exists geo_region_code text,
  add column if not exists geo_municipality_code text,
  add column if not exists geo_locality_code text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.marketplace_listings'::regclass
      and conname = 'marketplace_listings_location_source_check'
  ) then
    alter table public.marketplace_listings
      add constraint marketplace_listings_location_source_check
      check (location_source in ('verified', 'manual', 'unverified'));
  end if;
end
$$;

create index if not exists marketplace_listings_geo_place_idx
  on public.marketplace_listings (country_code, geo_place_code)
  where geo_place_code is not null;

create index if not exists marketplace_listings_geo_area_idx
  on public.marketplace_listings (geo_area_id)
  where geo_area_id is not null;

create index if not exists marketplace_listings_geo_region_idx
  on public.marketplace_listings (country_code, geo_region_code)
  where geo_region_code is not null;

create index if not exists marketplace_listings_geo_municipality_idx
  on public.marketplace_listings (country_code, geo_municipality_code)
  where geo_municipality_code is not null;

create index if not exists marketplace_listings_geo_locality_idx
  on public.marketplace_listings (country_code, geo_locality_code)
  where geo_locality_code is not null;

create index if not exists marketplace_listings_lat_lng_idx
  on public.marketplace_listings (latitude, longitude)
  where latitude is not null and longitude is not null;
