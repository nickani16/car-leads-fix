"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://pxtyjvrraybupolsjsmq.supabase.co",
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
  images?: string[];
  status?: string;
};

export default function DealerPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [bid, setBid] = useState("");
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const [bids, setBids] = useState<any[]>([]);
  const [allBids, setAllBids] = useState<any[]>([]);
  const getHighestBid = (leadId: string) => {
  const leadBids = allBids.filter((item) => item.lead_id === leadId);

  if (leadBids.length === 0) return "-";

  const highest = Math.max(
    ...leadBids.map((item) => Number(item.amount))
  );

  return `€${highest.toLocaleString()}`;
};

const getBidCount = (leadId: string) => {
  return allBids.filter((item) => item.lead_id === leadId).length;
};

const getBiddingEndsAt = (createdAt: string) => {
  const created = new Date(createdAt);
  return new Date(created.getTime() + 24 * 60 * 60 * 1000);
};

const getBiddingStatus = (createdAt: string) => {
  const endsAt = getBiddingEndsAt(createdAt);
  const now = new Date();

  if (now >= endsAt) return "Bidding closed";

  const diffMs = endsAt.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

  return `Ends in ${hours}h ${minutes}m`;
};

const isBiddingClosed = (createdAt: string) => {
  return new Date() >= getBiddingEndsAt(createdAt);
};

  useEffect(() => {
    const fetchLeads = async () => {
const { data, error } = await supabase
  .from("leads")
  .select("id,reg,miles,created_at,source,sellTime,owners,service,damage,gearbox,tires,tireset,towbar,warnings,images,status")
  .order("created_at", { ascending: false });

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (data) setLeads(data);
      const { data: bidsData } = await supabase
  .from("bids")
  .select("*");

setAllBids(bidsData || []);
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
<div>Highest Bid</div>
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
                <div className="text-zinc-600">
  {lead.source}
</div>
<div>
  <div className="text-zinc-900 font-semibold">
    {getHighestBid(lead.id)}
  </div>

  <div className="text-xs text-zinc-500">
    {getBidCount(lead.id)} bids
  </div>
</div>



<div>
  <div className="text-xs text-zinc-500 mb-1">
    {getBiddingStatus(lead.created_at)}
  </div>

  <div className="flex items-center gap-2">
    <select
      value={lead.status || "New"}
      onChange={async (e) => {
        const newStatus = e.target.value;

        const { error } = await supabase
          .from("leads")
          .update({ status: newStatus })
          .eq("id", lead.id);

        if (error) {
          console.error("STATUS UPDATE ERROR:", error);
          alert("Error updating status");
          return;
        }

        setLeads((prev) =>
          prev.map((item) =>
            item.id === lead.id ? { ...item, status: newStatus } : item
          )
        );
      }}
      className="text-xs px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-medium border border-blue-200"
    >
      <option value="New">New</option>
      <option value="Bidding">Bidding</option>
      <option value="Offer Accepted">Offer Accepted</option>
      <option value="Sold">Sold</option>
      <option value="Archived">Archived</option>
    </select>

    {!isBiddingClosed(lead.created_at) ? (
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
    ) : (
      <span className="text-xs px-3 py-1 rounded-lg bg-zinc-200 text-zinc-500">
        Closed
    </span>
  )}
  </div>
</div>
</div>
            ))
          )}
        </div>
      </div>

      {selectedLead && (
  <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 z-50 overflow-y-auto">
    
    <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-xl my-8">
      
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

<div className="mb-4 text-sm space-y-1">
  <p><strong>Country:</strong> {selectedLead.source}</p>
  <p><strong>Owners:</strong> {selectedLead.owners}</p>
  <p><strong>Service:</strong> {selectedLead.service}</p>
  <p><strong>Damage:</strong> {selectedLead.damage}</p>
  <p><strong>Gearbox:</strong> {selectedLead.gearbox}</p>
  <p><strong>Tires:</strong> {selectedLead.tires}</p>
  <p><strong>Tire Set:</strong> {selectedLead.tireset}</p>
  <p><strong>Towbar:</strong> {selectedLead.towbar}</p>
  <p><strong>Warnings:</strong> {selectedLead.warnings}</p>
</div>

{selectedLead.images && selectedLead.images.length > 0 && (
  <div className="mb-4">
    <p className="font-medium mb-2">Photos</p>

    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {selectedLead.images.map((image, index) => (
<button
  key={index}
  type="button"
  onClick={() => setActiveImage(image)}
  className="relative block overflow-hidden rounded-lg border group"
>
<>
  <img
    src={image}
    alt={`Vehicle ${index + 1}`}
    className="w-full h-32 object-cover transition group-hover:scale-105"
  />

  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
    <span className="text-white text-sm font-medium">
      Click to enlarge
    </span>
  </div>
</>
        </button>
      ))}
    </div>
  </div>
)}

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

{activeImage && (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]"
    onClick={() => setActiveImage(null)}
  >
    <div className="relative max-w-5xl w-full">
      <button
        type="button"
        onClick={() => setActiveImage(null)}
        className="absolute -top-10 right-0 text-white text-2xl"
      >
        ×
      </button>

      <img
        src={activeImage}
        alt="Vehicle large preview"
        className="w-full max-h-[85vh] object-contain rounded-xl"
      />
    </div>
  </div>
)}

    </main>
  );
}