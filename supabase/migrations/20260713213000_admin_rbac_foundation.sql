-- Autorell Admin phase 1: server-controlled RBAC and append-only audit foundation.
-- This migration is additive and keeps public.admin_users during the transition.

create table if not exists public.admin_roles (
  role_key text primary key,
  name text not null,
  description text not null default '',
  is_system boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_roles_key_check check (
    role_key in (
      'super_admin',
      'operations_admin',
      'moderator',
      'support_admin',
      'finance_admin',
      'content_editor',
      'analyst'
    )
  )
);

create table if not exists public.admin_permissions (
  permission_key text primary key,
  description text not null default '',
  is_sensitive boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_role_permissions (
  role_key text not null references public.admin_roles(role_key) on delete cascade,
  permission_key text not null references public.admin_permissions(permission_key) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_key, permission_key)
);

create table if not exists public.user_admin_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_key text not null references public.admin_roles(role_key),
  is_active boolean not null default true,
  assigned_by uuid references auth.users(id) on delete set null,
  assignment_reason text,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, role_key),
  constraint user_admin_roles_expiry_check check (
    expires_at is null or expires_at > starts_at
  )
);

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null,
  resource_id text not null,
  author_user_id uuid references auth.users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint admin_notes_body_check check (char_length(btrim(body)) between 1 and 5000)
);

create table if not exists public.admin_saved_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  area text not null,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  visible_columns text[] not null default '{}'::text[],
  sort jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, area, name)
);

alter table public.admin_audit_log
  add column if not exists permission text,
  add column if not exists success boolean not null default true,
  add column if not exists error_code text,
  add column if not exists request_id text,
  add column if not exists session_id text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists user_admin_roles_active_user_idx
  on public.user_admin_roles (user_id, is_active, expires_at);
create index if not exists admin_role_permissions_role_idx
  on public.admin_role_permissions (role_key, permission_key);
create index if not exists admin_notes_resource_idx
  on public.admin_notes (resource_type, resource_id, created_at desc)
  where archived_at is null;
create index if not exists admin_saved_views_user_area_idx
  on public.admin_saved_views (user_id, area);
create index if not exists admin_audit_log_permission_created_idx
  on public.admin_audit_log (permission, created_at desc);
create index if not exists admin_audit_log_success_created_idx
  on public.admin_audit_log (success, created_at desc);

alter table public.admin_roles enable row level security;
alter table public.admin_permissions enable row level security;
alter table public.admin_role_permissions enable row level security;
alter table public.user_admin_roles enable row level security;
alter table public.admin_notes enable row level security;
alter table public.admin_saved_views enable row level security;
alter table public.admin_audit_log enable row level security;

revoke all on table public.admin_roles from anon, authenticated;
revoke all on table public.admin_permissions from anon, authenticated;
revoke all on table public.admin_role_permissions from anon, authenticated;
revoke all on table public.user_admin_roles from anon, authenticated;
revoke all on table public.admin_notes from anon, authenticated;
revoke all on table public.admin_saved_views from anon, authenticated;
revoke all on table public.admin_audit_log from anon, authenticated;

grant select, insert, update, delete on table public.admin_roles to service_role;
grant select, insert, update, delete on table public.admin_permissions to service_role;
grant select, insert, update, delete on table public.admin_role_permissions to service_role;
grant select, insert, update, delete on table public.user_admin_roles to service_role;
grant select, insert, update, delete on table public.admin_notes to service_role;
grant select, insert, update, delete on table public.admin_saved_views to service_role;

-- Audit records are append-only for the application service role.
revoke all on table public.admin_audit_log from service_role;
grant select, insert on table public.admin_audit_log to service_role;

insert into public.admin_roles (role_key, name, description)
values
  ('super_admin', 'Super Admin', 'Full platform and access-control authority.'),
  ('operations_admin', 'Operations Admin', 'Daily marketplace operations.'),
  ('moderator', 'Moderator', 'Listings, moderation and abuse reports.'),
  ('support_admin', 'Support Admin', 'Support cases and limited account actions.'),
  ('finance_admin', 'Finance Admin', 'Payments, subscriptions and refunds.'),
  ('content_editor', 'Content Editor', 'Editorial content, media and newsletters.'),
  ('analyst', 'Analyst', 'Read-only analytics and reporting.')
on conflict (role_key) do update
set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

insert into public.admin_permissions (permission_key, description, is_sensitive)
values
  ('dashboard.view', 'View the operational dashboard.', false),
  ('users.read', 'Read user profiles and account history.', true),
  ('users.manage', 'Perform limited account actions.', true),
  ('users.delete', 'Start a controlled user deletion.', true),
  ('companies.read', 'Read companies and verification data.', true),
  ('companies.manage', 'Manage company profiles and memberships.', true),
  ('companies.verify', 'Approve, reject or revoke company verification.', true),
  ('listings.read', 'Read all listing data.', false),
  ('listings.manage', 'Edit listing data and lifecycle.', true),
  ('listings.delete', 'Soft-delete or restore listings.', true),
  ('moderation.read', 'Read moderation queues and signals.', true),
  ('moderation.manage', 'Resolve moderation cases.', true),
  ('reports.read', 'Read abuse reports.', true),
  ('reports.manage', 'Investigate and resolve abuse reports.', true),
  ('payments.read', 'Read payments and Stripe references.', true),
  ('payments.manage', 'Refund or compensate through controlled flows.', true),
  ('subscriptions.read', 'Read subscriptions and packages.', true),
  ('subscriptions.manage', 'Manage subscriptions and benefits.', true),
  ('support.read', 'Read support cases.', true),
  ('support.manage', 'Reply, assign and resolve support cases.', true),
  ('content.read', 'Read editorial content.', false),
  ('content.manage', 'Create and publish editorial content.', true),
  ('newsletters.read', 'Read newsletter campaigns and segments.', true),
  ('newsletters.manage', 'Create, schedule and send newsletters.', true),
  ('media.read', 'Read the admin media library.', false),
  ('media.manage', 'Upload and manage admin media.', true),
  ('markets.read', 'Read market and locale configuration.', false),
  ('markets.manage', 'Change market and locale configuration.', true),
  ('vehicle_data.read', 'Read vehicle taxonomy.', false),
  ('vehicle_data.manage', 'Change versioned vehicle taxonomy.', true),
  ('security.read', 'Read role-masked security events.', true),
  ('security.manage', 'Block access and revoke sessions.', true),
  ('analytics.read', 'Read aggregate analytics.', false),
  ('system.read', 'Read system status.', false),
  ('system.manage', 'Change system-critical configuration.', true),
  ('audit.read', 'Read append-only admin audit logs.', true),
  ('settings.read', 'Read admin settings.', false),
  ('settings.manage', 'Change admin settings.', true),
  ('administrators.read', 'Read administrator roles and assignments.', true),
  ('administrators.manage', 'Assign administrator roles and permissions.', true)
on conflict (permission_key) do update
set
  description = excluded.description,
  is_sensitive = excluded.is_sensitive;

insert into public.admin_role_permissions (role_key, permission_key)
select 'super_admin', permission_key
from public.admin_permissions
on conflict do nothing;

insert into public.admin_role_permissions (role_key, permission_key)
values
  ('operations_admin', 'dashboard.view'),
  ('operations_admin', 'users.read'),
  ('operations_admin', 'users.manage'),
  ('operations_admin', 'companies.read'),
  ('operations_admin', 'companies.manage'),
  ('operations_admin', 'companies.verify'),
  ('operations_admin', 'listings.read'),
  ('operations_admin', 'listings.manage'),
  ('operations_admin', 'listings.delete'),
  ('operations_admin', 'moderation.read'),
  ('operations_admin', 'moderation.manage'),
  ('operations_admin', 'reports.read'),
  ('operations_admin', 'reports.manage'),
  ('operations_admin', 'payments.read'),
  ('operations_admin', 'subscriptions.read'),
  ('operations_admin', 'support.read'),
  ('operations_admin', 'support.manage'),
  ('operations_admin', 'security.read'),
  ('operations_admin', 'analytics.read'),
  ('operations_admin', 'system.read'),
  ('operations_admin', 'settings.read'),
  ('moderator', 'dashboard.view'),
  ('moderator', 'users.read'),
  ('moderator', 'companies.read'),
  ('moderator', 'listings.read'),
  ('moderator', 'listings.manage'),
  ('moderator', 'moderation.read'),
  ('moderator', 'moderation.manage'),
  ('moderator', 'reports.read'),
  ('moderator', 'reports.manage'),
  ('support_admin', 'dashboard.view'),
  ('support_admin', 'users.read'),
  ('support_admin', 'users.manage'),
  ('support_admin', 'companies.read'),
  ('support_admin', 'listings.read'),
  ('support_admin', 'reports.read'),
  ('support_admin', 'support.read'),
  ('support_admin', 'support.manage'),
  ('finance_admin', 'dashboard.view'),
  ('finance_admin', 'users.read'),
  ('finance_admin', 'companies.read'),
  ('finance_admin', 'listings.read'),
  ('finance_admin', 'payments.read'),
  ('finance_admin', 'payments.manage'),
  ('finance_admin', 'subscriptions.read'),
  ('finance_admin', 'subscriptions.manage'),
  ('content_editor', 'dashboard.view'),
  ('content_editor', 'content.read'),
  ('content_editor', 'content.manage'),
  ('content_editor', 'newsletters.read'),
  ('content_editor', 'newsletters.manage'),
  ('content_editor', 'media.read'),
  ('content_editor', 'media.manage'),
  ('analyst', 'dashboard.view'),
  ('analyst', 'analytics.read')
on conflict do nothing;

insert into public.user_admin_roles (
  user_id,
  role_key,
  is_active,
  assignment_reason,
  starts_at,
  created_at,
  updated_at
)
select
  user_id,
  case lower(role)
    when 'super_admin' then 'super_admin'
    when 'moderator' then 'moderator'
    when 'support_admin' then 'support_admin'
    when 'finance_admin' then 'finance_admin'
    when 'content_editor' then 'content_editor'
    when 'analyst' then 'analyst'
    else 'operations_admin'
  end,
  is_active,
  'Backfilled from public.admin_users during RBAC migration.',
  created_at,
  created_at,
  now()
from public.admin_users
on conflict (user_id, role_key) do update
set
  is_active = excluded.is_active,
  updated_at = now();

comment on table public.admin_roles is 'Stable Autorell administrator roles.';
comment on table public.admin_permissions is 'Fine-grained server permissions; never sourced from user_metadata.';
comment on table public.user_admin_roles is 'Time-bounded administrator role assignments.';
comment on table public.admin_audit_log is 'Append-only audit trail for sensitive administrative actions.';
