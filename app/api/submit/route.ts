import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

// --- BASIC INFO ---
const reg = form.get("reg") as string;
const miles = form.get("miles") as string;
const phone = form.get("phone") as string;
const email = form.get("email") as string;
const source = form.get("source") as string;
console.log("SOURCE RECEIVED:", source);

if (!phone?.trim() || phone.replace(/\D/g, "").length < 7) {
  return NextResponse.json(
    { error: "Ogiltigt telefonnummer" },
    { status: 400 }
  );
}

if (
  !email?.trim() ||
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
) {
  return NextResponse.json(
    { error: "Ogiltig e-postadress" },
    { status: 400 }
  );
}

    // --- CONDITION / HISTORY ---
    const owners = form.get("owners") as string;
    const brakes = form.get("brakes") as string;
    const damage = form.get("damage") as string;
    const service = form.get("service") as string;
    const importCar = form.get("importCar") as string;

    // --- TECHNICAL ---
    const tires = form.get("tires") as string;
    const warnings = form.get("warnings") as string;
    const tireset = form.get("tireset") as string;
    const gearbox = form.get("gearbox") as string;
    const towbar = form.get("towbar") as string;

    // --- SELLING TIME ---
    const sellTime = form.get("sellTime") as string;

    // --- IMAGES ---
    const files = form.getAll("images") as File[];

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const imageUrls: string[] = [];

    for (const file of files) {
      const fileName = `images/${Date.now()}-${file.name}`;

      const { data: uploadData, error: uploadError } =
        await supabase.storage
          .from("leads")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError || !uploadData) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("leads")
          .createSignedUrl(uploadData.path, 60 * 60 * 24);

      if (signedUrlError || !signedUrlData || !signedUrlData.signedUrl) {
        console.error("Signed URL error:", signedUrlError);
        continue;
      }

      imageUrls.push(signedUrlData.signedUrl);
    }

    // --- SAVE TO SUPABASE ---
await supabase.from("leads").insert([
  {
    reg,
    miles,
    phone,
    email,
    source,
    owners,
    brakes,
    damage,
    service,
    importCar,
    tires,
    tireset,
    warnings,
    gearbox,
    towbar,
    sellTime,
    images: imageUrls,
  },
]);

    // --- SEND EMAIL ---
    const resend = new Resend(process.env.RESEND_API_KEY!);

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "nikolai.parkkila@outlook.com",
      subject: "Ny lead inkom!",
      html: `
        <h2>Ny Bilvärdering</h2>

        <h3>Grundinfo</h3>
        <p><strong>Country:</strong> ${source}</p>
        <p><strong>Registreringsnummer:</strong> ${reg}</p>
        <p><strong>Miltal:</strong> ${miles}</p>
        <p><strong>Önskad försäljningstid:</strong> ${sellTime}</p>

        <h3>Fordonshistorik</h3>
        <p><strong>Antal ägare:</strong> ${owners}</p>
        <p><strong>Importbil:</strong> ${importCar}</p>

        <h3>Skick</h3>
        <p><strong>Bromsar:</strong> ${brakes}</p>
        <p><strong>Skador:</strong> ${damage}</p>
        <p><strong>Servicehistorik:</strong> ${service}</p>

        <h3>Tekniskt skick</h3>
        <p><strong>Däck:</strong> ${tires}</p>
        <p><strong>Däckuppsättning:</strong> ${tireset}</p>
        <p><strong>Varningslampor:</strong> ${warnings}</p>
        <p><strong>Växellåda:</strong> ${gearbox}</p>
        <p><strong>Dragkrok:</strong> ${towbar}</p>

        <h3>Kontakt</h3>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>E-post:</strong> ${email}</p>

        <h3>Bilder</h3>
        ${imageUrls.map((url) => `<p><a href="${url}">Öppna bild</a></p>`).join("")}
      `,
    });

    return NextResponse.json({ success: true, imageUrls });
  } catch (err: any) {
    console.error("Route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
