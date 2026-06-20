"use client";

import { useEffect } from "react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";
import { generateEmergencyPacket, generateWaveform, generateAcceleration } from "@/lib/utils";

export function useMockStreams() {
  const isSimulating = useTravelSafeStore((s) => s.isSimulating);
  const tickSosCounter = useTravelSafeStore((s) => s.tickSosCounter);
  const addEmergencyPacket = useTravelSafeStore((s) => s.addEmergencyPacket);
  const updateGrabSense = useTravelSafeStore((s) => s.updateGrabSense);
  const updateMetrics = useTravelSafeStore((s) => s.updateMetrics);

  useEffect(() => {
    const interval = setInterval(() => {
      updateGrabSense({
        waveform: generateWaveform(),
        acceleration: generateAcceleration(),
        inferenceLatency: 18 + Math.floor(Math.random() * 25),
        orientation: {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: 0.95 + Math.random() * 0.05,
        },
      });

      if (!isSimulating) {
        updateMetrics({
          luminaScore: 88 + Math.floor(Math.random() * 8),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, updateGrabSense, updateMetrics]);

  useEffect(() => {
    if (!isSimulating) return;

    const sosInterval = setInterval(tickSosCounter, 1000);
    const packetInterval = setInterval(() => {
      addEmergencyPacket(generateEmergencyPacket());
    }, 800);

    return () => {
      clearInterval(sosInterval);
      clearInterval(packetInterval);
    };
  }, [isSimulating, tickSosCounter, addEmergencyPacket]);
}
