"use client";

import { motion } from "framer-motion";
import { Shield, Activity, Bell, Wifi } from "lucide-react";
import Link from "next/link";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";
import { getModeColor } from "@/lib/utils";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function TopNav() {
  const systemMode = useTravelSafeStore((s) => s.systemMode);
  const metrics = useTravelSafeStore((s) => s.metrics);
  const sosCounter = useTravelSafeStore((s) => s.sosCounter);
  const isSimulating = useTravelSafeStore((s) => s.isSimulating);
  const isEmergency = systemMode !== "SAFE";

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
      className={`relative z-50 flex items-center justify-between px-6 py-3 border-b ${
        isEmergency ? "border-red-500/20 bg-red-950/30" : "border-white/5 bg-black/20"
      } backdrop-blur-xl`}
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEmergency ? "bg-red-500/20" : "bg-emerald-500/20"}`}>
            <Shield size={18} className={isEmergency ? "text-red-400" : "text-emerald-400"} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide font-[family-name:var(--font-display)] text-white/90">
              TravelSafe <span className={isEmergency ? "text-red-400" : "text-emerald-400"}>X</span>
            </h1>
            <p className="text-[9px] text-white/30 uppercase tracking-widest">Command Center</p>
          </div>
        </Link>
        <Link
          href="/civilian"
          className={`text-[9px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider transition-colors ${
            isEmergency
              ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          Civilian App
        </Link>
      </div>

      <div className="flex items-center gap-6">
        {/* System status */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={isEmergency ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
            style={{
              borderColor: `${getModeColor(systemMode)}40`,
              backgroundColor: `${getModeColor(systemMode)}10`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full status-blink"
              style={{ backgroundColor: getModeColor(systemMode) }}
            />
            <span className="text-xs font-bold tracking-wider" style={{ color: getModeColor(systemMode) }}>
              {systemMode}
            </span>
          </motion.div>

          {isSimulating && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30"
            >
              <Bell size={12} className="text-red-400" />
              <span className="text-xs font-mono font-bold text-red-400">
                SOS {String(Math.floor(sosCounter / 60)).padStart(2, "0")}:{String(sosCounter % 60).padStart(2, "0")}
              </span>
            </motion.div>
          )}
        </div>

        {/* Quick stats */}
        <div className="hidden md:flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5 text-white/40">
            <Activity size={12} className="text-emerald-400" />
            <span>Lumina:</span>
            <AnimatedCounter value={metrics.luminaScore} className="font-mono text-white/70" />
          </div>
          <div className="flex items-center gap-1.5 text-white/40">
            <Wifi size={12} className="text-cyan-400" />
            <AnimatedCounter value={metrics.verifiedUsers} className="font-mono text-white/70" />
            <span>users</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
