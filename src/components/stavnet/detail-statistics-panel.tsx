"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { BarChart3, BookOpen, CalendarDays, CircleAlert, Languages, MapPinned, Network, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { DetailStatistics, StatisticsDistributionItem, StatisticsGranularity, StatisticsSeriesPoint } from "@/lib/detail-statistics";

type DetailStatisticsKind = "book" | "person" | "organization";

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
  overview: string;
  period: string;
  records: string;
  languagesCount: string;
  countriesCount: string;
  rolesCount: string;
  reach: string;
  contributions: string;
  bookActivity: string;
  personActivity: string;
  organizationActivity: string;
}

interface DetailStatisticsPanelProps {
  statistics: DetailStatistics;
  kind: DetailStatisticsKind;
  labels: StatisticsLabels;
}

const rankingBarColors = ["#07384a", "#e23d3d", "#2f6fdb", "#9b4d96", "#17826d", "#e58b20", "#b43d6a", "#308c94"];

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

function AnalyticsCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="min-w-0 overflow-hidden border border-[#6295a9] bg-[#eaf6fa] shadow-[2px_2px_0_rgba(0,43,112,0.14)]"><div className="flex min-h-11 items-center gap-2 border-b border-[#6295a9] bg-[#b5e0ee] px-3 text-sm font-bold text-[#07384a]">{icon}<h3>{title}</h3></div>{children}</section>;
}

function EmptyChart({ message }: { message: string }) {
  return <p className="flex min-h-[238px] items-center justify-center px-6 text-center text-sm leading-5 text-[#315565]"><CircleAlert className="me-2 size-4 shrink-0" />{message}</p>;
}

function SummaryMetric({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return <div className="flex min-h-[70px] min-w-0 flex-col justify-center border-s border-[#6295a9] px-4 py-3 first:border-s-0 sm:px-5"><p className="text-xs font-bold leading-4 uppercase tracking-wide text-[#315565]">{label}</p><p className={`mt-1.5 break-words text-2xl font-bold leading-none tabular-nums ${accent ? "text-[#002b9e]" : "text-[#07384a]"}`}>{value}</p></div>;
}

function DistributionChart({ title, icon, data, emptyLabel }: { title: string; icon: ReactNode; data: StatisticsDistributionItem[]; emptyLabel: string }) {
  const chartData = data.slice(0, 8);
  const config = Object.fromEntries(chartData.map((item, index) => [item.label, { label: item.label, color: rankingBarColors[index % rankingBarColors.length] }])) satisfies ChartConfig;
  return <AnalyticsCard title={title} icon={icon}>{chartData.length === 0 ? <EmptyChart message={emptyLabel} /> : <div className="p-3"><ChartContainer config={config} className="h-[238px] w-full aspect-auto"><BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 0, right: 26 }}><CartesianGrid horizontal={false} /><XAxis type="number" allowDecimals={false} hide /><YAxis dataKey="label" type="category" width={92} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} /><Bar dataKey="value" radius={[0, 3, 3, 0]}>{chartData.map((item, index) => <Cell key={item.label} fill={rankingBarColors[index % rankingBarColors.length]} />)}<LabelList dataKey="value" position="right" fill="#07384a" fontSize={11} /></Bar></BarChart></ChartContainer></div>}</AnalyticsCard>;
}

export function DetailStatisticsPanel({ statistics, kind, labels }: DetailStatisticsPanelProps) {
  const [granularity, setGranularity] = useState<StatisticsGranularity>(statistics.timeline.length > 12 ? "decade" : "year");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visibleSeries, setVisibleSeries] = useState({ primary: true, secondary: true });
  const chartData = useMemo(() => groupTimeline(statistics.timeline, granularity), [granularity, statistics.timeline]);
  const timelineConfig = useMemo(() => ({ primary: { label: labels.primary, color: "#e23d3d" }, secondary: { label: labels.secondary, color: "#07384a" } }), [labels.primary, labels.secondary]);
  const totals = useMemo(() => statistics.timeline.reduce((current, point) => ({ primary: current.primary + point.primary, secondary: current.secondary + point.secondary }), { primary: 0, secondary: 0 }), [statistics.timeline]);
  const period = statistics.timeline.length > 0 ? `${statistics.timeline[0]?.period} - ${statistics.timeline[statistics.timeline.length - 1]?.period}` : "-";
  const activityTitle = kind === "book" ? labels.bookActivity : kind === "person" ? labels.personActivity : labels.organizationActivity;
  const animationDuration = reducedMotion ? 0 : 220;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return <section aria-label={labels.title} className="w-full space-y-3">
    <AnalyticsCard title={labels.overview} icon={<BarChart3 className="size-4" />}>
      <div className="grid grid-cols-2 divide-y divide-[#6295a9] sm:grid-cols-3 sm:divide-x sm:divide-y-0 xl:grid-cols-6">
        <SummaryMetric label={labels.primary} value={totals.primary} accent />
        <SummaryMetric label={labels.secondary} value={totals.secondary} accent />
        <SummaryMetric label={labels.period} value={period} />
        <SummaryMetric label={labels.languagesCount} value={statistics.primaryDistribution.length} />
        <SummaryMetric label={labels.countriesCount} value={statistics.secondaryDistribution.length} />
        <SummaryMetric label={labels.rolesCount} value={statistics.tertiaryDistribution.length} />
      </div>
    </AnalyticsCard>

    <AnalyticsCard title={activityTitle} icon={<CalendarDays className="size-4" />}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#6295a9] bg-[#dceff5] px-3 py-2.5">
        <div className="flex flex-wrap gap-2" aria-label={labels.timeline}>{(["primary", "secondary"] as const).map((key) => <button key={key} type="button" className={`inline-flex min-h-8 items-center gap-1.5 border px-2 text-xs font-semibold transition-colors ${visibleSeries[key] ? "border-[#456f87] bg-white text-[#07384a]" : "border-transparent bg-transparent text-[#5d7f8a] line-through"}`} onClick={() => setVisibleSeries((current) => ({ ...current, [key]: !current[key] }))}><span className="size-2 rounded-full" style={{ backgroundColor: key === "primary" ? "#e23d3d" : "#07384a" }} />{labels[key]}</button>)}</div>
        <div className="flex border border-[#6295a9] bg-[#eaf6fa] p-0.5" role="group" aria-label={labels.timeline}>{(["year", "decade", "month"] as const).map((option) => <Button key={option} size="xs" variant={granularity === option ? "default" : "ghost"} className={granularity === option ? "rounded-none bg-[#002b9e] text-white hover:bg-[#002b9e]/90" : "rounded-none text-[#07384a]"} onClick={() => setGranularity(option)}>{labels[option]}</Button>)}</div>
      </div>
      {granularity === "month" && !statistics.timelineHasMonthlyDates ? <EmptyChart message={labels.monthlyUnavailable} /> : chartData.length === 0 ? <EmptyChart message={labels.noData} /> : <div className="p-3 sm:p-4"><ChartContainer config={timelineConfig} className="h-[260px] w-full aspect-auto"><BarChart accessibilityLayer data={chartData} margin={{ left: -10, right: 10 }}><CartesianGrid vertical={false} /><XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} />{visibleSeries.primary ? <Bar dataKey="primary" fill="var(--color-primary)" radius={[2, 2, 0, 0]} animationDuration={animationDuration} /> : null}{visibleSeries.secondary ? <Bar dataKey="secondary" fill="var(--color-secondary)" radius={[2, 2, 0, 0]} animationDuration={animationDuration} /> : null}</BarChart></ChartContainer></div>}
    </AnalyticsCard>

    <div className="grid gap-3 xl:grid-cols-3">
      <DistributionChart title={labels.reach} icon={<Languages className="size-4" />} data={statistics.primaryDistribution} emptyLabel={labels.noData} />
      <DistributionChart title={labels.countries} icon={<MapPinned className="size-4" />} data={statistics.secondaryDistribution} emptyLabel={labels.noData} />
      <DistributionChart title={labels.contributions} icon={kind === "organization" ? <Network className="size-4" /> : kind === "person" ? <BookOpen className="size-4" /> : <UsersRound className="size-4" />} data={statistics.tertiaryDistribution} emptyLabel={labels.noData} />
    </div>
  </section>;
}
