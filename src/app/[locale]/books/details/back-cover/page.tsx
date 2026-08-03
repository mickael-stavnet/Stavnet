import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookBackCoverPage from "../../book-back-cover-page";
import { getBookDetailById, getDefaultBookDetail } from "@/lib/data/books";
import { buildBookPageMetadata } from "@/lib/site-metadata";

interface BookBackCoverRouteProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    id?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: BookBackCoverRouteProps): Promise<Metadata> {
  const [{ locale }, { id }] = await Promise.all([params, searchParams]);
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();
  const pathname = id ? `/books/details/back-cover?id=${encodeURIComponent(id)}` : "/books/details/back-cover";
  return buildBookPageMetadata(locale, "backCover", pathname, book?.title);
}

export default async function BookBackCoverRoute({ searchParams }: BookBackCoverRouteProps) {
  const { id } = await searchParams;
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();

  if (!book) {
    notFound();
  }

  return <BookBackCoverPage book={book} />;
}
