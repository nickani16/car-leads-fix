alter table public.marketplace_profiles
  add column if not exists phone_verified boolean not null default false,
  add column if not exists phone_verification_status text not null default 'unverified',
  add column if not exists phone_risk_flags text[] not null default '{}'::text[];

alter table public.marketplace_profiles
  drop constraint if exists marketplace_profiles_phone_verification_status_check;

alter table public.marketplace_profiles
  add constraint marketplace_profiles_phone_verification_status_check
  check (phone_verification_status in ('unverified', 'format_valid', 'country_mismatch', 'invalid_format', 'verified'));

alter table public.marketplace_identity_checks
  drop constraint if exists marketplace_identity_checks_check_type_check;

alter table public.marketplace_identity_checks
  add constraint marketplace_identity_checks_check_type_check
  check (check_type in ('private_id_format','business_vat','manual_review','phone_format'));

create index if not exists marketplace_profiles_phone_risk_idx
  on public.marketplace_profiles using gin (phone_risk_flags);

create index if not exists marketplace_profiles_phone_validation_idx
  on public.marketplace_profiles (phone_verified, phone_verification_status);
