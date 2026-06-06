"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DM_Sans, Archivo } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["700"],
});
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function Home() {
  const [step, setStep] = useState(1);

  const [images, setImages] = useState<
    { id: string; file: File; url: string }[]
  >([]);

  const [formData, setFormData] = useState({
    reg: "",
    miles: "",
    sellTime: "",
    brakes: "",
    damage: "",
    service: "",
    owners: "",
    import: "",
    tires: "",
    warnings: "",
    gearbox: "",
    towbar: "",
    phone: "",
    email: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showImageInfo, setShowImageInfo] = useState(false);

  // UNIVERSAL VALIDATION
  const validateStep = () => {
    if (step === 1) return formData.reg.trim().length > 0;
    if (step === 2)
      return formData.miles && Number(formData.miles) <= 10000;
    if (step === 3) return formData.sellTime.trim().length > 0;
    if (step === 4)
      return (
        formData.brakes &&
        formData.damage &&
        formData.service &&
        formData.phone &&
        formData.email
      );
    return true;
  };

  const getErrorMessage = () => {
    if (step === 1 && !formData.reg)
      return "Du måste fylla i registreringsnummer för att gå vidare.";

    if (step === 2 && Number(formData.miles) > 10000)
      return "Just nu söker våra europeiska återförsäljare bilar med en maxgräns på 10 000 mil. Tyvärr kommer vi inte kunna hitta en köpare till din bil om den har högre miltal.";

    if (step === 3 && !formData.sellTime)
      return "Välj när du vill sälja bilen för att fortsätta.";

    if (step === 4) {
      if (!formData.brakes) return "Fyll i bromsarnas skick.";
      if (!formData.damage) return "Fyll i om bilen har skador.";
      if (!formData.service) return "Fyll i servicehistorik.";
      if (!formData.phone) return "Fyll i telefonnummer.";
      if (!formData.email) return "Fyll i e-post.";
    }

    return "";
  };

  // IMAGE UPLOAD
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024);
    const remainingSlots = 10 - images.length;

    if (remainingSlots <= 0) {
      alert("Du kan ladda upp max 10 bilder.");
      return;
    }

    const limitedFiles = validFiles.slice(0, remainingSlots);

    const newImages = limitedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      form.append(key, value)
    );
    images.forEach((img) => form.append("images", img.file));

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
            Vi återkommer till dig inom 24 timmar med ett prisförslag baserat på dina uppgifter.
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
<div className="mt-4 mb-6">
  <Link href="https://www.autorell.se/" target="_blank">
    <Image
      src="/autorell-logo.png"
      alt="Autorell"
      width={150}
      height={60}
      priority
      className="h-auto w-[180px] md:w-[220px] object-contain cursor-pointer"
    />
  </Link>
</div>

          <h1 className={`text-3xl md:text-5xl leading-[1.1] tracking-tight text-[#0058AA] mb-4 ${archivo.className}`}>
            Sälj din bil till
            <span className="block">marknadens bästa pris</span>
          </h1>

          <p className="text-base md:text-lg text-zinc-600 max-w-xl leading-relaxed">
            Fyll i uppgifter steg för steg. Vi återkommer med ett konkurrenskraftigt bud inom 24 timmar.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white border border-zinc-200 shadow-xl rounded-2xl p-10">
          <form
  className="space-y-8"
  onSubmit={handleSubmit}
  onKeyDown={(e) => {
    if (e.key === "Enter") e.preventDefault();
  }}
>


{/* -------------------- STEG 1 -------------------- */}
{step === 1 && (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold text-[#0058AA]">Steg 1: Registreringsnummer</h2>

    <div className="flex overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-sm h-[68px] sm:h-[74px]">
      <div className="w-[44px] sm:w-[48px] min-w-[44px] bg-[#003599] flex items-center justify-center flex-shrink-0">
<Image
  src="/se-plate.png"
  width={24}
  height={44}
  alt="SE"
  priority
/>
      </div>

      <input
        type="text"
        placeholder="ABC123"
        value={formData.reg}
        onChange={(e) => {
          const value = e.target.value.toUpperCase();

          // Endast bokstäver och siffror
          if (!/^[A-Z0-9]*$/.test(value)) return;

          // Max 6 tecken
          if (value.length > 6) return;

          setFormData({ ...formData, reg: value });
        }}
        className={`flex-1 px-4 text-3xl tracking-[0.10em] uppercase outline-none text-zinc-600 ${dmSans.className}`}
        style={{ fontWeight: 700 }}
      />
    </div>

    {/* FELMEDDELANDE */}
    {(!/^[A-HJ-PR-UW-Z]{3}[0-9]{2}[A-HJ-PR-UW-Z0-9]$/.test(formData.reg)) && formData.reg.length === 6 && (
      <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">
        Ogiltigt registreringsnummer. Exempel: ABC123 eller ABC12A.
      </div>
    )}

    <button
      type="button"
      onClick={() => validateStep() && setStep(2)}
      disabled={
        !/^[A-HJ-PR-UW-Z]{3}[0-9]{2}[A-HJ-PR-UW-Z0-9]$/.test(formData.reg)
      }
      className={`w-full py-4 rounded-xl font-semibold text-[#0058AA] transition ${
        /^[A-HJ-PR-UW-Z]{3}[0-9]{2}[A-HJ-PR-UW-Z0-9]$/.test(formData.reg)
          ? "bg-[#F9E267] hover:brightness-95"
          : "bg-gray-300 cursor-not-allowed"
      }`}
    >
      Nästa →
    </button>
  </div>
)}

            {/* -------------------- STEG 2 -------------------- */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-[#0058AA]">Steg 2: Miltal</h2>

                <input
                  type="number"
                  placeholder="Ex: 5000 mil"
                  value={formData.miles}
                  onChange={(e) =>
                    setFormData({ ...formData, miles: e.target.value })
                  }
                  className="w-full border border-zinc-300 rounded-xl px-5 py-4 text-base text-zinc-600"
                />

                {getErrorMessage() && (
                  <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {getErrorMessage()}
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border rounded-xl"
                  >
                    ← Tillbaka
                  </button>

                  <button
                    type="button"
                    onClick={() => validateStep() && setStep(3)}
                    disabled={!validateStep()}
                    className={`px-6 py-3 rounded-xl font-semibold text-[#0058AA] ${
                      validateStep()
                        ? "bg-[#F9E267] hover:brightness-95"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    Nästa →
                  </button>
                </div>
              </div>
            )}

            {/* -------------------- STEG 3 -------------------- */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-[#0058AA]">Steg 3: När vill du sälja bilen?</h2>

                <select
                  value={formData.sellTime}
                  onChange={(e) =>
                    setFormData({ ...formData, sellTime: e.target.value })
                  }
                  className="w-full border border-zinc-300 rounded-xl px-5 py-4 text-base text-zinc-600"
                >
                  <option value="">Välj ett alternativ</option>
                  <option value="nu">Så snart som möjligt</option>
                  <option value="1-2 veckor">Inom 1–2 veckor</option>
                  <option value="1 månad">Inom 1 månad</option>
                  <option value="osäker">Jag är osäker</option>
                </select>

                {getErrorMessage() && (
                  <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {getErrorMessage()}
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border rounded-xl"
                  >
                    ← Tillbaka
                  </button>

                  <button
                    type="button"
                    onClick={() => validateStep() && setStep(4)}
                    disabled={!validateStep()}
                    className={`px-6 py-3 rounded-xl font-semibold text-[#0058AA] ${
                      validateStep()
                        ? "bg-[#F9E267] hover:brightness-95"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    Nästa →
                  </button>
                </div>
              </div>
            )}

            {/* -------------------- STEG 4 -------------------- */}
            {step === 4 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-[#0058AA]">Steg 4: Skick & skador</h2>

                {/* Bromsar */}
                <div>
                  <label className="block text-sm font-medium">Hur är bromsarna?</label>
                  <select
                    value={formData.brakes}
                    onChange={(e) =>
                      setFormData({ ...formData, brakes: e.target.value })
                    }
                    className="w-full border border-zinc-300 rounded-xl px-5 py-4 text-base text-zinc-600"
                  >
                    <option value="">Välj</option>
                    <option value="bra">Bra skick</option>
                    <option value="ok">Okej skick</option>
                    <option value="dåliga">Behöver bytas</option>
                  </select>
                </div>

                {/* Skador */}
                <div>
                  <label className="block text-sm font-medium">Finns det skador?</label>
                  <select
                    value={formData.damage}
                    onChange={(e) =>
                      setFormData({ ...formData, damage: e.target.value })
                    }
                    className="w-full border border-zinc-300 rounded-xl px-5 py-4 text-base text-zinc-600"
                  >
                    <option value="">Välj</option>
                    <option value="inga">Inga skador</option>
                    <option value="mindre">Mindre repor/dörruppslag</option>
                    <option value="större">Andra skador</option>
                    <option value="större">Större skador</option>
                  </select>
                </div>

                {/* Service */}
                <div>
                  <label className="block text-sm font-medium">Servicehistorik</label>
                  <select
                    value={formData.service}
                    onChange={(e) =>
                      setFormData({ ...formData, service: e.target.value })
                    }
                    className="w-full border border-zinc-300 rounded-xl px-5 py-4 text-base text-zinc-600"
                  >
                    <option value="">Välj</option>
                    <option value="full">Full servicebok</option>
                    <option value="delvis">Delvis servad</option>
                    <option value="ingen">Ingen servicehistorik</option>
                  </select>
                </div>

                {/* Extra viktiga frågor */}
                <div className="space-y-4">

<div>
  <label className="block text-sm font-medium">Antal tidigare ägare</label>
  <input
    type="number"
    placeholder="t.ex. 2"
    value={formData.owners}
    onChange={(e) => {
      const value = e.target.value;

      // Endast siffror
      if (!/^[0-9]*$/.test(value)) return;

      // Max 10 ägare
      if (Number(value) > 10) {
        setFormData({ ...formData, owners: value });
        return;
      }

      setFormData({ ...formData, owners: value });
    }}
    min="0"
    max="10"
    className="w-full border border-zinc-300 rounded-xl px-5 py-4 text-base text-zinc-600"
  />

  {/* FELMEDDELANDE OM > 10 */}
  {formData.owners && Number(formData.owners) > 10 && (
    <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm mt-2">
      För att säkerställa bilens historik letar vi i första hand efter fordon med färre än 10 tidigare ägare. Vi får därför tacka nej den här gången.
    </div>
  )}
</div>


                  <div>
                    <label className="block text-sm font-medium">Är bilen import?</label>
                    <select
                      value={formData.import}
                      onChange={(e) =>
                        setFormData({ ...formData, import: e.target.value })
                      }
                      className="w-full border border-zinc-300 rounded-xl px-5 py-4 text-base text-zinc-600"
                    >
                      <option value="">Välj</option>
                      <option value="nej">Nej</option>
                      <option value="ja">Ja</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Däckens skick</label>
                    <select
                      value={formData.tires}
                      onChange={(e) =>
                        setFormData({ ...formData, tires: e.target.value })
                      }
                      className="w-full border border-zinc-300 rounded-xl px-5 py-4 text-base text-zinc-600"
                    >
                      <option value="">Välj</option>
                      <option value="nya">Nya</option>
                      <option value="bra">Bra skick</option>
                      <option value="slitna">Slitna</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Varningslampor tända?</label>
                    <select
                      value={formData.warnings}
                      onChange={(e) =>
                        setFormData({ ...formData, warnings: e.target.value })
                      }
                      className="w-full border border-zinc-300 rounded-xl px-5 py-4 text-base text-zinc-600"
                    >
                      <option value="">Välj</option>
                      <option value="nej">Nej</option>
                      <option value="ja">Ja</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Växellåda</label>
                    <select
                      value={formData.gearbox}
                      onChange={(e) =>
                        setFormData({ ...formData, gearbox: e.target.value })
                      }
                      className="w-full border border-zinc-300 rounded-xl px-5 py-4 text-base text-zinc-600"
                    >
                      <option value="">Välj</option>
                      <option value="automat">Automat</option>
                      <option value="manuell">Manuell</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Dragkrok</label>
                    <select
                      value={formData.towbar}
                      onChange={(e) =>
                        setFormData({ ...formData, towbar: e.target.value })
                      }
                      className="w-full border border-zinc-300 rounded-xl px-5 py-4 text-base text-zinc-600"
                    >
                      <option value="">Välj</option>
                      <option value="ja">Ja</option>
                      <option value="nej">Nej</option>
                    </select>
                  </div>

                </div>
<div className="space-y-4">
 <div className="flex items-center gap-2">
  <label className="block text-sm font-medium">
    Bilder på bilen (valfritt)
  </label>

  <button
    type="button"
    onClick={() => setShowImageInfo(!showImageInfo)}
    className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-700 text-xs font-bold flex items-center justify-center"
  >
    i
  </button>
</div>

{showImageInfo && (
  <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-4 text-sm">
    Bilder är valfria men hjälper våra inköpare att göra en mer träffsäker värdering, vilket ofta kan leda till bättre bud.
  </div>
)}
  <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-zinc-300 rounded-xl p-8 cursor-pointer hover:border-[#0058AA] transition">
    <span className="text-lg font-medium text-zinc-700">
      Ladda upp bilder
    </span>

    <span className="text-sm text-zinc-500 mt-2 text-center">
      Klicka här eller välj upp till 10 bilder på bilen
    </span>

    <input
      type="file"
      multiple
      accept="image/*"
      onChange={handleImageUpload}
      className="hidden"
    />
  </label>

  {images.length > 0 && (
    <>
      <p className="text-sm text-zinc-600">
        Uppladdade bilder ({images.length}/10)
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((img) => (
          <div key={img.id} className="relative">
            <Image
              src={img.url}
              alt="Bilbild"
              width={300}
              height={200}
              className="w-full h-32 object-cover rounded-xl border"
            />

            <button
              type="button"
              onClick={() => removeImage(img.id)}
              className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full font-bold shadow"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  )}
</div>
                {/* Kontaktuppgifter */}
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium">Telefonnummer</label>
                    <input
                      type="tel"
                      placeholder="070-123 45 67"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full border border-zinc-300 rounded-xl px-5 py-4 text-base text-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">E-post</label>
                    <input
                      type="email"
                      placeholder="din@email.se"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full border border-zinc-300 rounded-xl px-5 py-4 text-base text-zinc-600"
                    />
                  </div>
                </div>

                {getErrorMessage() && (
                  <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {getErrorMessage()}
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-3 border rounded-xl"
                  >
                    ← Tillbaka
                  </button>

                  <button
                    type="submit"
                    disabled={!validateStep() || loading}
                    className={`px-6 py-3 rounded-xl font-semibold text-[#0058AA] ${
                      validateStep()
                        ? "bg-[#F9E267] hover:brightness-95"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {loading ? "Skickar..." : "Skicka →"}
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </main>
  );
}

