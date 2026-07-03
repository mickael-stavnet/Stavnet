export const BOOK_RELATED_FACETS = [
  "authorName",
  "translationLanguage",
  "authorType",
  "authorWritingLanguage",
  "contributorName",
  "contributorType",
  "contributorLanguage",
  "publisherName",
  "publisherCountry",
  "category",
  "subject",
  "genre",
  "targetAudience",
] as const;

export type BookRelatedFacet = (typeof BOOK_RELATED_FACETS)[number];

export const BOOK_RELATED_FACET_LABEL_KEYS: Record<BookRelatedFacet, string> = {
  authorName: "author",
  translationLanguage: "translationLanguage",
  authorType: "authorType",
  authorWritingLanguage: "authorWritingLanguage",
  contributorName: "contributor",
  contributorType: "contributorType",
  contributorLanguage: "contributorLanguage",
  publisherName: "publisher",
  publisherCountry: "publisherCountry",
  category: "category",
  subject: "subject",
  genre: "genre",
  targetAudience: "targetAudience",
};

export function isBookRelatedFacet(value: string): value is BookRelatedFacet {
  return BOOK_RELATED_FACETS.includes(value as BookRelatedFacet);
}
