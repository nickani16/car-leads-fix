alter table public.marketplace_profiles
  add column if not exists suspended boolean not null default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists removed_by_admin boolean not null default false;

create index if not exists marketplace_profiles_deleted_at_idx
  on public.marketplace_profiles (deleted_at)
  where deleted_at is not null;
