begin;

alter table public.marketplace_company_locations
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

create table if not exists public.marketplace_company_import_jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.marketplace_companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  source text not null default 'csv',
  status text not null default 'running',
  file_name text,
  plan_key text,
  max_rows integer,
  max_images_per_row integer,
  requested_rows integer not null default 0,
  valid_rows integer not null default 0,
  invalid_rows integer not null default 0,
  created_count integer not null default 0,
  image_imported_count integer not null default 0,
  image_skipped_count integer not null default 0,
  quota_snapshot jsonb not null default '{}'::jsonb,
  errors jsonb not null default '[]'::jsonb,
  row_summaries jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  constraint marketplace_company_import_jobs_status_check
    check (status in ('running', 'completed', 'completed_with_warnings', 'failed'))
);

create index if not exists marketplace_company_import_jobs_company_created_idx
  on public.marketplace_company_import_jobs (company_id, created_at desc);

create index if not exists marketplace_company_import_jobs_status_idx
  on public.marketplace_company_import_jobs (status, created_at desc);

alter table public.marketplace_company_import_jobs enable row level security;

drop policy if exists marketplace_company_import_jobs_select_company_members on public.marketplace_company_import_jobs;
create policy marketplace_company_import_jobs_select_company_members
  on public.marketplace_company_import_jobs for select
  to authenticated
  using (
    exists (
      select 1
      from public.marketplace_company_members m
      where m.company_id = marketplace_company_import_jobs.company_id
        and m.user_id = (select auth.uid())
    )
  );

revoke all on public.marketplace_company_import_jobs from anon;
grant select on public.marketplace_company_import_jobs to authenticated;
grant all on public.marketplace_company_import_jobs to service_role;

commit;
