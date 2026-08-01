import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'
import { sendBusinessBillingEmail } from '@/lib/email/business-billing'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'
import { BUSINESS_INVOICE_DAYS_UNTIL_DUE } from '@/lib/billing/business-invoice-terms'
import {
  getBillingProduct,
  legacyListingPackageToProductKey,
  normalizeBillingMarket,
  normalizeListingCategory,
  productToLegacyListingPackage,
} from '@/lib/billing/product-catalog'
import { resolveBillingPrice } from '@/lib/billing/price-lookup'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const limit = checkRateLimit({
    key: `listing-checkout:${user.id}:${getClientIp(request)}`,
    limit: 12,
    windowMs: 10 * 60 * 1000,
  })
  if (limit.limited) return rateLimitJson(limit.retryAfter)

  const body = (await request.json()) as {
    listingId?: string
    businessId?: string
    productKey?: string
    packageId?: string
    market?: string
    locale?: string
    billingMethod?: 'card' | 'invoice'
  }

  const admin = createAdminClient()
  const requestedMarket = String(body.market || '').trim().toLowerCase()
  const market = normalizeBillingMarket(
    requestedMarket === 'en' || requestedMarket === 'eu' ? 'de' : requestedMarket,
  )
  const requestedLocale = normalizeCheckoutLocale(body.locale) || publicLocaleForMarket(market)
  const billingMethod = body.billingMethod === 'invoice' ? 'invoice' : 'card'

  const [{ data: profile }, { data: listing }] = await Promise.all([
    admin
      .from('marketplace_profiles')
      .select('user_id,account_type,email,company_name,business_verification_status,business_onboarding_status')
      .eq('user_id', user.id)
      .maybeSingle(),
    body.listingId
      ? admin
          .from('marketplace_listings')
          .select('id,seller_user_id,category,title,status,country_code,review_status,package_id,last_refreshed_at')
          .eq('id', body.listingId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  if (!profile) {
    return NextResponse.json({ error: 'Account profile not found.' }, { status: 403 })
  }
  if (billingMethod === 'invoice' && profile.account_type !== 'business') {
    return NextResponse.json({ error: 'Faktura kan bara användas av företagskonton.' }, { status: 403 })
  }

  const productKey =
    body.productKey ||
    (listing && body.packageId
      ? legacyListingPackageToProductKey(listing.category, body.packageId)
      : null)
  if (!productKey) {
    return NextResponse.json({ error: 'Invalid product.' }, { status: 400 })
  }

  const product = getBillingProduct(productKey)
  if (!product || product.amountMinor === undefined) {
    return NextResponse.json({ error: 'Unknown product.' }, { status: 400 })
  }

  if (profile.account_type === 'business' && product.kind !== 'subscription') {
    return NextResponse.json({ error: 'Företagskonton använder abonnemang och kan inte köpa privata annonspaket.' }, { status: 403 })
  }

  if (product.kind === 'subscription' && product.businessPlan === 'free') {
    if (profile.account_type !== 'business' || profile.business_verification_status !== 'verified' || !['approved', 'subscription_pending', 'active'].includes(String(profile.business_onboarding_status || ''))) {
      return NextResponse.json({ error: 'Företaget måste vara godkänt innan Free kan aktiveras.' }, { status: 403 })
    }
    const { data: existingSubscription } = await admin
      .from('business_subscriptions')
      .select('id,stripe_subscription_id,status')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (existingSubscription?.stripe_subscription_id && ['active', 'trialing', 'past_due'].includes(String(existingSubscription.status || ''))) {
      return NextResponse.json({ error: 'Avsluta eller ändra det betalda abonnemanget innan Free kan väljas.' }, { status: 409 })
    }
    const freePayload = {
      user_id: user.id,
      business_id: body.businessId || null,
      product_key: product.productKey,
      market,
      currency: 'sek',
      plan_key: 'free',
      active_listing_limit: 10,
      status: 'active',
      payment_status: 'not_required',
      manually_activated: false,
      updated_at: new Date().toISOString(),
    }
    const { data: subscription, error: subscriptionError } = existingSubscription?.id
      ? await admin.from('business_subscriptions').update(freePayload).eq('id', existingSubscription.id).select('id,plan_key,status,active_listing_limit').single()
      : await admin.from('business_subscriptions').insert(freePayload).select('id,plan_key,status,active_listing_limit').single()
    if (subscriptionError || !subscription) {
      return NextResponse.json({ error: subscriptionError?.message || 'Could not activate Free plan.' }, { status: 400 })
    }
    await admin.from('marketplace_profiles').update({ business_onboarding_status: 'active', business_verification_status: 'verified', verification_updated_at: new Date().toISOString() }).eq('user_id', user.id)
    await admin.from('business_subscription_events').insert({ subscription_id: subscription.id, user_id: user.id, event_type: 'activated', to_plan: 'free' })
    await sendBusinessBillingEmail(admin, {
      deliveryKey: `business-welcome-${subscription.id}`,
      kind: 'welcome',
      userId: user.id,
      subscriptionId: subscription.id,
      planKey: 'free',
      activeListingLimit: 10,
      market,
    })
    return NextResponse.json({ activated: true, subscription })
  }

  if (product.kind === 'listing_package' || product.kind === 'addon') {
    if (!listing || listing.seller_user_id !== user.id) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
    }
    const listingCategory = normalizeListingCategory(listing.category)
    if (product.category && product.category !== listingCategory) {
      return NextResponse.json({ error: 'Product does not match listing category.' }, { status: 400 })
    }
    if (product.kind === 'addon' && listing.status !== 'published') {
      return NextResponse.json({ error: 'Add-ons can only be bought for published listings.' }, { status: 400 })
    }
    if (
      product.productKey === 'addon.refresh_single' &&
      listing.last_refreshed_at &&
      Date.now() - new Date(listing.last_refreshed_at).getTime() < 24 * 60 * 60 * 1000
    ) {
      return NextResponse.json(
        { error: 'Annonsen kan lyftas igen tidigast 24 timmar efter senaste lyftet.' },
        { status: 409 },
      )
    }
  }

  if (product.kind === 'listing_package' && listing) {
    if (['sold', 'deleted', 'removed'].includes(listing.status)) {
      return NextResponse.json({ error: 'Annonsen måste läggas ut igen innan du väljer paket.' }, { status: 409 })
    }

    const packageId = productToLegacyListingPackage(product)
    if (!packageId) {
      return NextResponse.json({ error: 'Ogiltigt annonspaket.' }, { status: 400 })
    }

    await expireOtherListingCheckouts(admin, listing.id, product.productKey, market)

    // Free listings do not use Stripe checkout; the authoritative package state is saved directly.
    if (product.package === 'start') {
      const approved = listing.review_status === 'approved'
      const now = new Date()
      const { error: listingError } = await admin
        .from('marketplace_listings')
        .update({
          package_id: packageId,
          status: approved ? 'published' : 'pending_review',
          priority: 0,
          published_at: approved ? now.toISOString() : null,
          expires_at: approved
            ? new Date(now.getTime() + (product.durationDays || 7) * 86_400_000).toISOString()
            : null,
          updated_at: now.toISOString(),
        })
        .eq('id', listing.id)
      if (listingError) {
        return NextResponse.json({ error: 'Paketet kunde inte sparas.' }, { status: 400 })
      }
      return NextResponse.json({ success: true, free: true, status: approved ? 'published' : 'pending_review' })
    }

    const { error: listingError } = await admin
      .from('marketplace_listings')
      .update({
        package_id: packageId,
        status: listing.status === 'published' ? 'published' : 'pending_payment',
        updated_at: new Date().toISOString(),
      })
      .eq('id', listing.id)
    if (listingError) {
      return NextResponse.json({ error: 'Paketet kunde inte sparas.' }, { status: 400 })
    }
  }

  if (product.kind === 'subscription' && profile.account_type !== 'business') {
    return NextResponse.json({ error: 'Business subscription requires a business account.' }, { status: 403 })
  }
  if (billingMethod === 'invoice' && product.kind !== 'subscription') {
    return NextResponse.json({ error: 'Faktura kan bara användas för företagsabonnemang.' }, { status: 400 })
  }

  const price = await resolveBillingPrice(product, market)
  if (!price || price.amountMinor <= 0) {
    return NextResponse.json({ error: 'Product is not payable for this market.' }, { status: 400 })
  }

  if (listing) {
    const { data: reusable } = await admin
      .from('payment_orders')
      .select('id,stripe_checkout_session_id')
      .eq('user_id', user.id)
      .eq('listing_id', listing.id)
      .eq('product_key', product.productKey)
      .eq('market', market)
      .eq('status', 'checkout_created')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (reusable?.stripe_checkout_session_id) {
      try {
        const previous = await getStripe().checkout.sessions.retrieve(reusable.stripe_checkout_session_id)
        if (previous.status === 'open' && previous.url) {
          return NextResponse.json({ url: previous.url, orderId: reusable.id, reused: true })
        }
        if (previous.status === 'expired') {
          await admin.from('payment_orders').update({ status: 'expired', updated_at: new Date().toISOString() }).eq('id', reusable.id)
        }
      } catch {
        console.warn('[listing-checkout] Stale checkout session replaced', { orderId: reusable.id })
      }
    }
  }

  const { data: order, error: orderError } = await admin
    .from('payment_orders')
    .insert({
      user_id: user.id,
      business_id: body.businessId || null,
      listing_id: listing?.id || null,
      product_key: product.productKey,
      market,
      currency: price.currency,
      amount_minor: price.amountMinor,
      status: 'created',
      metadata: {
        legacy_package_id: body.packageId || null,
        billing_method: billingMethod,
      },
    })
    .select('id')
    .single()
  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message || 'Could not create order.' }, { status: 400 })
  }

  const origin = new URL(request.url).origin
  const checkoutBranding = createCheckoutBranding()
  const checkoutLocale = requestedLocale
  const checkoutProduct = createCheckoutProductCopy(product.productKey, listing?.title, checkoutLocale)
  const metadata = {
    user_id: user.id,
    business_id: body.businessId || '',
    listing_id: listing?.id || '',
    product_key: product.productKey,
    market,
    internal_order_id: order.id,
    billing_method: billingMethod,
  }

  if (billingMethod === 'invoice') {
    if (!product.businessPlan) {
      await admin
        .from('payment_orders')
        .update({
          status: 'failed',
          failure_reason: 'Business plan is required for invoice subscriptions.',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
      return NextResponse.json(
        { error: 'Faktura är inte konfigurerad för den här planen än.' },
        { status: 503 },
      )
    }

    try {
      const stripe = getStripe()
      const { data: existingSubscription } = await admin
        .from('business_subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .not('stripe_customer_id', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const invoiceLocale = stripeLocaleForCheckout(checkoutLocale, market)
      const customerId = existingSubscription?.stripe_customer_id || (await stripe.customers.create({
        email: profile.email || user.email || undefined,
        name: profile.company_name || profile.email || user.email || undefined,
        preferred_locales: [invoiceLocale],
        metadata: {
          user_id: user.id,
          business_id: body.businessId || '',
        },
      })).id
      if (existingSubscription?.stripe_customer_id) {
        await stripe.customers.update(customerId, {
          email: profile.email || user.email || undefined,
          name: profile.company_name || profile.email || user.email || undefined,
          preferred_locales: [invoiceLocale],
          metadata: {
            user_id: user.id,
            business_id: body.businessId || '',
          },
        })
      }

      const stripeProduct = await stripe.products.create({
        name: checkoutProduct.name,
        description: checkoutProduct.description,
        metadata: {
          product_key: product.productKey,
          source: price.source,
          required_env: price.requiredEnv || '',
        },
      })
      const subscriptionItem: Stripe.SubscriptionCreateParams.Item = {
        price_data: {
          currency: price.currency,
          unit_amount: price.amountMinor,
          recurring: { interval: product.billingInterval || 'month' },
          product: stripeProduct.id,
        },
        quantity: 1,
      }
      const bankTransferSettings = createInvoiceBankTransferSettings(price.currency)

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        collection_method: 'send_invoice',
        days_until_due: BUSINESS_INVOICE_DAYS_UNTIL_DUE,
        items: [subscriptionItem],
        ...(bankTransferSettings ? { payment_settings: bankTransferSettings } : {}),
        metadata,
        expand: ['latest_invoice'],
      })
      let latestInvoice = toStripeInvoice(subscription.latest_invoice)
      if (!latestInvoice) {
        throw new Error('Stripe subscription did not return an invoice.')
      }
      if (latestInvoice.status === 'draft') {
        latestInvoice = await stripe.invoices.finalizeInvoice(latestInvoice.id, { auto_advance: true })
      }
      if (latestInvoice.status === 'open') {
        latestInvoice = await stripe.invoices.sendInvoice(latestInvoice.id)
      }
      const periodSource = subscription as Stripe.Subscription & {
        current_period_start?: number | null
        current_period_end?: number | null
      }
      const subscriptionPayload = {
        user_id: user.id,
        business_id: body.businessId || null,
        product_key: product.productKey,
        market,
        currency: price.currency,
        plan_key: product.businessPlan,
        active_listing_limit: product.activeListingLimit || null,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        status: subscription.status || 'active',
        payment_status: latestInvoice?.status === 'paid' ? 'paid' : 'pending',
        current_period_start: stripeTimestampToIso(periodSource.current_period_start),
        current_period_end: stripeTimestampToIso(periodSource.current_period_end),
        next_billing_at: stripeTimestampToIso(periodSource.current_period_end),
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        updated_at: new Date().toISOString(),
      }
      const { data: businessSubscription, error: subscriptionError } = await admin
        .from('business_subscriptions')
        .upsert(subscriptionPayload, { onConflict: 'stripe_subscription_id' })
        .select('id')
        .single()
      if (subscriptionError || !businessSubscription) {
        throw new Error(subscriptionError?.message || 'Could not save invoice subscription.')
      }

      if (latestInvoice) {
        await upsertBusinessInvoice(admin, latestInvoice, businessSubscription.id, user.id)
      }
      await admin
        .from('payment_orders')
        .update({
          status: 'pending',
          stripe_subscription_id: subscription.id,
          metadata: {
            billing_method: 'invoice',
            stripe_invoice_id: latestInvoice?.id || null,
            bank_transfer_enabled: Boolean(bankTransferSettings),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
      await admin
        .from('marketplace_profiles')
        .update({
          business_onboarding_status: 'active',
          verification_updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
      await admin.from('business_subscription_events').insert({
        subscription_id: businessSubscription.id,
        user_id: user.id,
        event_type: 'invoice_subscription_created',
        to_plan: product.businessPlan,
        metadata: {
          payment_order_id: order.id,
          stripe_subscription_id: subscription.id,
          stripe_invoice_id: latestInvoice?.id || null,
          invoice_email_sent: true,
          days_until_due: BUSINESS_INVOICE_DAYS_UNTIL_DUE,
          bank_transfer_enabled: Boolean(bankTransferSettings),
        },
      })
      await sendBusinessBillingEmail(admin, {
        deliveryKey: `business-welcome-${businessSubscription.id}`,
        kind: 'welcome',
        userId: user.id,
        subscriptionId: businessSubscription.id,
        planKey: product.businessPlan,
        activeListingLimit: product.activeListingLimit || null,
        market,
        currency: price.currency,
      })
      await sendBusinessBillingEmail(admin, {
        deliveryKey: `business-invoice-ready-${latestInvoice.id}`,
        kind: 'invoice_ready',
        userId: user.id,
        subscriptionId: businessSubscription.id,
        invoiceId: latestInvoice.id,
        planKey: product.businessPlan,
        activeListingLimit: product.activeListingLimit || null,
        amountMinor: latestInvoice.amount_due || price.amountMinor,
        currency: latestInvoice.currency || price.currency,
        market,
        invoiceNumber: latestInvoice.number || null,
        invoiceUrl: latestInvoice.hosted_invoice_url || null,
        pdfUrl: latestInvoice.invoice_pdf || null,
        dueAt: stripeTimestampToIso(latestInvoice.due_date || null),
      })
      return NextResponse.json({
        invoice: true,
        invoiceUrl: latestInvoice?.hosted_invoice_url || null,
        invoiceEmail: profile.email || user.email || null,
        bankTransferEnabled: Boolean(bankTransferSettings),
        orderId: order.id,
        subscriptionId: subscription.id,
      })
    } catch (error) {
      console.error('[listing-checkout] Could not create Stripe invoice subscription', {
        orderId: order.id,
        productKey: product.productKey,
        market,
        error: error instanceof Error ? error.message : String(error),
      })
      await admin
        .from('payment_orders')
        .update({
          status: 'failed',
          failure_reason: error instanceof Error ? error.message : 'Invoice subscription failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
      return NextResponse.json({ error: 'Fakturaabonnemanget kunde inte startas.' }, { status: 503 })
    }
  }

  let session
  try {
    session = await getStripe().checkout.sessions.create({
      mode: product.billingType,
      branding_settings: checkoutBranding,
      locale: stripeLocaleForCheckout(checkoutLocale, market),
      submit_type: product.billingType === 'payment' ? 'pay' : undefined,
      billing_address_collection: 'auto',
      customer_creation: product.billingType === 'payment' ? 'if_required' : undefined,
      customer_email: profile.email,
      client_reference_id: order.id,
      line_items: [
        {
          price_data: {
            currency: price.currency,
            unit_amount: price.amountMinor,
            recurring:
              product.billingType === 'subscription'
                ? { interval: product.billingInterval || 'month' }
                : undefined,
            product_data: {
              name: checkoutProduct.name,
              description: checkoutProduct.description,
              metadata: {
                product_key: product.productKey,
                source: price.source,
                required_env: price.requiredEnv || '',
              },
            },
          },
          quantity: 1,
        },
      ],
      metadata,
      payment_intent_data:
        product.billingType === 'payment'
          ? { metadata }
          : undefined,
      subscription_data:
        product.billingType === 'subscription'
          ? { metadata }
          : undefined,
      custom_text: {
        submit: {
          message: checkoutProduct.submitText,
        },
        after_submit: {
          message: checkoutProduct.afterSubmitText,
        },
      },
      success_url:
        product.kind === 'subscription'
          ? `${origin}${localizePublicHref(checkoutLocale, `/account/business/subscription?payment=processing&order=${order.id}`)}`
          : `${origin}${localizePublicHref(checkoutLocale, `/account/listings/created?payment=processing&order=${order.id}${listing?.id ? `&listing=${listing.id}` : ''}`)}`,
      cancel_url:
        product.kind === 'subscription'
          ? `${origin}${localizePublicHref(checkoutLocale, `/account/business/subscription?payment=cancelled&order=${order.id}`)}`
          : `${origin}${localizePublicHref(checkoutLocale, `/account/listings?payment=cancelled&order=${order.id}`)}`,
    })
  } catch (error) {
    console.error('[listing-checkout] Could not create Stripe checkout session', {
      orderId: order.id,
      productKey: product.productKey,
      market,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === 'Missing STRIPE_SECRET_KEY'
            ? 'Stripe checkout is not configured for this environment.'
            : 'Stripe checkout could not be started.',
      },
      { status: 503 },
    )
  }

  await admin
    .from('payment_orders')
    .update({
      status: 'checkout_created',
      stripe_checkout_session_id: session.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  return NextResponse.json({ url: session.url, orderId: order.id })
}

async function expireOtherListingCheckouts(
  admin: ReturnType<typeof createAdminClient>,
  listingId: string,
  selectedProductKey: string,
  selectedMarket: string,
) {
  const { data: orders } = await admin
    .from('payment_orders')
    .select('id,product_key,market,stripe_checkout_session_id')
    .eq('listing_id', listingId)
    .eq('status', 'checkout_created')

  for (const order of orders || []) {
    if (order.product_key === selectedProductKey && order.market === selectedMarket) continue
    if (order.stripe_checkout_session_id) {
      try {
        await getStripe().checkout.sessions.expire(order.stripe_checkout_session_id)
      } catch {
        // A completed or already expired session cannot be expired; fulfillment stays idempotent.
      }
    }
    await admin
      .from('payment_orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', order.id)
      .eq('status', 'checkout_created')
  }
}

function createCheckoutBranding() {
  return {
    display_name: 'Autorell',
    background_color: '#ffffff',
    button_color: '#0866ff',
    border_style: 'rounded' as const,
    font_family: 'inter' as const,
    icon: {
      type: 'url' as const,
      url: 'https://www.autorell.com/favicon-96.png',
    },
    logo: {
      type: 'url' as const,
      url: 'https://www.autorell.com/autorell-logo-primary.png',
    },
  }
}

function createCheckoutProductCopy(productKey: string, listingTitle: string | null | undefined, locale: PublicLocale) {
  const copy = checkoutProductCopy(locale)
  const security = checkoutSecurityCopy(locale)
  const listingContext = listingTitle ? `${listingTitle} - ` : ''
  const afterSubmitText = security.afterSubmit

  if (productKey.startsWith('listing.')) {
    const [, category, packageName] = productKey.split('.')
    const categoryLabel = copy.categories[category] || checkoutCategoryFallback(category)
    const packageLabel = packageName === 'premium' ? copy.premiumListing : copy.standardListing
    const duration = packageName === 'premium' ? copy.days30 : copy.days15
    return {
      name: `${packageLabel} - ${categoryLabel}`,
      description:
        packageName === 'premium'
          ? `${listingContext}${duration} ${copy.premiumDescription}`
          : `${listingContext}${duration} ${copy.standardDescription}`,
      submitText:
        packageName === 'premium'
          ? `${copy.premiumSubmit} ${security.cardDetails}`
          : `${copy.standardSubmit} ${security.cardDetails}`,
      afterSubmitText,
    }
  }

  if (productKey.startsWith('addon.top_placement')) {
    const days = productKey.includes('14') ? copy.days14 : productKey.includes('7') ? copy.days7 : copy.days3
    return {
      name: `${copy.topPlacement} - ${days}`,
      description: `${listingContext}${copy.topPlacementDescription(days)}`,
      submitText: `${copy.topPlacementSubmit} ${security.cardDetails}`,
      afterSubmitText,
    }
  }

  if (productKey.startsWith('addon.featured')) {
    const days = productKey.includes('30') ? copy.days30 : copy.days7
    return {
      name: `${copy.featuredListing} - ${days}`,
      description: `${listingContext}${copy.featuredDescription(days)}`,
      submitText: `${copy.featuredSubmit} ${security.cardDetails}`,
      afterSubmitText,
    }
  }

  if (productKey.startsWith('addon.refresh')) {
    return {
      name: copy.listingRefresh,
      description: `${listingContext}${copy.refreshDescription}`,
      submitText: `${copy.refreshSubmit} ${security.cardDetails}`,
      afterSubmitText,
    }
  }

  if (productKey.startsWith('subscription.business.')) {
    const plan = productKey.split('.')[2] || 'business'
    const period = productKey.endsWith('.annual') ? copy.annualSubscription : copy.monthlySubscription
    return {
      name: `${copy.business} - ${capitalize(plan)}`,
      description: `${period} ${copy.businessDescription}`,
      submitText: `${copy.businessSubmit} ${security.cardDetails}`,
      afterSubmitText,
    }
  }

  return {
    name: 'Autorell',
    description: copy.autorellPayment,
    submitText: `${copy.paymentSubmit} ${security.cardDetails}`,
    afterSubmitText,
  }
}

function checkoutProductCopy(locale: PublicLocale) {
  const normalized = locale === 'at' ? 'de' : locale === 'be' ? 'nl' : locale
  const copy: Record<string, {
    standardListing: string
    premiumListing: string
    topPlacement: string
    featuredListing: string
    listingRefresh: string
    business: string
    autorellPayment: string
    days3: string
    days7: string
    days14: string
    days15: string
    days30: string
    monthlySubscription: string
    annualSubscription: string
    standardDescription: string
    premiumDescription: string
    standardSubmit: string
    premiumSubmit: string
    topPlacementDescription: (days: string) => string
    topPlacementSubmit: string
    featuredDescription: (days: string) => string
    featuredSubmit: string
    refreshDescription: string
    refreshSubmit: string
    businessDescription: string
    businessSubmit: string
    paymentSubmit: string
    categories: Record<string, string>
  }> = {
    sv: {
      standardListing: 'Standardannons',
      premiumListing: 'Premiumannons',
      topPlacement: 'Toppplacering',
      featuredListing: 'Utvald annons',
      listingRefresh: 'Lyft annons',
      business: 'Företag',
      autorellPayment: 'Autorell-betalning',
      days3: '3 dagar',
      days7: '7 dagar',
      days14: '14 dagar',
      days15: '15 dagar',
      days30: '30 dagar',
      monthlySubscription: 'Månadsabonnemang',
      annualSubscription: 'Årsabonnemang',
      standardDescription: 'publicering på Autorells europeiska fordonsmarknad.',
      premiumDescription: 'publicering med extra synlighet och inkluderad toppplacering.',
      standardSubmit: 'Annonsen publiceras automatiskt när betalningen har bekräftats.',
      premiumSubmit: 'Annonsen får högre synlighet automatiskt när betalningen har bekräftats.',
      topPlacementDescription: (days) => `Flytta annonsen högre i resultaten i ${days}.`,
      topPlacementSubmit: 'Toppplaceringen aktiveras automatiskt när betalningen har bekräftats.',
      featuredDescription: (days) => `Visa annonsen som utvald på Autorell i ${days}.`,
      featuredSubmit: 'Utvald synlighet aktiveras automatiskt när betalningen har bekräftats.',
      refreshDescription: 'Förnya annonsens sorteringsdatum och få ny synlighet.',
      refreshSubmit: 'Lyftet aktiveras automatiskt när betalningen har bekräftats.',
      businessDescription: 'för företag som säljer fordon på Autorell.',
      businessSubmit: 'Företagsabonnemanget aktiveras automatiskt när betalningen har bekräftats.',
      paymentSubmit: 'Betalningen hanteras säkert via Stripe.',
      categories: { cars: 'Bil', vans: 'Transportbil', motorcycles: 'Motorcykel', motorhomes: 'Husbil', caravans: 'Husvagn', trucks: 'Lastbil', agriculture: 'Lantbruksmaskin', construction: 'Entreprenadmaskin', 'electric-bikes': 'Elcykel' },
    },
    en: {
      standardListing: 'Standard listing',
      premiumListing: 'Premium listing',
      topPlacement: 'Top placement',
      featuredListing: 'Featured listing',
      listingRefresh: 'Listing refresh',
      business: 'Business',
      autorellPayment: 'Autorell payment',
      days3: '3 days',
      days7: '7 days',
      days14: '14 days',
      days15: '15 days',
      days30: '30 days',
      monthlySubscription: 'Monthly subscription',
      annualSubscription: 'Annual subscription',
      standardDescription: 'publication on Autorells European vehicle marketplace.',
      premiumDescription: 'publication with extra visibility and included top placement.',
      standardSubmit: 'The listing is published automatically when the payment has been confirmed.',
      premiumSubmit: 'The listing gets higher visibility automatically when the payment has been confirmed.',
      topPlacementDescription: (days) => `Move the listing higher in the results for ${days}.`,
      topPlacementSubmit: 'The top placement is activated automatically when the payment has been confirmed.',
      featuredDescription: (days) => `Show the listing as featured on Autorell for ${days}.`,
      featuredSubmit: 'Featured visibility is activated automatically when the payment has been confirmed.',
      refreshDescription: 'Refresh the listing sorting date and get new visibility.',
      refreshSubmit: 'The refresh is activated automatically when the payment has been confirmed.',
      businessDescription: 'for companies selling vehicles on Autorell.',
      businessSubmit: 'The business subscription is activated automatically when the payment has been confirmed.',
      paymentSubmit: 'The payment is handled securely via Stripe.',
      categories: { cars: 'Car', vans: 'Van', motorcycles: 'Motorcycle', motorhomes: 'Motorhome', caravans: 'Caravan', trucks: 'Truck', agriculture: 'Agricultural machine', construction: 'Construction machine', 'electric-bikes': 'Electric bike' },
    },
    de: {
      standardListing: 'Standardanzeige',
      premiumListing: 'Premiumanzeige',
      topPlacement: 'Top-Platzierung',
      featuredListing: 'Hervorgehobene Anzeige',
      listingRefresh: 'Anzeige aktualisieren',
      business: 'Unternehmen',
      autorellPayment: 'Autorell-Zahlung',
      days3: '3 Tage',
      days7: '7 Tage',
      days14: '14 Tage',
      days15: '15 Tage',
      days30: '30 Tage',
      monthlySubscription: 'Monatsabonnement',
      annualSubscription: 'Jahresabonnement',
      standardDescription: 'Veröffentlichung auf Autorells europäischem Fahrzeugmarktplatz.',
      premiumDescription: 'Veröffentlichung mit zusätzlicher Sichtbarkeit und enthaltener Top-Platzierung.',
      standardSubmit: 'Die Anzeige wird automatisch veröffentlicht, sobald die Zahlung bestätigt wurde.',
      premiumSubmit: 'Die Anzeige erhält automatisch mehr Sichtbarkeit, sobald die Zahlung bestätigt wurde.',
      topPlacementDescription: (days) => `Anzeige für ${days} weiter oben in den Ergebnissen platzieren.`,
      topPlacementSubmit: 'Die Top-Platzierung wird automatisch aktiviert, sobald die Zahlung bestätigt wurde.',
      featuredDescription: (days) => `Anzeige für ${days} als hervorgehoben auf Autorell anzeigen.`,
      featuredSubmit: 'Die hervorgehobene Sichtbarkeit wird automatisch aktiviert, sobald die Zahlung bestätigt wurde.',
      refreshDescription: 'Sortierdatum der Anzeige erneuern und neue Sichtbarkeit erhalten.',
      refreshSubmit: 'Die Aktualisierung wird automatisch aktiviert, sobald die Zahlung bestätigt wurde.',
      businessDescription: 'für Unternehmen, die Fahrzeuge auf Autorell verkaufen.',
      businessSubmit: 'Das Unternehmensabonnement wird automatisch aktiviert, sobald die Zahlung bestätigt wurde.',
      paymentSubmit: 'Die Zahlung wird sicher über Stripe abgewickelt.',
      categories: { cars: 'Auto', vans: 'Transporter', motorcycles: 'Motorrad', motorhomes: 'Wohnmobil', caravans: 'Wohnwagen', trucks: 'Lkw', agriculture: 'Landmaschine', construction: 'Baumaschine', 'electric-bikes': 'E-Bike' },
    },
    fr: {
      standardListing: 'Annonce standard',
      premiumListing: 'Annonce premium',
      topPlacement: 'Placement en tête',
      featuredListing: 'Annonce mise en avant',
      listingRefresh: 'Remonter l’annonce',
      business: 'Entreprise',
      autorellPayment: 'Paiement Autorell',
      days3: '3 jours',
      days7: '7 jours',
      days14: '14 jours',
      days15: '15 jours',
      days30: '30 jours',
      monthlySubscription: 'Abonnement mensuel',
      annualSubscription: 'Abonnement annuel',
      standardDescription: 'de publication sur la place de marché européenne de véhicules Autorell.',
      premiumDescription: 'de publication avec visibilité renforcée et placement en tête inclus.',
      standardSubmit: 'L’annonce est publiée automatiquement lorsque le paiement est confirmé.',
      premiumSubmit: 'L’annonce obtient automatiquement plus de visibilité lorsque le paiement est confirmé.',
      topPlacementDescription: (days) => `Placez l’annonce plus haut dans les résultats pendant ${days}.`,
      topPlacementSubmit: 'Le placement en tête est activé automatiquement lorsque le paiement est confirmé.',
      featuredDescription: (days) => `Affichez l’annonce comme mise en avant sur Autorell pendant ${days}.`,
      featuredSubmit: 'La visibilité mise en avant est activée automatiquement lorsque le paiement est confirmé.',
      refreshDescription: 'Actualisez la date de tri de l’annonce et obtenez une nouvelle visibilité.',
      refreshSubmit: 'La remontée est activée automatiquement lorsque le paiement est confirmé.',
      businessDescription: 'pour les entreprises qui vendent des véhicules sur Autorell.',
      businessSubmit: 'L’abonnement entreprise est activé automatiquement lorsque le paiement est confirmé.',
      paymentSubmit: 'Le paiement est traité de manière sécurisée via Stripe.',
      categories: { cars: 'Voiture', vans: 'Utilitaire', motorcycles: 'Moto', motorhomes: 'Camping-car', caravans: 'Caravane', trucks: 'Camion', agriculture: 'Machine agricole', construction: 'Engin de chantier', 'electric-bikes': 'Vélo électrique' },
    },
    es: {
      standardListing: 'Anuncio estándar',
      premiumListing: 'Anuncio premium',
      topPlacement: 'Posición destacada',
      featuredListing: 'Anuncio destacado',
      listingRefresh: 'Impulsar anuncio',
      business: 'Empresa',
      autorellPayment: 'Pago de Autorell',
      days3: '3 días',
      days7: '7 días',
      days14: '14 días',
      days15: '15 días',
      days30: '30 días',
      monthlySubscription: 'Suscripción mensual',
      annualSubscription: 'Suscripción anual',
      standardDescription: 'de publicación en el marketplace europeo de vehículos de Autorell.',
      premiumDescription: 'de publicación con visibilidad adicional y posición destacada incluida.',
      standardSubmit: 'El anuncio se publica automáticamente cuando se confirma el pago.',
      premiumSubmit: 'El anuncio obtiene automáticamente mayor visibilidad cuando se confirma el pago.',
      topPlacementDescription: (days) => `Mueve el anuncio más arriba en los resultados durante ${days}.`,
      topPlacementSubmit: 'La posición destacada se activa automáticamente cuando se confirma el pago.',
      featuredDescription: (days) => `Muestra el anuncio como destacado en Autorell durante ${days}.`,
      featuredSubmit: 'La visibilidad destacada se activa automáticamente cuando se confirma el pago.',
      refreshDescription: 'Actualiza la fecha de ordenación del anuncio y gana nueva visibilidad.',
      refreshSubmit: 'El impulso se activa automáticamente cuando se confirma el pago.',
      businessDescription: 'para empresas que venden vehículos en Autorell.',
      businessSubmit: 'La suscripción de empresa se activa automáticamente cuando se confirma el pago.',
      paymentSubmit: 'El pago se procesa de forma segura mediante Stripe.',
      categories: { cars: 'Coche', vans: 'Furgoneta', motorcycles: 'Moto', motorhomes: 'Autocaravana', caravans: 'Caravana', trucks: 'Camión', agriculture: 'Maquinaria agrícola', construction: 'Maquinaria de construcción', 'electric-bikes': 'Bicicleta eléctrica' },
    },
    it: {
      standardListing: 'Annuncio standard',
      premiumListing: 'Annuncio premium',
      topPlacement: 'Posizionamento in alto',
      featuredListing: 'Annuncio in evidenza',
      listingRefresh: 'Rilancia annuncio',
      business: 'Azienda',
      autorellPayment: 'Pagamento Autorell',
      days3: '3 giorni',
      days7: '7 giorni',
      days14: '14 giorni',
      days15: '15 giorni',
      days30: '30 giorni',
      monthlySubscription: 'Abbonamento mensile',
      annualSubscription: 'Abbonamento annuale',
      standardDescription: 'di pubblicazione sul marketplace europeo di veicoli Autorell.',
      premiumDescription: 'di pubblicazione con visibilità extra e posizionamento in alto incluso.',
      standardSubmit: 'L’annuncio viene pubblicato automaticamente quando il pagamento è confermato.',
      premiumSubmit: 'L’annuncio ottiene automaticamente maggiore visibilità quando il pagamento è confermato.',
      topPlacementDescription: (days) => `Sposta l’annuncio più in alto nei risultati per ${days}.`,
      topPlacementSubmit: 'Il posizionamento in alto viene attivato automaticamente quando il pagamento è confermato.',
      featuredDescription: (days) => `Mostra l’annuncio in evidenza su Autorell per ${days}.`,
      featuredSubmit: 'La visibilità in evidenza viene attivata automaticamente quando il pagamento è confermato.',
      refreshDescription: 'Aggiorna la data di ordinamento dell’annuncio e ottieni nuova visibilità.',
      refreshSubmit: 'Il rilancio viene attivato automaticamente quando il pagamento è confermato.',
      businessDescription: 'per aziende che vendono veicoli su Autorell.',
      businessSubmit: 'L’abbonamento aziendale viene attivato automaticamente quando il pagamento è confermato.',
      paymentSubmit: 'Il pagamento viene gestito in modo sicuro tramite Stripe.',
      categories: { cars: 'Auto', vans: 'Furgone', motorcycles: 'Moto', motorhomes: 'Camper', caravans: 'Roulotte', trucks: 'Camion', agriculture: 'Macchina agricola', construction: 'Macchina da cantiere', 'electric-bikes': 'Bici elettrica' },
    },
    nl: {
      standardListing: 'Standaardadvertentie',
      premiumListing: 'Premiumadvertentie',
      topPlacement: 'Topplaatsing',
      featuredListing: 'Uitgelichte advertentie',
      listingRefresh: 'Advertentie omhoog plaatsen',
      business: 'Zakelijk',
      autorellPayment: 'Autorell-betaling',
      days3: '3 dagen',
      days7: '7 dagen',
      days14: '14 dagen',
      days15: '15 dagen',
      days30: '30 dagen',
      monthlySubscription: 'Maandabonnement',
      annualSubscription: 'Jaarabonnement',
      standardDescription: 'publicatie op Autorells Europese voertuigmarktplaats.',
      premiumDescription: 'publicatie met extra zichtbaarheid en inbegrepen topplaatsing.',
      standardSubmit: 'De advertentie wordt automatisch gepubliceerd zodra de betaling is bevestigd.',
      premiumSubmit: 'De advertentie krijgt automatisch meer zichtbaarheid zodra de betaling is bevestigd.',
      topPlacementDescription: (days) => `Plaats de advertentie ${days} hoger in de resultaten.`,
      topPlacementSubmit: 'De topplaatsing wordt automatisch geactiveerd zodra de betaling is bevestigd.',
      featuredDescription: (days) => `Toon de advertentie ${days} als uitgelicht op Autorell.`,
      featuredSubmit: 'Uitgelichte zichtbaarheid wordt automatisch geactiveerd zodra de betaling is bevestigd.',
      refreshDescription: 'Vernieuw de sorteerdatum van de advertentie en krijg nieuwe zichtbaarheid.',
      refreshSubmit: 'De boost wordt automatisch geactiveerd zodra de betaling is bevestigd.',
      businessDescription: 'voor bedrijven die voertuigen verkopen op Autorell.',
      businessSubmit: 'Het zakelijke abonnement wordt automatisch geactiveerd zodra de betaling is bevestigd.',
      paymentSubmit: 'De betaling wordt veilig verwerkt via Stripe.',
      categories: { cars: 'Auto', vans: 'Bestelwagen', motorcycles: 'Motor', motorhomes: 'Camper', caravans: 'Caravan', trucks: 'Vrachtwagen', agriculture: 'Landbouwmachine', construction: 'Bouwmachine', 'electric-bikes': 'Elektrische fiets' },
    },
    pl: {
      standardListing: 'Ogłoszenie standardowe',
      premiumListing: 'Ogłoszenie premium',
      topPlacement: 'Wyróżnienie na górze',
      featuredListing: 'Ogłoszenie wyróżnione',
      listingRefresh: 'Odśwież ogłoszenie',
      business: 'Firma',
      autorellPayment: 'Płatność Autorell',
      days3: '3 dni',
      days7: '7 dni',
      days14: '14 dni',
      days15: '15 dni',
      days30: '30 dni',
      monthlySubscription: 'Subskrypcja miesięczna',
      annualSubscription: 'Subskrypcja roczna',
      standardDescription: 'publikacji na europejskim marketplace pojazdów Autorell.',
      premiumDescription: 'publikacji z dodatkową widocznością i wyróżnieniem na górze.',
      standardSubmit: 'Ogłoszenie zostanie opublikowane automatycznie po potwierdzeniu płatności.',
      premiumSubmit: 'Ogłoszenie automatycznie otrzyma większą widoczność po potwierdzeniu płatności.',
      topPlacementDescription: (days) => `Przenieś ogłoszenie wyżej w wynikach na ${days}.`,
      topPlacementSubmit: 'Wyróżnienie na górze zostanie aktywowane automatycznie po potwierdzeniu płatności.',
      featuredDescription: (days) => `Pokaż ogłoszenie jako wyróżnione na Autorell przez ${days}.`,
      featuredSubmit: 'Wyróżniona widoczność zostanie aktywowana automatycznie po potwierdzeniu płatności.',
      refreshDescription: 'Odśwież datę sortowania ogłoszenia i uzyskaj nową widoczność.',
      refreshSubmit: 'Odświeżenie zostanie aktywowane automatycznie po potwierdzeniu płatności.',
      businessDescription: 'dla firm sprzedających pojazdy na Autorell.',
      businessSubmit: 'Subskrypcja firmowa zostanie aktywowana automatycznie po potwierdzeniu płatności.',
      paymentSubmit: 'Płatność jest bezpiecznie obsługiwana przez Stripe.',
      categories: { cars: 'Samochód', vans: 'Van', motorcycles: 'Motocykl', motorhomes: 'Kamper', caravans: 'Przyczepa kempingowa', trucks: 'Ciężarówka', agriculture: 'Maszyna rolnicza', construction: 'Maszyna budowlana', 'electric-bikes': 'Rower elektryczny' },
    },
    fi: {
      standardListing: 'Standardi-ilmoitus',
      premiumListing: 'Premium-ilmoitus',
      topPlacement: 'Kärkisijoitus',
      featuredListing: 'Nostettu ilmoitus',
      listingRefresh: 'Nosta ilmoitus',
      business: 'Yritys',
      autorellPayment: 'Autorell-maksu',
      days3: '3 päivää',
      days7: '7 päivää',
      days14: '14 päivää',
      days15: '15 päivää',
      days30: '30 päivää',
      monthlySubscription: 'Kuukausitilaus',
      annualSubscription: 'Vuositilaus',
      standardDescription: 'julkaisua Autorellin eurooppalaisella ajoneuvomarkkinapaikalla.',
      premiumDescription: 'julkaisua lisänäkyvyydellä ja mukana olevalla kärkisijoituksella.',
      standardSubmit: 'Ilmoitus julkaistaan automaattisesti, kun maksu on vahvistettu.',
      premiumSubmit: 'Ilmoitus saa automaattisesti enemmän näkyvyyttä, kun maksu on vahvistettu.',
      topPlacementDescription: (days) => `Siirrä ilmoitus ylemmäs tuloksissa ajaksi ${days}.`,
      topPlacementSubmit: 'Kärkisijoitus aktivoidaan automaattisesti, kun maksu on vahvistettu.',
      featuredDescription: (days) => `Näytä ilmoitus nostettuna Autorellissa ajan ${days}.`,
      featuredSubmit: 'Nostettu näkyvyys aktivoidaan automaattisesti, kun maksu on vahvistettu.',
      refreshDescription: 'Päivitä ilmoituksen lajittelupäivä ja saa uutta näkyvyyttä.',
      refreshSubmit: 'Nosto aktivoidaan automaattisesti, kun maksu on vahvistettu.',
      businessDescription: 'yrityksille, jotka myyvät ajoneuvoja Autorellissa.',
      businessSubmit: 'Yritystilaus aktivoidaan automaattisesti, kun maksu on vahvistettu.',
      paymentSubmit: 'Maksu käsitellään turvallisesti Stripen kautta.',
      categories: { cars: 'Auto', vans: 'Pakettiauto', motorcycles: 'Moottoripyörä', motorhomes: 'Matkailuauto', caravans: 'Asuntovaunu', trucks: 'Kuorma-auto', agriculture: 'Maatalouskone', construction: 'Maarakennuskone', 'electric-bikes': 'Sähköpyörä' },
    },
    da: {
      standardListing: 'Standardannonce',
      premiumListing: 'Premiumannonce',
      topPlacement: 'Topplacering',
      featuredListing: 'Fremhævet annonce',
      listingRefresh: 'Løft annonce',
      business: 'Virksomhed',
      autorellPayment: 'Autorell-betaling',
      days3: '3 dage',
      days7: '7 dage',
      days14: '14 dage',
      days15: '15 dage',
      days30: '30 dage',
      monthlySubscription: 'Månedsabonnement',
      annualSubscription: 'Årsabonnement',
      standardDescription: 'publicering på Autorells europæiske køretøjsmarkedsplads.',
      premiumDescription: 'publicering med ekstra synlighed og inkluderet topplacering.',
      standardSubmit: 'Annoncen offentliggøres automatisk, når betalingen er bekræftet.',
      premiumSubmit: 'Annoncen får automatisk mere synlighed, når betalingen er bekræftet.',
      topPlacementDescription: (days) => `Flyt annoncen højere op i resultaterne i ${days}.`,
      topPlacementSubmit: 'Topplaceringen aktiveres automatisk, når betalingen er bekræftet.',
      featuredDescription: (days) => `Vis annoncen som fremhævet på Autorell i ${days}.`,
      featuredSubmit: 'Fremhævet synlighed aktiveres automatisk, når betalingen er bekræftet.',
      refreshDescription: 'Forny annoncens sorteringsdato og få ny synlighed.',
      refreshSubmit: 'Løftet aktiveres automatisk, når betalingen er bekræftet.',
      businessDescription: 'for virksomheder, der sælger køretøjer på Autorell.',
      businessSubmit: 'Virksomhedsabonnementet aktiveres automatisk, når betalingen er bekræftet.',
      paymentSubmit: 'Betalingen håndteres sikkert via Stripe.',
      categories: { cars: 'Bil', vans: 'Varebil', motorcycles: 'Motorcykel', motorhomes: 'Autocamper', caravans: 'Campingvogn', trucks: 'Lastbil', agriculture: 'Landbrugsmaskine', construction: 'Entreprenørmaskine', 'electric-bikes': 'Elcykel' },
    },
  }
  return copy[normalized] || copy.en
}

function checkoutSecurityCopy(locale: PublicLocale) {
  const normalized = locale === 'at' ? 'de' : locale === 'be' ? 'nl' : locale
  const copy: Record<string, { cardDetails: string; afterSubmit: string }> = {
    sv: {
      cardDetails: 'Betalningen är TLS/SSL-krypterad. Stripe hanterar kortuppgifterna och Autorell ser eller lagrar aldrig ditt kortnummer.',
      afterSubmit: 'När Stripe har bekräftat betalningen skickas du tillbaka till Autorell och tjänsten aktiveras automatiskt.',
    },
    en: {
      cardDetails: 'Payment is TLS/SSL encrypted. Stripe handles card details and Autorell never sees or stores your card number.',
      afterSubmit: 'After Stripe confirms the payment, you are sent back to Autorell and the service is activated automatically.',
    },
    de: {
      cardDetails: 'Die Zahlung ist TLS/SSL-verschlüsselt. Stripe verarbeitet die Kartendaten; Autorell sieht oder speichert Ihre Kartennummer nie.',
      afterSubmit: 'Nachdem Stripe die Zahlung bestätigt hat, werden Sie zu Autorell zurückgeleitet und der Dienst wird automatisch aktiviert.',
    },
    fr: {
      cardDetails: 'Le paiement est chiffré TLS/SSL. Stripe traite les données de carte et Autorell ne voit ni ne stocke jamais votre numéro de carte.',
      afterSubmit: 'Après confirmation du paiement par Stripe, vous revenez sur Autorell et le service est activé automatiquement.',
    },
    es: {
      cardDetails: 'El pago está cifrado con TLS/SSL. Stripe gestiona los datos de la tarjeta y Autorell nunca ve ni almacena tu número de tarjeta.',
      afterSubmit: 'Cuando Stripe confirme el pago, volverás a Autorell y el servicio se activará automáticamente.',
    },
    it: {
      cardDetails: 'Il pagamento è crittografato TLS/SSL. Stripe gestisce i dati della carta e Autorell non vede né conserva mai il numero della carta.',
      afterSubmit: 'Dopo la conferma del pagamento da parte di Stripe, torni su Autorell e il servizio viene attivato automaticamente.',
    },
    nl: {
      cardDetails: 'De betaling is TLS/SSL-versleuteld. Stripe verwerkt kaartgegevens en Autorell ziet of bewaart je kaartnummer nooit.',
      afterSubmit: 'Nadat Stripe de betaling heeft bevestigd, keer je terug naar Autorell en wordt de dienst automatisch geactiveerd.',
    },
    pl: {
      cardDetails: 'Płatność jest szyfrowana TLS/SSL. Stripe obsługuje dane karty, a Autorell nigdy nie widzi ani nie przechowuje numeru karty.',
      afterSubmit: 'Po potwierdzeniu płatności przez Stripe wrócisz do Autorell, a usługa zostanie aktywowana automatycznie.',
    },
    fi: {
      cardDetails: 'Maksu on TLS/SSL-salattu. Stripe käsittelee korttitiedot, eikä Autorell koskaan näe tai tallenna korttinumeroasi.',
      afterSubmit: 'Kun Stripe on vahvistanut maksun, palaat Autorelliin ja palvelu aktivoidaan automaattisesti.',
    },
    da: {
      cardDetails: 'Betalingen er TLS/SSL-krypteret. Stripe håndterer kortoplysninger, og Autorell ser eller gemmer aldrig dit kortnummer.',
      afterSubmit: 'Når Stripe har bekræftet betalingen, sendes du tilbage til Autorell, og tjenesten aktiveres automatisk.',
    },
  }
  return copy[normalized] || copy.en
}

function checkoutCategoryFallback(category: string) {
  return capitalize(category.replace(/-/g, ' '))
}

function publicLocaleForMarket(market: string): PublicLocale {
  const locales: Record<string, PublicLocale> = {
    se: 'sv',
    dk: 'da',
    de: 'de',
    fr: 'fr',
    it: 'it',
    es: 'es',
    nl: 'nl',
    be: 'be',
    at: 'at',
    pl: 'pl',
    fi: 'fi',
  }
  return locales[market] || 'en'
}

type StripeCheckoutLocale = 'auto' | 'en' | 'sv' | 'da' | 'de' | 'fr' | 'it' | 'es' | 'nl' | 'pl' | 'fi'

function normalizeCheckoutLocale(value: string | null | undefined): PublicLocale | null {
  const normalized = String(value || '').toLowerCase()
  if (normalized === 'se' || normalized === 'sv') return 'sv'
  if (normalized === 'dk' || normalized === 'da') return 'da'
  if (normalized === 'de') return 'de'
  if (normalized === 'at') return 'at'
  if (normalized === 'be') return 'be'
  if (normalized === 'fr') return 'fr'
  if (normalized === 'it') return 'it'
  if (normalized === 'es') return 'es'
  if (normalized === 'nl') return 'nl'
  if (normalized === 'pl') return 'pl'
  if (normalized === 'fi') return 'fi'
  if (normalized === 'en' || normalized === 'eu') return 'en'
  return null
}

function stripeLocaleForCheckout(locale: PublicLocale, market: string): StripeCheckoutLocale {
  if (locale === 'en') return 'en'
  if (locale === 'sv') return 'sv'
  if (locale === 'da') return 'da'
  if (locale === 'de' || locale === 'at') return 'de'
  if (locale === 'be' || locale === 'nl') return 'nl'
  if (locale === 'fr') return 'fr'
  if (locale === 'it') return 'it'
  if (locale === 'es') return 'es'
  if (locale === 'pl') return 'pl'
  if (locale === 'fi') return 'fi'
  return stripeLocaleForMarket(market)
}

function stripeLocaleForMarket(market: string): StripeCheckoutLocale {
  const locales: Record<string, StripeCheckoutLocale> = {
    se: 'sv',
    dk: 'da',
    de: 'de',
    fr: 'fr',
    it: 'it',
    es: 'es',
    nl: 'nl',
    be: 'nl',
    at: 'de',
    pl: 'pl',
    fi: 'fi',
  }
  return locales[market] || 'en'
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function stripeTimestampToIso(value?: number | null) {
  return typeof value === 'number' ? new Date(value * 1000).toISOString() : null
}

function toStripeInvoice(invoice: Stripe.Subscription['latest_invoice']) {
  return invoice && typeof invoice === 'object' ? invoice as Stripe.Invoice : null
}

function createInvoiceBankTransferSettings(currency: string): Stripe.SubscriptionCreateParams.PaymentSettings | undefined {
  if (currency.toLowerCase() !== 'eur') return undefined
  const country = (process.env.STRIPE_EU_BANK_TRANSFER_COUNTRY || 'SE').toUpperCase()

  return {
    payment_method_types: ['customer_balance'],
    payment_method_options: {
      customer_balance: {
        funding_type: 'bank_transfer',
        bank_transfer: {
          type: 'eu_bank_transfer',
          eu_bank_transfer: { country },
        },
      },
    },
  } as Stripe.SubscriptionCreateParams.PaymentSettings
}

async function upsertBusinessInvoice(
  admin: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice,
  subscriptionId: string,
  userId: string,
) {
  await admin.from('business_invoices').upsert({
    subscription_id: subscriptionId,
    user_id: userId,
    stripe_invoice_id: invoice.id,
    invoice_number: invoice.number || null,
    hosted_invoice_url: invoice.hosted_invoice_url || null,
    pdf_url: invoice.invoice_pdf || null,
    amount_minor: invoice.amount_due || 0,
    currency: invoice.currency || 'sek',
    status: invoice.status || 'open',
    issued_at: stripeTimestampToIso(invoice.created),
    paid_at: stripeTimestampToIso(invoice.status_transitions?.paid_at || null),
    due_at: stripeTimestampToIso(invoice.due_date || null),
    metadata: {
      collection_method: invoice.collection_method || null,
      amount_remaining: invoice.amount_remaining || 0,
    },
  }, { onConflict: 'stripe_invoice_id' })
}
