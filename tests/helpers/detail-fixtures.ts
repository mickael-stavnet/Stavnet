import type { OrganizationDetail } from "@/lib/data/orgs";
import type { PersonDetail } from "@/lib/data/persons";
import { buildDetailStatistics } from "@/lib/detail-statistics";

export function createPersonDetail(overrides: Partial<PersonDetail> = {}): PersonDetail {
  return {
    name: "Ada Aharoni",
    alternateName: "Aharoni Ada",
    hebrewName: "",
    birthInfo: "1933",
    deathInfo: "",
    professionalActivity: "Écrivain",
    residence: "",
    type: "",
    language: "Hébreu",
    imageSrc: "/images/persons/default.jpg",
    biography: "Biographie",
    bibliographyStats: {
      originalTitles: "2",
      translations: "4",
      publicationLanguages: "4",
    },
    bibliographyRows: [
      {
        type: "Original",
        language: "Hébreu",
        title: "Original Book",
        year: "1992",
        issue: "",
        country: "Israël",
        role: "Auteur",
      },
      {
        type: "Original",
        language: "Hébreu",
        title: "Original Book Earlier",
        year: "1988",
        issue: "",
        country: "Israël",
        role: "Auteur",
      },
      {
        type: "Traduction",
        language: "Français",
        title: "Translated Book",
        year: "2001",
        issue: "00009-T-L06-R-E01",
        country: "France",
        role: "Traducteur",
      },
      {
        type: "Traduction",
        language: "Français",
        title: "Translated Book Earlier",
        year: "1994",
        issue: "00008-T-L06-R-E02",
        country: "France",
        role: "Traducteur",
      },
    ],
    statistics: buildDetailStatistics([]),
    stats: {
      cardsFound: "697",
      databaseContains: "1231",
    },
    ...overrides,
  };
}

export function createOrganizationDetail(overrides: Partial<OrganizationDetail> = {}): OrganizationDetail {
  return {
    name: "Fayard",
    synonym: "Fayard",
    type: "Editeur",
    creationDate: "1857",
    country: "France",
    publishedRows: [
      {
        title: "La Liste",
        author: "Michel Bar-Zohar",
        year: "1976",
        language: "Français",
        country: "France",
        role: "Auteur",
      },
      {
        title: "Le Complot",
        author: "Michel Bar-Zohar",
        year: "1980",
        language: "Français",
        country: "France",
        role: "Auteur",
      },
    ],
    statistics: buildDetailStatistics([]),
    publishedStats: {
      titles: "24",
      authors: "5",
    },
    stats: {
      cardsFound: "1200",
      databaseContains: "1200",
    },
    ...overrides,
  };
}
