create table if not exists public.marketplace_company_members (
  id uuid default gen_random_uuid(),
  company_id uuid not null references public.marketplace_companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketplace_company_members
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists invited_by uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'marketplace_company_members_role_check'
      and conrelid = 'public.marketplace_company_members'::regclass
  ) then
    alter table public.marketplace_company_members
      add constraint marketplace_company_members_role_check
      check (role in ('owner','admin','manager','sales','staff','viewer','contact_person'));
  end if;
end $$;

create unique index if not exists marketplace_company_members_company_user_idx
  on public.marketplace_company_members (company_id, user_id);

create index if not exists marketplace_company_members_user_idx
  on public.marketplace_company_members (user_id, company_id);

alter table public.marketplace_company_members enable row level security;
revoke all on public.marketplace_company_members from anon, authenticated;

drop policy if exists marketplace_company_members_select_self on public.marketplace_company_members;
create policy marketplace_company_members_select_self
  on public.marketplace_company_members for select
  to authenticated
  using (user_id = (select auth.uid()));

grant select on public.marketplace_company_members to authenticated;

create table if not exists public.marketplace_company_invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.marketplace_companies(id) on delete cascade,
  email text not null,
  role text not null default 'staff' check (role in ('admin','manager','sales','staff','viewer')),
  token_hash text not null unique,
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null,
  email_status text not null default 'pending' check (email_status in ('pending','sent','failed','skipped')),
  provider_message_id text,
  email_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists marketplace_company_invitations_pending_email_idx
  on public.marketplace_company_invitations (company_id, lower(email))
  where status = 'pending';

create index if not exists marketplace_company_invitations_company_status_idx
  on public.marketplace_company_invitations (company_id, status, created_at desc);

alter table public.marketplace_company_invitations enable row level security;
revoke all on public.marketplace_company_invitations from anon, authenticated;

drop policy if exists marketplace_company_invitations_select_inviter on public.marketplace_company_invitations;
create policy marketplace_company_invitations_select_inviter
  on public.marketplace_company_invitations for select
  to authenticated
  using (invited_by = (select auth.uid()));

grant select on public.marketplace_company_invitations to authenticated;
