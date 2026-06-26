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

interface BookRecord {
  title: string;
  author: string;
  publisher: string;
  language: string;
  year: string;
  publication: string;
  issue: string;
  edition: string;
}

const BOOKS_GRID_TEMPLATE = "3.2fr 1.65fr 1.25fr 1.02fr 0.62fr 0.64fr 0.62fr 0.62fr";

const sampleBooks: BookRecord[] = [
  { title: "אין אפשר לאהוב", author: "Naïm Araidi", publisher: "Eked", language: "Hébreu", year: "1972", publication: "O", issue: "E01", edition: "R" },
  { title: "חתלה וכחול", author: "Naïm Araidi", publisher: "Eked", language: "Hébreu", year: "1975", publication: "O", issue: "E01", edition: "R" },
  { title: "חזרתי אל הכפר", author: "Naïm Araidi", publisher: "Am Oved", language: "Hébreu", year: "1986", publication: "O", issue: "E01", edition: "R" },
  { title: "אולי זה אהבה", author: "Naïm Araidi", publisher: "Ma’ariv", language: "Hébreu", year: "1990", publication: "O", issue: "E01", edition: "R" },
  { title: "בחמישה מימדים", author: "Naïm Araidi", publisher: "Sifriat Poalim", language: "Hébreu", year: "1991", publication: "O", issue: "E01", edition: "R" },
  { title: "תבילה קטלנית", author: "Naïm Araidi", publisher: "Bitan", language: "Hébreu", year: "1992", publication: "O", issue: "E01", edition: "R" },
  { title: "יעקובי ולידנטל", author: "Hanokh Levin", publisher: "University Publishing Projects", language: "Hébreu", year: "1974", publication: "O", issue: "E01", edition: "R" },
  { title: "פרעות", author: "Israel Hameiri", publisher: "Hakibbutz Hameuchad", language: "Hébreu", year: "1972", publication: "O", issue: "E01", edition: "R" },
  { title: "הרבעי", author: "Israel Hameiri", publisher: "Hakibbutz Hameuchad", language: "Hébreu", year: "1981", publication: "O", issue: "E01", edition: "R" },
  { title: "אש בקוצים", author: "Israel Hameiri", publisher: "Am Oved", language: "Hébreu", year: "1983", publication: "O", issue: "E01", edition: "R" },
  { title: "הלבנים", author: "Israel Hameiri", publisher: "Am Oved", language: "Hébreu", year: "1985", publication: "O", issue: "E01", edition: "R" },
  { title: "מיכאל שלי", author: "Amos Oz", publisher: "Am Oved", language: "Hébreu", year: "1968", publication: "O", issue: "E03", edition: "R" },
  { title: "קופסה שחורה", author: "Amos Oz", publisher: "Keter", language: "Hébreu", year: "1987", publication: "O", issue: "E01", edition: "R" },
  { title: "אותו הים", author: "Amos Oz", publisher: "Keter", language: "Hébreu", year: "1999", publication: "O", issue: "E01", edition: "R" },
  { title: "סיפור על אהבה וחושך", author: "Amos Oz", publisher: "Keter", language: "Hébreu", year: "2002", publication: "O", issue: "E01", edition: "R" },
  { title: "פתאום בעומק היער", author: "Amos Oz", publisher: "Keter", language: "Hébreu", year: "2005", publication: "O", issue: "E01", edition: "R" },
  { title: "חיוך הגדי", author: "David Grossman", publisher: "Hakibbutz Hameuchad", language: "Hébreu", year: "1983", publication: "O", issue: "E01", edition: "R" },
  { title: "עיין ערך: אהבה", author: "David Grossman", publisher: "Hakibbutz Hameuchad", language: "Hébreu", year: "1986", publication: "O", issue: "E01", edition: "R" },
  { title: "ספר הדקדוק הפנימי", author: "David Grossman", publisher: "Hakibbutz Hameuchad", language: "Hébreu", year: "1991", publication: "O", issue: "E01", edition: "R" },
  { title: "מישהו לרוץ אתו", author: "David Grossman", publisher: "Hakibbutz Hameuchad", language: "Hébreu", year: "2000", publication: "O", issue: "E01", edition: "R" },
  { title: "אשה בורחת מבשורה", author: "David Grossman", publisher: "Hakibbutz Hameuchad", language: "Hébreu", year: "2008", publication: "O", issue: "E01", edition: "R" },
  { title: "געגועי לקיסינג'ר", author: "Etgar Keret", publisher: "Zmora-Bitan", language: "Hébreu", year: "1994", publication: "O", issue: "E01", edition: "R" },
  { title: "הקייטנה של קנלר", author: "Etgar Keret", publisher: "Am Oved", language: "Hébreu", year: "1998", publication: "O", issue: "E01", edition: "R" },
  { title: "פתאום דפיקה בדלת", author: "Etgar Keret", publisher: "Kinneret Zmora-Bitan", language: "Hébreu", year: "2010", publication: "O", issue: "E01", edition: "R" },
  { title: "והוא האור", author: "Lea Goldberg", publisher: "Sifriat Poalim", language: "Hébreu", year: "1946", publication: "O", issue: "E01", edition: "R" },
  { title: "דירה להשכיר", author: "Lea Goldberg", publisher: "Sifriat Poalim", language: "Hébreu", year: "1948", publication: "O", issue: "E05", edition: "P" },
  { title: "פגישה עם משורר", author: "Lea Goldberg", publisher: "Hakibbutz Hameuchad", language: "Hébreu", year: "1952", publication: "O", issue: "E01", edition: "R" },
  { title: "אניהו", author: "Lea Goldberg", publisher: "Sifriat Poalim", language: "Hébreu", year: "1971", publication: "O", issue: "E01", edition: "R" },
  { title: "חבלים", author: "Haim Gouri", publisher: "Sifriat Poalim", language: "Hébreu", year: "1971", publication: "O", issue: "E01", edition: "R" },
  { title: "מול תא הזכוכית", author: "Haim Gouri", publisher: "Hakibbutz Hameuchad", language: "Hébreu", year: "1968", publication: "O", issue: "E01", edition: "R" },
  { title: "עיבל", author: "Haim Gouri", publisher: "Hakibbutz Hameuchad", language: "Hébreu", year: "1982", publication: "O", issue: "E01", edition: "R" },
  { title: "תאום כוונות", author: "Yehuda Amichai", publisher: "Schocken", language: "Hébreu", year: "1958", publication: "O", issue: "E01", edition: "R" },
  { title: "עכשיו ברעש", author: "Yehuda Amichai", publisher: "Schocken", language: "Hébreu", year: "1968", publication: "O", issue: "E01", edition: "R" },
  { title: "פתוח סגור פתוח", author: "Yehuda Amichai", publisher: "Schocken", language: "Hébreu", year: "1998", publication: "O", issue: "E01", edition: "R" },
  { title: "לא מעכשיו לא מכאן", author: "Yehoshua Kenaz", publisher: "Am Oved", language: "Hébreu", year: "1968", publication: "O", issue: "E01", edition: "R" },
  { title: "התגנבות יחידים", author: "Yehoshua Kenaz", publisher: "Am Oved", language: "Hébreu", year: "1986", publication: "O", issue: "E01", edition: "R" },
  { title: "מחזיר אהבות קודמות", author: "Yehoshua Kenaz", publisher: "Keter", language: "Hébreu", year: "1997", publication: "O", issue: "E01", edition: "R" },
  { title: "רומן רוסי", author: "Meir Shalev", publisher: "Am Oved", language: "Hébreu", year: "1988", publication: "O", issue: "E01", edition: "R" },
  { title: "עשו", author: "Meir Shalev", publisher: "Am Oved", language: "Hébreu", year: "1991", publication: "O", issue: "E01", edition: "R" },
  { title: "כימים אחדים", author: "Meir Shalev", publisher: "Am Oved", language: "Hébreu", year: "1994", publication: "O", issue: "E01", edition: "R" },
  { title: "יונה ונער", author: "Meir Shalev", publisher: "Am Oved", language: "Hébreu", year: "2006", publication: "O", issue: "E01", edition: "R" },
  { title: "תרנגול כפרות", author: "Eli Amir", publisher: "Am Oved", language: "Hébreu", year: "1983", publication: "O", issue: "E01", edition: "R" },
  { title: "מפריח היונים", author: "Eli Amir", publisher: "Am Oved", language: "Hébreu", year: "1992", publication: "O", issue: "E01", edition: "R" },
  { title: "יסמין", author: "Eli Amir", publisher: "Am Oved", language: "Hébreu", year: "2005", publication: "O", issue: "E01", edition: "R" },
  { title: "באדנהיים עיר נופש", author: "Aharon Appelfeld", publisher: "Keter", language: "Hébreu", year: "1979", publication: "O", issue: "E01", edition: "R" },
  { title: "עד שיעלה עמוד השחר", author: "Aharon Appelfeld", publisher: "Keter", language: "Hébreu", year: "1995", publication: "O", issue: "E01", edition: "R" },
  { title: "חסד נעורים", author: "Aharon Appelfeld", publisher: "Kinneret", language: "Hébreu", year: "2011", publication: "O", issue: "E01", edition: "R" },
];

const BOOKS_PER_PAGE = 13;

function MobileBookCard({
  book,
  t,
}: {
  book: BookRecord;
  t: ReturnType<typeof useTranslations<"Books">>;
}) {
  return (
    <article className="border-b border-[#b1bac0] px-1 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-right text-[16px] font-bold leading-tight text-black" dir="rtl">
          {book.title}
        </p>
        <p className="mt-1 text-[13px] leading-tight text-[#21323b]">{book.author}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] leading-[1.35] text-black">
        <div>
          <p className="font-bold uppercase text-[#4a5a63]">{t("columns.publishers")}</p>
          <p className="mt-1 break-words">{book.publisher}</p>
        </div>
        <div>
          <p className="font-bold uppercase text-[#4a5a63]">{t("columns.year")}</p>
          <p className="mt-1">{book.year}</p>
        </div>
      </div>

      <Link
        href="/books/details"
        className="mt-3 inline-block text-[13px] font-bold text-[#0f4c81] underline underline-offset-2"
      >
        Voir plus
      </Link>
    </article>
  );
}

export default function BooksListPage() {
  const t = useTranslations("Books");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sampleBooks.length / BOOKS_PER_PAGE);
  const visibleBooks = useMemo(() => {
    const start = (currentPage - 1) * BOOKS_PER_PAGE;
    return sampleBooks.slice(start, start + BOOKS_PER_PAGE);
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
    { key: "help", icon: "/icons/icons-nav/help.png", href: "/books" as const, label: t("footer.help") },
    { key: "move", icon: "/icons/icons-nav/next.png", href: "/books" as const, label: t("footer.move") },
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
              {visibleBooks.map((book) => (
                <MobileBookCard key={`${book.title}-${book.year}`} book={book} t={t} />
              ))}
            </div>

            <div className="hidden flex-col md:flex">
              <div
                className="grid min-w-[1160px] border-b border-[#9aa8b0] bg-[#fff68f] text-[11px] uppercase leading-none text-black"
                style={{ gridTemplateColumns: BOOKS_GRID_TEMPLATE }}
              >
                <div className="rounded-tl-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.titles")}</div>
                <div className="rounded-t-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.authors")}</div>
                <div className="rounded-t-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.publishers")}</div>
                <div className="rounded-t-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.languages")}</div>
                <div className="rounded-t-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.year")}</div>
                <div className="rounded-t-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.publication")}</div>
                <div className="rounded-t-[10px] border-r border-[#9aa8b0] px-3 py-[9px] text-center">{t("columns.issue")}</div>
                <div className="rounded-tr-[10px] px-3 py-[9px] text-center">{t("columns.edition")}</div>
              </div>

              <div className="overflow-auto">
                {visibleBooks.map((book, rowIndex) => (
                  <div
                    key={`${book.title}-${currentPage}-${rowIndex}`}
                    className="grid min-w-[1160px] border-b border-[#b1bac0] text-[14px] leading-none text-black last:border-b-0"
                    style={{ gridTemplateColumns: BOOKS_GRID_TEMPLATE }}
                  >
                    <div className="border-r border-[#b1bac0] px-3 py-[15px]">
                      <Link href="/books/details" className="flex items-center text-black hover:underline">
                        <span className="w-full text-right text-[15px] font-bold" dir="rtl">
                          {book.title}
                        </span>
                      </Link>
                    </div>
                    <div className="border-r border-[#b1bac0] px-3 py-[15px]">{book.author}</div>
                    <div className="border-r border-[#b1bac0] px-3 py-[15px]">{book.publisher}</div>
                    <div className="border-r border-[#b1bac0] px-3 py-[15px]">{book.language}</div>
                    <div className="border-r border-[#b1bac0] px-3 py-[15px] text-center">{book.year}</div>
                    <div className="border-r border-[#b1bac0] px-3 py-[15px] text-center">{book.publication}</div>
                    <div className="border-r border-[#b1bac0] px-3 py-[15px] text-center">{book.issue}</div>
                    <div className="px-3 py-[15px] text-center">{book.edition}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="flex flex-col items-center gap-3">
            <p className="text-center text-[13px] font-bold leading-none text-black">
              {t("pagination.results", {
                start: String((currentPage - 1) * BOOKS_PER_PAGE + 1),
                end: String(Math.min(currentPage * BOOKS_PER_PAGE, sampleBooks.length)),
                total: String(sampleBooks.length),
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
          desktopMode="compact"
        />
      </div>
    </main>
  );
}
