/**
 * tools/scrape/scrape-michelin.ts
 *
 * ONE-SHOT Michelin restaurant scraper.
 * - NEVER called at runtime (PITFALLS #4) — runs manually in dev.
 * - Writes tools/scrape/seed-data/restaurants.json (gitignored if empty; committed if ≥1 row).
 * - Polite-use: 1 req per 1500ms, descriptive UA, hard-stop on 403/429.
 * - Scope (Phase 1 / CONTEXT D-16): Paris + Lyon only.
 *
 * Usage:
 *   npm run scrape:michelin                 # full scrape (requires `npx playwright install chromium` once)
 *   npm run scrape:dry                       # prints URLs and plan without fetching
 */
import { chromium, type Browser, type Page } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Polite-use constants (T-01-SCRAPE-ABUSE mitigation — 1 req per 1.5 seconds)
const USER_AGENT =
  "GuideFoodieJourneyBot/0.1 (hackathon educational use; contact mohed332@gmail.com)";
const REQ_DELAY_MS = 1500; // 1 request per ~1.5 seconds — polite

const CITIES = ["paris", "lyon"] as const;
type CitySlug = (typeof CITIES)[number];

// Michelin guide URL mapping.
// Confirm by hand-browsing before running; they change rarely, but do change.
const CITY_URL: Record<CitySlug, string> = {
  paris: "https://guide.michelin.com/fr/fr/ile-de-france/paris/restaurants",
  lyon: "https://guide.michelin.com/fr/fr/auvergne-rhone-alpes/lyon/restaurants",
};

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
  heroImageKey: string | null; // ALWAYS null — we do not download Michelin photos (T-01-BRAND-IP)
}

function parseArgs() {
  const args = process.argv.slice(2);
  const citiesArg = args.find((a) => a.startsWith("--cities="));
  const cities = citiesArg
    ? (citiesArg.split("=")[1]?.split(",") as CitySlug[])
    : [...CITIES];
  const dryRun = args.includes("--dry-run");
  return { cities, dryRun };
}

async function scrapeCity(page: Page, city: CitySlug): Promise<RestaurantFixture[]> {
  const url = CITY_URL[city];
  console.log(`[scrape] ${city}: GET ${url}`);
  const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });

  if (!response) {
    console.error(`[scrape] ${city}: no response`);
    return [];
  }

  const status = response.status();
  // Hard-stop on anti-bot response (PITFALLS #4)
  if (status === 403 || status === 429) {
    console.error(
      `[scrape] ${city}: HTTP ${status} — anti-bot lockout. HARD STOP. Rely on fallback JSON.`,
    );
    throw new Error(`scrape blocked with HTTP ${status}`);
  }

  // Wait for the restaurant card list to render.
  await page.waitForSelector("article, .card__menu, [data-restaurant], main", {
    timeout: 15_000,
  });

  // Extract JSON-LD / structured data if present (more stable than HTML parsing).
  const extracted = await page.evaluate(() => {
    const out: Array<Record<string, unknown>> = [];
    const scripts = document.querySelectorAll<HTMLScriptElement>(
      'script[type="application/ld+json"]',
    );
    for (const s of scripts) {
      try {
        const data = JSON.parse(s.textContent || "null");
        if (Array.isArray(data)) {
          out.push(...data);
        } else if (data) {
          out.push(data);
        }
      } catch {
        /* ignore */
      }
    }
    return out;
  });

  const results: RestaurantFixture[] = [];
  for (const item of extracted) {
    const name = String(
      item["name"] ?? (item["item"] as { name?: string } | undefined)?.name ?? "",
    );
    if (!name) continue;

    const address =
      typeof item["address"] === "object" && item["address"] !== null
        ? `${(item["address"] as Record<string, string>).streetAddress ?? ""}, ${
            (item["address"] as Record<string, string>).addressLocality ?? ""
          }`.trim().replace(/^,\s*/, "")
        : String(item["address"] ?? "");

    const lat = Number((item["geo"] as Record<string, unknown> | undefined)?.["latitude"] ?? 0);
    const lng = Number((item["geo"] as Record<string, unknown> | undefined)?.["longitude"] ?? 0);
    if (!lat || !lng) continue;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    results.push({
      michelinSlug: `${city}/${slug}`,
      slug,
      name,
      city: city[0]!.toUpperCase() + city.slice(1),
      address,
      lat,
      lng,
      // JSON-LD rarely includes Michelin tier; default to BIB and let the dev curate.
      // The hand-authored fallback JSON is pre-curated.
      michelinRating: "BIB",
      cuisine: (item["servesCuisine"] as string | undefined) ?? null,
      heroImageKey: null,
    });
  }

  console.log(`[scrape] ${city}: extracted ${results.length} restaurants`);
  return results;
}

async function main(): Promise<void> {
  const { cities, dryRun } = parseArgs();

  if (dryRun) {
    console.log("[scrape] DRY RUN — URLs only, no fetch");
    for (const c of cities) console.log(`[scrape] would fetch: ${CITY_URL[c]}`);
    return;
  }

  console.log(`[scrape] starting; cities=${cities.join(",")}; UA=${USER_AGENT}`);

  const outDir = join(__dirname, "..", "seed-data");
  await mkdir(outDir, { recursive: true });

  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: USER_AGENT });
  const page = await context.newPage();

  const all: RestaurantFixture[] = [];
  try {
    for (const city of cities) {
      try {
        const rows = await scrapeCity(page, city);
        all.push(...rows);
      } catch (err) {
        console.error(`[scrape] ${city} failed:`, err);
        process.exitCode = 1;
        break; // hard-stop on first failure per PITFALLS #4
      }
      await new Promise((r) => setTimeout(r, REQ_DELAY_MS));
    }
  } finally {
    await browser.close();
  }

  if (all.length === 0) {
    console.error(
      "[scrape] zero restaurants extracted — NOT writing restaurants.json. Rely on fallback.",
    );
    process.exit(1);
  }

  const outPath = join(outDir, "restaurants.json");
  await writeFile(outPath, JSON.stringify(all, null, 2), "utf8");
  console.log(`[scrape] wrote ${all.length} restaurants → ${outPath}`);
  console.log(
    "[scrape] REMEMBER: commit restaurants.json to git; NEVER re-run in CI or at runtime.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
