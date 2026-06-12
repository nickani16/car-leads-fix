begin;

create schema if not exists private;

create or replace function private.ensure_lead_created_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.created_at := coalesce(new.created_at, timezone('utc', now()));
  return new;
end;
$$;

drop trigger if exists ensure_lead_created_at on public.leads;

create trigger ensure_lead_created_at
before insert on public.leads
for each row
execute function private.ensure_lead_created_at();

commit;
