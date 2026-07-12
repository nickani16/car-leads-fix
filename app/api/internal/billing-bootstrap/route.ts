import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import {
  billingCurrencies,
  billingMarkets,
  billingProductCatalog,
  currencyForMarket,
  getProductAmount,
} from '@/lib/billing/product-catalog'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 300

const WEBHOOK_URL = 'https://www.autorell.com/api/stripe/webhook'
const WEBHOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.expired',
  'payment_intent.payment_failed',
  'charge.refunded',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]

export async function POST(request: Request) {
  const configuredSecret = process.env.BILLING_BOOTSTRAP_SECRET
  const suppliedSecret = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!configuredSecret || !suppliedSecret || !secretsMatch(configuredSecret, suppliedSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (process.env.VERCEL_ENV !== 'production') {
    return NextResponse.json({ error: 'Production runtime required' }, { status: 409 })
  }

  try {
    const stripe = getStripe()
    const products = billingProductCatalog.filter((product) =>
      billingCurrencies.some((currency) => Number(product.amountMinor[currency] || 0) > 0),
    )
    const existingProducts = await stripe.products.list({ active: true, limit: 100 })
    const productIds = new Map(
      existingProducts.data
        .filter((product) => product.metadata.autorell_product_key)
        .map((product) => [product.metadata.autorell_product_key, product.id]),
    )
    const priceRecords = new Map<string, { productId: string; priceId: string }>()

    for (let index = 0; index < products.length; index += 5) {
      const group = products.slice(index, index + 5)
      await Promise.all(group.map(async (product) => {
        let productId = productIds.get(product.productKey)
        if (!productId) {
          const created = await stripe.products.create({
            name: displayName(product.productKey),
            description: `Autorell billing product: ${product.productKey}`,
            metadata: { autorell_product_key: product.productKey },
          }, { idempotencyKey: `autorell-product-${stableKey(product.productKey)}` })
          productId = created.id
          productIds.set(product.productKey, productId)
        }

        await Promise.all(billingCurrencies.map(async (currency) => {
          const amount = product.amountMinor[currency]
          if (!amount || amount <= 0) return

          const lookupKey = `autorell_${stableKey(product.productKey)}_${currency}`
          const existing = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 })
          let price = existing.data[0]
          const recurringMatches = product.billingType === 'subscription'
            ? price?.recurring?.interval === 'month'
            : !price?.recurring

          if (!price || price.unit_amount !== amount || price.currency !== currency || !recurringMatches) {
            if (price) await stripe.prices.update(price.id, { active: false })
            price = await stripe.prices.create({
              product: productId,
              currency,
              unit_amount: amount,
              lookup_key: lookupKey,
              transfer_lookup_key: true,
              ...(product.billingType === 'subscription'
                ? { recurring: { interval: 'month' as const } }
                : {}),
              metadata: { autorell_product_key: product.productKey },
            }, { idempotencyKey: `autorell-price-${lookupKey}-${amount}` })
          }

          priceRecords.set(`${product.productKey}:${currency}`, {
            productId,
            priceId: price.id,
          })
        }))
      }))
    }

    const now = new Date().toISOString()
    const rows = products.flatMap((product) => billingMarkets.flatMap((market) => {
      const amount = getProductAmount(product, market)
      if (!amount || amount.amountMinor <= 0) return []
      const stripeIds = priceRecords.get(`${product.productKey}:${currencyForMarket(market)}`)
      if (!stripeIds) throw new Error(`Missing Stripe price for ${product.productKey}/${market}`)
      return [{
        product_key: product.productKey,
        market,
        currency: amount.currency,
        amount_minor: amount.amountMinor,
        stripe_product_id: stripeIds.productId,
        stripe_price_id: stripeIds.priceId,
        billing_type: product.billingType,
        billing_interval: product.billingType === 'subscription' ? 'month' : null,
        tax_behavior: product.taxBehavior,
        price_display_mode: product.priceDisplayMode,
        active: true,
        effective_from: now,
        effective_to: null,
        updated_at: now,
      }]
    }))

    const admin = createAdminClient()
    const { data: existingRows, error: existingRowsError } = await admin
      .from('billing_product_prices')
      .select('id,product_key,market')
      .eq('active', true)
      .is('effective_to', null)
    if (existingRowsError) throw existingRowsError

    const existingByKey = new Map(
      (existingRows || []).map((row) => [`${row.product_key}:${row.market}`, row.id]),
    )
    const newRows = rows.filter((row) => !existingByKey.has(`${row.product_key}:${row.market}`))
    if (newRows.length) {
      const { error } = await admin.from('billing_product_prices').insert(newRows)
      if (error) throw error
    }
    for (const row of rows.filter((item) => existingByKey.has(`${item.product_key}:${item.market}`))) {
      const id = existingByKey.get(`${row.product_key}:${row.market}`)
      const { error } = await admin.from('billing_product_prices').update(row).eq('id', id)
      if (error) throw error
    }

    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 })
    for (const endpoint of endpoints.data.filter((item) => item.url === WEBHOOK_URL)) {
      await stripe.webhookEndpoints.del(endpoint.id)
    }
    const webhook = await stripe.webhookEndpoints.create({
      url: WEBHOOK_URL,
      enabled_events: WEBHOOK_EVENTS,
      description: 'Autorell production billing webhook',
      metadata: { managed_by: 'autorell-billing-bootstrap' },
    })

    return NextResponse.json({
      ok: true,
      productCount: products.length,
      priceCount: priceRecords.size,
      marketPriceCount: rows.length,
      webhookEndpointId: webhook.id,
      webhookSecret: webhook.secret,
    })
  } catch (error) {
    console.error('Billing bootstrap failed:', error)
    return NextResponse.json({ error: 'Billing bootstrap failed' }, { status: 500 })
  }
}

function secretsMatch(expected: string, supplied: string) {
  const expectedBuffer = Buffer.from(expected)
  const suppliedBuffer = Buffer.from(supplied)
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer)
}

function stableKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

function displayName(productKey: string) {
  return `Autorell ${productKey.split('.').slice(1).join(' ').replaceAll('_', ' ')}`
}
