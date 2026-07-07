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

const DEFINITION_COLUMN_WIDTHS = ["35.45%", "16.62%", "15.51%", "11.96%", "7.31%", "6.56%", "6.59%"] as const;

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
  labels,
}: {
  record: DefinitionRecord;
  labels: {
    publisher: string;
    year: string;
    viewMore: string;
  };
}) {
  return (
    <article className="border-b border-[#b1bac0] px-1 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[16px] font-bold leading-tight text-black">{record.title}</p>
        <p className="mt-1 text-[13px] leading-tight text-[#21323b]">{record.author || "—"}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] leading-[1.35] text-black">
        <div>
          <p className="font-bold uppercase text-[#4a5a63]">{labels.publisher}</p>
          <p className="mt-1 break-words">{record.publisher || "—"}</p>
        </div>
        <div>
          <p className="font-bold uppercase text-[#4a5a63]">{labels.year}</p>
          <p className="mt-1">{record.year || "—"}</p>
        </div>
      </div>

      <Link
        href="/books/details"
        className="mt-3 inline-block text-[13px] font-bold text-[#0f4c81] underline underline-offset-2"
      >
        {labels.viewMore}
      </Link>
    </article>
  );
}

export default function DefinitionPageClient() {
  const t = useTranslations("DefinitionPage");
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/search" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "search", icon: "/icons/icons-nav/rechercher.png", href: "/search" as const, label: t("footer.search") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/definition" as const, label: t("footer.help") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/books/details" as const, label: t("footer.move") },
  ];

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image
        src="/background/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-95 saturate-[1.08]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(210,229,242,0.18),rgba(210,229,242,0.08))]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-0 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName={t("header.cardTitle")}
          title={t("header.title")}
          subtitle={t("header.subtitle")}
        />

        <section className="mt-6 flex min-w-0 flex-col gap-4 md:absolute md:left-1/2 md:top-[178px] md:bottom-[132px] md:w-[min(1320px,96vw)] md:-translate-x-1/2">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px] md:items-end">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-[8px] border border-[#7aa8b7] bg-[#a7dcee] px-4 py-3 shadow-[3px_3px_6px_rgba(0,0,0,0.12)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#07384a]">{t("fields.definitionLabel")}</p>
                <p className="mt-2 text-[19px] font-bold leading-tight text-black">{t("fields.definitionValue")}</p>
              </div>
              <div className="rounded-[8px] border border-[#7aa8b7] bg-[#a7dcee] px-4 py-3 shadow-[3px_3px_6px_rgba(0,0,0,0.12)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#07384a]">{t("fields.keywordLabel")}</p>
                <p className="mt-2 text-[19px] font-bold leading-tight text-black">{t("fields.keywordValue")}</p>
              </div>
            </div>

            <div className="flex items-center justify-start gap-3 text-[18px] leading-none text-black md:justify-end">
              <span>{t("stats.titles")}</span>
              <span>:</span>
              <span className="font-bold text-[#ff1d1d]">{t("stats.count")}</span>
            </div>
          </div>

          <section className="overflow-hidden rounded-[8px] border border-[#9aa8b0] bg-[#d8dde2] shadow-[4px_4px_8px_rgba(0,0,0,0.12)]">
            <div className="space-y-3 p-3 md:hidden">
              {sampleRecords.map((record, index) => (
                <MobileDefinitionCard
                  key={`${record.title}-${index}`}
                  record={record}
                  labels={{
                    publisher: t("columns.publishers"),
                    year: t("columns.year"),
                    viewMore: t("footer.move"),
                  }}
                />
              ))}
            </div>

            <div className="hidden md:block">
              <div className="overflow-auto">
                <table className="min-w-[1120px] w-full table-fixed border-collapse text-black">
                  <colgroup>
                    {DEFINITION_COLUMN_WIDTHS.map((width, index) => (
                      <col key={`${width}-${index}`} style={{ width }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr className="bg-[#fff68f] text-[11px] uppercase leading-none text-black">
                      <th className="rounded-tl-[10px] border border-[#9aa8b0] px-3 py-[9px] text-center font-normal">{t("columns.titles")}</th>
                      <th className="border border-[#9aa8b0] px-3 py-[9px] text-center font-normal">{t("columns.authors")}</th>
                      <th className="border border-[#9aa8b0] px-3 py-[9px] text-center font-normal">{t("columns.publishers")}</th>
                      <th className="border border-[#9aa8b0] px-3 py-[9px] text-center font-normal">{t("columns.languages")}</th>
                      <th className="border border-[#9aa8b0] px-3 py-[9px] text-center font-normal">{t("columns.year")}</th>
                      <th className="border border-[#9aa8b0] px-3 py-[9px] text-center font-normal">{t("columns.publication")}</th>
                      <th className="rounded-tr-[10px] border border-[#9aa8b0] px-3 py-[9px] text-center font-normal">{t("columns.issue")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRecords.map((record, index) => (
                      <tr key={`${record.title}-${index}`} className="text-[14px] leading-none text-black">
                        <td className="border border-[#b1bac0] px-3 py-[15px] align-middle">
                          <Link href="/books/details" className="flex items-center text-black hover:underline">
                            <RedMarker />
                            <span className="w-full break-words">{record.title}</span>
                          </Link>
                        </td>
                        <td className="border border-[#b1bac0] px-3 py-[15px] align-middle">{record.author || "—"}</td>
                        <td className="border border-[#b1bac0] px-3 py-[15px] align-middle">{record.publisher || "—"}</td>
                        <td className="border border-[#b1bac0] px-3 py-[15px] text-center align-middle">{record.language || "—"}</td>
                        <td className="border border-[#b1bac0] px-3 py-[15px] text-center align-middle">{record.year || "—"}</td>
                        <td className="border border-[#b1bac0] px-3 py-[15px] text-center align-middle">{record.publication || "—"}</td>
                        <td className="border border-[#b1bac0] px-3 py-[15px] text-center align-middle">{record.issue || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </section>

        <StavnetFooter items={footerItems} desktopMode="compact" />
      </div>
    </main>
  );
}
