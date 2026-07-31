"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
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
    originalAuthors: string; translatedBooks: string; translatedAuthors: string; originalPublishers: string; translators: string; translationPublishers: string; pocketReissues: string; publicationLanguages: string; publicationCountries: string;
    compareRecords: string; compareDescription: string; books: string; persons: string; organizations: string; search: string; selected: string; maximum: string; validate: string;
    filterBar: string; period: string; allPeriod: string; lastTenYears: string; lastTwentyFiveYears: string; currentDecade: string; customPeriod: string; fromYear: string; toYear: string; allLanguages: string; allCountries: string; allPublishers: string; publisher: string; scope: string; periodRange: string; pocketScope: string; filtersUnavailable: string;
    timelineTitle: string; originalAuthorsTitle: string; translatedBooksTitle: string; translatedAuthorsTitle: string; originalPublishersTitle: string; translatorsTitle: string; translationPublishersTitle: string; pocketReissuesTitle: string; languagesTitle: string; countriesTitle: string;
  };
}

interface RankingSlideProps {
  title: string;
  data: GeneralRankingEntry[];
  color: string;
  labels: Pick<GeneralStatisticsDashboardProps["labels"], "ranking" | "podium" | "page" | "noData">;
}

function RankingSlide({ title, data, color, labels }: RankingSlideProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(data.length / 10));
  const safePage = Math.min(page, totalPages - 1);
  const rows = data.slice(safePage * 10, safePage * 10 + 10);
  const graph = data.slice(0, 10);
  if (data.length === 0) return <p className="flex h-[315px] items-center justify-center px-5 text-center text-[#315565] [@media(max-height:800px)]:h-[218px]">{labels.noData}</p>;
  return <div className="grid min-h-[315px] gap-3 p-3 lg:grid-cols-[1.05fr_.95fr] lg:p-4 [@media(max-height:800px)]:min-h-[218px] [@media(max-height:800px)]:gap-2 [@media(max-height:800px)]:p-2">
    <div className="flex h-full min-h-[270px] items-center self-stretch [@media(max-height:800px)]:min-h-[190px]"><ChartContainer config={{ value: { label: title, color } }} className="h-[270px] w-full aspect-auto [@media(max-height:800px)]:h-[190px]"><BarChart data={graph} layout="vertical" margin={{ left: 8, right: 36 }}><CartesianGrid horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis dataKey="label" type="category" width={126} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="value" fill={color} radius={[0, 3, 3, 0]}><LabelList dataKey="value" position="right" fill="#07384a" fontSize={12} /></Bar></BarChart></ChartContainer></div>
    <section className="flex h-full min-w-0 flex-col self-stretch border border-[#6295a9] bg-[#eaf6fa]">
      <div className="grid grid-cols-[34px_1fr_58px] border-b border-[#6295a9] bg-[#fffbd1] px-2 py-1.5 text-[12px] font-bold text-[#07384a] [@media(max-height:800px)]:py-1 [@media(max-height:800px)]:text-[11px]"><span>#</span><span>{labels.ranking}</span><span className="text-right">{title}</span></div>
      <div className="min-h-0 flex-1">{rows.map((row, index) => <div key={row.label} className="grid grid-cols-[34px_1fr_58px] items-center border-b border-[#b4d4df] px-2 py-1.5 text-[13px] text-[#07384a] [@media(max-height:800px)]:py-0.5 [@media(max-height:800px)]:text-[11px]"><span className="font-bold">{safePage * 10 + index + 1}</span><span className="truncate font-semibold" title={row.label}>{row.label}</span><span className="text-right font-bold tabular-nums">{row.value}</span></div>)}</div>
      <div className="flex items-center justify-between border-t border-[#6295a9] px-2 py-1.5"><span className="text-[12px] font-semibold text-[#315565]">{safePage === 0 ? labels.podium : labels.ranking}</span><div className="flex items-center gap-2"><Button type="button" variant="outline" size="icon" disabled={safePage === 0} onClick={() => setPage((current) => current - 1)} className="h-7 w-7 rounded-none border-[#456f87] bg-[#fffbd1] text-[#07384a]"><ChevronLeft /></Button><span className="min-w-10 text-center text-[12px] font-bold tabular-nums">{safePage + 1}/{totalPages}</span><Button type="button" variant="outline" size="icon" disabled={safePage === totalPages - 1} onClick={() => setPage((current) => current + 1)} className="h-7 w-7 rounded-none border-[#456f87] bg-[#fffbd1] text-[#07384a]"><ChevronRight /></Button></div></div>
    </section>
  </div>;
}

function LanguageBreakdownSlide({ data, labels }: { data: LanguageBreakdownEntry[]; labels: Pick<GeneralStatisticsDashboardProps["labels"], "originals" | "translations" | "publicationLanguages" | "noData"> }) {
  const rows = data.slice(0, 10);
  if (rows.length === 0) return <p className="flex h-[315px] items-center justify-center px-5 text-center text-[#315565] [@media(max-height:800px)]:h-[218px]">{labels.noData}</p>;
  return <div className="grid min-h-[315px] gap-3 p-3 lg:grid-cols-[1.05fr_.95fr] lg:p-4 [@media(max-height:800px)]:min-h-[218px] [@media(max-height:800px)]:gap-2 [@media(max-height:800px)]:p-2">
    <div className="flex h-full min-h-[270px] items-center self-stretch [@media(max-height:800px)]:min-h-[190px]"><ChartContainer config={{ originals: { label: labels.originals, color: "#07384a" }, translations: { label: labels.translations, color: "#ff1d1d" } }} className="h-[270px] w-full aspect-auto [@media(max-height:800px)]:h-[190px]"><BarChart data={rows} layout="vertical" margin={{ left: 8, right: 12 }}><CartesianGrid horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis dataKey="label" type="category" width={126} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent />} /><Bar dataKey="originals" fill="#07384a" radius={[0, 3, 3, 0]} /><Bar dataKey="translations" fill="#ff1d1d" radius={[0, 3, 3, 0]} /></BarChart></ChartContainer></div>
    <section className="flex h-full min-w-0 flex-col self-stretch border border-[#6295a9] bg-[#eaf6fa]">
      <div className="grid grid-cols-[34px_1fr_78px_78px] border-b border-[#6295a9] bg-[#fffbd1] px-2 py-1.5 text-[12px] font-bold text-[#07384a] [@media(max-height:800px)]:py-1 [@media(max-height:800px)]:text-[11px]"><span>#</span><span>{labels.publicationLanguages}</span><span className="text-right">{labels.originals}</span><span className="text-right">{labels.translations}</span></div>
      <div className="min-h-0 flex-1">{rows.map((row, index) => <div key={row.label} className="grid grid-cols-[34px_1fr_78px_78px] items-center border-b border-[#b4d4df] px-2 py-1.5 text-[13px] text-[#07384a] [@media(max-height:800px)]:py-0.5 [@media(max-height:800px)]:text-[11px]"><span className="font-bold">{index + 1}</span><span className="truncate font-semibold" title={row.label}>{row.label}</span><span className="text-right font-bold tabular-nums">{row.originals}</span><span className="text-right font-bold tabular-nums">{row.translations}</span></div>)}</div>
    </section>
  </div>;
}

function TimelineSlide({ data, labels }: { data: GeneralStatisticsResult["timeline"]; labels: Pick<GeneralStatisticsDashboardProps["labels"], "originals" | "translations" | "noData"> }) {
  if (data.length === 0) return <p className="flex h-[325px] items-center justify-center px-5 text-center text-[#315565] [@media(max-height:800px)]:h-[218px]">{labels.noData}</p>;
  return <ChartContainer config={{ originals: { label: labels.originals, color: "#07384a" }, translations: { label: labels.translations, color: "#ff1d1d" } }} className="h-[390px] w-full aspect-auto px-3 py-4 md:px-9 [@media(max-height:800px)]:h-[250px]"><BarChart data={data} barCategoryGap="18%" barGap={2} margin={{ top: 16, left: 6, right: 14, bottom: 6 }}><CartesianGrid vertical={false} /><XAxis dataKey="period" tick={{ fontSize: 12 }} minTickGap={22} /><YAxis allowDecimals={false} /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent />} /><Bar dataKey="originals" fill="#07384a" radius={[3, 3, 0, 0]} /><Bar dataKey="translations" fill="#ff1d1d" radius={[3, 3, 0, 0]} /></BarChart></ChartContainer>;
}

function StatisticsSkeleton() {
  const heights = [18, 26, 34, 29, 43, 38, 55, 48, 66, 58, 76, 88];
  return <div aria-live="polite" aria-busy="true" className="h-[390px] px-8 py-5 [@media(max-height:800px)]:h-[250px] [@media(max-height:800px)]:py-3">
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
    { id: "authors", title: labels.originalAuthorsTitle, filters: ["period", "language", "country", "publisher"] as FilterKey[], content: <RankingSlide title={labels.originals} data={data.rankings.originalAuthors} color="#07384a" labels={labels} /> },
    { id: "books", title: labels.translatedBooksTitle, filters: ["period", "language", "country", "publisher"] as FilterKey[], content: <RankingSlide title={labels.translations} data={data.rankings.translatedBooks} color="#d59400" labels={labels} /> },
    { id: "translated-authors", title: labels.translatedAuthorsTitle, filters: ["period", "language", "country", "publisher"] as FilterKey[], content: <RankingSlide title={labels.translations} data={data.rankings.translatedAuthors} color="#b94160" labels={labels} /> },
    { id: "publishers", title: labels.originalPublishersTitle, filters: ["period", "language", "country"] as FilterKey[], content: <RankingSlide title={labels.originals} data={data.rankings.originalPublishers} color="#6d3b9e" labels={labels} /> },
    { id: "translators", title: labels.translatorsTitle, filters: ["period", "language", "country", "publisher"] as FilterKey[], content: <RankingSlide title={labels.translations} data={data.rankings.translators} color="#ff1d1d" labels={labels} /> },
    { id: "translation-publishers", title: labels.translationPublishersTitle, filters: ["period", "language", "country"] as FilterKey[], content: <RankingSlide title={labels.translations} data={data.rankings.translationPublishers} color="#0f6b86" labels={labels} /> },
    { id: "pocket", title: labels.pocketReissuesTitle, filters: [] as FilterKey[], content: <RankingSlide title={labels.pocketReissues} data={data.rankings.pocketReissues} color="#d59400" labels={labels} /> },
    { id: "languages", title: labels.languagesTitle, filters: ["period", "country", "publisher"] as FilterKey[], content: <LanguageBreakdownSlide data={data.languageBreakdown} labels={labels} /> },
    { id: "countries", title: labels.countriesTitle, filters: ["period", "language", "publisher"] as FilterKey[], content: <RankingSlide title={labels.publicationCountries} data={data.rankings.publicationCountries} color="#6d3b9e" labels={labels} /> },
  ], [data, labels]);
  const current = slides[activeSlide] ?? slides[0];
  const currentFilters = current?.filters ?? [];
  const previous = () => setActiveSlide((value) => value === 0 ? slides.length - 1 : value - 1);
  const next = () => setActiveSlide((value) => value === slides.length - 1 ? 0 : value + 1);
  if (!current) return null;
  return <section className="mt-3 w-full max-w-[1460px] border border-[#6295a9] bg-[#cce8f1]/90 p-4 shadow-[2px_2px_0_rgba(0,43,112,0.2)] [@media(max-height:800px)]:mt-0 [@media(max-height:800px)]:p-2">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#6295a9] pb-2"><h2 className="text-[19px] font-bold text-[#002b9e]">{labels.dashboard}</h2><Dialog><DialogTrigger asChild><Button type="button" variant="outline" className="h-9 rounded-none border-[#456f87] bg-[#fffbd1] font-bold text-[#07384a] hover:bg-[#dceff5] hover:text-[#002b9e]">{labels.compareRecords}</Button></DialogTrigger><DialogContent className="max-h-[82dvh] max-w-[calc(100%-2rem)] overflow-y-auto border-[#456f87] bg-[#eaf6fa] p-5 sm:max-w-[920px]"><DialogHeader><DialogTitle className="text-[#002b9e]">{labels.compareRecords}</DialogTitle><DialogDescription className="text-[#315565]">{labels.compareDescription}</DialogDescription></DialogHeader><ComparativeStatisticsSelector candidates={candidates} initialType="books" initialIds={[]} comparisonPath={comparisonPath} labels={{ books: labels.books, persons: labels.persons, organizations: labels.organizations, search: labels.search, selected: labels.selected, maximum: labels.maximum, validate: labels.validate }} /></DialogContent></Dialog></div>
    <section aria-label={labels.filterBar} className="mt-3 border border-[#6295a9] bg-[#eaf6fa] px-3 py-2 [@media(max-height:800px)]:mt-2 [@media(max-height:800px)]:py-1.5"><div className="flex flex-wrap items-end gap-x-3 gap-y-2"><span className="pb-2 text-[12px] font-bold uppercase tracking-wide text-[#07384a]">{labels.filterBar}</span>{currentFilters.includes("period") && <label className="min-w-[170px] flex-1 text-[12px] font-bold text-[#07384a]">{labels.period}<Select value={periodMode} onValueChange={selectPeriod}><SelectTrigger className="mt-1 h-9 rounded-none border-[#456f87] bg-white text-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{labels.allPeriod}</SelectItem><SelectItem value="last10">{labels.lastTenYears}</SelectItem><SelectItem value="last25">{labels.lastTwentyFiveYears}</SelectItem><SelectItem value="decade">{labels.currentDecade}</SelectItem><SelectItem value="custom">{labels.customPeriod}</SelectItem></SelectContent></Select></label>}{currentFilters.includes("period") && periodMode === "custom" && <><label className="min-w-[116px] text-[12px] font-bold text-[#07384a]">{labels.fromYear}<Select value={filters.fromYear ? String(filters.fromYear) : "__all__"} onValueChange={(value) => updateFilters({ fromYear: value === "__all__" ? undefined : Number(value) })}><SelectTrigger className="mt-1 h-9 rounded-none border-[#456f87] bg-white text-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">—</SelectItem>{data.yearOptions.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent></Select></label><label className="min-w-[116px] text-[12px] font-bold text-[#07384a]">{labels.toYear}<Select value={filters.toYear ? String(filters.toYear) : "__all__"} onValueChange={(value) => updateFilters({ toYear: value === "__all__" ? undefined : Number(value) })}><SelectTrigger className="mt-1 h-9 rounded-none border-[#456f87] bg-white text-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">—</SelectItem>{data.yearOptions.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent></Select></label></>}{currentFilters.includes("language") && <label className="min-w-[160px] flex-1 text-[12px] font-bold text-[#07384a]">{labels.language}<Select value={filters.language || "__all__"} onValueChange={(value) => updateFilters({ language: value === "__all__" ? undefined : value })}><SelectTrigger className="mt-1 h-9 rounded-none border-[#456f87] bg-white text-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">{labels.allLanguages}</SelectItem>{data.languageOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>}{currentFilters.includes("country") && <label className="min-w-[160px] flex-1 text-[12px] font-bold text-[#07384a]">{labels.publicationCountries}<Select value={filters.country || "__all__"} onValueChange={(value) => updateFilters({ country: value === "__all__" ? undefined : value })}><SelectTrigger className="mt-1 h-9 rounded-none border-[#456f87] bg-white text-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">{labels.allCountries}</SelectItem>{data.countryOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>}{currentFilters.includes("publisher") && <label className="min-w-[180px] flex-1 text-[12px] font-bold text-[#07384a]">{labels.publisher}<Select value={filters.publisher || "__all__"} onValueChange={(value) => updateFilters({ publisher: value === "__all__" ? undefined : value })}><SelectTrigger className="mt-1 h-9 rounded-none border-[#456f87] bg-white text-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">{labels.allPublishers}</SelectItem>{data.publisherOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>}{currentFilters.length === 0 && <p className="py-2 text-[13px] text-[#315565]">{labels.filtersUnavailable}</p>}</div></section>
    <section aria-label={labels.carousel} className="mt-3 overflow-hidden border border-[#6295a9] bg-[#eaf6fa] [@media(max-height:800px)]:mt-2"><div className="border-b border-[#6295a9] bg-[#b5e0ee] px-4 py-2.5 [@media(max-height:800px)]:px-3 [@media(max-height:800px)]:py-1.5"><h3 className="text-[16px] font-bold text-[#07384a]">{current.title}</h3><p className="mt-1 text-[12px] text-[#315565]">{current.id === "pocket" ? labels.pocketScope : fullScope}</p></div><div key={isPending ? "loading" : current.id} className="animate-in fade-in-0 duration-200 motion-reduce:animate-none">{isPending ? <StatisticsSkeleton /> : current.content}</div></section>
    <nav aria-label={labels.carousel} className="mt-3 flex items-center justify-center gap-4 [@media(max-height:800px)]:mt-2"><Button type="button" variant="outline" size="icon-lg" aria-label={labels.previous} onClick={previous} className="border-[#456f87] bg-[#fffbd1] text-[#07384a] hover:bg-[#dceff5] hover:text-[#002b9e]"><ChevronLeft /></Button><span className="min-w-14 text-center text-[14px] font-bold tabular-nums text-[#07384a]">{activeSlide + 1} / {slides.length}</span><Button type="button" variant="outline" size="icon-lg" aria-label={labels.next} onClick={next} className="border-[#456f87] bg-[#fffbd1] text-[#07384a] hover:bg-[#dceff5] hover:text-[#002b9e]"><ChevronRight /></Button></nav>
  </section>;
}
