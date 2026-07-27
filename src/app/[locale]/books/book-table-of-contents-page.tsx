"use client";

import { useTranslations } from "next-intl";
import BookDetailSecondaryLayout from "./book-detail-secondary-layout";
import type { BookDetail, BookTableOfContentsEntry } from "@/lib/data/books";

interface BookTableOfContentsPageProps {
  book: BookDetail;
  entries: BookTableOfContentsEntry[];
}

function TableOfContentsGrid({ entries }: { entries: BookTableOfContentsEntry[] }) {
  const orderedEntries = [...entries].sort((first, second) => {
    const firstPage = Number.parseInt(first.page, 10);
    const secondPage = Number.parseInt(second.page, 10);
    const firstHasPage = Number.isFinite(firstPage);
    const secondHasPage = Number.isFinite(secondPage);

    if (firstHasPage && secondHasPage) return firstPage - secondPage;
    if (firstHasPage) return -1;
    if (secondHasPage) return 1;
    return first.position - second.position;
  });
  const usesTwoColumns = orderedEntries.length > 7;
  const entriesPerColumn = Math.ceil(orderedEntries.length / (usesTwoColumns ? 2 : 1));
  const columns = Array.from(
    { length: usesTwoColumns ? 2 : 1 },
    (_, index) => orderedEntries.slice(index * entriesPerColumn, (index + 1) * entriesPerColumn),
  );

  return (
    <section className={`grid min-h-[278px] w-full overflow-hidden border border-[#7ea8b8] bg-[#a6d9eb] text-black ${usesTwoColumns ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className={`divide-y divide-[#7ea8b8] ${usesTwoColumns && columnIndex === 0 ? "md:border-r md:border-[#7ea8b8]" : ""}`}>
          {column.map((entry, entryIndex) => (
            <article key={entry.sourceEntryId} className="grid min-h-[48px] grid-cols-[44px_minmax(0,1fr)_58px] items-stretch text-[15px] leading-[1.3] md:text-[16px]">
              <span className="flex items-center justify-center border-r border-[#7ea8b8] px-2 tabular-nums">{columnIndex * entriesPerColumn + entryIndex + 1}</span>
              <span className="flex min-w-0 items-center px-3 py-2">{entry.title}</span>
              <span className="flex items-center justify-end border-l border-[#7ea8b8] px-3 tabular-nums">{entry.page}</span>
            </article>
          ))}
        </div>
      ))}
    </section>
  );
}

function SupplementaryBookData({ book }: { book: BookDetail }) {
  const t = useTranslations("BookDetailsPage");
  const availability = book.availability.length > 0 ? `${book.availability.length} ${t("tabs.availability")}` : "—";

  return (
    <div className="grid gap-[3px] md:grid-cols-2">
      <section className="border border-[#7ea8b8] bg-[#a6d9eb]">
        <div className="border-b border-[#7ea8b8] bg-[#fff6bf] px-2 py-[2px] text-[10px] uppercase leading-[1.05] text-black md:text-[11px]">{t("tables.yearPages")}</div>
        <div className="flex min-h-[34px] items-center px-2 py-[4px] text-[14px] leading-[1.15] text-black font-bold md:min-h-[38px] md:text-[15px]">{book.yearPages || "—"}</div>
      </section>
      <section className="border border-[#7ea8b8] bg-[#a6d9eb]">
        <div className="border-b border-[#7ea8b8] bg-[#fff6bf] px-2 py-[2px] text-[10px] uppercase leading-[1.05] text-black md:text-[11px]">{t("tabs.availability")}</div>
        <div className="flex min-h-[34px] items-center px-2 py-[4px] text-[14px] leading-[1.15] text-black font-bold md:min-h-[38px] md:text-[15px]">{availability}</div>
      </section>
      <section className="border border-[#7ea8b8] bg-[#a6d9eb]">
        <div className="border-b border-[#7ea8b8] bg-[#fff6bf] px-2 py-[2px] text-[10px] uppercase leading-[1.05] text-black md:text-[11px]">{t("tables.category")}</div>
        <div className="flex min-h-[34px] items-center px-2 py-[4px] text-[14px] leading-[1.15] text-black font-bold md:min-h-[38px] md:text-[15px]">{book.category.join(", ") || "—"}</div>
      </section>
      <section className="border border-[#7ea8b8] bg-[#a6d9eb]">
        <div className="border-b border-[#7ea8b8] bg-[#fff6bf] px-2 py-[2px] text-[10px] uppercase leading-[1.05] text-black md:text-[11px]">{t("tables.gender")}</div>
        <div className="flex min-h-[34px] items-center px-2 py-[4px] text-[14px] leading-[1.15] text-black font-bold md:min-h-[38px] md:text-[15px]">{book.genre.join(", ") || "—"}</div>
      </section>
    </div>
  );
}

export default function BookTableOfContentsPage({ book, entries }: BookTableOfContentsPageProps) {
  const t = useTranslations("BookDetailsPage");
  const tableEntries = book.isCollective ? entries : [];
  const hasEntries = tableEntries.length > 0;

  return (
    <BookDetailSecondaryLayout
      book={book}
      pageName={t("tabs.tableOfContents")}
      pagePath="/books/details/table-of-contents"
      layout={hasEntries ? "tableOfContents" : "expandedCentered"}
      detailsExtra={hasEntries ? undefined : <SupplementaryBookData book={book} />}
    >
      {hasEntries ? <TableOfContentsGrid entries={tableEntries} /> : null}
    </BookDetailSecondaryLayout>
  );
}
