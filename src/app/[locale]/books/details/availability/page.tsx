import { notFound } from "next/navigation";
import BookAvailabilityPage from "../../book-availability-page";
import { getBookDetailById, getDefaultBookDetail } from "@/lib/data/books";

interface BookAvailabilityRouteProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function BookAvailabilityRoute({ searchParams }: BookAvailabilityRouteProps) {
  const { id } = await searchParams;
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();

  if (!book) {
    notFound();
  }

  return <BookAvailabilityPage book={book} />;
}
