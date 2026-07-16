"use client";

import { RouteErrorScreen } from "@/components/stavnet/route-error-screen";
import { useTranslations } from "next-intl";

export default function OrganizationDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Errors");

  return (
    <RouteErrorScreen
      title={t("organizationDetails.title")}
      message={t("organizationDetails.message")}
      homeHref="/orgs"
      homeLabel={t("organizationDetails.return")}
      retryLabel={t("organizationDetails.retry")}
      reset={reset}
      error={error}
    />
  );
}
