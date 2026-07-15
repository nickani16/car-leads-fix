alter table public.marketplace_saved_searches
  add column if not exists notification_frequency text not null default 'off',
  add column if not exists last_notified_at timestamptz,
  add column if not exists last_notified_listing_id uuid references public.marketplace_listings(id) on delete set null;

alter table public.marketplace_saved_searches
  drop constraint if exists marketplace_saved_searches_notification_frequency_check;

alter table public.marketplace_saved_searches
  add constraint marketplace_saved_searches_notification_frequency_check
  check (notification_frequency in ('off', 'daily', 'instant'));

create index if not exists marketplace_saved_searches_notification_idx
  on public.marketplace_saved_searches (notification_frequency, market_code, updated_at desc)
  where notification_frequency <> 'off';
