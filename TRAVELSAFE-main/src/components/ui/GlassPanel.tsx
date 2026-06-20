"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  emergency?: boolean;
  glow?: "emerald" | "cyan" | "crimson" | "none";
  delay?: number;
}

export function GlassPanel({ children, className, emergency, glow = "none", delay = 0 }: GlassPanelProps) {
  const glowClass = {
    emerald: "glow-emerald",
    cyan: "glow-cyan",
    crimson: "glow-crimson",
    none: "",
  }[glow];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const }}
      className={cn(
        "glass-panel rounded-xl overflow-hidden",
        emergency && "glass-panel-emergency",
        glowClass,
        className
      )}
    >
      {children}
    </motion.div>
  );
}
