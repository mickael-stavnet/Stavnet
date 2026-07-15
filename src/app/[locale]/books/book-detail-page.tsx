"use client";

import Image from "next/image";
import { useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import type { BookRelatedFacet } from "@/lib/book-related";
import type { BookAuthorRow, BookContributorRow, BookDetail, BookPublisherRow } from "@/lib/data/books";
import {
  ClickableDetailValue,
  buildOrganizationDetailHref,
  buildPersonDetailHref,
  buildRelatedBooksHref,
} from "@/lib/detail-links";
import { cn } from "@/lib/utils";

type BookDetailFacet = Exclude<BookRelatedFacet, "authorName" | "contributorName" | "publisherName">;

type BookTab =
  | "bookCard"
  | "backCover"
  | "tableOfContents"
  | "extracts"
  | "pressCritiques"
  | "availability"
  | "publishing"
  | "statistics";

interface BookDetailPageProps {
  book: BookDetail;
}

interface MobileDataSectionProps {
  title: string;
  columns: string[];
  rows: ReactNode[][];
}

interface FilledInputProps {
  value: string;
  className?: string;
}

interface FilledTableProps {
  columns: string[];
  data: ReactNode[][];
  rows?: number;
  className?: string;
  columnWidths?: string[];
}

interface MiniCardProps {
  title: string;
  values?: ReactNode[];
}

interface BlankContentProps {
  title: string;
  rows?: number;
}

function MobileDataSection({ title, columns, rows }: MobileDataSectionProps) {
  return (
    <section className="rounded-[6px] border border-[#7aa8b7] bg-[#a7dcee] md:hidden">
      <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[4px] text-[12px] uppercase leading-none text-black">
        {title}
      </div>
      <div className="space-y-3 p-3">
        {rows.map((row, rowIndex) => (
          <div key={`${title}-${rowIndex}`} className="space-y-2 rounded-[4px] border border-[#7aa8b7] bg-[#b2e0ef] p-3">
            {columns.map((column, columnIndex) => (
              <div key={`${column}-${columnIndex}`} className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{column}</p>
                <div className="break-words text-[13px] leading-[1.35] text-black font-bold">{row[columnIndex] || "—"}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function FilledInput({ value, className }: FilledInputProps) {
  return (
    <div
      className={cn(
        "flex min-h-12 items-center border border-[#7aa8b7] bg-[#a7dcee] px-2 py-2 text-[13px] font-semibold leading-tight text-black md:min-h-[40px] md:text-[16px]",
        className,
      )}
    >
      <span className="break-words">{value || "—"}</span>
    </div>
  );
}

function FilledTable({
  columns,
  data,
  rows = 1,
  className,
  columnWidths,
}: FilledTableProps) {
  const filledRows = Array.from({ length: rows }).map((_, rowIndex) => data[rowIndex] ?? []);

  return (
    <section className={cn("overflow-x-auto", className)}>
      <table className="min-w-[520px] w-full table-fixed border-collapse bg-[#a7dcee] text-black">
        {columnWidths ? (
          <colgroup>
            {columnWidths.map((width, index) => (
              <col key={`${width}-${index}`} style={{ width }} />
            ))}
          </colgroup>
        ) : null}
        <thead>
          <tr className="bg-[#fff8c8] text-[12px] uppercase leading-none text-black">
            {columns.map((column) => (
              <th key={column} className="border border-[#7aa8b7] px-2 py-[3px] text-left font-normal md:whitespace-nowrap">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filledRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, columnIndex) => (
                <td key={`${column}-${columnIndex}`} className="min-h-[38px] border border-[#7aa8b7] px-2 py-2 align-middle text-[13px] font-semibold text-black md:text-[15px] md:whitespace-nowrap">
                  {row[columnIndex] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function MiniCard({ title, values = [] }: MiniCardProps) {
  return (
    <section className="border border-[#7aa8b7] bg-[#a7dcee]">
      <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
        {title}
      </div>
      <div className="flex min-h-[54px] items-center border-b border-[#7aa8b7] px-2 py-2 text-[13px] font-semibold text-black md:text-[15px]">
        <div className="break-words">{values[0] || "—"}</div>
      </div>
      <div className="flex min-h-[42px] items-center px-2 py-2 text-[13px] font-semibold text-black md:text-[15px]">
        <div className="break-words">{values[1] || "—"}</div>
      </div>
    </section>
  );
}

function BlankContent({ title, rows = 1 }: BlankContentProps) {
  return (
    <section className="border border-[#7aa8b7] bg-[#a7dcee]">
      <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[4px] text-[12px] uppercase leading-none text-black">
        {title}
      </div>
      <div className="p-[10px]">
        <div className="min-h-[220px] border border-[#7aa8b7] bg-[#b2e0ef] md:min-h-[404px]">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className={cn("h-[72px] border-b border-[#7aa8b7] md:h-[96px]", index === rows - 1 && "border-b-0")} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TextPanel({ title, value }: { title: string; value: string }) {
  return (
    <section className="border border-[#7aa8b7] bg-[#a7dcee]">
      <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[4px] text-[12px] uppercase leading-none text-black">
        {title}
      </div>
      <div className="min-h-[220px] px-3 py-3 text-[13px] leading-[1.5] text-black md:min-h-[404px] md:px-4 md:py-4 md:text-[15px]">
        {value || "—"}
      </div>
    </section>
  );
}

function renderFacetValue(value: string, facet: BookDetailFacet): ReactNode {
  return value ? <ClickableDetailValue href={buildRelatedBooksHref(facet, value)} value={value} /> : "—";
}

function renderPersonValue(value: string, fallbackFacet: "authorName" | "contributorName"): ReactNode {
  return value ? <ClickableDetailValue href={buildPersonDetailHref(value, fallbackFacet)} value={value} /> : "—";
}

function renderOrganizationValue(value: string, fallbackFacet: "publisherName"): ReactNode {
  return value ? <ClickableDetailValue href={buildOrganizationDetailHref(value, fallbackFacet)} value={value} /> : "—";
}

function buildAuthorRows(rows: BookAuthorRow[]): ReactNode[][] {
  return rows.map((row) => [
    renderPersonValue(row.name, "authorName"),
    renderFacetValue(row.type, "authorType"),
    renderFacetValue(row.language, "authorWritingLanguage"),
  ]);
}

function buildContributorRows(rows: BookContributorRow[]): ReactNode[][] {
  return rows.map((row) => [
    renderPersonValue(row.name, "contributorName"),
    renderFacetValue(row.type, "contributorType"),
    renderFacetValue(row.language, "contributorLanguage"),
  ]);
}

function buildPublisherRows(rows: BookPublisherRow[]): ReactNode[][] {
  return rows.map((row) => [
    renderOrganizationValue(row.name, "publisherName"),
    renderFacetValue(row.country, "publisherCountry"),
    row.isbn || "—",
  ]);
}

function buildFacetCardValues(values: string[], facet: BookDetailFacet): ReactNode[] {
  return values.map((value) => renderFacetValue(value, facet));
}

export default function BookDetailPage({ book }: BookDetailPageProps) {
  const t = useTranslations("BookDetailsPage");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BookTab>("bookCard");
  const hasMissingCover = book.imageSrc === "/images/books-cover/book-cover-placeholder.png";
  const tabs: BookTab[] = [
    "bookCard",
    "backCover",
    "tableOfContents",
    "extracts",
    "pressCritiques",
    "availability",
    "publishing",
    "statistics",
  ];
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "list", icon: "/icons/icons-nav/book.png", href: "/books" as const, label: t("footer.list") },
    { key: "search", icon: "/icons/icons-nav/rechercher.png", href: "/search" as const, label: t("footer.search") },
    {
      key: "help",
      icon: "/icons/icons-nav/help.png",
      href: "/books/details" as const,
      label: t("footer.help"),
      onClick: (event: MouseEvent) => {
        event.preventDefault();
        router.push({ pathname: "/books/details", query: { id: book.id } });
      },
    },
    {
      key: "move",
      icon: "/icons/icons-nav/next.png",
      href: "/books/details" as const,
      label: t("footer.move"),
      onClick: (event: MouseEvent) => {
        event.preventDefault();
        router.push({ pathname: "/books/details", query: { id: book.id } });
      },
    },
  ];
  const bookTitle = [book.title, book.subtitle].filter((value) => value.length > 0).join(" — ");
  const authorsData = buildAuthorRows(book.authors);
  const contributorsData = buildContributorRows(book.contributors);
  const publishersData = buildPublisherRows(book.publishers);
  return (
    <main dir="ltr" className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image
        src="/background/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-95 saturate-[1.08]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(210,229,242,0.18),rgba(210,229,242,0.08))]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-4 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName={t("header.cardTitle")}
          title={t("header.title")}
          subtitle={t("header.subtitle")}
        />

        <section className="mt-6 flex min-w-0 flex-col gap-5 md:absolute md:left-1/2 md:top-[172px] md:bottom-[118px] md:w-[1437px] md:max-w-[calc(100vw-24px)] md:-translate-x-1/2 md:box-border md:pl-[282px] md:pr-[35px]">
          <aside className="order-1 flex min-w-0 flex-col gap-[12px] md:absolute md:left-0 md:top-[66px] md:h-[min(660px,calc(100vh-440px))] md:w-[270px] md:gap-[14px] md:overflow-hidden">
            <div className="w-full max-w-[270px] border border-[#b7ab92] bg-[#f3ead4] p-[6px] shadow-[2px_2px_4px_rgba(0,0,0,0.12)] md:h-[422px] md:w-[270px] md:max-w-none">
              {hasMissingCover ? (
                <div className="flex h-[240px] w-full items-center justify-center bg-[#efe5d2] px-6 text-center text-[16px] leading-[1.3] text-[#6d614d] md:h-full md:text-[17px]">
                  {t("noCoverAvailable")}
                </div>
              ) : (
                <Image
                  src={book.imageSrc}
                  alt={book.title}
                  width={258}
                  height={387}
                  priority
                  className="h-auto w-full object-cover md:h-full"
                />
              )}
            </div>

            <div className="min-w-0 max-w-[270px] border border-[#7aa8b7] bg-[#d8dde2] md:flex-1 md:w-[270px] md:max-w-none">
              <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                {t("summary")}
              </div>
              <div className="max-h-[220px] overflow-auto px-3 py-3 text-[12px] leading-[1.45] text-black md:h-[calc(100%-23px)] md:max-h-none md:px-2 md:py-2 md:text-[16px] md:leading-[1.5]">
                {book.summary || "—"}
              </div>
            </div>
          </aside>

          <section className="order-2 min-w-0 md:w-full md:max-w-none">
            <nav className="grid grid-cols-2 gap-2 pb-2 md:grid md:w-full md:grid-cols-[1.05fr_1.28fr_1.26fr_0.92fr_1.28fr_1.08fr_0.96fr_1.02fr] md:items-end md:gap-[8px] md:pb-0">
              {tabs.map((tabKey) => {
                const tabClassName = cn(
                    "min-h-[36px] min-w-0 rounded-t-[8px] border border-[#d1bb48] px-3 py-[8px] text-center text-[13px] font-bold leading-[1.1] shadow-[3px_3px_5px_rgba(0,0,0,0.28)] transition-colors md:flex md:min-h-[48px] md:w-full md:items-center md:justify-center md:px-4 md:text-[15px] md:leading-[1.08] md:whitespace-normal",
                    activeTab === tabKey
                      ? "bg-[#91d3ea] font-semibold text-black md:min-h-[54px] md:text-[19px] md:font-bold"
                      : "bg-[#ffea56] text-black hover:bg-[#fff16f]",
                );

                if (tabKey === "backCover") {
                  return (
                    <Link key={tabKey} href={{ pathname: "/books/details/back-cover", query: { id: book.id } }} className={tabClassName}>
                      {t(`tabs.${tabKey}`)}
                    </Link>
                  );
                }

                if (tabKey === "pressCritiques") {
                  return (
                    <Link key={tabKey} href={{ pathname: "/books/details/press-critiques", query: { id: book.id } }} className={tabClassName}>
                      {t(`tabs.${tabKey}`)}
                    </Link>
                  );
                }

                if (tabKey === "availability") {
                  return (
                    <Link key={tabKey} href={{ pathname: "/books/details/availability", query: { id: book.id } }} className={tabClassName}>
                      {t(`tabs.${tabKey}`)}
                    </Link>
                  );
                }

                if (tabKey === "publishing") {
                  return (
                    <Link key={tabKey} href={{ pathname: "/books/details/publishing", query: { id: book.id } }} className={tabClassName}>
                      {t(`tabs.${tabKey}`)}
                    </Link>
                  );
                }

                return (
                  <button key={tabKey} type="button" onClick={() => setActiveTab(tabKey)} className={tabClassName}>
                    {t(`tabs.${tabKey}`)}
                  </button>
                );
              })}
            </nav>

            <div className="mt-[2px] flex min-h-[420px] min-w-0 flex-col rounded-[8px] border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[4px_4px_8px_rgba(0,0,0,0.18)] md:h-[min(660px,calc(100vh-430px))] md:min-h-0 md:overflow-hidden md:flex-row">
              <aside className="border-b border-[#7aa8b7] px-3 py-4 md:w-[128px] md:border-b-0 md:border-r">
                <p className="text-center text-[18px] font-bold leading-tight text-[#ff1313] md:text-[22px]">{t("side.translation")}</p>
                <div className="mt-[2px] text-[16px] font-semibold leading-tight text-black md:text-[17px]">
                  {book.language ? renderFacetValue(book.language, "translationLanguage") : t("side.language")}
                </div>
              </aside>

              <div className="min-w-0 flex-1 overflow-y-auto px-3 py-3 md:px-[16px] md:py-[10px]">
                {activeTab === "bookCard" ? (
                  <div className="grid h-full gap-y-[14px] md:grid-rows-[auto_auto_auto_1fr]">
                    <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                      <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                        {t("fields.title")}
                      </div>
                      <FilledInput value={bookTitle} className="border-x-0 border-b" />
                      <div className="grid gap-0 md:grid-cols-3">
                        <div className="border-b border-[#7aa8b7] md:border-b-0 md:border-r">
                          <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                            {t("fields.originalEnglish")}
                          </div>
                          <FilledInput value={book.titleEnglish} />
                        </div>
                        <div className="border-b border-[#7aa8b7] md:border-b-0 md:border-r">
                          <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                            {t("fields.transcription")}
                          </div>
                          <FilledInput value={book.titleTranscription || book.subtitleTranscription} />
                        </div>
                        <div>
                          <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                            {t("fields.originalLanguage")}
                          </div>
                          <FilledInput value={book.titleOriginal || book.language} />
                        </div>
                      </div>
                    </section>

                    <div className="space-y-[14px]">
                      <MobileDataSection
                        title={t("tables.authors")}
                        columns={[t("tables.authors"), t("tables.authorType"), t("tables.writingLanguage")]}
                        rows={authorsData.length > 0 ? authorsData : [["", "", ""]]}
                      />
                      <div className="hidden md:block">
                        <FilledTable
                          columns={[t("tables.authors"), t("tables.authorType"), t("tables.writingLanguage")]}
                          data={authorsData.length > 0 ? authorsData : [["", "", ""]]}
                          rows={Math.max(1, authorsData.length)}
                          columnWidths={["58%","19%","23%"]}
                        />
                      </div>

                      <MobileDataSection
                        title={t("tables.contributors")}
                        columns={[t("tables.contributors"), t("tables.contributionType"), t("tables.writingLanguage")]}
                        rows={contributorsData.length > 0 ? contributorsData : [["", "", ""]]}
                      />
                      <div className="hidden md:block">
                        <FilledTable
                          columns={[t("tables.contributors"), t("tables.contributionType"), t("tables.writingLanguage")]}
                          data={contributorsData.length > 0 ? contributorsData : [["", "", ""]]}
                          rows={Math.max(1, contributorsData.length)}
                          columnWidths={["58%","19%","23%"]}
                        />
                      </div>

                      <MobileDataSection
                        title={t("tables.publishers")}
                        columns={[t("tables.publishers"), t("tables.country"), t("tables.isbn")]}
                        rows={publishersData.length > 0 ? publishersData : [["", "", ""]]}
                      />
                      <div className="hidden md:block">
                        <FilledTable
                          columns={[t("tables.publishers"), t("tables.country"), t("tables.isbn")]}
                          data={publishersData.length > 0 ? publishersData : [["", "", ""]]}
                          rows={Math.max(1, publishersData.length)}
                          columnWidths={["52%","20%","28%"]}
                        />
                      </div>
                    </div>

                    <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                      <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                        {t("tables.yearPages")}
                      </div>
                      <FilledInput value={book.yearPages} />
                    </section>

                    <div className="grid gap-[12px] self-end sm:grid-cols-2 md:grid-cols-4">
                      <MiniCard title={t("tables.category")} values={buildFacetCardValues(book.category, "category")} />
                      <MiniCard title={t("tables.gender")} values={buildFacetCardValues(book.genre, "genre")} />
                      <MiniCard title={t("tables.subject")} values={buildFacetCardValues(book.subject, "subject")} />
                      <MiniCard title={t("tables.targetAudience")} values={buildFacetCardValues(book.targetAudience, "targetAudience")} />
                    </div>
                  </div>
                ) : null}

                {activeTab === "backCover" ? <TextPanel title={t("content.backCover")} value={book.backCover} /> : null}
                {activeTab === "tableOfContents" ? <TextPanel title={t("content.tableOfContents")} value={book.tableOfContents} /> : null}
                {activeTab === "extracts" ? <BlankContent title={t("content.extracts")} rows={3} /> : null}
                {activeTab === "pressCritiques" ? <BlankContent title={t("content.pressCritiques")} rows={3} /> : null}
                {activeTab === "availability" ? <BlankContent title={t("content.availability")} rows={2} /> : null}
                {activeTab === "publishing" ? <BlankContent title={t("content.publishing")} rows={2} /> : null}
                {activeTab === "statistics" ? (
                  <div className="space-y-[14px]">
                    <BlankContent title={t("content.statistics")} rows={2} />
                    <div className="grid gap-[10px] sm:grid-cols-2 md:grid-cols-4">
                      <MiniCard title={t("tables.category")} values={buildFacetCardValues(book.category, "category")} />
                      <MiniCard title={t("tables.gender")} values={buildFacetCardValues(book.genre, "genre")} />
                      <MiniCard title={t("tables.subject")} values={buildFacetCardValues(book.subject, "subject")} />
                      <MiniCard title={t("tables.targetAudience")} values={buildFacetCardValues(book.targetAudience, "targetAudience")} />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <aside className="order-3 hidden md:absolute md:right-0 md:top-[66px] md:flex md:h-[min(660px,calc(100vh-440px))] md:w-[34px] md:items-center md:justify-center">
            <div className="flex flex-col items-center justify-center gap-[14px] text-[15px] leading-none text-black">
              <span className="[writing-mode:vertical-rl]">{t("right.bookCardsFound")}</span>
              <span className="[writing-mode:vertical-rl] text-[17px] font-bold text-[#ff1d1d]">{book.stats.cardsFound}</span>
              <div className="h-[18px]" />
              <span className="[writing-mode:vertical-rl]">{t("right.databaseContains")}</span>
              <span className="[writing-mode:vertical-rl] text-[17px] font-bold text-[#ff1d1d]">{book.stats.databaseContains}</span>
            </div>
          </aside>
        </section>

        <StavnetFooter
          items={footerItems}
          desktopMode="compact"
          className="md:left-[calc(50%+123.5px)] md:right-auto md:w-[1120px] md:max-w-[calc(100vw-306px)] md:-translate-x-1/2"
        />
      </div>
    </main>
  );
}
