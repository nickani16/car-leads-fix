create table if not exists public.dealer_vehicle_leads (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  vin text,
  make text,
  model text,
  model_year integer,
  details text,
  status text not null default 'new' check (status in ('new', 'contacted', 'offer_sent', 'closed', 'archived')),
  source_path text,
  assigned_company_id uuid,
  assigned_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dealer_vehicle_leads_vehicle_identity_check
    check (
      (vin is not null and vin ~ '^[A-HJ-NPR-Z0-9]{17}$')
      or (make is not null and length(make) >= 2 and model is not null and model_year is not null)
    )
);

create index if not exists dealer_vehicle_leads_created_idx
  on public.dealer_vehicle_leads (created_at desc);

create index if not exists dealer_vehicle_leads_status_idx
  on public.dealer_vehicle_leads (status, created_at desc);

alter table public.dealer_vehicle_leads enable row level security;
revoke all on public.dealer_vehicle_leads from anon, authenticated;

grant select on public.dealer_vehicle_leads to authenticated;

drop policy if exists dealer_vehicle_leads_select_growth_company on public.dealer_vehicle_leads;
create policy dealer_vehicle_leads_select_growth_company
  on public.dealer_vehicle_leads for select
  to authenticated
  using (
    exists (
      select 1
        from public.marketplace_profiles p
        join public.business_subscriptions s on s.user_id = p.user_id
       where p.user_id = auth.uid()
         and p.account_type = 'business'
         and lower(coalesce(s.plan_key, 'free')) in ('growth', 'professional', 'enterprise')
         and coalesce(s.status, '') in ('active', 'trialing')
    )
  );
