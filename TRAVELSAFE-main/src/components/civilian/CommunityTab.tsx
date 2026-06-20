"use client";

import { useState } from "react";
import { Users, Shield, MapPin, Radio, MessageSquare, ThumbsUp, CheckCircle, AlertTriangle } from "lucide-react";

export function CommunityTab() {
  const coachLayout = [1, 0, 1, 2, 0, 1, 1, 2, 1, 0]; // 0=unsafe, 1=safe, 2=selected
  const [selectedSeat, setSelectedSeat] = useState<number | null>(3);

  // PeerSafe matches
  const coTravelers = [
    { name: "Priya Sharma", route: "Karol Bagh Metro", match: "96%", time: "18 min", avatar: "PS" },
    { name: "Arjun Mehta", route: "Connaught Place", match: "89%", time: "22 min", avatar: "AM" },
  ];

  // Community Alerts
  const [alerts, setAlerts] = useState([
    { id: 1, title: "Poor Lighting Reported", location: "CP Radial Road 4", upvotes: 18, confirmed: false },
    { id: 2, title: "Road Blockage / Construction", location: "Sector 7-G", upvotes: 34, confirmed: true },
  ]);

  const toggleConfirm = (id: number) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, upvotes: a.confirmed ? a.upvotes - 1 : a.upvotes + 1, confirmed: !a.confirmed } : a
      )
    );
  };

  const handleSeatClick = (index: number) => {
    if (coachLayout[index] === 0) return; // Unsafe/Blocked seat
    setSelectedSeat(index);
  };

  return (
    <div className="p-4 space-y-4">
      {/* PeerSafe Matches */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1">
            <Users size={10} className="text-emerald-400" /> PeerSafe™ Co-Commuters
          </h3>
          <span className="text-[8px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold uppercase tracking-wider">
            2 Matches
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {coTravelers.map((traveler) => (
            <div
              key={traveler.name}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/25 to-cyan-500/25 flex items-center justify-center text-[10px] font-bold text-white/80 border border-white/10 relative">
                  {traveler.avatar}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0a0f]" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-white">{traveler.name}</span>
                    <Shield size={10} className="text-cyan-400" />
                  </div>
                  <p className="text-[9px] text-white/30 flex items-center gap-0.5 mt-0.5">
                    <MapPin size={8} /> {traveler.route}
                  </p>
                </div>
              </div>
              <div className="text-right flex flex-col gap-1 items-end">
                <span className="text-xs font-bold text-emerald-400">{traveler.match} Match</span>
                <button className="text-[8px] px-2 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 font-semibold">
                  SYNC JOURNEY
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Public Sync coach seat layout */}
      <div className="space-y-2">
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1">
          <Radio size={10} className="text-emerald-400" /> Public Sync™ Seat Recommender
        </h3>
        
        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col items-center">
          <p className="text-[8px] text-white/30 uppercase tracking-wider mb-2">Coach Coach-04 Seating Layout</p>
          
          <div className="flex items-center gap-1 bg-black/40 border border-white/5 rounded-lg p-2.5">
            {coachLayout.map((seatType, index) => {
              const isSelected = selectedSeat === index;
              const isSafe = seatType === 1 || seatType === 2;
              
              return (
                <button
                  key={index}
                  onClick={() => handleSeatClick(index)}
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold border transition-colors ${
                    isSelected
                      ? "bg-cyan-500 border-cyan-400 text-white"
                      : isSafe
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-red-500/5 border-red-500/10 text-red-500/40 cursor-not-allowed"
                  }`}
                  disabled={!isSafe}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 mt-3 text-[8px] text-white/40 font-mono">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Recommended</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Low Security</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Selected</span>
          </div>
        </div>
      </div>

      {/* Community Alerts */}
      <div className="space-y-2">
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1">
          <MessageSquare size={10} className="text-emerald-400" /> Community Safety Alerts
        </h3>

        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={12} className="text-orange-400" />
                  <span className="text-xs font-semibold text-white/80">{alert.title}</span>
                </div>
                <p className="text-[9px] text-white/30">{alert.location}</p>
              </div>
              <button
                onClick={() => toggleConfirm(alert.id)}
                className={`flex items-center gap-1 text-[9px] px-2.5 py-1 rounded border transition-colors ${
                  alert.confirmed
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                }`}
              >
                {alert.confirmed ? <CheckCircle size={10} /> : <ThumbsUp size={10} />}
                <span>{alert.upvotes} Confirm</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
