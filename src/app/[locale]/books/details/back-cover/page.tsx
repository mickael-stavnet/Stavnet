import { notFound } from "next/navigation";
import BookBackCoverPage from "../../book-back-cover-page";
import { getBookDetailById, getDefaultBookDetail } from "@/lib/data/books";

interface BookBackCoverRouteProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function BookBackCoverRoute({ searchParams }: BookBackCoverRouteProps) {
  const { id } = await searchParams;
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();

  if (!book) {
    notFound();
  }

  return <BookBackCoverPage book={book} />;
}
