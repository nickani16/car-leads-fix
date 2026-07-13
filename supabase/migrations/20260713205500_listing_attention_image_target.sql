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
    'firstMissingImageId', (
      select id from owned where cardinality(images) = 0 order by updated_at desc limit 1
    ),
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
