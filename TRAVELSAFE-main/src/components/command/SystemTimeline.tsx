"use client";

import { motion } from "framer-motion";
import { Clock, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PanelHeader } from "@/components/ui/PanelHeader";

const stageIcons = {
  "T-10": <Zap size={12} />,
  "T-0": <AlertTriangle size={12} />,
  "+5": <Clock size={12} />,
  "+15": <CheckCircle size={12} />,
};

export function SystemTimeline() {
  const timeline = useTravelSafeStore((s) => s.timeline);
  const systemMode = useTravelSafeStore((s) => s.systemMode);
  const firGenerated = useTravelSafeStore((s) => s.firGenerated);
  const isEmergency = systemMode !== "SAFE";

  return (
    <GlassPanel emergency={isEmergency} className="col-span-full" delay={0.6}>
      <PanelHeader
        title="System Timeline"
        subtitle="Escalation Pipeline"
        icon={<Clock size={14} />}
        badge={
          firGenerated ? (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              FIR Generated
            </span>
          ) : undefined
        }
      />
      <div className="p-4">
        <div className="relative flex items-start justify-between">
          {/* Connection line */}
          <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-white/5">
            <motion.div
              className={`h-full ${isEmergency ? "bg-gradient-to-r from-red-500 via-orange-500 to-cyan-500" : "bg-emerald-500/30"}`}
              initial={{ width: "0%" }}
              animate={{ width: isEmergency ? "100%" : "0%" }}
              transition={{ duration: 8, ease: "easeInOut" }}
            />
          </div>

          {timeline.map((event, i) => (
            <motion.div
              key={event.stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.15 }}
              className="relative flex flex-col items-center w-1/4 z-10"
            >
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  event.completed
                    ? isEmergency
                      ? "border-red-500 bg-red-500/20 text-red-400"
                      : "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : event.active
                      ? "border-orange-500 bg-orange-500/20 text-orange-400"
                      : "border-white/10 bg-white/5 text-white/30"
                }`}
                animate={event.active && !event.completed ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {stageIcons[event.stage]}
              </motion.div>

              <div className="mt-2 text-center">
                <p className="text-[10px] font-bold text-white/80 font-[family-name:var(--font-display)]">
                  {event.stage}
                </p>
                <p className="text-[9px] text-white/40">{event.title}</p>
                {event.completed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1.5 space-y-0.5"
                  >
                    <p className="text-[8px] font-mono text-white/30">{event.timestamp}</p>
                    <p className={`text-[9px] font-mono ${event.threatScore > 70 ? "text-red-400" : "text-emerald-400"}`}>
                      Threat: {event.threatScore}%
                    </p>
                    <p className="text-[8px] text-cyan-400/60">AI: {event.aiConfidence}%</p>
                    <p className="text-[8px] text-white/50 max-w-[120px]">{event.action}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
