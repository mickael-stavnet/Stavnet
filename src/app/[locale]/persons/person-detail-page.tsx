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
  buildPersonsByLanguageHref,
} from "@/lib/detail-links";
import { cn } from "@/lib/utils";
import type { PersonDetail } from "@/lib/data/persons";
import {
  type PersonBibliographyDisplayRow,
  usePersonBibliography,
} from "@/hooks/use-person-bibliography";

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

const PERSON_BIBLIOGRAPHY_COLUMN_WIDTHS = ["14%", "18%", "32%", "12%", "12%", "12%"] as const;
const EMPTY_BIBLIOGRAPHY_ROW: PersonBibliographyDisplayRow = {
  type: "",
  language: "",
  title: "",
  year: "",
  issue: "",
  parution: "",
  faconnage: "",
};

interface MobileBibliographyCardProps {
  labels: {
    type: string;
    language: string;
    title: string;
    year: string;
    parution: string;
    faconnage: string;
  };
  row: PersonBibliographyDisplayRow;
}

interface PersonBibliographySectionProps {
  count: string;
  rows: PersonBibliographyDisplayRow[];
  statLabel: string;
  labels: MobileBibliographyCardProps["labels"];
}

interface DesktopBibliographyTableProps {
  rows: PersonBibliographyDisplayRow[];
  labels: MobileBibliographyCardProps["labels"];
  className?: string;
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
          <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{labels.parution}</p>
          <p className="text-[13px] text-black">{row.parution || "—"}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">{labels.faconnage}</p>
        <p className="text-[13px] text-black">{row.faconnage || "—"}</p>
      </div>
    </article>
  );
}

function DesktopBibliographyTable({ rows, labels, className }: DesktopBibliographyTableProps) {
  const filledRows = rows.length > 0 ? rows : [EMPTY_BIBLIOGRAPHY_ROW];

  return (
    <div className={cn("hidden min-h-0 flex-1 md:flex md:flex-col", className)}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full table-fixed border-collapse bg-transparent text-black">
          <colgroup>
            {PERSON_BIBLIOGRAPHY_COLUMN_WIDTHS.map((width, index) => (
              <col key={`${width}-${index}`} style={{ width }} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-[#fff8c8] text-[12px] uppercase leading-none">
              <th className="border border-[#7aa8b7] px-3 py-[3px] text-left font-normal">{labels.type}</th>
              <th className="border border-[#7aa8b7] px-3 py-[3px] text-left font-normal">{labels.language}</th>
              <th className="border border-[#7aa8b7] px-3 py-[3px] text-left font-normal">{labels.title}</th>
              <th className="border border-[#7aa8b7] px-3 py-[3px] text-left font-normal">{labels.year}</th>
              <th className="border border-[#7aa8b7] px-3 py-[3px] text-left font-normal">{labels.parution}</th>
              <th className="border border-[#7aa8b7] px-3 py-[3px] text-left font-normal">{labels.faconnage}</th>
            </tr>
          </thead>
          <tbody>
            {filledRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="h-[34px] border border-[#7aa8b7] px-3 align-middle text-[14px]">{row.type || "—"}</td>
                <td className="h-[34px] border border-[#7aa8b7] px-3 align-middle text-[14px]">{row.language || "—"}</td>
                <td className="h-[34px] border border-[#7aa8b7] px-3 align-middle text-[14px]">{renderBookTitleValue(row.title)}</td>
                <td className="h-[34px] border border-[#7aa8b7] px-3 align-middle text-[14px]">{row.year || "—"}</td>
                <td className="h-[34px] border border-[#7aa8b7] px-3 align-middle text-[14px]">{row.parution || "—"}</td>
                <td className="h-[34px] border border-[#7aa8b7] px-3 align-middle text-[14px]">{row.faconnage || "—"}</td>
              </tr>
            ))}
            <tr>
              <td className="h-[64px] border border-[#7aa8b7]" />
              <td className="h-[64px] border border-[#7aa8b7]" />
              <td className="h-[64px] border border-[#7aa8b7]" />
              <td className="h-[64px] border border-[#7aa8b7]" />
              <td className="h-[64px] border border-[#7aa8b7]" />
              <td className="h-[64px] border border-[#7aa8b7]" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PersonBibliographySection({ count, rows, statLabel, labels }: PersonBibliographySectionProps) {
  const filledRows = rows.length > 0 ? rows : [EMPTY_BIBLIOGRAPHY_ROW];

  return (
    <section className="flex h-full min-h-0 flex-col space-y-[8px]">
      <div className="rounded-[8px] border border-[#7aa8b7] bg-[#b2e0ef] px-3 py-2 md:hidden">
        <p className="text-[11px] font-bold uppercase leading-none text-[#07384a]">{statLabel}</p>
        <p className="mt-2 text-[22px] font-bold leading-none text-[#ff1d1d]">{count}</p>
      </div>

      <div className="hidden flex-wrap items-center gap-x-2 px-1 pt-1 text-[18px] font-bold leading-none text-black md:flex">
        <span>{statLabel}</span>
        <span className="text-[#ff1d1d]">{count}</span>
      </div>

      <div className="space-y-3 md:hidden">
        {filledRows.map((row, rowIndex) => (
          <MobileBibliographyCard key={rowIndex} labels={labels} row={row} />
        ))}
      </div>

      <DesktopBibliographyTable rows={filledRows} labels={labels} />
    </section>
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

function LabelCell({ label, className }: { label: string; className?: string }) {
  return <div className={cn("border border-[#7aa8b7] bg-[#fff8c8] px-[10px] py-[4px] text-[11px] uppercase leading-none text-black md:px-3 md:text-[12px]", className)}>{label}</div>;
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
    parution: t("bibliography.columns.parution"),
    faconnage: t("bibliography.columns.faconnage"),
  };
  const { bibliographyRows, originalRows, translatedRows } = usePersonBibliography(person.bibliographyRows);
  const bibliographyCount = String(bibliographyRows.length);
  const originalTitlesCount = String(originalRows.length);
  const translationsCount = String(translatedRows.length);
  const publicationLanguagesCount = String(new Set(translatedRows.map((row) => row.language.trim()).filter(Boolean)).size);

  return (
    <main dir="ltr" className="relative min-h-[100svh] min-h-[100dvh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:h-[100dvh] md:overflow-hidden">
      <Image src="/background/background.png" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-95 saturate-[1.08]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(210,229,242,0.18),rgba(210,229,242,0.08))]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] min-h-[100dvh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-4 md:h-screen md:h-[100dvh] md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName={t("header.cardTitle")}
          title={t("header.title")}
          subtitle={t("header.subtitle")}
        />

        <section className="mt-6 flex min-w-0 flex-col gap-5 md:absolute md:left-1/2 md:top-[160px] md:bottom-[100px] md:w-[1341px] md:max-w-[calc(100vw-24px)] md:-translate-x-1/2 md:box-border md:pl-[221px] md:pr-[35px]">
          <aside className="hidden md:absolute md:left-0 md:top-[66px] md:flex md:h-[min(660px,calc(100dvh-380px))] md:w-[209px] md:flex-col md:items-end md:gap-5">
            <div className="relative h-[254px] w-[209px] overflow-hidden border border-[#6c99a7] bg-[#d7eef6] shadow-[3px_3px_6px_rgba(0,0,0,0.18)]">
              <Image
                src={person.imageSrc}
                alt={person.name}
                fill
                sizes="209px"
                className="object-cover object-center"
              />
            </div>
          </aside>

          <section className="min-w-0 md:w-full md:max-w-none">
            <nav className="grid grid-cols-2 gap-2 pb-2 md:shrink-0 md:grid-cols-[108px_repeat(7,minmax(0,1fr))] md:items-end md:gap-[12px] md:pb-0 [@media(max-width:1440px)]:gap-[8px]">
              {tabs.map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                    className={cn(
                    "min-h-[42px] min-w-0 rounded-t-[8px] border border-[#d1bb48] px-2 py-[6px] text-center text-[12px] font-bold leading-[1.08] shadow-[3px_3px_5px_rgba(0,0,0,0.28)] transition-colors md:min-h-[48px] md:px-4 md:text-[15px] [@media(max-width:1440px)]:min-h-[44px] [@media(max-width:1440px)]:px-2 [@media(max-width:1440px)]:text-[13px]",
                    activeTab === tabKey ? "bg-[#91d3ea] font-semibold text-black md:min-h-[54px] md:text-[19px] md:font-bold [@media(max-width:1440px)]:min-h-[48px] [@media(max-width:1440px)]:text-[16px]" : "bg-[#ffea56] text-black hover:bg-[#fff16f]",
                  )}
                >
                  {t(`tabs.${tabKey}`)}
                </button>
              ))}
            </nav>

            <div className="relative mt-[2px] flex min-h-[660px] flex-col rounded-[8px] border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[4px_4px_8px_rgba(0,0,0,0.18)] md:h-[min(660px,calc(100dvh-370px))] md:min-h-0 md:overflow-hidden md:flex-row">
              <aside className="border-b border-[#7aa8b7] px-3 py-4 md:w-[126px] md:border-b-0 md:border-r md:px-4 md:py-5">
                <p className="text-center text-[18px] font-bold leading-tight text-black md:text-[22px]">{t("side.authorCard")}</p>
              </aside>

              <div className="min-w-0 flex-1 px-[12px] py-[12px] md:min-h-0 md:overflow-y-auto md:px-[16px] md:py-[16px]">
                {activeTab === "authorCard" ? (
                  <div className="grid h-full grid-rows-[auto_auto_minmax(0,1fr)] gap-y-[14px] md:gap-y-[8px]">
                    <div className="grid gap-[10px] md:gap-[8px] lg:grid-cols-[2.1fr_0.98fr]">
                      <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                        <LabelCell label={t("fields.person")} className="md:py-[4px]" />
                        <FilledBox value={person.name} className="border-x-0 border-b text-[16px] md:min-h-[36px] md:text-[17px]" />
                        <div className="grid md:grid-cols-3">
                          <div className="md:col-span-2">
                            <LabelCell label={t("fields.birth")} className="md:py-[4px]" />
                            <FilledBox value={person.birthInfo} className="border-x-0 border-b md:min-h-[36px] md:border-b-0" />
                          </div>
                          <div>
                            {person.deathInfo.trim() ? <LabelCell label={t("fields.death")} className="md:py-[4px]" /> : null}
                            <FilledBox value={person.deathInfo.trim() ? person.deathInfo : "\u00a0"} className="border-x-0 md:min-h-[36px]" />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-[1.6fr_1fr]">
                          <div>
                            <LabelCell label={t("fields.activity")} className="md:py-[4px]" />
                            <FilledBox value={person.professionalActivity} className="border-x-0 border-b-0 md:min-h-[36px] md:text-[15px]" />
                          </div>
                          <div>
                            <LabelCell label={t("fields.language")} className="md:py-[4px]" />
                            <FilledBox
                              value={
                                person.language
                                  ? <ClickableDetailValue href={buildPersonsByLanguageHref(person.language)} value={person.language} />
                                  : person.residence || person.type || "—"
                              }
                              className="border-x-0 border-b-0 md:min-h-[36px] md:text-[15px]"
                            />
                          </div>
                        </div>
                      </section>

                      <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                        <LabelCell label={t("fields.synonyms")} className="md:py-[4px]" />
                        <div className="grid h-full grid-rows-[42px_repeat(4,1fr)] md:grid-rows-[36px_repeat(4,1fr)]">
                          <FilledBox value={person.alternateName} className="border-x-0 border-b text-[14px] font-normal md:min-h-[36px] md:text-[15px]" />
                          <div className="border-b border-[#7aa8b7]" />
                          <div className="border-b border-[#7aa8b7]" />
                          <div className="border-b border-[#7aa8b7]" />
                          <div />
                        </div>
                      </section>
                    </div>

                    <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                      <LabelCell label={t("fields.biography")} className="md:py-[4px]" />
                      <div className="max-h-[154px] overflow-auto px-3 py-3 text-[13px] leading-[1.45] text-black md:h-[76px] md:max-h-none md:py-2 md:text-[15px] md:leading-[1.4]">
                        {person.biography || "—"}
                      </div>
                    </section>

                    <section className="flex h-full min-h-0 flex-col space-y-[8px]">
                      <div className="grid gap-2 sm:grid-cols-3 md:hidden">
                        <div className="rounded-[8px] border border-[#7aa8b7] bg-[#b2e0ef] px-3 py-2">
                          <p className="text-[11px] font-bold uppercase leading-none text-[#07384a]">{t("bibliography.originalTitles")}</p>
                          <p className="mt-2 text-[22px] font-bold leading-none text-[#ff1d1d]">{originalTitlesCount}</p>
                        </div>
                        <div className="rounded-[8px] border border-[#7aa8b7] bg-[#b2e0ef] px-3 py-2">
                          <p className="text-[11px] font-bold uppercase leading-none text-[#07384a]">{t("bibliography.translations")}</p>
                          <p className="mt-2 text-[22px] font-bold leading-none text-[#ff1d1d]">{translationsCount}</p>
                        </div>
                        <div className="rounded-[8px] border border-[#7aa8b7] bg-[#b2e0ef] px-3 py-2 sm:col-span-1">
                          <p className="text-[11px] font-bold uppercase leading-none text-[#07384a]">{t("bibliography.publicationLanguages")}</p>
                          <p className="mt-2 text-[22px] font-bold leading-none text-[#ff1d1d]">{publicationLanguagesCount}</p>
                        </div>
                      </div>

                      <div className="hidden flex-wrap items-center gap-x-6 gap-y-2 px-1 pt-1 text-[18px] font-bold leading-none text-black md:flex">
                        <span className="inline-flex items-center gap-x-2">
                          <span>{t("bibliography.title")} :</span>
                          <span className="text-[#ff1d1d]">{bibliographyCount}</span>
                        </span>
                        <span className="inline-flex items-center gap-x-2">
                          <span>{t("bibliography.originalTitles")}</span>
                          <span className="text-[#ff1d1d]">{originalTitlesCount}</span>
                        </span>
                        <span className="inline-flex items-center gap-x-2">
                          <span>{t("bibliography.translations")}</span>
                          <span className="text-[#ff1d1d]">{translationsCount}</span>
                        </span>
                        <span className="inline-flex items-center gap-x-2">
                          <span>{t("bibliography.publicationLanguages")}</span>
                          <span className="text-[#ff1d1d]">{publicationLanguagesCount}</span>
                        </span>
                      </div>

                      <div className="space-y-3 md:hidden">
                        {bibliographyRows.map((row, rowIndex) => (
                          <MobileBibliographyCard key={rowIndex} labels={mobileBibliographyLabels} row={row} />
                        ))}
                      </div>

                      <DesktopBibliographyTable
                        rows={bibliographyRows}
                        labels={mobileBibliographyLabels}
                      />
                    </section>
                  </div>
                ) : null}

                {activeTab === "originalTitles" ? (
                  <PersonBibliographySection
                    count={person.bibliographyStats.originalTitles}
                    rows={originalRows}
                    statLabel={t("bibliography.originalTitles")}
                    labels={mobileBibliographyLabels}
                  />
                ) : null}
                {activeTab === "translatedTitles" ? (
                  <PersonBibliographySection
                    count={person.bibliographyStats.translations}
                    rows={translatedRows}
                    statLabel={t("bibliography.translations")}
                    labels={mobileBibliographyLabels}
                  />
                ) : null}
                {activeTab === "authorArticles" ? <BlankTabPanel title={t("content.authorArticles")} rows={3} /> : null}
                {activeTab === "authorPublications" ? <BlankTabPanel title={t("content.authorPublications")} rows={3} /> : null}
                {activeTab === "pressCritiques" ? <BlankTabPanel title={t("content.pressCritiques")} rows={3} /> : null}
                {activeTab === "awards" ? <BlankTabPanel title={t("content.awards")} rows={3} /> : null}
                {activeTab === "statistics" ? <BlankTabPanel title={t("content.statistics")} rows={3} /> : null}
              </div>
            </div>
          </section>

          <aside className="hidden md:absolute md:right-0 md:top-[66px] md:flex md:h-[min(660px,calc(100dvh-380px))] md:w-[34px] md:items-center md:justify-center">
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
          className="md:left-[calc(50%+75.5px)] md:right-auto md:w-[1120px] md:max-w-[calc(100vw-210px)] md:-translate-x-1/2"
        />
      </div>
    </main>
  );
}
