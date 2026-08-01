"use client";

import { useMemo, useRef, useState, useTransition, type UIEvent } from "react";
import { BookOpen, Building2, Check, Loader2, Search, Users, X } from "lucide-react";
import { loadComparisonCandidatesPageAction, type ComparisonCandidatePage } from "@/actions/load-comparison-candidates";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ComparisonCandidate, ComparisonType } from "@/components/stavnet/comparative-statistics-dashboard";

interface ComparativeStatisticsSelectorProps {
  candidates: Record<ComparisonType, ComparisonCandidate[]>;
  candidatePages: Record<ComparisonType, Omit<ComparisonCandidatePage, "items">>;
  initialType: ComparisonType;
  initialIds: string[];
  comparisonPath: string;
  labels: {
    books: string;
    persons: string;
    organizations: string;
    search: string;
    selected: string;
    maximum: string;
    validate: string;
    clearSelection: string;
    noResults: string;
  };
}

const entityTypes: ComparisonType[] = ["books", "persons", "organizations"];

const entityIcons = {
  books: BookOpen,
  persons: Users,
  organizations: Building2,
};

export function ComparativeStatisticsSelector({ candidates, candidatePages, initialType, initialIds, comparisonPath, labels }: ComparativeStatisticsSelectorProps) {
  const [type, setType] = useState<ComparisonType>(initialType);
  const [query, setQuery] = useState("");
  const [ids, setIds] = useState(initialIds);
  const [itemsByType, setItemsByType] = useState(candidates);
  const [pagesByType, setPagesByType] = useState(candidatePages);
  const [loadingType, setLoadingType] = useState<ComparisonType | null>(null);
  const loadingTypes = useRef(new Set<ComparisonType>());
  const [, startTransition] = useTransition();
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visible = useMemo(() => itemsByType[type]
    .filter((item) => item.label.toLocaleLowerCase().includes(normalizedQuery))
    .sort((left, right) => Number(ids.includes(right.id)) - Number(ids.includes(left.id)) || left.label.localeCompare(right.label)), [ids, itemsByType, normalizedQuery, type]);
  const selectedItems = useMemo(() => ids.flatMap((id) => {
    const item = itemsByType[type].find((candidate) => candidate.id === id);
    return item ? [item] : [];
  }), [ids, itemsByType, type]);
  const isLoading = loadingType === type;

  function loadNextPage() {
    const page = pagesByType[type];
    if (loadingTypes.current.has(type) || page.page >= page.totalPages) return;
    loadingTypes.current.add(type);
    setLoadingType(type);
    startTransition(async () => {
      try {
        const result = await loadComparisonCandidatesPageAction(type, page.page + 1);
        setItemsByType((current) => ({ ...current, [type]: [...current[type], ...result.items.filter((item) => !current[type].some((candidate) => candidate.id === item.id))] }));
        setPagesByType((current) => ({ ...current, [type]: { page: result.page, total: result.total, totalPages: result.totalPages } }));
      } finally {
        loadingTypes.current.delete(type);
        setLoadingType((current) => current === type ? null : current);
      }
    });
  }

  function handleListScroll(event: UIEvent<HTMLDivElement>) {
    const container = event.currentTarget;
    if (container.scrollHeight - container.scrollTop - container.clientHeight < 96) loadNextPage();
  }

  function changeType(nextType: ComparisonType) {
    setType(nextType);
    setIds([]);
    setQuery("");
  }

  function toggle(id: string) {
    setIds((current) => current.includes(id) ? current.filter((value) => value !== id) : current.length < 5 ? [...current, id] : current);
  }

  function submit() {
    const params = new URLSearchParams({ type });
    if (ids.length > 0) params.set("ids", ids.join(","));
    window.location.assign(`${comparisonPath}?${params.toString()}`);
  }

  return <section className="flex min-h-0 flex-1 flex-col bg-[#cce8f1]/85">
    <div className="shrink-0 border-b border-[#6295a9] px-4 py-3 sm:px-5">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="group">
        {entityTypes.map((itemType) => {
          const Icon = entityIcons[itemType];
          const isActive = type === itemType;
          return <Button key={itemType} type="button" variant="outline" aria-pressed={isActive} onClick={() => changeType(itemType)} className={cn("min-h-11 justify-start gap-3 rounded-none border-[#456f87] px-4 text-[15px] font-bold shadow-none", isActive ? "bg-[#002b9e] text-white hover:bg-[#002b9e] hover:text-white" : "bg-[#fffbd1] text-[#07384a] hover:bg-[#dceff5] hover:text-[#002b9e]")}>
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span>{labels[itemType]}</span>
            <span className={cn("ms-auto rounded-full px-2 py-0.5 text-xs tabular-nums", isActive ? "bg-white/15 text-white" : "bg-[#dceff5] text-[#315565]")}>{pagesByType[itemType].total}</span>
          </Button>;
        })}
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(310px,.82fr)]">
        <div>
          <label className="block text-sm font-bold text-[#07384a]" htmlFor="comparison-search">{labels.search}</label>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#315565]" aria-hidden="true" />
            <Input id="comparison-search" value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 rounded-lg border-[#9fc3d0] bg-white ps-10 text-[15px] text-[#07384a] placeholder:text-[#607985] focus-visible:border-[#002b9e] focus-visible:ring-[#002b9e]/25" />
          </div>
        </div>
        <aside aria-live="polite" className="flex min-h-11 items-center gap-2 border-b border-[#6295a9] px-1 text-[#07384a]">
          <p className="text-sm font-bold">{labels.selected} <span className="border border-[#002b9e] bg-[#002b9e] px-1.5 py-0.5 text-xs tabular-nums text-white">{ids.length}/5</span></p>
          {ids.length > 0 ? <Button type="button" variant="ghost" onClick={() => setIds([])} className="ms-auto h-8 rounded-none px-2 text-xs font-bold text-[#002b9e] hover:bg-[#dceff5] hover:text-[#002b9e]">{labels.clearSelection}</Button> : <span className="ms-auto text-xs text-[#315565]">{labels.maximum}</span>}
          {selectedItems.length > 0 ? <div className="mt-2 flex flex-wrap gap-1.5">{selectedItems.map((item) => <button key={item.id} type="button" onClick={() => toggle(item.id)} className="inline-flex min-h-7 max-w-full items-center gap-1 rounded-md border border-[#9fc3d0] bg-white px-2 text-xs font-semibold text-[#07384a] transition-colors hover:border-[#002b9e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002b9e]">
            <span className="truncate">{item.label}</span><X className="size-3 shrink-0" aria-hidden="true" />
          </button>)}</div> : null}
        </aside>
      </div>
    </div>
    <div className="min-h-0 flex-1 px-4 py-3 sm:px-5">
      {visible.length > 0 ? <div onScroll={handleListScroll} aria-busy={isLoading} className="grid max-h-[min(42dvh,390px)] grid-cols-1 content-start gap-2 overflow-y-auto pe-1 sm:grid-cols-2">
        {visible.map((item) => {
          const isSelected = ids.includes(item.id);
          const isUnavailable = !isSelected && ids.length >= 5;
          return <label key={item.id} className={cn("flex min-h-11 cursor-pointer items-center gap-3 border px-3 py-2 text-sm font-semibold", isSelected ? "border-[#002b9e] bg-[#dceff5] text-[#002b9e]" : "border-[#7ea8b8] bg-[#eaf6fa] text-[#07384a] hover:border-[#456f87] hover:bg-white", isUnavailable && "cursor-not-allowed opacity-50")}>
            <Checkbox checked={isSelected} disabled={isUnavailable} onCheckedChange={() => toggle(item.id)} className="size-5 rounded-md border-[#456f87] data-checked:border-[#002b9e] data-checked:bg-[#002b9e]" />
            <span className="min-w-0 leading-snug">{item.label}</span>
            {isSelected ? <Check className="ms-auto size-4 shrink-0" aria-hidden="true" /> : null}
          </label>;
        })}
        {isLoading ? <div className="col-span-full flex min-h-11 items-center justify-center border border-[#7ea8b8] bg-[#eaf6fa] text-[#315565]"><Loader2 className="size-4 animate-spin" aria-hidden="true" /></div> : null}
      </div> : <p className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-[#9fc3d0] bg-white px-5 text-center text-sm font-semibold text-[#315565]">{labels.noResults}</p>}
    </div>
    <div className="shrink-0 border-t border-[#6295a9] bg-[#cce8f1] px-4 py-3 sm:px-5">
      <Button type="button" disabled={ids.length === 0} onClick={submit} className="min-h-11 w-full rounded-none border border-[#8f7610] bg-[#ffdf32] px-5 text-[15px] font-bold text-[#002b9e] hover:bg-[#ffe767] disabled:bg-[#e5df9d] disabled:text-[#52677a] disabled:opacity-100">{labels.validate}</Button>
    </div>
  </section>;
}
