begin;

alter table public.business_subscriptions
  add column if not exists cancellation_requested_at timestamptz,
  add column if not exists cancellation_effective_at timestamptz,
  add column if not exists cancellation_reason text,
  add column if not exists cancelled_at timestamptz;

create index if not exists business_subscriptions_cancellation_idx
  on public.business_subscriptions (user_id, cancel_at_period_end, cancellation_effective_at);

commit;
