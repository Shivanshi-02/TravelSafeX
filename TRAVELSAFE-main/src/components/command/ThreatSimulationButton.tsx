"use client";

import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";

export function ThreatSimulationButton() {
  const isSimulating = useTravelSafeStore((s) => s.isSimulating);
  const startThreatSimulation = useTravelSafeStore((s) => s.startThreatSimulation);
  const stopThreatSimulation = useTravelSafeStore((s) => s.stopThreatSimulation);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
      className="fixed bottom-24 right-6 z-50"
    >
      {!isSimulating ? (
        <motion.button
          onClick={startThreatSimulation}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative px-6 py-3 rounded-xl font-bold text-sm tracking-wider uppercase overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <motion.div
            className="absolute inset-0 rounded-xl"
            animate={{ boxShadow: ["0 0 20px rgba(220,38,38,0.4)", "0 0 40px rgba(220,38,38,0.6)", "0 0 20px rgba(220,38,38,0.4)"] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <span className="relative flex items-center gap-2 text-white">
            <AlertTriangle size={16} />
            Simulate Threat
          </span>
        </motion.button>
      ) : (
        <motion.button
          onClick={stopThreatSimulation}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white/80 text-sm backdrop-blur-xl"
        >
          <X size={14} />
          End Simulation
        </motion.button>
      )}
    </motion.div>
  );
}
