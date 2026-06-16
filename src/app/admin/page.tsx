"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Globe, Users, Clock, Camera } from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";
import { useMockStreams } from "@/hooks/useMockStreams";
import dynamic from "next/dynamic";

const SafetyChart = dynamic(() => import("@/components/admin/SafetyChart"), {
  ssr: false,
});

export default function AdminPage() {
  useMockStreams(); // Start streams

  // Zustand State
  const systemMode = useTravelSafeStore((s) => s.systemMode);
  const metrics = useTravelSafeStore((s) => s.metrics);
  const smartCityCctvActive = useTravelSafeStore((s) => s.smartCityCctvActive);
  const toggleCctv = useTravelSafeStore((s) => s.toggleCctv);
  const aadhaarQueue = useTravelSafeStore((s) => s.aadhaarQueue);
  const approveAadhaarAccount = useTravelSafeStore((s) => s.approveAadhaarAccount);

  const isEmergency = systemMode !== "SAFE";

  // Local state
  const [activeTab, setActiveTab] = useState<"cctv" | "approvals" | "analytics">("cctv");

  // Chart data: Safety index comparison by city
  const citySafetyData = [
    { city: "Delhi NCR", score: metrics.luminaScore, activeResponders: 847 },
    { city: "Mumbai", score: 94, activeResponders: 1240 },
    { city: "Bangalore", score: 96, activeResponders: 1050 },
    { city: "Kolkata", score: 85, activeResponders: 600 },
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden ${isEmergency ? "grid-bg-emergency bg-[#0d0404]" : "grid-bg bg-[#050508]"} transition-colors duration-1000`}>
      {/* Header operational bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isEmergency ? "bg-red-500/20" : "bg-orange-500/20"}`}>
              <Shield size={14} className={isEmergency ? "text-red-400" : "text-orange-400"} />
            </div>
            <span className="text-xs font-bold font-[family-name:var(--font-display)] text-white/95">
              TravelSafe X <span className="text-white/40">· National Control Tower</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-[9px] font-bold">
            SECURITY RANK: NATIONAL ADMIN
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
        </div>
      </nav>

      {/* Grid Dashboard */}
      <div className="max-w-6xl mx-auto pt-20 px-4 grid grid-cols-12 gap-4 pb-10">
        
        {/* Left Side: National Safety Twin Cities comparative grid */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md p-4 space-y-4">
            <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
              <Globe size={14} className="text-orange-400" /> National Safety Twin™
            </h3>

            <div className="space-y-3">
              {citySafetyData.map((item) => {
                const isDelhi = item.city === "Delhi NCR";
                return (
                  <div
                    key={item.city}
                    className={`p-3 rounded-xl border ${
                      isDelhi && isEmergency
                        ? "border-red-500/30 bg-red-500/5 text-red-400 animate-pulse"
                        : "border-white/5 bg-white/[0.02]"
                    } flex items-center justify-between`}
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-white/95">{item.city}</h4>
                      <span className="text-[8px] text-white/30 uppercase block mt-0.5">
                        {item.activeResponders} active nodes
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold font-mono ${
                        item.score >= 90
                          ? "text-emerald-400"
                          : item.score >= 70
                            ? "text-cyan-400"
                            : "text-red-400"
                      }`}>
                        {item.score}%
                      </span>
                      <span className="text-[8px] text-white/30 block uppercase">Safety</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] text-center">
              <Users size={14} className="mx-auto text-emerald-400 mb-1" />
              <span className="text-[8px] text-white/30 block uppercase">Verified Users</span>
              <span className="text-sm font-bold text-white/90 font-mono">12,847</span>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] text-center">
              <Clock size={14} className="mx-auto text-cyan-400 mb-1" />
              <span className="text-[8px] text-white/30 block uppercase">Avg Response</span>
              <span className="text-sm font-bold text-white/90 font-mono">1.8m</span>
            </div>
          </div>
        </div>

        {/* Right Side: Tab Portals */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* Header tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("cctv")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                activeTab === "cctv"
                  ? "bg-orange-500/10 border-orange-500/35 text-orange-400"
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
              }`}
            >
              Smart City CCTV Feeds
            </button>
            <button
              onClick={() => setActiveTab("approvals")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                activeTab === "approvals"
                  ? "bg-orange-500/10 border-orange-500/35 text-orange-400"
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
              }`}
            >
              Aadhaar Approvals Queue
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                activeTab === "analytics"
                  ? "bg-orange-500/10 border-orange-500/35 text-orange-400"
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
              }`}
            >
              Analytics Center
            </button>
          </div>

          {activeTab === "cctv" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Camera size={14} className="text-orange-400" /> AI Pedestrian tracking CCTV Grid
                  </h4>
                  <button
                    onClick={toggleCctv}
                    className={`text-[9px] px-2 py-0.5 rounded font-bold border transition-colors ${
                      smartCityCctvActive
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}
                  >
                    {smartCityCctvActive ? "FEED ACTIVE" : "FEED MUTED"}
                  </button>
                </div>

                {/* CCTV grid layout */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { cam: "CAM-01 CP Radial Road 4", target: "Pedestrian Flow: Normal" },
                    { cam: "CAM-02 CP Sector 7-G", target: isEmergency ? "PEDESTRIAN DISTURBANCE DETECTED" : "Pedestrian Flow: Normal" },
                  ].map((cctv, idx) => (
                    <div
                      key={idx}
                      className="relative h-36 rounded-xl bg-black/60 border border-white/5 overflow-hidden flex flex-col justify-between p-2"
                    >
                      <div className="flex items-center justify-between text-[8px] font-mono text-white/40">
                        <span>{cctv.cam}</span>
                        <span className="text-emerald-400">● LIVE</span>
                      </div>
                      
                      {smartCityCctvActive ? (
                        <div className="absolute inset-0 flex items-center justify-center p-6">
                          {/* Bounding box mock drawing */}
                          <div className={`relative w-16 h-16 border-2 rounded ${
                            isEmergency && idx === 1 ? "border-red-500 animate-pulse" : "border-emerald-400"
                          }`}>
                            <span className="absolute -top-3.5 left-0 text-[6px] font-mono bg-black/80 px-1 rounded">
                              {isEmergency && idx === 1 ? "TARGET #49" : "HUMAN #12"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-[10px] text-white/20 italic">CCTV feed deactivated</div>
                      )}

                      <span className="text-[7px] text-white/30 uppercase tracking-widest font-mono select-none">
                        AI OVERLAY: {cctv.target}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "approvals" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Pending Credentials Verifications Queue
                </h4>
                
                <div className="space-y-2.5">
                  {aadhaarQueue.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 text-[10px] font-bold">
                          {item.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-semibold text-white/80">{item.name}</h5>
                          <p className="text-[9px] text-white/30">Request Role: {item.role} · Aadhaar linked</p>
                        </div>
                      </div>
                      
                      {item.approved ? (
                        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                          APPROVED
                        </span>
                      ) : (
                        <button
                          onClick={() => approveAadhaarAccount(item.id)}
                          className="text-[9px] px-3 py-1 rounded bg-orange-500/10 border border-orange-500/25 text-orange-400 font-bold hover:bg-orange-500/20"
                        >
                          APPROVE
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Operational Safety Coverage Index
                </h4>
                
                <SafetyChart data={citySafetyData} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
