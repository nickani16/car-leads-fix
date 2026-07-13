begin;

create extension if not exists pg_trgm with schema extensions;

create index if not exists marketplace_listings_seller_updated_idx
  on public.marketplace_listings (seller_user_id, updated_at desc, id desc);

create index if not exists marketplace_listings_management_search_idx
  on public.marketplace_listings using gin ((
    lower(
      coalesce(title, '') || ' ' ||
      coalesce(make, '') || ' ' ||
      coalesce(model, '') || ' ' ||
      coalesce(registration_reference, '') || ' ' ||
      coalesce(vin, '') || ' ' ||
      coalesce(chassis_number, '') || ' ' ||
      coalesce(reference_number, '')
    )
  ) extensions.gin_trgm_ops);

create index if not exists marketplace_listing_events_listing_type_idx
  on public.marketplace_listing_events (listing_id, event_type);

create unique index if not exists refresh_credit_ledger_payment_order_uidx
  on public.refresh_credit_ledger (payment_order_id)
  where payment_order_id is not null and reason = 'purchase';

create or replace function public.increment_refresh_credits(
  p_owner_type text,
  p_owner_id uuid,
  p_credits integer,
  p_payment_order_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted uuid;
begin
  if p_owner_type not in ('user', 'business') then
    raise exception 'Invalid owner type';
  end if;
  if p_credits <= 0 then
    raise exception 'Credits must be positive';
  end if;

  insert into public.refresh_credit_ledger (
    owner_type, owner_id, payment_order_id, change, reason
  )
  values (
    p_owner_type, p_owner_id, p_payment_order_id, p_credits, 'purchase'
  )
  on conflict (payment_order_id) where payment_order_id is not null and reason = 'purchase'
  do nothing
  returning id into v_inserted;

  if v_inserted is null then
    return;
  end if;

  insert into public.refresh_credit_balances (owner_type, owner_id, refresh_credits, updated_at)
  values (p_owner_type, p_owner_id, p_credits, now())
  on conflict (owner_type, owner_id)
  do update
    set refresh_credits = public.refresh_credit_balances.refresh_credits + excluded.refresh_credits,
        updated_at = now();
end;
$$;

revoke all on function public.increment_refresh_credits(text, uuid, integer, uuid) from public, anon, authenticated;
grant execute on function public.increment_refresh_credits(text, uuid, integer, uuid) to service_role;

create or replace function public.fulfill_listing_refresh_purchase(
  p_user_id uuid,
  p_listing_id uuid,
  p_payment_order_id uuid,
  p_cooldown interval default interval '24 hours'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing public.marketplace_listings%rowtype;
  v_inserted uuid;
begin
  select * into v_listing
  from public.marketplace_listings
  where id = p_listing_id
  for update;

  if not found or v_listing.seller_user_id <> p_user_id then
    raise exception 'Listing not found';
  end if;
  if v_listing.status <> 'published' then
    raise exception 'Only published listings can be refreshed';
  end if;
  if v_listing.last_refreshed_at is not null and v_listing.last_refreshed_at > now() - p_cooldown then
    raise exception 'Listing was refreshed too recently';
  end if;

  insert into public.refresh_credit_ledger (
    owner_type, owner_id, listing_id, payment_order_id, change, reason
  )
  values ('user', p_user_id, p_listing_id, p_payment_order_id, 1, 'purchase')
  on conflict (payment_order_id) where payment_order_id is not null and reason = 'purchase'
  do nothing
  returning id into v_inserted;

  if v_inserted is null then
    return;
  end if;

  insert into public.refresh_credit_balances (owner_type, owner_id, refresh_credits, updated_at)
  values ('user', p_user_id, 0, now())
  on conflict (owner_type, owner_id) do nothing;

  update public.marketplace_listings
  set sort_refreshed_at = now(), last_refreshed_at = now()
  where id = p_listing_id;

  insert into public.refresh_credit_ledger (
    owner_type, owner_id, listing_id, payment_order_id, change, reason
  )
  values ('user', p_user_id, p_listing_id, p_payment_order_id, -1, 'use');
end;
$$;

revoke all on function public.fulfill_listing_refresh_purchase(uuid, uuid, uuid, interval)
  from public, anon, authenticated;
grant execute on function public.fulfill_listing_refresh_purchase(uuid, uuid, uuid, interval)
  to service_role;

create or replace function public.bulk_manage_owned_listings(
  p_user_id uuid,
  p_listing_ids uuid[],
  p_action text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_allowed_statuses text[];
  v_target_status text;
  v_expected_count integer;
  v_owned_count integer;
  v_valid_count integer;
  v_updated_count integer;
  v_now timestamptz := now();
begin
  if p_listing_ids is null or cardinality(p_listing_ids) < 1 or cardinality(p_listing_ids) > 100 then
    raise exception 'Select between 1 and 100 listings';
  end if;
  select count(distinct id) into v_expected_count from unnest(p_listing_ids) as selected(id);
  if v_expected_count <> cardinality(p_listing_ids) then
    raise exception 'Duplicate listing ids are not allowed';
  end if;

  case p_action
    when 'pause' then v_allowed_statuses := array['published']; v_target_status := 'paused';
    when 'resume' then v_allowed_statuses := array['paused']; v_target_status := 'published';
    when 'mark_sold' then v_allowed_statuses := array['published', 'paused']; v_target_status := 'sold';
    when 'delete' then v_allowed_statuses := array['draft', 'pending_payment', 'paused', 'expired', 'sold', 'rejected']; v_target_status := 'deleted';
    else raise exception 'Invalid bulk action';
  end case;

  perform 1
  from public.marketplace_listings
  where seller_user_id = p_user_id and id = any(p_listing_ids)
  for update;

  select count(*), count(*) filter (where status = any(v_allowed_statuses))
    into v_owned_count, v_valid_count
  from public.marketplace_listings
  where seller_user_id = p_user_id and id = any(p_listing_ids);

  if v_owned_count <> v_expected_count then
    raise exception 'One or more listings are missing or do not belong to this account';
  end if;
  if v_valid_count <> v_expected_count then
    raise exception 'One or more listings do not allow this action';
  end if;

  insert into public.marketplace_listing_events (
    listing_id, actor_user_id, actor_role, event_type,
    from_status, to_status, from_review_status, to_review_status, metadata
  )
  select id, p_user_id, 'seller', 'listing_bulk_' || p_action,
    status, v_target_status, review_status, review_status,
    jsonb_build_object('bulk_count', v_expected_count)
  from public.marketplace_listings
  where seller_user_id = p_user_id and id = any(p_listing_ids);

  update public.marketplace_listings
  set status = v_target_status,
      sold_at = case when p_action = 'mark_sold' then v_now else sold_at end,
      updated_at = v_now
  where seller_user_id = p_user_id and id = any(p_listing_ids);
  get diagnostics v_updated_count = row_count;
  if v_updated_count <> v_expected_count then
    raise exception 'Bulk update did not update every listing';
  end if;

  return jsonb_build_object('updatedCount', v_updated_count);
end;
$$;

revoke all on function public.bulk_manage_owned_listings(uuid, uuid[], text)
  from public, anon, authenticated;
grant execute on function public.bulk_manage_owned_listings(uuid, uuid[], text)
  to service_role;

create or replace function public.account_listing_management(
  p_user_id uuid,
  p_status text default 'all',
  p_query text default '',
  p_category text default 'all',
  p_country text default 'all',
  p_package text default 'all',
  p_marketing text default 'all',
  p_seller_type text default 'all',
  p_sort text default 'updated_desc',
  p_page integer default 1,
  p_page_size integer default 25
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with
  normalized as (
    select
      greatest(1, coalesce(p_page, 1)) as requested_page,
      least(100, greatest(1, coalesce(p_page_size, 25))) as requested_page_size,
      lower(trim(coalesce(p_query, ''))) as normalized_query
  ),
  view_counts as (
    select event.listing_id, count(*)::bigint as value
    from public.marketplace_listing_events event
    join public.marketplace_listings owner_listing on owner_listing.id = event.listing_id
    where owner_listing.seller_user_id = p_user_id
      and event.event_type = 'listing_view'
    group by event.listing_id
  ),
  favorite_counts as (
    select saved.listing_id, count(*)::bigint as value
    from public.marketplace_saved_listings saved
    join public.marketplace_listings owner_listing on owner_listing.id = saved.listing_id
    where owner_listing.seller_user_id = p_user_id
    group by saved.listing_id
  ),
  filtered as (
    select
      listing.id,
      listing.title,
      listing.status,
      listing.review_status,
      listing.risk_flags,
      listing.category,
      listing.make,
      listing.model,
      listing.registration_reference,
      listing.vin,
      listing.chassis_number,
      listing.price,
      listing.currency,
      listing.images,
      listing.seller_type,
      listing.country_code,
      listing.package_id,
      listing.listing_number,
      listing.reference_number,
      listing.created_at,
      listing.updated_at,
      listing.published_at,
      listing.expires_at,
      listing.last_refreshed_at,
      listing.boost_started_at,
      listing.boost_expires_at,
      listing.boost_status,
      listing.featured_started_at,
      listing.featured_expires_at,
      listing.featured_status,
      coalesce(views.value, 0)::bigint as view_count,
      coalesce(favorites.value, 0)::bigint as favorite_count
    from public.marketplace_listings listing
    cross join normalized
    left join view_counts views on views.listing_id = listing.id
    left join favorite_counts favorites on favorites.listing_id = listing.id
    where listing.seller_user_id = p_user_id
      and (
        coalesce(p_status, 'all') = 'all'
        or (p_status = 'active' and listing.status = 'published')
        or (p_status = 'payment' and listing.status = 'pending_payment')
        or (p_status = 'review' and listing.status in ('pending_review', 'rejected'))
        or (p_status = 'draft' and listing.status = 'draft')
        or (p_status = 'paused' and listing.status = 'paused')
        or (p_status = 'expired' and listing.status = 'expired')
        or (p_status = 'sold' and listing.status = 'sold')
        or (p_status = 'deleted' and listing.status in ('deleted', 'removed'))
      )
      and (coalesce(p_category, 'all') = 'all' or listing.category = p_category)
      and (coalesce(p_country, 'all') = 'all' or lower(listing.country_code) = lower(p_country))
      and (coalesce(p_package, 'all') = 'all' or listing.package_id = p_package)
      and (coalesce(p_seller_type, 'all') = 'all' or listing.seller_type = p_seller_type)
      and (
        coalesce(p_marketing, 'all') = 'all'
        or (
          p_marketing = 'active'
          and (
            (listing.boost_status = 'active' and listing.boost_expires_at > now())
            or (listing.featured_status = 'active' and listing.featured_expires_at > now())
          )
        )
        or (
          p_marketing = 'none'
          and not (
            (listing.boost_status = 'active' and listing.boost_expires_at > now())
            or (listing.featured_status = 'active' and listing.featured_expires_at > now())
          )
        )
      )
      and (
        normalized.normalized_query = ''
        or lower(
          coalesce(listing.title, '') || ' ' ||
          coalesce(listing.make, '') || ' ' ||
          coalesce(listing.model, '') || ' ' ||
          coalesce(listing.registration_reference, '') || ' ' ||
          coalesce(listing.vin, '') || ' ' ||
          coalesce(listing.chassis_number, '') || ' ' ||
          coalesce(listing.reference_number, '')
        ) like '%' || normalized.normalized_query || '%'
        or listing.id::text = normalized.normalized_query
        or coalesce(listing.listing_number::text, '') = normalized.normalized_query
      )
  ),
  ranked as (
    select
      filtered.*,
      row_number() over (
        order by
          case when p_sort = 'created_asc' then filtered.created_at end asc,
          case when p_sort = 'created_desc' then filtered.created_at end desc,
          case when p_sort = 'updated_desc' then filtered.updated_at end desc,
          case when p_sort = 'price_asc' then filtered.price end asc,
          case when p_sort = 'price_desc' then filtered.price end desc,
          case when p_sort = 'views_desc' then filtered.view_count end desc,
          case when p_sort = 'favorites_desc' then filtered.favorite_count end desc,
          case when p_sort = 'expires_asc' then filtered.expires_at end asc nulls last,
          filtered.updated_at desc,
          filtered.id desc
      ) as row_number_value
    from filtered
  ),
  paged as (
    select ranked.*
    from ranked
    cross join normalized
    where ranked.row_number_value > (normalized.requested_page - 1) * normalized.requested_page_size
      and ranked.row_number_value <= normalized.requested_page * normalized.requested_page_size
    order by ranked.row_number_value
  )
  select jsonb_build_object(
    'items', coalesce(
      (select jsonb_agg(to_jsonb(paged) - 'row_number_value' order by paged.row_number_value) from paged),
      '[]'::jsonb
    ),
    'totalCount', (select count(*) from filtered),
    'page', normalized.requested_page,
    'pageSize', normalized.requested_page_size,
    'totalPages', case
      when (select count(*) from filtered) = 0 then 0
      else ceil((select count(*) from filtered)::numeric / normalized.requested_page_size)::integer
    end,
    'hasNext', normalized.requested_page * normalized.requested_page_size < (select count(*) from filtered),
    'hasPrevious', normalized.requested_page > 1
  )
  from normalized;
$$;

revoke all on function public.account_listing_management(uuid, text, text, text, text, text, text, text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.account_listing_management(uuid, text, text, text, text, text, text, text, text, integer, integer)
  to service_role;

create or replace function public.account_listing_summary(p_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with owned as (
    select * from public.marketplace_listings where seller_user_id = p_user_id
  )
  select jsonb_build_object(
    'counts', jsonb_build_object(
      'all', count(*),
      'active', count(*) filter (where status = 'published'),
      'payment', count(*) filter (where status = 'pending_payment'),
      'review', count(*) filter (where status in ('pending_review', 'rejected')),
      'draft', count(*) filter (where status = 'draft'),
      'paused', count(*) filter (where status = 'paused'),
      'expired', count(*) filter (where status = 'expired'),
      'sold', count(*) filter (where status = 'sold'),
      'deleted', count(*) filter (where status in ('deleted', 'removed'))
    ),
    'totalViews', (
      select count(*) from public.marketplace_listing_events event
      join owned listing on listing.id = event.listing_id
      where event.event_type = 'listing_view'
    ),
    'totalFavorites', (
      select count(*) from public.marketplace_saved_listings saved
      join owned listing on listing.id = saved.listing_id
    ),
    'missingImages', count(*) filter (where cardinality(images) = 0),
    'flagged', count(*) filter (where review_status in ('flagged', 'rejected') or status = 'rejected'),
    'expiringSoon', count(*) filter (
      where status = 'published'
        and expires_at is not null
        and expires_at > now()
        and expires_at <= now() + interval '3 days'
    ),
    'failedPayments', (
      select count(distinct payment.listing_id)
      from public.payment_orders payment
      join owned listing on listing.id = payment.listing_id
      where payment.status = 'failed'
        and not exists (
          select 1 from public.payment_orders newer
          where newer.listing_id = payment.listing_id
            and newer.created_at > payment.created_at
            and newer.status in ('checkout_created', 'pending', 'paid', 'fulfilled')
        )
    ),
    'categories', coalesce(
      (select jsonb_agg(category order by category) from (select distinct category from owned) valueset),
      '[]'::jsonb
    ),
    'countries', coalesce(
      (select jsonb_agg(country_code order by country_code) from (select distinct country_code from owned) valueset),
      '[]'::jsonb
    )
  )
  from owned;
$$;

revoke all on function public.account_listing_summary(uuid) from public, anon, authenticated;
grant execute on function public.account_listing_summary(uuid) to service_role;

commit;
