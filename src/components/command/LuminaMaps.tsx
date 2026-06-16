"use client";

import { motion } from "framer-motion";
import { Route, Shield, Lightbulb, Users, AlertTriangle } from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

function MetricBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-1 text-white/50">{icon}{label}</span>
        <span className="font-mono text-white/70">{value}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function LuminaMaps() {
  const routes = useTravelSafeStore((s) => s.routes);
  const systemMode = useTravelSafeStore((s) => s.systemMode);
  const isEmergency = systemMode !== "SAFE";

  return (
    <GlassPanel emergency={isEmergency} glow={isEmergency ? "crimson" : "emerald"} delay={0.2}>
      <PanelHeader
        title="LuminaMaps™"
        subtitle="Intelligent Safety Routing"
        icon={<Route size={14} />}
        badge={<StatusBadge label="Live" status={isEmergency ? "danger" : "safe"} pulse />}
      />
      <div className="p-4 space-y-4">
        {routes.map((route, i) => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className={`rounded-lg p-3 border ${route.isActive
              ? isEmergency
                ? "border-red-500/30 bg-red-500/5"
                : "border-emerald-500/30 bg-emerald-500/5"
              : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield size={12} className={route.isActive ? (isEmergency ? "text-red-400" : "text-emerald-400") : "text-white/30"} />
                <span className="text-xs font-medium text-white/80">{route.name}</span>
                {route.isActive && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">ACTIVE</span>
                )}
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold font-[family-name:var(--font-display)] ${route.safetyScore >= 90 ? "text-emerald-400" : route.safetyScore >= 70 ? "text-cyan-400" : "text-orange-400"}`}>
                  {route.safetyScore}
                </span>
                <span className="text-[9px] text-white/30 block">Safety</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <MetricBar label="Lighting" value={route.lightingDensity} color="#06b6d4" icon={<Lightbulb size={10} />} />
              <MetricBar label="Crowd" value={route.crowdDensity} color="#8b5cf6" icon={<Users size={10} />} />
            </div>

            <div className="flex items-center justify-between text-[10px] text-white/40">
              <span className="flex items-center gap-1">
                <AlertTriangle size={10} className="text-orange-400/60" />
                Incident: {route.incidentProbability}%
              </span>
              <span>{route.duration} · {route.distance}</span>
            </div>

            {/* Route visualization */}
            <svg className="w-full h-8 mt-2" viewBox="0 0 200 30">
              <motion.path
                d={route.isActive
                  ? "M 10 15 Q 50 5, 90 15 T 170 15"
                  : "M 10 20 Q 60 8, 110 18 T 190 12"
                }
                fill="none"
                stroke={route.isActive ? (isEmergency ? "#dc2626" : "#10b981") : "#334155"}
                strokeWidth="2"
                strokeDasharray={route.isActive ? "none" : "4 4"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5 + i * 0.3 }}
              />
              <motion.circle
                cx="10" cy={route.isActive ? 15 : 20} r="3"
                fill={route.isActive ? (isEmergency ? "#dc2626" : "#10b981") : "#475569"}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 + i * 0.3 }}
              />
              <motion.circle
                cx="190" cy={route.isActive ? 15 : 12} r="3"
                fill={route.isActive ? (isEmergency ? "#f97316" : "#06b6d4") : "#475569"}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 + i * 0.3 }}
              />
            </svg>
          </motion.div>
        ))}

        {isEmergency && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-red-400/80 flex items-center gap-1.5 p-2 rounded bg-red-500/10 border border-red-500/20"
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              ⚡
            </motion.span>
            Recalculating safer alternate route...
          </motion.div>
        )}
      </div>
    </GlassPanel>
  );
}
