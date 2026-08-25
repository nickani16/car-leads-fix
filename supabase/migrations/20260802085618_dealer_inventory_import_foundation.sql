begin;

create table if not exists public.dealer_parser_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 160),
  domain_pattern text not null check (char_length(btrim(domain_pattern)) between 3 and 255),
  parser_kind text not null default 'json_ld' check (parser_kind in ('json_ld','domain_adapter','generic_html')),
  status text not null default 'draft' check (status in ('draft','testing','active','disabled')),
  version integer not null default 1 check (version > 0),
  selectors jsonb not null default '{}'::jsonb,
  mapping jsonb not null default '{}'::jsonb,
  test_fixtures jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (domain_pattern, version)
);

create table if not exists public.dealer_import_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.marketplace_companies(id) on delete cascade,
  pilot_program_id uuid references public.business_pilot_programs(id) on delete set null,
  parser_profile_id uuid references public.dealer_parser_profiles(id) on delete set null,
  name text not null check (char_length(btrim(name)) between 2 and 160),
  source_type text not null check (source_type in ('website','xml','csv','api','dms')),
  website_url text check (website_url is null or website_url ~* '^https?://'),
  inventory_url text check (inventory_url is null or inventory_url ~* '^https?://'),
  feed_url text check (feed_url is null or feed_url ~* '^https?://'),
  documentation_url text check (documentation_url is null or documentation_url ~* '^https?://'),
  verified_domain text,
  verification_status text not null default 'unverified' check (
    verification_status in ('unverified','pending','verified','failed','manual_review')
  ),
  sync_status text not null default 'draft' check (
    sync_status in ('draft','analyzing','ready','active','paused','error','disabled','deleted')
  ),
  sync_interval_hours integer not null default 24 check (sync_interval_hours between 1 and 720),
  last_started_at timestamptz,
  last_completed_at timestamptz,
  last_success_at timestamptz,
  next_sync_at timestamptz,
  consecutive_failures integer not null default 0 check (consecutive_failures between 0 and 100000),
  missing_confirmation_threshold integer not null default 3 check (missing_confirmation_threshold between 2 and 10),
  inventory_limit integer not null default 500 check (inventory_limit between 1 and 1000000),
  location_id uuid references public.marketplace_company_locations(id) on delete set null,
  discovered_count integer not null default 0 check (discovered_count >= 0),
  imported_count integer not null default 0 check (imported_count >= 0),
  published_count integer not null default 0 check (published_count >= 0),
  review_count integer not null default 0 check (review_count >= 0),
  error_count integer not null default 0 check (error_count >= 0),
  last_error text,
  configuration jsonb not null default '{}'::jsonb check (
    configuration::text !~* '"(api_key|password|access_token|refresh_token|client_secret|authorization)"\s*:'
  ),
  credentials_ciphertext text,
  data_rights_accepted_at timestamptz,
  image_rights_accepted_at timestamptz,
  storage_display_accepted_at timestamptz,
  automatic_sync_accepted_at timestamptz,
  pilot_terms_accepted_at timestamptz,
  terms_version text,
  publication_approved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name),
  unique (id, organization_id),
  constraint dealer_import_sources_pilot_organization_fk
    foreign key (pilot_program_id, organization_id)
    references public.business_pilot_programs (id, organization_id)
);

create index if not exists dealer_import_sources_organization_idx
  on public.dealer_import_sources (organization_id, sync_status, created_at desc);
create index if not exists dealer_import_sources_schedule_idx
  on public.dealer_import_sources (sync_status, next_sync_at)
  where sync_status = 'active' and deleted_at is null;
create index if not exists dealer_import_sources_domain_idx
  on public.dealer_import_sources (lower(verified_domain))
  where verified_domain is not null;
create index if not exists dealer_import_sources_pilot_idx
  on public.dealer_import_sources (pilot_program_id, created_at desc)
  where pilot_program_id is not null;

create table if not exists public.dealer_import_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.dealer_import_sources(id) on delete cascade,
  job_key text not null unique,
  status text not null default 'queued' check (
    status in ('queued','running','completed','completed_with_warnings','failed','cancelled')
  ),
  trigger_type text not null default 'manual' check (trigger_type in ('manual','scheduled','onboarding','retry','admin')),
  current_step text not null default 'create_import_source',
  attempt_count integer not null default 0 check (attempt_count between 0 and 20),
  max_attempts integer not null default 5 check (max_attempts between 1 and 20),
  next_retry_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  source_available boolean,
  discovery_complete boolean not null default false,
  discovered_count integer not null default 0 check (discovered_count >= 0),
  parsed_count integer not null default 0 check (parsed_count >= 0),
  created_count integer not null default 0 check (created_count >= 0),
  updated_count integer not null default 0 check (updated_count >= 0),
  unchanged_count integer not null default 0 check (unchanged_count >= 0),
  warning_count integer not null default 0 check (warning_count >= 0),
  error_count integer not null default 0 check (error_count >= 0),
  last_error_code text,
  last_error_message text,
  summary jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, source_id)
);

create index if not exists dealer_import_runs_source_idx
  on public.dealer_import_runs (source_id, created_at desc);
create index if not exists dealer_import_runs_queue_idx
  on public.dealer_import_runs (status, next_retry_at, created_at)
  where status in ('queued','failed');
create unique index if not exists dealer_import_runs_one_active_source_idx
  on public.dealer_import_runs (source_id)
  where status in ('queued','running') or (status = 'failed' and completed_at is null);

create table if not exists public.dealer_import_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.marketplace_companies(id) on delete cascade,
  source_id uuid not null references public.dealer_import_sources(id) on delete cascade,
  source_external_id text,
  source_url text check (source_url is null or source_url ~* '^https?://'),
  canonical_source_url text check (canonical_source_url is null or canonical_source_url ~* '^https?://'),
  vehicle_id uuid references public.marketplace_listings(id) on delete set null,
  duplicate_of_item_id uuid references public.dealer_import_items(id) on delete set null,
  source_status text not null default 'present' check (source_status in ('present','sold','removed','missing','unknown')),
  sync_status text not null default 'import_pending' check (
    sync_status in ('import_pending','import_review','active','paused','source_missing','sold','import_error','deleted')
  ),
  content_hash text,
  vin_fingerprint text,
  registration_fingerprint text,
  match_fingerprint text,
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_payload jsonb not null default '{}'::jsonb,
  field_confidence jsonb not null default '{}'::jsonb,
  parse_confidence numeric(5,4) check (parse_confidence is null or parse_confidence between 0 and 1),
  warnings jsonb not null default '[]'::jsonb,
  original_image_urls jsonb not null default '[]'::jsonb,
  imported_image_paths jsonb not null default '[]'::jsonb,
  image_hashes jsonb not null default '[]'::jsonb,
  missing_confirmations integer not null default 0 check (missing_confirmations between 0 and 100000),
  last_seen_at timestamptz,
  missing_since timestamptz,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  constraint dealer_import_items_source_organization_fk
    foreign key (source_id, organization_id)
    references public.dealer_import_sources (id, organization_id),
  constraint dealer_import_items_duplicate_organization_fk
    foreign key (duplicate_of_item_id, organization_id)
    references public.dealer_import_items (id, organization_id)
);

create unique index if not exists dealer_import_items_source_external_idx
  on public.dealer_import_items (source_id, source_external_id)
  where source_external_id is not null;
create unique index if not exists dealer_import_items_source_canonical_idx
  on public.dealer_import_items (source_id, canonical_source_url)
  where source_external_id is null and canonical_source_url is not null;
create index if not exists dealer_import_items_organization_idx
  on public.dealer_import_items (organization_id, sync_status, updated_at desc);
create index if not exists dealer_import_items_source_status_idx
  on public.dealer_import_items (source_id, sync_status, updated_at desc);
create index if not exists dealer_import_items_content_hash_idx
  on public.dealer_import_items (source_id, content_hash)
  where content_hash is not null;
create index if not exists dealer_import_items_vin_idx
  on public.dealer_import_items (organization_id, vin_fingerprint)
  where vin_fingerprint is not null;
create index if not exists dealer_import_items_registration_idx
  on public.dealer_import_items (organization_id, registration_fingerprint)
  where registration_fingerprint is not null;
create index if not exists dealer_import_items_match_idx
  on public.dealer_import_items (organization_id, match_fingerprint)
  where match_fingerprint is not null;

create table if not exists public.dealer_site_verifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.marketplace_companies(id) on delete cascade,
  source_id uuid not null references public.dealer_import_sources(id) on delete cascade,
  method text not null check (method in ('dns','html_file','meta_tag','manual_admin')),
  status text not null default 'pending' check (status in ('pending','verified','failed','expired','revoked')),
  domain text not null,
  token_hash text,
  instructions jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  requested_at timestamptz not null default now(),
  checked_at timestamptz,
  verified_at timestamptz,
  expires_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dealer_site_verifications_source_organization_fk
    foreign key (source_id, organization_id)
    references public.dealer_import_sources (id, organization_id)
);

create index if not exists dealer_site_verifications_source_idx
  on public.dealer_site_verifications (source_id, created_at desc);
create index if not exists dealer_site_verifications_pending_idx
  on public.dealer_site_verifications (status, expires_at)
  where status = 'pending';

create table if not exists public.dealer_source_mappings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.marketplace_companies(id) on delete cascade,
  source_id uuid not null references public.dealer_import_sources(id) on delete cascade,
  external_field text not null,
  target_field text not null,
  transform_key text,
  transform_configuration jsonb not null default '{}'::jsonb,
  default_value jsonb,
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  is_required boolean not null default false,
  approved_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, external_field, target_field),
  constraint dealer_source_mappings_source_organization_fk
    foreign key (source_id, organization_id)
    references public.dealer_import_sources (id, organization_id)
);

create index if not exists dealer_source_mappings_source_idx
  on public.dealer_source_mappings (source_id, target_field);

create table if not exists public.dealer_import_source_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.marketplace_companies(id) on delete cascade,
  source_id uuid not null references public.dealer_import_sources(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint dealer_import_source_events_source_organization_fk
    foreign key (source_id, organization_id)
    references public.dealer_import_sources (id, organization_id)
);

create index if not exists dealer_import_source_events_source_idx
  on public.dealer_import_source_events (source_id, created_at desc);

create table if not exists public.dealer_import_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  delivery_key text not null unique,
  organization_id uuid not null references public.marketplace_companies(id) on delete cascade,
  source_id uuid not null references public.dealer_import_sources(id) on delete cascade,
  run_id uuid references public.dealer_import_runs(id) on delete set null,
  email_type text not null check (email_type in ('domain_verified','analysis_completed','first_import_completed','import_failed','sync_problem')),
  locale text not null,
  recipient_email text not null,
  status text not null default 'processing' check (status in ('processing','sent','failed','skipped')),
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dealer_import_email_deliveries_source_organization_fk
    foreign key (source_id, organization_id)
    references public.dealer_import_sources (id, organization_id),
  constraint dealer_import_email_deliveries_run_source_fk
    foreign key (run_id, source_id)
    references public.dealer_import_runs (id, source_id)
);

create index if not exists dealer_import_email_deliveries_source_idx
  on public.dealer_import_email_deliveries (source_id, created_at desc);

alter table public.marketplace_listings
  add column if not exists import_source_id uuid references public.dealer_import_sources(id) on delete set null,
  add column if not exists import_item_id uuid references public.dealer_import_items(id) on delete set null,
  add column if not exists imported_organization_id uuid references public.marketplace_companies(id) on delete set null,
  add column if not exists pilot_program_id uuid references public.business_pilot_programs(id) on delete set null,
  add column if not exists import_status text,
  add column if not exists is_automatically_imported boolean not null default false,
  add column if not exists source_original_url text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'marketplace_listings_import_status_check'
  ) then
    alter table public.marketplace_listings add constraint marketplace_listings_import_status_check
      check (import_status is null or import_status in ('import_pending','import_review','active','paused','source_missing','sold','import_error','deleted'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'marketplace_listings_import_source_organization_fk'
  ) then
    alter table public.marketplace_listings
      add constraint marketplace_listings_import_source_organization_fk
      foreign key (import_source_id, imported_organization_id)
      references public.dealer_import_sources (id, organization_id);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'marketplace_listings_import_item_organization_fk'
  ) then
    alter table public.marketplace_listings
      add constraint marketplace_listings_import_item_organization_fk
      foreign key (import_item_id, imported_organization_id)
      references public.dealer_import_items (id, organization_id);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'marketplace_listings_import_pilot_organization_fk'
  ) then
    alter table public.marketplace_listings
      add constraint marketplace_listings_import_pilot_organization_fk
      foreign key (pilot_program_id, imported_organization_id)
      references public.business_pilot_programs (id, organization_id);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'marketplace_listings_automatic_import_references_check'
  ) then
    alter table public.marketplace_listings
      add constraint marketplace_listings_automatic_import_references_check
      check (
        not is_automatically_imported
        or (
          import_source_id is not null
          and import_item_id is not null
          and imported_organization_id is not null
        )
      );
  end if;
end;
$$;

create index if not exists marketplace_listings_import_source_idx
  on public.marketplace_listings (import_source_id, import_status, updated_at desc)
  where import_source_id is not null;
create unique index if not exists marketplace_listings_import_item_unique_idx
  on public.marketplace_listings (import_item_id)
  where import_item_id is not null;

create or replace function public.set_dealer_import_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.claim_dealer_import_runs(p_limit integer default 2)
returns setof public.dealer_import_runs
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with claimable as (
    select run.id
    from public.dealer_import_runs run
    where (
      run.status = 'queued'
      or (
        run.status = 'failed'
        and run.attempt_count < run.max_attempts
        and run.next_retry_at is not null
        and run.next_retry_at <= now()
      )
      or (
        run.status = 'running'
        and run.attempt_count < run.max_attempts
        and run.updated_at <= now() - interval '15 minutes'
      )
    )
    order by run.created_at
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 2), 10))
  )
  update public.dealer_import_runs run
  set
    status = 'running',
    started_at = coalesce(run.started_at, now()),
    attempt_count = case
      when run.status in ('failed', 'running') then run.attempt_count + 1
      when run.attempt_count = 0 then 1
      else run.attempt_count
    end,
    next_retry_at = null,
    updated_at = now()
  from claimable
  where run.id = claimable.id
  returning run.*;
end;
$$;

create or replace function public.claim_dealer_import_run(p_run_id uuid)
returns setof public.dealer_import_runs
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with claimable as (
    select run.id
    from public.dealer_import_runs run
    where run.id = p_run_id
      and (
        run.status = 'queued'
        or (
          run.status = 'failed'
          and run.attempt_count < run.max_attempts
          and run.next_retry_at is not null
          and run.next_retry_at <= now()
        )
        or (
          run.status = 'running'
          and run.attempt_count < run.max_attempts
          and run.updated_at <= now() - interval '15 minutes'
        )
      )
    for update skip locked
  )
  update public.dealer_import_runs run
  set
    status = 'running',
    started_at = coalesce(run.started_at, now()),
    attempt_count = case
      when run.status in ('failed', 'running') then run.attempt_count + 1
      when run.attempt_count = 0 then 1
      else run.attempt_count
    end,
    next_retry_at = null,
    updated_at = now()
  from claimable
  where run.id = claimable.id
  returning run.*;
end;
$$;

drop trigger if exists dealer_parser_profiles_updated_at on public.dealer_parser_profiles;
create trigger dealer_parser_profiles_updated_at before update on public.dealer_parser_profiles
  for each row execute function public.set_dealer_import_updated_at();
drop trigger if exists dealer_import_sources_updated_at on public.dealer_import_sources;
create trigger dealer_import_sources_updated_at before update on public.dealer_import_sources
  for each row execute function public.set_dealer_import_updated_at();
drop trigger if exists dealer_import_runs_updated_at on public.dealer_import_runs;
create trigger dealer_import_runs_updated_at before update on public.dealer_import_runs
  for each row execute function public.set_dealer_import_updated_at();
drop trigger if exists dealer_import_items_updated_at on public.dealer_import_items;
create trigger dealer_import_items_updated_at before update on public.dealer_import_items
  for each row execute function public.set_dealer_import_updated_at();
drop trigger if exists dealer_site_verifications_updated_at on public.dealer_site_verifications;
create trigger dealer_site_verifications_updated_at before update on public.dealer_site_verifications
  for each row execute function public.set_dealer_import_updated_at();
drop trigger if exists dealer_source_mappings_updated_at on public.dealer_source_mappings;
create trigger dealer_source_mappings_updated_at before update on public.dealer_source_mappings
  for each row execute function public.set_dealer_import_updated_at();

alter table public.dealer_parser_profiles enable row level security;
alter table public.dealer_import_sources enable row level security;
alter table public.dealer_import_runs enable row level security;
alter table public.dealer_import_items enable row level security;
alter table public.dealer_site_verifications enable row level security;
alter table public.dealer_source_mappings enable row level security;
alter table public.dealer_import_source_events enable row level security;
alter table public.dealer_import_email_deliveries enable row level security;

drop policy if exists dealer_import_sources_select_own_organization on public.dealer_import_sources;
create policy dealer_import_sources_select_own_organization
  on public.dealer_import_sources for select to authenticated using (
    exists (select 1 from public.marketplace_company_members member where member.company_id = dealer_import_sources.organization_id and member.user_id = (select auth.uid()))
    or exists (select 1 from public.marketplace_profiles profile where profile.company_id = dealer_import_sources.organization_id and profile.user_id = (select auth.uid()))
  );
drop policy if exists dealer_import_runs_select_own_organization on public.dealer_import_runs;
create policy dealer_import_runs_select_own_organization
  on public.dealer_import_runs for select to authenticated using (
    exists (
      select 1 from public.dealer_import_sources source
      where source.id = dealer_import_runs.source_id
        and (
          exists (select 1 from public.marketplace_company_members member where member.company_id = source.organization_id and member.user_id = (select auth.uid()))
          or exists (select 1 from public.marketplace_profiles profile where profile.company_id = source.organization_id and profile.user_id = (select auth.uid()))
        )
    )
  );
drop policy if exists dealer_import_items_select_own_organization on public.dealer_import_items;
create policy dealer_import_items_select_own_organization
  on public.dealer_import_items for select to authenticated using (
    exists (select 1 from public.marketplace_company_members member where member.company_id = dealer_import_items.organization_id and member.user_id = (select auth.uid()))
    or exists (select 1 from public.marketplace_profiles profile where profile.company_id = dealer_import_items.organization_id and profile.user_id = (select auth.uid()))
  );
drop policy if exists dealer_site_verifications_select_own_organization on public.dealer_site_verifications;
create policy dealer_site_verifications_select_own_organization
  on public.dealer_site_verifications for select to authenticated using (
    exists (select 1 from public.marketplace_company_members member where member.company_id = dealer_site_verifications.organization_id and member.user_id = (select auth.uid()))
    or exists (select 1 from public.marketplace_profiles profile where profile.company_id = dealer_site_verifications.organization_id and profile.user_id = (select auth.uid()))
  );
drop policy if exists dealer_source_mappings_select_own_organization on public.dealer_source_mappings;
create policy dealer_source_mappings_select_own_organization
  on public.dealer_source_mappings for select to authenticated using (
    exists (select 1 from public.marketplace_company_members member where member.company_id = dealer_source_mappings.organization_id and member.user_id = (select auth.uid()))
    or exists (select 1 from public.marketplace_profiles profile where profile.company_id = dealer_source_mappings.organization_id and profile.user_id = (select auth.uid()))
  );
drop policy if exists dealer_import_source_events_select_own_organization on public.dealer_import_source_events;
create policy dealer_import_source_events_select_own_organization
  on public.dealer_import_source_events for select to authenticated using (
    exists (select 1 from public.marketplace_company_members member where member.company_id = dealer_import_source_events.organization_id and member.user_id = (select auth.uid()))
    or exists (select 1 from public.marketplace_profiles profile where profile.company_id = dealer_import_source_events.organization_id and profile.user_id = (select auth.uid()))
  );

revoke all on table public.dealer_parser_profiles from anon, authenticated;
revoke all on table public.dealer_import_sources from anon, authenticated;
revoke all on table public.dealer_import_runs from anon, authenticated;
revoke all on table public.dealer_import_items from anon, authenticated;
revoke all on table public.dealer_site_verifications from anon, authenticated;
revoke all on table public.dealer_source_mappings from anon, authenticated;
revoke all on table public.dealer_import_source_events from anon, authenticated;
revoke all on table public.dealer_import_email_deliveries from anon, authenticated;

grant select on table public.dealer_import_sources to authenticated;
grant select on table public.dealer_import_runs to authenticated;
grant select on table public.dealer_import_items to authenticated;
grant select on table public.dealer_site_verifications to authenticated;
grant select on table public.dealer_source_mappings to authenticated;
grant select on table public.dealer_import_source_events to authenticated;

grant all on table public.dealer_parser_profiles to service_role;
grant all on table public.dealer_import_sources to service_role;
grant all on table public.dealer_import_runs to service_role;
grant all on table public.dealer_import_items to service_role;
grant all on table public.dealer_site_verifications to service_role;
grant all on table public.dealer_source_mappings to service_role;
grant all on table public.dealer_import_source_events to service_role;
grant all on table public.dealer_import_email_deliveries to service_role;

revoke all on function public.set_dealer_import_updated_at() from public, anon, authenticated;
grant execute on function public.set_dealer_import_updated_at() to service_role;
revoke all on function public.claim_dealer_import_runs(integer) from public, anon, authenticated;
grant execute on function public.claim_dealer_import_runs(integer) to service_role;
revoke all on function public.claim_dealer_import_run(uuid) from public, anon, authenticated;
grant execute on function public.claim_dealer_import_run(uuid) to service_role;

comment on column public.dealer_import_sources.credentials_ciphertext is 'Encrypted server-side credentials only. Never expose this column to client code.';
comment on column public.dealer_import_sources.publication_approved_at is 'Set only after every required rights and pilot consent has been accepted.';
comment on column public.dealer_import_runs.discovery_complete is 'Missing-item processing is forbidden unless discovery completed successfully.';
comment on column public.dealer_import_items.missing_confirmations is 'A listing may be hidden only after the source-specific confirmation threshold is met.';

commit;
