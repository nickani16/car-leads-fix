alter table public.auth_email_codes add column if not exists email text;

do $$
begin
  if (select column_default is null from information_schema.columns where table_schema='public' and table_name='newsletter_subscribers' and column_name='id') then
    create sequence if not exists public.newsletter_subscribers_id_seq;
    alter sequence public.newsletter_subscribers_id_seq owned by public.newsletter_subscribers.id;
    alter table public.newsletter_subscribers alter column id set default nextval('public.newsletter_subscribers_id_seq');
  end if;
end $$;
grant usage, select on sequence public.newsletter_subscribers_id_seq to service_role;

create table if not exists public.newsletter_preview_tokens (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.newsletter_campaigns(id) on delete cascade,
  token_hash text not null unique,
  recipient_email text not null,
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint newsletter_preview_expiry_check check (expires_at > created_at)
);

alter table public.newsletter_preview_tokens enable row level security;
revoke all on table public.newsletter_preview_tokens from anon, authenticated;
grant select, insert, update, delete on table public.newsletter_preview_tokens to service_role;
create index if not exists newsletter_preview_active_idx
  on public.newsletter_preview_tokens(token_hash, expires_at) where consumed_at is null;

comment on table public.newsletter_preview_tokens is
  'Hashed, time-bounded test-email web preview tokens. Test sends never make campaigns public.';
