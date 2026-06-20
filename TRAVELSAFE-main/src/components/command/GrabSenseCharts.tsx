"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface GrabSenseChartsProps {
  waveformData: { i: number; v: number }[];
  accelData: { i: number; v: number }[];
  isEmergency: boolean;
  inferenceLatency: number;
}

export default function GrabSenseCharts({
  waveformData,
  accelData,
  isEmergency,
  inferenceLatency,
}: GrabSenseChartsProps) {
  return (
    <div className="space-y-3">
      {/* Waveform */}
      <div className="rounded-lg bg-black/30 p-2 border border-white/5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] text-white/40 uppercase tracking-wider">
            Kinematic Waveform
          </span>
          <span className="text-[9px] font-mono text-cyan-400">{inferenceLatency}ms</span>
        </div>
        <div className="h-[60px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={waveformData}>
              <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isEmergency ? "#dc2626" : "#06b6d4"} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={isEmergency ? "#dc2626" : "#06b6d4"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={isEmergency ? "#dc2626" : "#06b6d4"}
                strokeWidth={1.5}
                fill="url(#waveGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Acceleration */}
      <div className="rounded-lg bg-black/30 p-2 border border-white/5">
        <span className="text-[9px] text-white/40 uppercase tracking-wider">Acceleration Vector</span>
        <div className="h-[40px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={accelData}>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#8b5cf6"
                strokeWidth={1}
                fill="rgba(139, 92, 246, 0.1)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
