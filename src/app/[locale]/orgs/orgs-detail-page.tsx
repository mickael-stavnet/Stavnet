"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import type { OrganizationDetail } from "@/lib/data/orgs";

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
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[42px] items-center border-b border-[#7aa8b7] bg-[#a7dcee] px-2 text-[13px] text-black ${className}`}
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

function BlankTabPanel({ title, rows = 4 }: { title: string; rows?: number }) {
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
              className={`h-[90px] border-b border-[#7aa8b7] ${index === rows - 1 ? "border-b-0" : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RedMarker() {
  return (
    <span className="mr-2 inline-block h-[11px] w-[11px] rounded-full border-[2px] border-[#ff1d1d]" />
  );
}

export default function OrganizationsDetailPage({
  organization,
}: OrganizationDetailPageProps) {
  const t = useTranslations("OrganizationFilePage");
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
          titleBlockClassName="md:w-[84vw]"
        />

        <section className="mt-6 flex flex-col gap-4 md:absolute md:left-1/2 md:top-[172px] md:bottom-[118px] md:w-[min(1580px,97vw)] md:-translate-x-1/2">
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

          <section className="order-1 min-w-0 md:relative md:ml-[214px] md:w-[calc(100%-214px)] md:pr-[30px]">
            <aside className="absolute left-[-208px] top-[104px] hidden w-[182px] flex-col gap-5 md:flex">
              <div className="relative overflow-hidden border border-[#6c99a7] bg-[#d7eef6] shadow-[3px_3px_6px_rgba(0,0,0,0.18)] h-[176px] w-[174px]">
                <Image
                  src="https://cdn.pixabay.com/photo/2016/12/28/22/15/moscow-1937274_1280.jpg"
                  alt=""
                  fill
                  sizes="174px"
                  className="object-cover object-center"
                />
              </div>
              <div className="w-[174px] space-y-[9px] text-center text-[18px] leading-[1.05] text-black">
                <p>{t("side.creationDate")}</p>
                <p className="font-bold text-[22px] leading-none">
                  {organization.creationDate || "—"}
                </p>
              </div>
              <button
                type="button"
                className="ml-[34px] h-[42px] w-[106px] border border-[#d1bb48] bg-[#ffea56] text-[14px] font-bold leading-[1.05] shadow-[3px_3px_5px_rgba(0,0,0,0.2)]"
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
            <nav className="grid grid-cols-2 gap-2 pb-2 md:grid-cols-[108px_repeat(7,minmax(0,1fr))] md:items-end md:gap-[12px] md:pb-0">
              {tabs.map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  className={`min-h-[52px] min-w-0 rounded-t-[8px] border border-[#d1bb48] px-2 py-[8px] text-center text-[12px] font-bold leading-[1.08] shadow-[3px_3px_5px_rgba(0,0,0,0.28)] transition-colors md:min-h-[60px] md:px-4 md:text-[15px] ${
                    activeTab === tabKey
                      ? "bg-[#91d3ea] font-semibold text-black md:min-h-[68px] md:text-[19px] md:font-bold"
                      : "bg-[#ffea56] text-black hover:bg-[#fff16f]"
                  }`}
                >
                  {t(`tabs.${tabKey}`)}
                </button>
              ))}
            </nav>

            <div className="relative mt-[2px] flex min-h-[660px] flex-col rounded-[8px] border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[4px_4px_8px_rgba(0,0,0,0.18)] md:h-[638px] md:min-h-0 md:flex-row">
              <aside className="border-b border-[#7aa8b7] px-3 py-4 md:w-[126px] md:border-b-0 md:border-r md:px-4 md:py-5">
                <p className="text-center text-[18px] font-bold leading-tight text-black">
                  {t("side.editorCard")}
                </p>
              </aside>

              <div className="min-w-0 flex-1 px-[12px] py-[12px] md:px-[16px] md:py-[16px]">
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
                              value={organization.country}
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
                            className="text-[14px]"
                          />
                          <EmptyRows rows={4} />
                        </section>

                        <section className="border border-[#7aa8b7] bg-[#fff15a]">
                          <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                            {t("fields.group")}
                          </div>
                          <div className="flex min-h-[34px] items-center px-2 text-[13px] text-black">
                            <RedMarker />
                            {organization.type || "—"}
                          </div>
                        </section>
                      </div>
                    </div>

                    <section className="flex h-full min-h-0 flex-col space-y-[8px]">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 pt-1 text-[18px] font-bold leading-none text-black">
                        <span>{t("published.title")} :</span>
                        <span className="text-[#ff1d1d]">
                          {organization.publishedStats.titles}
                        </span>
                        <span>{t("published.titlesCount")}</span>
                        <span className="text-[#ff1d1d]">
                          {organization.publishedStats.authors}
                        </span>
                        <span>{t("published.authorsCount")}</span>
                      </div>

                      <section className="hidden min-h-0 flex-1 overflow-hidden border border-[#7aa8b7] bg-[#a7dcee] md:flex md:flex-col">
                        <div className="grid w-full min-w-0 grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_72px] border-b border-[#7aa8b7] bg-[#fff8c8] text-[12px] uppercase leading-none text-black">
                          <div className="border-r border-[#7aa8b7] px-2 py-[3px]">
                            {t("published.columns.titles")}
                          </div>
                          <div className="border-r border-[#7aa8b7] px-2 py-[3px]">
                            {t("published.columns.authors")}
                          </div>
                          <div className="px-2 py-[3px]">
                            {t("published.columns.year")}
                          </div>
                        </div>
                        <div className="grid w-full min-w-0 grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_72px]">
                          <div className="flex h-[32px] items-center justify-end border-r border-t border-[#7aa8b7] px-2 text-[13px] text-black">
                            <span className="text-right">—</span>
                          </div>
                          <div className="flex h-[32px] items-center border-r border-t border-[#7aa8b7] px-2 text-[13px] text-black">
                            —
                          </div>
                          <div className="flex h-[32px] items-center border-t border-[#7aa8b7] px-2 text-[13px] text-black">
                            —
                          </div>
                        </div>
                        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_72px]">
                          <div className="border-r border-t border-[#7aa8b7]" />
                          <div className="border-r border-t border-[#7aa8b7]" />
                          <div className="border-t border-[#7aa8b7]" />
                        </div>
                      </section>
                    </section>
                  </div>
                ) : null}

                {activeTab === "diffuser" ? (
                  <BlankTabPanel title={t("content.diffuser")} rows={4} />
                ) : null}
                {activeTab === "distributor" ? (
                  <BlankTabPanel title={t("content.distributor")} rows={4} />
                ) : null}
                {activeTab === "salesCounter" ? (
                  <BlankTabPanel title={t("content.salesCounter")} rows={4} />
                ) : null}
                {activeTab === "readingCommittee" ? (
                  <BlankTabPanel
                    title={t("content.readingCommittee")}
                    rows={4}
                  />
                ) : null}
                {activeTab === "staff" ? (
                  <BlankTabPanel title={t("content.staff")} rows={4} />
                ) : null}
                {activeTab === "literaryPrizes" ? (
                  <BlankTabPanel title={t("content.literaryPrizes")} rows={4} />
                ) : null}
                {activeTab === "statistics" ? (
                  <BlankTabPanel title={t("content.statistics")} rows={4} />
                ) : null}
              </div>
              <aside className="absolute bottom-0 left-[calc(100%+4px)] top-0 hidden w-[34px] items-center justify-start md:flex">
                <div className="flex h-full flex-col items-center justify-between py-[96px] text-[15px] leading-none text-black">
                  <span className="[writing-mode:vertical-rl]">
                    {t("right.organizationCardsFound")}
                  </span>
                  <span className="[writing-mode:vertical-rl] text-[17px] font-bold text-[#ff1d1d]">
                    {organization.stats.cardsFound}
                  </span>
                  <span className="[writing-mode:vertical-rl]">
                    {t("right.databaseContains")}
                  </span>
                  <span className="[writing-mode:vertical-rl] text-[17px] font-bold text-[#ff1d1d]">
                    {organization.stats.databaseContains}
                  </span>
                </div>
              </aside>
            </div>
          </section>
        </section>

        <StavnetFooter
          items={footerItems}
          desktopMode="compact"
        />
      </div>
    </main>
  );
}
