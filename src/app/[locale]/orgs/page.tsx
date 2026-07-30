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
  getOrganizationsPageByCountry,
  getOrganizationsPageByFilters,
  getOrganizationsPageByName,
  getOrganizationsPageByType,
} from "@/lib/data/orgs";
import {
  buildOrganizationsPageHref,
  ORGANIZATION_FILTER_OPTIONS,
  resolveOrganizationsListSelection,
} from "@/lib/orgs-search";
import { isPageWithinLimit, MAX_ORGANIZATIONS_PAGE } from "@/lib/pagination";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildStaticPageMetadata } from "@/lib/site-metadata";
import { isBookRelatedFacet } from "@/lib/book-related";

const ORGS_COLUMN_WIDTHS = ["35.45%", "15.51%", "15.95%", "14.48%", "9.16%", "9.45%"] as const;
const ORGS_PAGE_SIZE = 10;
const ORGS_TABLE_CONTAINER_CLASS = "min-h-[430px] bg-[#eaf5f8]/90 md:block md:min-h-0 md:flex-1";
const ORGS_TABLE_HEAD_ROW_CLASS = "bg-[#d7ebf2]/85 text-[12px] uppercase tracking-[0.04em] text-slate-700 [@media(max-height:950px)]:text-[10px]";
const ORGS_TABLE_HEAD_CELL_CLASS = "whitespace-normal px-4 py-3 text-left font-semibold [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-1.5";
const ORGS_TABLE_BODY_CLASS = "text-[15px] leading-[1.25] [@media(max-height:950px)]:text-[12px] [@media(max-height:950px)]:leading-[1.1]";
const ORGS_TABLE_ROW_CLASS = "h-[42px] text-slate-950 [@media(max-height:950px)]:h-[35px]";
const ORGS_TABLE_CELL_CLASS = "px-4 py-3 align-middle [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-1.5";

interface OrgsPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    type?: string;
    country?: string;
    fallbackFacet?: string;
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
  const [{ locale }, { page, q, type, country, fallbackFacet: fallbackFacetParam }, t] = await Promise.all([params, searchParams, getTranslations("Orgs")]);
  const selection = resolveOrganizationsListSelection({ page, q, type, country });
  const fallbackFacet = isBookRelatedFacet(fallbackFacetParam ?? "") ? fallbackFacetParam : null;

  if (!isPageWithinLimit(selection.pageNumber, MAX_ORGANIZATIONS_PAGE)) {
    redirect({
      href: {
        pathname: "/orgs",
        query: { page: "1" },
      },
      locale,
    });
  }

  const result = selection.typeFilter && selection.countryFilter
    ? await getOrganizationsPageByFilters(
        selection.pageNumber,
        { searchTerm: selection.searchTerm, type: selection.typeFilter, country: selection.countryFilter },
        ORGS_PAGE_SIZE,
      )
    : selection.mode === "category"
    ? await getOrganizationsPageByCategory(
        selection.pageNumber,
        selection.categoryFilter as (typeof ORGANIZATION_FILTER_OPTIONS)[number],
        selection.searchTerm,
        ORGS_PAGE_SIZE,
      )
    : selection.mode === "type"
      ? await getOrganizationsPageByType(selection.pageNumber, selection.typeFilter, selection.searchTerm, ORGS_PAGE_SIZE)
      : selection.mode === "country"
        ? await getOrganizationsPageByCountry(selection.pageNumber, selection.countryFilter, selection.searchTerm, ORGS_PAGE_SIZE)
      : selection.mode === "name"
        ? await getOrganizationsPageByName(selection.pageNumber, selection.searchTerm, ORGS_PAGE_SIZE)
        : await getOrganizationsPage(selection.pageNumber, ORGS_PAGE_SIZE);
  if (fallbackFacet && selection.countryFilter && result.total === 0) {
    redirect({
      href: {
        pathname: "/books/related",
        query: {
          facet: fallbackFacet,
          value: selection.countryFilter,
        },
      },
      locale,
    });
  }
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
      <Image src="/background/background.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-95 saturate-[1.08]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(210,229,242,0.18),rgba(210,229,242,0.08))]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-0 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0">
        <StavnetHeader
          pageName={t("header.cardTitle")}
          title={t("header.title")}
          subtitle={t("header.subtitle")}
        />

      <section className="mt-6 min-w-0 flex min-h-0 flex-col gap-4 md:absolute md:left-1/2 md:top-[178px] md:bottom-[190px] md:w-[min(1320px,96vw)] md:-translate-x-1/2 [@media(max-height:950px)]:top-[160px] [@media(max-height:950px)]:bottom-[118px] [@media(max-height:950px)]:gap-2">
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
                  <Button asChild variant={!selection.typeFilter ? "default" : "outline"} size="sm">
                    <Link href={buildOrganizationsPageHref(1, selection.searchTerm, "", selection.countryFilter)}>{filterLabels.all}</Link>
                  </Button>
                  {ORGANIZATION_FILTER_OPTIONS.map((option) => (
                    <Button key={option} asChild variant={selection.typeFilter === option ? "default" : "outline"} size="sm">
                      <Link href={buildOrganizationsPageHref(1, selection.searchTerm, option, selection.countryFilter)}>{filterLabels[option]}</Link>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            {selection.typeFilter || selection.countryFilter ? (
              <div className="rounded-[8px] border border-[#7aa8b7] bg-[#a7dcee] px-4 py-3 shadow-[3px_3px_6px_rgba(0,0,0,0.12)] [@media(max-height:950px)]:px-3 [@media(max-height:950px)]:py-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#07384a] [@media(max-height:950px)]:text-[10px]">{selection.countryFilter ? columnLabels.country : columnLabels.type}</p>
                <p className="mt-2 text-[18px] font-bold leading-tight text-black [@media(max-height:950px)]:mt-1 [@media(max-height:950px)]:text-[15px]">
                  {selection.countryFilter || (selection.categoryFilter ? filterLabels[selection.categoryFilter as keyof typeof filterLabels] : selection.typeFilter)}
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

          <div className={ORGS_TABLE_CONTAINER_CLASS}>
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

            <div className="hidden md:block md:h-full md:overflow-auto">
              {result.items.length > 0 ? (
                <div className="min-h-0 flex-1 overflow-auto">
                  <Table className="min-w-[1100px] table-fixed bg-[#eaf5f8]/90 text-slate-950">
                    <colgroup>
                      {ORGS_COLUMN_WIDTHS.map((width, index) => (
                        <col key={`${width}-${index}`} style={{ width }} />
                      ))}
                    </colgroup>
                    <TableHeader>
                      <TableRow className={ORGS_TABLE_HEAD_ROW_CLASS}>
                        <TableHead className={ORGS_TABLE_HEAD_CELL_CLASS}>{columnLabels.organizations}</TableHead>
                        <TableHead className={ORGS_TABLE_HEAD_CELL_CLASS}>{columnLabels.type}</TableHead>
                        <TableHead className={ORGS_TABLE_HEAD_CELL_CLASS}>{columnLabels.creationDate}</TableHead>
                        <TableHead className={ORGS_TABLE_HEAD_CELL_CLASS}>{columnLabels.country}</TableHead>
                        <TableHead className={ORGS_TABLE_HEAD_CELL_CLASS}>{columnLabels.titlesPublished}</TableHead>
                        <TableHead className={ORGS_TABLE_HEAD_CELL_CLASS}>{columnLabels.authorsPublished}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className={ORGS_TABLE_BODY_CLASS}>
                      {result.items.map((organization, rowIndex) => (
                        <TableRow key={`${organization.name}-${result.page}-${rowIndex}`} className={ORGS_TABLE_ROW_CLASS}>
                          <TableCell className={ORGS_TABLE_CELL_CLASS}>
                            <Link
                              href={{ pathname: "/orgs/details", query: { name: organization.name } }}
                              className="flex items-center gap-2 text-black hover:underline"
                            >
                              <RedMarker />
                              <span className="w-full break-words">{organization.name}</span>
                            </Link>
                          </TableCell>
                          <TableCell className={ORGS_TABLE_CELL_CLASS}>{organization.type || "—"}</TableCell>
                          <TableCell className={ORGS_TABLE_CELL_CLASS}>{organization.creationDate || "—"}</TableCell>
                          <TableCell className={ORGS_TABLE_CELL_CLASS}>{organization.country || "—"}</TableCell>
                          <TableCell className={`${ORGS_TABLE_CELL_CLASS} text-center`}>{organization.publishedTitles}</TableCell>
                          <TableCell className={`${ORGS_TABLE_CELL_CLASS} text-center`}>{organization.publishedAuthors}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="px-6 py-10 text-center text-[14px] font-bold text-black">{t("search.noResults")}</div>
              )}
            </div>
          </div>

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
                    href={buildOrganizationsPageHref(result.page - 1, selection.searchTerm, selection.typeFilter, selection.countryFilter)}
                    text={t("pagination.previous")}
                    className={result.page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {paginationItems.map((item) =>
                  typeof item === "number" ? (
                    <PaginationItem key={item}>
                      <PaginationLink href={buildOrganizationsPageHref(item, selection.searchTerm, selection.typeFilter, selection.countryFilter)} isActive={item === result.page}>
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
                    href={buildOrganizationsPageHref(result.page + 1, selection.searchTerm, selection.typeFilter, selection.countryFilter)}
                    text={t("pagination.next")}
                    className={result.page === result.totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </section>

        <StavnetFooter items={footerItems} desktopMode="compact" />
      </div>
    </main>
  );
}
