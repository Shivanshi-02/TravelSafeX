"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Lock, Video, Mic, ShieldAlert, ShieldCheck } from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";

interface JourneyTabProps {
  onTriggerSilentSos: () => void;
}

export function JourneyTab({ onTriggerSilentSos }: JourneyTabProps) {
  const systemMode = useTravelSafeStore((s) => s.systemMode);
  const isEmergency = systemMode !== "SAFE";
  const evidence = useTravelSafeStore((s) => s.evidence);

  const [safeWords] = useState(["Aunt Mary called.", "I forgot my blue file."]);
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<{ sender: "user" | "other"; text: string }[]>([
    { sender: "other", text: "Hey! Let know when you reach CP." },
    { sender: "user", text: "Sure, just got in the cab." },
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    const newLog = [...chatLog, { sender: "user" as const, text: msg }];
    setChatLog(newLog);
    setChatInput("");

    // Check if message matches any safe-word (ignoring punctuation/case)
    const matches = safeWords.some((word) => {
      const cleanWord = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
      const cleanMsg = msg.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
      return cleanMsg.includes(cleanWord);
    });

    if (matches) {
      setTimeout(() => {
        setChatLog((prev) => [...prev, { sender: "other" as const, text: "System Alert: Silent SOS Initiated." }]);
        onTriggerSilentSos();
      }, 800);
    }
  };

  // Active journey timeline steps
  const journeySteps = [
    { label: "Journey Started", location: "Connaught Place", time: "04:38 AM", done: true },
    { label: "Checkpoint 1 Reached", location: "Minto Road Crossing", time: "04:40 AM", done: true },
    { label: "Active Tracking", location: "Dynamic Safety En Route", time: "Live", done: !isEmergency, active: !isEmergency },
    { label: "Destination Arrival", location: "Siri Fort Auditorium", time: "ETA 05:00 AM", done: false },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Active Trip Tracker */}
      <div className="space-y-2">
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1.5">
          <MapPin size={10} className="text-emerald-400" /> Active Journey Tracker
        </h3>
        
        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl relative">
          <div className="absolute left-[26px] top-6 bottom-6 w-0.5 bg-white/5" />
          
          <div className="space-y-4">
            {journeySteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-4 pl-3 relative">
                {step.active ? (
                  <motion.div
                    className="absolute left-1 w-3 h-3 rounded-full bg-cyan-400 z-10"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                ) : (
                  <div className={`absolute left-1 w-3 h-3 rounded-full z-10 border ${
                    step.done
                      ? isEmergency
                        ? "bg-red-500 border-red-500"
                        : "bg-emerald-500 border-emerald-500"
                      : "bg-[#07070a] border-white/10"
                  }`} />
                )}
                
                <div className="flex-1 flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-semibold text-white/80">{step.label}</h4>
                    <p className="text-[9px] text-white/30">{step.location}</p>
                  </div>
                  <span className="text-[8px] font-mono text-white/40">{step.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invisible SOS safe-words configuration */}
      <div className="space-y-2">
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1.5">
          <Lock size={10} className="text-emerald-400" /> Stealth Safe-Words Engine
        </h3>

        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
          <p className="text-[8px] text-white/40 leading-relaxed">
            Configure words that trigger a **Silent SOS** when typed into a standard chat dialog:
          </p>

          <div className="flex flex-wrap gap-1.5">
            {safeWords.map((word) => (
              <span key={word} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-white/60">
                &quot;{word}&quot;
              </span>
            ))}
          </div>

          {/* Simulated chat preview */}
          <div className="border border-white/5 rounded-xl bg-black/40 overflow-hidden">
            <div className="bg-white/[0.02] border-b border-white/5 px-2 py-1.5 flex items-center justify-between text-[8px] text-white/30 font-mono">
              <span>SIMULATED CHAT INTERFACE</span>
              <span className="text-emerald-400">● SECURE</span>
            </div>
            
            <div className="p-2 space-y-1.5 max-h-24 overflow-y-auto">
              {chatLog.map((log, i) => (
                <div key={i} className={`flex ${log.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`px-2 py-1 rounded-lg text-[9px] max-w-[80%] ${
                    log.sender === "user" ? "bg-cyan-500/20 text-cyan-200" : "bg-white/5 text-white/60"
                  }`}>
                    {log.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 p-1 flex gap-1 bg-black/20">
              <input
                type="text"
                placeholder="Type 'Aunt Mary called.' to test..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="bg-transparent text-[9px] text-white outline-none w-full px-1.5"
              />
              <button
                onClick={handleSendMessage}
                className="bg-cyan-500/20 border border-cyan-400/20 text-cyan-400 text-[8px] px-2 py-0.5 rounded font-semibold"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shadow Witness Ledger */}
      <div className="space-y-2">
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1.5">
          <ShieldAlert size={10} className="text-emerald-400" /> Evidence Vault Ledger
        </h3>

        <div className="space-y-2">
          {evidence.map((chunk) => (
            <div
              key={chunk.id}
              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {chunk.type === "video" ? (
                  <Video size={12} className="text-cyan-400" />
                ) : (
                  <Mic size={12} className="text-purple-400" />
                )}
                <div>
                  <h4 className="text-[10px] font-mono font-bold text-white/70">{chunk.hash}</h4>
                  <p className="text-[8px] text-white/30">Size: {chunk.size} · {chunk.timestamp}</p>
                </div>
              </div>
              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] text-emerald-400 font-semibold font-mono">
                <ShieldCheck size={8} /> LOCKED
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
