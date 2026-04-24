import type { MichelinRatingType } from "@repo/shared-schemas";

export type Badge = {
  id: string;
  asset: string;
  alt: string;
};

export const BADGES: Badge[] = [
  {
    id: "gourmand-certifie",
    asset: "/images/chasseur/badge-gourmand-certifie.svg",
    alt: "Badge Gourmand certifié",
  },
  {
    id: "collectionneur-cocktail-1",
    asset: "/images/chasseur/badge-collectionneur-cocktail.svg",
    alt: "Badge Collectionneur de cocktail",
  },
  {
    id: "vegan-delices",
    asset: "/images/chasseur/badge-vegan-delices.svg",
    alt: "Badge VEGAN délices",
  },
  {
    id: "collectionneur-cocktail-2",
    asset: "/images/chasseur/badge-collectionneur-cocktail.svg",
    alt: "Badge Collectionneur de cocktail",
  },
];

export type CollectionItem = {
  id: string;
  name: string;
  city: string;
  priceTier: string;
  cuisine: string;
  progressCurrent: number;
  progressTotal: number;
  thumbnail: string;
  coupDeCoeur: boolean;
  href: string;
};

/**
 * Map Michelin rating to a simple price-tier glyph used in the UI.
 * The backend contract exposes `michelinRating` but no price-tier field, so
 * this is a pragmatic visual mapping — BIB is casual, 3 stars is fine dining.
 */
export function priceTierFromRating(rating: MichelinRatingType): string {
  switch (rating) {
    case "BIB":
      return "€";
    case "ONE":
      return "€€";
    case "TWO":
      return "€€€";
    case "THREE":
      return "€€€€";
  }
}

export const REWARD = {
  discount: "-30%",
  headlineLead: "sur ta prochaine expérience",
  brand: "Bib Gourmand",
  description:
    "Tu peux utiliser ce bon à dans n’importe quel restaurant Bib Gourmand. Enrichis ton expérience culinaire en do...",
};
