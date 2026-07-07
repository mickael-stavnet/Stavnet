import { redirect } from "@/i18n/routing";
import { resolveBookByExactTitle } from "@/lib/data/books";

export const dynamic = "force-dynamic";

interface BooksByTitlePageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    title?: string;
  }>;
}

export default async function BooksByTitlePage({ params, searchParams }: BooksByTitlePageProps) {
  const [{ locale }, { title }] = await Promise.all([params, searchParams]);
  const trimmedTitle = title?.trim() ?? "";

  if (!trimmedTitle) {
    redirect({
      href: {
        pathname: "/books",
        query: {
          page: "1",
        },
      },
      locale,
    });
  }

  const resolution = await resolveBookByExactTitle(trimmedTitle);

  if (resolution.kind === "unique") {
    redirect({
      href: {
        pathname: "/books/details",
        query: {
          id: resolution.id,
        },
      },
      locale,
    });
  }

  redirect({
    href: {
      pathname: "/books",
      query: {
        page: "1",
        q: trimmedTitle,
      },
    },
    locale,
  });
}
