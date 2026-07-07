"use client";

import { useTranslations } from "next-intl";
import BookDetailSecondaryLayout from "./book-detail-secondary-layout";
import type { BookDetail } from "@/lib/data/books";

interface BookPressCritiquesPageProps {
  book: BookDetail;
}

interface PressRow {
  sourceTitle: string;
  excerpt: string;
}

interface PressPageData {
  pressSectionTitle: string;
  pressColumns: {
    source: string;
    extracts: string;
  };
  pressRows: PressRow[];
}

function RedMarker() {
  return <span className="inline-block h-[10px] w-[10px] rounded-full border-2 border-[#ff1d1d]" />;
}

function PressExtractsTable({
  rows,
  sourceLabel,
  extractsLabel,
}: {
  rows: string[][];
  sourceLabel: string;
  extractsLabel: string;
}) {
  return (
    <section className="border border-[#7ea8b8] bg-[#a6d9eb]">
      <div className="space-y-3 p-3 md:hidden">
        {rows.map((row, rowIndex) => {
          const sourceLines = row[0]?.split("\n") ?? [];
          return (
            <article key={`${rowIndex}-${row[0]}`} className="rounded-[6px] border border-[#7ea8b8] bg-[#b6e2ef] p-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{sourceLabel}</p>
                <div className="text-[14px] leading-[1.35] text-black">
                  <div className="flex items-start gap-2">
                    <RedMarker />
                    <div className="min-w-0">
                      {sourceLines.map((line, lineIndex) => (
                        <div key={`${line}-${lineIndex}`} className={lineIndex === 0 ? "font-bold" : ""}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{extractsLabel}</p>
                <p className="text-[14px] leading-[1.45] text-black">{row[1] || "—"}</p>
              </div>
            </article>
          );
        })}
      </div>
      <div className="hidden md:block">
        <table className="w-full table-fixed border-collapse bg-[#a6d9eb] text-black">
          <colgroup>
            <col style={{ width: "280px" }} />
            <col />
          </colgroup>
          <thead>
            <tr className="bg-[#fff6bf] text-[10px] uppercase leading-[1.05] text-black md:text-[11px]">
              <th className="border border-[#7ea8b8] px-2 py-[2px] text-left font-normal">{sourceLabel}</th>
              <th className="border border-[#7ea8b8] px-2 py-[2px] text-left font-normal">{extractsLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${rowIndex}-${row[0]}`}>
                <td className="border border-[#7ea8b8] px-2 py-[6px] align-top text-[15px] leading-[1.35]">
                  {row[0].split("\n").map((line, lineIndex) => (
                    <div key={`${line}-${lineIndex}`} className={lineIndex === 0 ? "font-bold" : ""}>
                      {line}
                    </div>
                  ))}
                </td>
                <td className="border border-[#7ea8b8] px-2 py-[6px] align-top text-[15px] leading-[1.35]">{row[1] || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function BookPressCritiquesPage({ book }: BookPressCritiquesPageProps) {
  const t = useTranslations("BookDetailsPage");
  const pageData = t.raw("pageData") as PressPageData;
  const pressRows: PressRow[] = book.pressReviews.map((review) => {
    const sourceLines = [review.authorName, [review.sourceName, review.sourceDate].filter((value) => value.length > 0).join(", ")]
      .filter((value) => value.length > 0)
      .join("\n");

    return {
      sourceTitle: sourceLines || "—",
      excerpt: review.excerpt,
    };
  });
  const pressExtracts = pressRows.map((row) => [row.sourceTitle, row.excerpt]);

  return (
    <BookDetailSecondaryLayout book={book} pageName={t("tabs.pressCritiques")} pagePath="/books/details/press-critiques">
      <div className="mb-[6px] pl-[8px] text-[14px] font-bold leading-none text-black md:text-[16px]">
        <span className="text-[#ff1d1d]">{pressExtracts.length}</span> <span>{pageData.pressSectionTitle}</span>
      </div>
      {pressExtracts.length > 0 ? (
        <PressExtractsTable rows={pressExtracts} sourceLabel={pageData.pressColumns.source} extractsLabel={pageData.pressColumns.extracts} />
      ) : (
        <section className="border border-[#7ea8b8] bg-[#a6d9eb]">
          <div className="border-b border-[#7ea8b8] bg-[#fff6bf] px-2 py-[2px] text-[10px] uppercase leading-[1.05] text-black md:text-[11px]">
            {pageData.pressSectionTitle}
          </div>
          <div className="px-3 py-4 text-[14px] leading-[1.45] text-black md:px-4 md:py-5 md:text-[15px]">
            Aucune critique de presse structurée n&apos;est disponible dans la base pour cet ouvrage.
          </div>
        </section>
      )}
    </BookDetailSecondaryLayout>
  );
}
