create table if not exists public.dealer_legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  accepted_by_name text not null,
  accepted_email text not null,
  dealer_terms_version text not null,
  privacy_notice_version text not null,
  dealer_terms_accepted boolean not null,
  privacy_notice_acknowledged boolean not null,
  accepted_at timestamptz not null,
  ip_address inet,
  user_agent text,
  source text not null default 'dealer_application',
  created_at timestamptz not null default now(),

  constraint dealer_terms_must_be_accepted
    check (dealer_terms_accepted = true),

  constraint privacy_notice_must_be_acknowledged
    check (privacy_notice_acknowledged = true),

  constraint one_application_acceptance_per_user
    unique (user_id, dealer_terms_version, privacy_notice_version, source)
);

create index if not exists dealer_legal_acceptances_user_id_idx
  on public.dealer_legal_acceptances(user_id);

create index if not exists dealer_legal_acceptances_accepted_at_idx
  on public.dealer_legal_acceptances(accepted_at desc);

alter table public.dealer_legal_acceptances enable row level security;

create or replace function public.prevent_legal_acceptance_changes()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Legal acceptance records are immutable';
end;
$$;

drop trigger if exists prevent_legal_acceptance_update
on public.dealer_legal_acceptances;

create trigger prevent_legal_acceptance_update
before update on public.dealer_legal_acceptances
for each row
execute function public.prevent_legal_acceptance_changes();

drop trigger if exists prevent_legal_acceptance_delete
on public.dealer_legal_acceptances;

create trigger prevent_legal_acceptance_delete
before delete on public.dealer_legal_acceptances
for each row
execute function public.prevent_legal_acceptance_changes();

revoke all on public.dealer_legal_acceptances
from public, anon, authenticated;

