"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send } from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const chatMessages = useTravelSafeStore((s) => s.chatMessages);
  const sendChatMessage = useTravelSafeStore((s) => s.sendChatMessage);
  const userPersona = useTravelSafeStore((s) => s.userPersona);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const sender = userPersona ? `${userPersona} Client` : "Operator";
    sendChatMessage(inputText.trim(), sender);
    setInputText("");
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-full bg-cyan-600 border border-cyan-500/30 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25"
        >
          <MessageSquare size={20} />
        </motion.button>
      </div>

      {/* Slide-out Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -380, opacity: 0 }}
            className="fixed bottom-20 left-6 z-40 w-80 h-96 rounded-2xl border border-white/10 bg-[#0c0c12]/95 backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-cyan-400" size={16} />
                <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                  Global Chat Sync
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white"
              >
                <X size={12} />
              </button>
            </div>

            {/* Chat list */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-72">
              {chatMessages.map((msg, idx) => {
                const isSystem = msg.sender === "System Control";
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      isSystem ? "items-center" : "items-start"
                    }`}
                  >
                    {isSystem ? (
                      <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-[8px] font-mono text-red-400 uppercase tracking-wider my-1 text-center">
                        {msg.text}
                      </span>
                    ) : (
                      <div className="space-y-0.5 max-w-[85%]">
                        <span className="text-[8px] text-white/30 uppercase font-mono block">
                          {msg.sender} · {msg.time}
                        </span>
                        <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-[10px] text-white/80 leading-normal">
                          {msg.text}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Message input */}
            <form onSubmit={handleSend} className="border-t border-white/5 p-2 bg-black/40 flex gap-2">
              <input
                type="text"
                placeholder={userPersona ? `Reply as ${userPersona}...` : "Type message..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="bg-transparent text-[10px] text-white/90 outline-none w-full px-2"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-lg bg-cyan-600 border border-cyan-500/30 flex items-center justify-center text-white"
              >
                <Send size={12} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
