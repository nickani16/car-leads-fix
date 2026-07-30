begin;

create table if not exists public.marketplace_company_locations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.marketplace_companies(id) on delete cascade,
  name text not null,
  slug text,
  location_type text not null default 'branch',
  country_code text,
  region text,
  municipality text,
  city text,
  postal_code text,
  address_line_1 text,
  address_line_2 text,
  latitude numeric,
  longitude numeric,
  contact_name text,
  contact_email text,
  contact_phone text,
  website_url text,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_company_locations_type_check
    check (location_type in ('headquarters', 'branch', 'storage', 'showroom', 'service', 'other'))
);

create unique index if not exists marketplace_company_locations_company_slug_idx
  on public.marketplace_company_locations (company_id, lower(slug))
  where slug is not null;

create unique index if not exists marketplace_company_locations_primary_idx
  on public.marketplace_company_locations (company_id)
  where is_primary = true;

create index if not exists marketplace_company_locations_company_active_idx
  on public.marketplace_company_locations (company_id, is_active, name);

create index if not exists marketplace_company_locations_geo_idx
  on public.marketplace_company_locations (country_code, region, municipality, city)
  where is_active = true;

alter table public.marketplace_company_locations enable row level security;

drop policy if exists marketplace_company_locations_select_company_members on public.marketplace_company_locations;
create policy marketplace_company_locations_select_company_members
  on public.marketplace_company_locations for select
  to authenticated
  using (
    exists (
      select 1
      from public.marketplace_company_members m
      where m.company_id = marketplace_company_locations.company_id
        and m.user_id = (select auth.uid())
    )
  );

revoke all on public.marketplace_company_locations from anon;
grant select on public.marketplace_company_locations to authenticated;
grant all on public.marketplace_company_locations to service_role;

commit;
