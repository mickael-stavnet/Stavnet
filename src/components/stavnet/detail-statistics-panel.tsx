"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { BarChart3, CalendarDays, CircleAlert, Languages, MapPinned, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { DetailStatistics, StatisticsDistributionItem, StatisticsGranularity, StatisticsSeriesPoint } from "@/lib/detail-statistics";

interface StatisticsLabels {
  title: string;
  year: string;
  decade: string;
  month: string;
  monthlyUnavailable: string;
  noData: string;
  timeline: string;
  primary: string;
  secondary: string;
  languages: string;
  countries: string;
  roles: string;
}

interface DetailStatisticsPanelProps {
  statistics: DetailStatistics;
  labels: StatisticsLabels;
}

const timelineConfig = {
  primary: { label: "primary", color: "#ff1d1d" },
  secondary: { label: "secondary", color: "#07384a" },
} satisfies ChartConfig;

const distributionConfig = {
  value: { label: "value", color: "#0f6b86" },
} satisfies ChartConfig;

function groupTimeline(points: StatisticsSeriesPoint[], granularity: StatisticsGranularity): StatisticsSeriesPoint[] {
  if (granularity === "year" || granularity === "month") return points;
  const groups = new Map<string, { primary: number; secondary: number }>();
  for (const point of points) {
    const decade = `${Math.floor(Number(point.period) / 10) * 10}`;
    const current = groups.get(decade) ?? { primary: 0, secondary: 0 };
    current.primary += point.primary;
    current.secondary += point.secondary;
    groups.set(decade, current);
  }
  return [...groups.entries()].map(([period, value]) => ({ period, ...value }));
}

function ChartCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="min-w-0 border border-[#7aa8b7] bg-[#b2e0ef] shadow-[2px_2px_5px_rgba(0,0,0,0.13)]"><div className="flex min-h-10 items-center gap-2 border-b border-[#7aa8b7] bg-[#fff8c8] px-3 text-[12px] font-semibold uppercase leading-tight text-[#07384a]">{icon}{title}</div>{children}</section>;
}

function EmptyChart({ message }: { message: string }) {
  return <div className="flex min-h-[220px] items-center justify-center px-6 text-center text-sm leading-5 text-[#07384a]"><CircleAlert className="mr-2 size-4 shrink-0" />{message}</div>;
}

function DistributionChart({ title, icon, data, emptyLabel }: { title: string; icon: ReactNode; data: StatisticsDistributionItem[]; emptyLabel: string }) {
  return <ChartCard title={title} icon={icon}>{data.length === 0 ? <EmptyChart message={emptyLabel} /> : <div className="p-3"><ChartContainer config={distributionConfig} className="h-[220px] w-full aspect-auto"><BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 0, right: 10 }}><CartesianGrid horizontal={false} /><YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={82} tick={{ fontSize: 11 }} /><XAxis type="number" hide /><ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} /><Bar dataKey="value" fill="var(--color-value)" radius={3} /></BarChart></ChartContainer></div>}</ChartCard>;
}

export function DetailStatisticsPanel({ statistics, labels }: DetailStatisticsPanelProps) {
  const [granularity, setGranularity] = useState<StatisticsGranularity>(statistics.timeline.length > 12 ? "decade" : "year");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visibleSeries, setVisibleSeries] = useState({ primary: true, secondary: true });
  const chartData = useMemo(() => groupTimeline(statistics.timeline, granularity), [granularity, statistics.timeline]);
  const animationDuration = reducedMotion ? 0 : 220;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return <div className="space-y-3" aria-label={labels.title}>
    <div className="flex flex-wrap items-center justify-between gap-2 border border-[#7aa8b7] bg-[#a7dcee] px-3 py-2">
      <div className="flex items-center gap-2 text-[13px] font-bold text-[#07384a]"><BarChart3 className="size-4" />{labels.title}</div>
      <div className="flex rounded-md border border-[#7aa8b7] bg-[#eaf5f8] p-0.5" role="group" aria-label={labels.timeline}>
        {(["year", "decade", "month"] as const).map((option) => <Button key={option} size="xs" variant={granularity === option ? "default" : "ghost"} className={granularity === option ? "bg-[#07384a] text-white hover:bg-[#07384a]/90" : "text-[#07384a]"} onClick={() => setGranularity(option)}>{labels[option]}</Button>)}
      </div>
    </div>
    <div className="grid gap-3 xl:grid-cols-2">
      <ChartCard title={labels.timeline} icon={<CalendarDays className="size-4" />}>
        {granularity === "month" ? <EmptyChart message={labels.monthlyUnavailable} /> : chartData.length === 0 ? <EmptyChart message={labels.noData} /> : <div className="p-3"><ChartContainer config={{ ...timelineConfig, primary: { ...timelineConfig.primary, label: labels.primary }, secondary: { ...timelineConfig.secondary, label: labels.secondary } }} className="h-[220px] w-full aspect-auto"><AreaChart accessibilityLayer data={chartData} margin={{ left: -14, right: 8 }}><defs><linearGradient id="statistics-primary" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.42} /><stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.04} /></linearGradient></defs><CartesianGrid vertical={false} /><XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} />{visibleSeries.secondary ? <Area dataKey="secondary" type="monotone" stroke="var(--color-secondary)" fill="transparent" strokeWidth={2} animationDuration={animationDuration} /> : null}{visibleSeries.primary ? <Area dataKey="primary" type="monotone" stroke="var(--color-primary)" fill="url(#statistics-primary)" strokeWidth={2} animationDuration={animationDuration} /> : null}</AreaChart></ChartContainer><div className="mt-2 flex flex-wrap gap-2" aria-label={labels.timeline}>{(["primary", "secondary"] as const).map((key) => <button key={key} type="button" className={`inline-flex items-center gap-1.5 text-xs ${visibleSeries[key] ? "text-[#07384a]" : "text-[#5d7f8a] line-through"}`} onClick={() => setVisibleSeries((current) => ({ ...current, [key]: !current[key] }))}><span className="size-2 rounded-full" style={{ backgroundColor: key === "primary" ? "#ff1d1d" : "#07384a" }} />{labels[key]}</button>)}</div></div>}
      </ChartCard>
      <DistributionChart title={labels.languages} icon={<Languages className="size-4" />} data={statistics.primaryDistribution} emptyLabel={labels.noData} />
      <DistributionChart title={labels.countries} icon={<MapPinned className="size-4" />} data={statistics.secondaryDistribution} emptyLabel={labels.noData} />
      <DistributionChart title={labels.roles} icon={<UsersRound className="size-4" />} data={statistics.tertiaryDistribution} emptyLabel={labels.noData} />
    </div>
  </div>;
}
