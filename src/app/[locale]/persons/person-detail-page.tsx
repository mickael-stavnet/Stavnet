"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import { cn } from "@/lib/utils";

type TabKey =
  | "authorCard"
  | "originalTitles"
  | "translatedTitles"
  | "authorArticles"
  | "authorPublications"
  | "pressCritiques"
  | "awards"
  | "statistics";

type BibliographyRow = [string, string, string, string, string, string];

interface SamplePerson {
  fullName: string;
  birthInfo: string;
  professionalActivity: string;
  synonym: string;
  biography: string;
  bibliographyStats: {
    originalTitles: string;
    translations: string;
    publicationLanguages: string;
  };
  bibliographyRows: BibliographyRow[];
}

interface MobileBibliographyCardProps {
  labels: {
    type: string;
    language: string;
    title: string;
    year: string;
    issue: string;
  };
  row: BibliographyRow;
}

function MobileBibliographyCard({ labels, row }: MobileBibliographyCardProps) {
  const [originType, translationType, language, title, year, issue] = row;

  return (
    <article className="rounded-[6px] border border-[#7aa8b7] bg-[#b2e0ef] p-3">
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{labels.type}</p>
        <p className="text-[13px] text-black">{`${originType} ${translationType}`.trim() || "—"}</p>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{labels.language}</p>
        <p className="text-[13px] text-black">{language || "—"}</p>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{labels.title}</p>
        <p className="text-[13px] text-black">{title || "—"}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{labels.year}</p>
          <p className="text-[13px] text-black">{year || "—"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{labels.issue}</p>
          <p className="text-[13px] text-black">{issue || "—"}</p>
        </div>
      </div>
    </article>
  );
}

interface FilledBoxProps {
  value: string;
  className?: string;
}

function FilledBox({ value, className }: FilledBoxProps) {
  return (
    <div
      className={cn(
        "flex min-h-[38px] items-center border border-[#7aa8b7] bg-[#a7dcee] px-2 text-[13px] font-bold text-black",
        className,
      )}
    >
      {value}
    </div>
  );
}

function LabelCell({ label }: { label: string }) {
  return (
    <div className="border border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
      {label}
    </div>
  );
}

function BlankTabPanel({
  title,
  rows = 3,
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
        <div className="border border-[#7aa8b7] bg-[#b2e0ef]">
          {Array.from({ length: rows }).map((_, index) => (
            <div
              key={index}
              className={cn("h-[92px] border-b border-[#7aa8b7]", index === rows - 1 && "border-b-0")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PersonsPage() {
  const t = useTranslations("PersonFilePage");
  const tabs: TabKey[] = [
    "authorCard",
    "originalTitles",
    "translatedTitles",
    "authorArticles",
    "authorPublications",
    "pressCritiques",
    "awards",
    "statistics",
  ];
  const [activeTab, setActiveTab] = useState<TabKey>("authorCard");

  const samplePerson: SamplePerson = {
    fullName: "Nicolas Moshe Lazar",
    birthInfo: "Jerusalem, 1921",
    professionalActivity: "Poet, translator, literary critic",
    synonym: "Nicolas Moshe Lazar",
    biography:
      "French-language biography of the author, summarizing his literary career, publications, translations and editorial contribution within Israeli literature.",
    bibliographyStats: {
      originalTitles: "0",
      translations: "1",
      publicationLanguages: "1",
    },
    bibliographyRows: [
      ["O", "T", "French", "Poetes israeliennes d'aujourd'hui", "1960", "E01"],
      ["", "", "", "", "", ""],
      ["", "", "", "", "", ""],
    ],
  };

  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "list", icon: "/icons/icons-nav/book.png", href: "/persons" as const, label: t("footer.list") },
    { key: "search", icon: "/icons/icons-nav/rechercher.png", href: "/search" as const, label: t("footer.search") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/persons/details" as const, label: t("footer.help") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/persons/details" as const, label: t("footer.move") },
  ];
  const mobileBibliographyRows = samplePerson.bibliographyRows.filter((row) => row.some((value) => value.length > 0));
  const mobileBibliographyLabels = {
    type: t("bibliography.columns.type"),
    language: t("bibliography.columns.language"),
    title: t("bibliography.columns.title"),
    year: t("bibliography.columns.year"),
    issue: t("bibliography.columns.issue"),
  };

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

        <section className="mt-6 flex flex-col gap-4 md:absolute md:left-[4.8vw] md:right-[4.8vw] md:top-[154px] md:bottom-[154px] md:grid md:grid-cols-[88px_1fr_42px] md:gap-[4px]">
          <aside
            aria-hidden="true"
            className="relative order-2 hidden flex-col gap-4 md:order-1 md:flex md:translate-x-[42px] md:overflow-visible md:pt-[24px]"
          >
            <div className="hidden md:block md:h-[92px]" />
          </aside>

          <section className="order-1 min-w-0 md:order-2 md:mx-auto md:w-full md:max-w-[1230px]">
            <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 md:mx-0 md:grid md:grid-cols-[92px_repeat(7,minmax(0,1fr))] md:items-end md:gap-[10px] md:overflow-visible md:px-0 md:pb-0">
              {tabs.map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  className={cn(
                    "min-h-11 min-w-[128px] shrink-0 snap-start rounded-t-[8px] border border-[#d1bb48] px-3 py-[8px] text-center text-[13px] leading-[1.02] shadow-[3px_3px_5px_rgba(0,0,0,0.28)] transition-colors md:min-h-[52px] md:min-w-0",
                    activeTab === tabKey
                      ? "bg-[#91d3ea] text-black md:min-h-[58px] md:text-[17px] md:font-bold"
                      : "bg-[#ffea56] text-black hover:bg-[#fff16f]",
                  )}
                >
                  {t(`tabs.${tabKey}`)}
                </button>
              ))}
            </nav>

            <div className="mt-[2px] flex min-h-[540px] flex-col rounded-[8px] border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[4px_4px_8px_rgba(0,0,0,0.18)] md:h-[610px] md:min-h-0 md:flex-row">
              <aside className="border-b border-[#7aa8b7] px-3 py-4 md:w-[110px] md:border-b-0 md:border-r">
                <p className="text-center text-[18px] font-bold leading-tight text-black">{t("side.authorCard")}</p>
              </aside>

              <div className="min-w-0 flex-1 px-[12px] py-[12px]">
                {activeTab === "authorCard" ? (
                  <div className="grid h-full grid-rows-[auto_auto_1fr_auto] gap-y-[12px]">
                    <div className="grid gap-[10px] lg:grid-cols-[1.9fr_1fr]">
                      <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                        <LabelCell label={t("fields.person")} />
                        <FilledBox value={samplePerson.fullName} className="border-x-0 border-b text-[16px] md:text-[18px]" />
                        <div className="grid md:grid-cols-3">
                          <div className="md:col-span-2">
                            <LabelCell label={t("fields.birth")} />
                            <FilledBox value={samplePerson.birthInfo} className="border-x-0 border-b md:border-b-0" />
                          </div>
                          <div>
                            <LabelCell label="" />
                            <FilledBox value="" className="border-x-0" />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-[1.6fr_1fr]">
                          <div>
                            <LabelCell label={t("fields.activity")} />
                            <FilledBox value={samplePerson.professionalActivity} className="border-x-0 border-b-0" />
                          </div>
                          <div>
                            <LabelCell label="" />
                            <FilledBox value="" className="border-x-0 border-b-0" />
                          </div>
                        </div>
                      </section>

                      <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                        <LabelCell label={t("fields.synonyms")} />
                        <div className="grid grid-rows-[38px_repeat(4,1fr)]">
                          <FilledBox value={samplePerson.synonym} className="border-x-0 border-b text-[14px] font-normal" />
                          <div className="border-b border-[#7aa8b7]" />
                          <div className="border-b border-[#7aa8b7]" />
                          <div className="border-b border-[#7aa8b7]" />
                          <div />
                        </div>
                      </section>
                    </div>

                    <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                      <LabelCell label={t("fields.biography")} />
                      <div className="max-h-[140px] overflow-auto px-2 py-2 text-[13px] leading-[1.45] text-black md:h-[78px] md:max-h-none">
                        {samplePerson.biography}
                      </div>
                    </section>

                    <div />

                    <section className="space-y-[8px]">
                      <div className="grid gap-2 sm:grid-cols-3 md:hidden">
                        <div className="rounded-[8px] border border-[#7aa8b7] bg-[#b2e0ef] px-3 py-2">
                          <p className="text-[11px] font-bold uppercase leading-none text-[#07384a]">{t("bibliography.originalTitles")}</p>
                          <p className="mt-2 text-[22px] font-bold leading-none text-[#ff1d1d]">
                            {samplePerson.bibliographyStats.originalTitles}
                          </p>
                        </div>
                        <div className="rounded-[8px] border border-[#7aa8b7] bg-[#b2e0ef] px-3 py-2">
                          <p className="text-[11px] font-bold uppercase leading-none text-[#07384a]">{t("bibliography.translations")}</p>
                          <p className="mt-2 text-[22px] font-bold leading-none text-[#ff1d1d]">
                            {samplePerson.bibliographyStats.translations}
                          </p>
                        </div>
                        <div className="rounded-[8px] border border-[#7aa8b7] bg-[#b2e0ef] px-3 py-2 sm:col-span-1">
                          <p className="text-[11px] font-bold uppercase leading-none text-[#07384a]">
                            {t("bibliography.publicationLanguages")}
                          </p>
                          <p className="mt-2 text-[22px] font-bold leading-none text-[#ff1d1d]">
                            {samplePerson.bibliographyStats.publicationLanguages}
                          </p>
                        </div>
                      </div>

                      <div className="hidden flex-wrap items-center gap-x-6 gap-y-2 px-1 text-[16px] font-bold leading-none text-black md:flex">
                        <span>{t("bibliography.title")} :</span>
                        <span className="text-[#ff1d1d]">{samplePerson.bibliographyStats.originalTitles}</span>
                        <span>{t("bibliography.originalTitles")}</span>
                        <span className="text-[#ff1d1d]">{samplePerson.bibliographyStats.translations}</span>
                        <span>{t("bibliography.translations")}</span>
                        <span className="text-[#ff1d1d]">{samplePerson.bibliographyStats.publicationLanguages}</span>
                        <span>{t("bibliography.publicationLanguages")}</span>
                      </div>

                      <div className="space-y-3 md:hidden">
                        {mobileBibliographyRows.map((row, rowIndex) => (
                          <MobileBibliographyCard key={rowIndex} labels={mobileBibliographyLabels} row={row} />
                        ))}
                      </div>

                      <section className="hidden overflow-x-auto border border-[#7aa8b7] bg-[#a7dcee] md:block">
                        <div className="grid min-w-[620px] grid-cols-[160px_280px_1.6fr_70px_60px] border-b border-[#7aa8b7] bg-[#fff8c8] text-[12px] uppercase leading-none text-black">
                          <div className="border-r border-[#7aa8b7] px-2 py-[3px]">{t("bibliography.columns.type")}</div>
                          <div className="border-r border-[#7aa8b7] px-2 py-[3px]">{t("bibliography.columns.language")}</div>
                          <div className="border-r border-[#7aa8b7] px-2 py-[3px]">{t("bibliography.columns.title")}</div>
                          <div className="border-r border-[#7aa8b7] px-2 py-[3px]">{t("bibliography.columns.year")}</div>
                          <div className="px-2 py-[3px]">{t("bibliography.columns.issue")}</div>
                        </div>

                        {samplePerson.bibliographyRows.map((row, rowIndex) => (
                          <div key={rowIndex} className="grid min-w-[620px] grid-cols-[160px_280px_1.6fr_70px_60px]">
                            <div className="flex h-[34px] items-center border-r border-t border-[#7aa8b7] px-2 text-[13px] text-black">
                              {row[0]} {row[1]}
                            </div>
                            <div className="flex h-[34px] items-center border-r border-t border-[#7aa8b7] px-2 text-[13px] text-black">
                              {row[2]}
                            </div>
                            <div className="flex h-[34px] items-center border-r border-t border-[#7aa8b7] px-2 text-[13px] text-black">
                              {row[3]}
                            </div>
                            <div className="flex h-[34px] items-center border-r border-t border-[#7aa8b7] px-2 text-[13px] text-black">
                              {row[4]}
                            </div>
                            <div className="flex h-[34px] items-center border-t border-[#7aa8b7] px-2 text-[13px] text-black">
                              {row[5]}
                            </div>
                          </div>
                        ))}
                      </section>
                    </section>
                  </div>
                ) : null}

                {activeTab === "originalTitles" ? <BlankTabPanel title={t("content.originalTitles")} rows={3} /> : null}
                {activeTab === "translatedTitles" ? <BlankTabPanel title={t("content.translatedTitles")} rows={3} /> : null}
                {activeTab === "authorArticles" ? <BlankTabPanel title={t("content.authorArticles")} rows={3} /> : null}
                {activeTab === "authorPublications" ? <BlankTabPanel title={t("content.authorPublications")} rows={3} /> : null}
                {activeTab === "pressCritiques" ? <BlankTabPanel title={t("content.pressCritiques")} rows={3} /> : null}
                {activeTab === "awards" ? <BlankTabPanel title={t("content.awards")} rows={3} /> : null}
                {activeTab === "statistics" ? <BlankTabPanel title={t("content.statistics")} rows={3} /> : null}
              </div>
            </div>
          </section>

          <aside className="order-3 hidden items-center justify-center md:flex">
            <div className="flex h-full -translate-x-[10px] flex-col items-center justify-between py-[110px] text-[14px] leading-none text-black">
              <span className="[writing-mode:vertical-rl]">{t("right.personCardsFound")}</span>
              <span className="[writing-mode:vertical-rl] text-[#ff1d1d]">1</span>
              <span className="[writing-mode:vertical-rl]">{t("right.databaseContains")}</span>
              <span className="[writing-mode:vertical-rl] text-[#ff1d1d]">686</span>
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
