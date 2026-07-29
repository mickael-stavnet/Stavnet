"use client";

import { useMemo, useState } from "react";
import type { ComparisonCandidate, ComparisonType } from "@/components/stavnet/comparative-statistics-dashboard";

interface ComparativeStatisticsSelectorProps {
  candidates: Record<ComparisonType, ComparisonCandidate[]>;
  initialType: ComparisonType;
  initialIds: string[];
  comparisonPath: string;
  labels: { books: string; persons: string; organizations: string; search: string; selected: string; maximum: string; validate: string };
}

export function ComparativeStatisticsSelector({ candidates, initialType, initialIds, comparisonPath, labels }: ComparativeStatisticsSelectorProps) {
  const [type, setType] = useState<ComparisonType>(initialType);
  const [query, setQuery] = useState("");
  const [ids, setIds] = useState(initialIds);
  const visible = useMemo(() => candidates[type].filter((item) => item.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).slice(0, 18), [candidates, query, type]);
  const changeType = (nextType: ComparisonType) => { setType(nextType); setIds([]); setQuery(""); };
  const toggle = (id: string) => setIds((current) => current.includes(id) ? current.filter((value) => value !== id) : current.length < 5 ? [...current, id] : current);
  const submit = () => { const params = new URLSearchParams({ type }); if (ids.length > 0) params.set("ids", ids.join(",")); window.location.assign(`${comparisonPath}?${params.toString()}`); };

  return <section className="mt-[18px] border border-[#6295a9] bg-[#cce8f1]/85 p-[12px] shadow-[2px_2px_0_rgba(0,43,112,0.2)]">
    <div className="grid gap-2 md:grid-cols-3">{(["books", "persons", "organizations"] as const).map((itemType) => <button key={itemType} type="button" onClick={() => changeType(itemType)} className={`min-h-12 border border-[#456f87] px-3 text-[15px] font-bold ${type === itemType ? "bg-[#002b9e] text-white" : "bg-[#fffbd1] text-[#07384a]"}`}>{labels[itemType]}</button>)}</div>
    <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1.4fr]">
      <div><label className="text-[14px] font-bold text-[#07384a]" htmlFor="comparison-search">{labels.search}</label><input id="comparison-search" value={query} onChange={(event) => setQuery(event.target.value)} className="mt-1 h-10 w-full border border-[#456f87] bg-white px-3 text-black" /></div>
      <div className="border border-[#456f87] bg-[#fffbd1] px-3 py-2 text-[14px] text-[#07384a]">{labels.selected}: {ids.length}/5 · {labels.maximum}</div>
    </div>
    <div className="mt-3 grid max-h-[260px] gap-2 overflow-y-auto md:grid-cols-2">{visible.map((item) => <label key={item.id} className="flex min-h-10 items-center gap-2 border border-[#7ea8b8] bg-[#eaf6fa] px-3 text-[14px] font-semibold"><input type="checkbox" checked={ids.includes(item.id)} disabled={!ids.includes(item.id) && ids.length >= 5} onChange={() => toggle(item.id)} />{item.label}</label>)}</div>
    <button type="button" disabled={ids.length === 0} onClick={submit} className="mt-3 h-10 w-full border border-[#8f7610] bg-[#ffdf32] text-[15px] font-bold text-[#002b9e] disabled:cursor-not-allowed disabled:opacity-50">{labels.validate}</button>
  </section>;
}
