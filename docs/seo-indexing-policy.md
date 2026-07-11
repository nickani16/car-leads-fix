# Autorell SEO indexing policy

Autorell only indexes stable, intentional landing pages and active listing pages.

## Faceted search

Search URLs with real filters such as fuel, colour, price, year, mileage, sort, page size or seller type must use `noindex,follow` and self-canonical URLs. They must not canonicalize to a broader SEO landing page because that can collapse materially different result sets into one URL.

Tracking-only parameters may be ignored for canonical decisions.

## SEO landing thresholds

SEO landing pages are indexable only when the route is validated and has enough active listings:

- Category: 1 active listing.
- Category plus make: 3 active listings.
- Category plus make plus model: 3 active listings.
- Location pages: 5 active listings.

Pages below the threshold remain renderable for users but emit `noindex,follow`. This avoids opening thin or unstable pages while inventory is still forming.

## Listing status

Published listings render with `index,follow`, appear in listing sitemaps and expose an `Offer` with `InStock`.

Sold listings remain available as 200 responses for users and historical context, but use `noindex,follow`, are excluded from sitemaps and do not expose an active `Offer`.

Paused, rejected, expired and unpublished listings are not public.
