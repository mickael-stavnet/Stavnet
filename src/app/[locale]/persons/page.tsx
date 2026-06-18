"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import { Link } from "@/i18n/routing";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PersonRow {
  name: string;
  type: string;
  language: string;
  originalTitles: string;
  translatedTitles: string;
  translationLanguages: string;
  awards: string;
  regularReissues: string;
  pocketReissues: string;
  publicationCountries: string;
}

const PERSONS_GRID_TEMPLATE = "2.45fr 1.4fr 1.35fr 0.72fr 0.78fr 0.82fr 0.8fr 0.82fr 0.8fr 0.92fr";

const samplePersons: PersonRow[] = [
  { name: "Zarchi Nurit", type: "Auteur", language: "Hébreu", originalTitles: "91", translatedTitles: "7", translationLanguages: "6", awards: "0", regularReissues: "0", pocketReissues: "0", publicationCountries: "6" },
  { name: "Goldberg Leah", type: "Auteur", language: "Hébreu", originalTitles: "56", translatedTitles: "17", translationLanguages: "10", awards: "0", regularReissues: "0", pocketReissues: "0", publicationCountries: "7" },
  { name: "Agnon Samuel-Joseph", type: "Auteur", language: "Hébreu", originalTitles: "53", translatedTitles: "105", translationLanguages: "23", awards: "2", regularReissues: "0", pocketReissues: "0", publicationCountries: "24" },
  { name: "Orgad Dorit", type: "Auteur", language: "Hébreu", originalTitles: "49", translatedTitles: "13", translationLanguages: "8", awards: "0", regularReissues: "0", pocketReissues: "0", publicationCountries: "6" },
  { name: "Kishon Ephraim", type: "Auteur", language: "Hébreu", originalTitles: "47", translatedTitles: "297", translationLanguages: "30", awards: "0", regularReissues: "0", pocketReissues: "0", publicationCountries: "33" },
  { name: "Shamir Moshe", type: "Auteur", language: "Hébreu", originalTitles: "38", translatedTitles: "19", translationLanguages: "10", awards: "0", regularReissues: "0", pocketReissues: "0", publicationCountries: "9" },
  { name: "Megged Aharon", type: "Auteur", language: "Hébreu", originalTitles: "37", translatedTitles: "24", translationLanguages: "7", awards: "4", regularReissues: "0", pocketReissues: "0", publicationCountries: "8" },
  { name: "Ben-Shaul Moshe", type: "Auteur", language: "Hébreu", originalTitles: "34", translatedTitles: "4", translationLanguages: "2", awards: "0", regularReissues: "0", pocketReissues: "0", publicationCountries: "2" },
  { name: "Appelfeld Aharon", type: "Auteur", language: "Hébreu", originalTitles: "32", translatedTitles: "74", translationLanguages: "20", awards: "0", regularReissues: "0", pocketReissues: "0", publicationCountries: "20" },
  { name: "Orlev Uri", type: "Auteur", language: "Hébreu", originalTitles: "31", translatedTitles: "114", translationLanguages: "21", awards: "0", regularReissues: "0", pocketReissues: "0", publicationCountries: "25" },
  { name: "Mossinson Yigal", type: "Auteur", language: "Hébreu", originalTitles: "31", translatedTitles: "7", translationLanguages: "5", awards: "0", regularReissues: "0", pocketReissues: "0", publicationCountries: "5" },
  { name: "Eliraz Israel", type: "Auteur", language: "Hébreu", originalTitles: "29", translatedTitles: "20", translationLanguages: "4", awards: "0", regularReissues: "0", pocketReissues: "0", publicationCountries: "5" },
  { name: "Tammuz Beniamin", type: "Auteur", language: "Hébreu", originalTitles: "28", translatedTitles: "23", translationLanguages: "12", awards: "0", regularReissues: "0", pocketReissues: "0", publicationCountries: "12" },
  { name: "Grossman David", type: "Auteur", language: "Hébreu", originalTitles: "27", translatedTitles: "39", translationLanguages: "18", awards: "7", regularReissues: "2", pocketReissues: "1", publicationCountries: "17" },
  { name: "Oz Amos", type: "Auteur", language: "Hébreu", originalTitles: "26", translatedTitles: "46", translationLanguages: "24", awards: "5", regularReissues: "4", pocketReissues: "2", publicationCountries: "28" },
  { name: "Amichai Yehuda", type: "Auteur", language: "Hébreu", originalTitles: "25", translatedTitles: "62", translationLanguages: "29", awards: "3", regularReissues: "1", pocketReissues: "0", publicationCountries: "26" },
  { name: "Yehoshua A. B.", type: "Auteur", language: "Hébreu", originalTitles: "24", translatedTitles: "35", translationLanguages: "17", awards: "4", regularReissues: "3", pocketReissues: "1", publicationCountries: "19" },
  { name: "Keret Etgar", type: "Auteur", language: "Hébreu", originalTitles: "23", translatedTitles: "41", translationLanguages: "22", awards: "2", regularReissues: "2", pocketReissues: "3", publicationCountries: "21" },
  { name: "Shalev Meir", type: "Auteur", language: "Hébreu", originalTitles: "21", translatedTitles: "27", translationLanguages: "15", awards: "1", regularReissues: "4", pocketReissues: "1", publicationCountries: "16" },
  { name: "Eli Amir", type: "Auteur", language: "Hébreu", originalTitles: "19", translatedTitles: "16", translationLanguages: "11", awards: "1", regularReissues: "2", pocketReissues: "0", publicationCountries: "12" },
  { name: "Kenaz Yehoshua", type: "Auteur", language: "Hébreu", originalTitles: "18", translatedTitles: "14", translationLanguages: "9", awards: "1", regularReissues: "1", pocketReissues: "0", publicationCountries: "10" },
  { name: "Gouri Haim", type: "Auteur", language: "Hébreu", originalTitles: "18", translatedTitles: "12", translationLanguages: "8", awards: "2", regularReissues: "3", pocketReissues: "0", publicationCountries: "9" },
  { name: "Almog Aharon", type: "Auteur", language: "Hébreu", originalTitles: "17", translatedTitles: "11", translationLanguages: "7", awards: "0", regularReissues: "2", pocketReissues: "0", publicationCountries: "8" },
  { name: "Lapid Shulamit", type: "Auteur", language: "Hébreu", originalTitles: "16", translatedTitles: "9", translationLanguages: "6", awards: "0", regularReissues: "1", pocketReissues: "0", publicationCountries: "7" },
  { name: "Naïm Araidi", type: "Auteur", language: "Arabe", originalTitles: "16", translatedTitles: "8", translationLanguages: "5", awards: "0", regularReissues: "0", pocketReissues: "0", publicationCountries: "6" },
  { name: "Levin Hanokh", type: "Auteur", language: "Hébreu", originalTitles: "15", translatedTitles: "22", translationLanguages: "13", awards: "1", regularReissues: "2", pocketReissues: "1", publicationCountries: "14" },
  { name: "Hameiri Israel", type: "Auteur", language: "Hébreu", originalTitles: "14", translatedTitles: "6", translationLanguages: "4", awards: "0", regularReissues: "1", pocketReissues: "0", publicationCountries: "5" },
  { name: "Ravikovitch Dalia", type: "Auteur", language: "Hébreu", originalTitles: "14", translatedTitles: "19", translationLanguages: "12", awards: "3", regularReissues: "1", pocketReissues: "0", publicationCountries: "15" },
  { name: "Batya Gur", type: "Auteur", language: "Hébreu", originalTitles: "12", translatedTitles: "10", translationLanguages: "7", awards: "1", regularReissues: "2", pocketReissues: "1", publicationCountries: "11" },
  { name: "Savyon Liebrecht", type: "Auteur", language: "Hébreu", originalTitles: "11", translatedTitles: "15", translationLanguages: "10", awards: "1", regularReissues: "1", pocketReissues: "1", publicationCountries: "13" },
  { name: "Yoel Hoffmann", type: "Auteur", language: "Hébreu", originalTitles: "10", translatedTitles: "8", translationLanguages: "6", awards: "0", regularReissues: "1", pocketReissues: "0", publicationCountries: "9" },
  { name: "Aharon Megged", type: "Auteur", language: "Hébreu", originalTitles: "9", translatedTitles: "12", translationLanguages: "8", awards: "1", regularReissues: "2", pocketReissues: "0", publicationCountries: "10" },
  { name: "Ronit Matalon", type: "Auteur", language: "Hébreu", originalTitles: "8", translatedTitles: "11", translationLanguages: "9", awards: "2", regularReissues: "1", pocketReissues: "0", publicationCountries: "12" },
];

const PERSONS_PER_PAGE = 13;

function RedMarker() {
  return <span className="mr-2 inline-block h-[11px] w-[11px] rounded-full border-[2px] border-[#ff1d1d]" />;
}

function MobilePersonCard({
  person,
  t,
}: {
  person: PersonRow;
  t: ReturnType<typeof useTranslations<"Persons">>;
}) {
  return (
    <article className="border-b border-[#b1bac0] px-1 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[16px] font-bold leading-tight text-black">{person.name}</p>
        <p className="mt-1 text-[13px] leading-tight text-[#21323b]">{person.type}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] leading-[1.35] text-black">
        <div>
          <p className="font-bold uppercase text-[#4a5a63]">{t("columns.language")}</p>
          <p className="mt-1 break-words">{person.language}</p>
        </div>
        <div>
          <p className="font-bold uppercase text-[#4a5a63]">{t("columns.originalTitles")}</p>
          <p className="mt-1">{person.originalTitles}</p>
        </div>
      </div>

      <Link
        href="/persons/details"
        className="mt-3 inline-block text-[13px] font-bold text-[#0f4c81] underline underline-offset-2"
      >
        Voir plus
      </Link>
    </article>
  );
}

export default function PersonsListPage() {
  const t = useTranslations("Persons");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(samplePersons.length / PERSONS_PER_PAGE);
  const visiblePersons = useMemo(() => {
    const start = (currentPage - 1) * PERSONS_PER_PAGE;
    return samplePersons.slice(start, start + PERSONS_PER_PAGE);
  }, [currentPage]);
  const paginationItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis-right", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, "ellipsis-left", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "ellipsis-left", currentPage - 1, currentPage, currentPage + 1, "ellipsis-right", totalPages];
  }, [currentPage, totalPages]);
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
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
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end sm:gap-6">
            <div className="flex items-center gap-3 text-[18px] leading-none text-black">
              <span>{t("stats.cardsFound")}</span>
              <span>:</span>
              <span className="font-bold text-[#ff1d1d]">{t("stats.cardsFoundCount")}</span>
            </div>
            <div className="flex items-center gap-3 text-[18px] leading-none text-black">
              <span>{t("stats.databaseContains")}</span>
              <span>:</span>
              <span className="font-bold text-[#ff1d1d]">{t("stats.databaseContainsCount")}</span>
            </div>
          </div>

          <section className="overflow-hidden rounded-[8px] border border-[#9aa8b0] bg-[#d8dde2] shadow-[4px_4px_8px_rgba(0,0,0,0.12)]">
            <div className="space-y-3 p-3 md:hidden">
              {visiblePersons.map((person) => (
                <MobilePersonCard key={`${person.name}-${person.originalTitles}`} person={person} t={t} />
              ))}
            </div>

            <div className="hidden flex-col md:flex">
              <div
                className="grid min-w-[1260px] border-b border-[#9aa8b0] bg-[#fff68f] text-[11px] uppercase leading-none text-black"
                style={{ gridTemplateColumns: PERSONS_GRID_TEMPLATE }}
              >
                <div className="rounded-tl-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.persons")}</div>
                <div className="rounded-t-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.type")}</div>
                <div className="rounded-t-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.language")}</div>
                <div className="rounded-t-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.originalTitles")}</div>
                <div className="rounded-t-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.translatedTitles")}</div>
                <div className="rounded-t-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.translationLanguages")}</div>
                <div className="rounded-t-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.awards")}</div>
                <div className="rounded-t-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.regularReissues")}</div>
                <div className="rounded-t-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.pocketReissues")}</div>
                <div className="rounded-tr-[10px] px-3 py-[9px] text-center">{t("columns.publicationCountries")}</div>
              </div>

              <div className="overflow-auto">
                {visiblePersons.map((person, rowIndex) => (
                  <div
                    key={`${person.name}-${currentPage}-${rowIndex}`}
                    className="grid min-w-[1260px] border-b border-[#b1bac0] text-[14px] leading-none text-black last:border-b-0"
                    style={{ gridTemplateColumns: PERSONS_GRID_TEMPLATE }}
                  >
                    <div className="border-r border-[#b1bac0] px-3 py-[15px]">
                      <Link href="/persons/details" className="flex items-center text-black hover:underline">
                        <RedMarker />
                        <span>{person.name}</span>
                      </Link>
                    </div>
                    <div className="border-r border-[#b1bac0] px-3 py-[15px]">{person.type}</div>
                    <div className="border-r border-[#b1bac0] px-3 py-[15px]">{person.language}</div>
                    <div className="border-r border-[#b1bac0] px-3 py-[15px] text-center">{person.originalTitles}</div>
                    <div className="border-r border-[#b1bac0] px-3 py-[15px] text-center">{person.translatedTitles}</div>
                    <div className="border-r border-[#b1bac0] px-3 py-[15px] text-center">{person.translationLanguages}</div>
                    <div className="border-r border-[#b1bac0] px-3 py-[15px] text-center">{person.awards}</div>
                    <div className="border-r border-[#b1bac0] px-3 py-[15px] text-center">{person.regularReissues}</div>
                    <div className="border-r border-[#b1bac0] px-3 py-[15px] text-center">{person.pocketReissues}</div>
                    <div className="px-3 py-[15px] text-center">{person.publicationCountries}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="flex flex-col items-center gap-3">
            <p className="text-center text-[13px] font-bold leading-none text-black">
              {t("pagination.results", {
                start: String((currentPage - 1) * PERSONS_PER_PAGE + 1),
                end: String(Math.min(currentPage * PERSONS_PER_PAGE, samplePersons.length)),
                total: String(samplePersons.length),
              })}
            </p>
            <Pagination>
              <PaginationContent className="flex-wrap justify-center">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    text={t("pagination.previous")}
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage((page) => Math.max(1, page - 1));
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {paginationItems.map((item) =>
                  typeof item === "number" ? (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        isActive={item === currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          setCurrentPage(item);
                        }}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    text={t("pagination.next")}
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage((page) => Math.min(totalPages, page + 1));
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
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
