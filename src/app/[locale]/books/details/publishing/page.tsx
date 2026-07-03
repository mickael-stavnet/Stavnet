import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookPublishingPage from "../../book-publishing-page";
import { getBookDetailById, getDefaultBookDetail } from "@/lib/data/books";
import { buildBookPageMetadata } from "@/lib/site-metadata";

interface BookPublishingRouteProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    id?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: BookPublishingRouteProps): Promise<Metadata> {
  const [{ locale }, { id }] = await Promise.all([params, searchParams]);
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();
  return buildBookPageMetadata(locale, "publishing", "/books/details/publishing", book?.title);
}

export default async function BookPublishingRoute({ searchParams }: BookPublishingRouteProps) {
  const { id } = await searchParams;
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();

  if (!book) {
    notFound();
  }

  return <BookPublishingPage book={book} />;
}
