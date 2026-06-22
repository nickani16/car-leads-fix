begin;

create table if not exists public.auth_email_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_hash text not null,
  code_hash text not null,
  purpose text not null default 'sign_in' check (purpose in ('sign_in')),
  attempts integer not null default 0 check (attempts between 0 and 10),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.auth_email_codes enable row level security;
revoke all on table public.auth_email_codes from anon, authenticated;

create index if not exists auth_email_codes_lookup_idx
  on public.auth_email_codes (email_hash, created_at desc)
  where consumed_at is null;

create index if not exists auth_email_codes_expiry_idx
  on public.auth_email_codes (expires_at);

commit;
