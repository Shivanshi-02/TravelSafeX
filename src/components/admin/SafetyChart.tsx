"use client";

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface SafetyChartProps {
  data: { city: string; score: number; activeResponders: number }[];
}

export default function SafetyChart({ data }: SafetyChartProps) {
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="city" stroke="rgba(255,255,255,0.3)" fontSize={10} />
          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
          <Tooltip contentStyle={{ backgroundColor: "#0c0c12", borderColor: "rgba(255,255,255,0.1)", fontSize: 11 }} />
          <Bar dataKey="activeResponders" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
