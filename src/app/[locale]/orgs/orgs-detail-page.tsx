"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";

type OrganizationTab =
  | "editorCard"
  | "diffuser"
  | "distributor"
  | "salesCounter"
  | "readingCommittee"
  | "staff"
  | "literaryPrizes"
  | "statistics";

interface PublishedRow {
  title: string;
  author: string;
  year: string;
}

interface OrganizationSample {
  name: string;
  synonym: string;
  group: string;
  publishedStats: {
    titles: string;
    authors: string;
  };
  rows: PublishedRow[];
}

function MobilePublishedCard({
  title,
  author,
  year,
}: {
  title: string;
  author: string;
  year: string;
}) {
  return (
    <article className="rounded-[6px] border border-[#7aa8b7] bg-[#b2e0ef] p-3">
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">Title</p>
        <p className="text-[13px] text-black" dir="rtl">{title || "—"}</p>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">Author</p>
        <p className="text-[13px] text-black">{author || "—"}</p>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#07384a]">Year</p>
        <p className="text-[13px] text-black">{year || "—"}</p>
      </div>
    </article>
  );
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
    <div className={`flex min-h-[38px] items-center border-b border-[#7aa8b7] bg-[#a7dcee] px-2 text-[13px] text-black ${className}`}>
      {value}
    </div>
  );
}

function EmptyRows({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={`min-h-[38px] border-b border-[#7aa8b7] bg-[#a7dcee] ${index === rows - 1 ? "border-b-0" : ""}`} />
      ))}
    </>
  );
}

function BlankTabPanel({
  title,
  rows = 4,
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
              className={`h-[82px] border-b border-[#7aa8b7] ${index === rows - 1 ? "border-b-0" : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RedMarker() {
  return <span className="mr-2 inline-block h-[11px] w-[11px] rounded-full border-[2px] border-[#ff1d1d]" />;
}

export default function OrganizationsDetailPage() {
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

  const sampleOrganization: OrganizationSample = {
    name: "Eked",
    synonym: "Eked",
    group: "",
    publishedStats: {
      titles: "14",
      authors: "10",
    },
    rows: [
      { title: "על קו המשווה", author: "Ben-Zion Tomer", year: "1969" },
      { title: "מזל דגים", author: "Shulamit Lapid", year: "1969" },
      { title: "שועל בערפל", author: "Moshé Ben-Shaul", year: "1970" },
      { title: "שירים חצויים", author: "David Avidan", year: "1970" },
      { title: "הלך זרוע", author: "Israël Eliraz", year: "1970" },
      { title: "אין אפשר לאהוב", author: "Naïm Araidi", year: "1972" },
    ],
  };

  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "list", icon: "/icons/icons-nav/book.png", href: "/orgs" as const, label: t("footer.list") },
    { key: "search", icon: "/icons/icons-nav/rechercher.png", href: "/search" as const, label: t("footer.search") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/orgs/details" as const, label: t("footer.help") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/orgs/details" as const, label: t("footer.move") },
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

        <section className="mt-6 flex flex-col gap-4 md:absolute md:left-[4.8vw] md:right-[4.8vw] md:top-[154px] md:bottom-[154px] md:grid md:grid-cols-[92px_1fr_42px] md:gap-[4px]">
          <section className="grid gap-2 md:hidden">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[8px] border border-[#7aa8b7] bg-[#d8dde2] px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.04em] text-[#07384a]">{t("right.organizationCardsFound")}</p>
                <p className="mt-1 text-[18px] font-bold text-[#ff1d1d]">1201</p>
              </div>
              <div className="rounded-[8px] border border-[#7aa8b7] bg-[#d8dde2] px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.04em] text-[#07384a]">{t("right.databaseContains")}</p>
                <p className="mt-1 text-[18px] font-bold text-[#ff1d1d]">1202</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[8px] border border-[#7aa8b7] bg-[#d8dde2] px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.04em] text-[#07384a]">{t("side.creationDate")}</p>
                <p className="mt-1 text-[14px] text-black">—</p>
              </div>
              <div className="rounded-[8px] border border-[#7aa8b7] bg-[#d8dde2] px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.04em] text-[#07384a]">{t("side.titlesAtCatalog")}</p>
                <p className="mt-1 text-[14px] text-black">—</p>
              </div>
            </div>
            <button
              type="button"
              className="min-h-11 rounded-[8px] border border-[#d1bb48] bg-[#ffea56] px-4 text-[13px] font-bold text-black shadow-[3px_3px_5px_rgba(0,0,0,0.2)]"
            >
              {t("side.collections")}
            </button>
          </section>

          <aside className="relative order-2 hidden flex-col gap-4 md:order-1 md:flex md:translate-x-[32px] md:overflow-visible md:pt-[26px]">
            <div className="hidden md:block md:h-[86px]" />
            <div className="border border-black bg-transparent md:ml-[10px] md:h-[130px] md:w-[128px]" />
            <div className="space-y-[8px] text-center text-[14px] leading-[1.1] text-black md:ml-[10px] md:w-[128px]">
              <p>{t("side.creationDate")}</p>
            </div>
            <button
              type="button"
              className="hidden h-[36px] w-[88px] self-start border border-[#d1bb48] bg-[#ffea56] text-[12px] font-bold leading-[1.05] shadow-[3px_3px_5px_rgba(0,0,0,0.2)] md:ml-[18px] md:block"
            >
              {t("side.collections")}
            </button>
            <div className="space-y-[8px] text-center text-[14px] leading-[1.1] text-black md:ml-[10px] md:w-[128px]">
              <p>{t("side.titlesAtCatalog")}</p>
            </div>
          </aside>

          <section className="order-1 min-w-0 md:order-2 md:mx-auto md:w-full md:max-w-[1230px]">
            <nav className="flex snap-x gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-[96px_repeat(7,minmax(0,1fr))] md:items-end md:gap-[8px] md:overflow-visible md:pb-0">
              {tabs.map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  className={`min-h-11 min-w-[136px] shrink-0 snap-start rounded-t-[8px] border border-[#d1bb48] px-3 py-[8px] text-center text-[13px] leading-[1.02] shadow-[3px_3px_5px_rgba(0,0,0,0.28)] transition-colors md:min-h-[42px] md:min-w-0 md:px-2 ${
                    activeTab === tabKey
                      ? "bg-[#91d3ea] text-black md:min-h-[58px] md:text-[17px] md:font-bold"
                      : "bg-[#ffea56] text-black hover:bg-[#fff16f]"
                  }`}
                >
                  {t(`tabs.${tabKey}`)}
                </button>
              ))}
            </nav>

            <div className="mt-[2px] flex min-h-[560px] flex-col rounded-[8px] border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[4px_4px_8px_rgba(0,0,0,0.18)] md:h-[540px] md:flex-row">
              <aside className="border-b border-[#7aa8b7] px-3 py-4 md:w-[114px] md:border-b-0 md:border-r">
                <p className="text-center text-[18px] font-bold leading-tight text-black">{t("side.editorCard")}</p>
              </aside>

              <div className="min-w-0 flex-1 px-[10px] py-[12px]">
                {activeTab === "editorCard" ? (
                  <div className="grid h-full grid-rows-[auto_auto_1fr] gap-y-[14px]">
                    <div className="grid gap-[10px] md:grid-cols-[2fr_1fr]">
                      <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                        <LabelCell label={t("fields.editor")} />
                        <FilledCell value={sampleOrganization.name} className="text-[16px] font-bold text-[#07384a]" />
                        <LabelCell label={t("fields.address")} />
                        <FilledCell value="" />
                        <div className="grid gap-px bg-[#7aa8b7] md:grid-cols-[96px_1fr_1fr]">
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
                            <FilledCell value="" className="border-b-0" />
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

                      <div className="space-y-[8px]">
                        <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                          <LabelCell label={t("fields.synonyms")} />
                          <FilledCell value={sampleOrganization.synonym} className="text-[14px]" />
                          <EmptyRows rows={4} />
                        </section>

                        <section className="border border-[#7aa8b7] bg-[#fff15a]">
                          <div className="border-b border-[#7aa8b7] bg-[#fff8c8] px-2 py-[3px] text-[12px] uppercase leading-none text-black">
                            {t("fields.group")}
                          </div>
                          <div className="flex min-h-[31px] items-center px-2 text-[13px] text-black">
                            <RedMarker />
                            {sampleOrganization.group}
                          </div>
                        </section>
                      </div>
                    </div>

                    <section className="space-y-[8px]">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-[16px] font-bold leading-none text-black">
                        <span>{t("published.title")} :</span>
                        <span className="text-[#ff1d1d]">{sampleOrganization.publishedStats.titles}</span>
                        <span>{t("published.titlesCount")}</span>
                        <span className="text-[#ff1d1d]">{sampleOrganization.publishedStats.authors}</span>
                        <span>{t("published.authorsCount")}</span>
                      </div>

                      <div className="space-y-3 md:hidden">
                        {sampleOrganization.rows.map((row, rowIndex) => (
                          <MobilePublishedCard
                            key={rowIndex}
                            title={row.title}
                            author={row.author}
                            year={row.year}
                          />
                        ))}
                      </div>

                      <section className="hidden min-w-0 overflow-x-auto border border-[#7aa8b7] bg-[#a7dcee] md:block">
                        <div className="grid w-full min-w-0 grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_72px] border-b border-[#7aa8b7] bg-[#fff8c8] text-[12px] uppercase leading-none text-black">
                          <div className="border-r border-[#7aa8b7] px-2 py-[3px]">{t("published.columns.titles")}</div>
                          <div className="border-r border-[#7aa8b7] px-2 py-[3px]">{t("published.columns.authors")}</div>
                          <div className="px-2 py-[3px]">{t("published.columns.year")}</div>
                        </div>

                        {sampleOrganization.rows.map((row, rowIndex) => (
                          <div
                            key={rowIndex}
                            className="grid w-full min-w-0 grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_72px]"
                          >
                            <div className="flex h-[29px] items-center justify-end border-r border-t border-[#7aa8b7] px-2 text-[13px] text-black" dir="rtl">
                              <span className="text-right">{row.title}</span>
                            </div>
                            <div className="flex h-[29px] items-center border-r border-t border-[#7aa8b7] px-2 text-[13px] text-black">
                              {row.author}
                            </div>
                            <div className="flex h-[29px] items-center border-t border-[#7aa8b7] px-2 text-[13px] text-black">
                              {row.year}
                            </div>
                          </div>
                        ))}
                      </section>
                    </section>

                    <div />
                  </div>
                ) : null}

                {activeTab === "diffuser" ? <BlankTabPanel title={t("content.diffuser")} rows={4} /> : null}
                {activeTab === "distributor" ? <BlankTabPanel title={t("content.distributor")} rows={4} /> : null}
                {activeTab === "salesCounter" ? <BlankTabPanel title={t("content.salesCounter")} rows={4} /> : null}
                {activeTab === "readingCommittee" ? <BlankTabPanel title={t("content.readingCommittee")} rows={4} /> : null}
                {activeTab === "staff" ? <BlankTabPanel title={t("content.staff")} rows={4} /> : null}
                {activeTab === "literaryPrizes" ? <BlankTabPanel title={t("content.literaryPrizes")} rows={4} /> : null}
                {activeTab === "statistics" ? <BlankTabPanel title={t("content.statistics")} rows={4} /> : null}
              </div>
            </div>
          </section>

          <aside className="order-3 hidden items-center justify-center md:flex">
            <div className="flex h-full -translate-x-[8px] flex-col items-center justify-between py-[108px] text-[14px] leading-none text-black">
              <span className="[writing-mode:vertical-rl]">{t("right.organizationCardsFound")}</span>
              <span className="[writing-mode:vertical-rl] text-[#ff1d1d]">1201</span>
              <span className="[writing-mode:vertical-rl]">{t("right.databaseContains")}</span>
              <span className="[writing-mode:vertical-rl] text-[#ff1d1d]">1202</span>
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
