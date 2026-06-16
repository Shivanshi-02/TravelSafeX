"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface StatusBadgeProps {
  label: string;
  status: "safe" | "warning" | "danger" | "info";
  pulse?: boolean;
}

const statusStyles = {
  safe: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  warning: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  danger: "bg-red-500/20 text-red-400 border-red-500/30",
  info: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

export function StatusBadge({ label, status, pulse }: StatusBadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border",
        statusStyles[status]
      )}
    >
      {pulse && (
        <span className={cn("w-1.5 h-1.5 rounded-full status-blink", {
          "bg-emerald-400": status === "safe",
          "bg-orange-400": status === "warning",
          "bg-red-400": status === "danger",
          "bg-cyan-400": status === "info",
        })} />
      )}
      {label}
    </motion.span>
  );
}
