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
    validate: string;
  };
}

export function StatisticsExplorer({ filters, result, basePath, candidates, initialIds, comparisonPath, labels }: StatisticsExplorerProps) {
  const [form, setForm] = useState(filters);
  const item: ComparisonItem = { id: `explorer-${result.type}`, label: labels[result.type], statistics: result.statistics, primaryCount: result.primaryCount, secondaryCount: result.secondaryCount };

  function setType(type: ComparisonType) {
    setForm((current) => ({ ...current, type }));
  }

  function applyFilters() {
    const params = new URLSearchParams({ type: form.type });
    if (form.fromYear?.trim()) params.set("from", form.fromYear.trim());
    if (form.toYear?.trim()) params.set("to", form.toYear.trim());
    if (form.language?.trim()) params.set("language", form.language.trim());
    if (form.country?.trim()) params.set("country", form.country.trim());
    if (form.role?.trim()) params.set("role", form.role.trim());
    window.location.assign(`${basePath}?${params.toString()}`);
  }

  return <section className="mt-3 border border-[#6295a9] bg-[#cce8f1]/90 p-3 shadow-[2px_2px_0_rgba(0,43,112,0.2)]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#6295a9] pb-2"><div><h2 className="text-[19px] font-bold text-[#002b9e]">{labels.filters}</h2><p className="text-[13px] font-semibold text-[#315565]">{labels.records}: {result.totalRecords}</p></div><Dialog><DialogTrigger asChild><Button type="button" variant="outline" className="min-h-10 border-[#456f87] bg-[#fffbd1] font-bold text-[#07384a] hover:bg-[#dceff5] hover:text-[#002b9e]">{labels.compareRecords}</Button></DialogTrigger><DialogContent className="max-h-[82dvh] max-w-[calc(100%-2rem)] overflow-y-auto border-[#456f87] bg-[#eaf6fa] p-5 sm:max-w-[920px]"><DialogHeader><DialogTitle className="text-[#002b9e]">{labels.compareRecords}</DialogTitle><DialogDescription className="text-[#315565]">{labels.compareDescription}</DialogDescription></DialogHeader><ComparativeStatisticsSelector candidates={candidates} initialType={filters.type} initialIds={initialIds} comparisonPath={comparisonPath} labels={{ books: labels.books, persons: labels.persons, organizations: labels.organizations, search: labels.search, selected: labels.selected, maximum: labels.maximum, validate: labels.validate }} /></DialogContent></Dialog></div>
    <div className="mt-3 grid gap-3 xl:grid-cols-[300px_1fr_auto] xl:items-end">
      <div><p className="mb-1 text-[12px] font-bold text-[#07384a]">{labels.entityType}</p><div className="grid grid-cols-3 gap-2">{(["books", "persons", "organizations"] as const).map((type) => <Button key={type} type="button" variant="outline" onClick={() => setType(type)} className={`h-9 min-h-0 rounded-none border-[#456f87] px-2 text-[14px] font-bold ${form.type === type ? "bg-[#002b9e] text-white hover:bg-[#002b9e] hover:text-white" : "bg-[#fffbd1] text-[#07384a] hover:bg-[#dceff5] hover:text-[#07384a]"}`}>{labels[type]}</Button>)}</div></div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        <label className="text-[12px] font-bold text-[#07384a]">{labels.fromYear}<Input type="number" min="1500" max="2099" value={form.fromYear ?? ""} onChange={(event) => setForm((current) => ({ ...current, fromYear: event.target.value }))} className="mt-1 h-9 rounded-none border-[#456f87] bg-white text-black" /></label>
        <label className="text-[12px] font-bold text-[#07384a]">{labels.toYear}<Input type="number" min="1500" max="2099" value={form.toYear ?? ""} onChange={(event) => setForm((current) => ({ ...current, toYear: event.target.value }))} className="mt-1 h-9 rounded-none border-[#456f87] bg-white text-black" /></label>
        <label className="text-[12px] font-bold text-[#07384a]">{labels.language}<Select value={form.language || "__all__"} onValueChange={(value) => setForm((current) => ({ ...current, language: value === "__all__" ? "" : value }))}><SelectTrigger className="mt-1 h-9 w-full rounded-none border-[#456f87] bg-white text-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">{labels.all}</SelectItem>{result.filterOptions.languages.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>
        <label className="text-[12px] font-bold text-[#07384a]">{labels.country}<Select value={form.country || "__all__"} onValueChange={(value) => setForm((current) => ({ ...current, country: value === "__all__" ? "" : value }))}><SelectTrigger className="mt-1 h-9 w-full rounded-none border-[#456f87] bg-white text-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">{labels.all}</SelectItem>{result.filterOptions.countries.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>
        <label className="text-[12px] font-bold text-[#07384a]">{labels.role}<Select value={form.role || "__all__"} onValueChange={(value) => setForm((current) => ({ ...current, role: value === "__all__" ? "" : value }))}><SelectTrigger className="mt-1 h-9 w-full rounded-none border-[#456f87] bg-white text-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__all__">{labels.all}</SelectItem>{result.filterOptions.roles.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>
      </div>
      <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => window.location.assign(basePath)} className="h-9 border-[#456f87] bg-[#fffbd1] px-3 text-[#07384a] hover:bg-[#dceff5] hover:text-[#07384a]">{labels.clear}</Button><Button type="button" onClick={applyFilters} className="h-9 border border-[#8f7610] bg-[#ffdf32] px-3 text-[#002b9e] hover:bg-[#ffe96a]">{labels.apply}</Button></div>
    </div>
    <ComparativeStatisticsDashboard compact items={[item]} coverage={{ ...result.coverage, total: result.totalRecords }} labels={{ dashboard: labels.dashboard, timeline: labels.timeline, table: labels.table, primary: labels.primary, secondary: labels.secondary, index: labels.index, noData: labels.noData, languages: labels.languages, countries: labels.countries, roles: labels.roles, previous: labels.previous, next: labels.next, carousel: labels.carousel, coverage: labels.coverage }} />
  </section>;
}
