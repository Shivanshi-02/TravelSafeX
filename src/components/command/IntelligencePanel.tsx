"use client";

import { motion } from "framer-motion";
import { Brain, TrendingUp, AlertCircle, Globe } from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function IntelligencePanel() {
  const metrics = useTravelSafeStore((s) => s.metrics);
  const systemMode = useTravelSafeStore((s) => s.systemMode);
  const isEmergency = systemMode !== "SAFE";

  const insights = [
    { label: "Threat Prediction", value: isEmergency ? "ACTIVE" : "NOMINAL", icon: <Brain size={12} />, color: isEmergency ? "text-red-400" : "text-emerald-400" },
    { label: "Safety Trend", value: isEmergency ? "-58%" : "+12%", icon: <TrendingUp size={12} />, color: isEmergency ? "text-red-400" : "text-emerald-400" },
    { label: "Active Alerts", value: String(metrics.activeThreats), icon: <AlertCircle size={12} />, color: metrics.activeThreats > 0 ? "text-red-400" : "text-emerald-400" },
    { label: "Coverage", value: "Delhi NCR", icon: <Globe size={12} />, color: "text-cyan-400" },
  ];

  const predictions = isEmergency
    ? [
        "Grab-Sense anomaly in Sector 7-G",
        "3 guardians within response radius",
        "Auto-FIR pipeline initiated",
        "Evidence vault recording active",
      ]
    : [
        "Low incident probability on current route",
        "12 verified co-commuters nearby",
        "Peak safety window: 18:00–21:00",
        "Guardian density optimal in zone",
      ];

  return (
    <div className="space-y-4">
      <GlassPanel delay={0.1}>
        <PanelHeader
          title="AI Intelligence"
          subtitle="Predictive Analytics"
          icon={<Brain size={14} />}
        />
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {insights.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5"
              >
                <div className="flex items-center gap-1.5 text-[9px] text-white/40 mb-1">
                  {item.icon} {item.label}
                </div>
                <p className={`text-sm font-bold font-mono ${item.color}`}>{item.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-1.5">
            <p className="text-[9px] text-white/30 uppercase tracking-widest">Live Insights</p>
            {predictions.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-2 text-[10px] text-white/50 p-1.5 rounded bg-white/[0.02]"
              >
                <span className={`mt-0.5 w-1 h-1 rounded-full flex-shrink-0 ${isEmergency ? "bg-red-400" : "bg-emerald-400"}`} />
                {p}
              </motion.div>
            ))}
          </div>
        </div>
      </GlassPanel>

      <GlassPanel delay={0.15}>
        <PanelHeader title="Network Status" subtitle="Infrastructure Health" icon={<Globe size={14} />} />
        <div className="p-4 space-y-2">
          {[
            { label: "Verified Users", value: metrics.verifiedUsers },
            { label: "Guardian Nodes", value: metrics.guardianCount },
            { label: "Active Routes", value: 1247 },
            { label: "Evidence Chains", value: 8934 },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-between text-[10px]">
              <span className="text-white/40">{stat.label}</span>
              <AnimatedCounter value={stat.value} className="font-mono text-white/70" />
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
