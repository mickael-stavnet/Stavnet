import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import { Link } from "@/i18n/routing";
import { getOrganizationsPage, ORGS_PAGE_SIZE } from "@/lib/data/orgs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ORGS_GRID_TEMPLATE = "2.4fr 1.05fr 1.08fr 0.98fr 0.62fr 0.64fr";

interface OrgsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

function RedMarker() {
  return <span className="mr-2 inline-block h-[11px] w-[11px] rounded-full border-[2px] border-[#ff1d1d]" />;
}

function buildPageHref(page: number): string {
  return page <= 1 ? "?page=1" : `?page=${page}`;
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

export default async function OrganizationsListPage({ searchParams }: OrgsPageProps) {
  const [{ page }, t] = await Promise.all([searchParams, getTranslations("Orgs")]);
  const currentPage = Number.parseInt(page ?? "1", 10);
  const result = await getOrganizationsPage(Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1);
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

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
      <Image src="/background/background.png" alt="" fill priority sizes="100vw" className="object-cover" />

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
              <span className="font-bold text-[#ff1d1d]">{result.total}</span>
            </div>
            <div className="flex items-center gap-3 text-[18px] leading-none text-black">
              <span>{t("stats.databaseContains")}</span>
              <span>:</span>
              <span className="font-bold text-[#ff1d1d]">{result.total}</span>
            </div>
          </div>

          <section className="overflow-hidden rounded-[8px] border border-[#7aa8b7] bg-[#d8dde2] shadow-[4px_4px_8px_rgba(0,0,0,0.18)]">
            <div className="space-y-3 p-3 md:hidden">
              {result.items.map((organization) => (
                <MobileOrganizationCard
                  key={organization.name}
                  organization={organization}
                  labels={{
                    country: columnLabels.country,
                    creationDate: columnLabels.creationDate,
                    viewMore: t("footer.move"),
                  }}
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
                {result.items.map((organization, rowIndex) => (
                  <div
                    key={`${organization.name}-${result.page}-${rowIndex}`}
                    className="grid min-w-[1100px] border-b border-[#9bb2bc] text-[15px] leading-none text-black last:border-b-0"
                    style={{ gridTemplateColumns: ORGS_GRID_TEMPLATE }}
                  >
                    <div className="border-r border-[#9bb2bc] px-2 py-[14px]">
                      <Link
                        href={{ pathname: "/orgs/details", query: { name: organization.name } }}
                        className="flex items-center text-black hover:underline"
                      >
                        <RedMarker />
                        <span className="min-w-0 break-words">{organization.name}</span>
                      </Link>
                    </div>
                    <div className="border-r border-[#9bb2bc] px-2 py-[14px]">{organization.type || "—"}</div>
                    <div className="border-r border-[#9bb2bc] px-2 py-[14px]">{organization.creationDate || "—"}</div>
                    <div className="border-r border-[#9bb2bc] px-2 py-[14px]">{organization.country || "—"}</div>
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
                start: String((result.page - 1) * ORGS_PAGE_SIZE + 1),
                end: String(Math.min(result.page * ORGS_PAGE_SIZE, result.total)),
                total: String(result.total),
              })}
            </p>
            <Pagination>
              <PaginationContent className="flex-wrap justify-center">
                <PaginationItem>
                  <PaginationPrevious
                    href={buildPageHref(result.page - 1)}
                    text={t("pagination.previous")}
                    className={result.page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {paginationItems.map((item) =>
                  typeof item === "number" ? (
                    <PaginationItem key={item}>
                      <PaginationLink href={buildPageHref(item)} isActive={item === result.page}>
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
                    href={buildPageHref(result.page + 1)}
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
          className="md:bottom-[2.6vh] md:left-[6vw] md:right-[6vw]"
          itemClassName="md:min-h-[70px] md:text-[14px]"
          mobileGridClassName="grid-cols-2 sm:grid-cols-3"
          desktopMode="compact"
        />
      </div>
    </main>
  );
}
