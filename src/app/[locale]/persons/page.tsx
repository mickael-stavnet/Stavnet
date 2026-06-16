"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";

function FilledBox({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex min-h-[38px] items-center border border-[#7aa8b7] bg-[#a7dcee] px-2 text-[13px] font-bold text-black ${className}`}>
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
              className={`h-[92px] border-b border-[#7aa8b7] ${index === rows - 1 ? "border-b-0" : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PersonsPage() {
  const t = useTranslations("PersonFilePage");
  const tabs = [
    "authorCard",
    "originalTitles",
    "translatedTitles",
    "authorArticles",
    "authorPublications",
    "pressCritiques",
    "awards",
    "statistics",
  ] as const;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("authorCard");

  const samplePerson = {
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
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/persons" as const, label: t("footer.help") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/persons" as const, label: t("footer.move") },
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
          titleBlockClassName="md:right-[4.7vw] md:left-auto md:w-[44vw]"
          titleClassName="text-[34px] md:text-[32px]"
          subtitleClassName="text-[17px]"
        />

        <section className="mt-6 flex flex-col gap-5 md:absolute md:left-[4.8vw] md:right-[4.8vw] md:top-[154px] md:bottom-[108px] md:grid md:grid-cols-[102px_1fr_24px] md:gap-[10px]">
          <aside className="relative order-2 flex flex-col gap-4 md:order-1 md:pt-[24px]">
            <div className="hidden md:block md:h-[170px]" />

            <button
              type="button"
              className="hidden h-[36px] w-[86px] self-center border border-[#d1bb48] bg-[#ffea56] text-[12px] leading-[1.05] shadow-[3px_3px_5px_rgba(0,0,0,0.2)] md:block"
            >
              {t("side.contribution")}
            </button>
          </aside>

          <section className="order-1 min-w-0 md:order-2">
            <nav className="flex gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-[92px_repeat(7,minmax(0,1fr))] md:items-end md:gap-[6px] md:overflow-visible md:pb-0">
              {tabs.map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  className={`min-h-[42px] min-w-[140px] shrink-0 border border-[#d1bb48] px-3 py-[8px] text-center text-[13px] leading-[1.02] shadow-[3px_3px_5px_rgba(0,0,0,0.28)] transition-colors md:min-w-0 ${
                    activeTab === tabKey
                      ? "bg-[#91d3ea] text-black md:min-h-[58px] md:text-[17px] md:font-bold"
                      : "bg-[#ffea56] text-black hover:bg-[#fff16f]"
                  }`}
                >
                  {t(`tabs.${tabKey}`)}
                </button>
              ))}
            </nav>

            <div className="mt-[2px] flex min-h-[620px] flex-col border border-[#7aa8b7] bg-[linear-gradient(180deg,#8ecfe8_0%,#a8dbed_100%)] shadow-[7px_7px_10px_rgba(0,0,0,0.24)] md:h-[610px] md:flex-row">
              <aside className="border-b border-[#7aa8b7] px-3 py-4 md:w-[110px] md:border-b-0 md:border-r">
                <p className="text-center text-[18px] font-bold leading-tight text-black">{t("side.authorCard")}</p>
              </aside>

              <div className="min-w-0 flex-1 px-[12px] py-[12px]">
                {activeTab === "authorCard" ? (
                  <div className="grid h-full grid-rows-[auto_auto_1fr_auto] gap-y-[12px]">
                    <div className="grid gap-[10px] md:grid-cols-[1.9fr_1fr]">
                      <section className="border border-[#7aa8b7] bg-[#a7dcee]">
                        <LabelCell label={t("fields.person")} />
                        <FilledBox value={samplePerson.fullName} className="border-x-0 border-b text-[18px]" />
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
                      <div className="h-[92px] overflow-auto px-2 py-2 text-[13px] leading-[1.45] text-black md:h-[78px]">
                        {samplePerson.biography}
                      </div>
                    </section>

                    <div />

                    <section className="space-y-[8px]">
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-1 text-[16px] font-bold leading-none text-black">
                        <span>{t("bibliography.title")} :</span>
                        <span className="text-[#ff1d1d]">{samplePerson.bibliographyStats.originalTitles}</span>
                        <span>{t("bibliography.originalTitles")}</span>
                        <span className="text-[#ff1d1d]">{samplePerson.bibliographyStats.translations}</span>
                        <span>{t("bibliography.translations")}</span>
                        <span className="text-[#ff1d1d]">{samplePerson.bibliographyStats.publicationLanguages}</span>
                        <span>{t("bibliography.publicationLanguages")}</span>
                      </div>

                      <section className="overflow-x-auto border border-[#7aa8b7] bg-[#a7dcee]">
                        <div
                          className="grid min-w-[620px] border-b border-[#7aa8b7] bg-[#fff8c8] text-[12px] uppercase leading-none text-black"
                          style={{ gridTemplateColumns: "80px 140px 1.6fr 70px 60px" }}
                        >
                          <div className="border-r border-[#7aa8b7] px-2 py-[3px]">{t("bibliography.columns.type")}</div>
                          <div className="border-r border-[#7aa8b7] px-2 py-[3px]">{t("bibliography.columns.language")}</div>
                          <div className="border-r border-[#7aa8b7] px-2 py-[3px]">{t("bibliography.columns.title")}</div>
                          <div className="border-r border-[#7aa8b7] px-2 py-[3px]">{t("bibliography.columns.year")}</div>
                          <div className="px-2 py-[3px]">{t("bibliography.columns.issue")}</div>
                        </div>

                        {samplePerson.bibliographyRows.map((row, rowIndex) => (
                          <div
                            key={rowIndex}
                            className="grid min-w-[620px]"
                            style={{ gridTemplateColumns: "80px 140px 1.6fr 70px 60px" }}
                          >
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
            <div className="flex h-full flex-col items-center justify-between py-[110px] text-[14px] leading-none text-black">
              <span className="[writing-mode:vertical-rl]">{t("right.personCardsFound")}</span>
              <span className="[writing-mode:vertical-rl] text-[#ff1d1d]">1</span>
              <span className="[writing-mode:vertical-rl]">{t("right.databaseContains")}</span>
              <span className="[writing-mode:vertical-rl] text-[#ff1d1d]">686</span>
            </div>
          </aside>
        </section>

        <StavnetFooter
          items={footerItems}
          className="md:bottom-[2.2vh] md:left-[4.8vw] md:right-[4.8vw]"
          itemClassName="md:min-h-[70px] md:text-[14px]"
          mobileGridClassName="grid-cols-2 sm:grid-cols-4"
          desktopMode="compact"
        />
      </div>
    </main>
  );
}
