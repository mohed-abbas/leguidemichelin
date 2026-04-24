import type { MichelinRatingType, SouvenirResponseType } from "@repo/shared-schemas";

import type { BestExperienceChip } from "./_components/BestExperiencesGrid";
import type { ExperienceCardData } from "./_components/ExperienceCard";

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

/**
 * Build "Meilleurs expériences" chips — top 4 distinct restaurants
 * ranked by souvenir count. Thumbnail = newest souvenir's thumbKey
 * for that restaurant. API already returns items newest-first.
 */
export function buildBestExperienceChips(souvenirs: SouvenirResponseType[]): BestExperienceChip[] {
  const grouped = new Map<string, { name: string; count: number; newestThumbKey: string }>();
  for (const s of souvenirs) {
    const existing = grouped.get(s.restaurantId);
    if (existing) {
      existing.count += 1;
    } else {
      grouped.set(s.restaurantId, {
        name: s.restaurantName,
        count: 1,
        newestThumbKey: s.thumbKey,
      });
    }
  }

  return Array.from(grouped.entries())
    .map(([restaurantId, info]) => ({
      restaurantId,
      name: info.name,
      count: info.count,
      thumbnail: `/api/images/${info.newestThumbKey}`,
      href: `/restaurants/${restaurantId}`,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map(({ count: _count, ...chip }) => chip);
}

/**
 * Build one ExperienceCardData per souvenir, newest-first.
 * Badge alternates between "vegan" and "smiley" to match the two
 * themed stamps shown in the Figma design (first card = VEGAN délices,
 * second = green smiley). Real gamification logic is v2.
 */
export function buildExperienceCards(
  souvenirs: SouvenirResponseType[],
  totalDishesByRestaurant: Map<string, number>,
): ExperienceCardData[] {
  const countsByRestaurant = new Map<string, number>();
  for (const s of souvenirs) {
    countsByRestaurant.set(s.restaurantId, (countsByRestaurant.get(s.restaurantId) ?? 0) + 1);
  }

  return souvenirs.map((s, idx) => {
    const current = countsByRestaurant.get(s.restaurantId) ?? 1;
    const total = Math.max(totalDishesByRestaurant.get(s.restaurantId) ?? current, current);
    return {
      souvenirId: s.id,
      restaurantName: s.restaurantName,
      createdAt: s.createdAt,
      photo: `/api/images/${s.imageKey}`,
      note: s.note,
      dishName: s.dishName,
      progressCurrent: current,
      progressTotal: total,
      badge: idx % 2 === 0 ? "vegan" : "smiley",
      href: `/souvenirs/${s.id}`,
    };
  });
}
