"use client";

import { motion } from "framer-motion";
import { Brain, Activity, Lock, Zap, Cpu } from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import dynamic from "next/dynamic";

const GrabSenseCharts = dynamic(() => import("./GrabSenseCharts"), {
  ssr: false,
});

export function GrabSenseAI() {
  const grabSense = useTravelSafeStore((s) => s.grabSense);
  const systemMode = useTravelSafeStore((s) => s.systemMode);
  const isEmergency = systemMode !== "SAFE";

  const waveformData = grabSense.waveform.map((v, i) => ({ i, v }));
  const accelData = grabSense.acceleration.map((v, i) => ({ i, v }));

  return (
    <GlassPanel emergency={isEmergency} glow={isEmergency ? "crimson" : "cyan"} delay={0.3}>
      <PanelHeader
        title="Grab-Sense™ AI"
        subtitle="Kinematic Threat Detection"
        icon={<Brain size={14} />}
        badge={
          <StatusBadge
            label={grabSense.modelStatus.toUpperCase()}
            status={grabSense.modelStatus === "alert" ? "danger" : grabSense.modelStatus === "processing" ? "warning" : "safe"}
            pulse
          />
        }
      />
      <div className="p-4 space-y-3">
        {/* Dynamic Charts component */}
        <GrabSenseCharts
          waveformData={waveformData}
          accelData={accelData}
          isEmergency={isEmergency}
          inferenceLatency={grabSense.inferenceLatency}
        />

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Detection", value: `${grabSense.detectionConfidence}%`, icon: <Zap size={10} />, color: isEmergency ? "text-red-400" : "text-emerald-400" },
            { label: "Threat Prob.", value: `${grabSense.threatProbability}%`, icon: <Activity size={10} />, color: grabSense.threatProbability > 50 ? "text-red-400" : "text-emerald-400" },
            { label: "Biometric", value: grabSense.biometricLock ? "LOCKED" : "OPEN", icon: <Lock size={10} />, color: grabSense.biometricLock ? "text-cyan-400" : "text-orange-400" },
            { label: "Latency", value: `<${grabSense.inferenceLatency}ms`, icon: <Cpu size={10} />, color: "text-cyan-400" },
          ].map((m) => (
            <motion.div
              key={m.label}
              className="rounded-lg bg-white/[0.02] border border-white/5 p-2"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-1 text-[9px] text-white/40 mb-0.5">
                {m.icon} {m.label}
              </div>
              <div className={`text-sm font-bold font-mono ${m.color}`}>{m.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Neural network visualization */}
        <div className="relative h-16 rounded-lg bg-black/30 border border-white/5 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center gap-4">
            {[3, 5, 4, 2].map((nodes, layer) => (
              <div key={layer} className="flex flex-col gap-2">
                {Array.from({ length: nodes }).map((_, n) => (
                  <motion.div
                    key={n}
                    className={`w-2 h-2 rounded-full ${isEmergency ? "bg-red-400" : "bg-emerald-400"}`}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: layer * 0.2 + n * 0.1 }}
                  />
                ))}
              </div>
            ))}
          </div>
          <span className="absolute bottom-1 left-2 text-[8px] text-white/20 uppercase">Inference Engine</span>
        </div>

        {/* Orientation */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-white/40">
          <span>Orientation:</span>
          <span>X:{grabSense.orientation.x.toFixed(3)}</span>
          <span>Y:{grabSense.orientation.y.toFixed(3)}</span>
          <span>Z:{grabSense.orientation.z.toFixed(3)}</span>
        </div>
      </div>
    </GlassPanel>
  );
}
