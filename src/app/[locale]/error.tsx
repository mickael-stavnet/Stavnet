"use client";

import { RouteErrorScreen } from "@/components/stavnet/route-error-screen";
import { useTranslations } from "next-intl";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Errors.application");
  const tHome = useTranslations("Home");

  return (
    <RouteErrorScreen
      title={t("title")}
      message={t("message")}
      homeHref="/"
      homeLabel={t("return")}
      retryLabel={t("retry")}
      backLabel={tHome("back")}
      reset={reset}
      error={error}
    />
  );
}
