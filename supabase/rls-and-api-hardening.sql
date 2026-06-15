alter table public.dealer enable row level security;

do $$
declare
  relation record;
begin
  for relation in
    select format('%I.%I', table_schema, table_name) as qualified_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
  loop
    execute format(
      'revoke all privileges on table %s from anon, authenticated',
      relation.qualified_name
    );
  end loop;
end
$$;

revoke all privileges on table public.dealer_leads
  from anon, authenticated;
revoke all privileges on table public.dealer_bids
  from anon, authenticated;

grant select on table public.admin_users to authenticated;

grant select on table public.dealers to authenticated;
grant update (
  company_name,
  vat_number,
  country,
  country_code,
  delivery_city,
  delivery_postal_code,
  contact_person,
  phone
) on table public.dealers to authenticated;

grant select on table public.dealer_leads to authenticated;
grant select on table public.dealer_bids to authenticated;

revoke execute on all functions in schema public
  from public, anon, authenticated;

grant execute on function public.place_dealer_bid(
  uuid,
  numeric,
  text,
  text,
  text
) to authenticated;

create index if not exists admin_audit_log_actor_user_id_idx
  on public.admin_audit_log (actor_user_id);

