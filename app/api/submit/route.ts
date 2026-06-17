import { after, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { canonicalVehicleValue } from '@/lib/vehicle-translation'
import { createSellerAccessToken } from '@/lib/seller-access'
import { createAdminClient } from '@/lib/supabase/admin'

function text(form: FormData, key: string) {
  return String(form.get(key) || '').trim()
}

function boolean(form: FormData, key: string) {
  return text(form, key).toLowerCase() === 'true'
}

const financeStatuses = new Set([
  'owned_outright',
  'vehicle_finance',
  'unsecured_loan',
  'leasing',
  'unknown',
])

const imageUploadConcurrency = 4

async function uploadLeadImage(
  supabase: SupabaseClient,
  file: File,
  index: number
) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
  const fileName = `images/${crypto.randomUUID()}-${index}-${safeName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('leads')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (uploadError || !uploadData) {
    console.error('Upload error:', uploadError)
    return null
  }

  const { data: signedUrlData, error: signedUrlError } =
    await supabase.storage
      .from('leads')
      .createSignedUrl(uploadData.path, 60 * 60 * 24 * 7)

  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error('Signed URL error:', signedUrlError)
    return null
  }

  return signedUrlData.signedUrl
}

async function uploadLeadImages(supabase: SupabaseClient, files: File[]) {
  const urls: string[] = []

  for (let start = 0; start < files.length; start += imageUploadConcurrency) {
    const batch = files.slice(start, start + imageUploadConcurrency)
    const batchUrls = await Promise.all(
      batch.map((file, offset) => uploadLeadImage(supabase, file, start + offset))
    )

    urls.push(...batchUrls.filter((url): url is string => Boolean(url)))
  }

  return urls
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()

    const phone = text(form, 'phone')
    const email = text(form, 'email')

    if (!/^\+?[0-9\s()-]{7,20}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Ogiltigt telefonnummer.' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Ogiltig e-postadress.' },
        { status: 400 }
      )
    }

    const make =
      text(form, 'make') === 'Other'
        ? text(form, 'otherMake')
        : text(form, 'make')

    const requiredFields = {
      reg: text(form, 'reg'),
      make,
      model: text(form, 'model'),
      model_year: text(form, 'modelYear'),
      body_type: canonicalVehicleValue(text(form, 'bodyType')),
      fuel_type: canonicalVehicleValue(text(form, 'fuelType')),
      gearbox: canonicalVehicleValue(text(form, 'gearbox')),
      drivetrain: canonicalVehicleValue(text(form, 'drivetrain')),
      miles: text(form, 'miles'),
      pickup_city: text(form, 'pickupCity'),
      pickup_postal_code: text(form, 'pickupPostalCode'),
    }
    const originCountry = text(form, 'source').toUpperCase()
    const modelYear = Number(requiredFields.model_year)
    const mileage = Number(requiredFields.miles)
    const isDriveable = boolean(form, 'isDriveable')
    const hasEngineTransmissionIssues = boolean(
      form,
      'hasEngineTransmissionIssues'
    )
    const hasFluidLeaks = boolean(form, 'hasFluidLeaks')
    const hasSeriousCollisionDamage = boolean(
      form,
      'hasSeriousCollisionDamage'
    )
    const warnings = canonicalVehicleValue(text(form, 'warnings'))
    const damage = canonicalVehicleValue(text(form, 'damage'))
    const tireSet = canonicalVehicleValue(text(form, 'tireset'))
    const financeStatus = text(form, 'financeStatus')
    const financeProvider = text(form, 'financeProvider')
    const financeAgreementReference = text(form, 'financeAgreementReference')
    const financeContactConsent = boolean(form, 'financeContactConsent')
    const financeEstimatedBalanceText = text(form, 'financeEstimatedBalance')
    const financeEstimatedBalance = financeEstimatedBalanceText
      ? Number(financeEstimatedBalanceText)
      : null
    const securedFinance =
      financeStatus === 'vehicle_finance' || financeStatus === 'leasing'

    if (
      Object.values(requiredFields).some((value) => !value) ||
      !/^[A-Z]{2}$/.test(originCountry) ||
      !tireSet ||
      !financeStatuses.has(financeStatus)
    ) {
      return NextResponse.json(
        { error: 'Obligatoriska fordonsuppgifter saknas.' },
        { status: 400 }
      )
    }

    if (
      (securedFinance && (!financeProvider || !financeContactConsent)) ||
      (financeEstimatedBalance !== null &&
        (!Number.isFinite(financeEstimatedBalance) ||
          financeEstimatedBalance < 0))
    ) {
      return NextResponse.json(
        {
          error:
            'Finansieringsuppgifterna är ofullständiga eller ogiltiga.',
        },
        { status: 400 }
      )
    }

    if (
      originCountry !== 'SE' ||
      !Number.isFinite(modelYear) ||
      modelYear < 2018 ||
      !Number.isFinite(mileage) ||
      mileage > 10_000 ||
      !isDriveable ||
      hasEngineTransmissionIssues ||
      hasFluidLeaks ||
      hasSeriousCollisionDamage ||
      warnings === 'Warning lights present' ||
      damage === 'Significant damage' ||
      damage === 'Accident damage'
    ) {
      return NextResponse.json(
        {
          error:
            'Bilen uppfyller inte Autorells nuvarande exportkriterier.',
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const sellerAccess = createSellerAccessToken()
    const { count: approvedDealerCount } = await supabase
      .from('dealers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')

    const files = form
      .getAll('images')
      .filter((item): item is File => item instanceof File && item.size > 0)
    const imageUrls = await uploadLeadImages(supabase, files)

    const lead = {
      ...requiredFields,
      variant: text(form, 'variant') || null,
      vin: text(form, 'vin') || null,
      first_registration: text(form, 'firstRegistration') || null,
      power_hp: text(form, 'powerHp')
        ? Number(text(form, 'powerHp'))
        : null,
      engine_size: text(form, 'engineSize') || null,
      color: text(form, 'color') || null,
      owners: text(form, 'owners'),
      importCar: text(form, 'importCar'),
      service: canonicalVehicleValue(text(form, 'service')),
      inspection_valid_until:
        text(form, 'inspectionValidUntil') || null,
      keys_count: text(form, 'keysCount'),
      brakes: text(form, 'brakes'),
      damage,
      damage_description: text(form, 'damageDescription') || null,
      warnings,
      is_driveable: isDriveable,
      has_engine_transmission_issues: hasEngineTransmissionIssues,
      has_fluid_leaks: hasFluidLeaks,
      has_serious_collision_damage: hasSeriousCollisionDamage,
      tires: canonicalVehicleValue(text(form, 'tires')),
      tireset: tireSet,
      towbar: canonicalVehicleValue(text(form, 'towbar')),
      equipment: text(form, 'equipment') || null,
      sellTime: canonicalVehicleValue(text(form, 'sellTime')),
      finance_status: financeStatus,
      finance_provider: securedFinance ? financeProvider : null,
      finance_agreement_reference:
        securedFinance && financeAgreementReference
          ? financeAgreementReference
          : null,
      finance_estimated_balance:
        securedFinance ? financeEstimatedBalance : null,
      finance_contact_consent:
        securedFinance && financeContactConsent,
      finance_review_status:
        securedFinance || financeStatus === 'unknown'
        ? 'needs_review'
        : 'not_required',
      phone,
      email,
      source: originCountry,
      origin_country: originCountry,
      images: imageUrls,
      status: 'Pending review',
      seller_access_token_hash: sellerAccess.hash,
      auction_starts_at: null,
      auction_ends_at: null,
      listing_plan: 'free_24h',
      dealer_reach_snapshot: approvedDealerCount || 0,
    }

    const { data: insertedLead, error: insertError } = await supabase
      .from('leads')
      .insert(lead)
      .select('id')
      .single()

    if (insertError) {
      console.error('Lead insert error:', insertError)
      return NextResponse.json(
        { error: 'Kunde inte spara fordonsuppgifterna.' },
        { status: 500 }
      )
    }

    if (process.env.RESEND_API_KEY) {
      const fromEmail =
        process.env.NOTIFICATION_FROM_EMAIL ||
        'Autorell <noreply@autorell.com>'
      const reviewFromEmail =
        process.env.LEAD_REVIEW_FROM_EMAIL ||
        'Autorell Review <review@autorell.com>'
      const reviewToEmail =
        process.env.LEAD_REVIEW_TO_EMAIL ||
        'nikolai.parkkila@outlook.com'
      const sellerPortalUrl = new URL(
        `/saljarportal/${sellerAccess.token}`,
        request.url
      ).toString()
      const adminReviewUrl = new URL(
        `/admin/leads/${insertedLead.id}`,
        request.url
      ).toString()
      after(async () => {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY)
          const { error: reviewEmailError } = await resend.emails.send({
        from: reviewFromEmail,
        to: reviewToEmail,
        subject: `Granska ny bil: ${make} ${lead.model} · ${lead.reg}`,
        html: `
          <!doctype html>
          <html lang="sv">
            <body style="margin:0;background:#f3f2ee;color:#202124;font-family:Arial,sans-serif;">
              <div style="max-width:680px;margin:0 auto;padding:36px 18px;">
                <div style="background:#202528;color:#fff;border-radius:24px;padding:30px;">
                  <p style="margin:0 0 12px;color:#B4D9EF;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Ny bil väntar på granskning</p>
                  <h1 style="margin:0;font-size:30px;">${make} ${lead.model} ${lead.variant || ''}</h1>
                  <p style="margin:10px 0 0;color:#ffffff99;">${lead.model_year} · ${lead.reg} · ${lead.miles} mil</p>
                  <a href="${adminReviewUrl}" style="display:inline-block;margin-top:24px;border-radius:999px;background:#B4D9EF;color:#202124;text-decoration:none;padding:14px 22px;font-weight:700;">Granska och godkänn bilen</a>
                </div>
                <div style="margin-top:14px;background:#fff;border:1px solid #deddd7;border-radius:24px;padding:30px;">
                  <h2 style="margin:0 0 18px;">Fordonsuppgifter</h2>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="7" style="font-size:14px;">
                    <tr><td style="color:#737b81;">Registrering</td><td><strong>${lead.reg}</strong></td></tr>
                    <tr><td style="color:#737b81;">Årsmodell</td><td><strong>${lead.model_year}</strong></td></tr>
                    <tr><td style="color:#737b81;">Miltal</td><td><strong>${lead.miles} mil</strong></td></tr>
                    <tr><td style="color:#737b81;">Plats</td><td><strong>${lead.pickup_postal_code} ${lead.pickup_city}</strong></td></tr>
                    <tr><td style="color:#737b81;">Kaross</td><td><strong>${lead.body_type}</strong></td></tr>
                    <tr><td style="color:#737b81;">Bränsle</td><td><strong>${lead.fuel_type}</strong></td></tr>
                    <tr><td style="color:#737b81;">Växellåda</td><td><strong>${lead.gearbox}</strong></td></tr>
                    <tr><td style="color:#737b81;">Drivning</td><td><strong>${lead.drivetrain}</strong></td></tr>
                    <tr><td style="color:#737b81;">Service</td><td><strong>${lead.service || 'Ej angivet'}</strong></td></tr>
                    <tr><td style="color:#737b81;">Skador</td><td><strong>${lead.damage || 'Ej angivet'}</strong></td></tr>
                    <tr><td style="color:#737b81;">Skadebeskrivning</td><td><strong>${lead.damage_description || 'Ingen'}</strong></td></tr>
                    <tr><td style="color:#737b81;">Varningslampor</td><td><strong>${lead.warnings || 'Ej angivet'}</strong></td></tr>
                    <tr><td style="color:#737b81;">Däckens skick</td><td><strong>${lead.tires || 'Ej angivet'}</strong></td></tr>
                    <tr><td style="color:#737b81;">Däckuppsättningar</td><td><strong>${lead.tireset || 'Ej angivet'}</strong></td></tr>
                    <tr><td style="color:#737b81;">Ägande/finansiering</td><td><strong>${lead.finance_status}</strong></td></tr>
                    <tr><td style="color:#737b81;">Finansbolag</td><td><strong>${lead.finance_provider || 'Ej aktuellt'}</strong></td></tr>
                    <tr><td style="color:#737b81;">Avtalsreferens</td><td><strong>${lead.finance_agreement_reference || 'Ej angivet'}</strong></td></tr>
                    <tr><td style="color:#737b81;">Uppskattad skuld</td><td><strong>${lead.finance_estimated_balance !== null ? `${lead.finance_estimated_balance.toLocaleString('sv-SE')} ${originCountry === 'SE' ? 'SEK' : 'EUR'}` : 'Ej angivet'}</strong></td></tr>
                    <tr><td style="color:#737b81;">Samtycke till kontroll</td><td><strong>${lead.finance_contact_consent ? 'Ja' : 'Ej aktuellt'}</strong></td></tr>
                    <tr><td style="color:#737b81;">Körbar</td><td><strong>${lead.is_driveable ? 'Ja' : 'Nej'}</strong></td></tr>
                    <tr><td style="color:#737b81;">Motor/växellådsproblem</td><td><strong>${lead.has_engine_transmission_issues ? 'Ja' : 'Nej'}</strong></td></tr>
                    <tr><td style="color:#737b81;">Vätskeläckage</td><td><strong>${lead.has_fluid_leaks ? 'Ja' : 'Nej'}</strong></td></tr>
                    <tr><td style="color:#737b81;">Allvarlig krockskada</td><td><strong>${lead.has_serious_collision_damage ? 'Ja' : 'Nej'}</strong></td></tr>
                    <tr><td style="color:#737b81;">Bilder</td><td><strong>${imageUrls.length} st</strong></td></tr>
                  </table>
                  <h2 style="margin:28px 0 12px;">Kund</h2>
                  <p style="margin:0 0 6px;"><strong>${email}</strong></p>
                  <p style="margin:0;">${phone}</p>
                  <p style="margin:24px 0 0;color:#8a9296;font-size:12px;">Bilen är inte synlig för handlare innan en administratör godkänner den.</p>
                </div>
              </div>
            </body>
          </html>
        `,
          })

          if (reviewEmailError) {
            console.error('Lead review email error:', reviewEmailError)
          }

          const { error: sellerEmailError } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `Your Autorell vehicle link: ${make} ${lead.model}`,
        text: [
          'Thank you for registering your vehicle with Autorell.',
          '',
          `Vehicle: ${make} ${lead.model} ${lead.variant || ''}`.trim(),
          `Registration number: ${lead.reg}`,
          '',
          'Autorell will now review the vehicle details and images before publishing the listing. This normally takes around 1–2 hours.',
          'Your first 24 hours of bidding are included at no cost and start only after approval.',
          'Use your private link to follow the review status, selected package, vehicle views, bids and the highest bid.',
          sellerPortalUrl,
          '',
          'You can choose a longer package immediately. Paid time starts only after Autorell approves the vehicle:',
          '7 days: SEK 100',
          'Premium 30 days with priority placement: SEK 290',
          `${sellerPortalUrl}#packages`,
          '',
          'This link is personal. Do not share it with anyone else.',
          '',
          'This is an automated email from Autorell and cannot be replied to.',
        ].join('\n'),
        html: `
          <!doctype html>
          <html lang="en">
            <body style="margin:0;background:#f3f2ee;color:#202124;font-family:Arial,sans-serif;">
              <div style="max-width:620px;margin:0 auto;padding:40px 20px;">
                <div style="background:#ffffff;border:1px solid #deddd7;border-radius:24px;padding:36px;">
                  <p style="margin:0 0 22px;font-size:24px;font-weight:700;letter-spacing:-.5px;">Autorell</p>
                  <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#52768a;">Your private seller link</p>
                  <h1 style="margin:0;font-size:30px;line-height:1.15;">Follow your vehicle on the market.</h1>
                  <p style="margin:18px 0 0;color:#66737a;line-height:1.7;">
                    Your ${make} ${lead.model} has been registered. Autorell will review the details and images before publishing it. This normally takes around 1–2 hours. Your selected package starts only after approval.
                  </p>
                  <div style="margin:26px 0;padding:18px;border-radius:16px;background:#eef6fa;">
                    <strong>${make} ${lead.model} ${lead.variant || ''}</strong><br />
                    <span style="color:#68777f;font-size:14px;">${lead.model_year} · ${lead.reg}</span>
                  </div>
                  <a href="${sellerPortalUrl}" style="display:inline-block;border-radius:999px;background:#202124;color:#ffffff;text-decoration:none;padding:15px 24px;font-weight:600;">
                    Follow the review and choose a package
                  </a>
                  <div style="margin-top:30px;border-top:1px solid #e4e3de;padding-top:26px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#52768a;">Need more time?</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width:50%;padding-right:6px;vertical-align:top;">
                          <div style="border:1px solid #deddd7;border-radius:16px;padding:18px;">
                            <strong style="font-size:18px;">7 days</strong>
                            <p style="margin:7px 0 14px;color:#66737a;font-size:13px;line-height:1.5;">Continue standard dealer exposure after the free period.</p>
                            <strong>SEK 100</strong>
                          </div>
                        </td>
                        <td style="width:50%;padding-left:6px;vertical-align:top;">
                          <div style="border:1px solid #9bc9e4;border-radius:16px;background:#eef7fb;padding:18px;">
                            <strong style="font-size:18px;">Premium 30 days</strong>
                            <p style="margin:7px 0 14px;color:#526d7c;font-size:13px;line-height:1.5;">Longer exposure with priority placement.</p>
                            <strong>SEK 290</strong>
                          </div>
                        </td>
                      </tr>
                    </table>
                    <a href="${sellerPortalUrl}#packages" style="display:inline-block;margin-top:18px;color:#202124;font-weight:600;">Choose a package now →</a>
                  </div>
                  <p style="margin:24px 0 0;color:#8a9296;font-size:12px;line-height:1.6;">
                    This link is personal and provides access to information about your vehicle. Do not share it with anyone else.
                  </p>
                  <p style="margin:18px 0 0;border-top:1px solid #eceae5;padding-top:18px;color:#9aa0a4;font-size:11px;line-height:1.6;">
                    This is an automated email from Autorell and cannot be replied to.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
          })

          if (sellerEmailError) {
            console.error('Seller portal email error:', sellerEmailError)
          }
        } catch (error) {
          console.error('Lead notification email error:', error)
        }
      })
    }

    return NextResponse.json({
      success: true,
      leadId: insertedLead.id,
      sellerPortalUrl: `/saljarportal/${sellerAccess.token}`,
    })
  } catch (error) {
    console.error('Route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Okänt serverfel.' },
      { status: 500 }
    )
  }
}
