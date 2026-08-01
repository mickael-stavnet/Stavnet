export function formatOrganizationTypeLabel(value: string): string {
  const label = value.trim();
  const normalizedLabel = label.replace(/\s+/g, " ").toLocaleLowerCase("fr-FR");

  return normalizedLabel === "autre organisme" || normalizedLabel === "autreorganisme"
    ? "Autre organisme"
    : label;
}
