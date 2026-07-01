"use client";

import { useTranslations } from "next-intl";
import BookDetailSecondaryLayout from "./book-detail-secondary-layout";
import type { BookDetail } from "@/lib/data/books";

interface BookBackCoverPageProps {
  book: BookDetail;
}

interface BookPageData {
  backCoverText: string;
}

export default function BookBackCoverPage({ book }: BookBackCoverPageProps) {
  const t = useTranslations("BookDetailsPage");
  const pageData = t.raw("pageData") as BookPageData;

  return (
    <BookDetailSecondaryLayout book={book} pageName={t("tabs.backCover")} pagePath="/books/details/back-cover">
      <section className="flex min-h-0 flex-col border border-[#7ea8b8] bg-[#a6d9eb]">
        <div className="border-b border-[#7ea8b8] bg-[#fff6bf] px-2 py-[2px] text-[10px] uppercase leading-[1.05] text-black md:text-[11px]">
          {t("content.backCover")}
        </div>
        <div className="px-3 py-[6px] text-[15px] leading-[1.48] text-black md:px-[10px] md:py-[6px] md:text-[18px] md:leading-[1.36]">
          {book.backCover || pageData.backCoverText || "—"}
        </div>
      </section>
    </BookDetailSecondaryLayout>
  );
}
