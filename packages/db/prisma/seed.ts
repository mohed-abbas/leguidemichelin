/**
 * Prisma seed — idempotent upsert of Michelin restaurant fixtures + per-tier dishes.
 *
 * - Loads `tools/scrape/seed-data/restaurants.json` if present + non-empty;
 *   otherwise falls back to `restaurants.fallback.json` (DATA-02).
 * - Upserts by `michelinSlug` (T-01-SEED-INJECTION — exact match on UNIQUE column).
 * - Inserts ~3 dishes per rating tier ONLY if a restaurant has zero dishes yet
 *   (idempotent even across re-runs).
 *
 * Run via: npm run db:seed
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_DIR = join(__dirname, "..", "..", "..", "tools", "scrape", "seed-data");

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

const DISHES_BY_RATING: Record<RestaurantFixture["michelinRating"], string[]> = {
  BIB: ["Entrée du jour", "Plat du marché", "Dessert maison"],
  ONE: ["Foie gras poêlé", "Bar en croûte de sel", "Soufflé au chocolat"],
  TWO: ["Homard bleu", "Pigeon au sang", "Vacherin aux fruits rouges"],
  THREE: ["Caviar osciètre", "Turbot de ligne", "Mille-feuille vanille Bourbon"],
};

function basePriceCents(r: RestaurantFixture["michelinRating"]): number {
  // D-05: Int cents. Scales with tier.
  return { BIB: 2500, ONE: 6500, TWO: 15000, THREE: 35000 }[r];
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
    /* fall through to fallback */
  }
  console.log("[seed] main fixture missing or empty — using fallback");
  const body = await readFile(fallbackPath, "utf8");
  const data = JSON.parse(body);
  console.log(`[seed] fallback has ${data.length} restaurants`);
  return data;
}

async function main() {
  const restaurants = await loadRestaurants();

  for (const r of restaurants) {
    const upserted = await prisma.restaurant.upsert({
      where: { michelinSlug: r.michelinSlug },
      create: {
        michelinSlug: r.michelinSlug,
        slug: r.slug,
        name: r.name,
        city: r.city,
        address: r.address,
        lat: r.lat,
        lng: r.lng,
        michelinRating: r.michelinRating,
        cuisine: r.cuisine,
        heroImageKey: r.heroImageKey,
      },
      update: {
        name: r.name,
        address: r.address,
        lat: r.lat,
        lng: r.lng,
        michelinRating: r.michelinRating,
        cuisine: r.cuisine,
      },
    });

    // Idempotent dish seed — only insert if this restaurant has zero dishes.
    const existing = await prisma.dish.count({ where: { restaurantId: upserted.id } });
    if (existing === 0) {
      const dishes = DISHES_BY_RATING[r.michelinRating];
      for (let i = 0; i < dishes.length; i++) {
        await prisma.dish.create({
          data: {
            restaurantId: upserted.id,
            name: dishes[i]!,
            description: null,
            priceCents: basePriceCents(r.michelinRating),
            sortOrder: i,
          },
        });
      }
    }
  }

  console.log(`[seed] done — ${restaurants.length} restaurants upserted`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
