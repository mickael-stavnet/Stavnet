import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import { ListNameSearch } from "@/components/stavnet/list-name-search";
import { Link } from "@/i18n/routing";
import {
  getOrganizationsPage,
  getOrganizationsPageByCategory,
  getOrganizationsPageByName,
  getOrganizationsPageByType,
} from "@/lib/data/orgs";
import {
  buildOrganizationsPageHref,
  ORGANIZATION_FILTER_OPTIONS,
  resolveOrganizationsListSelection,
} from "@/lib/orgs-search";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { buildStaticPageMetadata } from "@/lib/site-metadata";

const ORGS_COLUMN_WIDTHS = ["35.45%", "15.51%", "15.95%", "14.48%", "9.16%", "9.45%"] as const;
const ORGS_PAGE_SIZE = 10;
const ORGS_TABLE_SHELL_CLASS =
  "overflow-hidden rounded-[12px] border border-[#8fa0a8] bg-[linear-gradient(180deg,#dfe4e9_0%,#d6dce1_100%)] shadow-[0_10px_24px_rgba(53,78,91,0.12),inset_0_1px_0_rgba(255,255,255,0.55)] md:flex md:min-h-0 md:flex-1 md:flex-col";
const ORGS_TABLE_HEAD_ROW_CLASS = "border-b border-[#9aa8b0] bg-[#fff68f] text-[10px] uppercase leading-[1.08] tracking-[0.04em] [@media(max-height:950px)]:text-[9px]";
const ORGS_TABLE_HEAD_CELL_CLASS = "border-r border-[#9aa8b0] px-3 py-[13px] text-center font-semibold [@media(max-height:950px)]:py-[4px]";
const ORGS_TABLE_BODY_CLASS = "text-[13px] leading-[1.2] [@media(max-height:950px)]:text-[10px] [@media(max-height:950px)]:leading-[1]";
const ORGS_TABLE_ROW_CLASS = "border-b border-[#b1bac0]/80 bg-[rgba(236,241,244,0.92)] transition-colors odd:bg-[rgba(228,233,237,0.78)] hover:bg-[#eef4f8]";
const ORGS_TABLE_CELL_CLASS = "border-r border-[#b1bac0]/70 px-3 py-[18px] align-middle [@media(max-height:950px)]:py-[2px]";

interface OrgsPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    type?: string;
  }>;
}

export async function generateMetadata({ params }: OrgsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "organizations", "/orgs");
}

function RedMarker() {
  return <span className="inline-block h-[9px] w-[9px] shrink-0 rounded-full border-[1.5px] border-[#ff1d1d]" />;
}

function getPaginationItems(currentPage: number, totalPages: number): Array<number | string> {
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
}

function MobileOrganizationCard({
  organization,
  labels,
}: {
  organization: Awaited<ReturnType<typeof getOrganizationsPage>>["items"][number];
  labels: {
    country: string;
    creationDate: string;
    viewMore: string;
  };
}) {
  return (
    <article className="border-b border-[#b1bac0] px-1 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[16px] font-bold leading-tight text-black">{organization.name}</p>
        <p className="mt-1 text-[13px] leading-tight text-[#21323b]">{organization.type || "—"}</p>
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
        href={{ pathname: "/orgs/details", query: { name: organization.name } }}
        className="mt-3 inline-block text-[13px] font-bold text-[#0f4c81] underline underline-offset-2"
      >
        {labels.viewMore}
      </Link>
    </article>
  );
}

export default async function OrganizationsListPage({ params, searchParams }: OrgsPageProps) {
  const [{ locale }, { page, q, type }, t] = await Promise.all([params, searchParams, getTranslations("Orgs")]);
  const selection = resolveOrganizationsListSelection({ page, q, type });
  const result = selection.mode === "category"
    ? await getOrganizationsPageByCategory(
        selection.pageNumber,
        selection.categoryFilter as (typeof ORGANIZATION_FILTER_OPTIONS)[number],
        selection.searchTerm,
        ORGS_PAGE_SIZE,
      )
    : selection.mode === "type"
      ? await getOrganizationsPageByType(selection.pageNumber, selection.typeFilter, selection.searchTerm, ORGS_PAGE_SIZE)
      : selection.mode === "name"
        ? await getOrganizationsPageByName(selection.pageNumber, selection.searchTerm, ORGS_PAGE_SIZE)
        : await getOrganizationsPage(selection.pageNumber, ORGS_PAGE_SIZE);
  if (selection.mode !== "basic" && result.total === 1 && result.items[0]) {
    redirect({
      href: {
        pathname: "/orgs/details",
        query: {
          name: result.items[0].name,
        },
      },
      locale,
    });
  }
  const paginationItems = getPaginationItems(result.page, result.totalPages);
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/home" as const, label: t("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: t("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: t("footer.close") },
    { key: "search", icon: "/icons/icons-nav/rechercher.png", href: "/search" as const, label: t("footer.search") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/orgs" as const, label: t("footer.help") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/orgs" as const, label: t("footer.move") },
  ];
  const columnLabels = {
    organizations: t("columns.organizations"),
    type: t("columns.type"),
    creationDate: t("columns.creationDate"),
    country: t("columns.country"),
    titlesPublished: t("columns.titlesPublished"),
    authorsPublished: t("columns.authorsPublished"),
  };
  const filterLabels = {
    title: t("filters.title"),
    all: t("filters.all"),
    Editeur: t("filters.options.Editeur"),
    Bibliothèque: t("filters.options.Bibliothèque"),
    AutreOrganisme: t("filters.options.AutreOrganisme"),
  } as const;

  return (
    <main dir="ltr" className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image src="/background/background.png" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-95 saturate-[1.08]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(210,229,242,0.18),rgba(210,229,242,0.08))]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-0 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName={t("header.cardTitle")}
          title={t("header.title")}
          subtitle={t("header.subtitle")}
        />

        <section className="mt-6 min-w-0 flex flex-col gap-4 md:absolute md:left-1/2 md:top-[178px] md:bottom-[132px] md:w-[min(1320px,96vw)] md:-translate-x-1/2 [@media(max-height:950px)]:top-[112px] [@media(max-height:950px)]:bottom-[68px]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6 [@media(max-height:950px)]:gap-1.5">
            <div className="flex flex-col gap-3">
              <ListNameSearch
                key={selection.searchTerm}
                label={t("search.label")}
                placeholder={t("search.placeholder")}
                initialValue={selection.searchTerm}
                resetLabel={t("search.reset")}
              />
              <div className="flex flex-col gap-2 [@media(max-height:950px)]:gap-1">
                <p className="text-[13px] font-bold leading-none text-black [@media(max-height:950px)]:text-[12px]">{filterLabels.title}</p>
                <div className="flex flex-wrap gap-2 [@media(max-height:950px)]:gap-1">
                    <Link
                    href={buildOrganizationsPageHref(1, selection.searchTerm, "")}
                    className={`rounded-[8px] border px-3 py-2 text-[13px] font-bold leading-none shadow-[2px_2px_4px_rgba(0,0,0,0.12)] [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-1 [@media(max-height:950px)]:text-[12px] ${
                      !selection.typeFilter
                        ? "border-[#7aa8b7] bg-[#91d3ea] text-black"
                        : "border-[#d1bb48] bg-[#ffea56] text-black hover:bg-[#fff16f]"
                    }`}
                  >
                    {filterLabels.all}
                  </Link>
                  {ORGANIZATION_FILTER_OPTIONS.map((option) => (
                      <Link
                        key={option}
                        href={buildOrganizationsPageHref(1, selection.searchTerm, option)}
                        className={`rounded-[8px] border px-3 py-2 text-[13px] font-bold leading-none shadow-[2px_2px_4px_rgba(0,0,0,0.12)] [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-1 [@media(max-height:950px)]:text-[12px] ${
                        selection.typeFilter === option
                          ? "border-[#7aa8b7] bg-[#91d3ea] text-black"
                          : "border-[#d1bb48] bg-[#ffea56] text-black hover:bg-[#fff16f]"
                        }`}
                    >
                      {filterLabels[option]}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            {selection.typeFilter ? (
              <div className="rounded-[8px] border border-[#7aa8b7] bg-[#a7dcee] px-4 py-3 shadow-[3px_3px_6px_rgba(0,0,0,0.12)] [@media(max-height:950px)]:px-3 [@media(max-height:950px)]:py-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#07384a] [@media(max-height:950px)]:text-[10px]">{columnLabels.type}</p>
                <p className="mt-2 text-[18px] font-bold leading-tight text-black [@media(max-height:950px)]:mt-1 [@media(max-height:950px)]:text-[15px]">
                  {selection.categoryFilter ? filterLabels[selection.categoryFilter as keyof typeof filterLabels] : selection.typeFilter}
                </p>
              </div>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end sm:gap-6 [@media(max-height:950px)]:gap-1.5">
              <div className="flex items-center gap-3 text-[18px] leading-none text-black [@media(max-height:950px)]:gap-2 [@media(max-height:950px)]:text-[15px]">
                <span>{t("stats.cardsFound")}</span>
                <span>:</span>
                <span className="font-bold text-[#ff1d1d]">{result.total}</span>
              </div>
              <div className="flex items-center gap-3 text-[18px] leading-none text-black [@media(max-height:950px)]:gap-2 [@media(max-height:950px)]:text-[15px]">
                <span>{t("stats.databaseContains")}</span>
                <span>:</span>
                <span className="font-bold text-[#ff1d1d]">{result.databaseTotal}</span>
              </div>
            </div>
          </div>

          <section className={ORGS_TABLE_SHELL_CLASS}>
            <div className="space-y-3 p-3 md:hidden">
              {result.items.length > 0 ? (
                result.items.map((organization) => (
                  <MobileOrganizationCard
                    key={organization.name}
                    organization={organization}
                    labels={{
                      country: columnLabels.country,
                      creationDate: columnLabels.creationDate,
                      viewMore: t("footer.move"),
                    }}
                  />
                ))
              ) : (
                <p className="px-2 py-5 text-center text-[14px] font-bold text-black">{t("search.noResults")}</p>
              )}
            </div>

            <div className="hidden md:block md:flex-1 md:min-h-0">
              {result.items.length > 0 ? (
                <div className="overflow-auto md:h-full md:min-h-0">
                  <table className="min-w-[1100px] table-fixed border-collapse text-black">
                    <colgroup>
                      {ORGS_COLUMN_WIDTHS.map((width, index) => (
                        <col key={`${width}-${index}`} style={{ width }} />
                      ))}
                    </colgroup>
                    <thead>
                      <tr className={ORGS_TABLE_HEAD_ROW_CLASS}>
                        <th className={`${ORGS_TABLE_HEAD_CELL_CLASS} rounded-tl-[12px]`}>{columnLabels.organizations}</th>
                        <th className={ORGS_TABLE_HEAD_CELL_CLASS}>{columnLabels.type}</th>
                        <th className={ORGS_TABLE_HEAD_CELL_CLASS}>{columnLabels.creationDate}</th>
                        <th className={ORGS_TABLE_HEAD_CELL_CLASS}>{columnLabels.country}</th>
                        <th className={ORGS_TABLE_HEAD_CELL_CLASS}>{columnLabels.titlesPublished}</th>
                        <th className={`${ORGS_TABLE_HEAD_CELL_CLASS} rounded-tr-[12px] border-r-0`}>{columnLabels.authorsPublished}</th>
                      </tr>
                    </thead>
                    <tbody className={ORGS_TABLE_BODY_CLASS}>
                      {result.items.map((organization, rowIndex) => (
                        <tr key={`${organization.name}-${result.page}-${rowIndex}`} className={ORGS_TABLE_ROW_CLASS}>
                          <td className={ORGS_TABLE_CELL_CLASS}>
                            <Link
                              href={{ pathname: "/orgs/details", query: { name: organization.name } }}
                              className="flex items-center gap-2 text-black hover:underline"
                            >
                              <RedMarker />
                              <span className="w-full break-words">{organization.name}</span>
                            </Link>
                          </td>
                          <td className={ORGS_TABLE_CELL_CLASS}>{organization.type || "—"}</td>
                          <td className={ORGS_TABLE_CELL_CLASS}>{organization.creationDate || "—"}</td>
                          <td className={ORGS_TABLE_CELL_CLASS}>{organization.country || "—"}</td>
                          <td className={`${ORGS_TABLE_CELL_CLASS} text-center`}>{organization.publishedTitles}</td>
                          <td className="px-3 py-[18px] text-center align-middle">{organization.publishedAuthors}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-10 text-center text-[14px] font-bold text-black">{t("search.noResults")}</div>
              )}
            </div>
          </section>

          <div className="flex flex-col items-center gap-3 md:pb-6 [@media(max-height:950px)]:gap-1">
            <p className="text-center text-[13px] font-bold leading-none text-black">
              {t("pagination.results", {
                start: String((result.page - 1) * ORGS_PAGE_SIZE + 1),
                end: String(Math.min(result.page * ORGS_PAGE_SIZE, result.total)),
                total: String(result.total),
              })}
            </p>
            <Pagination>
              <PaginationContent className="flex-wrap justify-center">
                <PaginationItem>
                    <PaginationPrevious
                    href={buildOrganizationsPageHref(result.page - 1, selection.searchTerm, selection.typeFilter)}
                    text={t("pagination.previous")}
                    className={result.page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {paginationItems.map((item) =>
                  typeof item === "number" ? (
                    <PaginationItem key={item}>
                      <PaginationLink href={buildOrganizationsPageHref(item, selection.searchTerm, selection.typeFilter)} isActive={item === result.page}>
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
                    href={buildOrganizationsPageHref(result.page + 1, selection.searchTerm, selection.typeFilter)}
                    text={t("pagination.next")}
                    className={result.page === result.totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </section>

        <StavnetFooter
          items={footerItems}
          desktopMode="compact"
        />
      </div>
    </main>
  );
}
