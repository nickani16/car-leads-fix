alter table public.dealer_vehicle_leads
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text;

create index if not exists dealer_vehicle_leads_contact_email_idx
  on public.dealer_vehicle_leads (lower(contact_email), created_at desc);
