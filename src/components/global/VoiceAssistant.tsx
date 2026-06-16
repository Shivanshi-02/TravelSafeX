"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Volume2 } from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const voiceAssistantActive = useTravelSafeStore((s) => s.voiceAssistantActive);
  const toggleVoiceAssistant = useTravelSafeStore((s) => s.toggleVoiceAssistant);
  const startThreatSimulation = useTravelSafeStore((s) => s.startThreatSimulation);
  const addNotification = useTravelSafeStore((s) => s.addNotification);

  const predefinedCommands = [
    { text: "Trigger emergency SOSCP Sector 7", action: () => startThreatSimulation() },
    { text: "Reroute safest route Connaught Place", action: () => addNotification("Voice Assistant: Calculating safest route detour.") },
  ];

  const handleCommandTrigger = (cmd: string, action: () => void) => {
    setVoiceText(cmd);
    setTimeout(() => {
      action();
      setVoiceText(`Executing: ${cmd}`);
      setTimeout(() => {
        setIsOpen(false);
        setVoiceText("");
      }, 1000);
    }, 1200);
  };

  return (
    <>
      {/* Voice Mic Floating Button */}
      <div className="fixed bottom-6 left-22 z-40">
        <motion.button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!voiceAssistantActive) toggleVoiceAssistant();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-12 h-12 rounded-full border flex items-center justify-center text-white shadow-lg transition-all ${
            voiceAssistantActive
              ? "bg-purple-600 border-purple-500/30 shadow-purple-500/25 animate-pulse"
              : "bg-white/5 border-white/10 text-white/50"
          }`}
        >
          <Mic size={20} />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed bottom-20 left-22 z-40 w-72 rounded-2xl border border-white/10 bg-[#0d0d16]/95 backdrop-blur-xl p-4 shadow-2xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1">
                <Volume2 size={12} /> AI Voice Assistant
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white"
              >
                <X size={10} />
              </button>
            </div>

            <div className="space-y-4 py-2">
              <div className="h-12 flex items-center justify-center text-center">
                {voiceText ? (
                  <p className="text-xs font-mono text-white/80">{voiceText}</p>
                ) : (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-purple-400 rounded-full"
                        animate={{ height: [4, h * 6, 4] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <p className="text-[8px] text-white/30 uppercase tracking-wider">Tap to Speak Command:</p>
                {predefinedCommands.map((cmd) => (
                  <button
                    key={cmd.text}
                    onClick={() => handleCommandTrigger(cmd.text, cmd.action)}
                    className="w-full text-left p-2 rounded bg-white/[0.02] border border-white/5 text-[9px] text-white/60 hover:text-white hover:bg-white/5 transition-all font-mono"
                  >
                    &quot;{cmd.text}&quot;
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
