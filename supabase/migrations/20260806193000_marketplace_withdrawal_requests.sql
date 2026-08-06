create table if not exists public.marketplace_withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  order_reference text not null,
  contract_date date,
  message text,
  locale text not null default 'en',
  source_path text,
  status text not null default 'received',
  confirmation_email_status text not null default 'pending',
  internal_email_status text not null default 'pending',
  received_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_withdrawal_status_check check (
    status = any (array['received','processing','accepted','rejected','completed']::text[])
  ),
  constraint marketplace_withdrawal_confirmation_status_check check (
    confirmation_email_status = any (array['pending','sent','failed','skipped']::text[])
  ),
  constraint marketplace_withdrawal_internal_status_check check (
    internal_email_status = any (array['pending','sent','failed','skipped']::text[])
  ),
  constraint marketplace_withdrawal_email_check check (
    email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  )
);

create index if not exists marketplace_withdrawal_received_idx
  on public.marketplace_withdrawal_requests (received_at desc);

create index if not exists marketplace_withdrawal_status_idx
  on public.marketplace_withdrawal_requests (status, received_at desc);

create index if not exists marketplace_withdrawal_user_idx
  on public.marketplace_withdrawal_requests (user_id);

alter table public.marketplace_withdrawal_requests enable row level security;

revoke all on table public.marketplace_withdrawal_requests from anon, authenticated;
grant all on table public.marketplace_withdrawal_requests to service_role;
