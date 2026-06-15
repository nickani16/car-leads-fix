alter table public.staff_users
  add column if not exists username text,
  add column if not exists must_change_password boolean not null default false;

create unique index if not exists staff_users_username_unique
  on public.staff_users (lower(username))
  where username is not null;

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text not null,
  action text not null,
  target_type text not null,
  target_id text,
  reason text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_log enable row level security;

revoke all on table public.admin_audit_log from anon, authenticated;
grant select, insert on table public.admin_audit_log to service_role;

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_log_target_idx
  on public.admin_audit_log (target_type, target_id);

create or replace function public.handle_new_dealer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.raw_app_meta_data ->> 'portal_role' is not null then
    return new;
  end if;

  insert into public.dealers (
    user_id,
    company_name,
    vat_number,
    country,
    contact_person,
    email,
    phone,
    status
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'company_name',
    new.raw_user_meta_data ->> 'vat_number',
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'contact_person',
    new.email,
    new.raw_user_meta_data ->> 'phone',
    'pending'
  )
  on conflict (user_id) do update
  set
    company_name = excluded.company_name,
    vat_number = excluded.vat_number,
    country = excluded.country,
    contact_person = excluded.contact_person,
    email = excluded.email,
    phone = excluded.phone;

  return new;
end;
$function$;
