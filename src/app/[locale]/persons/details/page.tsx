import { notFound } from "next/navigation";
import PersonDetailPage from "../person-detail-page";
import { getDefaultPersonDetail, getPersonDetailByName } from "@/lib/data/persons";

interface PersonDetailsPageProps {
  searchParams: Promise<{
    name?: string;
  }>;
}

export default async function PersonDetailsPage({ searchParams }: PersonDetailsPageProps) {
  const { name } = await searchParams;
  const person = name ? await getPersonDetailByName(name) : await getDefaultPersonDetail();

  if (!person) {
    notFound();
  }

  return <PersonDetailPage person={person} />;
}
