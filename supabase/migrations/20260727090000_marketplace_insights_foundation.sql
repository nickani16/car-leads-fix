begin;

create table if not exists public.marketplace_price_estimates (
  listing_id uuid primary key references public.marketplace_listings(id) on delete cascade,
  category text not null,
  market_code text,
  currency text not null,
  estimated_price numeric,
  low_price numeric,
  high_price numeric,
  sample_size integer not null default 0,
  confidence_score numeric not null default 0,
  price_difference_percent numeric,
  price_status text not null default 'insufficient_data',
  matching_criteria jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_price_estimates_status_check
    check (price_status in ('good_price', 'fair_price', 'high_price', 'insufficient_data')),
  constraint marketplace_price_estimates_sample_size_check
    check (sample_size >= 0),
  constraint marketplace_price_estimates_confidence_check
    check (confidence_score >= 0 and confidence_score <= 1)
);

create index if not exists marketplace_price_estimates_category_market_idx
  on public.marketplace_price_estimates (category, market_code, calculated_at desc);

create index if not exists marketplace_price_estimates_status_idx
  on public.marketplace_price_estimates (price_status, calculated_at desc);

alter table public.marketplace_price_estimates enable row level security;

revoke all on public.marketplace_price_estimates from anon, authenticated;
grant all on public.marketplace_price_estimates to service_role;

create table if not exists public.saved_search_alert_deliveries (
  id uuid primary key default gen_random_uuid(),
  saved_search_id uuid not null references public.marketplace_saved_searches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid references public.marketplace_listings(id) on delete set null,
  event_type text not null,
  channel text not null default 'email',
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  constraint saved_search_alert_deliveries_channel_check
    check (channel in ('email', 'in_app', 'push')),
  constraint saved_search_alert_deliveries_status_check
    check (status in ('pending', 'sent', 'skipped', 'failed'))
);

create unique index if not exists saved_search_alert_deliveries_dedupe_idx
  on public.saved_search_alert_deliveries (saved_search_id, listing_id, event_type, channel)
  where listing_id is not null;

create index if not exists saved_search_alert_deliveries_user_idx
  on public.saved_search_alert_deliveries (user_id, created_at desc);

create index if not exists saved_search_alert_deliveries_status_idx
  on public.saved_search_alert_deliveries (status, created_at);

alter table public.saved_search_alert_deliveries enable row level security;

drop policy if exists saved_search_alert_deliveries_select_own on public.saved_search_alert_deliveries;
create policy saved_search_alert_deliveries_select_own
  on public.saved_search_alert_deliveries for select to authenticated
  using (auth.uid() = user_id);

revoke all on public.saved_search_alert_deliveries from anon;
grant select on public.saved_search_alert_deliveries to authenticated;
grant all on public.saved_search_alert_deliveries to service_role;

create table if not exists public.marketplace_listing_analytics_daily (
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  metric_date date not null,
  seller_user_id uuid references auth.users(id) on delete set null,
  views integer not null default 0,
  unique_views integer not null default 0,
  search_clicks integer not null default 0,
  saves integer not null default 0,
  unsaves integer not null default 0,
  enquiries integer not null default 0,
  phone_reveals integer not null default 0,
  website_clicks integer not null default 0,
  shares integer not null default 0,
  comparisons integer not null default 0,
  price_alert_matches integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (listing_id, metric_date),
  constraint marketplace_listing_analytics_daily_non_negative_check
    check (
      views >= 0 and unique_views >= 0 and search_clicks >= 0 and saves >= 0
      and unsaves >= 0 and enquiries >= 0 and phone_reveals >= 0
      and website_clicks >= 0 and shares >= 0 and comparisons >= 0
      and price_alert_matches >= 0
    )
);

create index if not exists marketplace_listing_analytics_daily_seller_idx
  on public.marketplace_listing_analytics_daily (seller_user_id, metric_date desc);

alter table public.marketplace_listing_analytics_daily enable row level security;

drop policy if exists marketplace_listing_analytics_daily_select_seller on public.marketplace_listing_analytics_daily;
create policy marketplace_listing_analytics_daily_select_seller
  on public.marketplace_listing_analytics_daily for select to authenticated
  using (auth.uid() = seller_user_id);

revoke all on public.marketplace_listing_analytics_daily from anon;
grant select on public.marketplace_listing_analytics_daily to authenticated;
grant all on public.marketplace_listing_analytics_daily to service_role;

create table if not exists public.marketplace_listing_comparison_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, listing_id),
  constraint marketplace_listing_comparison_items_position_check
    check (position >= 0 and position <= 9)
);

create index if not exists marketplace_listing_comparison_items_user_idx
  on public.marketplace_listing_comparison_items (user_id, position, created_at desc);

alter table public.marketplace_listing_comparison_items enable row level security;

drop policy if exists marketplace_listing_comparison_items_select_own on public.marketplace_listing_comparison_items;
create policy marketplace_listing_comparison_items_select_own
  on public.marketplace_listing_comparison_items for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists marketplace_listing_comparison_items_insert_own on public.marketplace_listing_comparison_items;
create policy marketplace_listing_comparison_items_insert_own
  on public.marketplace_listing_comparison_items for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists marketplace_listing_comparison_items_update_own on public.marketplace_listing_comparison_items;
create policy marketplace_listing_comparison_items_update_own
  on public.marketplace_listing_comparison_items for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists marketplace_listing_comparison_items_delete_own on public.marketplace_listing_comparison_items;
create policy marketplace_listing_comparison_items_delete_own
  on public.marketplace_listing_comparison_items for delete to authenticated
  using (auth.uid() = user_id);

revoke all on public.marketplace_listing_comparison_items from anon;
grant select, insert, update, delete on public.marketplace_listing_comparison_items to authenticated;
grant all on public.marketplace_listing_comparison_items to service_role;

create table if not exists public.marketplace_vehicle_profile_stats (
  id uuid primary key default gen_random_uuid(),
  market_code text not null,
  category text not null,
  make text not null,
  model text not null,
  listing_count integer not null default 0,
  price_min numeric,
  price_max numeric,
  price_median numeric,
  price_average numeric,
  common_years jsonb not null default '[]'::jsonb,
  common_fuel_types jsonb not null default '[]'::jsonb,
  common_gearboxes jsonb not null default '[]'::jsonb,
  common_variants jsonb not null default '[]'::jsonb,
  latest_listing_ids uuid[] not null default '{}'::uuid[],
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_vehicle_profile_stats_listing_count_check
    check (listing_count >= 0)
);

create unique index if not exists marketplace_vehicle_profile_stats_lookup_idx
  on public.marketplace_vehicle_profile_stats (market_code, category, lower(make), lower(model));

create index if not exists marketplace_vehicle_profile_stats_category_idx
  on public.marketplace_vehicle_profile_stats (category, calculated_at desc);

alter table public.marketplace_vehicle_profile_stats enable row level security;

revoke all on public.marketplace_vehicle_profile_stats from anon, authenticated;
grant all on public.marketplace_vehicle_profile_stats to service_role;

create index if not exists marketplace_listing_events_event_created_idx
  on public.marketplace_listing_events (event_type, created_at desc);

create index if not exists marketplace_listings_insights_make_model_idx
  on public.marketplace_listings (category, lower(make), lower(model), country_code, status, published_at desc)
  where status = 'published';

commit;
