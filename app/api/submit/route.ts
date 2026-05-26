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
  "https://pxtyjvrraybupolsjsmq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dHlqdnJyYXlidXBvbHNqc21xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYwMzU5MywiZXhwIjoyMDk1MTc5NTkzfQ.zZJXxqs4SH1PEA8mKQixjzGtM8c6FTbdrtnD7j5YgpA"
);

    // LADDA UPP BILDER
    const imageUrls: string[] = [];

    for (const file of files) {
      const fileName = `images/${Date.now()}-${file.name}`;

      // Upload till PRIVATE bucket
      const { data: uploadData, error: uploadError } =
        await supabase.storage
          .from("leads")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      // Skapa signerad URL (24h)
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("leads")
          .createSignedUrl(
            uploadData.path,
            60 * 60 * 24 // 24 timmar
          );

      if (signedUrlError) {
        console.error(
          "Signed URL error:",
          signedUrlError
        );
        continue;
      }

      imageUrls.push(signedUrlData.signedUrl);
    }

    // SPARA LEAD I DATABASEN
    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          reg,
          miles,
          phone,
          email,
        },
      ]);

    if (error) {
      console.error("Supabase-fel:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // RESEND
    const resend = new Resend(
      process.env.RESEND_API_KEY!
    );

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "nikolai.parkkila@outlook.com",
      subject: "Ny lead inkom!",
      html: `
        <h2>Ny lead</h2>

        <p><strong>Registreringsnummer:</strong> ${reg}</p>
        <p><strong>Miltal:</strong> ${miles}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>E-post:</strong> ${email}</p>

        <h3>Bilder:</h3>

        ${
          imageUrls.length > 0
            ? imageUrls
                .map(
                  (url) => `
                    <p>
                      <a href="${url}">
                        Öppna bild
                      </a>
                    </p>
                  `
                )
                .join("")
            : "<p>Inga bilder uppladdade</p>"
        }
      `,
    });

    return NextResponse.json({
      success: true,
      data,
      imageUrls,
    });
  } catch (err: any) {
    console.error("Fel i route:", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}