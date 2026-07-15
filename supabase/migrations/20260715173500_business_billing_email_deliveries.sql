alter table public.business_invoices
  add column if not exists due_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.business_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  delivery_key text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.business_subscriptions(id) on delete set null,
  invoice_id text,
  email_type text not null check (email_type in (
    'welcome',
    'invoice_ready',
    'payment_receipt',
    'payment_failed',
    'invoice_reminder',
    'account_blocked'
  )),
  recipient_email text not null,
  status text not null default 'processing' check (status in ('processing','sent','failed','skipped')),
  provider_message_id text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_email_deliveries_user_idx
  on public.business_email_deliveries (user_id, created_at desc);

create index if not exists business_email_deliveries_invoice_type_idx
  on public.business_email_deliveries (invoice_id, email_type, created_at desc);

alter table public.business_email_deliveries enable row level security;
revoke all on public.business_email_deliveries from anon, authenticated;

drop policy if exists business_email_deliveries_select_own on public.business_email_deliveries;
create policy business_email_deliveries_select_own
  on public.business_email_deliveries for select
  to authenticated
  using ((select auth.uid()) = user_id);

grant select on public.business_email_deliveries to authenticated;
