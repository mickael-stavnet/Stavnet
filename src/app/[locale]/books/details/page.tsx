import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookDetailPage from "../book-detail-page";
import { getBookDetailById, getDefaultBookDetail } from "@/lib/data/books";
import { buildBookPageMetadata } from "@/lib/site-metadata";

interface BookDetailsPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    id?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: BookDetailsPageProps): Promise<Metadata> {
  const [{ locale }, { id }] = await Promise.all([params, searchParams]);
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();
  return buildBookPageMetadata(locale, "bookRecord", "/books/details", book?.title);
}

export default async function BookDetailsPage({ searchParams }: BookDetailsPageProps) {
  const { id } = await searchParams;
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();

  if (!book) {
    notFound();
  }

  return <BookDetailPage book={book} />;
}
