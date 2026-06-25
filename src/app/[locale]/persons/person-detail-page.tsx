"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import { cn } from "@/lib/utils";
import type { PersonBibliographyRow, PersonDetail } from "@/lib/data/persons";

type TabKey =
  | "authorCard"
  | "originalTitles"
  | "translatedTitles"
  | "authorArticles"
  | "authorPublications"
  | "pressCritiques"
  | "awards"
  | "statistics";

interface PersonDetailPageProps {
  person: PersonDetail;
}

interface MobileBibliographyCardProps {
  labels: {
    type: string;
    language: string;
    title: string;
    year: string;
    issue: string;
  };
  row: PersonBibliographyRow;
}

function MobileBibliographyCard({ labels, row }: MobileBibliographyCardProps) {
  return (
    <article className="rounded-[6px] border border-[#7aa8b7] bg-[#b2e0ef] p-3">
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{labels.type}</p>
        <p className="text-[13px] text-black">{row.type || "—"}</p>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{labels.language}</p>
        <p className="text-[13px] text-black">{row.language || "—"}</p>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{labels.title}</p>
        <p className="text-[13px] text-black">{row.title || "—"}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{labels.year}</p>
          <p className="text-[13px] text-black">{row.year || "—"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{labels.issue}</p>
          <p className="text-[13px] text-black">{row.issue || "—"}</p>
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
        "flex min-h-[38px] items-center border border-[#7aa8b7] bg-[#a7dcee] px-[10px] text-[13px] font-semibold leading-none text-black md:min-h-[42px] md:px-3 md:text-[16px]",
        className,
      )}
    >
      {value || "—"}
    </div>
  );
}

function LabelCell({ label }: { label: string }) {
  return <div className="border border-[#7aa8b7] bg-[#fff8c8] px-[10px] py-[4px] text-[11px] uppercase leading-none text-black md:px-3 md:text-[12px]">{label}</div>;
}

function BlankTabPanel({ title, rows = 3 }: { title: string; rows?: number }) {
  return (
    <section className="border border-[#7aa8b7] bg-[#a7dcee]">
      <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[4px] text-[12px] uppercase leading-none text-black">{title}</div>
      <div className="p-[10px]">
        <div className="border border-[#7aa8b7] bg-[#b2e0ef]">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className={cn("h-[92px] border-b border-[#7aa8b7]", index === rows - 1 && "border-b-0")} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PersonDetailPage({ person }: PersonDetailPageProps) {
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
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "list", icon: "/icons/icons-nav/book.png", href: "/persons" as const, label: t("footer.list") },
    { key: "search", icon: "/icons/icons-nav/rechercher.png", href: "/search" as const, label: t("footer.search") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/persons/details" as const, label: t("footer.help") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/persons/details" as const, label: t("footer.move") },
  ];
  const mobileBibliographyLabels = {
    type: t("bibliography.columns.type"),
    language: t("bibliography.columns.language"),
    title: t("bibliography.columns.title"),
    year: t("bibliography.columns.year"),
    issue: t("bibliography.columns.issue"),
  };

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image src="/background/background.png" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-95 saturate-[1.08]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(210,229,242,0.18),rgba(210,229,242,0.08))]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-4 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName={t("header.cardTitle")}
          title={t("header.title")}
          subtitle={t("header.subtitle")}
          headerClassName="md:h-[146px]"
          logoClassName="md:left-[2.4vw] md:top-[10px] md:w-[320px]"
          badgeClassName="md:left-[calc(50%-92px)] md:h-[118px] md:w-[248px] md:-translate-x-1/2"
          titleBlockClassName="md:left-[calc(50%+18px)] md:w-[1320px] md:-translate-x-1/2 md:text-right"
          titleClassName="text-[34px] md:text-[32px]"
          subtitleClassName="text-[17px]"
        />

        <section className="mt-6 flex flex-col gap-4 md:absolute md:left-[3.8vw] md:right-[3.8vw] md:top-[172px] md:bottom-[118px] md:grid md:grid-cols-[96px_1fr] md:gap-[0px]">
          <aside aria-hidden="true" className="relative order-2 hidden flex-col gap-4 md:order-1 md:flex md:translate-x-[42px] md:overflow-visible md:pt-[24px]">
            <div className="hidden md:block md:h-[92px]" />
          </aside>

          <section className="order-1 min-w-0 md:order-2 md:mx-auto md:w-full md:max-w-[1320px] md:pr-[38px]">
            <nav className="grid grid-cols-2 gap-2 pb-2 md:grid-cols-[108px_repeat(7,minmax(0,1fr))] md:items-end md:gap-[12px] md:pb-0">
              {tabs.map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  className={cn(
                    "min-h-[52px] min-w-0 rounded-t-[8px] border border-[#d1bb48] px-2 py-[8px] text-center text-[12px] leading-[1.08] shadow-[3px_3px_5px_rgba(0,0,0,0.28)] transition-colors md:min-h-[60px] md:px-4 md:text-[15px]",
                    activeTab === tabKey ? "bg-[#91d3ea] font-semibold text-black md:min-h-[68px] md:text-[19px] md:font-bold" : "bg-[#ffea56] text-black hover:bg-[#fff16f]",
                  )}
                >
                  {t(`tabs.${tabKey}`)}
                </button>
              ))}
            </nav>

            <div className="relative mt-[2px] flex min-h-[600px] flex-col rounded-[8px] border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[4px_4px_8px_rgba(0,0,0,0.18)] md:h-[690px] md:min-h-0 md:flex-row">
              <aside className="border-b border-[#7aa8b7] px-3 py-4 md:w-[126px] md:border-b-0 md:border-r md:px-4 md:py-5">
                <p className="text-center text-[18px] font-bold leading-tight text-black md:text-[22px]">{t("side.authorCard")}</p>
              </aside>

              <div className="min-w-0 flex-1 px-[12px] py-[12px] md:px-[16px] md:py-[16px]">
                {activeTab === "authorCard" ? (
                  <div className="grid h-full grid-rows-[auto_auto_minmax(0,1fr)] gap-y-[14px] md:gap-y-[16px]">
                    <div className="grid gap-[10px] lg:grid-cols-[2.1fr_0.98fr]">
                      <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                        <LabelCell label={t("fields.person")} />
                        <FilledBox value={person.name} className="border-x-0 border-b text-[16px] md:text-[17px]" />
                        <div className="grid md:grid-cols-3">
                          <div className="md:col-span-2">
                            <LabelCell label={t("fields.birth")} />
                            <FilledBox value={person.birthInfo} className="border-x-0 border-b md:border-b-0" />
                          </div>
                          <div>
                            <LabelCell label={t("fields.death")} />
                            <FilledBox value={person.deathInfo} className="border-x-0" />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-[1.6fr_1fr]">
                          <div>
                            <LabelCell label={t("fields.activity")} />
                            <FilledBox value={person.professionalActivity} className="border-x-0 border-b-0 md:text-[15px]" />
                          </div>
                          <div>
                            <LabelCell label={t("fields.language")} />
                            <FilledBox value={person.residence || person.language || person.type} className="border-x-0 border-b-0 md:text-[15px]" />
                          </div>
                        </div>
                      </section>

                      <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                        <LabelCell label={t("fields.synonyms")} />
                        <div className="grid h-full grid-rows-[42px_repeat(4,1fr)]">
                          <FilledBox value={person.alternateName} className="border-x-0 border-b text-[14px] font-normal md:text-[15px]" />
                          <div className="border-b border-[#7aa8b7]" />
                          <div className="border-b border-[#7aa8b7]" />
                          <div className="border-b border-[#7aa8b7]" />
                          <div />
                        </div>
                      </section>
                    </div>

                    <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                      <LabelCell label={t("fields.biography")} />
                      <div className="max-h-[140px] overflow-auto px-3 py-3 text-[13px] leading-[1.45] text-black md:h-[116px] md:max-h-none md:text-[16px] md:leading-[1.5]">
                        {person.biography || "—"}
                      </div>
                    </section>

                    <section className="flex h-full min-h-0 flex-col space-y-[8px]">
                      <div className="grid gap-2 sm:grid-cols-3 md:hidden">
                        <div className="rounded-[8px] border border-[#7aa8b7] bg-[#b2e0ef] px-3 py-2">
                          <p className="text-[11px] font-bold uppercase leading-none text-[#07384a]">{t("bibliography.originalTitles")}</p>
                          <p className="mt-2 text-[22px] font-bold leading-none text-[#ff1d1d]">{person.bibliographyStats.originalTitles}</p>
                        </div>
                        <div className="rounded-[8px] border border-[#7aa8b7] bg-[#b2e0ef] px-3 py-2">
                          <p className="text-[11px] font-bold uppercase leading-none text-[#07384a]">{t("bibliography.translations")}</p>
                          <p className="mt-2 text-[22px] font-bold leading-none text-[#ff1d1d]">{person.bibliographyStats.translations}</p>
                        </div>
                        <div className="rounded-[8px] border border-[#7aa8b7] bg-[#b2e0ef] px-3 py-2 sm:col-span-1">
                          <p className="text-[11px] font-bold uppercase leading-none text-[#07384a]">{t("bibliography.publicationLanguages")}</p>
                          <p className="mt-2 text-[22px] font-bold leading-none text-[#ff1d1d]">{person.bibliographyStats.publicationLanguages}</p>
                        </div>
                      </div>

                      <div className="hidden flex-wrap items-center gap-x-7 gap-y-2 px-1 pt-1 text-[18px] font-bold leading-none text-black md:flex">
                        <span>{t("bibliography.title")} :</span>
                        <span className="text-[#ff1d1d]">{person.bibliographyStats.originalTitles}</span>
                        <span>{t("bibliography.originalTitles")}</span>
                        <span className="text-[#ff1d1d]">{person.bibliographyStats.translations}</span>
                        <span>{t("bibliography.translations")}</span>
                        <span className="text-[#ff1d1d]">{person.bibliographyStats.publicationLanguages}</span>
                        <span>{t("bibliography.publicationLanguages")}</span>
                      </div>

                      <div className="space-y-3 md:hidden">
                        {person.bibliographyRows.map((row, rowIndex) => (
                          <MobileBibliographyCard key={rowIndex} labels={mobileBibliographyLabels} row={row} />
                        ))}
                      </div>

                      <section className="hidden min-h-0 flex-1 overflow-hidden border border-[#7aa8b7] bg-[#a7dcee] md:flex md:flex-col">
                        <div className="grid w-full grid-cols-[0.88fr_1.22fr_2.66fr_0.42fr_0.5fr] border-b border-[#7aa8b7] bg-[#fff8c8] text-[13px] uppercase leading-none text-black">
                          <div className="border-r border-[#7aa8b7] px-3 py-[5px]">{t("bibliography.columns.type")}</div>
                          <div className="border-r border-[#7aa8b7] px-3 py-[5px]">{t("bibliography.columns.language")}</div>
                          <div className="border-r border-[#7aa8b7] px-3 py-[5px]">{t("bibliography.columns.title")}</div>
                          <div className="border-r border-[#7aa8b7] px-3 py-[5px]">{t("bibliography.columns.year")}</div>
                          <div className="px-3 py-[5px] whitespace-nowrap">{t("bibliography.columns.issue")}</div>
                        </div>

                        {(person.bibliographyRows.length > 0 ? person.bibliographyRows : [{ type: "", language: "", title: "", year: "", issue: "" }]).map(
                          (row, rowIndex) => (
                            <div key={rowIndex} className="grid w-full grid-cols-[0.88fr_1.22fr_2.66fr_0.42fr_0.5fr]">
                              <div className="flex h-[42px] items-center border-r border-t border-[#7aa8b7] px-3 text-[15px] text-black">{row.type}</div>
                              <div className="flex h-[42px] items-center border-r border-t border-[#7aa8b7] px-3 text-[15px] text-black">{row.language}</div>
                              <div className="flex h-[42px] items-center border-r border-t border-[#7aa8b7] px-3 text-[15px] text-black">{row.title}</div>
                              <div className="flex h-[42px] items-center border-r border-t border-[#7aa8b7] px-3 text-[15px] text-black">{row.year}</div>
                              <div className="flex h-[42px] items-center border-t border-[#7aa8b7] px-3 text-[15px] whitespace-nowrap text-black">{row.issue}</div>
                            </div>
                          ),
                        )}
                        <div className="grid min-h-0 flex-1 grid-cols-[0.88fr_1.22fr_2.66fr_0.42fr_0.5fr]">
                          <div className="border-r border-t border-[#7aa8b7]" />
                          <div className="border-r border-t border-[#7aa8b7]" />
                          <div className="border-r border-t border-[#7aa8b7]" />
                          <div className="border-r border-t border-[#7aa8b7]" />
                          <div className="border-t border-[#7aa8b7]" />
                        </div>
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
              <aside className="absolute bottom-0 left-[calc(100%+4px)] top-0 hidden w-[34px] items-center justify-start md:flex">
                <div className="flex h-full flex-col items-center justify-between py-[96px] text-[15px] leading-none text-black">
                  <span className="[writing-mode:vertical-rl]">{t("right.personCardsFound")}</span>
                  <span className="[writing-mode:vertical-rl] text-[17px] font-bold text-[#ff1d1d]">{person.stats.cardsFound}</span>
                  <span className="[writing-mode:vertical-rl]">{t("right.databaseContains")}</span>
                  <span className="[writing-mode:vertical-rl] text-[17px] font-bold text-[#ff1d1d]">{person.stats.databaseContains}</span>
                </div>
              </aside>
            </div>
          </section>
        </section>

        <StavnetFooter
          items={footerItems}
          className="md:bottom-[1.6vh] md:left-[calc(50%+18px)] md:right-auto md:w-[min(1460px,95vw)] md:-translate-x-1/2"
          itemClassName="md:min-h-[58px] md:text-[13px]"
          mobileGridClassName="grid-cols-2 sm:grid-cols-4"
          desktopMode="compact"
        />
      </div>
    </main>
  );
}
