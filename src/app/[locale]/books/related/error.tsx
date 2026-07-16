"use client";

import { RouteErrorScreen } from "@/components/stavnet/route-error-screen";
import { useTranslations } from "next-intl";

export default function RelatedBooksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Errors");

  return (
    <RouteErrorScreen
      title={t("relatedBooks.title")}
      message={t("relatedBooks.message")}
      homeHref="/books"
      homeLabel={t("relatedBooks.return")}
      retryLabel={t("relatedBooks.retry")}
      reset={reset}
      error={error}
    />
  );
}
