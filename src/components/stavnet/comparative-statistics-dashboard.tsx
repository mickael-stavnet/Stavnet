"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, Legend, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { DetailStatistics } from "@/lib/detail-statistics";

export type ComparisonType = "books" | "persons" | "organizations";

export interface ComparisonCandidate {
  id: string;
  label: string;
}

export interface ComparisonItem extends ComparisonCandidate {
  statistics: DetailStatistics;
  primaryCount: number;
  secondaryCount: number;
}

interface ComparativeStatisticsDashboardProps {
  items: ComparisonItem[];
  labels: {
    dashboard: string;
    timeline: string;
    table: string;
    primary: string;
    secondary: string;
    index: string;
    noData: string;
    languages: string;
    countries: string;
    roles: string;
  };
}

function aggregateDistribution(items: ComparisonItem[], key: "primaryDistribution" | "secondaryDistribution" | "tertiaryDistribution") {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const entry of item.statistics[key]) counts.set(entry.label, (counts.get(entry.label) ?? 0) + entry.value);
  }
  return [...counts.entries()].map(([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value || left.label.localeCompare(right.label)).slice(0, 7);
}

const colors = ["#ff1d1d", "#07384a", "#d59400", "#6d3b9e", "#0f6b86"];

function buildTimeline(items: ComparisonItem[]) {
  const periods = [...new Set(items.flatMap((item) => item.statistics.timeline.map((point) => point.period)))].sort();
  return periods.map((period) => Object.fromEntries([
    ["period", period],
    ...items.map((item) => {
      const point = item.statistics.timeline.find((entry) => entry.period === period);
      return [item.id, (point?.primary ?? 0) + (point?.secondary ?? 0)];
    }),
  ]));
}

export function ComparativeStatisticsDashboard({ items, labels }: ComparativeStatisticsDashboardProps) {
  const [mode, setMode] = useState<"absolute" | "percent" | "index">("absolute");
  const timeline = useMemo(() => buildTimeline(items), [items]);
  const maximum = Math.max(1, ...items.map((item) => item.primaryCount));
  const total = Math.max(1, items.reduce((sum, item) => sum + item.primaryCount, 0));
  const config = useMemo(() => Object.fromEntries(items.map((item, index) => [item.id, { label: item.label, color: colors[index] ?? "#07384a" }])) satisfies ChartConfig, [items]);
  const languages = useMemo(() => aggregateDistribution(items, "primaryDistribution"), [items]);
  const countries = useMemo(() => aggregateDistribution(items, "secondaryDistribution"), [items]);
  const roles = useMemo(() => aggregateDistribution(items, "tertiaryDistribution"), [items]);
  const distributions: Array<{ title: string; data: Array<{ label: string; value: number }> }> = [
    { title: labels.languages, data: languages },
    { title: labels.countries, data: countries },
    { title: labels.roles, data: roles },
  ];

  if (items.length === 0) return null;

  return <section className="mt-5 space-y-4 border border-[#6295a9] bg-[#cce8f1]/90 p-4 shadow-[2px_2px_0_rgba(0,43,112,0.2)]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#6295a9] pb-3">
      <h2 className="text-[20px] font-bold text-[#002b9e]">{labels.dashboard}</h2>
      <div className="flex border border-[#456f87] bg-[#fffbd1] p-0.5">
        {(["absolute", "percent", "index"] as const).map((value) => <button key={value} type="button" onClick={() => setMode(value)} className={`px-3 py-1 text-[13px] font-bold ${mode === value ? "bg-[#002b9e] text-white" : "text-[#07384a]"}`}>{value === "absolute" ? "#" : value === "percent" ? "%" : "100"}</button>)}
      </div>
    </div>
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="border border-[#6295a9] bg-[#eaf6fa]">
        <h3 className="border-b border-[#6295a9] bg-[#b5e0ee] px-3 py-2 text-[14px] font-bold text-[#07384a]">{labels.timeline}</h3>
        {timeline.length === 0 ? <p className="flex h-[260px] items-center justify-center px-5 text-center text-[#315565]">{labels.noData}</p> : <ChartContainer config={config} className="h-[260px] w-full aspect-auto p-3"><AreaChart data={timeline}><CartesianGrid vertical={false} /><XAxis dataKey="period" /><YAxis allowDecimals={false} /><ChartTooltip content={<ChartTooltipContent />} /><Legend />{items.map((item, index) => <Area key={item.id} type="monotone" dataKey={item.id} stroke={colors[index]} fill="transparent" strokeWidth={2} />)}</AreaChart></ChartContainer>}
      </section>
      <section className="border border-[#6295a9] bg-[#eaf6fa]">
        <h3 className="border-b border-[#6295a9] bg-[#b5e0ee] px-3 py-2 text-[14px] font-bold text-[#07384a]">{labels.table}</h3>
        <div className="overflow-x-auto"><table className="w-full min-w-[420px] border-collapse text-left text-[14px]"><thead className="bg-[#fffbd1]"><tr><th className="border border-[#6295a9] px-2 py-1">{labels.dashboard}</th><th className="border border-[#6295a9] px-2 py-1">{labels.primary}</th><th className="border border-[#6295a9] px-2 py-1">{labels.secondary}</th><th className="border border-[#6295a9] px-2 py-1">{labels.index}</th></tr></thead><tbody>{items.map((item) => { const value = mode === "absolute" ? item.primaryCount : mode === "percent" ? Math.round((item.primaryCount / total) * 100) : Math.round((item.primaryCount / maximum) * 100); return <tr key={item.id}><td className="border border-[#6295a9] px-2 py-2 font-bold">{item.label}</td><td className="border border-[#6295a9] px-2 py-2">{mode === "absolute" ? item.primaryCount : `${value}${mode === "percent" ? "%" : ""}`}</td><td className="border border-[#6295a9] px-2 py-2">{item.secondaryCount}</td><td className="border border-[#6295a9] px-2 py-2">{Math.round((item.primaryCount / maximum) * 100)}</td></tr>; })}</tbody></table></div>
      </section>
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      {distributions.map(({ title, data }, index) => <section key={title} className="border border-[#6295a9] bg-[#eaf6fa]"><h3 className="border-b border-[#6295a9] bg-[#b5e0ee] px-3 py-2 text-[14px] font-bold text-[#07384a]">{title}</h3>{data.length === 0 ? <p className="flex h-[200px] items-center justify-center px-5 text-center text-[#315565]">{labels.noData}</p> : <ChartContainer config={{ value: { label: title, color: colors[index + 1] } }} className="h-[200px] w-full aspect-auto p-3"><BarChart data={data} layout="vertical" margin={{ left: 8, right: 28 }}><CartesianGrid horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis dataKey="label" type="category" width={86} tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="value" fill={colors[index + 1]} radius={[0, 3, 3, 0]}><LabelList dataKey="value" position="right" fill="#07384a" fontSize={12} /></Bar></BarChart></ChartContainer>}</section>)}
    </div>
  </section>;
}
