-- Keep every table exposed through the public Data API protected by RLS.
-- Existing tables are hardened immediately and future public tables are
-- protected automatically when they are created through SQL.

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

do $$
declare
  target record;
begin
  for target in
    select n.nspname as schema_name, c.relname as table_name
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
  loop
    execute format(
      'alter table %I.%I enable row level security',
      target.schema_name,
      target.table_name
    );
  end loop;
end;
$$;

create or replace function private.autorell_enable_public_table_rls()
returns event_trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  command record;
begin
  for command in
    select *
    from pg_catalog.pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if command.schema_name = 'public' then
      execute format(
        'alter table if exists %s enable row level security',
        command.object_identity
      );
    end if;
  end loop;
end;
$$;

revoke all
on function private.autorell_enable_public_table_rls()
from public, anon, authenticated;

drop event trigger if exists autorell_ensure_public_table_rls;

create event trigger autorell_ensure_public_table_rls
on ddl_command_end
when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
execute function private.autorell_enable_public_table_rls();

comment on event trigger autorell_ensure_public_table_rls is
  'Automatically enables RLS on tables created in the exposed public schema.';
