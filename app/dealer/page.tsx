"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Lead = {
  id: string;
  reg: string;
  miles: string;
  created_at: string;
  source?: string;
  sellTime?: string;
  owners?: string;
  service?: string;
  damage?: string;
  gearbox?: string;
  tires?: string;
  tireset?: string;
  towbar?: string;
  warnings?: string;
};

export default function DealerPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [bid, setBid] = useState("");

  const [bids, setBids] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (data) setLeads(data);
      setLoading(false);
    };

    fetchLeads();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
<h1 className="text-3xl font-bold text-zinc-900">
  Dealer Portal
</h1>

<p className="text-zinc-600 mt-1">
  New vehicle leads available for bidding
</p>
        </div>

        {/* TABLE WRAPPER */}
        <div className="bg-white rounded-2xl shadow border border-zinc-200 overflow-hidden">

          {/* TABLE HEADER */}
          <div className="grid grid-cols-6 bg-zinc-50 text-sm font-semibold text-zinc-600 px-6 py-4 border-b">
<div>Registration</div>
<div>Kilometers</div>
<div>Country</div>
<div>Bids</div>
<div>Submitted</div>
<div>Status</div>
          </div>

          {/* TABLE BODY */}
          {loading ? (
            <div className="p-6 text-zinc-500">Laddar leads...</div>
          ) : leads.length === 0 ? (
            <div className="p-6 text-zinc-500">Inga leads än</div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.id}
                className="grid grid-cols-6 px-6 py-4 border-b hover:bg-zinc-50 transition"
              >
                <div className="font-semibold text-zinc-900">
                  {lead.reg}
                </div>

                <div className="text-zinc-600">
                  {Number(lead.miles) * 10} km
                </div>


                <div className="text-zinc-500 text-sm">
                  {new Date(lead.created_at).toLocaleString("sv-SE")}
                </div>

                <div>
<div className="flex items-center gap-2">
  <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
    New
  </span>

<button
  onClick={async () => {
    setSelectedLead(lead);

    const { data } = await supabase
      .from("bids")
      .select("*")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false });

    setBids(data || []);
  }}
  className="text-xs px-3 py-1 rounded-lg bg-[#0058AA] text-white hover:opacity-90 transition"
>
  Place Bid
</button>
</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {selectedLead && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
    
    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
      
<h2 className="text-xl font-semibold mb-2 text-zinc-900">
  Place Bid
</h2>

<div className="mb-4">
  <p className="font-medium mb-2">
    Previous Bids
  </p>

  {bids.length === 0 ? (
    <p className="text-sm text-zinc-500">
      No bids yet
    </p>
  ) : (
    <div className="space-y-2">
      {bids.map((item) => (
        <div
          key={item.id}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          €{Number(item.amount).toLocaleString()}
        </div>
      ))}
    </div>
  )}
</div>

      <p className="text-sm text-zinc-600 mb-4">
        {selectedLead.reg} • {Number(selectedLead.miles) * 10} km
      </p>

      <input
        type="number"
        placeholder="Enter bid (€)"
        value={bid}
        onChange={(e) => setBid(e.target.value)}
        className="w-full border border-zinc-300 rounded-xl px-4 py-3 mb-4 text-zinc-700"
      />

      <div className="flex justify-end gap-3">

<button
  onClick={() => {
    setSelectedLead(null);
    setBid("");
  }}
  className="px-4 py-2 rounded-xl border"
>
  Cancel
</button>

<button
  onClick={async () => {
    const { error } = await supabase
      .from("bids")
      .insert([
        {
          lead_id: selectedLead.id,
          amount: bid,
        },
      ]);

if (error) {
  console.error(error);
  alert("Error saving bid");
  return;
}

const { data } = await supabase
  .from("bids")
  .select("*")
  .eq("lead_id", selectedLead.id)
  .order("created_at", { ascending: false });

setBids(data || []);

setBid("");

alert("Bid submitted successfully!");
  }}
  className="px-4 py-2 rounded-xl bg-[#F9E267] text-[#0058AA] font-semibold"
>
  Submit Bid
</button>

      </div>
    </div>
  </div>
)}
    </main>
  );
}