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
      <section className="flex min-h-0 flex-col border border-[#7ea8b8] bg-[#a6d9eb] md:h-full md:flex-1 md:overflow-hidden">
        <div className="border-b border-[#7ea8b8] bg-[#fff6bf] px-2 py-[2px] text-[10px] uppercase leading-[1.05] text-black md:text-[11px]">
          {t("content.backCover")}
        </div>
        <div className="flex min-h-0 flex-1 items-center px-3 py-[12px] text-[15px] leading-[1.48] text-black md:overflow-y-auto md:px-8 md:py-5 md:text-[17px] md:leading-[1.42]">
          <p className="mx-auto w-full max-w-[1040px]">{book.backCover || pageData.backCoverText || "—"}</p>
        </div>
      </section>
    </BookDetailSecondaryLayout>
  );
}
