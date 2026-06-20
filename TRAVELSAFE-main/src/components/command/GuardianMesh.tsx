"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Radar, Shield, Users, Clock } from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function GuardianMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guardians = useTravelSafeStore((s) => s.guardians);
  const metrics = useTravelSafeStore((s) => s.metrics);
  const systemMode = useTravelSafeStore((s) => s.systemMode);
  const isEmergency = systemMode !== "SAFE";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let sweepAngle = 0;

    const size = 200;
    canvas.width = size * 2;
    canvas.height = size * 2;
    ctx.scale(2, 2);

    const draw = () => {
      const cx = size / 2;
      const cy = size / 2;
      const radius = size / 2 - 10;

      ctx.clearRect(0, 0, size, size);

      // Background circles
      for (let r = radius; r > 0; r -= radius / 4) {
        ctx.strokeStyle = isEmergency ? "rgba(220, 38, 38, 0.08)" : "rgba(16, 185, 129, 0.08)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Cross lines
      ctx.strokeStyle = isEmergency ? "rgba(220, 38, 38, 0.05)" : "rgba(16, 185, 129, 0.05)";
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();

      // Radar sweep
      sweepAngle += 0.02;
      const gradient = ctx.createConicGradient(sweepAngle, cx, cy);
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(0.1, isEmergency ? "rgba(220, 38, 38, 0.3)" : "rgba(16, 185, 129, 0.3)");
      gradient.addColorStop(0.2, "transparent");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Guardian nodes
      guardians.forEach((g, i) => {
        const angle = (i / guardians.length) * Math.PI * 2 - Math.PI / 2;
        const dist = (g.distance / 3) * radius * 0.8;
        const nx = cx + Math.cos(angle) * dist;
        const ny = cy + Math.sin(angle) * dist;

        const nodeColor = g.status === "responding" ? "#dc2626" : g.status === "active" ? "#10b981" : "#475569";

        // Connection lines in emergency
        if (isEmergency && g.status === "responding") {
          ctx.strokeStyle = "rgba(220, 38, 38, 0.3)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(nx, ny);
          ctx.stroke();

          // Pulse ring
          const pulse = (Date.now() % 2000) / 2000;
          ctx.strokeStyle = `rgba(220, 38, 38, ${0.5 - pulse * 0.5})`;
          ctx.beginPath();
          ctx.arc(nx, ny, 8 + pulse * 15, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(nx, ny, g.status === "responding" ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();

        if (g.status !== "standby") {
          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.font = "7px monospace";
          ctx.fillText(g.name.split(" ")[1], nx - 12, ny - 8);
        }
      });

      // Center dot
      ctx.fillStyle = isEmergency ? "#dc2626" : "#10b981";
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      // 5KM label
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "8px monospace";
      ctx.fillText("5KM", cx + radius - 20, cy - radius + 12);

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [guardians, isEmergency]);

  return (
    <GlassPanel emergency={isEmergency} glow={isEmergency ? "crimson" : "emerald"} delay={0.4}>
      <PanelHeader
        title="Guardian Mesh Network™"
        subtitle="5KM Community Shield"
        icon={<Radar size={14} />}
        badge={<StatusBadge label="Active" status={isEmergency ? "danger" : "safe"} pulse />}
      />
      <div className="p-4">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <canvas ref={canvasRef} style={{ width: 200, height: 200 }} className="rounded-full" />
            {isEmergency && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-500/30"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-white/[0.02] border border-white/5">
            <Shield size={12} className="mx-auto mb-1 text-emerald-400" />
            <AnimatedCounter value={metrics.guardianCount} className="text-sm font-bold text-white/90" />
            <p className="text-[8px] text-white/30 uppercase mt-0.5">Guardians</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/[0.02] border border-white/5">
            <Users size={12} className="mx-auto mb-1 text-cyan-400" />
            <AnimatedCounter value={metrics.nearbyResponders} className="text-sm font-bold text-white/90" />
            <p className="text-[8px] text-white/30 uppercase mt-0.5">Responders</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/[0.02] border border-white/5">
            <Clock size={12} className="mx-auto mb-1 text-orange-400" />
            <p className="text-sm font-bold text-white/90">{metrics.responseTime}</p>
            <p className="text-[8px] text-white/30 uppercase mt-0.5">ETA</p>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          {guardians.filter(g => g.status !== "standby").map((g) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between text-[10px] px-2 py-1 rounded bg-white/[0.02]"
            >
              <span className="text-white/60">{g.name}</span>
              <span className={`font-mono ${g.status === "responding" ? "text-red-400" : "text-emerald-400"}`}>
                {g.distance}km · {g.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
