import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const reg = form.get("reg") as string;
    const miles = form.get("miles") as string;
    const phone = form.get("phone") as string;
    const email = form.get("email") as string;

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

      if (uploadError) continue;

      const { data: signedUrlData } =
        await supabase.storage
          .from("leads")
          .createSignedUrl(uploadData.path, 60 * 60 * 24);

      imageUrls.push(signedUrlData.signedUrl);
    }

    await supabase.from("leads").insert([{ reg, miles, phone, email }]);

    const resend = new Resend(process.env.RESEND_API_KEY!);

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "nikolai.parkkila@outlook.com",
      subject: "Ny lead inkom!",
      html: `
        <h2>Ny Bilvärdering</h2>
        <p><strong>Registreringsnummer:</strong> ${reg}</p>
        <p><strong>Miltal:</strong> ${miles}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>E-post:</strong> ${email}</p>
        <h3>Bilder:</h3>
        ${imageUrls.map((url) => `<p><a href="${url}">Öppna bild</a></p>`).join("")}
      `,
    });

    return NextResponse.json({ success: true, imageUrls });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
