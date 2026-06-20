"use client";

import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface CrimeChartProps {
  data: { hour: string; crimeIndex: number }[];
}

export default function CrimeChart({ data }: CrimeChartProps) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="crimeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={10} />
          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
          <Tooltip contentStyle={{ backgroundColor: "#0c0c12", borderColor: "rgba(255,255,255,0.1)", fontSize: 11 }} />
          <Area type="monotone" dataKey="crimeIndex" stroke="#8b5cf6" strokeWidth={2} fill="url(#crimeGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
