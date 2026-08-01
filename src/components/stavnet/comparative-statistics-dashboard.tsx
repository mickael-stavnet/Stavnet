"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { BarChart3, CalendarDays, ChevronLeft, ChevronRight, Languages, MapPinned, Network, UsersRound } from "lucide-react";
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
  selectionPath?: string;
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
    comparisonTitle?: string;
    volumeTitle?: string;
    activityTitle?: string;
    reachTitle?: string;
    languagesTitle?: string;
    countriesTitle?: string;
    rolesTitle?: string;
    selection?: string;
    noSelection?: string;
    selectRecords?: string;
  };
}

type DistributionKey = "primaryDistribution" | "secondaryDistribution" | "tertiaryDistribution";

interface DashboardSlide {
  id: string;
  title: string;
  icon: ReactNode;
  content: ReactNode;
}

const colors = ["#07384a", "#e23d3d", "#2f6fdb", "#9b4d96", "#17826d"];

function buildTimeline(items: ComparisonItem[]) {
  const values = new Map<string, Record<string, number>>();

  for (const item of items) {
    for (const point of item.statistics.timeline) {
      const entry = values.get(point.period) ?? { period: point.period };
      entry[item.id] = (entry[item.id] ?? 0) + point.primary + point.secondary;
      values.set(point.period, entry);
    }
  }

  const timeline = [...values.values()].sort((left, right) => String(left.period).localeCompare(String(right.period)));
  if (timeline.length <= 18) return timeline;

  const decades = new Map<string, Record<string, number>>();
  for (const point of timeline) {
    const period = Number(point.period);
    const decade = Number.isSafeInteger(period) ? `${Math.floor(period / 10) * 10}` : String(point.period);
    const entry = decades.get(decade) ?? { period: decade };
    for (const item of items) entry[item.id] = (entry[item.id] ?? 0) + (point[item.id] ?? 0);
    decades.set(decade, entry);
  }

  return [...decades.values()].sort((left, right) => String(left.period).localeCompare(String(right.period)));
}

function buildDistribution(items: ComparisonItem[], key: DistributionKey) {
  const totals = new Map<string, number>();
  for (const item of items) for (const entry of item.statistics[key]) totals.set(entry.label, (totals.get(entry.label) ?? 0) + entry.value);
  const labels = [...totals.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).slice(0, 8).map(([label]) => label);
  return labels.map((label) => Object.fromEntries([["label", label], ...items.map((item) => [item.id, item.statistics[key].find((entry) => entry.label === label)?.value ?? 0])]));
}

function CardHeader({ title, icon, coverage }: { title: string; icon: ReactNode; coverage?: string }) {
  return <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[#6295a9] bg-[#b5e0ee] px-4 py-3 sm:px-5"><h3 className="flex items-center gap-2 text-base font-bold text-[#07384a] sm:text-xl">{icon}{title}</h3>{coverage ? <p className="text-xs font-semibold text-[#315565] sm:text-sm">{coverage}</p> : null}</div>;
}

function EmptyState({ message }: { message: string }) {
  return <p className="flex min-h-[320px] items-center justify-center px-5 text-center text-base text-[#315565] sm:min-h-[390px]">{message}</p>;
}

function ComparisonChart({ data, items, config, horizontal = false, noData }: { data: Array<Record<string, string | number>>; items: ComparisonItem[]; config: ChartConfig; horizontal?: boolean; noData: string }) {
  if (data.length === 0) return <EmptyState message={noData} />;
  return <div className="p-3 sm:p-5"><ChartContainer config={config} className="h-[320px] w-full aspect-auto sm:h-[390px]"><BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={horizontal ? { left: 8, right: 34 } : { top: 16, left: 0, right: 12, bottom: 0 }} barCategoryGap="24%"><CartesianGrid vertical={horizontal} horizontal={!horizontal} /><XAxis dataKey={horizontal ? undefined : "period"} type={horizontal ? "number" : "category"} allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} /><YAxis dataKey={horizontal ? "label" : undefined} type={horizontal ? "category" : "number"} allowDecimals={false} width={horizontal ? 128 : 30} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent className="flex-wrap gap-x-3 gap-y-1 px-2 pt-3 text-xs" />} />{items.map((item, index) => <Bar key={item.id} dataKey={item.id} fill={colors[index] ?? colors[0]} radius={horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]} />)}</BarChart></ChartContainer></div>;
}

function VolumeSlide({ items, metricLabels, labels }: { items: ComparisonItem[]; metricLabels: { primary: string; secondary: string }; labels: ComparativeStatisticsDashboardProps["labels"] }) {
  const graphData = items.map((item) => ({ label: item.label, primary: item.primaryCount, secondary: item.secondaryCount }));
  const volumeConfig = { primary: { label: metricLabels.primary, color: "#e23d3d" }, secondary: { label: metricLabels.secondary, color: "#07384a" } } satisfies ChartConfig;
  return <div className="grid gap-4 p-3 sm:gap-5 sm:p-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]"><div className="min-w-0"><ChartContainer config={volumeConfig} className="h-[320px] w-full aspect-auto sm:h-[390px]"><BarChart data={graphData} layout="vertical" margin={{ left: 8, right: 28 }}><CartesianGrid horizontal={false} /><XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} /><YAxis dataKey="label" type="category" width={132} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent className="flex-wrap gap-3 px-2 pt-3 text-xs" />} /><Bar dataKey="primary" fill="var(--color-primary)" radius={[0, 3, 3, 0]}><LabelList dataKey="primary" position="right" fill="#07384a" fontSize={11} /></Bar><Bar dataKey="secondary" fill="var(--color-secondary)" radius={[0, 3, 3, 0]}><LabelList dataKey="secondary" position="right" fill="#07384a" fontSize={11} /></Bar></BarChart></ChartContainer></div><section className="flex min-w-0 flex-col overflow-hidden border border-[#6295a9] bg-[#eaf6fa]"><div className="grid grid-cols-[minmax(0,1fr)_82px_92px] border-b border-[#6295a9] bg-[#fffbd1] px-3 py-2 text-xs font-bold text-[#07384a] sm:grid-cols-[minmax(0,1fr)_96px_108px] sm:text-sm"><span>{labels.table}</span><span className="text-right">{metricLabels.primary}</span><span className="text-right">{metricLabels.secondary}</span></div><div className="min-h-0 flex-1">{items.map((item, index) => <div key={item.id} className="grid min-h-12 grid-cols-[minmax(0,1fr)_82px_92px] items-center border-b border-[#b4d4df] px-3 py-2 text-sm text-[#07384a] sm:grid-cols-[minmax(0,1fr)_96px_108px] sm:text-[15px]"><span className="flex min-w-0 items-center gap-2"><span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: colors[index] }} /><span className="truncate font-semibold" title={item.label}>{item.label}</span></span><span className="text-right font-bold tabular-nums">{item.primaryCount}</span><span className="text-right font-bold tabular-nums">{item.secondaryCount}</span></div>)}</div></section></div>;
}

export function ComparativeStatisticsDashboard({ items, coverage, compact = false, metricLabels, focus, selectionPath, labels }: ComparativeStatisticsDashboardProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const effectiveMetricLabels = metricLabels ?? { primary: labels.primary, secondary: labels.secondary };
  const config = useMemo(() => Object.fromEntries(items.map((item, index) => [item.id, { label: item.label, color: colors[index] ?? "#07384a" }])) satisfies ChartConfig, [items]);
  const timeline = useMemo(() => buildTimeline(items), [items]);
  const languages = useMemo(() => buildDistribution(items, "primaryDistribution"), [items]);
  const countries = useMemo(() => buildDistribution(items, "secondaryDistribution"), [items]);
  const roles = useMemo(() => buildDistribution(items, "tertiaryDistribution"), [items]);
  const reach = useMemo(() => [{ label: labels.languages, ...Object.fromEntries(items.map((item) => [item.id, item.statistics.primaryDistribution.length])) }, { label: labels.countries, ...Object.fromEntries(items.map((item) => [item.id, item.statistics.secondaryDistribution.length])) }, { label: labels.roles, ...Object.fromEntries(items.map((item) => [item.id, item.statistics.tertiaryDistribution.length])) }], [items, labels.countries, labels.languages, labels.roles]);

  if (items.length === 0) {
    return <section className="w-full max-w-[1480px] border border-[#6295a9] bg-[#eaf6fa] p-5 text-center sm:p-8"><BarChart3 className="mx-auto size-7 text-[#002b9e]" /><h1 className="mt-3 text-xl font-bold text-[#002b9e]">{labels.comparisonTitle ?? labels.dashboard}</h1><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#315565]">{labels.noSelection ?? labels.noData}</p>{selectionPath ? <a href={selectionPath} className="mt-5 inline-flex min-h-11 items-center border border-[#8f7610] bg-[#ffdf32] px-5 text-sm font-bold text-[#002b9e] hover:bg-[#ffe767]">{labels.selectRecords ?? labels.table}</a> : null}</section>;
  }

  const slides: DashboardSlide[] = [
    { id: "volume", title: labels.volumeTitle ?? labels.table, icon: <BarChart3 className="size-5 shrink-0" />, content: <VolumeSlide items={items} metricLabels={effectiveMetricLabels} labels={labels} /> },
    { id: "timeline", title: labels.activityTitle ?? labels.timeline, icon: <CalendarDays className="size-5 shrink-0" />, content: <ComparisonChart data={timeline} items={items} config={config} noData={labels.noData} /> },
    { id: "reach", title: labels.reachTitle ?? labels.coverage, icon: <UsersRound className="size-5 shrink-0" />, content: <ComparisonChart data={reach} items={items} config={config} horizontal noData={labels.noData} /> },
    { id: "languages", title: labels.languagesTitle ?? labels.languages, icon: <Languages className="size-5 shrink-0" />, content: <ComparisonChart data={languages} items={items} config={config} horizontal noData={labels.noData} /> },
    { id: "countries", title: labels.countriesTitle ?? labels.countries, icon: <MapPinned className="size-5 shrink-0" />, content: <ComparisonChart data={countries} items={items} config={config} horizontal noData={labels.noData} /> },
    { id: "roles", title: labels.rolesTitle ?? labels.roles, icon: <Network className="size-5 shrink-0" />, content: <ComparisonChart data={roles} items={items} config={config} horizontal noData={labels.noData} /> },
    ...(focus ? [{ id: "focus", title: focus.title, icon: <BarChart3 className="size-5 shrink-0" />, content: <ComparisonChart data={focus.data.map((entry) => ({ label: entry.label, [items[0]?.id ?? "value"]: entry.value }))} items={items.slice(0, 1)} config={config} horizontal noData={labels.noData} /> }] : []),
  ];
  const currentSlide = slides[activeSlide] ?? slides[0];
  const coverageValue = currentSlide?.id === "timeline" ? coverage?.timeline : currentSlide?.id === "languages" ? coverage?.languages : currentSlide?.id === "countries" ? coverage?.countries : currentSlide?.id === "roles" ? coverage?.roles : undefined;
  const contentPadding = compact ? "py-3" : "py-4 sm:py-5";

  function previous() { setActiveSlide((current) => current === 0 ? slides.length - 1 : current - 1); }
  function next() { setActiveSlide((current) => current === slides.length - 1 ? 0 : current + 1); }

  return <section className={`w-full max-w-[1480px] ${contentPadding}`}><header className="border-b border-[#6295a9] pb-3 sm:flex sm:items-end sm:justify-between"><div><h1 className="text-xl font-bold text-[#002b9e] sm:text-[23px]">{labels.comparisonTitle ?? labels.dashboard}</h1><p className="mt-1 text-sm text-[#315565]">{labels.selection ?? labels.table} : <span className="font-semibold text-[#07384a]">{items.map((item) => item.label).join(" · ")}</span></p></div></header><section aria-label={labels.carousel} className="mt-3 overflow-hidden border border-[#6295a9] bg-[#eaf6fa] sm:mt-4"><CardHeader title={currentSlide.title} icon={currentSlide.icon} coverage={coverageValue !== undefined && coverage ? `${labels.coverage} : ${coverageValue} / ${coverage.total}` : undefined} /><div key={currentSlide.id} className="animate-in fade-in-0 duration-200 motion-reduce:animate-none">{currentSlide.content}</div></section><nav aria-label={labels.carousel} className="mt-3 flex items-center justify-center gap-4 sm:mt-4 sm:gap-5"><Button type="button" variant="outline" size="icon-lg" aria-label={labels.previous} onClick={previous} className="h-11 w-11 border-[#456f87] bg-[#fffbd1] text-[#07384a] hover:bg-[#dceff5] hover:text-[#002b9e] sm:h-12 sm:w-12"><ChevronLeft /></Button><span className="min-w-14 text-center text-sm font-bold tabular-nums text-[#07384a] sm:min-w-16 sm:text-base">{activeSlide + 1} / {slides.length}</span><Button type="button" variant="outline" size="icon-lg" aria-label={labels.next} onClick={next} className="h-11 w-11 border-[#456f87] bg-[#fffbd1] text-[#07384a] hover:bg-[#dceff5] hover:text-[#002b9e] sm:h-12 sm:w-12"><ChevronRight /></Button></nav></section>;
}
