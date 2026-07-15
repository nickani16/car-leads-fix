begin;

alter table public.marketplace_profiles
  add column if not exists business_onboarding_status text;

update public.marketplace_profiles
set business_onboarding_status = case
  when account_type <> 'business' then null
  when business_verification_status in ('verified','vat_validated') then 'subscription_pending'
  when business_verification_status in ('rejected') then 'suspended'
  else 'under_review'
end
where business_onboarding_status is null;

alter table public.marketplace_profiles
  drop constraint if exists marketplace_profiles_business_onboarding_status_check;
alter table public.marketplace_profiles
  add constraint marketplace_profiles_business_onboarding_status_check
  check (business_onboarding_status is null or business_onboarding_status in
    ('draft','submitted','under_review','approved','subscription_pending','payment_pending','active','suspended','expired','cancelled'));

alter table public.business_subscriptions
  add column if not exists payment_status text not null default 'pending',
  add column if not exists manually_activated boolean not null default false,
  add column if not exists temporary_quota integer,
  add column if not exists free_period_ends_at timestamptz,
  add column if not exists next_billing_at timestamptz;

alter table public.business_subscriptions
  drop constraint if exists business_subscriptions_payment_status_check;
alter table public.business_subscriptions
  add constraint business_subscriptions_payment_status_check
  check (payment_status in ('pending','paid','failed','refunded','not_required'));

create table if not exists public.business_subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.business_subscriptions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  from_plan text,
  to_plan text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.business_subscription_events enable row level security;
revoke all on public.business_subscription_events from anon, authenticated;
create policy business_subscription_events_select_own on public.business_subscription_events
  for select to authenticated using ((select auth.uid()) = user_id);
grant select on public.business_subscription_events to authenticated;

create table if not exists public.business_invoices (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.business_subscriptions(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_invoice_id text unique,
  invoice_number text,
  hosted_invoice_url text,
  pdf_url text,
  amount_minor integer not null default 0,
  currency text not null default 'sek',
  status text not null default 'open',
  issued_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.business_invoices enable row level security;
revoke all on public.business_invoices from anon, authenticated;
create policy business_invoices_select_own on public.business_invoices
  for select to authenticated using ((select auth.uid()) = user_id);
grant select on public.business_invoices to authenticated;

create index if not exists marketplace_profiles_business_onboarding_idx
  on public.marketplace_profiles (account_type, business_onboarding_status);

commit;
