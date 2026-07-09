import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
import { ListNameSearch } from "@/components/stavnet/list-name-search";
import { Link } from "@/i18n/routing";
import { BOOKS_PAGE_SIZE, getBooksPage, getBooksPageByAdvancedSearch, getBooksPageByTitle, type BookSearchFilters } from "@/lib/data/books";
import { resolveBooksListSelection } from "@/lib/books-search";
import { buildStaticPageMetadata } from "@/lib/site-metadata";

const BOOKS_COLUMN_WIDTHS = ["30.48%", "15.24%", "11.60%", "9.44%", "9.44%", "5.90%", "6.10%", "5.90%", "5.90%"] as const;

interface BooksPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    title?: string;
    personLastName?: string;
    personFirstName?: string;
    organization?: string;
    theme?: string;
    publicationLanguage?: string;
    year?: string;
  generalSearch?: string;
  }>;
}

export async function generateMetadata({ params }: BooksPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "books", "/books");
}

function RedMarker() {
  return <span className="mr-2 inline-block h-[11px] w-[11px] rounded-full border-[2px] border-[#ff1d1d]" />;
}

function buildPageHref(page: number, searchTerm: string, filters: Partial<BookSearchFilters>): string {
  const params = new URLSearchParams();
  params.set("page", String(page <= 1 ? 1 : page));

  if (searchTerm.trim()) {
    params.set("q", searchTerm);
  }

  for (const [key, value] of Object.entries(filters)) {
    if (value?.trim()) {
      params.set(key, value.trim());
    }
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

function MobileBookCard({
  book,
  labels,
}: {
  book: Awaited<ReturnType<typeof getBooksPage>>["items"][number];
  labels: {
    publisher: string;
    writingLanguage: string;
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
          <p className="font-bold uppercase text-[#4a5a63]">{labels.writingLanguage}</p>
          <p className="mt-1 break-words">{book.writingLanguage || "—"}</p>
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

export default async function BooksListPage({ params, searchParams }: BooksPageProps) {
  const [{ locale }, { page, q, title, personLastName, personFirstName, organization, theme, publicationLanguage, year, generalSearch }, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("Books"),
  ]);
  const selection = resolveBooksListSelection({ page, q, title, personLastName, personFirstName, organization, theme, publicationLanguage, year, generalSearch });
  const { searchTerm, advancedFilters } = selection;
  const result =
    selection.mode === "advanced"
      ? await getBooksPageByAdvancedSearch(selection.pageNumber, selection.advancedFilters)
      : selection.mode === "title"
        ? await getBooksPageByTitle(selection.pageNumber, selection.searchTerm)
        : await getBooksPage(selection.pageNumber);
  const hasAppliedFilters = selection.mode !== "basic";

  if (hasAppliedFilters && result.total === 1 && result.items[0]) {
    redirect({
      href: {
        pathname: "/books/details",
        query: {
          id: result.items[0].id,
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
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/books" as const, label: t("footer.help") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/books" as const, label: t("footer.move") },
  ];

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
          pageName={t("header.cardTitle")}
          title={t("header.title")}
          subtitle={t("header.subtitle")}
        />

        <section className="mt-6 min-w-0 flex flex-col gap-4 md:absolute md:left-1/2 md:top-[178px] md:bottom-[132px] md:w-[min(1320px,96vw)] md:-translate-x-1/2">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
            <ListNameSearch
              key={selection.searchTerm}
              label={t("search.label")}
              placeholder={t("search.placeholder")}
              initialValue={selection.searchTerm}
              resetLabel={t("search.reset")}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end sm:gap-6">
              <div className="flex items-center gap-3 text-[18px] leading-none text-black">
                <span>{t("stats.cardsFound")}</span>
                <span>:</span>
                <span className="font-bold text-[#ff1d1d]">{result.total}</span>
              </div>
              <div className="flex items-center gap-3 text-[18px] leading-none text-black">
                <span>{t("stats.databaseContains")}</span>
                <span>:</span>
                <span className="font-bold text-[#ff1d1d]">{result.databaseTotal}</span>
              </div>
            </div>
          </div>

          <section className="overflow-hidden rounded-[8px] border border-[#9aa8b0] bg-[#d8dde2] shadow-[4px_4px_8px_rgba(0,0,0,0.12)]">
            <div className="space-y-3 p-3 md:hidden">
              {result.items.length > 0 ? (
                result.items.map((book) => (
                  <MobileBookCard
                    key={book.id}
                    book={book}
                    labels={{
                      publisher: t("columns.publishers"),
                      writingLanguage: t("columns.writingLanguage"),
                      year: t("columns.year"),
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
                <div className="overflow-auto">
                  <table className="min-w-[1280px] table-fixed border-collapse text-black">
                    <colgroup>
                      {BOOKS_COLUMN_WIDTHS.map((width, index) => (
                        <col key={`${width}-${index}`} style={{ width }} />
                      ))}
                    </colgroup>
                    <thead>
                      <tr className="border-b border-[#9aa8b0] bg-[#fff68f] text-[11px] uppercase leading-none">
                        <th className="rounded-tl-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center font-normal">{t("columns.titles")}</th>
                        <th className="border-r border-[#9aa8b0] px-3 py-[9px] text-center font-normal">{t("columns.authors")}</th>
                        <th className="border-r border-[#9aa8b0] px-3 py-[9px] text-center font-normal">{t("columns.publishers")}</th>
                        <th className="border-r border-[#9aa8b0] px-3 py-[9px] text-center font-normal">{t("columns.languages")}</th>
                        <th className="border-r border-[#9aa8b0] px-3 py-[9px] text-center font-normal">{t("columns.writingLanguage")}</th>
                        <th className="border-r border-[#9aa8b0] px-3 py-[9px] text-center font-normal">{t("columns.year")}</th>
                        <th className="border-r border-[#9aa8b0] px-3 py-[9px] text-center font-normal">{t("columns.publication")}</th>
                        <th className="border-r border-[#9aa8b0] px-3 py-[9px] text-center font-normal">{t("columns.issue")}</th>
                        <th className="rounded-tr-[10px] px-3 py-[9px] text-center font-normal">{t("columns.edition")}</th>
                      </tr>
                    </thead>
                    <tbody className="text-[14px] leading-none">
                      {result.items.map((book, rowIndex) => (
                        <tr key={`${book.id}-${result.page}-${rowIndex}`} className="border-b border-[#b1bac0] last:border-b-0">
                          <td className="border-r border-[#b1bac0] px-3 py-[15px] align-middle">
                            <Link
                              href={{ pathname: "/books/details", query: { id: book.id } }}
                              className="flex items-center text-black hover:underline"
                            >
                              <RedMarker />
                              <span className="w-full break-words">{book.title}</span>
                            </Link>
                          </td>
                          <td className="border-r border-[#b1bac0] px-3 py-[15px] align-middle">{book.author || "—"}</td>
                          <td className="border-r border-[#b1bac0] px-3 py-[15px] align-middle">{book.publisher || "—"}</td>
                          <td className="border-r border-[#b1bac0] px-3 py-[15px] align-middle">{book.language || "—"}</td>
                          <td className="border-r border-[#b1bac0] px-3 py-[15px] align-middle">{book.writingLanguage || "—"}</td>
                          <td className="border-r border-[#b1bac0] px-3 py-[15px] text-center align-middle">{book.year || "—"}</td>
                          <td className="border-r border-[#b1bac0] px-3 py-[15px] text-center align-middle">{book.publication || "—"}</td>
                          <td className="border-r border-[#b1bac0] px-3 py-[15px] text-center align-middle">{book.issue || "—"}</td>
                          <td className="px-3 py-[15px] text-center align-middle">{book.edition || "—"}</td>
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

          <div className="flex flex-col items-center gap-3 md:pb-6">
            <p className="text-center text-[13px] font-bold leading-none text-black">
              {t("pagination.results", {
                start: String((result.page - 1) * BOOKS_PAGE_SIZE + 1),
                end: String(Math.min(result.page * BOOKS_PAGE_SIZE, result.total)),
                total: String(result.total),
              })}
            </p>
            <Pagination>
              <PaginationContent className="flex-wrap justify-center">
                <PaginationItem>
                  <PaginationPrevious
                    href={buildPageHref(result.page - 1, searchTerm, advancedFilters)}
                    text={t("pagination.previous")}
                    className={result.page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {paginationItems.map((item) =>
                  typeof item === "number" ? (
                    <PaginationItem key={item}>
                      <PaginationLink href={buildPageHref(item, searchTerm, advancedFilters)} isActive={item === result.page}>
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
                    href={buildPageHref(result.page + 1, searchTerm, advancedFilters)}
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
