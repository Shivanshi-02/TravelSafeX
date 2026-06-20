"use client";

import { motion } from "framer-motion";
import { Link2, Lock, ShieldCheck, FileCheck, Video, Mic } from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function ShadowWitness() {
  const evidence = useTravelSafeStore((s) => s.evidence);
  const evidenceRecording = useTravelSafeStore((s) => s.evidenceRecording);
  const systemMode = useTravelSafeStore((s) => s.systemMode);
  const isEmergency = systemMode !== "SAFE";

  const badges = [
    { label: "Blockchain Verified", icon: <Link2 size={10} />, active: true },
    { label: "Evidence Locked", icon: <Lock size={10} />, active: evidenceRecording || isEmergency },
    { label: "Court Admissible", icon: <FileCheck size={10} />, active: isEmergency },
  ];

  return (
    <GlassPanel emergency={isEmergency} glow={isEmergency ? "crimson" : "cyan"} delay={0.5}>
      <PanelHeader
        title="Shadow Witness™"
        subtitle="Blockchain Evidence Vault"
        icon={<ShieldCheck size={14} />}
        badge={
          evidenceRecording ? (
            <StatusBadge label="Recording" status="danger" pulse />
          ) : (
            <StatusBadge label="Standby" status="safe" />
          )
        }
      />
      <div className="p-4 space-y-3">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <motion.span
              key={b.label}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-medium border ${
                b.active
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-white/5 text-white/30 border-white/10"
              }`}
            >
              {b.icon} {b.label}
            </motion.span>
          ))}
        </div>

        {/* Chain visualization */}
        <div className="relative py-4">
          <div className="flex items-center justify-center gap-1">
            {evidence.map((chunk, i) => (
              <motion.div
                key={chunk.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.15 }}
                className="flex items-center"
              >
                <div className={`w-10 h-10 rounded-lg border flex flex-col items-center justify-center ${
                  chunk.verified
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-white/10 bg-white/5"
                }`}>
                  {chunk.type === "video" ? (
                    <Video size={12} className="text-cyan-400" />
                  ) : (
                    <Mic size={12} className="text-purple-400" />
                  )}
                  <span className="text-[7px] text-white/30 mt-0.5">{chunk.size}</span>
                </div>
                {i < evidence.length - 1 && (
                  <div className="w-4 h-0.5 bg-emerald-500/30 relative">
                    <motion.div
                      className="absolute inset-0 bg-emerald-400"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
                      style={{ transformOrigin: "left" }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
            {evidenceRecording && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-10 h-10 rounded-lg border border-red-500/30 bg-red-500/5 flex items-center justify-center"
              >
                <div className="w-3 h-3 rounded-full bg-red-500" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Evidence list */}
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {evidence.map((chunk) => (
            <div
              key={chunk.id}
              className="flex items-center justify-between text-[10px] px-2 py-1.5 rounded bg-white/[0.02] border border-white/5"
            >
              <div className="flex items-center gap-2">
                {chunk.type === "video" ? <Video size={10} className="text-cyan-400/60" /> : <Mic size={10} className="text-purple-400/60" />}
                <span className="font-mono text-white/40">{chunk.hash}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/30">{chunk.timestamp}</span>
                {chunk.verified && <ShieldCheck size={10} className="text-emerald-400" />}
              </div>
            </div>
          ))}
        </div>

        {/* SHA-256 pipeline */}
        <div className="rounded-lg bg-black/30 p-2 border border-white/5">
          <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Cryptographic Pipeline</p>
          <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400/60">
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}>SHA-256</motion.span>
            <span className="text-white/20">→</span>
            <span>Merkle Tree</span>
            <span className="text-white/20">→</span>
            <span>Block #{(12847 + evidence.length).toLocaleString()}</span>
            <span className="text-white/20">→</span>
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }}>Verified ✓</motion.span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
