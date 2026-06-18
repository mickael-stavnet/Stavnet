"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
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

const sampleBook = {
  title: "Poetes israeliennes d'aujourd'hui",
  originalEnglish: "Israeli women poets of today",
  transcription: "Poetot israeliyot shel hayom",
  originalLanguage: "Hebrew",
  authors: [["Nicolas Moshe Lazar", "Director", "Hebrew"]],
  contributors: [
    ["Nicolas-Moshe Lazar", "Translation", "French"],
    ["Lea Goldberg", "Preface", "Hebrew"],
  ],
  publishers: [["Albin Michel", "France", "978-2-226-08977-1"]],
  yearPages: "1960, 159 p., 21 x 14 cm, paperback, EUR 18.50",
  category: ["Literature"],
  subject: ["Israeli poetry"],
  gender: ["Anthology", "Poetry"],
  targetAudience: ["General public"],
  summary:
    "Anthology of modern Israeli poetry in French translation with editorial notes and contextual introduction.",
};

const missingFileByLocale: Record<string, string> = {
  ar: "<ملف مفقود>",
  de: "<Fehlende Datei>",
  en: "<Missing file>",
  es: "<Archivo faltante>",
  fr: "<Fichier manquant>",
  he: "<קובץ חסר>",
};

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
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">
                  {column}
                </p>
                <p className="break-words text-[13px] leading-[1.35] text-black">
                  {row[columnIndex] ?? ""}
                </p>
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
      <span className="break-words">{value}</span>
    </div>
  );
}

function FilledTable({
  columns,
  data,
  rows = 1,
  className,
}: FilledTableProps) {
  return (
    <section className={cn("overflow-x-auto border border-[#7aa8b7] bg-[#a7dcee]", className)}>
      <div
        className="grid min-w-[520px] border-b border-[#7aa8b7] bg-[#fff8c8] text-[12px] uppercase leading-none text-black"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
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
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((column, columnIndex) => (
            <div
              key={`${column}-${columnIndex}`}
              className="flex min-h-[38px] items-center border-r border-t border-[#7aa8b7] px-2 py-2 text-[13px] text-black last:border-r-0"
            >
              {data[rowIndex]?.[columnIndex] ?? ""}
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
        <span className="break-words">{values[0] ?? ""}</span>
      </div>
      <div className="flex min-h-[42px] items-center px-2 py-2 text-[13px] text-black">
        <span className="break-words">{values[1] ?? ""}</span>
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
            <div
              key={index}
              className={cn(
                "h-[72px] border-b border-[#7aa8b7] md:h-[96px]",
                index === rows - 1 && "border-b-0",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function BooksPage() {
  const locale = useLocale();
  const t = useTranslations("BookDetailsPage");
  const [activeTab, setActiveTab] = useState<BookTab>("bookCard");
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "list", icon: "/icons/icons-nav/book.png", href: "/books" as const, label: t("footer.list") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/books/details" as const, label: t("footer.help") },
    { key: "search", icon: "/icons/icons-nav/rechercher.png", href: "/search" as const, label: t("footer.search") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/books/details" as const, label: t("footer.move") },
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
          pageName={t("header.cardTitle")}
          title={t("header.title")}
          subtitle={t("header.subtitle")}
          headerClassName="md:h-[146px]"
          badgeClassName="md:left-[calc(50%-88px)] md:h-[112px] md:w-[236px] md:-translate-x-1/2"
          titleBlockClassName="md:left-[calc(50%+23px)] md:w-[1230px] md:-translate-x-1/2 md:text-right"
          titleClassName="text-[34px] md:text-[32px]"
          subtitleClassName="text-[17px]"
        />

        <section className="mt-6 flex min-w-0 flex-col gap-5 md:absolute md:left-[4.8vw] md:right-[4.8vw] md:top-[154px] md:bottom-[154px] md:grid md:grid-cols-[88px_minmax(0,1fr)_42px] md:gap-[4px]">
          <aside className="order-2 flex min-w-0 flex-col gap-4 md:order-1 md:translate-x-[42px] md:overflow-visible md:pt-[24px]">
            <div className="text-[15px] font-bold text-black md:pt-[6px]">
              {missingFileByLocale[locale] ?? missingFileByLocale.en}
            </div>

            <div className="hidden md:block md:h-[92px]" />

            <button
              type="button"
              className="hidden h-[36px] w-[88px] self-start border border-[#d1bb48] bg-[#ffea56] text-[12px] font-bold leading-[1.05] shadow-[3px_3px_5px_rgba(0,0,0,0.2)] md:ml-[12px] md:block"
            >
              {t("side.expandedCard")}
            </button>

            <div className="min-w-0 border border-[#7aa8b7] bg-[#d8dde2] md:mt-[12px] md:ml-[-10px] md:w-[220px]">
              <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                {t("summary")}
              </div>
              <div className="max-h-[220px] overflow-auto px-3 py-3 text-[12px] leading-[1.45] text-black md:h-[244px] md:max-h-none md:px-2 md:py-2 md:text-[13px]">
                {sampleBook.summary}
              </div>
            </div>
          </aside>

          <section className="order-1 min-w-0 md:order-2 md:mx-auto md:w-full md:max-w-[1230px]">
            <nav className="flex gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-[92px_repeat(7,minmax(0,1fr))] md:items-end md:gap-[10px] md:overflow-visible md:pb-0">
              {tabs.map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  className={cn(
                    "min-h-[44px] min-w-[150px] shrink-0 rounded-t-[8px] border border-[#d1bb48] px-3 py-[10px] text-center text-[13px] leading-[1.1] shadow-[3px_3px_5px_rgba(0,0,0,0.28)] transition-colors md:min-w-0 md:px-2",
                    activeTab === tabKey
                      ? "bg-[#91d3ea] text-black md:min-h-[58px] md:text-[17px] md:font-bold"
                      : "bg-[#ffea56] text-black hover:bg-[#fff16f]",
                  )}
                >
                  {t(`tabs.${tabKey}`)}
                </button>
              ))}
            </nav>

            <div className="mt-[2px] flex min-h-[420px] min-w-0 flex-col rounded-[8px] border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[4px_4px_8px_rgba(0,0,0,0.18)] md:h-[660px] md:flex-row">
              <aside className="border-b border-[#7aa8b7] px-3 py-4 md:w-[128px] md:border-b-0 md:border-r">
                <p className="text-[18px] font-bold leading-tight text-[#ff1313]">{t("side.translation")}</p>
                <p className="mt-[2px] text-[16px] font-bold leading-tight text-black">{t("side.language")}</p>
              </aside>

              <div className="min-w-0 flex-1 overflow-y-auto px-3 py-3 md:px-[16px] md:py-[10px]">
                {activeTab === "bookCard" ? (
                  <div className="grid h-full gap-y-[14px] md:grid-rows-[auto_auto_auto_1fr]">
                    <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                      <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                        {t("fields.title")}
                      </div>
                      <FilledInput value={sampleBook.title} className="border-x-0 border-b" />
                      <div className="grid gap-0 md:grid-cols-3">
                        <div className="border-b border-[#7aa8b7] md:border-b-0 md:border-r">
                          <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                            {t("fields.originalEnglish")}
                          </div>
                          <FilledInput value={sampleBook.originalEnglish} />
                        </div>
                        <div className="border-b border-[#7aa8b7] md:border-b-0 md:border-r">
                          <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                            {t("fields.transcription")}
                          </div>
                          <FilledInput value={sampleBook.transcription} />
                        </div>
                        <div>
                          <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                            {t("fields.originalLanguage")}
                          </div>
                          <FilledInput value={sampleBook.originalLanguage} />
                        </div>
                      </div>
                    </section>

                    <div className="space-y-[14px]">
                      <MobileDataSection
                        title={t("tables.authors")}
                        columns={[t("tables.authors"), t("tables.authorType"), t("tables.writingLanguage")]}
                        rows={sampleBook.authors}
                      />
                      <div className="hidden md:block">
                        <FilledTable
                          columns={[t("tables.authors"), t("tables.authorType"), t("tables.writingLanguage")]}
                          data={sampleBook.authors}
                        />
                      </div>

                      <MobileDataSection
                        title={t("tables.contributors")}
                        columns={[t("tables.contributors"), t("tables.contributionType"), t("tables.writingLanguage")]}
                        rows={sampleBook.contributors}
                      />
                      <div className="hidden md:block">
                        <FilledTable
                          columns={[t("tables.contributors"), t("tables.contributionType"), t("tables.writingLanguage")]}
                          data={sampleBook.contributors}
                          rows={2}
                        />
                      </div>

                      <MobileDataSection
                        title={t("tables.publishers")}
                        columns={[t("tables.publishers"), t("tables.country"), t("tables.isbn")]}
                        rows={sampleBook.publishers}
                      />
                      <div className="hidden md:block">
                        <FilledTable
                          columns={[t("tables.publishers"), t("tables.country"), t("tables.isbn")]}
                          data={sampleBook.publishers}
                        />
                      </div>
                    </div>

                    <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                      <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                        {t("tables.yearPages")}
                      </div>
                      <FilledInput value={sampleBook.yearPages} />
                    </section>

                    <div className="grid gap-[12px] self-end sm:grid-cols-2 md:grid-cols-4">
                      <MiniCard title={t("tables.category")} values={sampleBook.category} />
                      <MiniCard title={t("tables.subject")} values={sampleBook.subject} />
                      <MiniCard title={t("tables.gender")} values={sampleBook.gender} />
                      <MiniCard title={t("tables.targetAudience")} values={sampleBook.targetAudience} />
                    </div>
                  </div>
                ) : null}

                {activeTab === "backCover" ? <BlankContent title={t("content.backCover")} rows={1} /> : null}
                {activeTab === "tableOfContents" ? <BlankContent title={t("content.tableOfContents")} rows={3} /> : null}
                {activeTab === "extracts" ? <BlankContent title={t("content.extracts")} rows={3} /> : null}
                {activeTab === "pressCritiques" ? <BlankContent title={t("content.pressCritiques")} rows={3} /> : null}
                {activeTab === "availability" ? <BlankContent title={t("content.availability")} rows={2} /> : null}
                {activeTab === "publishing" ? <BlankContent title={t("content.publishing")} rows={2} /> : null}
                {activeTab === "statistics" ? (
                  <div className="space-y-[14px]">
                    <BlankContent title={t("content.statistics")} rows={2} />
                    <div className="grid gap-[10px] sm:grid-cols-2 md:grid-cols-4">
                      <MiniCard title={t("tables.category")} />
                      <MiniCard title={t("tables.subject")} />
                      <MiniCard title={t("tables.gender")} />
                      <MiniCard title={t("tables.targetAudience")} />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <aside className="order-3 hidden items-center justify-center md:flex">
            <div className="flex h-full flex-col items-center justify-between py-[126px] text-[14px] leading-none text-black">
              <span className="[writing-mode:vertical-rl]">{t("right.bookCardsFound")}</span>
              <span className="[writing-mode:vertical-rl]">{t("right.database")}</span>
              <span className="[writing-mode:vertical-rl] text-[#ff1d1d]">{t("right.records")}</span>
            </div>
          </aside>
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
