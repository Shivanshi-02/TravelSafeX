"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Info } from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";

export function NotificationFlyout() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useTravelSafeStore((s) => s.notifications);

  return (
    <>
      {/* Floating Bell Button */}
      <div className="fixed top-6 right-6 z-40">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-white/80 hover:text-white backdrop-blur-md shadow-lg"
        >
          <div className="relative">
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-500 border border-black animate-pulse" />
            )}
          </div>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-20 right-6 z-40 w-80 rounded-2xl border border-white/10 bg-[#0c0c12]/95 backdrop-blur-xl p-4 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest flex items-center gap-1">
                <Bell size={12} className="text-orange-400" /> System Alerts Log
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white"
              >
                <X size={10} />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {notifications.map((msg, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-white/[0.01] border border-white/5 text-[9px] font-mono text-white/60 leading-normal flex items-start gap-1.5"
                >
                  <Info size={10} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{msg}</span>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-[9px] text-white/30 italic text-center py-4">No active system notifications.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
