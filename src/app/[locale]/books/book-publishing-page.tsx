"use client";

import { useTranslations } from "next-intl";
import BookDetailSecondaryLayout from "./book-detail-secondary-layout";
import type { BookDetail, BookPublishingRow, BookPublishingStat } from "@/lib/data/books";

interface BookPublishingPageProps {
  book: BookDetail;
}

interface PublishingPageData {
  publishingColumns: {
    status: string;
    language: string;
    title: string;
    publisher: string;
    year: string;
    edition: string;
    publication: string;
  };
}

function getPublishingStatLabel(t: ReturnType<typeof useTranslations<"BookDetailsPage">>, label: BookPublishingStat["label"]): string {
  if (label === "languages") {
    return "Langues de parution";
  }

  if (label === "original") {
    return "Titres originaux parus";
  }

  return "Titres traduits parus";
}

function RedMarker() {
  return <span className="inline-block h-[10px] w-[10px] rounded-full border-2 border-[#ff1d1d]" />;
}

function PublishingSummary({ stats, t }: { stats: BookPublishingStat[]; t: ReturnType<typeof useTranslations<"BookDetailsPage">> }) {
  return (
    <div className="space-y-[4px] pl-[6px] text-[14px] font-bold leading-none text-black md:text-[16px]">
      {stats.map((item) => (
        <div key={`${item.count}-${item.label}`} className="flex items-center gap-[6px]">
          <span className="text-[#ff1d1d]">{item.count}</span>
          <span>{getPublishingStatLabel(t, item.label)}</span>
        </div>
      ))}
    </div>
  );
}

function PublishingTable({ pageData, rows }: { pageData: PublishingPageData; rows: BookPublishingRow[] }) {
  return (
    <section className="overflow-hidden rounded-[8px] border border-[#7ea8b8] bg-[#a6d9eb]">
      <div className="space-y-3 p-3 md:hidden">
        {rows.map((row, rowIndex) => (
          <article key={`${row.language}-${row.publisher}-${rowIndex}`} className="rounded-[6px] border border-[#7ea8b8] bg-[#b6e2ef] p-3">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{pageData.publishingColumns.language}</p>
              <div className="flex items-start gap-2 text-[14px] leading-[1.35] text-black">
                <RedMarker />
                <span className="break-words">{row.language || "—"}</span>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{pageData.publishingColumns.title}</p>
              <p className="text-[14px] leading-[1.35] text-black">{row.title || "—"}</p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{pageData.publishingColumns.publisher}</p>
                <p className="text-[14px] leading-[1.35] text-black">{row.publisher || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{pageData.publishingColumns.year}</p>
                <p className="text-[14px] leading-[1.35] text-black">{row.year || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{pageData.publishingColumns.edition}</p>
                <p className="text-[14px] leading-[1.35] text-black">{row.edition || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{pageData.publishingColumns.publication}</p>
                <p className="text-[14px] leading-[1.35] text-black">{row.publication || "—"}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="hidden border-b border-[#7ea8b8] bg-[#fff6bf] text-[10px] uppercase leading-[1.05] text-black md:grid md:grid-cols-[42px_156px_minmax(0,1fr)_130px_62px_54px_74px] md:text-[11px]">
        <div className="border-r border-[#7ea8b8] px-2 py-[2px]">{pageData.publishingColumns.status}</div>
        <div className="border-r border-[#7ea8b8] px-2 py-[2px]">{pageData.publishingColumns.language}</div>
        <div className="border-r border-[#7ea8b8] px-2 py-[2px]">{pageData.publishingColumns.title}</div>
        <div className="border-r border-[#7ea8b8] px-2 py-[2px]">{pageData.publishingColumns.publisher}</div>
        <div className="border-r border-[#7ea8b8] px-2 py-[2px]">{pageData.publishingColumns.year}</div>
        <div className="border-r border-[#7ea8b8] px-2 py-[2px]">{pageData.publishingColumns.edition}</div>
        <div className="px-2 py-[2px]">{pageData.publishingColumns.publication}</div>
      </div>
        {rows.map((row, rowIndex) => (
        <div key={`${row.language}-${row.publisher}-${rowIndex}`} className="hidden md:grid md:grid-cols-[42px_156px_minmax(0,1fr)_130px_62px_54px_74px]">
          <div className={`border-r border-[#7ea8b8] px-2 py-[5px] text-[15px] leading-[1.2] text-black ${rowIndex > 0 ? "border-t border-[#7ea8b8]" : ""}`}>
            <span className="flex items-center justify-center">
              <RedMarker />
            </span>
          </div>
          <div className={`border-r border-[#7ea8b8] px-2 py-[5px] text-[15px] leading-[1.2] text-black ${rowIndex > 0 ? "border-t border-[#7ea8b8]" : ""}`}>{row.language || "—"}</div>
          <div className={`border-r border-[#7ea8b8] px-2 py-[5px] text-[15px] leading-[1.2] text-black ${rowIndex > 0 ? "border-t border-[#7ea8b8]" : ""}`}>{row.title || "—"}</div>
          <div className={`border-r border-[#7ea8b8] px-2 py-[5px] text-[15px] leading-[1.2] text-black ${rowIndex > 0 ? "border-t border-[#7ea8b8]" : ""}`}>{row.publisher || "—"}</div>
          <div className={`border-r border-[#7ea8b8] px-2 py-[5px] text-[15px] leading-[1.2] text-black ${rowIndex > 0 ? "border-t border-[#7ea8b8]" : ""}`}>{row.year || "—"}</div>
          <div className={`border-r border-[#7ea8b8] px-2 py-[5px] text-[15px] leading-[1.2] text-black ${rowIndex > 0 ? "border-t border-[#7ea8b8]" : ""}`}>{row.edition || "—"}</div>
          <div className={`px-2 py-[5px] text-[15px] leading-[1.2] text-black ${rowIndex > 0 ? "border-t border-[#7ea8b8]" : ""}`}>{row.publication || "—"}</div>
        </div>
      ))}
    </section>
  );
}

export default function BookPublishingPage({ book }: BookPublishingPageProps) {
  const t = useTranslations("BookDetailsPage");
  const pageData = t.raw("pageData") as PublishingPageData;
  const publishingRows = book.publishing;

  return (
    <BookDetailSecondaryLayout book={book} pageName={t("tabs.publishing")} pagePath="/books/details/publishing">
      <section className="grid min-w-0 gap-[8px] md:ml-[4px] md:w-[1402px] md:max-w-none md:grid-cols-[282px_1fr] md:items-start">
        <PublishingSummary stats={book.publishingStats} t={t} />
        <PublishingTable pageData={pageData} rows={publishingRows} />
      </section>
    </BookDetailSecondaryLayout>
  );
}
