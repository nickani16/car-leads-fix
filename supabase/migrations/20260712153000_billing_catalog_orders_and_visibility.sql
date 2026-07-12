begin;

alter table public.marketplace_listings
  add column if not exists sort_refreshed_at timestamptz,
  add column if not exists last_refreshed_at timestamptz,
  add column if not exists boost_started_at timestamptz,
  add column if not exists boost_expires_at timestamptz,
  add column if not exists boost_status text not null default 'inactive',
  add column if not exists boost_purchase_id uuid,
  add column if not exists featured_started_at timestamptz,
  add column if not exists featured_expires_at timestamptz,
  add column if not exists featured_status text not null default 'inactive',
  add column if not exists featured_purchase_id uuid,
  add column if not exists premium_badge_expires_at timestamptz;

alter table public.marketplace_listings drop constraint if exists marketplace_listings_boost_status_check;
alter table public.marketplace_listings
  add constraint marketplace_listings_boost_status_check
  check (boost_status in ('inactive', 'pending', 'active', 'expired', 'cancelled'));

alter table public.marketplace_listings drop constraint if exists marketplace_listings_featured_status_check;
alter table public.marketplace_listings
  add constraint marketplace_listings_featured_status_check
  check (featured_status in ('inactive', 'pending', 'active', 'expired', 'cancelled'));

create index if not exists marketplace_listings_top_placement_idx
  on public.marketplace_listings (country_code, category, boost_status, boost_expires_at, published_at desc)
  where status = 'published';

create index if not exists marketplace_listings_featured_idx
  on public.marketplace_listings (country_code, category, featured_status, featured_expires_at, published_at desc)
  where status = 'published';

create index if not exists marketplace_listings_refreshed_sort_idx
  on public.marketplace_listings (country_code, category, coalesce(sort_refreshed_at, published_at, created_at) desc, id desc)
  where status = 'published';

create table if not exists public.billing_product_prices (
  id uuid primary key default gen_random_uuid(),
  product_key text not null,
  market text not null check (market in ('se','de','fr','it','es','nl','be','at','fi','dk','pl')),
  currency text not null check (currency in ('sek','eur','dkk','pln')),
  amount_minor integer not null check (amount_minor >= 0),
  stripe_product_id text,
  stripe_price_id text,
  billing_type text not null check (billing_type in ('payment','subscription')),
  billing_interval text check (billing_interval in ('month')),
  tax_behavior text not null default 'unspecified' check (tax_behavior in ('inclusive','exclusive','unspecified')),
  price_display_mode text not null default 'unspecified' check (price_display_mode in ('inclusive','exclusive','unspecified')),
  active boolean not null default true,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_to > effective_from)
);

create unique index if not exists billing_product_prices_active_unique_idx
  on public.billing_product_prices (product_key, market)
  where active and effective_to is null;

alter table public.billing_product_prices enable row level security;
drop policy if exists billing_product_prices_public_read_active on public.billing_product_prices;
create policy billing_product_prices_public_read_active
  on public.billing_product_prices for select
  to anon, authenticated
  using (active and effective_from <= now() and (effective_to is null or effective_to > now()));
grant select on public.billing_product_prices to anon, authenticated;

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid,
  listing_id uuid references public.marketplace_listings(id) on delete set null,
  product_key text not null,
  market text not null check (market in ('se','de','fr','it','es','nl','be','at','fi','dk','pl')),
  currency text not null check (currency in ('sek','eur','dkk','pln')),
  amount_minor integer not null check (amount_minor >= 0),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_subscription_id text,
  status text not null default 'created' check (
    status in (
      'created','checkout_created','pending','paid','fulfilled','failed','expired',
      'refunded','partially_refunded','cancelled'
    )
  ),
  paid_at timestamptz,
  fulfilled_at timestamptz,
  refunded_at timestamptz,
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists payment_orders_checkout_session_uidx
  on public.payment_orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;
create unique index if not exists payment_orders_payment_intent_uidx
  on public.payment_orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;
create index if not exists payment_orders_user_idx
  on public.payment_orders (user_id, created_at desc);
create index if not exists payment_orders_listing_idx
  on public.payment_orders (listing_id, created_at desc);

alter table public.payment_orders enable row level security;
drop policy if exists payment_orders_select_own on public.payment_orders;
create policy payment_orders_select_own
  on public.payment_orders for select
  to authenticated
  using ((select auth.uid()) = user_id);
grant select on public.payment_orders to authenticated;

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  processing_status text not null default 'processing' check (processing_status in ('processing','processed','failed')),
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.stripe_webhook_events enable row level security;

alter table public.marketplace_listings drop constraint if exists marketplace_listings_boost_purchase_fk;
alter table public.marketplace_listings
  add constraint marketplace_listings_boost_purchase_fk
  foreign key (boost_purchase_id) references public.payment_orders(id) on delete set null;

alter table public.marketplace_listings drop constraint if exists marketplace_listings_featured_purchase_fk;
alter table public.marketplace_listings
  add constraint marketplace_listings_featured_purchase_fk
  foreign key (featured_purchase_id) references public.payment_orders(id) on delete set null;

revoke update (
  status,
  review_status,
  package_id,
  priority,
  published_at,
  expires_at,
  sort_refreshed_at,
  last_refreshed_at,
  boost_started_at,
  boost_expires_at,
  boost_status,
  boost_purchase_id,
  featured_started_at,
  featured_expires_at,
  featured_status,
  featured_purchase_id,
  premium_badge_expires_at
) on public.marketplace_listings from authenticated;

create table if not exists public.refresh_credit_balances (
  owner_type text not null check (owner_type in ('user','business')),
  owner_id uuid not null,
  refresh_credits integer not null default 0 check (refresh_credits >= 0),
  updated_at timestamptz not null default now(),
  primary key (owner_type, owner_id)
);

alter table public.refresh_credit_balances enable row level security;
drop policy if exists refresh_credit_balances_select_own_user on public.refresh_credit_balances;
create policy refresh_credit_balances_select_own_user
  on public.refresh_credit_balances for select
  to authenticated
  using (owner_type = 'user' and owner_id = (select auth.uid()));
grant select on public.refresh_credit_balances to authenticated;

create table if not exists public.refresh_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('user','business')),
  owner_id uuid not null,
  listing_id uuid references public.marketplace_listings(id) on delete set null,
  payment_order_id uuid references public.payment_orders(id) on delete set null,
  change integer not null,
  reason text not null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.refresh_credit_ledger enable row level security;
drop policy if exists refresh_credit_ledger_select_own_user on public.refresh_credit_ledger;
create policy refresh_credit_ledger_select_own_user
  on public.refresh_credit_ledger for select
  to authenticated
  using (owner_type = 'user' and owner_id = (select auth.uid()));
grant select on public.refresh_credit_ledger to authenticated;

create or replace function public.increment_refresh_credits(
  p_owner_type text,
  p_owner_id uuid,
  p_credits integer,
  p_payment_order_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_owner_type not in ('user', 'business') then
    raise exception 'Invalid owner type';
  end if;
  if p_credits <= 0 then
    raise exception 'Credits must be positive';
  end if;

  insert into public.refresh_credit_balances (owner_type, owner_id, refresh_credits, updated_at)
  values (p_owner_type, p_owner_id, p_credits, now())
  on conflict (owner_type, owner_id)
  do update
    set refresh_credits = public.refresh_credit_balances.refresh_credits + excluded.refresh_credits,
        updated_at = now();

  insert into public.refresh_credit_ledger (
    owner_type,
    owner_id,
    payment_order_id,
    change,
    reason
  )
  values (
    p_owner_type,
    p_owner_id,
    p_payment_order_id,
    p_credits,
    'purchase'
  );
end;
$$;

revoke all on function public.increment_refresh_credits(text, uuid, integer, uuid) from public;
grant execute on function public.increment_refresh_credits(text, uuid, integer, uuid) to service_role;

create or replace function public.use_refresh_credit(
  p_owner_type text,
  p_owner_id uuid,
  p_listing_id uuid,
  p_cooldown interval default interval '24 hours'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_listing public.marketplace_listings%rowtype;
begin
  if p_owner_type not in ('user', 'business') then
    raise exception 'Invalid owner type';
  end if;

  select *
    into v_listing
    from public.marketplace_listings
    where id = p_listing_id
    for update;

  if not found then
    raise exception 'Listing not found';
  end if;
  if p_owner_type = 'user' and v_listing.seller_user_id <> p_owner_id then
    raise exception 'Not allowed';
  end if;
  if v_listing.status <> 'published' then
    raise exception 'Only published listings can be refreshed';
  end if;
  if v_listing.last_refreshed_at is not null and v_listing.last_refreshed_at > now() - p_cooldown then
    raise exception 'Listing was refreshed too recently';
  end if;

  select refresh_credits
    into v_balance
    from public.refresh_credit_balances
    where owner_type = p_owner_type and owner_id = p_owner_id
    for update;

  if coalesce(v_balance, 0) <= 0 then
    raise exception 'No refresh credits available';
  end if;

  update public.refresh_credit_balances
    set refresh_credits = refresh_credits - 1,
        updated_at = now()
    where owner_type = p_owner_type and owner_id = p_owner_id;

  update public.marketplace_listings
    set sort_refreshed_at = now(),
        last_refreshed_at = now()
    where id = p_listing_id;

  insert into public.refresh_credit_ledger (
    owner_type,
    owner_id,
    listing_id,
    change,
    reason
  )
  values (
    p_owner_type,
    p_owner_id,
    p_listing_id,
    -1,
    'use'
  );
end;
$$;

revoke all on function public.use_refresh_credit(text, uuid, uuid, interval) from public;
grant execute on function public.use_refresh_credit(text, uuid, uuid, interval) to service_role;

create table if not exists public.payment_audit_log (
  id uuid primary key default gen_random_uuid(),
  payment_order_id uuid references public.payment_orders(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  listing_id uuid references public.marketplace_listings(id) on delete set null,
  action text not null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.payment_audit_log enable row level security;
drop policy if exists payment_audit_log_select_own on public.payment_audit_log;
create policy payment_audit_log_select_own
  on public.payment_audit_log for select
  to authenticated
  using ((select auth.uid()) = user_id);
grant select on public.payment_audit_log to authenticated;

create table if not exists public.business_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid,
  product_key text not null,
  market text not null check (market in ('se','de','fr','it','es','nl','be','at','fi','dk','pl')),
  currency text not null check (currency in ('sek','eur','dkk','pln')),
  plan_key text not null check (plan_key in ('starter','growth','professional','enterprise')),
  active_listing_limit integer check (active_listing_limit > 0),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  payment_warning_at timestamptz,
  grace_period_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_subscriptions enable row level security;
drop policy if exists business_subscriptions_select_own_user on public.business_subscriptions;
create policy business_subscriptions_select_own_user
  on public.business_subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);
grant select on public.business_subscriptions to authenticated;

commit;
