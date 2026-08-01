"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ComparativeStatisticsSelector } from "@/components/stavnet/comparative-statistics-selector";
import type { ComparisonCandidate, ComparisonType } from "@/components/stavnet/comparative-statistics-dashboard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { GeneralRankingEntry, GeneralStatisticsFilters, GeneralStatisticsResult, LanguageBreakdownEntry } from "@/lib/general-statistics";

type FilterKey = "period" | "language" | "country" | "publisher";

interface GeneralStatisticsDashboardProps {
  data: GeneralStatisticsResult;
  filters: GeneralStatisticsFilters;
  basePath: string;
  comparisonPath: string;
  candidates: Record<ComparisonType, ComparisonCandidate[]>;
  labels: {
    dashboard: string; timeline: string; originals: string; translations: string; language: string; all: string; noData: string; previous: string; next: string; carousel: string; ranking: string; podium: string; page: string;
    originalAuthors: string; translatedBooks: string; translatedAuthors: string; originalPublishers: string; translators: string; translationPublishers: string; pocketReissues: string; publicationLanguages: string; publicationCountries: string; writingGenres: string; works: string; authors: string; otherGenres: string;
    compareRecords: string; compareDescription: string; books: string; persons: string; organizations: string; search: string; selected: string; maximum: string; validate: string;
    filterBar: string; period: string; allPeriod: string; lastTenYears: string; lastTwentyFiveYears: string; currentDecade: string; customPeriod: string; fromYear: string; toYear: string; allLanguages: string; allCountries: string; allPublishers: string; publisher: string; scope: string; periodRange: string; pocketScope: string; birthCountriesScope: string; filtersUnavailable: string;
    timelineTitle: string; originalAuthorsTitle: string; translatedBooksTitle: string; translatedAuthorsTitle: string; originalPublishersTitle: string; translatorsTitle: string; translationPublishersTitle: string; pocketReissuesTitle: string; languagesTitle: string; countriesTitle: string; genresTitle: string; birthCountriesTitle: string;
  };
}

interface RankingSlideProps {
  title: string;
  data: GeneralRankingEntry[];
  labels: Pick<GeneralStatisticsDashboardProps["labels"], "ranking" | "podium" | "page" | "noData">;
}

const rankingBarColors = ["#07384a", "#e23d3d", "#2f6fdb", "#9b4d96", "#17826d", "#e58b20", "#b43d6a", "#308c94", "#c85b20", "#5a52a3"];

const rankingMedalClassNames: Record<number, string> = {
  1: "bg-[#d4af37] text-[#2d2300]",
  2: "bg-[#c7d0d4] text-[#20323a]",
  3: "bg-[#cd7f32] text-[#2f1908]",
};

function WritingGenresSlide({ data, labels }: { data: GeneralRankingEntry[]; labels: Pick<GeneralStatisticsDashboardProps["labels"], "writingGenres" | "works" | "otherGenres" | "noData"> }) {
  const leadingGenres = data.slice(0, 6);
  const remainingGenres = data.slice(6, 10);
  const rows = remainingGenres.length > 0 ? [...leadingGenres, { label: labels.otherGenres, value: remainingGenres.reduce((total, genre) => total + genre.value, 0) }] : leadingGenres;
  if (rows.length === 0) return <p className="flex min-h-[280px] items-center justify-center px-5 py-10 text-center text-base text-[#315565] sm:min-h-[360px]">{labels.noData}</p>;
  return <div className="grid gap-4 p-3 sm:gap-5 sm:p-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
    <div className="flex min-h-[280px] items-center sm:min-h-[340px] lg:min-h-[390px]"><ChartContainer config={Object.fromEntries(rows.map((row, index) => [row.label, { label: row.label, color: rankingBarColors[index % rankingBarColors.length] }]))} className="h-[280px] w-full aspect-auto sm:h-[340px] lg:h-[390px]"><PieChart><ChartTooltip content={<ChartTooltipContent nameKey="label" />} /><Pie data={rows} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius="88%" stroke="#eaf6fa" strokeWidth={2}><LabelList dataKey="label" position="inside" fill="#ffffff" fontSize={11} className="font-semibold" />{rows.map((row, index) => <Cell key={row.label} fill={rankingBarColors[index % rankingBarColors.length]} />)}</Pie></PieChart></ChartContainer></div>
    <section className="flex min-w-0 flex-col overflow-hidden border border-[#6295a9] bg-[#eaf6fa] lg:min-h-[390px]">
      <div className="grid grid-cols-[32px_minmax(0,1fr)_64px] border-b border-[#6295a9] bg-[#fffbd1] px-2 py-2 text-xs font-bold text-[#07384a] sm:grid-cols-[38px_minmax(0,1fr)_84px] sm:px-3 sm:text-sm"><span>#</span><span>{labels.writingGenres}</span><span className="text-right">{labels.works}</span></div>
      <div className="min-h-0 flex-1">{rows.map((row, index) => <div key={row.label} className="grid grid-cols-[32px_minmax(0,1fr)_64px] items-center border-b border-[#b4d4df] px-2 py-2 text-sm text-[#07384a] sm:grid-cols-[38px_minmax(0,1fr)_84px] sm:px-3 sm:text-[15px]"><span className="flex items-center gap-1 font-bold sm:gap-1.5"><span className="size-2 shrink-0 rounded-full sm:size-2.5" style={{ backgroundColor: rankingBarColors[index % rankingBarColors.length] }} />{index + 1}</span><span className="truncate font-semibold" title={row.label}>{row.label}</span><span className="text-right font-bold tabular-nums">{row.value}</span></div>)}</div>
    </section>
  </div>;
}

function RankingSlide({ title, data, labels }: RankingSlideProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(data.length / 10));
  const safePage = Math.min(page, totalPages - 1);
  const rows = data.slice(safePage * 10, safePage * 10 + 10);
  const graph = data.slice(0, 10);
  if (data.length === 0) return <p className="flex min-h-[280px] items-center justify-center px-5 py-10 text-center text-base text-[#315565] sm:min-h-[360px]">{labels.noData}</p>;
  return <div className="grid gap-4 p-3 sm:gap-5 sm:p-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
    <div className="flex min-h-[280px] items-center sm:min-h-[340px] lg:min-h-[350px]"><ChartContainer config={{ value: { label: title, color: rankingBarColors[0] } }} className="h-[280px] w-full aspect-auto sm:h-[340px] lg:h-[350px]"><BarChart data={graph} layout="vertical" margin={{ left: 0, right: 30 }}><CartesianGrid horizontal={false} /><XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} /><YAxis dataKey="label" type="category" width={96} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="value" radius={[0, 3, 3, 0]}>{graph.map((entry, index) => <Cell key={entry.label} fill={rankingBarColors[index % rankingBarColors.length]} />)}<LabelList dataKey="value" position="right" fill="#07384a" fontSize={12} /></Bar></BarChart></ChartContainer></div>
    <section className="flex min-w-0 flex-col overflow-hidden border border-[#6295a9] bg-[#eaf6fa] lg:h-[350px]">
      <div className="grid grid-cols-[32px_minmax(0,1fr)_58px] border-b border-[#6295a9] bg-[#fffbd1] px-2 py-2 text-xs font-bold text-[#07384a] sm:grid-cols-[38px_minmax(0,1fr)_70px] sm:px-3 sm:text-sm lg:py-1 lg:text-[12px]"><span>#</span><span>{labels.ranking}</span><span className="truncate text-right">{title}</span></div>
      <div className="min-h-0 flex-1 lg:flex lg:flex-col">{rows.map((row, index) => { const rank = safePage * 10 + index + 1; const medalClassName = rankingMedalClassNames[rank]; return <div key={row.label} className="grid grid-cols-[32px_minmax(0,1fr)_58px] items-center border-b border-[#b4d4df] px-2 py-2 text-sm text-[#07384a] sm:grid-cols-[38px_minmax(0,1fr)_70px] sm:px-3 sm:text-[15px] lg:flex-1 lg:py-0 lg:text-[13px]"><span className={`flex size-6 items-center justify-center font-bold lg:size-5 ${medalClassName ? `rounded-full ${medalClassName}` : ""}`}>{rank}</span><span className="truncate font-semibold" title={row.label}>{row.label}</span><span className="text-right font-bold tabular-nums">{row.value}</span></div>; })}</div>
      <div className="flex items-center justify-between border-t border-[#6295a9] px-2 py-2 sm:px-3 lg:py-1"><span className="text-xs font-semibold text-[#315565] sm:text-sm lg:text-[12px]">{safePage === 0 ? labels.podium : labels.ranking}</span><div className="flex items-center gap-2 sm:gap-3"><Button type="button" variant="outline" size="icon" disabled={safePage === 0} onClick={() => setPage((current) => current - 1)} className="h-8 w-8 rounded-none border-[#456f87] bg-[#fffbd1] text-[#07384a] lg:h-7 lg:w-7"><ChevronLeft /></Button><span className="min-w-10 text-center text-xs font-bold tabular-nums sm:min-w-12 sm:text-sm lg:text-[12px]">{safePage + 1}/{totalPages}</span><Button type="button" variant="outline" size="icon" disabled={safePage === totalPages - 1} onClick={() => setPage((current) => current + 1)} className="h-8 w-8 rounded-none border-[#456f87] bg-[#fffbd1] text-[#07384a] lg:h-7 lg:w-7"><ChevronRight /></Button></div></div>
    </section>
  </div>;
}

function LanguageBreakdownSlide({ data, labels }: { data: LanguageBreakdownEntry[]; labels: Pick<GeneralStatisticsDashboardProps["labels"], "works" | "ranking" | "podium" | "page" | "noData"> }) {
  const rows = data.map((entry) => ({ label: entry.label, value: entry.originals + entry.translations })).sort((left, right) => right.value - left.value || left.label.localeCompare(right.label));
  return <RankingSlide title={labels.works} data={rows} labels={labels} />;
}

function timelineByDecade(data: GeneralStatisticsResult["timeline"]) {
  const decades = new Map<number, { period: string; originals: number; translations: number }>();
  for (const point of data) {
    const year = Number(point.period);
    if (!Number.isSafeInteger(year)) continue;
    const start = Math.floor(year / 10) * 10;
    const entry = decades.get(start) ?? { period: `${start}–${start + 9}`, originals: 0, translations: 0 };
    entry.originals += point.originals;
    entry.translations += point.translations;
    decades.set(start, entry);
  }
  return [...decades.entries()].sort(([left], [right]) => left - right).map(([, entry]) => entry);
}

function TimelineSlide({ data, labels }: { data: GeneralStatisticsResult["timeline"]; labels: Pick<GeneralStatisticsDashboardProps["labels"], "originals" | "translations" | "noData"> }) {
  if (data.length === 0) return <p className="flex min-h-[280px] items-center justify-center px-5 py-10 text-center text-base text-[#315565] sm:min-h-[360px] lg:min-h-[470px]">{labels.noData}</p>;
  const decades = timelineByDecade(data);
  return <ChartContainer config={{ originals: { label: labels.originals, color: "#07384a" }, translations: { label: labels.translations, color: "#e23d3d" } }} className="h-[280px] w-full aspect-auto px-2 py-3 sm:h-[360px] sm:px-5 sm:py-5 lg:h-[clamp(340px,30vh,470px)] lg:px-12"><BarChart data={decades} barCategoryGap="24%" barGap={4} margin={{ top: 12, left: 0, right: 12, bottom: 8 }}><CartesianGrid vertical={false} /><XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={24} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={28} /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent className="flex-wrap gap-x-3 gap-y-1 text-[11px] sm:gap-4 sm:text-xs" />} /><Bar dataKey="originals" fill="#07384a" radius={[4, 4, 0, 0]} /><Bar dataKey="translations" fill="#e23d3d" radius={[4, 4, 0, 0]} /></BarChart></ChartContainer>;
}

function StatisticsSkeleton() {
  const heights = [18, 26, 34, 29, 43, 38, 55, 48, 66, 58, 76, 88];
  return <div aria-live="polite" aria-busy="true" className="h-[280px] px-3 py-3 sm:h-[360px] sm:px-5 sm:py-5 lg:h-[390px] lg:px-8">
    <div className="flex h-[calc(100%-34px)] min-h-0"><div className="flex w-10 flex-col justify-between pb-1 pr-2 text-right"><Skeleton className="ml-auto h-2 w-6 rounded-none bg-[#93bdcd]" /><Skeleton className="ml-auto h-2 w-6 rounded-none bg-[#93bdcd]" /><Skeleton className="ml-auto h-2 w-4 rounded-none bg-[#93bdcd]" /><Skeleton className="ml-auto h-2 w-3 rounded-none bg-[#93bdcd]" /></div><div className="relative flex min-w-0 flex-1 items-end gap-px border-b border-l border-[#608fa1] px-2"><div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#d2e7ee]" /><div className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-[#d2e7ee]" /><div className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-[#d2e7ee]" />{heights.map((height, index) => <div key={index} className="relative z-10 flex h-full min-w-0 flex-1 items-end justify-center gap-px"><Skeleton className="w-[38%] rounded-t-sm rounded-b-none bg-[#6d9daf]" style={{ height: `${Math.max(10, height - 9)}%` }} /><Skeleton className="w-[38%] rounded-t-sm rounded-b-none bg-[#d7a2a2]" style={{ height: `${height}%` }} /></div>)}</div></div>
    <div className="mt-3 flex items-center justify-center gap-4"><span className="flex items-center gap-1.5 text-[11px] text-[#315565]"><Skeleton className="h-2 w-2 rounded-none bg-[#6d9daf]" />Originaux</span><span className="flex items-center gap-1.5 text-[11px] text-[#315565]"><Skeleton className="h-2 w-2 rounded-none bg-[#d7a2a2]" />Traductions</span></div>
  </div>;
}

function scopeText(filters: GeneralStatisticsFilters, labels: GeneralStatisticsDashboardProps["labels"]) {
  const period = filters.fromYear || filters.toYear ? labels.periodRange.replace("{from}", String(filters.fromYear || "…")).replace("{to}", String(filters.toYear || "…")) : labels.allPeriod;
  const language = filters.language || labels.allLanguages;
  const country = filters.country || labels.allCountries;
  const publisher = filters.publisher || labels.allPublishers;
  return labels.scope.replace("{period}", period).replace("{language}", language).replace("{country}", country).replace("{publisher}", publisher);
}

export function GeneralStatisticsDashboard({ data, filters, basePath, comparisonPath, candidates, labels }: GeneralStatisticsDashboardProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [periodMode, setPeriodMode] = useState(() => filters.fromYear || filters.toYear ? "custom" : "all");
  const rangeStart = data.yearOptions.at(0) ?? 0;
  const rangeEnd = data.yearOptions.at(-1) ?? 0;
  const fullScope = scopeText(filters, labels);
  const updateFilters = (changes: Partial<GeneralStatisticsFilters>) => {
    const next = { ...filters, ...changes };
    if (next.fromYear && next.toYear && next.fromYear > next.toYear) next.toYear = next.fromYear;
    const params = new URLSearchParams();
    if (next.fromYear) params.set("fromYear", String(next.fromYear));
    if (next.toYear) params.set("toYear", String(next.toYear));
    if (next.language) params.set("language", next.language);
    if (next.country) params.set("country", next.country);
    if (next.publisher) params.set("publisher", next.publisher);
    startTransition(() => router.replace(`${basePath}${params.size ? `?${params.toString()}` : ""}`));
  };
  const selectPeriod = (value: string) => {
    setPeriodMode(value);
    if (value === "all") updateFilters({ fromYear: undefined, toYear: undefined });
    if (value === "last10" && rangeEnd) updateFilters({ fromYear: Math.max(rangeStart, rangeEnd - 9), toYear: rangeEnd });
    if (value === "last25" && rangeEnd) updateFilters({ fromYear: Math.max(rangeStart, rangeEnd - 24), toYear: rangeEnd });
    if (value === "decade" && rangeEnd) updateFilters({ fromYear: Math.floor(rangeEnd / 10) * 10, toYear: rangeEnd });
  };
  const slides = useMemo(() => [
    { id: "timeline", title: labels.timelineTitle, filters: ["period", "language", "country", "publisher"] as FilterKey[], content: <TimelineSlide data={data.timeline} labels={labels} /> },
    { id: "authors", title: labels.originalAuthorsTitle, filters: ["period", "language", "country", "publisher"] as FilterKey[], content: <RankingSlide title={labels.originals} data={data.rankings.originalAuthors} labels={labels} /> },
    { id: "books", title: labels.translatedBooksTitle, filters: ["period", "language", "country", "publisher"] as FilterKey[], content: <RankingSlide title={labels.translations} data={data.rankings.translatedBooks} labels={labels} /> },
    { id: "translated-authors", title: labels.translatedAuthorsTitle, filters: ["period", "language", "country", "publisher"] as FilterKey[], content: <RankingSlide title={labels.translations} data={data.rankings.translatedAuthors} labels={labels} /> },
    { id: "publishers", title: labels.originalPublishersTitle, filters: ["period", "language", "country"] as FilterKey[], content: <RankingSlide title={labels.originals} data={data.rankings.originalPublishers} labels={labels} /> },
    { id: "translators", title: labels.translatorsTitle, filters: ["period", "language", "country", "publisher"] as FilterKey[], content: <RankingSlide title={labels.translations} data={data.rankings.translators} labels={labels} /> },
    { id: "translation-publishers", title: labels.translationPublishersTitle, filters: ["period", "language", "country"] as FilterKey[], content: <RankingSlide title={labels.translations} data={data.rankings.translationPublishers} labels={labels} /> },
    { id: "pocket", title: labels.pocketReissuesTitle, filters: [] as FilterKey[], content: <RankingSlide title={labels.pocketReissues} data={data.rankings.pocketReissues} labels={labels} /> },
    { id: "languages", title: labels.languagesTitle, filters: ["period", "country", "publisher"] as FilterKey[], content: <LanguageBreakdownSlide data={data.languageBreakdown} labels={labels} /> },
    { id: "countries", title: labels.countriesTitle, filters: ["period", "language", "publisher"] as FilterKey[], content: <RankingSlide title={labels.publicationCountries} data={data.rankings.publicationCountries} labels={labels} /> },
    { id: "genres", title: labels.genresTitle, filters: ["period", "language", "country", "publisher"] as FilterKey[], content: <WritingGenresSlide data={data.writingGenres} labels={labels} /> },
    { id: "birth-countries", title: labels.birthCountriesTitle, filters: [] as FilterKey[], content: <RankingSlide title={labels.authors} data={data.birthCountries} labels={labels} /> },
  ], [data, labels]);
  const current = slides[activeSlide] ?? slides[0];
  const currentFilters = current?.filters ?? [];
  const previous = () => setActiveSlide((value) => value === 0 ? slides.length - 1 : value - 1);
  const next = () => setActiveSlide((value) => value === slides.length - 1 ? 0 : value + 1);
  if (!current) return null;
  return <section className="w-full max-w-[1480px] px-0 py-2 sm:py-4 lg:px-2">
    <div className="flex flex-col gap-3 border-b border-[#6295a9] pb-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-xl font-bold text-[#002b9e] sm:text-[23px]">{labels.dashboard}</h2><Dialog><DialogTrigger asChild><Button type="button" variant="outline" className="h-11 w-full rounded-none border-[#456f87] bg-[#fffbd1] px-4 text-sm font-bold text-[#07384a] hover:bg-[#dceff5] hover:text-[#002b9e] sm:w-auto sm:px-5 sm:text-[15px]">{labels.compareRecords}</Button></DialogTrigger><DialogContent className="max-h-[82dvh] max-w-[calc(100%-2rem)] overflow-y-auto border-[#456f87] bg-[#eaf6fa] p-4 sm:max-w-[920px] sm:p-5"><DialogHeader><DialogTitle className="text-[#002b9e]">{labels.compareRecords}</DialogTitle><DialogDescription className="text-[#315565]">{labels.compareDescription}</DialogDescription></DialogHeader><ComparativeStatisticsSelector candidates={candidates} initialType="books" initialIds={[]} comparisonPath={comparisonPath} labels={{ books: labels.books, persons: labels.persons, organizations: labels.organizations, search: labels.search, selected: labels.selected, maximum: labels.maximum, validate: labels.validate }} /></DialogContent></Dialog></div>
    <section aria-label={labels.filterBar} className="mt-3 border border-[#6295a9] bg-[#eaf6fa] p-3 sm:mt-4 sm:p-4"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[auto_repeat(4,minmax(0,1fr))] xl:items-end xl:gap-5"><span className="text-xs font-bold uppercase tracking-wide text-[#07384a] sm:pb-3 sm:text-sm xl:whitespace-nowrap">{labels.filterBar}</span>{currentFilters.includes("period") && <label className="min-w-0 text-xs font-bold text-[#07384a] sm:text-sm">{labels.period}<Select value={periodMode} onValueChange={selectPeriod}><SelectTrigger className="mt-1 h-11 w-full rounded-none border-[#456f87] bg-white text-sm text-black sm:mt-1.5 sm:text-[15px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{labels.allPeriod}</SelectItem><SelectItem value="last10">{labels.lastTenYears}</SelectItem><SelectItem value="last25">{labels.lastTwentyFiveYears}</SelectItem><SelectItem value="decade">{labels.currentDecade}</SelectItem><SelectItem value="custom">{labels.customPeriod}</SelectItem></SelectContent></Select></label>}{currentFilters.includes("period") && periodMode === "custom" && <><label className="min-w-0 text-xs font-bold text-[#07384a] sm:text-sm">{labels.fromYear}<Select value={filters.fromYear ? String(filters.fromYear) : "__all__"} onValueChange={(value) => updateFilters({ fromYear: value === "__all__" ? undefined : Number(value) })}><SelectTrigger className="mt-1 h-11 w-full rounded-none border-[#456f87] bg-white text-sm text-black sm:mt-1.5 sm:text-[15px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">—</SelectItem>{data.yearOptions.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent></Select></label><label className="min-w-0 text-xs font-bold text-[#07384a] sm:text-sm">{labels.toYear}<Select value={filters.toYear ? String(filters.toYear) : "__all__"} onValueChange={(value) => updateFilters({ toYear: value === "__all__" ? undefined : Number(value) })}><SelectTrigger className="mt-1 h-11 w-full rounded-none border-[#456f87] bg-white text-sm text-black sm:mt-1.5 sm:text-[15px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">—</SelectItem>{data.yearOptions.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent></Select></label></>}{currentFilters.includes("language") && <label className="min-w-0 text-xs font-bold text-[#07384a] sm:text-sm">{labels.language}<Select value={filters.language || "__all__"} onValueChange={(value) => updateFilters({ language: value === "__all__" ? undefined : value })}><SelectTrigger className="mt-1 h-11 w-full rounded-none border-[#456f87] bg-white text-sm text-black sm:mt-1.5 sm:text-[15px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">{labels.allLanguages}</SelectItem>{data.languageOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>}{currentFilters.includes("country") && <label className="min-w-0 text-xs font-bold text-[#07384a] sm:text-sm">{labels.publicationCountries}<Select value={filters.country || "__all__"} onValueChange={(value) => updateFilters({ country: value === "__all__" ? undefined : value })}><SelectTrigger className="mt-1 h-11 w-full rounded-none border-[#456f87] bg-white text-sm text-black sm:mt-1.5 sm:text-[15px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">{labels.allCountries}</SelectItem>{data.countryOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>}{currentFilters.includes("publisher") && <label className="min-w-0 text-xs font-bold text-[#07384a] sm:text-sm">{labels.publisher}<Select value={filters.publisher || "__all__"} onValueChange={(value) => updateFilters({ publisher: value === "__all__" ? undefined : value })}><SelectTrigger className="mt-1 h-11 w-full rounded-none border-[#456f87] bg-white text-sm text-black sm:mt-1.5 sm:text-[15px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">{labels.allPublishers}</SelectItem>{data.publisherOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>}{currentFilters.length === 0 && <p className="py-2 text-sm text-[#315565]">{labels.filtersUnavailable}</p>}</div></section>
    <section aria-label={labels.carousel} className="mt-3 overflow-hidden border border-[#6295a9] bg-[#eaf6fa] sm:mt-4"><div className="border-b border-[#6295a9] bg-[#b5e0ee] px-3 py-3 sm:px-5 sm:py-4"><h3 className="text-base font-bold text-[#07384a] sm:text-xl">{current.title}</h3><p className="mt-1 text-xs leading-snug text-[#315565] sm:mt-1.5 sm:text-sm">{current.id === "pocket" ? labels.pocketScope : current.id === "birth-countries" ? labels.birthCountriesScope : fullScope}</p></div><div key={isPending ? "loading" : current.id} className="animate-in fade-in-0 duration-200 motion-reduce:animate-none">{isPending ? <StatisticsSkeleton /> : current.content}</div></section>
    <nav aria-label={labels.carousel} className="mt-3 flex items-center justify-center gap-4 sm:mt-4 sm:gap-5"><Button type="button" variant="outline" size="icon-lg" aria-label={labels.previous} onClick={previous} className="h-11 w-11 border-[#456f87] bg-[#fffbd1] text-[#07384a] hover:bg-[#dceff5] hover:text-[#002b9e] sm:h-12 sm:w-12"><ChevronLeft /></Button><span className="min-w-14 text-center text-sm font-bold tabular-nums text-[#07384a] sm:min-w-16 sm:text-base">{activeSlide + 1} / {slides.length}</span><Button type="button" variant="outline" size="icon-lg" aria-label={labels.next} onClick={next} className="h-11 w-11 border-[#456f87] bg-[#fffbd1] text-[#07384a] hover:bg-[#dceff5] hover:text-[#002b9e] sm:h-12 sm:w-12"><ChevronRight /></Button></nav>
  </section>;
}
