import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookTableOfContentsPage from "../../book-table-of-contents-page";
import { getBookDetailById, getDefaultBookDetail } from "@/lib/data/books";
import { buildBookPageMetadata } from "@/lib/site-metadata";

interface BookTableOfContentsRouteProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    id?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: BookTableOfContentsRouteProps): Promise<Metadata> {
  const [{ locale }, { id }] = await Promise.all([params, searchParams]);
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();
  return buildBookPageMetadata(locale, "tableOfContents", "/books/details/table-of-contents", book?.title);
}

export default async function BookTableOfContentsRoute({ searchParams }: BookTableOfContentsRouteProps) {
  const { id } = await searchParams;
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();

  if (!book) {
    notFound();
  }

  return <BookTableOfContentsPage book={book} />;
}
