"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface OrganizationRow {
  name: string;
  type: string;
  creationDate: string;
  country: string;
  publishedTitles: string;
  publishedAuthors: string;
}

const ORGS_GRID_TEMPLATE = "2.4fr 1.05fr 1.08fr 0.98fr 0.62fr 0.64fr";

const sampleOrganizations: OrganizationRow[] = [
  { name: "Eked", type: "Editeur", creationDate: "", country: "", publishedTitles: "14", publishedAuthors: "10" },
  { name: "ITHL", type: "AutreOrganisme", creationDate: "", country: "", publishedTitles: "2739", publishedAuthors: "85" },
  { name: "Am Oved", type: "Editeur", creationDate: "", country: "", publishedTitles: "236", publishedAuthors: "53" },
  { name: "Ma’ariv", type: "Editeur", creationDate: "", country: "", publishedTitles: "50", publishedAuthors: "15" },
  { name: "Sifriat Poalim", type: "Editeur", creationDate: "", country: "", publishedTitles: "134", publishedAuthors: "29" },
  { name: "Bitan", type: "Editeur", creationDate: "", country: "", publishedTitles: "5", publishedAuthors: "4" },
  { name: "University Publishing Projects", type: "Editeur", creationDate: "", country: "", publishedTitles: "4", publishedAuthors: "1" },
  { name: "Hakibbutz Hameuchad", type: "Editeur", creationDate: "", country: "", publishedTitles: "260", publishedAuthors: "44" },
  { name: "BPI", type: "AutreOrganisme", creationDate: "", country: "France", publishedTitles: "290", publishedAuthors: "68" },
  { name: "Zmora-Bitan", type: "Editeur", creationDate: "", country: "", publishedTitles: "71", publishedAuthors: "21" },
  { name: "BnF", type: "AutreOrganisme", creationDate: "", country: "France", publishedTitles: "623", publishedAuthors: "109" },
  { name: "Keter", type: "Editeur", creationDate: "", country: "Israel", publishedTitles: "163", publishedAuthors: "32" },
  { name: "Siman Kriah", type: "Editeur", creationDate: "", country: "", publishedTitles: "59", publishedAuthors: "16" },
  { name: "BNI", type: "AutreOrganisme", creationDate: "", country: "Israël", publishedTitles: "541", publishedAuthors: "43" },
  { name: "Keshet", type: "Editeur", creationDate: "", country: "", publishedTitles: "20", publishedAuthors: "4" },
  { name: "Massada", type: "Editeur", creationDate: "", country: "", publishedTitles: "99", publishedAuthors: "28" },
  { name: "Proza", type: "Editeur", creationDate: "", country: "", publishedTitles: "4", publishedAuthors: "4" },
  { name: "Hargol", type: "Editeur", creationDate: "", country: "", publishedTitles: "3", publishedAuthors: "1" },
  { name: "Makhbarot Lesifrut", type: "Editeur", creationDate: "", country: "", publishedTitles: "11", publishedAuthors: "7" },
  { name: "Schocken", type: "Editeur", creationDate: "1939", country: "Israël", publishedTitles: "412", publishedAuthors: "88" },
  { name: "Hakibbutz Artzi", type: "Editeur", creationDate: "1942", country: "Israël", publishedTitles: "178", publishedAuthors: "36" },
  { name: "Kinneret", type: "Editeur", creationDate: "1978", country: "Israël", publishedTitles: "245", publishedAuthors: "61" },
  { name: "Yedioth Books", type: "Editeur", creationDate: "1989", country: "Israël", publishedTitles: "387", publishedAuthors: "94" },
  { name: "Resling", type: "Editeur", creationDate: "2000", country: "Israël", publishedTitles: "159", publishedAuthors: "52" },
  { name: "Carmel", type: "Editeur", creationDate: "1987", country: "Israël", publishedTitles: "201", publishedAuthors: "47" },
  { name: "Magnes Press", type: "AutreOrganisme", creationDate: "1929", country: "Israël", publishedTitles: "514", publishedAuthors: "133" },
  { name: "Babel", type: "Editeur", creationDate: "1995", country: "Israël", publishedTitles: "126", publishedAuthors: "31" },
  { name: "Kibbutz Meuchad Library", type: "Bibliothèque", creationDate: "1951", country: "Israël", publishedTitles: "84", publishedAuthors: "19" },
  { name: "Institut français", type: "AutreOrganisme", creationDate: "1907", country: "France", publishedTitles: "63", publishedAuthors: "22" },
  { name: "National Library", type: "Bibliothèque", creationDate: "1892", country: "Israël", publishedTitles: "905", publishedAuthors: "248" },
];

const ORGS_PER_PAGE = 13;

function RedMarker() {
  return <span className="mr-2 inline-block h-[11px] w-[11px] rounded-full border-[2px] border-[#ff1d1d]" />;
}

function OrganizationMobileCard({
  organization,
  labels,
}: {
  organization: OrganizationRow;
  labels: {
    organizations: string;
    type: string;
    creationDate: string;
    country: string;
    titlesPublished: string;
    authorsPublished: string;
  };
}) {
  return (
    <article className="border-b border-[#b1bac0] px-1 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[16px] font-bold leading-tight text-black">{organization.name}</p>
        <p className="mt-1 text-[13px] leading-tight text-[#21323b]">{organization.type}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] leading-[1.35] text-black">
        <div>
          <p className="font-bold uppercase text-[#4a5a63]">{labels.country}</p>
          <p className="mt-1 break-words">{organization.country || "—"}</p>
        </div>
        <div>
          <p className="font-bold uppercase text-[#4a5a63]">{labels.creationDate}</p>
          <p className="mt-1 break-words">{organization.creationDate || "—"}</p>
        </div>
      </div>

      <Link
        href="/orgs/details"
        className="mt-3 inline-block text-[13px] font-bold text-[#0f4c81] underline underline-offset-2"
      >
        Voir plus
      </Link>
    </article>
  );
}

export default function OrganizationsListPage() {
  const t = useTranslations("Orgs");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sampleOrganizations.length / ORGS_PER_PAGE);
  const visibleOrganizations = useMemo(() => {
    const start = (currentPage - 1) * ORGS_PER_PAGE;
    return sampleOrganizations.slice(start, start + ORGS_PER_PAGE);
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
  const columnLabels = {
    organizations: t("columns.organizations"),
    type: t("columns.type"),
    creationDate: t("columns.creationDate"),
    country: t("columns.country"),
    titlesPublished: t("columns.titlesPublished"),
    authorsPublished: t("columns.authorsPublished"),
  };
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "search", icon: "/icons/icons-nav/rechercher.png", href: "/search" as const, label: t("footer.search") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/orgs" as const, label: t("footer.help") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/orgs" as const, label: t("footer.move") },
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

          <section className="overflow-hidden rounded-[8px] border border-[#7aa8b7] bg-[#d8dde2] shadow-[4px_4px_8px_rgba(0,0,0,0.18)]">
            <div className="space-y-3 p-3 md:hidden">
              {visibleOrganizations.map((organization) => (
                <OrganizationMobileCard
                  key={`${organization.name}-${organization.creationDate}`}
                  organization={organization}
                  labels={columnLabels}
                />
              ))}
            </div>

            <div className="hidden flex-col md:flex">
              <div
                className="grid min-w-[1100px] border-b border-[#7aa8b7] bg-[#fff15a] text-[12px] uppercase leading-none text-black"
                style={{ gridTemplateColumns: ORGS_GRID_TEMPLATE }}
              >
                <div className="rounded-tl-[8px] border-r border-[#7aa8b7] px-3 py-[10px]">{columnLabels.organizations}</div>
                <div className="border-r border-[#7aa8b7] px-3 py-[10px] text-center">{columnLabels.type}</div>
                <div className="border-r border-[#7aa8b7] px-3 py-[10px] text-center">{columnLabels.creationDate}</div>
                <div className="border-r border-[#7aa8b7] px-3 py-[10px] text-center">{columnLabels.country}</div>
                <div className="border-r border-[#7aa8b7] px-3 py-[10px] text-center">{columnLabels.titlesPublished}</div>
                <div className="rounded-tr-[8px] px-3 py-[10px] text-center">{columnLabels.authorsPublished}</div>
              </div>

              <div className="overflow-auto">
                {visibleOrganizations.map((organization, rowIndex) => (
                  <div
                    key={`${organization.name}-${currentPage}-${rowIndex}`}
                    className="grid min-w-[1100px] border-b border-[#9bb2bc] text-[15px] leading-none text-black last:border-b-0"
                    style={{ gridTemplateColumns: ORGS_GRID_TEMPLATE }}
                  >
                    <div className="border-r border-[#9bb2bc] px-2 py-[14px]">
                      <Link href="/orgs/details" className="flex items-center text-black hover:underline">
                        <RedMarker />
                        <span className="min-w-0 break-words">{organization.name}</span>
                      </Link>
                    </div>
                    <div className="border-r border-[#9bb2bc] px-2 py-[14px]">{organization.type}</div>
                    <div className="border-r border-[#9bb2bc] px-2 py-[14px]">{organization.creationDate}</div>
                    <div className="border-r border-[#9bb2bc] px-2 py-[14px]">{organization.country}</div>
                    <div className="border-r border-[#9bb2bc] px-2 py-[14px] text-center">{organization.publishedTitles}</div>
                    <div className="px-2 py-[14px] text-center">{organization.publishedAuthors}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="flex flex-col items-center gap-3">
            <p className="text-center text-[13px] font-bold leading-none text-black">
              {t("pagination.results", {
                start: String((currentPage - 1) * ORGS_PER_PAGE + 1),
                end: String(Math.min(currentPage * ORGS_PER_PAGE, sampleOrganizations.length)),
                total: String(sampleOrganizations.length),
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
