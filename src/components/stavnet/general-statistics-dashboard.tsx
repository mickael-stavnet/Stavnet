"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ComparativeStatisticsSelector } from "@/components/stavnet/comparative-statistics-selector";
import type { ComparisonCandidate, ComparisonType } from "@/components/stavnet/comparative-statistics-dashboard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GeneralRankingEntry, GeneralStatisticsResult, LanguageBreakdownEntry } from "@/lib/general-statistics";

interface GeneralStatisticsDashboardProps {
  data: GeneralStatisticsResult;
  initialLanguage: string;
  basePath: string;
  comparisonPath: string;
  candidates: Record<ComparisonType, ComparisonCandidate[]>;
  labels: {
    dashboard: string; timeline: string; originals: string; translations: string; language: string; all: string; noData: string; previous: string; next: string; carousel: string; ranking: string; podium: string; page: string;
    originalAuthors: string; translatedBooks: string; translatedAuthors: string; originalPublishers: string; translators: string; translationPublishers: string; pocketReissues: string; publicationLanguages: string; publicationCountries: string;
    compareRecords: string; compareDescription: string; books: string; persons: string; organizations: string; search: string; selected: string; maximum: string; validate: string;
  };
}

interface RankingSlideProps { title: string; data: GeneralRankingEntry[]; color: string; labels: Pick<GeneralStatisticsDashboardProps["labels"], "ranking" | "podium" | "page" | "noData">; }

function RankingSlide({ title, data, color, labels }: RankingSlideProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(data.length / 10));
  const rows = data.slice(page * 10, page * 10 + 10);
  const graph = data.slice(0, 10);
  if (data.length === 0) return <p className="flex h-[315px] items-center justify-center px-5 text-center text-[#315565] [@media(max-height:800px)]:h-[218px]">{labels.noData}</p>;
  return <div className="grid min-h-[315px] gap-3 p-3 lg:grid-cols-[1.05fr_.95fr] lg:p-4 [@media(max-height:800px)]:min-h-[218px] [@media(max-height:800px)]:gap-2 [@media(max-height:800px)]:p-2">
    <ChartContainer config={{ value: { label: title, color } }} className="h-[270px] w-full aspect-auto [@media(max-height:800px)]:h-[190px]"><BarChart data={graph} layout="vertical" margin={{ left: 8, right: 36 }}><CartesianGrid horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis dataKey="label" type="category" width={126} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="value" fill={color} radius={[0, 3, 3, 0]}><LabelList dataKey="value" position="right" fill="#07384a" fontSize={12} /></Bar></BarChart></ChartContainer>
    <section className="flex min-w-0 flex-col border border-[#6295a9] bg-[#eaf6fa]">
      <div className="grid grid-cols-[34px_1fr_58px] border-b border-[#6295a9] bg-[#fffbd1] px-2 py-1.5 text-[12px] font-bold text-[#07384a] [@media(max-height:800px)]:py-1 [@media(max-height:800px)]:text-[11px]"><span>#</span><span>{labels.ranking}</span><span className="text-right">{title}</span></div>
      <div className="min-h-0 flex-1">{rows.map((row, index) => <div key={row.label} className="grid grid-cols-[34px_1fr_58px] items-center border-b border-[#b4d4df] px-2 py-1.5 text-[13px] text-[#07384a] [@media(max-height:800px)]:py-0.5 [@media(max-height:800px)]:text-[11px]"><span className="font-bold">{page * 10 + index + 1}</span><span className="truncate font-semibold" title={row.label}>{row.label}</span><span className="text-right font-bold">{row.value}</span></div>)}</div>
      <div className="flex items-center justify-between border-t border-[#6295a9] px-2 py-1.5"><span className="text-[12px] font-semibold text-[#315565]">{page === 0 ? labels.podium : labels.ranking}</span><div className="flex items-center gap-2"><Button type="button" variant="outline" size="icon" disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="h-7 w-7 rounded-none border-[#456f87] bg-[#fffbd1] text-[#07384a]"><ChevronLeft /></Button><span className="min-w-10 text-center text-[12px] font-bold">{page + 1}/{totalPages}</span><Button type="button" variant="outline" size="icon" disabled={page === totalPages - 1} onClick={() => setPage((current) => current + 1)} className="h-7 w-7 rounded-none border-[#456f87] bg-[#fffbd1] text-[#07384a]"><ChevronRight /></Button></div></div>
    </section>
  </div>;
}

function LanguageBreakdownSlide({ data, labels }: { data: LanguageBreakdownEntry[]; labels: Pick<GeneralStatisticsDashboardProps["labels"], "originals" | "translations" | "publicationLanguages" | "noData"> }) {
  const rows = data.slice(0, 10);
  if (rows.length === 0) return <p className="flex h-[315px] items-center justify-center px-5 text-center text-[#315565] [@media(max-height:800px)]:h-[218px]">{labels.noData}</p>;
  return <div className="grid min-h-[315px] gap-3 p-3 lg:grid-cols-[1.05fr_.95fr] lg:p-4 [@media(max-height:800px)]:min-h-[218px] [@media(max-height:800px)]:gap-2 [@media(max-height:800px)]:p-2">
    <ChartContainer config={{ originals: { label: labels.originals, color: "#07384a" }, translations: { label: labels.translations, color: "#ff1d1d" } }} className="h-[270px] w-full aspect-auto [@media(max-height:800px)]:h-[190px]"><BarChart data={rows} layout="vertical" margin={{ left: 8, right: 12 }}><CartesianGrid horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis dataKey="label" type="category" width={126} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent />} /><Bar dataKey="originals" fill="#07384a" radius={[0, 3, 3, 0]} /><Bar dataKey="translations" fill="#ff1d1d" radius={[0, 3, 3, 0]} /></BarChart></ChartContainer>
    <section className="flex min-w-0 flex-col border border-[#6295a9] bg-[#eaf6fa]">
      <div className="grid grid-cols-[34px_1fr_78px_78px] border-b border-[#6295a9] bg-[#fffbd1] px-2 py-1.5 text-[12px] font-bold text-[#07384a] [@media(max-height:800px)]:py-1 [@media(max-height:800px)]:text-[11px]"><span>#</span><span>{labels.publicationLanguages}</span><span className="text-right">{labels.originals}</span><span className="text-right">{labels.translations}</span></div>
      <div className="min-h-0 flex-1">{rows.map((row, index) => <div key={row.label} className="grid grid-cols-[34px_1fr_78px_78px] items-center border-b border-[#b4d4df] px-2 py-1.5 text-[13px] text-[#07384a] [@media(max-height:800px)]:py-0.5 [@media(max-height:800px)]:text-[11px]"><span className="font-bold">{index + 1}</span><span className="truncate font-semibold" title={row.label}>{row.label}</span><span className="text-right font-bold">{row.originals}</span><span className="text-right font-bold">{row.translations}</span></div>)}</div>
    </section>
  </div>;
}

export function GeneralStatisticsDashboard({ data, initialLanguage, basePath, comparisonPath, candidates, labels }: GeneralStatisticsDashboardProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [language, setLanguage] = useState(initialLanguage || "__all__");
  const period = data.timeline.length > 0 ? `${data.timeline[0]?.period}–${data.timeline.at(-1)?.period}` : "";
  const languageTitle = language === "__all__" ? labels.all : language;
  const slides = useMemo(() => [
    { id: "timeline", title: `${labels.timeline} · ${labels.originals} / ${labels.translations} · ${period || "—"}`, content: data.timeline.length === 0 ? <p className="flex h-[325px] items-center justify-center px-5 text-center text-[#315565] [@media(max-height:800px)]:h-[218px]">{labels.noData}</p> : <ChartContainer config={{ originals: { label: labels.originals, color: "#07384a" }, translations: { label: labels.translations, color: "#ff1d1d" } }} className="h-[325px] w-full aspect-auto px-3 py-3 md:px-7 [@media(max-height:800px)]:h-[218px]"><AreaChart data={data.timeline}><CartesianGrid vertical={false} /><XAxis dataKey="period" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent />} /><Area type="monotone" dataKey="originals" stroke="#07384a" fill="#07384a33" strokeWidth={2} /><Area type="monotone" dataKey="translations" stroke="#ff1d1d" fill="#ff1d1d24" strokeWidth={2} /></AreaChart></ChartContainer> },
    { id: "authors", title: `${labels.ranking} · ${labels.originalAuthors} · ${labels.originals}`, content: <RankingSlide title={labels.originals} data={data.rankings.originalAuthors} color="#07384a" labels={labels} /> },
    { id: "books", title: `${labels.ranking} · ${labels.translatedBooks} · ${labels.translations}`, content: <RankingSlide title={labels.translations} data={data.rankings.translatedBooks} color="#d59400" labels={labels} /> },
    { id: "translated-authors", title: `${labels.ranking} · ${labels.translatedAuthors} · ${labels.translations}`, content: <RankingSlide title={labels.translations} data={data.rankings.translatedAuthors ?? []} color="#b94160" labels={labels} /> },
    { id: "publishers", title: `${labels.ranking} · ${labels.originalPublishers} · ${labels.originals}`, content: <RankingSlide title={labels.originals} data={data.rankings.originalPublishers} color="#6d3b9e" labels={labels} /> },
    { id: "translators", title: `${labels.ranking} · ${labels.translators} · ${labels.translations} · ${languageTitle}`, content: <RankingSlide title={labels.translations} data={data.rankings.translators} color="#ff1d1d" labels={labels} /> },
    { id: "translation-publishers", title: `${labels.ranking} · ${labels.translationPublishers} · ${labels.translations} · ${languageTitle}`, content: <RankingSlide title={labels.translations} data={data.rankings.translationPublishers} color="#0f6b86" labels={labels} /> },
    { id: "pocket", title: `${labels.ranking} · ${labels.pocketReissues} · ${labels.originalAuthors}`, content: <RankingSlide title={labels.pocketReissues} data={data.rankings.pocketReissues} color="#d59400" labels={labels} /> },
    { id: "languages", title: `${labels.publicationLanguages} · ${labels.originals} / ${labels.translations}`, content: <LanguageBreakdownSlide data={data.languageBreakdown ?? []} labels={labels} /> },
    { id: "countries", title: `${labels.ranking} · ${labels.publicationCountries} · ${labels.dashboard}`, content: <RankingSlide title={labels.publicationCountries} data={data.rankings.publicationCountries} color="#6d3b9e" labels={labels} /> },
  ], [data, labels, languageTitle, period]);
  const current = slides[activeSlide] ?? slides[0];
  const navigateLanguage = (value: string) => { setLanguage(value); const params = new URLSearchParams(); if (value !== "__all__") params.set("language", value); window.location.assign(`${basePath}${params.size ? `?${params.toString()}` : ""}`); };
  const previous = () => setActiveSlide((value) => value === 0 ? slides.length - 1 : value - 1);
  const next = () => setActiveSlide((value) => value === slides.length - 1 ? 0 : value + 1);
  if (!current) return null;
  return <section className="mt-3 border border-[#6295a9] bg-[#cce8f1]/90 p-3 shadow-[2px_2px_0_rgba(0,43,112,0.2)] [@media(max-height:800px)]:mt-0 [@media(max-height:800px)]:p-2">
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#6295a9] pb-2"><h2 className="text-[19px] font-bold text-[#002b9e]">{labels.dashboard}</h2><div className="flex flex-wrap items-end gap-2"><label className="min-w-[190px] text-[12px] font-bold text-[#07384a]">{labels.language}<Select value={language} onValueChange={navigateLanguage}><SelectTrigger className="mt-1 h-9 rounded-none border-[#456f87] bg-white text-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">{labels.all}</SelectItem>{data.languageOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label><Dialog><DialogTrigger asChild><Button type="button" variant="outline" className="h-9 rounded-none border-[#456f87] bg-[#fffbd1] font-bold text-[#07384a] hover:bg-[#dceff5] hover:text-[#002b9e]">{labels.compareRecords}</Button></DialogTrigger><DialogContent className="max-h-[82dvh] max-w-[calc(100%-2rem)] overflow-y-auto border-[#456f87] bg-[#eaf6fa] p-5 sm:max-w-[920px]"><DialogHeader><DialogTitle className="text-[#002b9e]">{labels.compareRecords}</DialogTitle><DialogDescription className="text-[#315565]">{labels.compareDescription}</DialogDescription></DialogHeader><ComparativeStatisticsSelector candidates={candidates} initialType="books" initialIds={[]} comparisonPath={comparisonPath} labels={{ books: labels.books, persons: labels.persons, organizations: labels.organizations, search: labels.search, selected: labels.selected, maximum: labels.maximum, validate: labels.validate }} /></DialogContent></Dialog></div></div>
    <section aria-label={labels.carousel} className="mt-3 overflow-hidden border border-[#6295a9] bg-[#eaf6fa] [@media(max-height:800px)]:mt-2"><div className="border-b border-[#6295a9] bg-[#b5e0ee] px-4 py-2.5 [@media(max-height:800px)]:px-3 [@media(max-height:800px)]:py-1.5"><h3 className="text-[16px] font-bold text-[#07384a]">{current.title}</h3></div><div key={current.id} className="animate-in fade-in-0 duration-200 motion-reduce:animate-none">{current.content}</div></section>
    <nav aria-label={labels.carousel} className="mt-3 flex items-center justify-center gap-4 [@media(max-height:800px)]:mt-2"><Button type="button" variant="outline" size="icon-lg" aria-label={labels.previous} onClick={previous} className="border-[#456f87] bg-[#fffbd1] text-[#07384a] hover:bg-[#dceff5] hover:text-[#002b9e]"><ChevronLeft /></Button><span className="min-w-14 text-center text-[14px] font-bold tabular-nums text-[#07384a]">{activeSlide + 1} / {slides.length}</span><Button type="button" variant="outline" size="icon-lg" aria-label={labels.next} onClick={next} className="border-[#456f87] bg-[#fffbd1] text-[#07384a] hover:bg-[#dceff5] hover:text-[#002b9e]"><ChevronRight /></Button></nav>
  </section>;
}
