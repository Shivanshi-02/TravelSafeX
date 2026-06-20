"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";

export function EmergencyOverlay() {
  const isSimulating = useTravelSafeStore((s) => s.isSimulating);
  const emergencyPackets = useTravelSafeStore((s) => s.emergencyPackets);
  const systemMode = useTravelSafeStore((s) => s.systemMode);
  const firGenerated = useTravelSafeStore((s) => s.firGenerated);

  if (!isSimulating) return null;

  const priorityColors = {
    critical: "text-red-400 border-red-500/30 bg-red-500/10",
    high: "text-orange-400 border-orange-500/30 bg-orange-500/10",
    medium: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  };

  return (
    <>
      {/* Emergency background overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 pointer-events-none z-30"
        style={{
          background: systemMode === "SOS"
            ? "radial-gradient(ellipse at center, rgba(220,38,38,0.08) 0%, transparent 70%)"
            : "radial-gradient(ellipse at center, rgba(249,115,22,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Scanlines in SOS mode */}
      {systemMode === "SOS" && (
        <div className="fixed inset-0 scanlines pointer-events-none z-40" />
      )}

      {/* Emergency packets stream */}
      <div className="fixed top-16 right-4 w-80 z-40 space-y-1.5 pointer-events-none">
        <AnimatePresence>
          {emergencyPackets.slice(0, 8).map((packet) => (
            <motion.div
              key={packet.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className={`px-3 py-2 rounded-lg border text-[10px] font-mono backdrop-blur-xl ${priorityColors[packet.priority]}`}
            >
              <span className="text-white/30 mr-2">{packet.timestamp}</span>
              {packet.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* FIR notification */}
      <AnimatePresence>
        {firGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-40 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/40 backdrop-blur-xl"
          >
            <p className="text-sm font-bold text-red-400 text-center">
              AUTO-FIR GENERATED — Delhi Police API
            </p>
            <p className="text-[10px] text-red-400/60 text-center mt-0.5">
              Reference: TSX-FIR-2026-{Math.floor(Math.random() * 90000 + 10000)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
