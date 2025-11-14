"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

type RadarSpiderChartProps = {
  data: Array<{ domain: string; score: number }>;
};

export function RadarSpiderChart({ data }: RadarSpiderChartProps) {
  if (!data.length) {
    return <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No rubric data to display.</div>;
  }

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#cbd5f5" />
          <PolarAngleAxis dataKey="domain" tick={{ fill: "#475569", fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 4]} tickCount={5} tick={{ fill: "#94a3b8", fontSize: 11 }} stroke="#e2e8f0" />
          <Radar dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.25} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
