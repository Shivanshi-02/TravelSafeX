"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";

export function DigitalSafetyTwin() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const systemMode = useTravelSafeStore((s) => s.systemMode);
  const metrics = useTravelSafeStore((s) => s.metrics);
  const threatLocation = useTravelSafeStore((s) => s.threatLocation);
  const isEmergency = systemMode !== "SAFE";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width / 2;
      const h = canvas.height / 2;
      time += 0.016;

      ctx.clearRect(0, 0, w, h);

      const gridColor = isEmergency ? "rgba(220, 38, 38, 0.08)" : "rgba(16, 185, 129, 0.06)";
      const roadColor = isEmergency ? "rgba(249, 115, 22, 0.3)" : "rgba(6, 182, 212, 0.2)";
      const accentColor = isEmergency ? "#dc2626" : "#10b981";
      const glowColor = isEmergency ? "rgba(220, 38, 38, 0.15)" : "rgba(16, 185, 129, 0.1)";

      // Background glow
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Grid
      const gridSize = 30;
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Buildings
      const buildings = [
        { x: 0.15, y: 0.2, w: 0.08, h: 0.15 },
        { x: 0.3, y: 0.15, w: 0.06, h: 0.2 },
        { x: 0.5, y: 0.1, w: 0.1, h: 0.25 },
        { x: 0.7, y: 0.2, w: 0.07, h: 0.18 },
        { x: 0.85, y: 0.15, w: 0.08, h: 0.22 },
        { x: 0.2, y: 0.55, w: 0.09, h: 0.12 },
        { x: 0.45, y: 0.6, w: 0.12, h: 0.15 },
        { x: 0.65, y: 0.55, w: 0.08, h: 0.18 },
        { x: 0.8, y: 0.65, w: 0.1, h: 0.1 },
      ];

      buildings.forEach((b) => {
        const bx = b.x * w;
        const by = b.y * h;
        const bw = b.w * w;
        const bh = b.h * h;
        ctx.fillStyle = isEmergency ? "rgba(40, 10, 10, 0.6)" : "rgba(20, 30, 40, 0.6)";
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = isEmergency ? "rgba(220, 38, 38, 0.2)" : "rgba(16, 185, 129, 0.15)";
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);

        // Windows
        for (let wy = by + 4; wy < by + bh - 4; wy += 8) {
          for (let wx = bx + 4; wx < bx + bw - 4; wx += 8) {
            const lit = Math.sin(time * 2 + wx + wy) > 0;
            ctx.fillStyle = lit
              ? (isEmergency ? "rgba(249, 115, 22, 0.4)" : "rgba(6, 182, 212, 0.3)")
              : "rgba(0, 0, 0, 0.3)";
            ctx.fillRect(wx, wy, 4, 4);
          }
        }
      });

      // Roads with pulsing
      const roads = [
        { x1: 0, y1: 0.45, x2: 1, y2: 0.45 },
        { x1: 0.4, y1: 0, x2: 0.4, y2: 1 },
        { x1: 0, y1: 0.75, x2: 1, y2: 0.75 },
      ];

      roads.forEach((road) => {
        const pulse = Math.sin(time * 3) * 0.3 + 0.7;
        ctx.strokeStyle = roadColor.replace("0.2", String(0.2 * pulse));
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(road.x1 * w, road.y1 * h);
        ctx.lineTo(road.x2 * w, road.y2 * h);
        ctx.stroke();

        // Traffic particles
        for (let i = 0; i < 5; i++) {
          const t = ((time * 0.3 + i * 0.2) % 1);
          const px = road.x1 * w + (road.x2 * w - road.x1 * w) * t;
          const py = road.y1 * h + (road.y2 * h - road.y1 * h) * t;
          ctx.fillStyle = accentColor;
          ctx.globalAlpha = 0.6 + Math.sin(time * 5 + i) * 0.3;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      // Safe zones
      const safeZones = [
        { x: 0.25, y: 0.35, r: 25 },
        { x: 0.6, y: 0.4, r: 20 },
        { x: 0.75, y: 0.7, r: 22 },
      ];

      if (!isEmergency) {
        safeZones.forEach((zone) => {
          const pulse = Math.sin(time * 2) * 5;
          ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(zone.x * w, zone.y * h, zone.r + pulse, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "rgba(16, 185, 129, 0.05)";
          ctx.fill();
        });
      }

      // Red zones in emergency
      if (isEmergency && threatLocation) {
        const tx = 0.5 * w;
        const ty = 0.45 * h;
        const pulse = Math.sin(time * 4) * 10;

        ctx.fillStyle = "rgba(220, 38, 38, 0.1)";
        ctx.beginPath();
        ctx.arc(tx, ty, 60 + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(220, 38, 38, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tx, ty, 40 + pulse * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        // Threat marker
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(tx, ty, 6, 0, Math.PI * 2);
        ctx.fill();

        // Interception radius
        ctx.strokeStyle = "rgba(249, 115, 22, 0.3)";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(tx, ty, 80, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Holographic markers
      const markers = [
        { x: 0.35, y: 0.3, label: "SZ-01" },
        { x: 0.55, y: 0.5, label: "GZ-03" },
        { x: 0.72, y: 0.35, label: "SZ-02" },
      ];

      markers.forEach((m) => {
        const float = Math.sin(time * 2 + m.x * 10) * 3;
        ctx.fillStyle = isEmergency ? "#f97316" : "#10b981";
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(m.x * w, m.y * h + float - 8);
        ctx.lineTo(m.x * w - 5, m.y * h + float);
        ctx.lineTo(m.x * w + 5, m.y * h + float);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "8px monospace";
        ctx.fillText(m.label, m.x * w - 10, m.y * h + float - 12);
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [isEmergency, threatLocation]);

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-3 left-3 z-10">
        <motion.div
          key={metrics.luminaScore}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="glass-panel rounded-lg px-3 py-2"
        >
          <p className="text-[9px] text-white/40 uppercase tracking-widest">Lumina Score</p>
          <p className={`text-2xl font-bold font-[family-name:var(--font-display)] ${isEmergency ? "text-red-400 text-glow-crimson" : "text-emerald-400 text-glow-emerald"}`}>
            {metrics.luminaScore}
          </p>
        </motion.div>
      </div>
      <div className="absolute bottom-3 right-3 z-10 flex gap-2">
        <div className="glass-panel rounded px-2 py-1 text-[9px] text-white/50">
          <span className="text-emerald-400">●</span> Safe Zone
        </div>
        <div className="glass-panel rounded px-2 py-1 text-[9px] text-white/50">
          <span className="text-cyan-400">━</span> Live Routes
        </div>
        {isEmergency && (
          <div className="glass-panel-emergency rounded px-2 py-1 text-[9px] text-red-400">
            <span>●</span> Threat Zone
          </div>
        )}
      </div>
    </div>
  );
}
