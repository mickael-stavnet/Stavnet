"use client";

import { RouteErrorScreen } from "@/components/stavnet/route-error-screen";

export default function BookDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorScreen
      title="Erreur de la fiche livre"
      message="Une erreur est survenue pendant le chargement de la fiche livre. Relance la page pour réessayer."
      homeHref="/books"
      homeLabel="Retour aux livres"
      retryLabel="Réessayer"
      reset={reset}
      error={error}
    />
  );
}
