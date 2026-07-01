import { notFound } from "next/navigation";
import BookPublishingPage from "../../book-publishing-page";
import { getBookDetailById, getDefaultBookDetail } from "@/lib/data/books";

interface BookPublishingRouteProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function BookPublishingRoute({ searchParams }: BookPublishingRouteProps) {
  const { id } = await searchParams;
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();

  if (!book) {
    notFound();
  }

  return <BookPublishingPage book={book} />;
}
