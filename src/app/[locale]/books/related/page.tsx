import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/routing";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { StavnetFooter } from "@/components/stavnet/footer";
import { StavnetHeader } from "@/components/stavnet/header";
import { Link } from "@/i18n/routing";
import { BOOK_RELATED_FACET_LABEL_KEYS, isBookRelatedFacet, type BookRelatedFacet } from "@/lib/book-related";
import { BOOKS_PAGE_SIZE, getBooksPageByFacet } from "@/lib/data/books";
import { buildRelatedBooksPageMetadata } from "@/lib/site-metadata";
import { isPageWithinLimit, MAX_BOOKS_PAGE } from "@/lib/pagination";
import { logInfo } from "@/lib/server-log";

const BOOKS_COLUMN_WIDTHS = ["34.71%", "17.90%", "13.56%", "11.06%", "6.72%", "6.94%", "6.72%", "6.72%"] as const;

interface RelatedBooksPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    facet?: string;
    value?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: RelatedBooksPageProps): Promise<Metadata> {
  const [{ locale }, { value }] = await Promise.all([params, searchParams]);
  logInfo("DEBUG_LOG_INFINITE_FETCH", {
    route: "/books/related",
    phase: "metadata-start",
    locale,
    value: value?.trim() ?? null,
  });
  return buildRelatedBooksPageMetadata(locale, "/books/related", value?.trim());
}

function RedMarker() {
  return <span className="mr-2 inline-block h-[11px] w-[11px] rounded-full border-[2px] border-[#ff1d1d]" />;
}

function buildPageHref(page: number, facet: BookRelatedFacet, value: string): string {
  const params = new URLSearchParams();
  params.set("page", String(page <= 1 ? 1 : page));
  params.set("facet", facet);
  params.set("value", value);
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

function MobileBookCard({
  book,
  labels,
}: {
  book: Awaited<ReturnType<typeof getBooksPageByFacet>>["items"][number];
  labels: {
    publisher: string;
    year: string;
    viewMore: string;
  };
}) {
  return (
    <article className="border-b border-[#b1bac0] px-1 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[16px] font-bold leading-tight text-black">{book.title}</p>
        <p className="mt-1 text-[13px] leading-tight text-[#21323b]">{book.author || "—"}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] leading-[1.35] text-black">
        <div>
          <p className="font-bold uppercase text-[#4a5a63]">{labels.publisher}</p>
          <p className="mt-1 break-words">{book.publisher || "—"}</p>
        </div>
        <div>
          <p className="font-bold uppercase text-[#4a5a63]">{labels.year}</p>
          <p className="mt-1">{book.year || "—"}</p>
        </div>
      </div>

      <Link
        href={{ pathname: "/books/details", query: { id: book.id } }}
        className="mt-3 inline-block text-[13px] font-bold text-[#0f4c81] underline underline-offset-2"
      >
        {labels.viewMore}
      </Link>
    </article>
  );
}

export default async function RelatedBooksPage({ params, searchParams }: RelatedBooksPageProps) {
  const [{ locale }, { facet: rawFacet, value: rawValue, page }, tBooks, tRelated] = await Promise.all([
    params,
    searchParams,
    getTranslations("Books"),
    getTranslations("BooksRelated"),
  ]);
  logInfo("DEBUG_LOG_INFINITE_FETCH", {
    route: "/books/related",
    phase: "page-start",
    locale,
    facet: rawFacet ?? null,
    value: rawValue ?? null,
    page: page ?? null,
  });
  const currentPage = Number.parseInt(page ?? "1", 10);
  const pageNumber = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
  const facet = rawFacet?.trim() ?? "";
  const value = rawValue?.trim() ?? "";

  if (!facet || !value || !isBookRelatedFacet(facet)) {
    logInfo("DEBUG_LOG_INFINITE_FETCH", {
      route: "/books/related",
      phase: "page-not-found",
      locale,
      facet: facet || null,
      value: value || null,
    });
    notFound();
  }

  if (!isPageWithinLimit(pageNumber, MAX_BOOKS_PAGE)) {
    redirect({
      href: {
        pathname: "/books/related",
        query: {
          facet,
          value,
          page: "1",
        },
      },
      locale,
    });
  }

  const result = await getBooksPageByFacet(pageNumber, facet, value);
  const singleBook = result.total === 1 ? result.items[0] : null;

  if (singleBook) {
    logInfo("DEBUG_LOG_INFINITE_FETCH", {
      route: "/books/related",
      phase: "page-redirect-single-result",
      locale,
      facet,
      value,
      resolvedBookId: singleBook.id,
    });
    redirect({
      href: {
        pathname: "/books/details",
        query: {
          id: singleBook.id,
        },
      },
      locale,
    });
  }

  const paginationItems = getPaginationItems(result.page, result.totalPages);
  logInfo("DEBUG_LOG_INFINITE_FETCH", {
    route: "/books/related",
    phase: "page-resolved",
    locale,
    facet,
    value,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  });
  const footerItems = [
    { key: "back", icon: "/icons/icons-nav/back.png", href: "/books" as const, label: tBooks("footer.back") },
    { key: "menu", icon: "/icons/icons-nav/menu.png", href: "/menu" as const, label: tBooks("footer.menu") },
    { key: "close", icon: "/icons/icons-nav/close.png", href: "/" as const, label: tBooks("footer.close") },
    { key: "search", icon: "/icons/icons-nav/rechercher.png", href: "/search" as const, label: tBooks("footer.search") },
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/books" as const, label: tBooks("footer.help") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/books" as const, label: tBooks("footer.move") },
  ];
  const facetLabel = tRelated(`facets.${BOOK_RELATED_FACET_LABEL_KEYS[facet]}`);

  return (
    <main dir="ltr" className="relative min-h-[100svh] overflow-x-hidden bg-[#e7f2f7] font-[Arial,Helvetica,sans-serif] text-black md:h-screen md:overflow-hidden">
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
          pageName={tRelated("header.cardTitle")}
          title={tRelated("header.title")}
          subtitle={tRelated("header.subtitle")}
        />

        <section className="mt-6 min-w-0 flex min-h-0 flex-col gap-4 md:absolute md:left-1/2 md:top-[178px] md:bottom-[190px] md:w-[min(1320px,96vw)] md:-translate-x-1/2 [@media(max-height:950px)]:top-[160px] [@media(max-height:950px)]:bottom-[118px] [@media(max-height:950px)]:gap-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6 [@media(max-height:950px)]:gap-2">
            <div className="rounded-[8px] border border-[#7aa8b7] bg-[#a7dcee] px-4 py-3 shadow-[3px_3px_6px_rgba(0,0,0,0.12)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#07384a]">{tRelated("activeCriterion")}</p>
              <p className="mt-2 text-[18px] font-bold leading-tight text-black">
                {facetLabel} : <span className="text-[#0f4c81]">{value}</span>
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end sm:gap-6">
              <div className="flex items-center gap-3 text-[18px] leading-none text-black">
                <span>{tRelated("stats.relatedBooksFound")}</span>
                <span>:</span>
                <span className="font-bold text-[#ff1d1d]">{result.total}</span>
              </div>
              <div className="flex items-center gap-3 text-[18px] leading-none text-black">
                <span>{tBooks("stats.databaseContains")}</span>
                <span>:</span>
                <span className="font-bold text-[#ff1d1d]">{result.databaseTotal}</span>
              </div>
            </div>
          </div>

          <section className="overflow-hidden rounded-[8px] border border-[#9aa8b0] bg-[#d8dde2] shadow-[4px_4px_8px_rgba(0,0,0,0.12)] md:flex md:min-h-0 md:flex-1 md:flex-col">
            <div className="space-y-3 p-3 md:hidden">
              {result.items.length > 0 ? (
                result.items.map((book) => (
                  <MobileBookCard
                    key={book.id}
                    book={book}
                    labels={{
                      publisher: tBooks("columns.publishers"),
                      year: tBooks("columns.year"),
                      viewMore: tBooks("footer.move"),
                    }}
                  />
                ))
              ) : (
                <p className="px-2 py-5 text-center text-[14px] font-bold text-black">
                  {tRelated("empty", { facet: facetLabel.toLowerCase(), value })}
                </p>
              )}
            </div>

            <div className="hidden md:min-h-0 md:flex-1 md:flex-col">
              {result.items.length > 0 ? (
                <div className="min-h-0 flex-1 overflow-auto">
                  <table className="min-w-[1160px] table-fixed border-collapse text-black">
                    <colgroup>
                      {BOOKS_COLUMN_WIDTHS.map((width, index) => (
                        <col key={`${width}-${index}`} style={{ width }} />
                      ))}
                    </colgroup>
                    <thead>
                      <tr className="border-b border-[#9aa8b0] bg-[#fff68f] text-[11px] uppercase leading-none [@media(max-height:950px)]:text-[10px]">
                        <th className="rounded-tl-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center font-normal [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-1.5">{tBooks("columns.titles")}</th>
                        <th className="border-r border-[#9aa8b0] px-3 py-[9px] text-center font-normal [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-1.5">{tBooks("columns.authors")}</th>
                        <th className="border-r border-[#9aa8b0] px-3 py-[9px] text-center font-normal [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-1.5">{tBooks("columns.publishers")}</th>
                        <th className="border-r border-[#9aa8b0] px-3 py-[9px] text-center font-normal [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-1.5">{tBooks("columns.languages")}</th>
                        <th className="border-r border-[#9aa8b0] px-3 py-[9px] text-center font-normal [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-1.5">{tBooks("columns.year")}</th>
                        <th className="border-r border-[#9aa8b0] px-3 py-[9px] text-center font-normal [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-1.5">{tBooks("columns.publication")}</th>
                        <th className="border-r border-[#9aa8b0] px-3 py-[9px] text-center font-normal [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-1.5">{tBooks("columns.issue")}</th>
                        <th className="rounded-tr-[10px] px-3 py-[9px] text-center font-normal [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-1.5">{tBooks("columns.edition")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-[14px] leading-none [@media(max-height:950px)]:text-[12px]">
                      {result.items.map((book, rowIndex) => (
                        <tr key={`${book.id}-${result.page}-${rowIndex}`} className="border-b border-[#b1bac0] last:border-b-0">
                          <td className="border-r border-[#b1bac0] px-3 py-[15px] align-middle [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-2">
                            <Link
                              href={{ pathname: "/books/details", query: { id: book.id } }}
                              className="flex items-center text-black hover:underline"
                            >
                              <RedMarker />
                              <span className="w-full break-words">{book.title}</span>
                            </Link>
                          </td>
                          <td className="border-r border-[#b1bac0] px-3 py-[15px] align-middle [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-2">{book.author || "—"}</td>
                          <td className="border-r border-[#b1bac0] px-3 py-[15px] align-middle [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-2">{book.publisher || "—"}</td>
                          <td className="border-r border-[#b1bac0] px-3 py-[15px] align-middle [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-2">{book.language || "—"}</td>
                          <td className="border-r border-[#b1bac0] px-3 py-[15px] text-center align-middle [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-2">{book.year || "—"}</td>
                          <td className="border-r border-[#b1bac0] px-3 py-[15px] text-center align-middle [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-2">{book.publication || "—"}</td>
                          <td className="border-r border-[#b1bac0] px-3 py-[15px] text-center align-middle [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-2">{book.issue || "—"}</td>
                          <td className="px-3 py-[15px] text-center align-middle [@media(max-height:950px)]:px-2 [@media(max-height:950px)]:py-2">{book.edition || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-10 text-center text-[14px] font-bold text-black">
                  {tRelated("empty", { facet: facetLabel.toLowerCase(), value })}
                </div>
              )}
            </div>
          </section>

          <div className="flex flex-col items-center gap-3 md:pb-6 [@media(max-height:950px)]:gap-1.5">
            <p className="text-center text-[13px] font-bold leading-none text-black">
              {tBooks("pagination.results", {
                start: String((result.page - 1) * BOOKS_PAGE_SIZE + 1),
                end: String(Math.min(result.page * BOOKS_PAGE_SIZE, result.total)),
                total: String(result.total),
              })}
            </p>
            <Pagination>
              <PaginationContent className="flex-wrap justify-center">
                <PaginationItem>
                  <PaginationPrevious
                    href={buildPageHref(result.page - 1, facet, value)}
                    text={tBooks("pagination.previous")}
                    className={result.page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {paginationItems.map((item) =>
                  typeof item === "number" ? (
                    <PaginationItem key={item}>
                      <PaginationLink href={buildPageHref(item, facet, value)} isActive={item === result.page}>
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
                    href={buildPageHref(result.page + 1, facet, value)}
                    text={tBooks("pagination.next")}
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
