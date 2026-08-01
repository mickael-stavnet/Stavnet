"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ComparativeStatisticsSelector } from "@/components/stavnet/comparative-statistics-selector";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComparativeStatisticsDashboard, type ComparisonCandidate, type ComparisonItem, type ComparisonType } from "@/components/stavnet/comparative-statistics-dashboard";
import type { ExplorerStatisticsFilters, ExplorerStatisticsResult } from "@/lib/explorer-statistics";

interface StatisticsExplorerProps {
  filters: ExplorerStatisticsFilters;
  result: ExplorerStatisticsResult;
  basePath: string;
  candidates: Record<ComparisonType, ComparisonCandidate[]>;
  initialIds: string[];
  comparisonPath: string;
  labels: {
    books: string;
    persons: string;
    organizations: string;
    filters: string;
    entityType: string;
    all: string;
    fromYear: string;
    toYear: string;
    language: string;
    country: string;
    role: string;
    apply: string;
    clear: string;
    records: string;
    coverage: string;
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
    compareRecords: string;
    compareDescription: string;
    search: string;
    selected: string;
    maximum: string;
    summary: string;
    period: string;
    peak: string;
    trend: string;
    distinctLanguages: string;
    distinctCountries: string;
    distinctRoles: string;
    distribution: string;
    publishers: string;
    associatedOrganizations: string;
    publishedAuthors: string;
    originals: string;
    translations: string;
    relatedTitles: string;
    linkedPeople: string;
    publishedTitles: string;
    validate: string;
    clearSelection: string;
    noResults: string;
  };
}

export function StatisticsExplorer({ filters, result, basePath, candidates, initialIds, comparisonPath, labels }: StatisticsExplorerProps) {
  const [form, setForm] = useState(filters);
  const item: ComparisonItem = { id: `explorer-${result.type}`, label: labels[result.type], statistics: result.statistics, primaryCount: result.primaryCount, secondaryCount: result.secondaryCount };
  const summary = result.summary ?? { periodStart: "", periodEnd: "", peakPeriod: "", peakValue: 0, trend: null, distinctLanguages: 0, distinctCountries: 0, distinctRoles: 0 };
  const metricKind = result.metricKind ?? (result.type === "books" ? { primary: "originals" as const, secondary: "translations" as const } : result.type === "persons" ? { primary: "relatedTitles" as const, secondary: "linkedPeople" as const } : { primary: "publishedTitles" as const, secondary: "publishedAuthors" as const });
  const focus = result.focus ?? { kind: result.type === "books" ? "publishers" as const : result.type === "persons" ? "organizations" as const : "authors" as const, distribution: [], coverage: 0 };
  const metricLabels = { primary: labels[metricKind.primary], secondary: labels[metricKind.secondary] };
  const focusTitle = focus.kind === "publishers" ? labels.publishers : focus.kind === "organizations" ? labels.associatedOrganizations : labels.publishedAuthors;
  const trend = summary.trend === null || !Number.isFinite(summary.trend) ? "—" : `${summary.trend > 0 ? "+" : ""}${summary.trend}%`;

  function navigate(next: ExplorerStatisticsFilters) {
    const params = new URLSearchParams({ type: next.type });
    if (next.fromYear?.trim()) params.set("from", next.fromYear.trim());
    if (next.toYear?.trim()) params.set("to", next.toYear.trim());
    if (next.language?.trim()) params.set("language", next.language.trim());
    if (next.country?.trim()) params.set("country", next.country.trim());
    if (next.role?.trim()) params.set("role", next.role.trim());
    window.location.assign(`${basePath}?${params.toString()}`);
  }

  function updateFilter(next: Partial<ExplorerStatisticsFilters>) {
    const updated = { ...form, ...next };
    setForm(updated);
    navigate(updated);
  }

  function updateYear(key: "fromYear" | "toYear", value: string) {
    const updated = { ...form, [key]: value };
    setForm(updated);
    if (!value || /^\d{4}$/.test(value)) navigate(updated);
  }

  return <section className="mt-3 border border-[#6295a9] bg-[#cce8f1]/90 p-3 shadow-[2px_2px_0_rgba(0,43,112,0.2)]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#6295a9] pb-2"><div><h2 className="text-[19px] font-bold text-[#002b9e]">{labels.filters}</h2><p className="text-[13px] font-semibold text-[#315565]">{labels.records}: {result.totalRecords}</p></div><Dialog><DialogTrigger asChild><Button type="button" variant="outline" className="min-h-10 rounded-lg border-[#456f87] bg-[#fffbd1] font-bold text-[#07384a] shadow-none hover:bg-[#dceff5] hover:text-[#002b9e]">{labels.compareRecords}</Button></DialogTrigger><DialogContent className="flex max-h-[calc(100dvh-1rem)] w-[min(94vw,1040px)] max-w-none flex-col gap-0 overflow-hidden rounded-2xl border-[#6295a9] bg-[#f4fbfd] p-0 shadow-[0_24px_70px_rgba(7,56,74,0.25)] sm:max-h-[min(760px,calc(100dvh-3rem))] sm:max-w-none"><DialogHeader className="shrink-0 border-b border-[#b7d3dd] bg-white px-4 py-5 pe-12 text-start sm:px-6"><DialogTitle className="text-xl font-bold text-[#002b9e]">{labels.compareRecords}</DialogTitle><DialogDescription className="mt-1 text-sm leading-relaxed text-[#315565]">{labels.compareDescription}</DialogDescription></DialogHeader><ComparativeStatisticsSelector candidates={candidates} initialType={filters.type} initialIds={initialIds} comparisonPath={comparisonPath} labels={{ books: labels.books, persons: labels.persons, organizations: labels.organizations, search: labels.search, selected: labels.selected, maximum: labels.maximum, validate: labels.validate, clearSelection: labels.clearSelection, noResults: labels.noResults }} /></DialogContent></Dialog></div>
    <div className="mt-3 grid gap-3 xl:grid-cols-[300px_1fr] xl:items-end">
      <div><p className="mb-1 text-[12px] font-bold text-[#07384a]">{labels.entityType}</p><div className="grid grid-cols-3 gap-2">{(["books", "persons", "organizations"] as const).map((type) => <Button key={type} type="button" variant="outline" onClick={() => updateFilter({ type })} className={`h-9 min-h-0 rounded-none border-[#456f87] px-2 text-[14px] font-bold ${form.type === type ? "bg-[#002b9e] text-white hover:bg-[#002b9e] hover:text-white" : "bg-[#fffbd1] text-[#07384a] hover:bg-[#dceff5] hover:text-[#07384a]"}`}>{labels[type]}</Button>)}</div></div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        <label className="text-[12px] font-bold text-[#07384a]">{labels.fromYear}<Input type="number" min="1500" max="2099" value={form.fromYear ?? ""} onChange={(event) => updateYear("fromYear", event.target.value)} className="mt-1 h-9 rounded-none border-[#456f87] bg-white text-black" /></label>
        <label className="text-[12px] font-bold text-[#07384a]">{labels.toYear}<Input type="number" min="1500" max="2099" value={form.toYear ?? ""} onChange={(event) => updateYear("toYear", event.target.value)} className="mt-1 h-9 rounded-none border-[#456f87] bg-white text-black" /></label>
        <label className="text-[12px] font-bold text-[#07384a]">{labels.language}<Select value={form.language || "__all__"} onValueChange={(value) => updateFilter({ language: value === "__all__" ? "" : value })}><SelectTrigger className="mt-1 h-9 w-full rounded-none border-[#456f87] bg-white text-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">{labels.all}</SelectItem>{result.filterOptions.languages.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>
        <label className="text-[12px] font-bold text-[#07384a]">{labels.country}<Select value={form.country || "__all__"} onValueChange={(value) => updateFilter({ country: value === "__all__" ? "" : value })}><SelectTrigger className="mt-1 h-9 w-full rounded-none border-[#456f87] bg-white text-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">{labels.all}</SelectItem>{result.filterOptions.countries.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>
        <label className="text-[12px] font-bold text-[#07384a]">{labels.role}<Select value={form.role || "__all__"} onValueChange={(value) => updateFilter({ role: value === "__all__" ? "" : value })}><SelectTrigger className="mt-1 h-9 w-full rounded-none border-[#456f87] bg-white text-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">{labels.all}</SelectItem>{result.filterOptions.roles.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>
      </div>
    </div>
    <section aria-label={labels.summary} className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6"><div className="border border-[#6295a9] bg-[#eaf6fa] px-3 py-2"><p className="text-[11px] font-bold uppercase tracking-wide text-[#315565]">{labels.records}</p><p className="mt-0.5 text-[20px] font-bold leading-none text-[#002b9e]">{result.totalRecords}</p></div><div className="border border-[#6295a9] bg-[#eaf6fa] px-3 py-2"><p className="text-[11px] font-bold uppercase tracking-wide text-[#315565]">{labels.period}</p><p className="mt-0.5 text-[15px] font-bold leading-none text-[#07384a]">{summary.periodStart ? `${summary.periodStart}–${summary.periodEnd}` : "—"}</p></div><div className="border border-[#6295a9] bg-[#eaf6fa] px-3 py-2"><p className="text-[11px] font-bold uppercase tracking-wide text-[#315565]">{labels.peak}</p><p className="mt-0.5 text-[15px] font-bold leading-none text-[#07384a]">{summary.peakPeriod ? `${summary.peakPeriod} · ${summary.peakValue}` : "—"}</p></div><div className="border border-[#6295a9] bg-[#eaf6fa] px-3 py-2"><p className="text-[11px] font-bold uppercase tracking-wide text-[#315565]">{labels.trend}</p><p className="mt-0.5 text-[20px] font-bold leading-none text-[#002b9e]">{trend}</p></div><div className="border border-[#6295a9] bg-[#eaf6fa] px-3 py-2"><p className="text-[11px] font-bold uppercase tracking-wide text-[#315565]">{labels.distinctLanguages}</p><p className="mt-0.5 text-[20px] font-bold leading-none text-[#002b9e]">{summary.distinctLanguages}</p></div><div className="border border-[#6295a9] bg-[#eaf6fa] px-3 py-2"><p className="text-[11px] font-bold uppercase tracking-wide text-[#315565]">{labels.distinctCountries} · {labels.distinctRoles}</p><p className="mt-0.5 text-[20px] font-bold leading-none text-[#002b9e]">{summary.distinctCountries} · {summary.distinctRoles}</p></div></section>
    <ComparativeStatisticsDashboard compact items={[item]} metricLabels={metricLabels} focus={{ title: focusTitle, data: focus.distribution, coverage: focus.coverage }} coverage={{ ...result.coverage, total: result.totalRecords }} labels={{ dashboard: labels.dashboard, timeline: labels.timeline, table: labels.table, primary: labels.distribution, secondary: labels.secondary, index: labels.index, noData: labels.noData, languages: labels.languages, countries: labels.countries, roles: labels.roles, previous: labels.previous, next: labels.next, carousel: labels.carousel, coverage: labels.coverage }} />
  </section>;
}
