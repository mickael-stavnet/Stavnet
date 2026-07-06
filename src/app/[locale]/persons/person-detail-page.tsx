"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ReactNode } from "react";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import {
  ClickableDetailValue,
  buildBookTitleResolverHref,
  buildRelatedBooksHref,
} from "@/lib/detail-links";
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

const PERSON_BIBLIOGRAPHY_GRID =
  "md:grid-cols-[minmax(0,0.84fr)_minmax(0,1.14fr)_minmax(0,2.58fr)_72px_126px]";

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

function renderBookTitleValue(value: string) {
  return value ? <ClickableDetailValue href={buildBookTitleResolverHref(value)} value={value} /> : "—";
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
        <p className="text-[13px] text-black">{renderBookTitleValue(row.title)}</p>
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
  value: ReactNode;
  className?: string;
}

function FilledBox({ value, className }: FilledBoxProps) {
  return (
    <div
      className={cn(
        "flex min-h-[42px] items-center border border-[#7aa8b7] bg-[#a7dcee] px-[10px] text-[13px] font-semibold leading-none text-black md:min-h-[46px] md:px-3 md:text-[16px]",
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
            <div key={index} className={cn("h-[102px] border-b border-[#7aa8b7]", index === rows - 1 && "border-b-0")} />
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
    <main dir="ltr" className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image src="/background/background.png" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-95 saturate-[1.08]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(210,229,242,0.18),rgba(210,229,242,0.08))]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-4 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName={t("header.cardTitle")}
          title={t("header.title")}
          subtitle={t("header.subtitle")}
        />

        <section className="mt-6 flex min-w-0 flex-col gap-5 md:absolute md:left-1/2 md:top-[172px] md:bottom-[118px] md:w-[1120px] md:max-w-[calc(100vw-240px)] md:-translate-x-1/2">
          <aside className="hidden md:absolute md:right-[calc(100%+12px)] md:top-[66px] md:flex md:h-[660px] md:w-[174px] md:flex-col md:items-end md:gap-5">
            <div className="relative h-[212px] w-[174px] overflow-hidden border border-[#6c99a7] bg-[#d7eef6] shadow-[3px_3px_6px_rgba(0,0,0,0.18)]">
              <Image
                src={person.imageSrc}
                alt={person.name}
                fill
                sizes="174px"
                className="object-cover object-center"
              />
            </div>
          </aside>

          <section className="min-w-0 md:w-[1120px] md:max-w-none">
            <nav className="grid grid-cols-2 gap-2 pb-2 md:shrink-0 md:grid-cols-[108px_repeat(7,minmax(0,1fr))] md:items-end md:gap-[12px] md:pb-0">
              {tabs.map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                    className={cn(
                    "min-h-[52px] min-w-0 rounded-t-[8px] border border-[#d1bb48] px-2 py-[8px] text-center text-[12px] font-bold leading-[1.08] shadow-[3px_3px_5px_rgba(0,0,0,0.28)] transition-colors md:min-h-[60px] md:px-4 md:text-[15px]",
                    activeTab === tabKey ? "bg-[#91d3ea] font-semibold text-black md:min-h-[68px] md:text-[19px] md:font-bold" : "bg-[#ffea56] text-black hover:bg-[#fff16f]",
                  )}
                >
                  {t(`tabs.${tabKey}`)}
                </button>
              ))}
            </nav>

            <div className="relative mt-[2px] flex min-h-[660px] flex-col rounded-[8px] border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[4px_4px_8px_rgba(0,0,0,0.18)] md:h-[660px] md:flex-row">
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
                            <FilledBox
                              value={
                                person.language
                                  ? <ClickableDetailValue href={buildRelatedBooksHref("authorWritingLanguage", person.language)} value={person.language} />
                                  : person.residence || person.type || "—"
                              }
                              className="border-x-0 border-b-0 md:text-[15px]"
                            />
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
                      <div className="max-h-[154px] overflow-auto px-3 py-3 text-[13px] leading-[1.45] text-black md:h-[128px] md:max-h-none md:text-[16px] md:leading-[1.5]">
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

                      <div className="hidden flex-wrap items-center gap-x-6 gap-y-2 px-1 pt-1 text-[18px] font-bold leading-none text-black md:flex">
                        <span className="inline-flex items-center gap-x-2">
                          <span>{t("bibliography.title")} :</span>
                          <span className="text-[#ff1d1d]">{person.bibliographyStats.originalTitles}</span>
                        </span>
                        <span className="inline-flex items-center gap-x-2">
                          <span>{t("bibliography.originalTitles")}</span>
                          <span className="text-[#ff1d1d]">{person.bibliographyStats.translations}</span>
                        </span>
                        <span className="inline-flex items-center gap-x-2">
                          <span>{t("bibliography.translations")}</span>
                          <span className="text-[#ff1d1d]">{person.bibliographyStats.publicationLanguages}</span>
                        </span>
                        <span>{t("bibliography.publicationLanguages")}</span>
                      </div>

                      <div className="space-y-3 md:hidden">
                        {person.bibliographyRows.map((row, rowIndex) => (
                          <MobileBibliographyCard key={rowIndex} labels={mobileBibliographyLabels} row={row} />
                        ))}
                      </div>

                      <section className="hidden min-h-0 flex-1 overflow-hidden border border-[#7aa8b7] bg-[#a7dcee] md:flex md:flex-col">
                        <div className={cn("grid w-full border-b border-[#7aa8b7] bg-[#fff8c8] text-[13px] uppercase leading-none text-black", PERSON_BIBLIOGRAPHY_GRID)}>
                          <div className="min-w-0 border-r border-[#7aa8b7] px-3 py-[5px]">{t("bibliography.columns.type")}</div>
                          <div className="min-w-0 border-r border-[#7aa8b7] px-3 py-[5px]">{t("bibliography.columns.language")}</div>
                          <div className="min-w-0 border-r border-[#7aa8b7] px-3 py-[5px]">{t("bibliography.columns.title")}</div>
                          <div className="min-w-0 border-r border-[#7aa8b7] px-3 py-[5px]">{t("bibliography.columns.year")}</div>
                          <div className="min-w-0 px-3 py-[5px]">{t("bibliography.columns.issue")}</div>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto">
                          {(person.bibliographyRows.length > 0 ? person.bibliographyRows : [{ type: "", language: "", title: "", year: "", issue: "" }]).map(
                            (row, rowIndex) => (
                              <div key={rowIndex} className={cn("grid w-full", PERSON_BIBLIOGRAPHY_GRID)}>
                                <div className="flex min-w-0 h-[46px] items-center border-r border-t border-[#7aa8b7] px-3 text-[15px] text-black">{row.type}</div>
                                <div className="flex min-w-0 h-[46px] items-center border-r border-t border-[#7aa8b7] px-3 text-[15px] text-black">{row.language}</div>
                                <div className="flex min-w-0 h-[46px] items-center border-r border-t border-[#7aa8b7] px-3 text-[15px] text-black">{renderBookTitleValue(row.title)}</div>
                                <div className="flex min-w-0 h-[46px] items-center border-r border-t border-[#7aa8b7] px-3 text-[15px] text-black">{row.year}</div>
                                <div className="flex min-w-0 h-[46px] items-center border-t border-[#7aa8b7] px-3 text-[15px] text-black">{row.issue}</div>
                              </div>
                            ),
                          )}
                          <div className={cn("grid min-h-[138px]", PERSON_BIBLIOGRAPHY_GRID)}>
                            <div className="border-r border-t border-[#7aa8b7]" />
                            <div className="border-r border-t border-[#7aa8b7]" />
                            <div className="border-r border-t border-[#7aa8b7]" />
                            <div className="border-r border-t border-[#7aa8b7]" />
                            <div className="border-t border-[#7aa8b7]" />
                          </div>
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
            </div>
          </section>

          <aside className="hidden md:absolute md:left-[calc(100%+1px)] md:top-[66px] md:flex md:h-[660px] md:w-[34px] md:items-center md:justify-center">
            <div className="flex flex-col items-center justify-center gap-[14px] text-[15px] leading-none text-black">
              <span className="[writing-mode:vertical-rl]">{t("right.personCardsFound")}</span>
              <span className="[writing-mode:vertical-rl] text-[17px] font-bold text-[#ff1d1d]">{person.stats.cardsFound}</span>
              <div className="h-[18px]" />
              <span className="[writing-mode:vertical-rl]">{t("right.databaseContains")}</span>
              <span className="[writing-mode:vertical-rl] text-[17px] font-bold text-[#ff1d1d]">{person.stats.databaseContains}</span>
            </div>
          </aside>
        </section>

        <StavnetFooter
          items={footerItems}
          desktopMode="compact"
          className="md:left-1/2 md:right-auto md:w-[1120px] md:max-w-[calc(100vw-240px)] md:-translate-x-1/2"
        />
      </div>
    </main>
  );
}
