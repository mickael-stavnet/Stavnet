"use client";

import { RouteErrorScreen } from "@/components/stavnet/route-error-screen";

export default function OrganizationDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorScreen
      title="Erreur du fichier organisme"
      message="Une erreur est survenue pendant le chargement de la fiche organisme. Relance la page pour réessayer."
      homeHref="/orgs"
      homeLabel="Retour aux organismes"
      retryLabel="Réessayer"
      reset={reset}
      error={error}
    />
  );
}
