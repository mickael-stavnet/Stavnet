"use client";

import { useTranslations } from "next-intl";
import BookDetailSecondaryLayout from "./book-detail-secondary-layout";
import { Link } from "@/i18n/routing";
import type { BookDetail, BookTableOfContentsEntry } from "@/lib/data/books";

interface BookTableOfContentsPageProps {
  book: BookDetail;
  entries: BookTableOfContentsEntry[];
}

function getPersonName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(" ");
}

function PersonLink({ name }: { name: string }) {
  const t = useTranslations("BookDetailsPage");

  return (
    <Link
      href={{ pathname: "/persons/details", query: { name } }}
      aria-label={t("tableOfContents.personLink", { name })}
      className="w-fit font-medium text-black underline decoration-black decoration-[1.5px] underline-offset-2 transition-colors duration-150 hover:text-black hover:decoration-black focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a31d24] focus-visible:ring-offset-2 focus-visible:ring-offset-[#a6d9eb]"
    >
      {name}
    </Link>
  );
}

function TableOfContentsGrid({ entries }: { entries: BookTableOfContentsEntry[] }) {
  const t = useTranslations("BookDetailsPage");
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
  return (
    <section className="w-full overflow-x-auto border border-[#669cb1] bg-[#a6d9eb] text-black shadow-[0_2px_8px_rgba(35,91,112,0.2)] md:h-full md:overflow-y-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-[13px] leading-[1.2] md:text-[15px]">
        <colgroup>
          <col className="w-[9%]" />
          <col className="w-[39%]" />
          <col className="w-[26%]" />
          <col className="w-[26%]" />
        </colgroup>
        <thead className="sticky top-0 z-10 bg-[#fff6bf] text-[10px] uppercase leading-[1.1] md:text-[11px]">
          <tr>
            <th scope="col" className="border-b border-r border-[#669cb1] px-3 py-[5px] font-semibold">{t("tableOfContents.headers.page")}</th>
            <th scope="col" className="border-b border-r border-[#669cb1] px-3 py-[5px] font-semibold">{t("tableOfContents.headers.title")}</th>
            <th scope="col" className="border-b border-r border-[#669cb1] px-3 py-[5px] font-semibold">{t("tableOfContents.headers.author")}</th>
            <th scope="col" className="border-b border-[#669cb1] px-3 py-[5px] font-semibold">{t("tableOfContents.headers.translator")}</th>
          </tr>
        </thead>
        <tbody>
          {orderedEntries.map((entry) => {
            const authorName = getPersonName(entry.authorFirstName, entry.authorLastName);
            const translatorName = getPersonName(entry.translatorFirstName, entry.translatorLastName);

            return (
              <tr key={`${entry.position}-${entry.title}`} className="h-[46px] border-b border-[#7ea8b8] transition-colors duration-150 last:border-b-0 hover:bg-white/20">
                <td className="border-r border-[#7ea8b8] px-3 py-2 text-center font-medium tabular-nums">{entry.page}</td>
                <th scope="row" className="border-r border-[#7ea8b8] px-3 py-2 text-left font-semibold">{entry.title}</th>
                <td className="border-r border-[#7ea8b8] px-3 py-2 align-middle">{authorName ? <PersonLink name={authorName} /> : "—"}</td>
                <td className="px-3 py-2 align-middle">{translatorName ? <PersonLink name={translatorName} /> : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
