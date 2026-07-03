import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookPressCritiquesPage from "../../book-press-critiques-page";
import { getBookDetailById, getDefaultBookDetail } from "@/lib/data/books";
import { buildBookPageMetadata } from "@/lib/site-metadata";

interface BookPressCritiquesRouteProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    id?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: BookPressCritiquesRouteProps): Promise<Metadata> {
  const [{ locale }, { id }] = await Promise.all([params, searchParams]);
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();
  return buildBookPageMetadata(locale, "pressCritiques", "/books/details/press-critiques", book?.title);
}

export default async function BookPressCritiquesRoute({ searchParams }: BookPressCritiquesRouteProps) {
  const { id } = await searchParams;
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();

  if (!book) {
    notFound();
  }

  return <BookPressCritiquesPage book={book} />;
}
