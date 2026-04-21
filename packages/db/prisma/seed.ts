/**
 * Prisma seed — idempotent upsert of Michelin restaurant fixtures.
 *
 * Plan 3 (this file) ships the skeleton: loader + Prisma disconnect.
 * Plan 7 completes it: restaurants.fallback.json (≥20 entries) + full seed
 * logic including per-rating dish fixtures.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "../src/index.js";

const SEED_DIR = join(
  import.meta.dirname ?? process.cwd(),
  "..",
  "..",
  "tools",
  "scrape",
  "seed-data",
);

interface RestaurantFixture {
  michelinSlug: string;
  slug: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  michelinRating: "BIB" | "ONE" | "TWO" | "THREE";
  cuisine: string | null;
  heroImageKey: string | null;
}

async function loadRestaurants(): Promise<RestaurantFixture[]> {
  const mainPath = join(SEED_DIR, "restaurants.json");
  const fallbackPath = join(SEED_DIR, "restaurants.fallback.json");
  try {
    const body = await readFile(mainPath, "utf8");
    const data = JSON.parse(body);
    if (Array.isArray(data) && data.length > 0) {
      console.log(`[seed] using main fixture (${data.length} restaurants)`);
      return data;
    }
  } catch {
    /* fall through */
  }
  try {
    const body = await readFile(fallbackPath, "utf8");
    const data = JSON.parse(body);
    console.log(`[seed] using fallback fixture (${data.length} restaurants)`);
    return data;
  } catch {
    console.warn(
      "[seed] No fixtures yet — Plan 7 will commit restaurants.fallback.json. Exiting cleanly.",
    );
    return [];
  }
}

async function main() {
  const restaurants = await loadRestaurants();
  if (restaurants.length === 0) {
    await prisma.$disconnect();
    return;
  }
  // Full upsert logic lands in Plan 7.
  console.log(
    `[seed] skeleton — Plan 7 will upsert ${restaurants.length} restaurants.`,
  );
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
