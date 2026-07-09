"use client";

import { RouteErrorScreen } from "@/components/stavnet/route-error-screen";

export default function PersonDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorScreen
      title="Erreur du fichier personne"
      message="Une erreur est survenue pendant le chargement de la fiche personne. Relance la page pour réessayer."
      homeHref="/persons"
      homeLabel="Retour aux personnes"
      retryLabel="Réessayer"
      reset={reset}
      error={error}
    />
  );
}
