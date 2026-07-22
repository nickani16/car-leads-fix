# Architecture

Autorell is a Next.js 16 App Router project deployed on Vercel.

## Next.js Structure

- Public market routes live under `app/[market]`.
- Canonical English/root routes live under `app`.
- API routes live under `app/api`.
- Shared UI components live under `app/components`.
- Marketplace, listing, billing, localization, and Supabase helpers live under `lib`.
- Database migrations live under `supabase/migrations`.

## Frontend

The public experience includes marketplace search, vehicle category pages, listing cards, seller pages, pricing, business pages, help center, vehicle news, and localized market routing.

## Backend

Backend behavior is implemented with Next.js route handlers and Supabase clients. Account listings, listing checkout, saved searches, saved listings, admin workflows, support, newsletters, and Stripe webhooks are route-handler driven.

## Search

Marketplace search uses `lib/marketplace-search-v2.ts`, `lib/search/listing-search.ts`, structured listing fields, and category-specific technical data.

## Stripe

Billing logic is under `lib/billing` and listing checkout routes. Stripe webhook fulfillment is handled by `app/api/stripe/webhook/route.ts`.

## Admin and CMS

Admin routes are under `app/admin` and `app/api/admin`. CMS and vehicle news content are database-driven with preview safeguards.

## Localization

Market and locale logic is handled through `lib/public-i18n.ts`, market cookies/headers, proxy routing, and localized public route aliases.

## Vercel

Production should be Git-integrated from the canonical branch. CLI production deploys are blocked unless explicitly approved after safety checks.
