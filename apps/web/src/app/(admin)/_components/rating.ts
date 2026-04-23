import type { MichelinRatingType } from "@repo/shared-schemas";

export const RATING_LABEL: Record<MichelinRatingType, string> = {
  BIB: "Bib Gourmand",
  ONE: "★",
  TWO: "★★",
  THREE: "★★★",
};

export const RATING_ORDER: MichelinRatingType[] = ["BIB", "ONE", "TWO", "THREE"];

export function formatPriceEUR(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

const DIACRITICS_RE = /[̀-ͯ]/g;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}
