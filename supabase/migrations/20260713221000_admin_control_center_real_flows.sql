-- Connect the Admin Control Center to public content, media, staff, support and notifications.
-- Requires the RBAC foundation and phases 2-6 migrations.

insert into public.admin_permissions (permission_key, description, is_sensitive)
values ('platform.super_admin', 'Explicit full-platform authority; MFA and audit remain mandatory.', true)
on conflict (permission_key) do update
set description = excluded.description, is_sensitive = excluded.is_sensitive;

insert into public.admin_role_permissions (role_key, permission_key)
select 'super_admin', permission_key from public.admin_permissions
on conflict do nothing;

create or replace function public.grant_new_permission_to_super_admin()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.admin_role_permissions (role_key, permission_key)
  values ('super_admin', new.permission_key)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists admin_permissions_super_admin_grant on public.admin_permissions;
create trigger admin_permissions_super_admin_grant
  after insert on public.admin_permissions
  for each row execute function public.grant_new_permission_to_super_admin();
revoke all on function public.grant_new_permission_to_super_admin() from public, anon, authenticated;

alter table public.content_posts drop constraint if exists content_posts_status_check;
alter table public.content_posts
  add constraint content_posts_status_check
  check (status in ('draft','review','scheduled','published','unpublished','archived'));

create table if not exists public.content_categories (
  id uuid primary key default gen_random_uuid(),
  category_key text not null unique check (category_key ~ '^[a-z0-9][a-z0-9_-]{1,63}$'),
  translations jsonb not null default '{}',
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_posts
  add column if not exists category_id uuid references public.content_categories(id) on delete set null,
  add column if not exists author_name text,
  add column if not exists reading_time_minutes integer check (reading_time_minutes is null or reading_time_minutes between 1 and 240),
  add column if not exists canonical_url text,
  add column if not exists related_post_ids uuid[] not null default '{}',
  add column if not exists view_count bigint not null default 0,
  add column if not exists unpublished_at timestamptz;

alter table public.media_assets
  add column if not exists original_filename text,
  add column if not exists original_mime_type text,
  add column if not exists checksum_sha256 text,
  add column if not exists public_url text,
  add column if not exists variants jsonb not null default '{}',
  add column if not exists crop jsonb not null default '{}';

create table if not exists public.content_post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.content_posts(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  usage_type text not null check (usage_type in ('hero','inline','social','newsletter')),
  alt_text text,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (post_id, media_id, usage_type, sort_order)
);

create table if not exists public.content_preview_tokens (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.content_posts(id) on delete cascade,
  token_hash text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint content_preview_expiry_check check (expires_at > created_at)
);

alter table public.newsletter_campaigns
  add column if not exists slug text,
  add column if not exists introduction text,
  add column if not exists items jsonb not null default '[]',
  add column if not exists cta jsonb not null default '{}',
  add column if not exists public_at timestamptz,
  add column if not exists paused_at timestamptz,
  add column if not exists provider_batch_id text,
  add column if not exists last_test_sent_at timestamptz;

create unique index if not exists newsletter_campaign_slug_market_language_uidx
  on public.newsletter_campaigns (slug, market, language) where slug is not null;

alter table public.newsletter_subscribers
  add column if not exists unsubscribe_token_hash text;
create unique index if not exists newsletter_unsubscribe_token_uidx
  on public.newsletter_subscribers (unsubscribe_token_hash) where unsubscribe_token_hash is not null;

create table if not exists public.admin_staff_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  display_name text not null,
  role_key text not null references public.admin_roles(role_key),
  permission_keys text[] not null default '{}',
  token_hash text not null unique,
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  invited_by uuid references auth.users(id) on delete set null,
  accepted_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_staff_invitation_expiry_check check (expires_at > created_at)
);
create unique index if not exists admin_staff_pending_email_uidx
  on public.admin_staff_invitations (lower(email)) where status = 'pending';

create table if not exists public.support_inboxes (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  sender_email text not null,
  reply_to text,
  market text,
  language text,
  ticket_category text,
  assigned_group text,
  provider_domain_status text not null default 'unknown' check (provider_domain_status in ('unknown','pending','verified','failed')),
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_reply_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  market text,
  language text not null,
  subject text,
  body text not null check (char_length(btrim(body)) between 1 and 10000),
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_tickets
  add column if not exists company_id uuid references public.marketplace_companies(id) on delete set null,
  add column if not exists payment_order_id uuid references public.payment_orders(id) on delete set null,
  add column if not exists support_inbox_id uuid references public.support_inboxes(id) on delete set null,
  add column if not exists escalated_at timestamptz;

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  notification_type text not null,
  title text not null,
  body text,
  priority text not null default 'normal' check (priority in ('low','normal','high','critical')),
  status text not null default 'unread' check (status in ('unread','read','assigned','closed','escalated')),
  resource_type text,
  resource_id text,
  action_url text,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by_event text,
  metadata jsonb not null default '{}',
  read_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  recipient_email text,
  notification_type text not null,
  email_enabled boolean not null default true,
  in_app_enabled boolean not null default true,
  market text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_notification_recipient_check check (user_id is not null or recipient_email is not null),
  unique nulls not distinct (user_id, recipient_email, notification_type, market)
);

create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null,
  market text not null,
  language text not null,
  subject text not null,
  html_body text not null,
  text_body text,
  is_active boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (template_key, market, language)
);

create index if not exists content_categories_active_sort_idx on public.content_categories(is_active, sort_order);
create index if not exists content_posts_public_idx on public.content_posts(market, language, published_at desc) where status = 'published';
create index if not exists content_post_media_post_idx on public.content_post_media(post_id, usage_type, sort_order);
create index if not exists content_preview_active_idx on public.content_preview_tokens(token_hash, expires_at) where revoked_at is null;
create index if not exists admin_staff_invitation_status_idx on public.admin_staff_invitations(status, expires_at);
create index if not exists support_inboxes_active_idx on public.support_inboxes(is_active, market, language);
create index if not exists admin_notifications_queue_idx on public.admin_notifications(status, priority, created_at desc);
create index if not exists admin_notifications_resource_idx on public.admin_notifications(resource_type, resource_id);

insert into public.content_categories (category_key, translations, sort_order)
values
  ('cars', '{"sv":"Bilar","en":"Cars","de":"Autos"}', 10),
  ('vans', '{"sv":"Transportbilar","en":"Vans","de":"Transporter"}', 20),
  ('trucks', '{"sv":"Lastbilar","en":"Trucks","de":"Lkw"}', 30),
  ('motorcycles', '{"sv":"Motorcyklar","en":"Motorcycles","de":"Motorräder"}', 40),
  ('motorhomes', '{"sv":"Husbilar","en":"Motorhomes","de":"Wohnmobile"}', 50),
  ('caravans', '{"sv":"Husvagnar","en":"Caravans","de":"Wohnwagen"}', 60),
  ('electric', '{"sv":"Elfordon","en":"Electric vehicles","de":"Elektrofahrzeuge"}', 70),
  ('agriculture', '{"sv":"Lantbruk","en":"Agriculture","de":"Landwirtschaft"}', 80),
  ('construction', '{"sv":"Entreprenad","en":"Construction","de":"Baumaschinen"}', 90),
  ('market', '{"sv":"Marknad","en":"Market","de":"Markt"}', 100),
  ('technology', '{"sv":"Teknik","en":"Technology","de":"Technik"}', 110),
  ('guides', '{"sv":"Guider","en":"Guides","de":"Ratgeber"}', 120),
  ('buy-sell', '{"sv":"Köp och sälj","en":"Buy and sell","de":"Kaufen und verkaufen"}', 130)
on conflict (category_key) do update
set translations = excluded.translations, sort_order = excluded.sort_order, updated_at = now();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('autorell-media', 'autorell-media', true, 15728640, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update
set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'content_categories','content_post_media','content_preview_tokens','admin_staff_invitations',
    'support_inboxes','support_reply_templates','admin_notifications','admin_notification_preferences','email_templates'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on table public.%I to service_role', table_name);
  end loop;
end $$;

comment on table public.content_preview_tokens is 'Hashed, time-bounded preview capability; raw tokens are never stored.';
comment on table public.admin_staff_invitations is 'OTP-compatible staff invitations linked to existing or future auth identities.';
comment on table public.admin_notifications is 'Shared operational notification queue for the Admin Control Center.';
