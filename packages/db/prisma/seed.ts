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

  // ─── Phase 2 D-02: seed RESTAURANT_STAFF per restaurant ─────────────
  // IMPORTANT: we do NOT import @repo/api (backwards workspace dep).
  // Instead, we call the running API over HTTP for password hashing,
  // then use Prisma to lift role + restaurantId (D-01: role.input: false
  // means role cannot be set via signup body).
  //
  // This makes `npm run db:seed` depend on the API server being up.
  // See guide-dev/README.md "Demo Credentials" for the required run order.

  const API_BASE = process.env.SEED_API_BASE ?? "http://localhost:3001";
  // Better Auth rejects requests with a null Origin (403 MISSING_OR_NULL_ORIGIN).
  // Node's fetch omits Origin by default for server-to-server calls, so we set
  // one that matches BETTER_AUTH_URL (the only trusted origin).
  const SEED_ORIGIN = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const STAFF_PASSWORD = "DemoStaff2026!"; // documented in guide-dev/README.md

  // Pre-flight: wait up to 30s for /healthz. Fail fast with a clear message.
  async function waitForApi(): Promise<void> {
    const deadline = Date.now() + 30_000;
    let lastErr: unknown = null;
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`${API_BASE}/healthz`, { method: "GET" });
        if (res.ok) return;
        lastErr = new Error(`healthz returned ${res.status}`);
      } catch (err) {
        lastErr = err;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    console.error(
      `[seed] API server must be running on localhost:3001 before seeding staff users. ` +
        `Run \`npm run --workspace @repo/api dev\` in a second terminal, then retry \`npm run --workspace @repo/db db:seed\`. ` +
        `Last error: ${String(lastErr)}`,
    );
    process.exit(1);
  }

  await waitForApi();

  const allRestaurants = await prisma.restaurant.findMany({
    select: { id: true, slug: true, name: true },
  });
  let staffCreated = 0;
  let staffSkipped = 0;
  for (const r of allRestaurants) {
    const email = `staff-${r.slug}@demo.guidefoodie.app`;

    // Idempotency: if a user with this email already exists, skip entirely —
    // don't re-POST to signup (Better Auth would 4xx on duplicate email).
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, restaurantId: true },
    });
    if (existing) {
      staffSkipped++;
      continue;
    }

    // Create the user via Better Auth HTTP signup — hashes password, creates
    // Account row, respects additionalFields.*.input: false (role defaults to DINER).
    const signupRes = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: SEED_ORIGIN,
      },
      body: JSON.stringify({
        email,
        password: STAFF_PASSWORD,
        name: `Staff — ${r.name}`,
      }),
    });
    if (!signupRes.ok) {
      const text = await signupRes.text().catch(() => "<no body>");
      console.error(`[seed] signup failed for ${email}: ${signupRes.status} ${text}`);
      process.exit(1);
    }

    // Lift role + restaurantId via Prisma — D-01 blocks doing this through
    // the HTTP signup body (additionalFields.role.input: false).
    await prisma.user.update({
      where: { email },
      data: { role: "RESTAURANT_STAFF", restaurantId: r.id },
    });
    staffCreated++;
  }
  console.log(`[seed] staff users: ${staffCreated} created, ${staffSkipped} already existed`);

  // ─── Phase 3 D-10: seed ADMIN + per-dev + fixture DINER accounts ────
  // Same pattern as the staff loop above: HTTP signup (Better Auth hashes the
  // password and respects additionalFields.*.input: false → every new user is
  // a DINER by default), then an optional Prisma lift for ADMIN.

  const ADMIN_PASSWORD = "Admin2026!";
  const DEV_DINER_PASSWORD = "DevDiner2026!";
  const FIXTURE_DINER_PASSWORD = "Diner2026!";

  interface SeedUser {
    email: string;
    name: string;
    password: string;
    role: "ADMIN" | "DINER";
  }

  const seedUsers: SeedUser[] = [
    { email: "admin@guide-foodie.test", name: "Guide Foodie Admin", password: ADMIN_PASSWORD, role: "ADMIN" },
    { email: "dev-murx@guide-foodie.test", name: "Murx (dev)", password: DEV_DINER_PASSWORD, role: "DINER" },
    { email: "dev-ilia@guide-foodie.test", name: "Ilia (dev)", password: DEV_DINER_PASSWORD, role: "DINER" },
    { email: "dev-wilson@guide-foodie.test", name: "Wilson (dev)", password: DEV_DINER_PASSWORD, role: "DINER" },
    { email: "diner-empty@guide-foodie.test", name: "Empty Diner", password: FIXTURE_DINER_PASSWORD, role: "DINER" },
    { email: "diner-demo@guide-foodie.test", name: "Demo Diner", password: FIXTURE_DINER_PASSWORD, role: "DINER" },
  ];

  let userCreated = 0;
  let userSkipped = 0;
  for (const u of seedUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email }, select: { id: true } });
    if (existing) {
      userSkipped++;
      continue;
    }
    const res = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: SEED_ORIGIN },
      body: JSON.stringify({ email: u.email, password: u.password, name: u.name }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "<no body>");
      console.error(`[seed] signup failed for ${u.email}: ${res.status} ${text}`);
      process.exit(1);
    }
    if (u.role === "ADMIN") {
      await prisma.user.update({ where: { email: u.email }, data: { role: "ADMIN" } });
    }
    userCreated++;
  }
  console.log(`[seed] users (admin+dev+fixture): ${userCreated} created, ${userSkipped} already existed`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
