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
    <section className="min-h-0 overflow-hidden rounded-[8px] border border-[#7ea8b8] bg-[#a6d9eb] md:h-full md:overflow-y-auto">
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
      <div className="hidden md:block">
        <table className="w-full table-fixed border-collapse bg-[#a6d9eb] text-black">
          <colgroup>
            <col style={{ width: "42px" }} />
            <col style={{ width: "156px" }} />
            <col />
            <col style={{ width: "130px" }} />
            <col style={{ width: "62px" }} />
            <col style={{ width: "54px" }} />
            <col style={{ width: "74px" }} />
          </colgroup>
          <thead>
            <tr className="bg-[#fff6bf] text-[10px] uppercase leading-[1.05] text-black md:text-[11px]">
              <th className="border border-[#7ea8b8] px-2 py-[2px] text-left font-normal">{pageData.publishingColumns.status}</th>
              <th className="border border-[#7ea8b8] px-2 py-[2px] text-left font-normal">{pageData.publishingColumns.language}</th>
              <th className="border border-[#7ea8b8] px-2 py-[2px] text-left font-normal">{pageData.publishingColumns.title}</th>
              <th className="border border-[#7ea8b8] px-2 py-[2px] text-left font-normal">{pageData.publishingColumns.publisher}</th>
              <th className="border border-[#7ea8b8] px-2 py-[2px] text-left font-normal">{pageData.publishingColumns.year}</th>
              <th className="border border-[#7ea8b8] px-2 py-[2px] text-left font-normal">{pageData.publishingColumns.edition}</th>
              <th className="border border-[#7ea8b8] px-2 py-[2px] text-left font-normal">{pageData.publishingColumns.publication}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${row.language}-${row.publisher}-${rowIndex}`}>
                <td className="border border-[#7ea8b8] px-2 py-[5px] align-middle text-[15px] leading-[1.2]">
                  <span className="flex items-center justify-center">
                    <RedMarker />
                  </span>
                </td>
                <td className="border border-[#7ea8b8] px-2 py-[5px] align-middle text-[15px] leading-[1.2]">{row.language || "—"}</td>
                <td className="border border-[#7ea8b8] px-2 py-[5px] align-middle text-[15px] leading-[1.2]">{row.title || "—"}</td>
                <td className="border border-[#7ea8b8] px-2 py-[5px] align-middle text-[15px] leading-[1.2]">{row.publisher || "—"}</td>
                <td className="border border-[#7ea8b8] px-2 py-[5px] align-middle text-[15px] leading-[1.2]">{row.year || "—"}</td>
                <td className="border border-[#7ea8b8] px-2 py-[5px] align-middle text-[15px] leading-[1.2]">{row.edition || "—"}</td>
                <td className="border border-[#7ea8b8] px-2 py-[5px] align-middle text-[15px] leading-[1.2]">{row.publication || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function BookPublishingPage({ book }: BookPublishingPageProps) {
  const t = useTranslations("BookDetailsPage");
  const pageData = t.raw("pageData") as PublishingPageData;
  const publishingRows = book.publishing;

  return (
    <BookDetailSecondaryLayout book={book} pageName={t("tabs.publishing")} pagePath="/books/details/publishing" layout={publishingRows.length > 0 ? "default" : "expandedCentered"}>
      {publishingRows.length === 0 ? null : <section className="grid min-w-0 flex-1 gap-[8px] md:grid-cols-[230px_minmax(0,1fr)] md:items-stretch">
        <PublishingSummary stats={book.publishingStats} t={t} />
        <PublishingTable pageData={pageData} rows={publishingRows} />
      </section>}
    </BookDetailSecondaryLayout>
  );
}
