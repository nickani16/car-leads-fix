create or replace function public.get_marketplace_home_listings(
  p_country_code text,
  p_categories text[],
  p_limit_per_category integer default 17
)
returns setof public.marketplace_listings
language sql
stable
security definer
set search_path = public
as $$
  select (selected.listing).*
  from unnest(p_categories) with ordinality as requested(category, category_order)
  cross join lateral (
    select
      candidates.listing,
      candidates.market_rank,
      candidates.sort_date,
      candidates.published_date,
      candidates.listing_id
    from (
      (
        select
          listing as listing,
          0 as market_rank,
          listing.sort_refreshed_at as sort_date,
          listing.published_at as published_date,
          listing.id as listing_id
        from public.marketplace_listings as listing
        where upper(coalesce(p_country_code, '')) not in ('', 'EU')
          and listing.country_code = upper(p_country_code)
          and listing.category = requested.category
          and listing.status = 'published'
          and listing.published_at is not null
          and listing.sold_at is null
          and (listing.expires_at is null or listing.expires_at > now())
        order by
          listing.sort_refreshed_at desc nulls last,
          listing.published_at desc,
          listing.id desc
        limit greatest(1, least(p_limit_per_category, 50))
      )
      union all
      (
        select
          listing as listing,
          1 as market_rank,
          listing.sort_refreshed_at as sort_date,
          listing.published_at as published_date,
          listing.id as listing_id
        from public.marketplace_listings as listing
        where (
            upper(coalesce(p_country_code, '')) in ('', 'EU')
            or listing.country_code <> upper(p_country_code)
          )
          and listing.category = requested.category
          and listing.status = 'published'
          and listing.published_at is not null
          and listing.sold_at is null
          and (listing.expires_at is null or listing.expires_at > now())
        order by
          listing.sort_refreshed_at desc nulls last,
          listing.published_at desc,
          listing.id desc
        limit greatest(1, least(p_limit_per_category, 50))
      )
    ) as candidates
    order by
      candidates.market_rank,
      candidates.sort_date desc nulls last,
      candidates.published_date desc,
      candidates.listing_id desc
    limit greatest(1, least(p_limit_per_category, 50))
  ) as selected
  order by
    requested.category_order,
    selected.market_rank,
    selected.sort_date desc nulls last,
    selected.published_date desc,
    selected.listing_id desc;
$$;

revoke all on function public.get_marketplace_home_listings(text, text[], integer)
from public, anon, authenticated;

grant execute on function public.get_marketplace_home_listings(text, text[], integer)
to service_role;
