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
    left join public.marketplace_companies company on company.id = p.company_id
    join lateral (
      select s.plan_key, s.status, s.manually_activated, s.free_period_ends_at
      from public.business_subscriptions s
      where s.user_id = coalesce(company.created_by, p.user_id)
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
