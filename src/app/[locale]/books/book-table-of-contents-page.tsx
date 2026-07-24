"use client";

import { useTranslations } from "next-intl";
import BookDetailSecondaryLayout from "./book-detail-secondary-layout";
import type { BookDetail } from "@/lib/data/books";

interface BookTableOfContentsPageProps {
  book: BookDetail;
}

function tableOfContentsEntries(value: string): string[] {
  const normalized = value.trim().toLocaleLowerCase();

  if (["", "oui", "non", "true", "false"].includes(normalized)) {
    return [];
  }

  return value.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
}

function TableOfContentsGrid({ entries, emptyLabel }: { entries: string[]; emptyLabel: string }) {
  const rows = Math.max(4, entries.length);

  return (
    <section className="min-h-[260px] w-full overflow-x-auto border border-[#7ea8b8] bg-[#a6d9eb] md:h-[260px] md:min-h-[260px]">
      <table className="h-full min-w-[620px] w-full table-fixed border-collapse text-black">
        <colgroup>
          <col style={{ width: "34%" }} />
          <col style={{ width: "38%" }} />
          <col style={{ width: "23%" }} />
          <col style={{ width: "5%" }} />
        </colgroup>
        <tbody>
          {Array.from({ length: rows }, (_, index) => (
            <tr key={index} className="h-[62px]">
              {entries[index] ? (
                <td colSpan={4} className="border border-[#7ea8b8] px-3 py-2 text-[15px] leading-[1.35] md:text-[16px]">
                  {entries[index]}
                </td>
              ) : index === 0 ? (
                <td colSpan={4} className="border border-[#7ea8b8] px-3 py-2 text-[14px] text-[#315565] md:text-[15px]">
                  {emptyLabel}
                </td>
              ) : (
                Array.from({ length: 4 }, (_, cellIndex) => (
                  <td key={cellIndex} className="border border-[#7ea8b8]" />
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function BookTableOfContentsPage({ book }: BookTableOfContentsPageProps) {
  const t = useTranslations("BookDetailsPage");
  const entries = tableOfContentsEntries(book.tableOfContents);

  return (
    <BookDetailSecondaryLayout book={book} pageName={t("tabs.tableOfContents")} pagePath="/books/details/table-of-contents">
      <TableOfContentsGrid
        entries={book.isCollective ? entries : []}
        emptyLabel={book.isCollective ? t("tableOfContents.empty") : t("tableOfContents.collectiveOnly")}
      />
    </BookDetailSecondaryLayout>
  );
}
