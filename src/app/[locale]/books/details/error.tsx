"use client";

import { RouteErrorScreen } from "@/components/stavnet/route-error-screen";
import { useTranslations } from "next-intl";

export default function BookDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Errors");

  return (
    <RouteErrorScreen
      title={t("bookDetails.title")}
      message={t("bookDetails.message")}
      homeHref="/books"
      homeLabel={t("bookDetails.return")}
      retryLabel={t("bookDetails.retry")}
      reset={reset}
      error={error}
    />
  );
}
