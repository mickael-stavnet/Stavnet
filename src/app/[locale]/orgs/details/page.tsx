import { notFound } from "next/navigation";
import OrganizationsDetailPage from "../orgs-detail-page";
import { getDefaultOrganizationDetail, getOrganizationDetailByName } from "@/lib/data/orgs";

interface OrganizationDetailsPageProps {
  searchParams: Promise<{
    name?: string;
  }>;
}

export default async function OrganizationDetailsPage({ searchParams }: OrganizationDetailsPageProps) {
  const { name } = await searchParams;
  const organization = name ? await getOrganizationDetailByName(name) : await getDefaultOrganizationDetail();

  if (!organization) {
    notFound();
  }

  return <OrganizationsDetailPage organization={organization} />;
}
