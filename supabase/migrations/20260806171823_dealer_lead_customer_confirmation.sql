create table public.dealer_vehicle_lead_customer_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.dealer_vehicle_leads(id) on delete cascade,
  recipient_email text not null,
  locale text not null default 'en',
  status text not null default 'processing',
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dealer_vehicle_lead_customer_email_status_check check (
    status = any (array['processing','sent','failed','skipped']::text[])
  ),
  constraint dealer_vehicle_lead_customer_email_recipient_check check (
    recipient_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  constraint dealer_vehicle_lead_customer_email_unique unique (lead_id)
);

create index dealer_vehicle_lead_customer_email_created_idx
  on public.dealer_vehicle_lead_customer_email_deliveries (created_at desc);

alter table public.dealer_vehicle_lead_customer_email_deliveries enable row level security;

revoke all on table public.dealer_vehicle_lead_customer_email_deliveries from anon, authenticated;
grant all on table public.dealer_vehicle_lead_customer_email_deliveries to service_role;
