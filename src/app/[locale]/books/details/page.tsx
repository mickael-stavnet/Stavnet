import { notFound } from "next/navigation";
import BookDetailPage from "../book-detail-page";
import { getBookDetailById, getDefaultBookDetail } from "@/lib/data/books";

interface BookDetailsPageProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function BookDetailsPage({ searchParams }: BookDetailsPageProps) {
  const { id } = await searchParams;
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();

  if (!book) {
    notFound();
  }

  return <BookDetailPage book={book} />;
}
