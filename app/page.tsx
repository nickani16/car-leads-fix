"use client";

import Image from "next/image";
import { useState } from "react";
import { DM_Sans, Archivo } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["700"],
});
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500"],
});
export default function Home() {
  const [images, setImages] = useState<
    { id: string; file: File; url: string }[]
  >([]);

  const [formData, setFormData] = useState({
    reg: "",
    miles: "",
    phone: "",
    email: "",
  });

  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // IMAGE UPLOAD
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    // Filtrera bort filer över 10MB
    const validFiles = files.filter(
      (file) => file.size <= 10 * 1024 * 1024
    );

    // Hur många bilder som får plats
    const remainingSlots = 10 - images.length;

    if (remainingSlots <= 0) {
      alert("Du kan ladda upp max 10 bilder.");
      return;
    }

    // Begränsa till max 10 totalt
    const limitedFiles = validFiles.slice(0, remainingSlots);

    const newImages = limitedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);

    if (files.length > validFiles.length) {
      alert("Vissa bilder var större än 10MB och laddades inte upp.");
    }

    if (files.length > remainingSlots) {
      alert("Max 10 bilder tillåtna.");
    }
  };

  // REMOVE IMAGE
  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consent) {
      setConsentError(true);
      return;
    }

    if (!formData.reg || !formData.phone || !formData.email) {
      alert(
        "Fyll i registreringsnummer, telefonnummer och e-post."
      );
      return;
    }

    setLoading(true);

    const form = new FormData();

    form.append("reg", formData.reg);
    form.append("miles", formData.miles);
    form.append("phone", formData.phone);
    form.append("email", formData.email);

    // Lägg till bilder
    images.forEach((img) => {
      form.append("images", img.file);
    });

    const res = await fetch("/api/submit", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    setLoading(false);

    if (data.error) {
      alert("Något gick fel: " + data.error);
      return;
    }

    setSubmitted(true);

    setFormData({
      reg: "",
      miles: "",
      phone: "",
      email: "",
    });

    setImages([]);
    setConsent(false);
    setConsentError(false);
  };

  // SUCCESS PAGE
  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-b from-white to-zinc-100">
        <div className="bg-white shadow-xl border border-zinc-200 rounded-2xl p-10 max-w-md text-center">
          <h2 className="text-3xl md:text-4xl font-medium mb-4 text-zinc-900">
            Tack för din förfrågan! 🎉
          </h2>

          <p className="text-zinc-600 text-base md:text-lg leading-relaxed font-normal">
            Vi återkommer till dig inom 24 timmar med ett
            prisförslag baserat på dina uppgifter.
          </p>

          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-semibold py-3 px-6 rounded-xl transition shadow-md text-sm md:text-base"
          >
            Skicka en ny förfrågan
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-white to-zinc-100 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
      <div className="w-full max-w-2xl mx-auto">

{/* HEADER */}
<div className="text-center mb-8 flex flex-col items-center">

  {/* LOGO */}
  <div className="mt-4 mb-6">
    <Image
      src="/logo.png"
      alt="Bilförmedling"
      width={130}
      height={70}
      priority
      className="h-auto w-[180px] md:w-[220px] object-contain"
    />
  </div>

<h1
  className={`text-3xl md:text-5xl leading-[1.1] tracking-tight text-[#333333] mb-4 ${archivo.className}`}
>
  Sälj din bil till
  <span className="block">
    marknadens bästa pris
  </span>
</h1>

  {/* SUBTEXT */}
  <p className="text-base md:text-lg text-zinc-600 max-w-xl leading-relaxed">
    Fyll i registreringsnummer, kontaktuppgifter och
    ladda gärna upp bilder. Vi återkommer med ett
    konkurrenskraftigt bud inom 24 timmar.
  </p>

</div>

        {/* FORM CARD */}
        <div className="bg-white border border-zinc-200 shadow-xl rounded-2xl p-10">
          <form className="space-y-8" onSubmit={handleSubmit}>

{/* REG NUMBER */}
<div>
  <label className="block text-sm font-medium text-zinc-700 mb-2">
    Registreringsnummer
  </label>

  <div className="flex overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-sm hover:shadow-md transition h-[68px] sm:h-[74px]">

    {/* LEFT EU PART */}
    <div className="w-[44px] sm:w-[48px] bg-[#003599] flex items-center justify-center shrink-0">
      <Image
        src="/se-plate.png"
        alt="Svensk registreringsskylt"
        width={24}
        height={44}
        className="object-contain w-[24px] h-auto sm:w-[26px]"
        priority
      />
    </div>

    {/* INPUT */}
    <input
      type="text"
      placeholder="ABC123"
      value={formData.reg}
      onChange={(e) =>
        setFormData({
          ...formData,
          reg: e.target.value.toUpperCase(),
        })
      }
      className={`flex-1 min-w-0 px-4 sm:px-5 text-3xl md:text-4xl tracking-[0.10em] uppercase bg-transparent outline-none text-zinc-800 ${dmSans.className}`}
      style={{ fontWeight: 700 }}
    />
  </div>
</div>

            {/* MILES */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Miltal
              </label>

              <input
                type="text"
                placeholder="5000 mil"
                value={formData.miles}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    miles: e.target.value,
                  })
                }
                className="w-full border border-zinc-300 rounded-lg px-5 py-4 outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition shadow-sm text-base font-normal"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Telefonnummer
              </label>

              <input
                type="tel"
                placeholder="070-123 45 67"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
                className="w-full border border-zinc-300 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition shadow-sm text-base font-normal"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                E-post
              </label>

              <input
                type="email"
                placeholder="din@email.se"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                className="w-full border border-zinc-300 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition shadow-sm text-base font-normal"
              />
            </div>

            {/* IMAGE UPLOAD */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                PNG, JPG upp till 10MB • Max 10 bilder
                (Valfritt)
              </label>

              <div className="border border-dashed border-zinc-300 rounded-xl p-6 text-center hover:border-zinc-400 transition bg-zinc-50 cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  id="fileUpload"
                  onChange={handleImageUpload}
                />

                <label
                  htmlFor="fileUpload"
                  className="cursor-pointer block"
                >
                  <div className="text-sm font-medium text-zinc-700">
                    Klicka för att välja bilder
                  </div>

                  <div className="text-xs text-zinc-500 mt-1 font-normal">
                    PNG, JPG upp till 10MB
                  </div>
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="relative group"
                    >
                      <img
                        src={img.url}
                        alt="preview"
                        className="w-full h-24 object-cover rounded-xl shadow"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(img.id)
                        }
                        className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition font-normal"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CONSENT */}
            <div className="flex flex-col gap-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    setConsentError(false);
                  }}
                  className="mt-1 w-5 h-5 accent-[#1E3A8A]"
                />

                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  Jag godkänner att mina uppgifter
                  behandlas enligt integritetspolicyn.
                </p>
              </label>

              {consentError && (
                <p className="text-red-500 text-xs font-normal">
                  Du måste godkänna integritetspolicyn
                  för att fortsätta.
                </p>
              )}
            </div>

            <button
  type="submit"
  disabled={loading}
  className={`w-full font-semibold py-4 rounded-xl text-lg shadow-lg transition ${
    loading
      ? "bg-[#F9E267] opacity-70 cursor-not-allowed"
      : "bg-[#F9E267] hover:brightness-95"
  }`}
  style={{ color: "#333333" }}
>
              {loading
                ? "Skickar..."
                : "Få gratis värdering →"}
            </button>

<div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-sm text-[#333333]">
  <span className="flex items-center gap-1">
    ✓ Kostnadsfritt
  </span>

  <span className="flex items-center gap-1">
    ✓ Ingen bindning
  </span>

  <span className="flex items-center gap-1">
    ✓ Svar inom 24h
  </span>
</div>
          </form>
        </div>
      </div>
    </main>
  );
}
