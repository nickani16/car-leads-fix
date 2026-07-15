-- Autorell Admin phases 2-6. Additive, server-controlled operational domains.

create table if not exists public.business_verification_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.marketplace_companies(id) on delete cascade,
  status text not null default 'submitted' check (status in ('draft','submitted','under_review','more_information_required','approved','rejected','suspended','revoked')),
  risk_flags text[] not null default '{}',
  submitted_by uuid references auth.users(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  decided_by uuid references auth.users(id) on delete set null,
  decision_reason text,
  submitted_at timestamptz not null default now(),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_verification_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.business_verification_requests(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  from_status text,
  to_status text,
  reason text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.moderation_cases (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.marketplace_listings(id) on delete set null,
  subject_user_id uuid references auth.users(id) on delete set null,
  source text not null default 'automatic',
  case_type text not null,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  priority integer not null default 50 check (priority between 0 and 100),
  status text not null default 'open' check (status in ('open','assigned','awaiting_information','action_taken','rejected','closed')),
  assigned_to uuid references auth.users(id) on delete set null,
  sla_due_at timestamptz,
  evidence jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.moderation_cases(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  reason text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_finance_cases (
  id uuid primary key default gen_random_uuid(),
  payment_order_id uuid references public.payment_orders(id) on delete set null,
  subscription_id uuid references public.business_subscriptions(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  case_type text not null check (case_type in ('payment_review','refund_request','compensation_credit','subscription_adjustment','webhook_review')),
  status text not null default 'open' check (status in ('open','approved','rejected','executed','closed')),
  amount_minor bigint check (amount_minor is null or amount_minor >= 0),
  currency text,
  reason text not null,
  created_by uuid references auth.users(id) on delete set null,
  decided_by uuid references auth.users(id) on delete set null,
  decision_reason text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anonymous_session_id text,
  locale text,
  country text,
  customer_language text,
  status text not null default 'active' check (status in ('active','escalated','closed')),
  linked_ticket_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_chat_identity_check check (user_id is not null or anonymous_session_id is not null)
);

create table if not exists public.support_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.support_chat_sessions(id) on delete cascade,
  role text not null check (role in ('customer','ai','support','system')),
  message text not null check (char_length(btrim(message)) between 1 and 10000),
  original_language text,
  translated_message text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  listing_id uuid references public.marketplace_listings(id) on delete set null,
  chat_session_id uuid,
  assigned_to uuid references auth.users(id) on delete set null,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_country text,
  subject text not null check (char_length(btrim(subject)) between 1 and 200),
  category text not null default 'other' check (category in ('listing','account','payment','business_account','report_listing','fraud','gdpr','technical','other')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'open' check (status in ('open','waiting_customer','waiting_internal','resolved','closed')),
  customer_language text,
  ai_summary text,
  ai_risk_level text,
  ai_recommended_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_type text not null check (author_type in ('customer','support','ai','system')),
  message text not null check (char_length(btrim(message)) between 1 and 10000),
  is_internal boolean not null default false,
  original_language text,
  translated_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.support_ticket_events (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.support_agent_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'support',
  languages text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_tickets
  drop constraint if exists support_tickets_chat_session_fk;
alter table public.support_tickets
  add constraint support_tickets_chat_session_fk foreign key (chat_session_id) references public.support_chat_sessions(id) on delete set null;

alter table public.support_chat_sessions
  drop constraint if exists support_chat_sessions_linked_ticket_fk;
alter table public.support_chat_sessions
  add constraint support_chat_sessions_linked_ticket_fk foreign key (linked_ticket_id) references public.support_tickets(id) on delete set null;

create table if not exists public.content_posts (
  id uuid primary key default gen_random_uuid(),
  translation_group_id uuid not null default gen_random_uuid(),
  post_type text not null check (post_type in ('news','blog','buying_guide','selling_guide','category_copy','campaign','help_article')),
  status text not null default 'draft' check (status in ('draft','review','scheduled','published','archived')),
  title text not null,
  excerpt text,
  body jsonb not null default '{}',
  slug text not null,
  language text not null default 'sv',
  market text not null default 'SE',
  author_user_id uuid references auth.users(id) on delete set null,
  hero_media_id uuid,
  seo_title text,
  meta_description text,
  social_media_id uuid,
  tags text[] not null default '{}',
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, language, market)
);

create table if not exists public.content_post_versions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.content_posts(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  change_reason text,
  created_at timestamptz not null default now(),
  unique (post_id, version)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  object_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','image/avif')),
  byte_size bigint not null check (byte_size > 0),
  width integer,
  height integer,
  alt_text text,
  caption text,
  focal_point jsonb not null default '{}',
  usage_count integer not null default 0,
  status text not null default 'active' check (status in ('active','archived','deleted')),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_posts
  drop constraint if exists content_posts_hero_media_fk,
  drop constraint if exists content_posts_social_media_fk;

alter table public.content_posts
  add constraint content_posts_hero_media_fk foreign key (hero_media_id) references public.media_assets(id) on delete set null,
  add constraint content_posts_social_media_fk foreign key (social_media_id) references public.media_assets(id) on delete set null;

create table if not exists public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  preview_text text,
  content jsonb not null default '{}',
  status text not null default 'draft' check (status in ('draft','review','scheduled','sending','sent','cancelled')),
  market text not null,
  language text not null,
  segment jsonb not null default '{}',
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.newsletter_campaigns(id) on delete cascade,
  subscriber_id bigint references public.newsletter_subscribers(id) on delete set null,
  status text not null default 'queued' check (status in ('queued','sent','delivered','bounced','complained','failed','unsubscribed')),
  provider_message_id text,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.newsletter_subscribers
  add column if not exists language text,
  add column if not exists market text,
  add column if not exists consent_source text,
  add column if not exists consented_at timestamptz,
  add column if not exists unsubscribed_at timestamptz;

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  severity text not null default 'low' check (severity in ('low','medium','high','critical')),
  ip_address inet,
  ip_masked text,
  country_code text,
  region text,
  user_agent text,
  session_id uuid,
  risk_score integer not null default 0 check (risk_score between 0 and 100),
  metadata jsonb not null default '{}',
  occurred_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '180 days')
);

create table if not exists public.admin_session_registry (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  auth_session_id uuid,
  assurance_level text,
  ip_address inet,
  user_agent text,
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revoke_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.ip_blocks (
  id uuid primary key default gen_random_uuid(),
  ip_network cidr not null,
  status text not null default 'active' check (status in ('active','expired','revoked')),
  reason text not null,
  created_by uuid references auth.users(id) on delete set null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint ip_blocks_time_check check (ends_at > starts_at)
);

create table if not exists public.system_alerts (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  severity text not null check (severity in ('info','warning','error','critical')),
  title text not null,
  detail text,
  status text not null default 'open' check (status in ('open','acknowledged','resolved')),
  metadata jsonb not null default '{}',
  acknowledged_by uuid references auth.users(id) on delete set null,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.system_settings (
  setting_key text primary key,
  value jsonb not null,
  is_sensitive boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists business_verification_status_idx on public.business_verification_requests(status, updated_at desc);
create index if not exists moderation_cases_queue_idx on public.moderation_cases(status, severity, priority desc, created_at);
create index if not exists moderation_actions_case_idx on public.moderation_actions(case_id, created_at desc);
create index if not exists finance_cases_status_idx on public.admin_finance_cases(status, created_at desc);
create index if not exists support_chat_sessions_user_idx on public.support_chat_sessions(user_id, status, updated_at desc);
create index if not exists support_chat_sessions_anonymous_idx on public.support_chat_sessions(anonymous_session_id, status, updated_at desc);
create index if not exists support_chat_messages_session_idx on public.support_chat_messages(session_id, created_at);
create index if not exists support_tickets_queue_idx on public.support_tickets(status, priority, updated_at desc);
create index if not exists support_messages_ticket_idx on public.support_messages(ticket_id, created_at);
create index if not exists content_posts_status_idx on public.content_posts(status, market, language, updated_at desc);
create index if not exists media_assets_status_idx on public.media_assets(status, created_at desc);
create index if not exists newsletter_campaigns_status_idx on public.newsletter_campaigns(status, scheduled_at);
create index if not exists newsletter_deliveries_campaign_idx on public.newsletter_deliveries(campaign_id, status);
create index if not exists security_events_time_idx on public.security_events(severity, occurred_at desc);
create index if not exists security_events_user_idx on public.security_events(user_id, occurred_at desc);
create index if not exists admin_session_user_idx on public.admin_session_registry(user_id, revoked_at, last_seen_at desc);
create index if not exists ip_blocks_active_idx on public.ip_blocks(status, ends_at);
create index if not exists system_alerts_status_idx on public.system_alerts(status, severity, created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'business_verification_requests','business_verification_events','moderation_cases','moderation_actions',
    'admin_finance_cases','support_chat_sessions','support_chat_messages','support_tickets','support_messages','support_ticket_events','support_agent_profiles',
    'content_posts','content_post_versions','media_assets','newsletter_campaigns','newsletter_deliveries',
    'security_events','admin_session_registry','ip_blocks','system_alerts','system_settings'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on table public.%I to service_role', table_name);
  end loop;
end $$;

-- Append-only evidence tables: application code may insert and read, never rewrite history.
revoke update, delete on table public.business_verification_events from service_role;
revoke update, delete on table public.moderation_actions from service_role;
revoke update, delete on table public.support_ticket_events from service_role;
revoke update, delete on table public.security_events from service_role;
revoke update, delete on table public.content_post_versions from service_role;

comment on table public.security_events is 'Server-written security telemetry with bounded retention.';
comment on table public.ip_blocks is 'Time-bounded network blocks; permanent blocks are intentionally unsupported.';
comment on table public.newsletter_campaigns is 'Campaign drafts; application must enforce consent before any send operation.';
