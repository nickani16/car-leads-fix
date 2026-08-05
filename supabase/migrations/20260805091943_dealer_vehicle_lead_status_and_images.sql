alter table public.dealer_vehicle_leads
  drop constraint if exists dealer_vehicle_leads_status_check;

alter table public.dealer_vehicle_leads
  add constraint dealer_vehicle_leads_status_check
  check (status in ('new', 'contacted', 'offer_sent', 'accepted', 'closed', 'archived'));

create table if not exists public.dealer_vehicle_lead_images (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.dealer_vehicle_leads(id) on delete cascade,
  image_type text not null,
  label text not null,
  position integer not null default 0,
  webp_url text not null,
  avif_url text not null,
  storage_webp_path text not null,
  storage_avif_path text not null,
  width integer,
  height integer,
  original_filename text,
  created_at timestamptz not null default now(),
  unique (lead_id, image_type)
);

create index if not exists dealer_vehicle_lead_images_lead_idx
  on public.dealer_vehicle_lead_images (lead_id, position);

alter table public.dealer_vehicle_lead_images enable row level security;
revoke all on public.dealer_vehicle_lead_images from anon, authenticated;
grant select on public.dealer_vehicle_lead_images to authenticated;

drop policy if exists dealer_vehicle_lead_images_select_growth_company on public.dealer_vehicle_lead_images;
create policy dealer_vehicle_lead_images_select_growth_company
  on public.dealer_vehicle_lead_images for select
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
