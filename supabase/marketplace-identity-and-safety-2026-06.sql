begin;

alter table public.marketplace_profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists birth_date date,
  add column if not exists address_line_1 text,
  add column if not exists address_line_2 text,
  add column if not exists region text,
  add column if not exists national_id_hash text,
  add column if not exists national_id_last4 text,
  add column if not exists identity_status text not null default 'pending',
  add column if not exists business_verification_status text,
  add column if not exists vat_verified_at timestamptz,
  add column if not exists risk_status text not null default 'standard',
  add column if not exists verification_updated_at timestamptz;

alter table public.marketplace_profiles
  drop constraint if exists marketplace_profiles_identity_status_check;
alter table public.marketplace_profiles
  add constraint marketplace_profiles_identity_status_check
  check (identity_status in ('pending','format_validated','verified','needs_review','rejected'));

alter table public.marketplace_profiles
  drop constraint if exists marketplace_profiles_business_verification_check;
alter table public.marketplace_profiles
  add constraint marketplace_profiles_business_verification_check
  check (
    business_verification_status is null
    or business_verification_status in ('pending','vat_validated','verified','needs_review','rejected')
  );

alter table public.marketplace_profiles
  drop constraint if exists marketplace_profiles_risk_status_check;
alter table public.marketplace_profiles
  add constraint marketplace_profiles_risk_status_check
  check (risk_status in ('standard','review','restricted','blocked'));

create table if not exists public.marketplace_identity_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_type text not null check (check_type in ('private_id_format','business_vat','manual_review')),
  country_code text not null,
  status text not null check (status in ('passed','pending','failed','unavailable')),
  provider text not null,
  reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.marketplace_identity_checks enable row level security;
revoke all on public.marketplace_identity_checks from anon, authenticated;
drop policy if exists marketplace_identity_checks_deny_users on public.marketplace_identity_checks;
create policy marketplace_identity_checks_deny_users
  on public.marketplace_identity_checks for all to authenticated
  using (false)
  with check (false);

alter table public.marketplace_reports
  add column if not exists transaction_reference text,
  add column if not exists counterparty_name text,
  add column if not exists occurred_at timestamptz,
  add column if not exists amount numeric(14,2),
  add column if not exists currency text,
  add column if not exists contact_phone text;

create index if not exists marketplace_identity_checks_user_idx
  on public.marketplace_identity_checks (user_id, created_at desc);

create unique index if not exists marketplace_profiles_national_id_unique_idx
  on public.marketplace_profiles (country_code, national_id_hash)
  where national_id_hash is not null;

create unique index if not exists marketplace_profiles_business_registration_unique_idx
  on public.marketplace_profiles (country_code, registration_number)
  where account_type = 'business' and registration_number is not null;

commit;
