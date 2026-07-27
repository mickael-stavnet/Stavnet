"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ReactNode } from "react";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import { DetailStatisticsPanel } from "@/components/stavnet/detail-statistics-panel";
import { DetailEmptyTab } from "@/components/stavnet/detail-empty-tab";
import { Link } from "@/i18n/routing";
import type { OrganizationDetail } from "@/lib/data/orgs";
import { ClickableDetailValue, buildBookTitleResolverHref, buildOrganizationsByCountryHref } from "@/lib/detail-links";

type OrganizationTab =
  | "editorCard"
  | "diffuser"
  | "distributor"
  | "salesCounter"
  | "readingCommittee"
  | "staff"
  | "literaryPrizes"
  | "statistics";

interface OrganizationDetailPageProps {
  organization: OrganizationDetail;
}

function LabelCell({ label }: { label: string }) {
  return (
    <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
      {label}
    </div>
  );
}

function FilledCell({
  value,
  className = "",
}: {
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[42px] items-center border-b border-[#7aa8b7] bg-[#a7dcee] px-2 text-[13px] font-semibold text-black md:min-h-[46px] md:px-3 md:text-[16px] ${className}`}
    >
      {value || "—"}
    </div>
  );
}

function EmptyRows({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
              className={`min-h-[42px] border-b border-[#7aa8b7] bg-[#a7dcee] ${index === rows - 1 ? "border-b-0" : ""}`}
        />
      ))}
    </>
  );
}

function RedMarker() {
  return (
    <span className="mr-2 inline-block h-[11px] w-[11px] rounded-full border-[2px] border-[#ff1d1d]" />
  );
}

const ORGANIZATION_PUBLISHED_COLUMN_WIDTHS = ["62%", "30%", "8%"] as const;

export default function OrganizationsDetailPage({
  organization,
}: OrganizationDetailPageProps) {
  const t = useTranslations("OrganizationFilePage");
  const emptyT = useTranslations("EmptyStates");
  const statisticsT = useTranslations("Statistics");
  const tabs: OrganizationTab[] = [
    "editorCard",
    "diffuser",
    "distributor",
    "salesCounter",
    "readingCommittee",
    "staff",
    "literaryPrizes",
    "statistics",
  ];
  const [activeTab, setActiveTab] = useState<OrganizationTab>("editorCard");
  const footerItems = [
    {
      key: "back",
      icon: "/icons/icons-nav/back.png",
      href: "/home" as const,
      label: t("footer.back"),
    },
    {
      key: "menu",
      icon: "/icons/icons-nav/menu.png",
      href: "/menu" as const,
      label: t("footer.menu"),
    },
    {
      key: "close",
      icon: "/icons/icons-nav/close.png",
      href: "/" as const,
      label: t("footer.close"),
    },
    {
      key: "list",
      icon: "/icons/icons-nav/book.png",
      href: "/orgs" as const,
      label: t("footer.list"),
    },
    {
      key: "search",
      icon: "/icons/icons-nav/rechercher.png",
      href: "/search" as const,
      label: t("footer.search"),
    },
    {
      key: "help",
      icon: "/icons/icons-nav/help.png",
      href: "/orgs/details" as const,
      label: t("footer.help"),
    },
    {
      key: "move",
      icon: "/icons/icons-nav/next.png",
      href: "/orgs/details" as const,
      label: t("footer.move"),
    },
  ];

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

        <section className="mt-6 flex min-w-0 flex-col gap-5 md:absolute md:left-1/2 md:top-[160px] md:bottom-[100px] md:w-[1341px] md:max-w-[calc(100vw-24px)] md:-translate-x-1/2 md:box-border md:pl-[186px] md:pr-[35px]">
          <section className="grid gap-2 md:hidden">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[8px] border border-[#7aa8b7] bg-[#d8dde2] px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.04em] text-[#07384a]">
                  {t("right.organizationCardsFound")}
                </p>
                <p className="mt-1 text-[18px] font-bold text-[#ff1d1d]">
                  {organization.stats.cardsFound}
                </p>
              </div>
              <div className="rounded-[8px] border border-[#7aa8b7] bg-[#d8dde2] px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.04em] text-[#07384a]">
                  {t("right.databaseContains")}
                </p>
                <p className="mt-1 text-[18px] font-bold text-[#ff1d1d]">
                  {organization.stats.databaseContains}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[8px] border border-[#7aa8b7] bg-[#d8dde2] px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.04em] text-[#07384a]">
                  {t("side.creationDate")}
                </p>
                <p className="mt-1 text-[14px] text-black">
                  {organization.creationDate || "—"}
                </p>
              </div>
              <div className="rounded-[8px] border border-[#7aa8b7] bg-[#d8dde2] px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.04em] text-[#07384a]">
                  {t("side.titlesAtCatalog")}
                </p>
                <p className="mt-1 text-[14px] text-black">
                  {organization.publishedStats.titles}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="min-h-11 rounded-[8px] border border-[#d1bb48] bg-[#ffea56] px-4 text-[13px] font-bold text-black shadow-[3px_3px_5px_rgba(0,0,0,0.2)]"
            >
              {t("side.collections")}
            </button>
          </section>

          <aside className="hidden md:absolute md:left-0 md:top-[66px] md:flex md:h-[min(660px,calc(100dvh-380px))] md:w-[174px] md:flex-col md:items-center md:gap-5">
              <div className="flex h-[176px] w-[174px] items-center justify-center border border-[#c9b87f] bg-[#efe7d4] px-4 text-center shadow-[3px_3px_6px_rgba(0,0,0,0.18)]">
                <span className="text-[18px] leading-[1.2] text-[#6e5f38]">
                  {t("noLogoAvailable")}
                </span>
              </div>
              <div className="w-[174px] space-y-[9px] text-center text-[18px] leading-[1.05] text-black">
                <p>{t("side.creationDate")}</p>
                <p className="font-bold text-[22px] leading-none">
                  {organization.creationDate || "—"}
                </p>
              </div>
              <button
                type="button"
                className="h-[42px] w-[106px] self-center border border-[#d1bb48] bg-[#ffea56] text-[14px] font-bold leading-[1.05] shadow-[3px_3px_5px_rgba(0,0,0,0.2)]"
              >
                {t("side.collections")}
              </button>
              <div className="w-[174px] space-y-[9px] text-center text-[18px] leading-[1.05] text-black">
                <p>{t("side.titlesAtCatalog")}</p>
                <p className="font-bold text-[22px] leading-none">
                  {organization.publishedStats.titles}
                </p>
              </div>
          </aside>

          <section className="min-w-0 md:w-full md:max-w-none">
            <nav className="grid grid-cols-2 gap-2 pb-2 md:grid-cols-[108px_repeat(7,minmax(0,1fr))] md:items-end md:gap-[12px] md:pb-0 [@media(max-width:1440px)]:gap-[8px]">
              {tabs.map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  className={`min-h-[42px] min-w-0 rounded-t-[8px] border border-[#d1bb48] px-2 py-[6px] text-center text-[12px] font-bold leading-[1.08] shadow-[3px_3px_5px_rgba(0,0,0,0.28)] transition-colors md:min-h-[48px] md:px-4 md:text-[15px] [@media(max-width:1440px)]:min-h-[44px] [@media(max-width:1440px)]:px-2 [@media(max-width:1440px)]:text-[13px] ${
                    activeTab === tabKey
                      ? "bg-[#91d3ea] font-semibold text-black md:min-h-[54px] md:text-[19px] md:font-bold [@media(max-width:1440px)]:min-h-[48px] [@media(max-width:1440px)]:text-[16px]"
                      : "bg-[#ffea56] text-black hover:bg-[#fff16f]"
                  }`}
                >
                  {t(`tabs.${tabKey}`)}
                </button>
              ))}
            </nav>

            <div className="relative mt-[2px] flex min-h-[660px] flex-col rounded-[8px] border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[4px_4px_8px_rgba(0,0,0,0.18)] md:h-[min(660px,calc(100dvh-370px))] md:min-h-0 md:overflow-hidden md:flex-row">
              <aside className="border-b border-[#7aa8b7] px-3 py-4 md:w-[126px] md:border-b-0 md:border-r md:px-4 md:py-5">
                <p className="text-center text-[18px] font-bold leading-tight text-black md:text-[22px]">
                  {t("side.editorCard")}
                </p>
              </aside>

              <div className="min-w-0 flex-1 px-[12px] py-[12px] md:min-h-0 md:overflow-y-auto md:px-[16px] md:py-[16px]">
                {activeTab === "editorCard" ? (
                  <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-y-[14px] md:gap-y-[16px]">
                    <div className="grid gap-[10px] lg:grid-cols-[2.28fr_1fr]">
                      <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                        <LabelCell label={t("fields.editor")} />
                        <FilledCell
                          value={organization.name}
                          className="text-[16px] font-bold text-[#07384a]"
                        />
                        <LabelCell label={t("fields.address")} />
                        <FilledCell value="" />
                        <div className="grid gap-px bg-[#7aa8b7] md:grid-cols-3">
                          <div className="bg-[#a7dcee]">
                            <LabelCell label={t("fields.postalCode")} />
                            <FilledCell value="" className="border-b-0" />
                          </div>
                          <div className="bg-[#a7dcee]">
                            <LabelCell label={t("fields.city")} />
                            <FilledCell value="" className="border-b-0" />
                          </div>
                          <div className="bg-[#a7dcee]">
                            <LabelCell label={t("fields.country")} />
                            <FilledCell
                              value={
                                organization.country
                                  ? <ClickableDetailValue href={buildOrganizationsByCountryHref(organization.country)} value={organization.country} />
                                  : "—"
                              }
                              className="border-b-0"
                            />
                          </div>
                        </div>
                        <div className="grid gap-px bg-[#7aa8b7] md:grid-cols-2">
                          <div className="bg-[#a7dcee]">
                            <LabelCell label={t("fields.telephone")} />
                            <FilledCell value="" className="border-b-0" />
                          </div>
                          <div className="bg-[#a7dcee]">
                            <LabelCell label={t("fields.fax")} />
                            <FilledCell value="" className="border-b-0" />
                          </div>
                        </div>
                        <div className="grid gap-px bg-[#7aa8b7] md:grid-cols-2">
                          <div className="bg-[#a7dcee]">
                            <LabelCell label={t("fields.website")} />
                            <FilledCell value="" className="border-b-0" />
                          </div>
                          <div className="bg-[#a7dcee]">
                            <LabelCell label={t("fields.email")} />
                            <FilledCell value="" className="border-b-0" />
                          </div>
                        </div>
                      </section>

                      <div className="flex min-h-0 flex-col space-y-[8px]">
                        <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                          <LabelCell label={t("fields.synonyms")} />
                          <FilledCell
                            value={organization.synonym}
                            className="text-[14px] font-normal md:text-[15px]"
                          />
                          <EmptyRows rows={4} />
                        </section>

                        <section className="border border-[#7aa8b7] bg-[#fff15a]">
                          <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                            {t("fields.group")}
                          </div>
                          <div className="flex min-h-[34px] items-center px-2 text-[13px] text-black md:px-3 md:text-[15px]">
                            <RedMarker />
                            {organization.type ? (
                              <Link
                                href={{ pathname: "/orgs", query: { type: organization.type, page: "1" } }}
                                className="cursor-pointer underline decoration-current underline-offset-2 transition-colors hover:text-[#0f4c81]"
                              >
                                {organization.type}
                              </Link>
                            ) : (
                              "—"
                            )}
                          </div>
                        </section>
                      </div>
                    </div>

                    <section className="flex h-full min-h-0 flex-col space-y-[8px]">
                      <div className="flex flex-wrap items-center gap-x-[14px] gap-y-2 px-1 pt-1 text-[18px] font-bold leading-none text-black">
                        <span className="inline-flex items-center gap-x-[6px]">
                          <span>{t("published.title")} :</span>
                          <span className="text-[#ff1d1d]">
                            {organization.publishedStats.titles}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-x-[6px]">
                          <span>{t("published.titlesCount")}</span>
                          <span className="text-[#ff1d1d]">
                            {organization.publishedStats.authors}
                          </span>
                        </span>
                        <span>{t("published.authorsCount")}</span>
                      </div>

                      <section className="hidden min-h-0 flex-1 overflow-y-auto md:block">
                        <table className="w-full table-fixed border-collapse bg-[#a7dcee] text-black">
                          <colgroup>
                            {ORGANIZATION_PUBLISHED_COLUMN_WIDTHS.map((width, index) => (
                              <col key={`${width}-${index}`} style={{ width }} />
                            ))}
                          </colgroup>
                          <thead>
                            <tr className="bg-[#fff8c8] text-[12px] uppercase leading-none text-black md:text-[13px]">
                              <th className="border border-[#7aa8b7] px-2 py-[3px] text-left font-normal">{t("published.columns.titles")}</th>
                              <th className="border border-[#7aa8b7] px-2 py-[3px] text-left font-normal">{t("published.columns.authors")}</th>
                              <th className="border border-[#7aa8b7] px-2 py-[3px] text-left font-normal">{t("published.columns.year")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(organization.publishedRows.length > 0
                              ? organization.publishedRows
                              : [{ title: "", author: "", year: "" }]).map((row, rowIndex) => (
                              <tr key={`${row.title}-${row.author}-${row.year}-${rowIndex}`}>
                                <td className="min-h-[32px] border border-[#7aa8b7] px-2 py-1 align-middle text-[13px] md:text-[15px]">
                                  <span className="block w-full break-words text-left">
                                    {row.title ? <ClickableDetailValue href={buildBookTitleResolverHref(row.title)} value={row.title} /> : "—"}
                                  </span>
                                </td>
                                <td className="min-h-[32px] border border-[#7aa8b7] px-2 py-1 align-middle text-[13px] md:text-[15px]">
                                  <span className="break-words">{row.author || "—"}</span>
                                </td>
                                <td className="min-h-[32px] border border-[#7aa8b7] px-2 py-1 align-middle text-[13px] md:text-[15px]">
                                  {row.year || "—"}
                                </td>
                              </tr>
                            ))}
                            <tr>
                              <td className="h-[120px] border border-[#7aa8b7]" />
                              <td className="h-[120px] border border-[#7aa8b7]" />
                              <td className="h-[120px] border border-[#7aa8b7]" />
                            </tr>
                          </tbody>
                        </table>
                      </section>
                    </section>
                  </div>
                ) : null}

                {activeTab === "diffuser" ? (
                  <DetailEmptyTab message={emptyT("tab")} />
                ) : null}
                {activeTab === "distributor" ? (
                  <DetailEmptyTab message={emptyT("tab")} />
                ) : null}
                {activeTab === "salesCounter" ? (
                  <DetailEmptyTab message={emptyT("tab")} />
                ) : null}
                {activeTab === "readingCommittee" ? (
                  <DetailEmptyTab message={emptyT("tab")} />
                ) : null}
                {activeTab === "staff" ? (
                  <DetailEmptyTab message={emptyT("tab")} />
                ) : null}
                {activeTab === "literaryPrizes" ? (
                  <DetailEmptyTab message={emptyT("tab")} />
                ) : null}
                {activeTab === "statistics" ? <DetailStatisticsPanel statistics={organization.statistics} labels={{ title: t("content.statistics"), year: statisticsT("year"), decade: statisticsT("decade"), month: statisticsT("month"), monthlyUnavailable: statisticsT("monthlyUnavailable"), noData: statisticsT("noData"), timeline: statisticsT("timeline"), primary: t("published.titlesCount"), secondary: t("published.authorsCount"), languages: statisticsT("languages"), countries: statisticsT("countries"), roles: statisticsT("roles") }} /> : null}
              </div>
            </div>
          </section>

          <aside className="hidden md:absolute md:right-0 md:top-[66px] md:flex md:h-[min(660px,calc(100dvh-380px))] md:w-[34px] md:items-center md:justify-center">
            <div className="flex flex-col items-center justify-center gap-[14px] text-[15px] leading-none text-black">
              <span className="[writing-mode:vertical-rl]">
                {t("right.organizationCardsFound")}
              </span>
              <span className="[writing-mode:vertical-rl] text-[17px] font-bold text-[#ff1d1d]">
                {organization.stats.cardsFound}
              </span>
              <div className="h-[18px]" />
              <span className="[writing-mode:vertical-rl]">
                {t("right.databaseContains")}
              </span>
              <span className="[writing-mode:vertical-rl] text-[17px] font-bold text-[#ff1d1d]">
                {organization.stats.databaseContains}
              </span>
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
