"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";

const sampleBook = {
  title: "Le bijou",
  originalEnglish: "The Jewel",
  transcription: "ha-takhshit",
  originalLanguage: "התכשיט",
  authors: [["Shulamit Lapid", "Auteur", "Hébreu"]],
  contributors: [["Laurence Sendrowicz", "Traduction", "Français"]],
  publishers: [["Fayard", "France", "2-213-59849-5"]],
};

interface PressRow {
  sourceTitle: string;
  sourceDate: string;
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
        {value}
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
          <div
            key={column}
            className={`px-2 py-[2px] ${columnIndex < columns.length - 1 ? "border-r border-[#7ea8b8]" : ""}`}
          >
            {column}
          </div>
        ))}
      </div>
      {rows.map((row, rowIndex) => (
        <div
          key={`${row[0]}-${rowIndex}`}
          className="grid text-[14px] leading-none text-black md:text-[15px]"
          style={{ gridTemplateColumns }}
        >
          {row.map((cell, cellIndex) => (
            <div
              key={`${cell}-${cellIndex}`}
              className={`flex min-h-[32px] items-center px-2 py-[6px] ${cellIndex < row.length - 1 ? "border-r border-[#7ea8b8]" : ""} border-t border-[#7ea8b8]`}
            >
              {cellIndex === 0 ? (
                <span className="flex min-w-0 items-center gap-2">
                  <RedMarker />
                  <span className="break-words">{cell}</span>
                </span>
              ) : (
                <span className="break-words">{cell}</span>
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
            <div
              key={`${column}-${columnIndex}`}
              className={columnIndex === 0 ? "space-y-1" : "mt-3 space-y-1"}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">
                {column}
              </p>
              <div className="text-[14px] leading-[1.35] text-black">
                {columnIndex === 0 ? (
                  <span className="flex min-w-0 items-start gap-2">
                    <RedMarker />
                    <span className="break-words">{row[columnIndex] ?? ""}</span>
                  </span>
                ) : (
                  <span className="break-words">{row[columnIndex] ?? ""}</span>
                )}
              </div>
            </div>
          ))}
        </article>
      ))}
    </section>
  );
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
      <div className="hidden border-b border-[#7ea8b8] bg-[#fff6bf] text-[10px] uppercase leading-[1.05] text-black md:grid md:grid-cols-[280px_minmax(0,1fr)] md:text-[11px]">
        <div className="border-r border-[#7ea8b8] px-2 py-[2px]">{sourceLabel}</div>
        <div className="px-2 py-[2px]">{extractsLabel}</div>
      </div>
      <div className="space-y-3 p-3 md:hidden">
        {rows.map((row, rowIndex) => {
          const sourceLines = row[0]?.split("\n") ?? [];
          return (
            <article key={`${rowIndex}-${row[0]}`} className="rounded-[6px] border border-[#7ea8b8] bg-[#b6e2ef] p-3">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">
                  {sourceLabel}
                </p>
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
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">
                  {extractsLabel}
                </p>
                <p className="text-[14px] leading-[1.45] text-black">{row[1]}</p>
              </div>
            </article>
          );
        })}
      </div>
      {rows.map((row, rowIndex) => (
        <div key={`${rowIndex}-${row[0]}`} className="hidden md:grid md:grid-cols-[280px_minmax(0,1fr)]">
          <div className={`border-r border-[#7ea8b8] px-2 py-[6px] text-[15px] leading-[1.35] text-black ${rowIndex > 0 ? "border-t" : ""}`}>
            {row[0].split("\n").map((line) => (
              <div key={line} className={line === row[0].split("\n")[0] ? "font-bold" : ""}>
                {line}
              </div>
            ))}
          </div>
          <div className={`px-2 py-[6px] text-[15px] leading-[1.35] text-black ${rowIndex > 0 ? "border-t border-[#7ea8b8]" : ""}`}>
            {row[1]}
          </div>
        </div>
      ))}
    </section>
  );
}

export default function BookPressCritiquesPage() {
  const t = useTranslations("BookDetailsPage");
  const pageData = t.raw("pageData") as PressPageData;
  const pressExtracts = pageData.pressRows.map((row) => [`${row.sourceTitle}\n${row.sourceDate}`, row.excerpt]);
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "search", icon: "/icons/icons-nav/rechercher.png", href: "/search" as const, label: t("footer.search") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/books/details/press-critiques" as const, label: t("footer.help") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/books/details/press-critiques" as const, label: t("footer.move") },
  ];

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image
        src="/background/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-4 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName={t("tabs.pressCritiques")}
          title={t("header.title")}
          subtitle={t("header.subtitle")}
          headerClassName="md:h-[146px]"
          badgeClassName="md:left-[calc(50%-88px)] md:h-[112px] md:w-[236px] md:-translate-x-1/2"
          titleBlockClassName="md:left-[calc(50%+23px)] md:w-[1230px] md:-translate-x-1/2 md:text-right"
          titleClassName="text-[34px] md:text-[32px]"
          subtitleClassName="text-[17px]"
        />

        <section className="mt-6 flex min-w-0 flex-col gap-3 md:absolute md:left-1/2 md:top-1/2 md:w-[1436px] md:max-w-[calc(100vw-24px)] md:-translate-x-1/2 md:-translate-y-1/2 md:grid md:grid-cols-[1fr] md:gap-x-0 md:gap-y-[10px]">
          <div className="flex min-w-0 flex-col gap-3 md:relative md:h-[404px] md:block">
            <aside className="order-1 min-w-0 md:absolute md:left-0 md:top-0 md:h-[404px] md:self-start md:overflow-visible md:pt-0">
              <div className="w-full max-w-[270px] border border-[#b7ab92] bg-[#f3ead4] p-[6px] shadow-[2px_2px_4px_rgba(0,0,0,0.12)] md:h-[404px] md:w-[270px]">
                <Image
                  src="/images/book-cover.jpg"
                  alt={sampleBook.title}
                  width={258}
                  height={387}
                  priority
                  className="h-auto w-full object-cover md:h-full md:w-full"
                />
              </div>
            </aside>

            <section className="order-2 min-w-0 md:h-[404px]">
              <div className="md:ml-[282px] md:h-[404px] md:w-[1120px] md:max-w-none">
                <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[8px] border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[4px_4px_8px_rgba(0,0,0,0.18)] md:h-[404px]">
                  <div className="flex h-full min-w-0 flex-col gap-[8px] px-3 py-3 md:px-[12px] md:py-[10px]">
                    <InfoField
                      label={t("fields.title")}
                      value={sampleBook.title}
                      valueClassName="font-bold"
                    />

                    <div className="grid gap-[3px] md:grid-cols-[1.08fr_1.05fr_1.12fr]">
                      <InfoField
                        label={t("fields.originalEnglish")}
                        value={sampleBook.originalEnglish}
                      />
                      <InfoField
                        label={t("fields.transcription")}
                        value={sampleBook.transcription}
                        valueClassName="italic"
                      />
                      <InfoField
                        label={t("fields.originalLanguage")}
                        value={sampleBook.originalLanguage}
                        valueClassName="justify-end"
                        dir="rtl"
                      />
                    </div>

                    <MobileInfoTable columns={[t("tables.authors"), t("tables.authorType"), t("tables.writingLanguage")]} rows={sampleBook.authors} />
                    <div className="hidden md:block">
                      <InfoTable
                        columns={[t("tables.authors"), t("tables.authorType"), t("tables.writingLanguage")]}
                        rows={sampleBook.authors}
                        gridTemplateColumns="2.3fr 0.95fr 1.05fr"
                      />
                    </div>
                    <MobileInfoTable columns={[t("tables.contributors"), t("tables.contributionType"), t("tables.writingLanguage")]} rows={sampleBook.contributors} />
                    <div className="hidden md:block">
                      <InfoTable
                        columns={[t("tables.contributors"), t("tables.contributionType"), t("tables.writingLanguage")]}
                        rows={sampleBook.contributors}
                        gridTemplateColumns="2.3fr 0.95fr 1.05fr"
                      />
                    </div>
                    <MobileInfoTable columns={[t("tables.publishers"), t("tables.country"), t("tables.isbn")]} rows={sampleBook.publishers} />
                    <div className="hidden md:block">
                      <InfoTable
                        columns={[t("tables.publishers"), t("tables.country"), t("tables.isbn")]}
                        rows={sampleBook.publishers}
                        gridTemplateColumns="1.7fr 0.9fr 1.1fr"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <aside className="order-3 hidden items-start justify-start md:absolute md:right-0 md:top-[40px] md:flex">
              <div className="flex flex-col items-center gap-[58px] text-[14px] leading-none text-black">
                <span className="[writing-mode:vertical-rl]">{t("right.bookCardsFound")}</span>
                <span className="[writing-mode:vertical-rl]">{t("right.database")}</span>
                <span className="[writing-mode:vertical-rl] text-[#ff1d1d]">{t("right.records")}</span>
              </div>
            </aside>
          </div>

          <section className="min-w-0 md:w-[1404px] md:max-w-none">
            <div className="mb-[6px] pl-[8px] text-[14px] font-bold leading-none text-black md:text-[16px]">
              <span className="text-[#ff1d1d]">4</span>{" "}
              <span>{pageData.pressSectionTitle}</span>
            </div>
            <PressExtractsTable
              rows={pressExtracts}
              sourceLabel={pageData.pressColumns.source}
              extractsLabel={pageData.pressColumns.extracts}
            />
          </section>
        </section>

        <StavnetFooter
          items={footerItems}
          className="md:bottom-[3.2vh] md:left-[calc(50%+23px)] md:right-auto md:w-[min(1410px,94vw)] md:-translate-x-1/2"
          itemClassName="md:min-h-[70px] md:text-[14px]"
          mobileGridClassName="grid-cols-2 sm:grid-cols-4"
          desktopMode="compact"
        />
      </div>
    </main>
  );
}
