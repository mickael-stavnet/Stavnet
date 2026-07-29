"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
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
  coverage?: { timeline: number; languages: number; countries: number; roles: number; total: number };
  compact?: boolean;
  metricLabels?: { primary: string; secondary: string };
  focus?: { title: string; data: Array<{ label: string; value: number }>; coverage: number };
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
    previous: string;
    next: string;
    carousel: string;
    coverage: string;
  };
}

type DistributionKey = "primaryDistribution" | "secondaryDistribution" | "tertiaryDistribution";

interface DashboardSlide {
  id: string;
  title: string;
  content: ReactNode;
}

const colors = ["#ff1d1d", "#07384a", "#d59400", "#6d3b9e", "#0f6b86"];

function aggregateDistribution(items: ComparisonItem[], key: DistributionKey) {
  const counts = new Map<string, number>();

  for (const item of items) {
    for (const entry of item.statistics[key]) {
      counts.set(entry.label, (counts.get(entry.label) ?? 0) + entry.value);
    }
  }

  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
    .slice(0, 10);
}

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

function DistributionChart({ title, data, color, noData, compact }: { title: string; data: Array<{ label: string; value: number }>; color: string; noData: string; compact: boolean }) {
  const chartHeight = compact ? "h-[250px] md:h-[282px]" : "h-[390px] md:h-[440px]";

  if (data.length === 0) {
    return <p className={`flex ${chartHeight} items-center justify-center px-5 text-center text-[#315565]`}>{noData}</p>;
  }

  return <ChartContainer config={{ value: { label: title, color } }} className={`${chartHeight} w-full aspect-auto px-3 pb-3 pt-4 md:px-8`}><BarChart data={data} layout="vertical" margin={{ left: 18, right: 42 }}><CartesianGrid horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis dataKey="label" type="category" width={126} tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="value" fill={color} radius={[0, 3, 3, 0]}><LabelList dataKey="value" position="right" fill="#07384a" fontSize={12} /></Bar></BarChart></ChartContainer>;
}

export function ComparativeStatisticsDashboard({ items, coverage, compact = false, metricLabels, focus, labels }: ComparativeStatisticsDashboardProps) {
  const [mode, setMode] = useState<"absolute" | "percent" | "index">("absolute");
  const [activeSlide, setActiveSlide] = useState(0);
  const timeline = useMemo(() => buildTimeline(items), [items]);
  const maximum = Math.max(1, ...items.map((item) => item.primaryCount));
  const total = Math.max(1, items.reduce((sum, item) => sum + item.primaryCount, 0));
  const config = useMemo(() => Object.fromEntries(items.map((item, index) => [item.id, { label: item.label, color: colors[index] ?? "#07384a" }])) satisfies ChartConfig, [items]);
  const languages = useMemo(() => aggregateDistribution(items, "primaryDistribution"), [items]);
  const countries = useMemo(() => aggregateDistribution(items, "secondaryDistribution"), [items]);
  const roles = useMemo(() => aggregateDistribution(items, "tertiaryDistribution"), [items]);
  const chartHeight = compact ? "h-[220px] md:h-[250px]" : "h-[390px] md:h-[440px]";
  const tableHeight = compact ? "min-h-[220px] md:min-h-[250px]" : "min-h-[390px] md:min-h-[440px]";

  const slides: DashboardSlide[] = [
    {
      id: "timeline",
      title: labels.timeline,
      content: timeline.length === 0
        ? <p className={`flex ${chartHeight} items-center justify-center px-5 text-center text-[#315565]`}>{labels.noData}</p>
        : <ChartContainer config={config} className={`${chartHeight} w-full aspect-auto px-3 pb-3 pt-4 md:px-8`}><AreaChart data={timeline}><CartesianGrid vertical={false} /><XAxis dataKey="period" /><YAxis allowDecimals={false} /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent />} />{items.map((item, index) => <Area key={item.id} type="monotone" dataKey={item.id} stroke={colors[index]} fill="transparent" strokeWidth={2} />)}</AreaChart></ChartContainer>,
    },
    {
      id: "table",
      title: labels.table,
      content: <div className={`flex ${tableHeight} flex-col px-3 pb-3 pt-4 md:px-8`}><div className="mb-4 flex justify-end"><div className="flex border border-[#456f87] bg-[#fffbd1] p-0.5">{(["absolute", "percent", "index"] as const).map((value) => <Button key={value} type="button" size="sm" variant="ghost" onClick={() => setMode(value)} className={`rounded-none px-3 text-[13px] font-bold ${mode === value ? "bg-[#002b9e] text-white hover:bg-[#002b9e] hover:text-white" : "text-[#07384a] hover:bg-[#dceff5] hover:text-[#07384a]"}`}>{value === "absolute" ? "#" : value === "percent" ? "%" : "100"}</Button>)}</div></div><div className="overflow-x-auto"><table className="w-full min-w-[560px] border-collapse text-left text-[14px]"><thead className="bg-[#fffbd1]"><tr><th className="border border-[#6295a9] px-3 py-2">{labels.dashboard}</th><th className="border border-[#6295a9] px-3 py-2">{metricLabels?.primary ?? labels.primary}</th><th className="border border-[#6295a9] px-3 py-2">{metricLabels?.secondary ?? labels.secondary}</th><th className="border border-[#6295a9] px-3 py-2">{labels.index}</th></tr></thead><tbody>{items.map((item) => { const value = mode === "absolute" ? item.primaryCount : mode === "percent" ? Math.round((item.primaryCount / total) * 100) : Math.round((item.primaryCount / maximum) * 100); return <tr key={item.id}><td className="border border-[#6295a9] px-3 py-3 font-bold">{item.label}</td><td className="border border-[#6295a9] px-3 py-3">{mode === "absolute" ? item.primaryCount : `${value}${mode === "percent" ? "%" : ""}`}</td><td className="border border-[#6295a9] px-3 py-3">{item.secondaryCount}</td><td className="border border-[#6295a9] px-3 py-3">{Math.round((item.primaryCount / maximum) * 100)}</td></tr>; })}</tbody></table></div></div>,
    },
    { id: "distribution", title: metricLabels ? labels.primary : labels.table, content: <DistributionChart title={metricLabels ? `${metricLabels.primary} / ${metricLabels.secondary}` : labels.table} data={[{ label: metricLabels?.primary ?? labels.primary, value: items.reduce((sum, item) => sum + item.primaryCount, 0) }, { label: metricLabels?.secondary ?? labels.secondary, value: items.reduce((sum, item) => sum + item.secondaryCount, 0) }]} color={colors[0]} noData={labels.noData} compact={compact} /> },
    { id: "languages", title: labels.languages, content: <DistributionChart title={labels.languages} data={languages} color={colors[1]} noData={labels.noData} compact={compact} /> },
    { id: "countries", title: labels.countries, content: <DistributionChart title={labels.countries} data={countries} color={colors[2]} noData={labels.noData} compact={compact} /> },
    { id: "roles", title: labels.roles, content: <DistributionChart title={labels.roles} data={roles} color={colors[3]} noData={labels.noData} compact={compact} /> },
    ...(focus ? [{ id: "focus", title: focus.title, content: <DistributionChart title={focus.title} data={focus.data} color={colors[4]} noData={labels.noData} compact={compact} /> }] : []),
  ];

  const currentSlide = slides[activeSlide] ?? slides[0];
  const knownCoverage = currentSlide?.id === "timeline" ? coverage?.timeline : currentSlide?.id === "languages" ? coverage?.languages : currentSlide?.id === "countries" ? coverage?.countries : currentSlide?.id === "roles" ? coverage?.roles : currentSlide?.id === "focus" ? focus?.coverage : undefined;

  if (!currentSlide || items.length === 0) {
    return null;
  }

  function showPreviousSlide() {
    setActiveSlide((current) => current === 0 ? slides.length - 1 : current - 1);
  }

  function showNextSlide() {
    setActiveSlide((current) => current === slides.length - 1 ? 0 : current + 1);
  }

  return <section className={`${compact ? "mt-4 px-3 pb-5 pt-3" : "mt-5 p-4"} border border-[#6295a9] bg-[#cce8f1]/90 shadow-[2px_2px_0_rgba(0,43,112,0.2)]`}>
    <h2 className="border-b border-[#6295a9] pb-2 text-[18px] font-bold text-[#002b9e]">{labels.dashboard}</h2>
    <section aria-label={labels.carousel} className="mt-3 overflow-hidden border border-[#6295a9] bg-[#eaf6fa]">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[#6295a9] bg-[#b5e0ee] px-4 py-2.5"><h3 className="text-[16px] font-bold text-[#07384a]">{currentSlide.title}</h3>{knownCoverage !== undefined && coverage ? <p className="text-[13px] font-semibold text-[#315565]">{labels.coverage}: {knownCoverage} / {coverage.total}</p> : null}</div>
      <div key={currentSlide.id} className="animate-in fade-in-0 duration-200 motion-reduce:animate-none">
        {currentSlide.content}
      </div>
    </section>
    <nav aria-label={labels.carousel} className="mt-3 flex items-center justify-center gap-4">
      <Button type="button" variant="outline" size="icon-lg" aria-label={labels.previous} onClick={showPreviousSlide} className="border-[#456f87] bg-[#fffbd1] text-[#07384a] hover:bg-[#dceff5] hover:text-[#002b9e]"><ChevronLeft /></Button>
      <span className="min-w-14 text-center text-[14px] font-bold tabular-nums text-[#07384a]">{activeSlide + 1} / {slides.length}</span>
      <Button type="button" variant="outline" size="icon-lg" aria-label={labels.next} onClick={showNextSlide} className="border-[#456f87] bg-[#fffbd1] text-[#07384a] hover:bg-[#dceff5] hover:text-[#002b9e]"><ChevronRight /></Button>
    </nav>
  </section>;
}
