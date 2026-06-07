import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function text(form: FormData, key: string) {
  return String(form.get(key) || '').trim()
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
      body_type: text(form, 'bodyType'),
      fuel_type: text(form, 'fuelType'),
      gearbox: text(form, 'gearbox'),
      drivetrain: text(form, 'drivetrain'),
      miles: text(form, 'miles'),
    }

    if (Object.values(requiredFields).some((value) => !value)) {
      return NextResponse.json(
        { error: 'Obligatoriska fordonsuppgifter saknas.' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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
      service: text(form, 'service'),
      inspection_valid_until:
        text(form, 'inspectionValidUntil') || null,
      keys_count: text(form, 'keysCount'),
      brakes: text(form, 'brakes'),
      damage: text(form, 'damage'),
      damage_description: text(form, 'damageDescription') || null,
      warnings: text(form, 'warnings'),
      tires: text(form, 'tires'),
      tireset: text(form, 'tireset'),
      towbar: text(form, 'towbar'),
      equipment: text(form, 'equipment') || null,
      sellTime: text(form, 'sellTime'),
      phone,
      email,
      source: text(form, 'source') || 'SE',
      images: imageUrls,
      status: 'New',
    }

    const { error: insertError } = await supabase.from('leads').insert(lead)

    if (insertError) {
      console.error('Lead insert error:', insertError)
      return NextResponse.json(
        { error: 'Kunde inte spara fordonsuppgifterna.' },
        { status: 500 }
      )
    }

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'nikolai.parkkila@outlook.com',
        subject: `Ny fordonslead: ${make} ${lead.model}`,
        html: `
          <h2>${make} ${lead.model} ${lead.variant || ''}</h2>
          <p><strong>Registrering:</strong> ${lead.reg}</p>
          <p><strong>Årsmodell:</strong> ${lead.model_year}</p>
          <p><strong>Miltal:</strong> ${lead.miles} mil</p>
          <p><strong>Bränsle:</strong> ${lead.fuel_type}</p>
          <p><strong>Växellåda:</strong> ${lead.gearbox}</p>
          <p><strong>Drivning:</strong> ${lead.drivetrain}</p>
          <p><strong>Skick:</strong> ${lead.damage}</p>
          <p><strong>Telefon:</strong> ${phone}</p>
          <p><strong>E-post:</strong> ${email}</p>
          <p><strong>Bilder:</strong> ${imageUrls.length}</p>
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Okänt serverfel.' },
      { status: 500 }
    )
  }
}
