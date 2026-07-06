import { Link } from "@/i18n/routing";
import type { BookRelatedFacet } from "@/lib/book-related";

export type DetailLinkHref =
  | {
      pathname: "/books/related";
      query: {
        facet: BookRelatedFacet;
        value: string;
      };
    }
  | {
      pathname: "/books/by-title";
      query: {
        title: string;
      };
    }
  | {
      pathname: "/persons/details";
      query: {
        name: string;
        fallbackFacet: BookRelatedFacet;
        fallbackValue: string;
      };
    }
  | {
      pathname: "/orgs/details";
      query: {
        name: string;
        fallbackFacet: BookRelatedFacet;
        fallbackValue: string;
      };
    };

export function buildRelatedBooksHref(facet: BookRelatedFacet, value: string): DetailLinkHref {
  return {
    pathname: "/books/related",
    query: {
      facet,
      value,
    },
  };
}

export function buildBookTitleResolverHref(title: string): DetailLinkHref {
  return {
    pathname: "/books/by-title",
    query: {
      title,
    },
  };
}

export function buildPersonDetailHref(name: string, fallbackFacet: BookRelatedFacet): DetailLinkHref {
  return {
    pathname: "/persons/details",
    query: {
      name,
      fallbackFacet,
      fallbackValue: name,
    },
  };
}

export function buildOrganizationDetailHref(name: string, fallbackFacet: BookRelatedFacet): DetailLinkHref {
  return {
    pathname: "/orgs/details",
    query: {
      name,
      fallbackFacet,
      fallbackValue: name,
    },
  };
}

export function ClickableDetailValue({ href, value }: { href: DetailLinkHref; value: string }) {
  return (
    <Link
      href={href}
      className="cursor-pointer text-black underline decoration-current underline-offset-2 transition-colors hover:text-[#0f4c81]"
    >
      {value}
    </Link>
  );
}
