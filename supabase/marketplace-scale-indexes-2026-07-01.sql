-- Autorell marketplace scale indexes.
-- Intentionally not wrapped in a transaction: CREATE INDEX CONCURRENTLY cannot run inside one.
-- Run during a low-traffic window and verify with EXPLAIN ANALYZE before/after on production-size data.

create index concurrently if not exists marketplace_listings_status_created_idx
  on public.marketplace_listings (status, created_at desc);

create index concurrently if not exists marketplace_listings_category_status_created_idx
  on public.marketplace_listings (category, status, created_at desc);

create index concurrently if not exists marketplace_listings_status_country_created_idx
  on public.marketplace_listings (status, country_code, created_at desc);

create index concurrently if not exists marketplace_listings_country_category_status_idx
  on public.marketplace_listings (country_code, category, status);

create index concurrently if not exists marketplace_listings_category_country_price_idx
  on public.marketplace_listings (category, country_code, price)
  where status = 'published';

create index concurrently if not exists marketplace_listings_make_model_status_idx
  on public.marketplace_listings (make, model, status)
  where make is not null or model is not null;

create index concurrently if not exists marketplace_listings_price_status_idx
  on public.marketplace_listings (status, price);

create index concurrently if not exists marketplace_listings_year_status_idx
  on public.marketplace_listings (status, model_year);

create index concurrently if not exists marketplace_listings_mileage_status_idx
  on public.marketplace_listings (status, mileage_km);

create index concurrently if not exists marketplace_listings_fuel_status_idx
  on public.marketplace_listings (status, fuel_type);

create index concurrently if not exists marketplace_listings_gearbox_status_idx
  on public.marketplace_listings (status, gearbox);

create index concurrently if not exists marketplace_listings_seller_type_status_idx
  on public.marketplace_listings (status, seller_type);

create index concurrently if not exists marketplace_listings_published_active_idx
  on public.marketplace_listings (priority desc, published_at desc)
  where status = 'published';

create index concurrently if not exists marketplace_listings_expires_active_idx
  on public.marketplace_listings (expires_at)
  where expires_at is not null;

create index concurrently if not exists marketplace_profiles_user_id_idx
  on public.marketplace_profiles (user_id);

create index concurrently if not exists marketplace_profiles_company_id_idx
  on public.marketplace_profiles (company_id)
  where company_id is not null;
