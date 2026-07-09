"use client";

import { RouteErrorScreen } from "@/components/stavnet/route-error-screen";

export default function RelatedBooksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorScreen
      title="Erreur des ouvrages liés"
      message="Une erreur est survenue pendant le chargement des ouvrages liés. Relance la page pour réessayer."
      homeHref="/books"
      homeLabel="Retour aux livres"
      retryLabel="Réessayer"
      reset={reset}
      error={error}
    />
  );
}
