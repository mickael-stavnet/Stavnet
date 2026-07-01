"use client";

import { useTranslations } from "next-intl";
import BookDetailSecondaryLayout from "./book-detail-secondary-layout";
import type { BookAvailabilityRow, BookDetail } from "@/lib/data/books";

interface BookAvailabilityPageProps {
  book: BookDetail;
}

interface AvailabilityPageData {
  availabilitySectionTitle: string;
  availabilityColumns: {
    org: string;
    type: string;
    shelfmark: string;
    city: string;
    country: string;
    website: string;
  };
  availabilityRows: BookAvailabilityRow[];
}

function RedMarker() {
  return <span className="inline-block h-[10px] w-[10px] rounded-full border-2 border-[#ff1d1d]" />;
}

function AvailabilityTable({ pageData, rows }: { pageData: AvailabilityPageData; rows: BookAvailabilityRow[] }) {
  return (
    <section className="border border-[#7ea8b8] bg-[#a6d9eb]">
      <div className="space-y-3 p-3 md:hidden">
        {rows.map((row, rowIndex) => (
          <article key={`${row.org}-${rowIndex}`} className="rounded-[6px] border border-[#7ea8b8] bg-[#b6e2ef] p-3">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{pageData.availabilityColumns.org}</p>
              <div className="flex items-start gap-2 text-[14px] leading-[1.35] text-black">
                <RedMarker />
                <span className="break-words">{row.org || "—"}</span>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{pageData.availabilityColumns.type}</p>
                <p className="text-[14px] leading-[1.35] text-black">{row.type || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{pageData.availabilityColumns.shelfmark}</p>
                <p className="text-[14px] leading-[1.35] text-black">{row.shelfmark || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{pageData.availabilityColumns.city}</p>
                <p className="text-[14px] leading-[1.35] text-black">{row.city || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{pageData.availabilityColumns.country}</p>
                <p className="text-[14px] leading-[1.35] text-black">{row.country || "—"}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{pageData.availabilityColumns.website}</p>
              <p className="break-all text-[14px] leading-[1.35] text-black">{row.source || "—"}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="hidden border-b border-[#7ea8b8] bg-[#fff6bf] text-[10px] uppercase leading-[1.05] text-black md:grid md:grid-cols-[240px_95px_140px_105px_100px_1fr] md:text-[11px]">
        <div className="border-r border-[#7ea8b8] px-2 py-[2px]">{pageData.availabilityColumns.org}</div>
        <div className="border-r border-[#7ea8b8] px-2 py-[2px]">{pageData.availabilityColumns.type}</div>
        <div className="border-r border-[#7ea8b8] px-2 py-[2px]">{pageData.availabilityColumns.shelfmark}</div>
        <div className="border-r border-[#7ea8b8] px-2 py-[2px]">{pageData.availabilityColumns.city}</div>
        <div className="border-r border-[#7ea8b8] px-2 py-[2px]">{pageData.availabilityColumns.country}</div>
        <div className="px-2 py-[2px]">{pageData.availabilityColumns.website}</div>
      </div>
      {rows.map((row, rowIndex) => (
        <div key={`${row.org}-${rowIndex}`} className="hidden md:grid md:grid-cols-[240px_95px_140px_105px_100px_1fr]">
          <div className={`border-r border-[#7ea8b8] px-2 py-[5px] text-[15px] leading-[1.25] text-black ${rowIndex > 0 ? "border-t border-[#7ea8b8]" : ""}`}>
            <span className="flex min-w-0 items-center gap-2">
              <RedMarker />
              <span className="break-words">{row.org || "—"}</span>
            </span>
          </div>
          <div className={`border-r border-[#7ea8b8] px-2 py-[5px] text-[15px] leading-[1.25] text-black ${rowIndex > 0 ? "border-t border-[#7ea8b8]" : ""}`}>{row.type || "—"}</div>
          <div className={`border-r border-[#7ea8b8] px-2 py-[5px] text-[15px] leading-[1.25] text-black ${rowIndex > 0 ? "border-t border-[#7ea8b8]" : ""}`}>{row.shelfmark || "—"}</div>
          <div className={`border-r border-[#7ea8b8] px-2 py-[5px] text-[15px] leading-[1.25] text-black ${rowIndex > 0 ? "border-t border-[#7ea8b8]" : ""}`}>{row.city || "—"}</div>
          <div className={`border-r border-[#7ea8b8] px-2 py-[5px] text-[15px] leading-[1.25] text-black ${rowIndex > 0 ? "border-t border-[#7ea8b8]" : ""}`}>{row.country || "—"}</div>
          <div className={`px-2 py-[5px] text-[15px] leading-[1.25] text-black ${rowIndex > 0 ? "border-t border-[#7ea8b8]" : ""}`}>{row.source || "—"}</div>
        </div>
      ))}
    </section>
  );
}

export default function BookAvailabilityPage({ book }: BookAvailabilityPageProps) {
  const t = useTranslations("BookDetailsPage");
  const pageData = t.raw("pageData") as AvailabilityPageData;
  const availabilityRows = book.availability;

  return (
    <BookDetailSecondaryLayout book={book} pageName={t("tabs.availability")} pagePath="/books/details/availability">
      <div className="mb-[6px] pl-[8px] text-[14px] font-bold leading-none text-black md:text-[16px]">
        <span className="text-[#ff1d1d]">{availabilityRows.length}</span> <span>{pageData.availabilitySectionTitle}</span>
      </div>
      <AvailabilityTable pageData={pageData} rows={availabilityRows} />
    </BookDetailSecondaryLayout>
  );
}
