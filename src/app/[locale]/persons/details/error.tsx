"use client";

import { RouteErrorScreen } from "@/components/stavnet/route-error-screen";
import { useTranslations } from "next-intl";

export default function PersonDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Errors");

  return (
    <RouteErrorScreen
      title={t("personDetails.title")}
      message={t("personDetails.message")}
      homeHref="/persons"
      homeLabel={t("personDetails.return")}
      retryLabel={t("personDetails.retry")}
      reset={reset}
      error={error}
    />
  );
}
