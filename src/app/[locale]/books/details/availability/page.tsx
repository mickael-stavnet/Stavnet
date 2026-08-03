import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookAvailabilityPage from "../../book-availability-page";
import { getBookDetailById, getDefaultBookDetail } from "@/lib/data/books";
import { buildBookPageMetadata } from "@/lib/site-metadata";

interface BookAvailabilityRouteProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    id?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: BookAvailabilityRouteProps): Promise<Metadata> {
  const [{ locale }, { id }] = await Promise.all([params, searchParams]);
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();
  const pathname = id ? `/books/details/availability?id=${encodeURIComponent(id)}` : "/books/details/availability";
  return buildBookPageMetadata(locale, "availability", pathname, book?.title);
}

export default async function BookAvailabilityRoute({ searchParams }: BookAvailabilityRouteProps) {
  const { id } = await searchParams;
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();

  if (!book) {
    notFound();
  }

  return <BookAvailabilityPage book={book} />;
}
