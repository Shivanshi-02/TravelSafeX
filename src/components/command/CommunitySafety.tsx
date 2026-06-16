"use client";

import { motion } from "framer-motion";
import { Users, Radio, MapPin, MessageCircle } from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function CommunitySafety() {
  const peers = useTravelSafeStore((s) => s.peers);
  const systemMode = useTravelSafeStore((s) => s.systemMode);
  const isEmergency = systemMode !== "SAFE";

  const modules = [
    { name: "PeerSafe™", desc: "Verified co-commuters", icon: <Users size={12} />, active: true },
    { name: "Public Sync™", desc: "Nearby trusted users", icon: <MapPin size={12} />, active: !isEmergency },
    { name: "Guardian Broadcast™", desc: "Alert distribution", icon: <Radio size={12} />, active: isEmergency },
  ];

  const statusColors = {
    online: "bg-emerald-400",
    journey: "bg-cyan-400",
    guardian: "bg-purple-400",
  };

  return (
    <GlassPanel emergency={isEmergency} delay={0.1}>
      <PanelHeader
        title="Community Safety Layer"
        subtitle="Social Protection Network"
        icon={<Users size={14} />}
        badge={<StatusBadge label={`${peers.length} Active`} status="info" />}
      />
      <div className="p-4 space-y-3">
        {/* Module tabs */}
        <div className="grid grid-cols-3 gap-1.5">
          {modules.map((mod) => (
            <motion.div
              key={mod.name}
              whileHover={{ scale: 1.02 }}
              className={`rounded-lg p-2 text-center border ${
                mod.active
                  ? isEmergency
                    ? "border-red-500/20 bg-red-500/5"
                    : "border-emerald-500/20 bg-emerald-500/5"
                  : "border-white/5 bg-white/[0.02]"
              }`}
            >
              <div className={`mx-auto mb-1 ${mod.active ? "text-emerald-400" : "text-white/20"}`}>
                {mod.icon}
              </div>
              <p className="text-[9px] font-medium text-white/70">{mod.name}</p>
              <p className="text-[7px] text-white/30">{mod.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Peer list */}
        <div className="space-y-2">
          {peers.map((peer, i) => (
            <motion.div
              key={peer.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/5"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-white/70 border border-white/10">
                  {peer.avatar}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0f] ${statusColors[peer.status]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/80 font-medium">{peer.name}</span>
                  <span className="text-[9px] font-mono text-emerald-400">{peer.safetyScore}</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-white/30">
                  <MapPin size={8} />
                  {peer.route}
                </div>
              </div>
              {isEmergency && peer.status === "journey" && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <MessageCircle size={12} className="text-cyan-400" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {isEmergency && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-2 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <p className="text-[10px] text-red-400 flex items-center gap-1.5">
              <Radio size={10} />
              Guardian Broadcast active — 847 nodes notified
            </p>
          </motion.div>
        )}
      </div>
    </GlassPanel>
  );
}
