begin;

create table if not exists public.business_pilot_applications (
  id uuid primary key default gen_random_uuid(),
  company_name text not null check (char_length(btrim(company_name)) between 2 and 180),
  company_registration_number text,
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  market_code text not null default 'en' check (market_code ~ '^[a-z]{2}$'),
  locale text not null default 'en' check (locale in ('en','sv','de','fr','es','it','nl','fi','da','pl')),
  website_url text not null check (website_url ~* '^https?://'),
  contact_name text not null check (char_length(btrim(contact_name)) between 2 and 160),
  contact_role text,
  contact_email text not null check (contact_email = lower(contact_email) and contact_email like '%@%'),
  contact_phone text,
  inventory_size_range text check (inventory_size_range in ('1_25','26_100','101_500','501_2000','2000_plus')),
  estimated_inventory_count integer check (estimated_inventory_count is null or estimated_inventory_count between 0 and 1000000),
  location_count integer check (location_count is null or location_count between 1 and 10000),
  current_inventory_system text,
  preferred_integration_method text check (
    preferred_integration_method in ('website','xml','csv','api','dms','unknown')
  ),
  message text,
  status text not null default 'submitted' check (
    status in (
      'submitted','under_review','more_information_required','contacted','technical_review','approved','rejected',
      'onboarding','pilot_active','pilot_paused','pilot_completed',
      'commercial_discussion','commercial_customer','closed'
    )
  ),
  assigned_admin_user_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.marketplace_companies(id) on delete set null,
  review_notes text,
  rejection_reason text,
  privacy_consent_at timestamptz not null,
  contact_consent_at timestamptz not null,
  privacy_version text not null default '2026-08',
  source_fingerprint text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  approved_at timestamptz,
  pilot_started_at timestamptz,
  pilot_ends_at timestamptz,
  pilot_completed_at timestamptz,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id)
);

create index if not exists business_pilot_applications_status_idx
  on public.business_pilot_applications (status, submitted_at desc);
create index if not exists business_pilot_applications_country_idx
  on public.business_pilot_applications (country_code, submitted_at desc);
create index if not exists business_pilot_applications_submitted_idx
  on public.business_pilot_applications (submitted_at desc);
create index if not exists business_pilot_applications_organization_idx
  on public.business_pilot_applications (organization_id, submitted_at desc)
  where organization_id is not null;
create index if not exists business_pilot_applications_email_idx
  on public.business_pilot_applications (lower(contact_email), submitted_at desc);
create index if not exists business_pilot_applications_assignee_idx
  on public.business_pilot_applications (assigned_admin_user_id, status, submitted_at desc)
  where assigned_admin_user_id is not null;

create table if not exists public.business_pilot_application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.business_pilot_applications(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (char_length(btrim(event_type)) between 2 and 80),
  from_status text,
  to_status text,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists business_pilot_application_events_application_idx
  on public.business_pilot_application_events (application_id, created_at desc);

create table if not exists public.business_pilot_programs (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.business_pilot_applications(id) on delete restrict,
  organization_id uuid not null references public.marketplace_companies(id) on delete restrict,
  program_name text,
  status text not null default 'approved' check (
    status in ('approved','onboarding','pilot_active','pilot_paused','pilot_completed','commercial_discussion','commercial_customer','closed')
  ),
  start_date date,
  planned_end_date date,
  actual_end_date date,
  is_free boolean not null default true check (is_free = true),
  automatic_conversion_enabled boolean not null default false check (automatic_conversion_enabled = false),
  commercial_agreement_required boolean not null default true check (commercial_agreement_required = true),
  agreed_inventory_limit integer check (agreed_inventory_limit is null or agreed_inventory_limit between 1 and 1000000),
  agreed_location_limit integer check (agreed_location_limit is null or agreed_location_limit between 1 and 10000),
  integration_method text check (integration_method in ('website','xml','csv','api','dms','unknown')),
  internal_owner_user_id uuid references auth.users(id) on delete set null,
  company_contact_user_id uuid references auth.users(id) on delete set null,
  terms_version text,
  terms_accepted_at timestamptz,
  terms_accepted_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id),
  unique (id, organization_id),
  constraint business_pilot_programs_application_organization_fk
    foreign key (application_id, organization_id)
    references public.business_pilot_applications (id, organization_id)
    on delete restrict
);

create index if not exists business_pilot_programs_organization_idx
  on public.business_pilot_programs (organization_id, status, created_at desc);
create index if not exists business_pilot_programs_status_idx
  on public.business_pilot_programs (status, created_at desc);
create index if not exists business_pilot_programs_owner_idx
  on public.business_pilot_programs (internal_owner_user_id, status)
  where internal_owner_user_id is not null;

create table if not exists public.business_pilot_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  delivery_key text not null unique,
  application_id uuid not null references public.business_pilot_applications(id) on delete cascade,
  email_type text not null,
  locale text not null,
  recipient_email text not null,
  status text not null default 'processing' check (status in ('processing','sent','failed','skipped')),
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_pilot_email_deliveries_application_idx
  on public.business_pilot_email_deliveries (application_id, created_at desc);

create table if not exists public.business_pilot_rate_limits (
  key_hash text primary key check (key_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1 check (request_count between 1 and 1000000),
  expires_at timestamptz not null
);

create table if not exists public.business_pilot_commercial_requests (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.business_pilot_programs(id) on delete cascade,
  application_id uuid not null references public.business_pilot_applications(id) on delete cascade,
  organization_id uuid not null references public.marketplace_companies(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete restrict,
  locale text not null,
  message text,
  status text not null default 'submitted' check (status in ('submitted','contacted','closed')),
  contacted_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_pilot_commercial_requests_program_organization_fk
    foreign key (program_id, organization_id)
    references public.business_pilot_programs (id, organization_id)
    on delete cascade,
  constraint business_pilot_commercial_requests_application_organization_fk
    foreign key (application_id, organization_id)
    references public.business_pilot_applications (id, organization_id)
    on delete cascade
);

create unique index if not exists business_pilot_commercial_requests_open_idx
  on public.business_pilot_commercial_requests (program_id)
  where status in ('submitted','contacted');
create index if not exists business_pilot_commercial_requests_organization_idx
  on public.business_pilot_commercial_requests (organization_id, created_at desc);

create table if not exists public.feature_flag_overrides (
  id uuid primary key default gen_random_uuid(),
  flag_key text not null check (
    flag_key in (
      'business_pilot_program','dealer_inventory_import','dealer_website_import',
      'dealer_feed_import','dealer_api_import','dealer_dms_onboarding','dealer_inventory_sync'
    )
  ),
  environment text not null check (environment in ('development','preview','production','test')),
  market_code text check (market_code is null or market_code ~ '^[a-z]{2}$'),
  organization_id uuid references public.marketplace_companies(id) on delete cascade,
  pilot_program_id uuid references public.business_pilot_programs(id) on delete cascade,
  enabled boolean not null,
  reason text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (flag_key, environment, market_code, organization_id, pilot_program_id)
);

create index if not exists feature_flag_overrides_resolution_idx
  on public.feature_flag_overrides (flag_key, environment, market_code, organization_id, pilot_program_id);

insert into public.feature_flag_overrides (flag_key, environment, enabled, reason)
select flag_key, environment, enabled, reason
from (
  values
    ('business_pilot_program', 'development', true, 'Enabled for local implementation and verification.'),
    ('business_pilot_program', 'preview', true, 'Enabled for controlled preview verification.'),
    ('business_pilot_program', 'production', false, 'Requires explicit production approval.'),
    ('dealer_inventory_import', 'development', true, 'Enabled for local implementation and verification.'),
    ('dealer_inventory_import', 'preview', true, 'Enabled for controlled preview verification.'),
    ('dealer_inventory_import', 'production', false, 'Requires explicit production approval.'),
    ('dealer_website_import', 'development', true, 'Enabled for one controlled test dealer.'),
    ('dealer_website_import', 'preview', true, 'Enabled for one controlled test dealer.'),
    ('dealer_website_import', 'production', false, 'Requires explicit production approval.'),
    ('dealer_feed_import', 'development', false, 'Reserved for phase four.'),
    ('dealer_feed_import', 'preview', false, 'Reserved for phase four.'),
    ('dealer_feed_import', 'production', false, 'Requires explicit production approval.'),
    ('dealer_api_import', 'development', false, 'Reserved for phase four.'),
    ('dealer_api_import', 'preview', false, 'Reserved for phase four.'),
    ('dealer_api_import', 'production', false, 'Requires explicit production approval.'),
    ('dealer_dms_onboarding', 'development', true, 'Onboarding cases only; no generic DMS adapter.'),
    ('dealer_dms_onboarding', 'preview', true, 'Onboarding cases only; no generic DMS adapter.'),
    ('dealer_dms_onboarding', 'production', false, 'Requires explicit production approval.'),
    ('dealer_inventory_sync', 'development', true, 'Enabled for controlled fixture verification.'),
    ('dealer_inventory_sync', 'preview', true, 'Enabled for controlled fixture verification.'),
    ('dealer_inventory_sync', 'production', false, 'Requires explicit production approval.')
) as defaults(flag_key, environment, enabled, reason)
on conflict (flag_key, environment, market_code, organization_id, pilot_program_id) do nothing;

create or replace function public.set_business_pilot_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.consume_business_pilot_rate_limit(
  p_key_hash text,
  p_limit integer default 5,
  p_window_seconds integer default 3600
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
begin
  if p_key_hash !~ '^[a-f0-9]{64}$'
    or p_limit < 1 or p_limit > 1000
    or p_window_seconds < 60 or p_window_seconds > 86400 then
    return false;
  end if;

  insert into public.business_pilot_rate_limits (
    key_hash,
    window_started_at,
    request_count,
    expires_at
  ) values (
    p_key_hash,
    now(),
    1,
    now() + make_interval(secs => p_window_seconds)
  )
  on conflict (key_hash) do update
  set
    window_started_at = case
      when public.business_pilot_rate_limits.expires_at <= now() then now()
      else public.business_pilot_rate_limits.window_started_at
    end,
    request_count = case
      when public.business_pilot_rate_limits.expires_at <= now() then 1
      else least(public.business_pilot_rate_limits.request_count + 1, p_limit + 1)
    end,
    expires_at = case
      when public.business_pilot_rate_limits.expires_at <= now()
        then now() + make_interval(secs => p_window_seconds)
      else public.business_pilot_rate_limits.expires_at
    end
  returning request_count into current_count;

  return current_count <= p_limit;
end;
$$;

drop trigger if exists business_pilot_applications_updated_at on public.business_pilot_applications;
create trigger business_pilot_applications_updated_at
  before update on public.business_pilot_applications
  for each row execute function public.set_business_pilot_updated_at();

drop trigger if exists business_pilot_programs_updated_at on public.business_pilot_programs;
create trigger business_pilot_programs_updated_at
  before update on public.business_pilot_programs
  for each row execute function public.set_business_pilot_updated_at();

drop trigger if exists business_pilot_email_deliveries_updated_at on public.business_pilot_email_deliveries;
create trigger business_pilot_email_deliveries_updated_at
  before update on public.business_pilot_email_deliveries
  for each row execute function public.set_business_pilot_updated_at();

drop trigger if exists business_pilot_commercial_requests_updated_at on public.business_pilot_commercial_requests;
create trigger business_pilot_commercial_requests_updated_at
  before update on public.business_pilot_commercial_requests
  for each row execute function public.set_business_pilot_updated_at();

drop trigger if exists feature_flag_overrides_updated_at on public.feature_flag_overrides;
create trigger feature_flag_overrides_updated_at
  before update on public.feature_flag_overrides
  for each row execute function public.set_business_pilot_updated_at();

create or replace function public.log_business_pilot_status_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.business_pilot_application_events (
      application_id, actor_user_id, event_type, from_status, to_status, metadata
    ) values (
      new.id, new.updated_by, 'status_changed', old.status, new.status, '{}'::jsonb
    );
  end if;
  return new;
end;
$$;

drop trigger if exists business_pilot_application_status_audit on public.business_pilot_applications;
create trigger business_pilot_application_status_audit
  after update of status on public.business_pilot_applications
  for each row execute function public.log_business_pilot_status_change();

alter table public.business_pilot_applications enable row level security;
alter table public.business_pilot_application_events enable row level security;
alter table public.business_pilot_programs enable row level security;
alter table public.business_pilot_email_deliveries enable row level security;
alter table public.business_pilot_rate_limits enable row level security;
alter table public.business_pilot_commercial_requests enable row level security;
alter table public.feature_flag_overrides enable row level security;

revoke all on table public.business_pilot_applications from anon, authenticated;
revoke all on table public.business_pilot_application_events from anon, authenticated;
revoke all on table public.business_pilot_programs from anon, authenticated;
revoke all on table public.business_pilot_email_deliveries from anon, authenticated;
revoke all on table public.business_pilot_rate_limits from anon, authenticated;
revoke all on table public.business_pilot_commercial_requests from anon, authenticated;
revoke all on table public.feature_flag_overrides from anon, authenticated;

grant select, insert, update, delete on table public.business_pilot_applications to service_role;
grant select, insert on table public.business_pilot_application_events to service_role;
grant select, insert, update, delete on table public.business_pilot_programs to service_role;
grant select, insert, update, delete on table public.business_pilot_email_deliveries to service_role;
grant select, insert, update, delete on table public.business_pilot_rate_limits to service_role;
grant select, insert, update, delete on table public.business_pilot_commercial_requests to service_role;
grant select, insert, update, delete on table public.feature_flag_overrides to service_role;

drop policy if exists business_pilot_programs_select_organization on public.business_pilot_programs;
create policy business_pilot_programs_select_organization
  on public.business_pilot_programs for select
  to authenticated
  using (
    exists (
      select 1
      from public.marketplace_company_members member
      where member.company_id = business_pilot_programs.organization_id
        and member.user_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.marketplace_profiles profile
      where profile.company_id = business_pilot_programs.organization_id
        and profile.user_id = (select auth.uid())
    )
  );

grant select on table public.business_pilot_programs to authenticated;

drop policy if exists business_pilot_commercial_requests_select_organization on public.business_pilot_commercial_requests;
create policy business_pilot_commercial_requests_select_organization
  on public.business_pilot_commercial_requests for select to authenticated using (
    exists (
      select 1 from public.marketplace_company_members member
      where member.company_id = business_pilot_commercial_requests.organization_id
        and member.user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.marketplace_profiles profile
      where profile.company_id = business_pilot_commercial_requests.organization_id
        and profile.user_id = (select auth.uid())
    )
  );
grant select on table public.business_pilot_commercial_requests to authenticated;

revoke all on function public.set_business_pilot_updated_at() from public, anon, authenticated;
revoke all on function public.log_business_pilot_status_change() from public, anon, authenticated;
revoke all on function public.consume_business_pilot_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.set_business_pilot_updated_at() to service_role;
grant execute on function public.log_business_pilot_status_change() to service_role;
grant execute on function public.consume_business_pilot_rate_limit(text, integer, integer) to service_role;

insert into public.admin_permissions (permission_key, description, is_sensitive)
values
  ('business_pilots.read', 'Read business pilot applications and programs.', true),
  ('business_pilots.manage', 'Manage business pilot applications, programs and communication.', true),
  ('inventory_imports.read', 'Read dealer inventory import sources, runs and errors.', true),
  ('inventory_imports.manage', 'Manage dealer inventory imports and parser configuration.', true)
on conflict (permission_key) do update
set description = excluded.description, is_sensitive = excluded.is_sensitive;

insert into public.admin_role_permissions (role_key, permission_key)
values
  ('operations_admin', 'business_pilots.read'),
  ('operations_admin', 'business_pilots.manage'),
  ('operations_admin', 'inventory_imports.read'),
  ('operations_admin', 'inventory_imports.manage'),
  ('support_admin', 'business_pilots.read'),
  ('support_admin', 'inventory_imports.read')
on conflict do nothing;

comment on table public.business_pilot_applications is 'Public business pilot applications; server-route writes only and no public reads.';
comment on table public.business_pilot_application_events is 'Append-only operational history for pilot applications.';
comment on table public.business_pilot_programs is 'Free pilot agreements that can never convert automatically to billing.';
comment on table public.business_pilot_rate_limits is 'Hashed public submission rate-limit keys. No raw IP addresses are stored.';
comment on column public.business_pilot_programs.automatic_conversion_enabled is 'Hard-locked false. A separate explicit commercial agreement is always required.';
comment on table public.feature_flag_overrides is 'Scoped feature overrides by environment, market, organization or pilot.';

commit;
