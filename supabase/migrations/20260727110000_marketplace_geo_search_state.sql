-- Marketplace geo search state foundation.
-- This migration is intentionally additive so it can be verified in preview/staging
-- before any production database change is approved.

alter table public.geo_regions
  add column if not exists centroid_lat double precision,
  add column if not exists centroid_lng double precision,
  add column if not exists bounds jsonb,
  add column if not exists polygon jsonb,
  add column if not exists aliases text[] not null default '{}';

alter table public.geo_places
  add column if not exists centroid_lat double precision,
  add column if not exists centroid_lng double precision,
  add column if not exists bounds jsonb,
  add column if not exists polygon jsonb,
  add column if not exists aliases text[] not null default '{}';

alter table public.marketplace_listings
  add column if not exists geo_area_id text,
  add column if not exists geo_region_code text,
  add column if not exists geo_municipality_code text,
  add column if not exists geo_locality_code text;

create index if not exists geo_regions_country_slug_idx
  on public.geo_regions(country_code, slug);

create index if not exists geo_regions_aliases_gin_idx
  on public.geo_regions using gin(aliases);

create index if not exists geo_places_country_slug_idx
  on public.geo_places(country_code, slug);

create index if not exists geo_places_aliases_gin_idx
  on public.geo_places using gin(aliases);

create index if not exists marketplace_listings_geo_area_idx
  on public.marketplace_listings(geo_area_id)
  where geo_area_id is not null;

create index if not exists marketplace_listings_geo_region_idx
  on public.marketplace_listings(country_code, geo_region_code)
  where geo_region_code is not null;

create index if not exists marketplace_listings_geo_municipality_idx
  on public.marketplace_listings(country_code, geo_municipality_code)
  where geo_municipality_code is not null;

create index if not exists marketplace_listings_geo_locality_idx
  on public.marketplace_listings(country_code, geo_locality_code)
  where geo_locality_code is not null;

create index if not exists marketplace_listings_lat_lng_idx
  on public.marketplace_listings(latitude, longitude)
  where latitude is not null and longitude is not null;
