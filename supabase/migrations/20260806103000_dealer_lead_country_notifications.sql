alter table public.dealer_vehicle_leads
  add column if not exists source_country_code text not null default 'SE',
  add column if not exists source_locale text not null default 'sv';

update public.dealer_vehicle_leads
set source_country_code = 'SE'
where source_country_code is null or btrim(source_country_code) = '';

alter table public.dealer_vehicle_leads
  drop constraint if exists dealer_vehicle_leads_source_country_code_check;

alter table public.dealer_vehicle_leads
  add constraint dealer_vehicle_leads_source_country_code_check
  check (source_country_code = any (array['DE','FR','IT','ES','NL','BE','SE','PL','AT','DK','FI']::text[]));

create index if not exists dealer_vehicle_leads_country_created_idx
  on public.dealer_vehicle_leads (source_country_code, created_at desc);

create table if not exists public.dealer_lead_notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.marketplace_companies(id) on delete set null,
  email_enabled boolean not null default true,
  notification_email text,
  all_countries boolean not null default false,
  country_codes text[] not null default '{}'::text[],
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dealer_lead_preferences_countries_check check (
    country_codes <@ array['DE','FR','IT','ES','NL','BE','SE','PL','AT','DK','FI']::text[]
  ),
  constraint dealer_lead_preferences_email_check check (
    notification_email is null or notification_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  )
);

create table if not exists public.dealer_vehicle_lead_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.dealer_vehicle_leads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_email text not null,
  locale text not null default 'en',
  status text not null default 'processing',
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dealer_vehicle_lead_email_status_check check (
    status = any (array['processing','sent','failed','skipped']::text[])
  ),
  constraint dealer_vehicle_lead_email_unique unique (lead_id, user_id)
);

create index if not exists dealer_vehicle_lead_email_user_created_idx
  on public.dealer_vehicle_lead_email_deliveries (user_id, created_at desc);

alter table public.dealer_lead_notification_preferences enable row level security;
alter table public.dealer_vehicle_lead_email_deliveries enable row level security;

revoke all on table public.dealer_lead_notification_preferences from anon;
revoke all on table public.dealer_vehicle_lead_email_deliveries from anon;
grant select, insert, update on table public.dealer_lead_notification_preferences to authenticated;
grant select on table public.dealer_vehicle_lead_email_deliveries to authenticated;

drop policy if exists dealer_lead_preferences_select_own on public.dealer_lead_notification_preferences;
create policy dealer_lead_preferences_select_own
on public.dealer_lead_notification_preferences
for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists dealer_lead_preferences_insert_own on public.dealer_lead_notification_preferences;
create policy dealer_lead_preferences_insert_own
on public.dealer_lead_notification_preferences
for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists dealer_lead_preferences_update_own on public.dealer_lead_notification_preferences;
create policy dealer_lead_preferences_update_own
on public.dealer_lead_notification_preferences
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists dealer_vehicle_lead_email_deliveries_select_own on public.dealer_vehicle_lead_email_deliveries;
create policy dealer_vehicle_lead_email_deliveries_select_own
on public.dealer_vehicle_lead_email_deliveries
for select to authenticated
using ((select auth.uid()) = user_id);

create schema if not exists private;

create or replace function private.can_current_user_access_dealer_lead_country(p_country_code text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.marketplace_profiles p
    join lateral (
      select s.plan_key, s.status, s.manually_activated, s.free_period_ends_at
      from public.business_subscriptions s
      where s.user_id = p.user_id
      order by s.updated_at desc
      limit 1
    ) s on true
    left join public.dealer_lead_notification_preferences pref on pref.user_id = p.user_id
    where p.user_id = (select auth.uid())
      and p.account_type = 'business'
      and lower(coalesce(s.plan_key, 'free')) = any (array['growth','professional','enterprise']::text[])
      and (
        coalesce(s.status, '') = any (array['active','trialing']::text[])
        or coalesce(s.manually_activated, false)
        or s.free_period_ends_at > now()
      )
      and (
        coalesce(pref.all_countries, false)
        or upper(coalesce(p_country_code, '')) = any (
          case
            when coalesce(array_length(pref.country_codes, 1), 0) > 0 then pref.country_codes
            else array[upper(coalesce(p.country_code, ''))]
          end
        )
      )
  );
$$;

revoke all on function private.can_current_user_access_dealer_lead_country(text) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.can_current_user_access_dealer_lead_country(text) to authenticated;

drop policy if exists dealer_vehicle_leads_select_growth_company on public.dealer_vehicle_leads;
create policy dealer_vehicle_leads_select_growth_company
on public.dealer_vehicle_leads
for select to authenticated
using (private.can_current_user_access_dealer_lead_country(source_country_code));

drop policy if exists dealer_vehicle_lead_images_select_growth_company on public.dealer_vehicle_lead_images;
create policy dealer_vehicle_lead_images_select_growth_company
on public.dealer_vehicle_lead_images
for select to authenticated
using (
  exists (
    select 1
    from public.dealer_vehicle_leads lead
    where lead.id = dealer_vehicle_lead_images.lead_id
      and private.can_current_user_access_dealer_lead_country(lead.source_country_code)
  )
);
