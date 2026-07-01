import { notFound } from "next/navigation";
import BookPressCritiquesPage from "../../book-press-critiques-page";
import { getBookDetailById, getDefaultBookDetail } from "@/lib/data/books";

interface BookPressCritiquesRouteProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function BookPressCritiquesRoute({ searchParams }: BookPressCritiquesRouteProps) {
  const { id } = await searchParams;
  const book = id ? await getBookDetailById(id) : await getDefaultBookDetail();

  if (!book) {
    notFound();
  }

  return <BookPressCritiquesPage book={book} />;
}
