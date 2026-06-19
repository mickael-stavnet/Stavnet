"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";

interface DefinitionRecord {
  title: string;
  author: string;
  publisher: string;
  language: string;
  year: string;
  publication: string;
  issue: string;
}

const DEFINITION_GRID_TEMPLATE = "3.2fr 1.5fr 1.4fr 1.08fr 0.66fr 0.62fr 0.62fr";

const sampleRecords: DefinitionRecord[] = [
  { title: "אין אפשר לאהוב", author: "Naïm Araidi", publisher: "Eked", language: "", year: "1972", publication: "O", issue: "E01" },
  { title: "אין אפשר לאהוב", author: "Naïm Araidi", publisher: "Eked", language: "", year: "1972", publication: "O", issue: "E01" },
  { title: "חתלה וכחול", author: "Naïm Araidi", publisher: "Eked", language: "", year: "1975", publication: "O", issue: "E01" },
  { title: "חתלה וכחול", author: "Naïm Araidi", publisher: "Eked", language: "", year: "1975", publication: "O", issue: "E01" },
  { title: "חזרתי אל הכפר", author: "Naïm Araidi", publisher: "Am Oved", language: "", year: "1986", publication: "O", issue: "E01" },
  { title: "חזרתי אל הכפר", author: "Naïm Araidi", publisher: "Am Oved", language: "", year: "1986", publication: "O", issue: "E01" },
  { title: "אולי זה אהבה", author: "Naïm Araidi", publisher: "Ma’ariv", language: "", year: "1990", publication: "O", issue: "E01" },
  { title: "אולי זה אהבה", author: "Naïm Araidi", publisher: "Ma’ariv", language: "", year: "1990", publication: "O", issue: "E01" },
  { title: "בחמישה מימדים", author: "Naïm Araidi", publisher: "Sifriat Poalim", language: "", year: "1991", publication: "O", issue: "E01" },
  { title: "בחמישה מימדים", author: "Naïm Araidi", publisher: "Sifriat Poalim", language: "", year: "1991", publication: "O", issue: "E01" },
  { title: "תבילה קטלנית", author: "Naïm Araidi", publisher: "Bitan", language: "", year: "1992", publication: "O", issue: "E01" },
  { title: "יעקובי ולידנטל", author: "Hanokh Levin", publisher: "University Publishing Projects", language: "", year: "1974", publication: "O", issue: "E01" },
];

function RedMarker() {
  return <span className="mr-2 inline-block h-[11px] w-[11px] rounded-full border-[2px] border-[#ff1d1d]" />;
}

function MobileDefinitionCard({
  record,
  t,
}: {
  record: DefinitionRecord;
  t: ReturnType<typeof useTranslations<"DefinitionPage">>;
}) {
  return (
    <article className="border-b border-[#b1bac0] px-1 py-3 last:border-b-0">
      <div className="flex items-start">
        <RedMarker />
        <div className="min-w-0 flex-1">
          <p className="text-right text-[16px] font-bold leading-tight text-black" dir="rtl">
            {record.title}
          </p>
          <p className="mt-1 text-[13px] leading-tight text-[#21323b]">{record.author}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] leading-[1.35] text-black">
        <div>
          <p className="font-bold uppercase text-[#4a5a63]">{t("columns.publishers")}</p>
          <p className="mt-1 break-words">{record.publisher}</p>
        </div>
        <div>
          <p className="font-bold uppercase text-[#4a5a63]">{t("columns.year")}</p>
          <p className="mt-1">{record.year}</p>
        </div>
      </div>
    </article>
  );
}

export default function DefinitionPage() {
  const t = useTranslations("DefinitionPage");
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "search", icon: "/icons/icons-nav/rechercher.png", href: "/search" as const, label: t("footer.search") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/definition" as const, label: t("footer.help") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/definition" as const, label: t("footer.move") },
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

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-0 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName={t("header.cardTitle")}
          title={t("header.title")}
          subtitle={t("header.subtitle")}
          headerClassName="md:h-[146px]"
          badgeClassName="md:h-[112px] md:w-[236px]"
          titleBlockClassName="md:right-[4.7vw] md:left-auto md:w-[44vw]"
          titleClassName="text-[28px] md:text-[32px]"
          subtitleClassName="text-[17px]"
        />

        <section className="mt-6 min-w-0 flex flex-col gap-4 md:absolute md:left-1/2 md:top-[154px] md:bottom-[128px] md:w-[min(1240px,94vw)] md:-translate-x-1/2">
          <div className="grid gap-4 md:grid-cols-2 md:gap-[46px]">
            <div className="space-y-0">
              <div className="border border-[#b7b08a] border-b-0 bg-[#fff7b7] px-2 py-[4px] text-[10px] uppercase leading-none text-black">
                {t("fields.definitionLabel")}
              </div>
              <div className="min-h-[30px] border border-[#7aa8b7] bg-[#a7dcee] px-3 py-[6px] text-[16px] font-bold leading-none text-black">
                {t("fields.definitionValue")}
              </div>
            </div>

            <div className="space-y-0">
              <div className="border border-[#b7b08a] border-b-0 bg-[#fff7b7] px-2 py-[4px] text-[10px] uppercase leading-none text-black">
                {t("fields.keywordLabel")}
              </div>
              <div className="min-h-[30px] border border-[#7aa8b7] bg-[#a7dcee] px-3 py-[6px] text-[16px] font-bold leading-none text-black">
                {t("fields.keywordValue")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[16px] font-bold leading-none text-black">
            <span className="text-[#ff1d1d]">{t("stats.count")}</span>
            <span>{t("stats.titles")}</span>
          </div>

          <section className="overflow-hidden rounded-[8px] border border-[#7aa8b7] bg-[#d8dde2] shadow-[4px_4px_8px_rgba(0,0,0,0.18)]">
            <div className="space-y-3 p-3 md:hidden">
              {sampleRecords.map((record, index) => (
                <MobileDefinitionCard key={`${record.title}-${index}`} record={record} t={t} />
              ))}
            </div>

            <div className="hidden flex-col md:flex">
              <div
                className="grid min-w-[1160px] border-b border-[#7aa8b7] bg-[#fff15a] text-[12px] uppercase leading-none text-black"
                style={{ gridTemplateColumns: DEFINITION_GRID_TEMPLATE }}
              >
                <div className="rounded-tl-[8px] border-r border-[#7aa8b7] px-3 py-[10px] text-center">{t("columns.titles")}</div>
                <div className="border-r border-[#7aa8b7] px-3 py-[10px] text-center">{t("columns.authors")}</div>
                <div className="border-r border-[#7aa8b7] px-3 py-[10px] text-center">{t("columns.publishers")}</div>
                <div className="border-r border-[#7aa8b7] px-3 py-[10px] text-center">{t("columns.languages")}</div>
                <div className="border-r border-[#7aa8b7] px-3 py-[10px] text-center">{t("columns.year")}</div>
                <div className="border-r border-[#7aa8b7] px-3 py-[10px] text-center">{t("columns.publication")}</div>
                <div className="rounded-tr-[8px] px-3 py-[10px] text-center">{t("columns.issue")}</div>
              </div>

              <div className="overflow-auto">
                {sampleRecords.map((record, rowIndex) => (
                  <div
                    key={`${record.title}-${rowIndex}`}
                    className="grid min-w-[1160px] border-b border-[#9bb2bc] text-[15px] leading-none text-black last:border-b-0"
                    style={{ gridTemplateColumns: DEFINITION_GRID_TEMPLATE }}
                  >
                    <div className="border-r border-[#9bb2bc] px-2 py-[14px]">
                      <Link href="/books/details" className="flex items-center text-black hover:underline">
                        <RedMarker />
                        <span className="w-full text-right text-[15px] font-bold" dir="rtl">
                          {record.title}
                        </span>
                      </Link>
                    </div>
                    <div className="border-r border-[#9bb2bc] px-2 py-[14px]">{record.author}</div>
                    <div className="border-r border-[#9bb2bc] px-2 py-[14px]">{record.publisher}</div>
                    <div className="border-r border-[#9bb2bc] px-2 py-[14px] text-center">{record.language}</div>
                    <div className="border-r border-[#9bb2bc] px-2 py-[14px] text-center">{record.year}</div>
                    <div className="border-r border-[#9bb2bc] px-2 py-[14px] text-center">{record.publication}</div>
                    <div className="px-2 py-[14px] text-center">{record.issue}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>

        <StavnetFooter
          items={footerItems}
          className="md:bottom-[2.6vh] md:left-[6vw] md:right-[6vw]"
          itemClassName="md:min-h-[70px] md:text-[14px]"
          mobileGridClassName="grid-cols-2 sm:grid-cols-3"
          desktopMode="compact"
        />
      </div>
    </main>
  );
}
