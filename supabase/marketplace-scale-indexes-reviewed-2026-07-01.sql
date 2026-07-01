-- Autorell marketplace scale indexes - reviewed production candidate.
--
-- Status: NOT executed by Codex.
-- Purpose: fill the gaps found in the 2026-07-01 read-only Supabase preflight.
-- Important: run during a low-traffic window. CREATE INDEX CONCURRENTLY cannot
-- run inside a transaction block.
--
-- Existing production indexes already cover:
-- - marketplace_listings_public_idx: status, category, priority desc, published_at desc
-- - marketplace_listings_search_idx: GIN to_tsvector search
-- - marketplace_listings_seller_idx: seller_user_id, created_at desc
-- - marketplace_listings_country_price_idx: country_code, currency, price
-- - marketplace_listings_review_idx: review_status, risk_score desc, created_at desc
-- - marketplace_companies_status_idx: verification_status, country_code, created_at desc
--
-- Therefore this file intentionally avoids duplicate versions of those indexes.

-- Public country/category pages and "local listings first" ordering.
create index concurrently if not exists marketplace_listings_published_country_category_rank_idx
  on public.marketplace_listings (country_code, category, priority desc, published_at desc)
  where status = 'published';

create index concurrently if not exists marketplace_listings_published_country_rank_idx
  on public.marketplace_listings (country_code, priority desc, published_at desc)
  where status = 'published';

-- Marketplace filters planned for large result sets.
create index concurrently if not exists marketplace_listings_published_category_country_price_idx
  on public.marketplace_listings (category, country_code, price)
  where status = 'published' and price is not null;

create index concurrently if not exists marketplace_listings_published_category_country_year_idx
  on public.marketplace_listings (category, country_code, model_year)
  where status = 'published' and model_year is not null;

create index concurrently if not exists marketplace_listings_published_category_country_mileage_idx
  on public.marketplace_listings (category, country_code, mileage_km)
  where status = 'published' and mileage_km is not null;

create index concurrently if not exists marketplace_listings_published_category_country_fuel_idx
  on public.marketplace_listings (category, country_code, fuel_type)
  where status = 'published' and fuel_type is not null;

create index concurrently if not exists marketplace_listings_published_category_country_gearbox_idx
  on public.marketplace_listings (category, country_code, gearbox)
  where status = 'published' and gearbox is not null;

create index concurrently if not exists marketplace_listings_published_category_country_body_idx
  on public.marketplace_listings (category, country_code, body_type)
  where status = 'published' and body_type is not null;

create index concurrently if not exists marketplace_listings_published_category_country_color_idx
  on public.marketplace_listings (category, country_code, color)
  where status = 'published' and color is not null;

create index concurrently if not exists marketplace_listings_published_category_country_seller_type_idx
  on public.marketplace_listings (category, country_code, seller_type)
  where status = 'published' and seller_type is not null;

-- Admin listing overview when no status/category filter is selected.
create index concurrently if not exists marketplace_listings_created_at_idx
  on public.marketplace_listings (created_at desc);

-- Expiry sweeps and active-listing checks.
create index concurrently if not exists marketplace_listings_published_expires_idx
  on public.marketplace_listings (expires_at)
  where status = 'published' and expires_at is not null;

-- Company/profile lookups not covered by the current primary key/indexes.
create index concurrently if not exists marketplace_profiles_company_id_idx
  on public.marketplace_profiles (company_id)
  where company_id is not null;

create index concurrently if not exists marketplace_company_members_company_role_idx
  on public.marketplace_company_members (company_id, role);
