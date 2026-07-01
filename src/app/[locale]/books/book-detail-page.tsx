"use client";

import Image from "next/image";
import { useState } from "react";
import type { MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import type { BookAuthorRow, BookContributorRow, BookDetail, BookPublisherRow } from "@/lib/data/books";
import { cn } from "@/lib/utils";

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
  rows: string[][];
}

interface FilledInputProps {
  value: string;
  className?: string;
}

interface FilledTableProps {
  columns: string[];
  data: string[][];
  rows?: number;
  className?: string;
}

interface MiniCardProps {
  title: string;
  values?: string[];
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
                <p className="break-words text-[13px] leading-[1.35] text-black">{row[columnIndex] || "—"}</p>
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
        "flex min-h-12 items-center border border-[#7aa8b7] bg-[#a7dcee] px-2 py-2 text-[15px] font-bold leading-tight text-[#07384a] md:min-h-[40px] md:text-[15px]",
        className,
      )}
    >
      <span className="break-words">{value || "—"}</span>
    </div>
  );
}

function FilledTable({ columns, data, rows = 1, className }: FilledTableProps) {
  return (
    <section className={cn("overflow-x-auto border border-[#7aa8b7] bg-[#a7dcee]", className)}>
      <div
        className="grid min-w-[520px] border-b border-[#7aa8b7] bg-[#fff8c8] text-[12px] uppercase leading-none text-black"
        style={{
          gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((column) => (
          <div key={column} className="border-r border-[#7aa8b7] px-2 py-[3px] last:border-r-0">
            {column}
          </div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid min-w-[520px]"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
          }}
        >
          {columns.map((column, columnIndex) => (
            <div
              key={`${column}-${columnIndex}`}
              className="flex min-h-[38px] items-center border-r border-t border-[#7aa8b7] px-2 py-2 text-[13px] text-black last:border-r-0"
            >
              {data[rowIndex]?.[columnIndex] || "—"}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

function MiniCard({ title, values = [] }: MiniCardProps) {
  return (
    <section className="border border-[#7aa8b7] bg-[#a7dcee]">
      <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
        {title}
      </div>
      <div className="flex min-h-[54px] items-center border-b border-[#7aa8b7] px-2 py-2 text-[13px] text-black">
        <span className="break-words">{values[0] || "—"}</span>
      </div>
      <div className="flex min-h-[42px] items-center px-2 py-2 text-[13px] text-black">
        <span className="break-words">{values[1] || "—"}</span>
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

function buildAuthorRows(rows: BookAuthorRow[]): string[][] {
  return rows.map((row) => [row.name, row.type, row.language]);
}

function buildContributorRows(rows: BookContributorRow[]): string[][] {
  return rows.map((row) => [row.name, row.type, row.language]);
}

function buildPublisherRows(rows: BookPublisherRow[]): string[][] {
  return rows.map((row) => [row.name, row.country, row.isbn]);
}

export default function BookDetailPage({ book }: BookDetailPageProps) {
  const t = useTranslations("BookDetailsPage");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BookTab>("bookCard");
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

        <section className="mt-6 flex min-w-0 flex-col gap-5 md:absolute md:left-1/2 md:top-[172px] md:bottom-[118px] md:w-[1436px] md:max-w-[calc(100vw-24px)] md:-translate-x-1/2 md:grid md:grid-cols-[1fr] md:gap-x-0 md:gap-y-[4px]">
          <aside className="order-1 flex min-w-0 flex-col gap-[12px] md:absolute md:left-0 md:top-0 md:self-start md:overflow-visible md:pt-0">
            <div className="w-full max-w-[270px] border border-[#b7ab92] bg-[#f3ead4] p-[6px] shadow-[2px_2px_4px_rgba(0,0,0,0.12)] md:w-[270px]">
              <Image
                src={book.imageSrc}
                alt={book.title}
                width={258}
                height={387}
                priority
                className="h-auto w-full object-cover"
              />
            </div>

            <div className="min-w-0 max-w-[270px] border border-[#7aa8b7] bg-[#d8dde2] md:w-[270px]">
              <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                {t("summary")}
              </div>
              <div className="max-h-[220px] overflow-auto px-3 py-3 text-[12px] leading-[1.45] text-black md:h-[284px] md:max-h-none md:px-2 md:py-2 md:text-[13px]">
                {book.summary || "—"}
              </div>
            </div>
          </aside>

          <section className="order-2 min-w-0 md:col-start-1 md:col-end-2 md:ml-[282px] md:w-[1120px] md:max-w-none">
            <nav className="grid grid-cols-2 gap-2 pb-2 md:grid-cols-[92px_repeat(7,minmax(0,1fr))] md:items-end md:gap-[10px] md:pb-0">
              {tabs.map((tabKey) => {
                const tabClassName = cn(
                  "min-h-[44px] min-w-0 rounded-t-[8px] border border-[#d1bb48] px-3 py-[10px] text-center text-[13px] leading-[1.1] shadow-[3px_3px_5px_rgba(0,0,0,0.28)] transition-colors md:px-2",
                  activeTab === tabKey
                    ? "bg-[#91d3ea] text-black md:min-h-[58px] md:text-[17px] md:font-bold"
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

            <div className="mt-[2px] flex min-h-[420px] min-w-0 flex-col rounded-[8px] border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[4px_4px_8px_rgba(0,0,0,0.18)] md:h-[660px] md:flex-row">
              <aside className="border-b border-[#7aa8b7] px-3 py-4 md:w-[128px] md:border-b-0 md:border-r">
                <p className="text-[18px] font-bold leading-tight text-[#ff1313]">{t("side.translation")}</p>
                <p className="mt-[2px] text-[16px] font-bold leading-tight text-black">{book.language || t("side.language")}</p>
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
                      <MiniCard title={t("tables.category")} values={book.category} />
                      <MiniCard title={t("tables.subject")} values={book.subject} />
                      <MiniCard title={t("tables.gender")} values={book.genre} />
                      <MiniCard title={t("tables.targetAudience")} values={book.targetAudience} />
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
                      <MiniCard title={t("tables.category")} values={book.category} />
                      <MiniCard title={t("tables.subject")} values={book.subject} />
                      <MiniCard title={t("tables.gender")} values={book.genre} />
                      <MiniCard title={t("tables.targetAudience")} values={book.targetAudience} />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <aside className="order-3 hidden items-start justify-start md:absolute md:right-0 md:top-[78px] md:flex">
            <div className="flex flex-col items-center gap-[72px] text-[14px] leading-none text-black">
              <span className="[writing-mode:vertical-rl]">{t("right.bookCardsFound")}</span>
              <span className="[writing-mode:vertical-rl] text-[#ff1d1d]">{book.stats.cardsFound}</span>
              <span className="[writing-mode:vertical-rl]">{t("right.databaseContains")}</span>
              <span className="[writing-mode:vertical-rl] text-[#ff1d1d]">{book.stats.databaseContains}</span>
            </div>
          </aside>
        </section>

        <StavnetFooter items={footerItems} desktopMode="compact" />
      </div>
    </main>
  );
}
