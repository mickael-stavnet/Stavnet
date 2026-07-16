import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import { ListNameSearch } from "@/components/stavnet/list-name-search";
import { Link } from "@/i18n/routing";
import { getPersonsPage, getPersonsPageByName } from "@/lib/data/persons";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildStaticPageMetadata } from "@/lib/site-metadata";
import { isPageWithinLimit, MAX_PERSONS_PAGE } from "@/lib/pagination";

const PERSONS_COLUMN_WIDTHS =
  ["24.35%", "13.92%", "13.42%", "7.16%", "7.75%", "8.15%", "7.95%", "8.15%", "7.95%", "9.15%"] as const;
const PERSONS_PAGE_SIZE = 10;
const PERSONS_TABLE_CONTAINER_CLASS = "bg-[#eaf5f8]/90 md:min-h-[460px] [@media(max-height:950px)]:min-h-[390px]";
const PERSONS_TABLE_HEAD_ROW_CLASS = "bg-[#d7ebf2]/85 text-[12px] uppercase tracking-[0.04em] text-slate-700 [@media(max-height:950px)]:text-[10px]";
const PERSONS_TABLE_HEAD_CELL_CLASS = "whitespace-normal px-4 py-3 text-left font-semibold [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-1.5";
const PERSONS_TABLE_BODY_CLASS = "text-[15px] leading-[1.25] [@media(max-height:950px)]:text-[12px] [@media(max-height:950px)]:leading-[1.1]";
const PERSONS_TABLE_ROW_CLASS = "h-[42px] text-slate-950 [@media(max-height:950px)]:h-[35px]";
const PERSONS_TABLE_CELL_CLASS = "px-4 py-3 align-middle [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-1.5";

interface PersonsPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
}

export async function generateMetadata({ params }: PersonsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "persons", "/persons");
}

function RedMarker() {
  return <span className="inline-block h-[9px] w-[9px] shrink-0 rounded-full border-[1.5px] border-[#ff1d1d]" />;
}

function buildPageHref(page: number, searchTerm: string): string {
  const params = new URLSearchParams();
  params.set("page", String(page <= 1 ? 1 : page));
  if (searchTerm.trim()) {
    params.set("q", searchTerm);
  }
  return `?${params.toString()}`;
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

function MobilePersonCard({
  person,
  labels,
}: {
  person: Awaited<ReturnType<typeof getPersonsPage>>["items"][number];
  labels: {
    language: string;
    originalTitles: string;
    viewMore: string;
  };
}) {
  return (
    <article className="border-b border-[#b1bac0] px-1 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[16px] font-bold leading-tight text-black">{person.name}</p>
        <p className="mt-1 text-[13px] leading-tight text-[#21323b]">{person.type || "—"}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] leading-[1.35] text-black">
        <div>
          <p className="font-bold uppercase text-[#4a5a63]">{labels.language}</p>
          <p className="mt-1 break-words">{person.language || "—"}</p>
        </div>
        <div>
          <p className="font-bold uppercase text-[#4a5a63]">{labels.originalTitles}</p>
          <p className="mt-1">{person.originalTitles}</p>
        </div>
      </div>

      <Link
        href={{ pathname: "/persons/details", query: { name: person.name } }}
        className="mt-3 inline-block text-[13px] font-bold text-[#0f4c81] underline underline-offset-2"
      >
        {labels.viewMore}
      </Link>
    </article>
  );
}

export default async function PersonsListPage({ params, searchParams }: PersonsPageProps) {
  const [{ locale }, { page, q }, t] = await Promise.all([params, searchParams, getTranslations("Persons")]);
  const currentPage = Number.parseInt(page ?? "1", 10);
  const searchTerm = (q ?? "").trim();
  const pageNumber = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;

  if (!isPageWithinLimit(pageNumber, MAX_PERSONS_PAGE)) {
    redirect({
      href: {
        pathname: "/persons",
        query: { page: "1" },
      },
      locale,
    });
  }

  const result = searchTerm
    ? await getPersonsPageByName(pageNumber, searchTerm, PERSONS_PAGE_SIZE)
    : await getPersonsPage(pageNumber, PERSONS_PAGE_SIZE);
  if (searchTerm && result.total === 1 && result.items[0]) {
    redirect({
      href: {
        pathname: "/persons/details",
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
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/persons" as const, label: t("footer.help") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/persons" as const, label: t("footer.move") },
  ];

  return (
    <main dir="ltr" className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden [@media(max-height:950px)]:h-auto [@media(max-height:950px)]:overflow-y-auto">
      <Image
        src="/background/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-95 saturate-[1.08]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(210,229,242,0.18),rgba(210,229,242,0.08))]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1120px] flex-col px-4 pb-5 pt-0 md:h-screen md:max-w-none md:px-0 md:pb-0 md:pt-0 [@media(max-height:950px)]:h-auto [@media(max-height:950px)]:pb-5">
        <StavnetHeader
          pageName={t("header.cardTitle")}
          title={t("header.title")}
          subtitle={t("header.subtitle")}
        />

      <section className="mt-6 min-w-0 flex flex-col gap-4 md:absolute md:left-1/2 md:top-[178px] md:bottom-[190px] md:w-[min(1320px,96vw)] md:-translate-x-1/2 [@media(max-height:950px)]:relative [@media(max-height:950px)]:left-auto [@media(max-height:950px)]:top-auto [@media(max-height:950px)]:bottom-auto [@media(max-height:950px)]:mx-auto [@media(max-height:950px)]:w-[min(1320px,96vw)] [@media(max-height:950px)]:translate-x-0 [@media(max-height:950px)]:gap-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6 [@media(max-height:950px)]:gap-2">
            <ListNameSearch
              key={searchTerm}
              label={t("search.label")}
              placeholder={t("search.placeholder")}
              initialValue={searchTerm}
              resetLabel={t("search.reset")}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end sm:gap-6 [@media(max-height:950px)]:gap-2">
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

          <div className={PERSONS_TABLE_CONTAINER_CLASS}>
            <div className="space-y-3 p-3 md:hidden">
              {result.items.length > 0 ? (
                result.items.map((person) => (
                  <MobilePersonCard
                    key={person.name}
                    person={person}
                    labels={{
                      language: t("columns.language"),
                      originalTitles: t("columns.originalTitles"),
                      viewMore: t("footer.move"),
                    }}
                  />
                ))
              ) : (
                <p className="px-2 py-5 text-center text-[14px] font-bold text-black">{t("search.noResults")}</p>
              )}
            </div>

            <div className="hidden md:block">
              {result.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table className="min-w-[1260px] table-fixed bg-[#eaf5f8]/90 text-slate-950">
                    <colgroup>
                      {PERSONS_COLUMN_WIDTHS.map((width, index) => (
                        <col key={`${width}-${index}`} style={{ width }} />
                      ))}
                    </colgroup>
                    <TableHeader>
                      <TableRow className={PERSONS_TABLE_HEAD_ROW_CLASS}>
                        <TableHead className={PERSONS_TABLE_HEAD_CELL_CLASS}>{t("columns.persons")}</TableHead>
                        <TableHead className={PERSONS_TABLE_HEAD_CELL_CLASS}>{t("columns.type")}</TableHead>
                        <TableHead className={PERSONS_TABLE_HEAD_CELL_CLASS}>{t("columns.language")}</TableHead>
                        <TableHead className={PERSONS_TABLE_HEAD_CELL_CLASS}>{t("columns.originalTitles")}</TableHead>
                        <TableHead className={PERSONS_TABLE_HEAD_CELL_CLASS}>{t("columns.translatedTitles")}</TableHead>
                        <TableHead className={PERSONS_TABLE_HEAD_CELL_CLASS}>{t("columns.translationLanguages")}</TableHead>
                        <TableHead className={PERSONS_TABLE_HEAD_CELL_CLASS}>{t("columns.awards")}</TableHead>
                        <TableHead className={PERSONS_TABLE_HEAD_CELL_CLASS}>{t("columns.regularReissues")}</TableHead>
                        <TableHead className={PERSONS_TABLE_HEAD_CELL_CLASS}>{t("columns.pocketReissues")}</TableHead>
                        <TableHead className={PERSONS_TABLE_HEAD_CELL_CLASS}>{t("columns.publicationCountries")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className={PERSONS_TABLE_BODY_CLASS}>
                      {result.items.map((person, rowIndex) => (
                        <TableRow key={`${person.name}-${result.page}-${rowIndex}`} className={PERSONS_TABLE_ROW_CLASS}>
                          <TableCell className={PERSONS_TABLE_CELL_CLASS}>
                            <Link
                              href={{ pathname: "/persons/details", query: { name: person.name } }}
                              className="flex items-center gap-2 text-black hover:underline"
                            >
                              <RedMarker />
                              <span className="w-full break-words">{person.name}</span>
                            </Link>
                          </TableCell>
                          <TableCell className={PERSONS_TABLE_CELL_CLASS}>{person.type || "—"}</TableCell>
                          <TableCell className={PERSONS_TABLE_CELL_CLASS}>{person.language || "—"}</TableCell>
                          <TableCell className={`${PERSONS_TABLE_CELL_CLASS} text-center`}>{person.originalTitles}</TableCell>
                          <TableCell className={`${PERSONS_TABLE_CELL_CLASS} text-center`}>{person.translatedTitles}</TableCell>
                          <TableCell className={`${PERSONS_TABLE_CELL_CLASS} text-center`}>{person.translationLanguages}</TableCell>
                          <TableCell className={`${PERSONS_TABLE_CELL_CLASS} text-center`}>{person.awards}</TableCell>
                          <TableCell className={`${PERSONS_TABLE_CELL_CLASS} text-center`}>{person.regularReissues}</TableCell>
                          <TableCell className={`${PERSONS_TABLE_CELL_CLASS} text-center`}>{person.pocketReissues}</TableCell>
                          <TableCell className={`${PERSONS_TABLE_CELL_CLASS} text-center`}>{person.publicationCountries}</TableCell>
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

          <div className="flex flex-col items-center gap-3 md:pb-6 [@media(max-height:950px)]:gap-1.5">
            <p className="text-center text-[13px] font-bold leading-none text-black">
              {t("pagination.results", {
                start: String((result.page - 1) * PERSONS_PAGE_SIZE + 1),
                end: String(Math.min(result.page * PERSONS_PAGE_SIZE, result.total)),
                total: String(result.total),
              })}
            </p>
            <Pagination>
              <PaginationContent className="flex-wrap justify-center">
                <PaginationItem>
                  <PaginationPrevious
                    href={buildPageHref(result.page - 1, searchTerm)}
                    text={t("pagination.previous")}
                    className={result.page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {paginationItems.map((item) =>
                  typeof item === "number" ? (
                    <PaginationItem key={item}>
                      <PaginationLink href={buildPageHref(item, searchTerm)} isActive={item === result.page}>
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
                    href={buildPageHref(result.page + 1, searchTerm)}
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
          className="[@media(max-height:950px)]:relative [@media(max-height:950px)]:bottom-auto [@media(max-height:950px)]:left-auto [@media(max-height:950px)]:right-auto [@media(max-height:950px)]:mt-6"
        />
      </div>
    </main>
  );
}
