"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { StavnetHeader } from "@/components/stavnet/header";
import { StavnetFooter } from "@/components/stavnet/footer";

function EmptyInput({ className = "" }: { className?: string }) {
  return <div className={`h-11 border border-[#7aa8b7] bg-[#a7dcee] md:h-[28px] ${className}`} />;
}

function EmptyTable({
  columns,
  rows = 1,
  className = "",
}: {
  columns: string[];
  rows?: number;
  className?: string;
}) {
  return (
    <section className={`overflow-x-auto border border-[#7aa8b7] bg-[#a7dcee] ${className}`}>
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
              className="h-[28px] border-r border-t border-[#7aa8b7] last:border-r-0"
            />
          ))}
        </div>
      ))}
    </section>
  );
}

function MiniCard({ title }: { title: string }) {
  return (
    <section className="border border-[#7aa8b7] bg-[#a7dcee]">
      <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
        {title}
      </div>
      <div className="h-[38px] border-b border-[#7aa8b7]" />
      <div className="h-[18px]" />
    </section>
  );
}

function BlankContent({
  title,
  rows = 1,
}: {
  title: string;
  rows?: number;
}) {
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
              className={`h-[72px] border-b border-[#7aa8b7] md:h-[96px] ${index === rows - 1 ? "border-b-0" : ""}`}
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
  const missingFileByLocale: Record<string, string> = {
    ar: "<ملف مفقود>",
    de: "<Fehlende Datei>",
    en: "<Missing file>",
    es: "<Archivo faltante>",
    fr: "<Fichier manquant>",
    he: "<קובץ חסר>",
  };
  const tabs = [
    "bookCard",
    "backCover",
    "tableOfContents",
    "extracts",
    "pressCritiques",
    "availability",
    "publishing",
    "statistics",
  ] as const;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("bookCard");
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "list", icon: "/icons/icons-nav/book.png", href: "/books" as const, label: t("footer.list") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/books" as const, label: t("footer.help") },
    { key: "search", icon: "/icons/icons-nav/rechercher.png", href: "/search" as const, label: t("footer.search") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/books" as const, label: t("footer.move") },
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
          badgeClassName="md:h-[112px] md:w-[236px]"
          titleBlockClassName="md:right-[4.7vw] md:left-auto md:w-[40vw]"
          titleClassName="text-[34px] md:text-[32px]"
          subtitleClassName="text-[17px]"
        />

        <section className="mt-6 flex flex-col gap-5 md:absolute md:left-[4.6vw] md:right-[4.6vw] md:top-[154px] md:bottom-[132px] md:grid md:grid-cols-[136px_1fr_34px] md:gap-[16px]">
          <aside className="relative order-2 flex flex-col gap-4 md:order-1 md:pt-[24px]">
            <div className="md:absolute md:left-[-6px] md:top-[-82px] md:flex md:w-[228px] md:items-end md:justify-between">
              <div className="translate-y-[10px] text-[17px] font-bold tracking-[0.2em] text-[#2b2578] [writing-mode:vertical-rl]">
                {t("bookVertical")}
              </div>
            </div>

            <div className="text-[15px] font-bold text-black md:pt-[6px]">
              {missingFileByLocale[locale] ?? missingFileByLocale.en}
            </div>

            <div className="hidden md:block md:h-[172px]" />

            <button
              type="button"
              className="hidden h-[36px] w-[88px] self-center border border-[#d1bb48] bg-[#ffea56] text-[12px] font-bold leading-[1.05] shadow-[3px_3px_5px_rgba(0,0,0,0.2)] md:block"
            >
              {t("side.expandedCard")}
            </button>

            <div className="border border-[#7aa8b7] bg-[#d8dde2] md:mt-[72px]">
              <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                {t("summary")}
              </div>
              <div className="h-[180px] md:h-[244px]" />
            </div>
          </aside>

          <section className="order-1 min-w-0 md:order-2">
            <nav className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-[92px_repeat(7,minmax(0,1fr))] md:items-end md:gap-[6px]">
              {tabs.map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  className={`min-h-[42px] border border-[#d1bb48] px-2 py-[8px] text-center text-[13px] leading-[1.02] shadow-[3px_3px_5px_rgba(0,0,0,0.28)] transition-colors ${
                    activeTab === tabKey
                      ? "bg-[#91d3ea] text-black md:min-h-[58px] md:text-[17px] md:font-bold"
                      : "bg-[#ffea56] text-black hover:bg-[#fff16f]"
                  }`}
                >
                  {t(`tabs.${tabKey}`)}
                </button>
              ))}
            </nav>

            <div className="mt-[2px] flex min-h-[420px] flex-col border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[7px_7px_10px_rgba(0,0,0,0.24)] md:min-h-[580px] md:flex-row">
              <aside className="border-b border-[#7aa8b7] px-4 py-4 md:w-[120px] md:border-b-0 md:border-r">
                <p className="text-[18px] font-bold leading-tight text-[#ff1313]">{t("side.translation")}</p>
                <p className="mt-[2px] text-[16px] font-bold leading-tight text-black">{t("side.language")}</p>
              </aside>

              <div className="min-w-0 flex-1 px-[10px] py-[10px]">
                {activeTab === "bookCard" ? (
                  <>
                    <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                      <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                        {t("fields.title")}
                      </div>
                      <div className="h-11 border-b border-[#7aa8b7] md:h-[30px]" />
                      <div className="grid gap-0 md:grid-cols-3">
                        <div className="border-b border-[#7aa8b7] md:border-b-0 md:border-r">
                          <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                            {t("fields.originalEnglish")}
                          </div>
                          <EmptyInput />
                        </div>
                        <div className="border-b border-[#7aa8b7] md:border-b-0 md:border-r">
                          <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                            {t("fields.transcription")}
                          </div>
                          <EmptyInput />
                        </div>
                        <div>
                          <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                            {t("fields.originalLanguage")}
                          </div>
                          <EmptyInput />
                        </div>
                      </div>
                    </section>

                    <div className="mt-[14px] space-y-[10px]">
                      <EmptyTable columns={[t("tables.authors"), t("tables.authorType"), t("tables.writingLanguage")]} rows={1} />
                      <EmptyTable columns={[t("tables.contributors"), t("tables.contributionType"), t("tables.writingLanguage")]} rows={2} />
                      <EmptyTable columns={[t("tables.publishers"), t("tables.country"), t("tables.isbn")]} rows={1} />
                      <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                        <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                          {t("tables.yearPages")}
                        </div>
                        <EmptyInput />
                      </section>
                      <div className="grid gap-[10px] md:grid-cols-4">
                        <MiniCard title={t("tables.category")} />
                        <MiniCard title={t("tables.subject")} />
                        <MiniCard title={t("tables.gender")} />
                        <MiniCard title={t("tables.targetAudience")} />
                      </div>
                    </div>
                  </>
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
                    <div className="grid gap-[10px] md:grid-cols-4">
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
            <div className="flex h-full flex-col items-center justify-between py-[94px] text-[14px] leading-none text-black">
              <span className="[writing-mode:vertical-rl]">{t("right.bookCardsFound")}</span>
              <span className="[writing-mode:vertical-rl]">{t("right.database")}</span>
              <span className="[writing-mode:vertical-rl] text-[#ff1d1d]">{t("right.records")}</span>
            </div>
          </aside>
        </section>

        <StavnetFooter
          items={footerItems}
          className="md:bottom-[2.2vh] md:left-[4.6vw] md:right-[4.6vw]"
          itemClassName="md:min-h-[70px] md:text-[14px]"
          mobileGridClassName="grid-cols-3 sm:grid-cols-4"
          desktopMode="compact"
        />
      </div>
    </main>
  );
}
