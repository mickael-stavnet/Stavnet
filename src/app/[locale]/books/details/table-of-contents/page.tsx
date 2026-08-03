import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookTableOfContentsPage from "../../book-table-of-contents-page";
import { getBookDetailById, getBookTableOfContentsEntries, getDefaultBookDetail } from "@/lib/data/books";
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
  const pathname = id ? `/books/details/table-of-contents?id=${encodeURIComponent(id)}` : "/books/details/table-of-contents";
  return buildBookPageMetadata(locale, "tableOfContents", pathname, book?.title);
}

export default async function BookTableOfContentsRoute({ searchParams }: BookTableOfContentsRouteProps) {
  const { id } = await searchParams;
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();

  if (!book) {
    notFound();
  }

  const entries = await getBookTableOfContentsEntries(book.id);

  return <BookTableOfContentsPage book={book} entries={entries} />;
}
