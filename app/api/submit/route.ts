import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { canonicalVehicleValue } from '@/lib/vehicle-translation'
import { createSellerAccessToken } from '@/lib/seller-access'

function text(form: FormData, key: string) {
  return String(form.get(key) || '').trim()
}

function boolean(form: FormData, key: string) {
  return text(form, key).toLowerCase() === 'true'
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

    if (
      Object.values(requiredFields).some((value) => !value) ||
      !/^[A-Z]{2}$/.test(originCountry)
    ) {
      return NextResponse.json(
        { error: 'Obligatoriska fordonsuppgifter saknas.' },
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

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const sellerAccess = createSellerAccessToken()
    const { count: approvedDealerCount } = await supabase
      .from('dealers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')

    const imageUrls: string[] = []
    const files = form
      .getAll('images')
      .filter((item): item is File => item instanceof File && item.size > 0)

    for (const [index, file] of files.entries()) {
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
        continue
      }

      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
        .from('leads')
        .createSignedUrl(uploadData.path, 60 * 60 * 24 * 7)

      if (signedUrlError || !signedUrlData?.signedUrl) {
        console.error('Signed URL error:', signedUrlError)
        continue
      }

      imageUrls.push(signedUrlData.signedUrl)
    }

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
      tireset: text(form, 'tireset'),
      towbar: canonicalVehicleValue(text(form, 'towbar')),
      equipment: text(form, 'equipment') || null,
      sellTime: canonicalVehicleValue(text(form, 'sellTime')),
      phone,
      email,
      source: originCountry,
      origin_country: originCountry,
      images: imageUrls,
      status: 'New',
      seller_access_token_hash: sellerAccess.hash,
      auction_starts_at: new Date().toISOString(),
      auction_ends_at: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(),
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
      const resend = new Resend(process.env.RESEND_API_KEY)
      const fromEmail =
        process.env.NOTIFICATION_FROM_EMAIL ||
        'Autorell <noreply@autorell.com>'
      const sellerPortalUrl = new URL(
        `/saljarportal/${sellerAccess.token}`,
        request.url
      ).toString()
      await resend.emails.send({
        from: fromEmail,
        to: 'nikolai.parkkila@outlook.com',
        subject: `Ny fordonslead: ${make} ${lead.model}`,
        html: `
          <h2>${make} ${lead.model} ${lead.variant || ''}</h2>
          <p><strong>Registrering:</strong> ${lead.reg}</p>
          <p><strong>Årsmodell:</strong> ${lead.model_year}</p>
          <p><strong>Miltal:</strong> ${lead.miles} mil</p>
          <p><strong>Upphämtningsort:</strong> ${lead.pickup_postal_code} ${lead.pickup_city}</p>
          <p><strong>Bränsle:</strong> ${lead.fuel_type}</p>
          <p><strong>Växellåda:</strong> ${lead.gearbox}</p>
          <p><strong>Drivning:</strong> ${lead.drivetrain}</p>
          <p><strong>Skick:</strong> ${lead.damage}</p>
          <p><strong>Telefon:</strong> ${phone}</p>
          <p><strong>E-post:</strong> ${email}</p>
          <p><strong>Bilder:</strong> ${imageUrls.length}</p>
          <p><a href="${sellerPortalUrl}">Öppna säljarens privata uppföljning</a></p>
        `,
      })

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
          'Your first 24 hours of bidding are included at no cost.',
          'Use your private link to follow time remaining, verified dealer reach, vehicle views, bids and the highest bid.',
          sellerPortalUrl,
          '',
          'Optional extensions after the free bidding period:',
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
                    Your ${make} ${lead.model} has been registered. The first 24 hours of bidding are included at no cost. Your private view shows time remaining, verified dealer reach, views, bids and the highest bid.
                  </p>
                  <div style="margin:26px 0;padding:18px;border-radius:16px;background:#eef6fa;">
                    <strong>${make} ${lead.model} ${lead.variant || ''}</strong><br />
                    <span style="color:#68777f;font-size:14px;">${lead.model_year} · ${lead.reg}</span>
                  </div>
                  <a href="${sellerPortalUrl}" style="display:inline-block;border-radius:999px;background:#202124;color:#ffffff;text-decoration:none;padding:15px 24px;font-weight:600;">
                    Open my private vehicle page
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
                    <a href="${sellerPortalUrl}#packages" style="display:inline-block;margin-top:18px;color:#202124;font-weight:600;">View extension options →</a>
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
