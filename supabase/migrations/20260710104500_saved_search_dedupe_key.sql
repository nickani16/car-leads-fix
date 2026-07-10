alter table public.marketplace_saved_searches
  add column if not exists search_key text;

create unique index if not exists marketplace_saved_searches_user_search_key_uidx
  on public.marketplace_saved_searches (user_id, search_key)
  where search_key is not null;
