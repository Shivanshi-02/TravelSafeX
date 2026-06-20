"use client";

import { useState } from "react";
import { Search, Compass, Heart, Building, Eye, Clock, Route } from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";
import dynamic from "next/dynamic";

const InteractiveMap = dynamic(() => import("@/components/ui/InteractiveMap"), {
  ssr: false,
});

const routeDetails = {
  recommended: { score: 94, distance: "5.1 km", eta: "22 min", safety: "Highly Lit" },
  fastest: { score: 87, distance: "4.2 km", eta: "18 min", safety: "Moderate Lighting" },
  safest: { score: 98, distance: "6.0 km", eta: "26 min", safety: "Maximum Guardians" },
};

const mapMarkers = [
  { id: "sz-1", lat: 28.6324, lng: 77.2197, label: "Police Station CP Sector 1", type: "police" as const },
  { id: "sz-2", lat: 28.6250, lng: 77.2120, label: "Fortis Clinic & Med-Bay", type: "safezone" as const },
  { id: "sz-3", lat: 28.6280, lng: 77.2220, label: "TravelSafe Guard Hub #03", type: "safezone" as const }
];

const safezones = [
  { name: "Police Station CP Sector 1", type: "police", distance: "450m", crowd: "Low", open: "24/7" },
  { name: "Fortis Clinic & Med-Bay", type: "hospital", distance: "900m", crowd: "Medium", open: "24/7" },
  { name: "TravelSafe Guard Hub #03", type: "hub", distance: "300m", crowd: "Low", open: "24/7" },
];

const routes: Record<string, [number, number][]> = {
  recommended: [
    [28.6304, 77.2177],
    [28.6139, 77.2090],
    [28.5900, 77.2150],
    [28.5700, 77.2210],
    [28.5562, 77.2198]
  ],
  fastest: [
    [28.6304, 77.2177],
    [28.6000, 77.2200],
    [28.5750, 77.2250],
    [28.5562, 77.2198]
  ],
  safest: [
    [28.6304, 77.2177],
    [28.6150, 77.2400],
    [28.5900, 77.2450],
    [28.5700, 77.2350],
    [28.5562, 77.2198]
  ]
};

export function MapTab() {
  const systemMode = useTravelSafeStore((s) => s.systemMode);
  const isEmergency = systemMode !== "SAFE";
  const [selectedRoute, setSelectedRoute] = useState("recommended");

  return (
    <div className="p-4 space-y-4">
      {/* Route Inputs Card */}
      <div className="rounded-2xl p-3 bg-white/[0.02] border border-white/5 space-y-2">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-black/30 border border-white/5">
          <Compass size={14} className="text-emerald-400" />
          <input
            type="text"
            defaultValue="Connaught Place, Block B"
            className="bg-transparent text-xs text-white/80 w-full outline-none"
            readOnly
          />
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-black/30 border border-white/5">
          <Search size={14} className="text-cyan-400" />
          <input
            type="text"
            defaultValue="Siri Fort Aud., Khel Gaon"
            className="bg-transparent text-xs text-white/80 w-full outline-none"
            readOnly
          />
        </div>
      </div>

      {/* Map Display Card */}
      <div className="relative rounded-2xl border border-white/5 bg-black/40 overflow-hidden h-52">
        <InteractiveMap
          lat={28.6304}
          lng={77.2177}
          zoom={12}
          markers={mapMarkers}
          routeCoordinates={routes[selectedRoute]}
          lineColor={isEmergency ? "#ef4444" : selectedRoute === "safest" ? "#06b6d4" : "#10b981"}
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[8px] font-mono text-white/50 tracking-wider z-20">
          LIVE MAP GPS SIGNAL STATUS: OPTIMAL
        </div>
      </div>

      {/* Route Toggles */}
      <div className="grid grid-cols-3 gap-1.5">
        {(["recommended", "fastest", "safest"] as const).map((r) => {
          const detail = routeDetails[r];
          const isActive = selectedRoute === r;
          return (
            <button
              key={r}
              onClick={() => setSelectedRoute(r)}
              className={`rounded-xl p-2 border text-left flex flex-col justify-between h-20 transition-all ${
                isActive
                  ? isEmergency
                    ? "border-red-500/40 bg-red-500/5 text-red-400"
                    : "border-emerald-500/40 bg-emerald-500/5 text-emerald-400"
                  : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[8px] uppercase tracking-wider text-white/40">{r}</span>
                <span className={`text-[10px] font-bold ${isActive ? "" : "text-white/60"}`}>
                  {detail.score}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{detail.eta}</span>
                <span className="text-[8px] text-white/40 block mt-0.5 leading-none">{detail.distance}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Safezone List */}
      <div className="space-y-2">
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1.5">
          <Route size={10} className="text-emerald-400" /> Nearest Safe Havens
        </h3>
        <div className="space-y-2">
          {safezones.map((zone) => (
            <div
              key={zone.name}
              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  zone.type === "police"
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                    : zone.type === "hospital"
                      ? "border-pink-500/20 bg-pink-500/10 text-pink-400"
                      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                }`}>
                  {zone.type === "police" ? <Building size={14} /> : zone.type === "hospital" ? <Heart size={14} /> : <Eye size={14} />}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white/80">{zone.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[9px] text-white/30">
                    <span className="flex items-center gap-0.5"><Clock size={8} /> {zone.open}</span>
                    <span>·</span>
                    <span>Crowd: {zone.crowd}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-cyan-400 block">{zone.distance}</span>
                <button className="text-[8px] px-2 py-0.5 rounded border border-cyan-400/20 bg-cyan-400/10 text-cyan-400 font-medium mt-1">
                  NAVIGATE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
