export const MAX_BOOKS_PAGE = 400;
export const MAX_ORGANIZATIONS_PAGE = 120;
export const MAX_PERSONS_PAGE = 1000;

export function isPageWithinLimit(page: number, maxPage: number): boolean {
  return Number.isInteger(page) && page >= 1 && page <= maxPage;
}
