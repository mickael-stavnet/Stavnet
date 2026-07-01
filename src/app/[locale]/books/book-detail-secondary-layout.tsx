"use client";

import Image from "next/image";
import type { MouseEvent, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import type { BookDetail } from "@/lib/data/books";

interface BookDetailSecondaryLayoutProps {
  book: BookDetail;
  pageName: string;
  pagePath: "/books/details/back-cover" | "/books/details/press-critiques" | "/books/details/availability" | "/books/details/publishing";
  children: ReactNode;
}

function RedMarker() {
  return <span className="inline-block h-[10px] w-[10px] rounded-full border-2 border-[#ff1d1d]" />;
}

function InfoField({
  label,
  value,
  valueClassName = "",
  dir,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <section className="border border-[#7ea8b8] bg-[#a6d9eb]">
      <div className="border-b border-[#7ea8b8] bg-[#fff6bf] px-2 py-[2px] text-[10px] uppercase leading-[1.05] text-black md:text-[11px]">
        {label}
      </div>
      <div
        dir={dir}
        className={`flex min-h-[34px] items-center bg-[#a6d9eb] px-2 py-[4px] text-[17px] leading-none text-black md:min-h-[38px] md:text-[16px] ${valueClassName}`}
      >
        {value || "—"}
      </div>
    </section>
  );
}

function InfoTable({
  columns,
  rows,
  gridTemplateColumns,
}: {
  columns: string[];
  rows: string[][];
  gridTemplateColumns: string;
}) {
  return (
    <section className="border border-[#7ea8b8] bg-[#a6d9eb]">
      <div className="grid border-b border-[#7ea8b8] bg-[#fff6bf] text-[10px] uppercase leading-[1.05] text-black md:text-[11px]" style={{ gridTemplateColumns }}>
        {columns.map((column, columnIndex) => (
          <div key={column} className={`px-2 py-[2px] ${columnIndex < columns.length - 1 ? "border-r border-[#7ea8b8]" : ""}`}>
            {column}
          </div>
        ))}
      </div>
      {rows.map((row, rowIndex) => (
        <div key={`${row[0]}-${rowIndex}`} className="grid text-[14px] leading-none text-black md:text-[15px]" style={{ gridTemplateColumns }}>
          {row.map((cell, cellIndex) => (
            <div
              key={`${cell}-${cellIndex}`}
              className={`flex min-h-[32px] items-center px-2 py-[6px] ${cellIndex < row.length - 1 ? "border-r border-[#7ea8b8]" : ""} border-t border-[#7ea8b8]`}
            >
              {cellIndex === 0 ? (
                <span className="flex min-w-0 items-center gap-2">
                  <RedMarker />
                  <span className="break-words">{cell || "—"}</span>
                </span>
              ) : (
                <span className="break-words">{cell || "—"}</span>
              )}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

function MobileInfoTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <section className="space-y-3 md:hidden">
      {rows.map((row, rowIndex) => (
        <article key={`${row[0]}-${rowIndex}`} className="rounded-[6px] border border-[#7ea8b8] bg-[#a6d9eb] p-3">
          {columns.map((column, columnIndex) => (
            <div key={`${column}-${columnIndex}`} className={columnIndex === 0 ? "space-y-1" : "mt-3 space-y-1"}>
              <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{column}</p>
              <div className="text-[14px] leading-[1.35] text-black">
                {columnIndex === 0 ? (
                  <span className="flex min-w-0 items-start gap-2">
                    <RedMarker />
                    <span className="break-words">{row[columnIndex] || "—"}</span>
                  </span>
                ) : (
                  <span className="break-words">{row[columnIndex] || "—"}</span>
                )}
              </div>
            </div>
          ))}
        </article>
      ))}
    </section>
  );
}

export default function BookDetailSecondaryLayout({
  book,
  pageName,
  pagePath,
  children,
}: BookDetailSecondaryLayoutProps) {
  const t = useTranslations("BookDetailsPage");
  const router = useRouter();
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "list", icon: "/icons/icons-nav/book.png", href: "/books" as const, label: t("footer.list") },
    { key: "search", icon: "/icons/icons-nav/rechercher.png", href: "/search" as const, label: t("footer.search") },
    {
      key: "help",
      icon: "/icons/icons-nav/help.png",
      href: pagePath,
      label: t("footer.help"),
      onClick: (event: MouseEvent) => {
        event.preventDefault();
        router.push({ pathname: pagePath, query: { id: book.id } });
      },
    },
    {
      key: "move",
      icon: "/icons/icons-nav/next.png",
      href: pagePath,
      label: t("footer.move"),
      onClick: (event: MouseEvent) => {
        event.preventDefault();
        router.push({ pathname: pagePath, query: { id: book.id } });
      },
    },
  ];
  const authorsRows = book.authors.length > 0 ? book.authors.map((row) => [row.name, row.type, row.language]) : [["", "", ""]];
  const contributorsRows = book.contributors.length > 0 ? book.contributors.map((row) => [row.name, row.type, row.language]) : [["", "", ""]];
  const publishersRows = book.publishers.length > 0 ? book.publishers.map((row) => [row.name, row.country, row.isbn]) : [["", "", ""]];
  const bookTitle = [book.title, book.subtitle].filter((value) => value.length > 0).join(" — ");

  return (
    <main dir="ltr" className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image src="/background/background.png" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-95 saturate-[1.08]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(210,229,242,0.18),rgba(210,229,242,0.08))]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-4 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader pageName={pageName} title={t("header.title")} subtitle={t("header.subtitle")} />

        <section className="mt-6 flex min-w-0 flex-col gap-3 md:absolute md:left-1/2 md:top-[172px] md:bottom-[118px] md:w-[1436px] md:max-w-[calc(100vw-24px)] md:-translate-x-1/2">
          <div className="flex min-w-0 flex-col gap-3 md:grid md:grid-cols-[270px_1120px] md:gap-x-[12px]">
            <aside className="min-w-0 md:h-[404px] md:w-[270px]">
              <div className="w-full max-w-[270px] border border-[#b7ab92] bg-[#f3ead4] p-[6px] shadow-[2px_2px_4px_rgba(0,0,0,0.12)] md:h-[404px] md:w-[270px] md:max-w-none">
                <Image src={book.imageSrc} alt={book.title} width={258} height={387} priority className="h-auto w-full object-cover md:h-full md:w-full" />
              </div>
            </aside>

            <section className="min-w-0 md:h-[404px] md:w-[1120px]">
              <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[8px] border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[4px_4px_8px_rgba(0,0,0,0.18)] md:h-[404px]">
                <div className="flex h-full min-w-0 flex-col gap-[8px] px-3 py-3 md:px-[12px] md:py-[10px]">
                  <InfoField label={t("fields.title")} value={bookTitle} valueClassName="font-bold" />
                  <div className="grid gap-[3px] md:grid-cols-[1.08fr_1.05fr_1.12fr]">
                    <InfoField label={t("fields.originalEnglish")} value={book.titleEnglish} />
                    <InfoField label={t("fields.transcription")} value={book.titleTranscription || book.subtitleTranscription} valueClassName="italic" />
                    <InfoField label={t("fields.originalLanguage")} value={book.titleOriginal || book.language} valueClassName="justify-end" dir={book.titleOriginal ? "rtl" : undefined} />
                  </div>
                  <MobileInfoTable columns={[t("tables.authors"), t("tables.authorType"), t("tables.writingLanguage")]} rows={authorsRows} />
                  <div className="hidden md:block">
                    <InfoTable columns={[t("tables.authors"), t("tables.authorType"), t("tables.writingLanguage")]} rows={authorsRows} gridTemplateColumns="2.3fr 0.95fr 1.05fr" />
                  </div>
                  <MobileInfoTable columns={[t("tables.contributors"), t("tables.contributionType"), t("tables.writingLanguage")]} rows={contributorsRows} />
                  <div className="hidden md:block">
                    <InfoTable columns={[t("tables.contributors"), t("tables.contributionType"), t("tables.writingLanguage")]} rows={contributorsRows} gridTemplateColumns="2.3fr 0.95fr 1.05fr" />
                  </div>
                  <MobileInfoTable columns={[t("tables.publishers"), t("tables.country"), t("tables.isbn")]} rows={publishersRows} />
                  <div className="hidden md:block">
                    <InfoTable columns={[t("tables.publishers"), t("tables.country"), t("tables.isbn")]} rows={publishersRows} gridTemplateColumns="1.7fr 0.9fr 1.1fr" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="min-w-0 md:w-[1402px] md:max-w-none">{children}</section>

          <aside className="hidden items-start justify-start md:absolute md:right-0 md:top-[34px] md:flex">
            <div className="flex flex-col items-center gap-[58px] text-[14px] leading-none text-black">
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
