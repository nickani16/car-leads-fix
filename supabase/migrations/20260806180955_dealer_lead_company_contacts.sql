create table if not exists public.dealer_vehicle_lead_company_contacts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.dealer_vehicle_leads(id) on delete cascade,
  company_id uuid not null references public.marketplace_companies(id) on delete cascade,
  contacted_by_user_id uuid references auth.users(id) on delete set null,
  contacted_by_name text not null,
  contacted_by_email text,
  contact_method text not null default 'other',
  contacted_at timestamptz not null default now(),
  hide_after timestamptz not null default (now() + interval '24 hours'),
  updated_at timestamptz not null default now(),
  constraint dealer_vehicle_lead_company_contacts_lead_company_key unique (lead_id, company_id),
  constraint dealer_vehicle_lead_company_contacts_name_check
    check (char_length(btrim(contacted_by_name)) between 1 and 160),
  constraint dealer_vehicle_lead_company_contacts_email_check
    check (contacted_by_email is null or char_length(contacted_by_email) <= 320),
  constraint dealer_vehicle_lead_company_contacts_method_check
    check (contact_method in ('phone', 'email', 'message', 'other')),
  constraint dealer_vehicle_lead_company_contacts_hide_after_check
    check (hide_after = contacted_at + interval '24 hours')
);

create index if not exists dealer_vehicle_lead_company_contacts_company_hide_idx
  on public.dealer_vehicle_lead_company_contacts (company_id, hide_after, contacted_at desc);

create index if not exists dealer_vehicle_lead_company_contacts_lead_idx
  on public.dealer_vehicle_lead_company_contacts (lead_id, company_id);

create index if not exists dealer_vehicle_lead_company_contacts_contacted_by_idx
  on public.dealer_vehicle_lead_company_contacts (contacted_by_user_id);

comment on table public.dealer_vehicle_lead_company_contacts is
  'Company-scoped audit record for dealer seller contact. Leads remain visible for 24 hours after contact.';

alter table public.dealer_vehicle_lead_company_contacts enable row level security;

revoke all on table public.dealer_vehicle_lead_company_contacts from public, anon, authenticated;
grant select, insert, update, delete on table public.dealer_vehicle_lead_company_contacts to service_role;
