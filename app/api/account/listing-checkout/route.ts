import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'
import { sendBusinessBillingEmail } from '@/lib/email/business-billing'
import { localizePublicHref, translatePublic, type PublicLocale } from '@/lib/public-i18n'
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
      active_listing_limit: 5,
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
      activeListingLimit: 5,
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
    return NextResponse.json({ error: 'Faktura kan bara anvÃ¤ndas fÃ¶r fÃ¶retagsabonnemang.' }, { status: 400 })
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

      const customerId = existingSubscription?.stripe_customer_id || (await stripe.customers.create({
        email: profile.email || user.email || undefined,
        name: profile.company_name || profile.email || user.email || undefined,
        preferred_locales: [stripeLocaleForCheckout(checkoutLocale, market)],
        metadata: {
          user_id: user.id,
          business_id: body.businessId || '',
        },
      })).id

      const stripeProduct = price.stripePriceId
        ? null
        : await stripe.products.create({
            name: checkoutProduct.name,
            description: checkoutProduct.description,
            metadata: {
              product_key: product.productKey,
              source: price.source,
              required_env: price.requiredEnv || '',
            },
          })
      const subscriptionItem: Stripe.SubscriptionCreateParams.Item =
        price.stripePriceId
          ? { price: price.stripePriceId, quantity: 1 }
          : {
              price_data: {
                currency: price.currency,
                unit_amount: price.amountMinor,
                recurring: { interval: product.billingInterval || 'month' },
                product: stripeProduct!.id,
              },
              quantity: 1,
            }
      const bankTransferSettings = createInvoiceBankTransferSettings(price.currency)

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        collection_method: 'send_invoice',
        days_until_due: 30,
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
          days_until_due: 30,
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
          : `${origin}${localizePublicHref(checkoutLocale, `/account/listings?payment=processing&order=${order.id}`)}`,
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
    logo: {
      type: 'url' as const,
      url: 'https://www.autorell.com/autorell-logo-primary.png',
    },
  }
}

function createCheckoutProductCopy(productKey: string, listingTitle: string | null | undefined, locale: PublicLocale) {
  const t = (value: string) => translatePublic(locale, value)
  const listingContext = listingTitle ? `${listingTitle} - ` : ''
  const afterSubmitText = t('Secure payment via Stripe. You will be sent back to Autorell after the purchase is complete.')

  if (productKey.startsWith('listing.')) {
    const [, category, packageName] = productKey.split('.')
    const categoryLabel = t(checkoutCategoryLabel(category))
    const packageLabel = packageName === 'premium' ? t('Premium listing') : t('Standard listing')
    const duration = packageName === 'premium' ? t('30 days') : t('15 days')
    return {
      name: `${packageLabel} - ${categoryLabel}`,
      description:
        packageName === 'premium'
          ? `${listingContext}${duration} ${t('publication with extra visibility and included top placement.')}`
          : `${listingContext}${duration} ${t('publication on Autorells European vehicle marketplace.')}`,
      submitText:
        packageName === 'premium'
          ? t('The listing gets higher visibility automatically when the payment has been confirmed.')
          : t('The listing is published automatically when the payment has been confirmed.'),
      afterSubmitText,
    }
  }

  if (productKey.startsWith('addon.top_placement')) {
    const days = productKey.includes('14') ? t('14 days') : productKey.includes('7') ? t('7 days') : t('3 days')
    return {
      name: `${t('Top placement')} - ${days}`,
      description: `${listingContext}${t('Move the listing higher in the results for')} ${days}.`,
      submitText: t('The top placement is activated automatically when the payment has been confirmed.'),
      afterSubmitText,
    }
  }

  if (productKey.startsWith('addon.featured')) {
    const days = productKey.includes('30') ? t('30 days') : t('7 days')
    return {
      name: `${t('Featured listing')} - ${days}`,
      description: `${listingContext}${t('Show the listing as featured on Autorell for')} ${days}.`,
      submitText: t('Featured visibility is activated automatically when the payment has been confirmed.'),
      afterSubmitText,
    }
  }

  if (productKey.startsWith('addon.refresh')) {
    return {
      name: t('Listing refresh'),
      description: `${listingContext}${t('Refresh the listing sorting date and get new visibility.')}`,
      submitText: t('The refresh is activated automatically when the payment has been confirmed.'),
      afterSubmitText,
    }
  }

  if (productKey.startsWith('subscription.business.')) {
    const plan = productKey.split('.')[2] || 'business'
    const period = productKey.endsWith('.annual') ? t('Annual subscription') : t('Monthly subscription')
    return {
      name: `${t('Business')} - ${capitalize(plan)}`,
      description: `${period} ${t('for companies selling vehicles on Autorell.')}`,
      submitText: t('The business subscription is activated automatically when the payment has been confirmed.'),
      afterSubmitText,
    }
  }

  return {
    name: 'Autorell',
    description: t('Autorell payment'),
    submitText: t('The payment is handled securely via Stripe.'),
    afterSubmitText,
  }
}

function checkoutCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    cars: 'Car',
    vans: 'Van',
    motorcycles: 'Motorcycle',
    motorhomes: 'Motorhome',
    caravans: 'Caravan',
    trucks: 'Truck',
    agriculture: 'Agricultural machine',
    construction: 'Construction machine',
    'electric-bikes': 'Electric bike',
  }
  return labels[category] || capitalize(category.replace(/-/g, ' '))
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
