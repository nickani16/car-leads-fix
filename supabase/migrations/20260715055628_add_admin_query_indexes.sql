begin;

create index if not exists marketplace_profiles_admin_directory_idx
  on public.marketplace_profiles (account_type, country_code, created_at desc);

create index if not exists marketplace_listings_admin_status_idx
  on public.marketplace_listings (status, created_at desc);

create index if not exists marketplace_listings_admin_review_idx
  on public.marketplace_listings (review_status, created_at desc);

create index if not exists marketplace_listings_admin_market_category_idx
  on public.marketplace_listings (country_code, category, status, created_at desc);

create index if not exists marketplace_listings_admin_seller_idx
  on public.marketplace_listings (seller_user_id, created_at desc);

create index if not exists payment_orders_admin_status_idx
  on public.payment_orders (status, created_at desc);

create index if not exists payment_orders_admin_user_idx
  on public.payment_orders (user_id, created_at desc);

create index if not exists marketplace_companies_admin_verification_idx
  on public.marketplace_companies (verification_status, updated_at desc);

commit;
