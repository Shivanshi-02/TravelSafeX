"use client";

import { motion } from "framer-motion";
import { Shield, Home, Map, Users, Compass, User, Signal, Wifi, Battery } from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";

interface MobileDeviceFrameProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSosClick: () => void;
}

export function MobileDeviceFrame({ children, activeTab, setActiveTab, onSosClick }: MobileDeviceFrameProps) {
  const systemMode = useTravelSafeStore((s) => s.systemMode);
  const isEmergency = systemMode !== "SAFE";

  const tabs = [
    { id: "home", label: "Home", icon: <Home size={18} /> },
    { id: "map", label: "Map", icon: <Map size={18} /> },
    { id: "community", label: "Community", icon: <Users size={18} /> },
    { id: "journey", label: "Journey", icon: <Compass size={18} /> },
    { id: "profile", label: "Profile", icon: <User size={18} /> },
  ];

  return (
    <div className="relative flex justify-center items-center py-6 min-h-[85vh]">
      {/* Phone Silhouette Container */}
      <div className="relative w-[390px] h-[800px] rounded-[55px] bg-[#020205] border-[10px] border-[#1f2029] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Screen Bezel Reflection */}
        <div className="absolute inset-0 pointer-events-none border-[3px] border-[#0c0d12] rounded-[45px] z-50" />

        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-between px-3.5 pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111]" />
          {isEmergency && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-1"
            >
              <Shield size={10} className="text-red-500 fill-red-500" />
              <span className="text-[8px] font-bold text-red-500 font-mono">SOS</span>
            </motion.div>
          )}
          <div className="w-1.5 h-1.5 rounded-full bg-[#111]" />
        </div>

        {/* Status Bar */}
        <div className="h-12 pt-4 px-7 flex items-center justify-between text-white select-none z-40 bg-black/40 backdrop-blur-md">
          <span className="text-xs font-semibold font-mono">04:41</span>
          <div className="flex items-center gap-1.5 text-white/80">
            <Signal size={12} />
            <Wifi size={12} />
            <Battery size={14} className="text-white" />
          </div>
        </div>

        {/* Dynamic Screen Content Wrapper */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#07070a] relative pb-20">
          {children}
        </div>

        {/* Floating SOS Button */}
        <div className="absolute bottom-[75px] left-1/2 -translate-x-1/2 z-40">
          <motion.button
            onClick={onSosClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] border ${
              isEmergency
                ? "bg-gradient-to-br from-red-600 to-red-700 border-red-500/50 shadow-red-500/30"
                : "bg-gradient-to-br from-red-500 to-orange-600 border-orange-500/30 shadow-red-500/20"
            }`}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={isEmergency ? { scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] } : { scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ border: "2px solid #ef4444" }}
            />
            <Shield size={24} className="text-white fill-white/10" />
          </motion.button>
        </div>

        {/* Bottom Tab Bar */}
        <div className="h-20 bg-[#0a0a0f]/90 border-t border-white/5 backdrop-blur-xl flex items-center justify-around px-2 z-40 select-none pb-4">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1.5 px-3 py-1 relative ${
                  isSelected ? (isEmergency ? "text-red-400" : "text-emerald-400") : "text-white/40 hover:text-white/60"
                }`}
              >
                {tab.icon}
                <span className="text-[9px] font-medium tracking-wide">{tab.label}</span>
                {isSelected && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className={`absolute bottom-[-14px] w-6 h-[3px] rounded-full ${
                      isEmergency ? "bg-red-400" : "bg-emerald-400"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[120px] h-[4px] rounded-full bg-white/30 z-50 pointer-events-none" />
      </div>
    </div>
  );
}
