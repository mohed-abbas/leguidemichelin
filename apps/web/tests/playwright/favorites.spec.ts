import { test, expect } from "@playwright/test";

/**
 * Phase 04.1 Plan 11 — Favorites smoke.
 *
 * Coverage (all four tests run unconditionally — no test.skip / test.fixme):
 *   1. Heart on /restaurants/[id] hydrates from server and toggles.
 *   2. Heart on /map info card (via list-view surface) toggles.
 *   3. /favorites list renders the seeded favorite and supports undo.
 *   4. /favorites renders the empty state after the undo window expires.
 *
 * Prereqs (must be satisfied before this suite runs):
 *   - Database seeded via `cd guide-dev && npm run --workspace @repo/db db:seed`
 *     → diner-demo has exactly one Favorite (Phase 04.1 Plan 11 Task 1).
 *   - `cd guide-dev/apps/web && npx playwright install` (one-time).
 *   - web + api + db running (playwright.config.ts webServer starts web only
 *     in local dev; api + db must already be up).
 *
 * Auth: signs in as diner-demo via the API in `beforeEach`, then navigates
 * from an authenticated context. No storage-state file — each test gets a
 * fresh browser context.
 *
 * Dynamic restaurant-id lookup: `items[0].restaurantId` from the seeded
 * favorite — works against any scrape fixture without hardcoding.
 */

const DINER_DEMO_EMAIL = "diner-demo@guide-foodie.test";
const DINER_DEMO_PASSWORD = "Diner2026!";

test.describe("Phase 04.1 — Favorites", () => {
  test.beforeEach(async ({ page }) => {
    // Sign in via the Better Auth email endpoint. Same-origin POST so the
    // session cookie is persisted on the Playwright browser context.
    const res = await page.request.post("/api/auth/sign-in/email", {
      data: { email: DINER_DEMO_EMAIL, password: DINER_DEMO_PASSWORD },
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
    });
    expect(
      res.ok(),
      "diner-demo sign-in must succeed — check seed ran and API is up",
    ).toBe(true);
  });

  test("heart on /restaurants/[id] hydrates from server and toggles", async ({ page }) => {
    // Resolve the seeded favorited restaurant id dynamically via the API —
    // no hardcoded IDs, survives scrape re-runs.
    const favRes = await page.request.get("/api/me/favorites");
    expect(favRes.ok()).toBe(true);
    const body = (await favRes.json()) as { items: Array<{ restaurantId: string }> };
    expect(
      body.items.length,
      "diner-demo must have at least one seeded favorite",
    ).toBeGreaterThan(0);
    const restaurantId = body.items[0].restaurantId;

    await page.goto(`/restaurants/${restaurantId}`);

    // Heart button is labelled "Favori" on the action card (Plan 07).
    const heart = page.getByRole("button", { name: "Favori" });
    await expect(heart).toHaveAttribute("aria-pressed", "true");

    await heart.click();
    await expect(heart).toHaveAttribute("aria-pressed", "false");

    // Refresh — server should see the unfavorite persisted, card re-hydrates.
    await page.reload();
    const heartAfterReload = page.getByRole("button", { name: "Favori" });
    await expect(heartAfterReload).toHaveAttribute("aria-pressed", "false");

    // Restore for subsequent tests that expect the seeded favorite present.
    await heartAfterReload.click();
    await expect(heartAfterReload).toHaveAttribute("aria-pressed", "true");
  });

  test("heart on /map info card toggles and persists", async ({ page }) => {
    await page.goto("/map");

    // Open the list view — the map itself renders pins as WebGL features
    // inside the Mapbox canvas (not DOM), so the list-view `<li>` is the
    // DOM-addressable equivalent of a map pin. The `data-testid="map-pin"`
    // hook is added in Sub-task 3.1.
    const listToggle = page.getByRole("button", { name: "Liste des restaurants" });
    await expect(listToggle).toBeVisible({ timeout: 10_000 });
    await listToggle.click();

    const pin = page.locator('[data-testid="map-pin"]').first();
    await expect(pin).toBeVisible({ timeout: 10_000 });

    // Heart inside the selected pin's info card.
    const mapHeart = pin.getByRole("button", {
      name: /Ajouter aux favoris|Retirer des favoris/,
    });
    const initialPressed = await mapHeart.getAttribute("aria-pressed");
    await mapHeart.click();
    await expect(mapHeart).toHaveAttribute(
      "aria-pressed",
      initialPressed === "true" ? "false" : "true",
    );
  });

  test("/favorites lists seeded favorite and supports undo", async ({ page }) => {
    await page.goto("/favorites");
    await expect(page.getByRole("heading", { name: "Mes favoris" })).toBeVisible();

    // The list is a <ul> of <li> cards (FavoritesList component).
    const cards = page.locator("ul > li");
    await expect(cards).toHaveCount(1);

    // Unfavorite via the heart inside the card.
    const cardHeart = cards.first().getByRole("button", { name: /Retirer des favoris/ });
    await cardHeart.click();
    await expect(cards).toHaveCount(0);

    // Undo toast visible with an "Annuler" button.
    const undoBtn = page.getByRole("button", { name: "Annuler" });
    await expect(undoBtn).toBeVisible({ timeout: 2_000 });
    await undoBtn.click();
    await expect(cards).toHaveCount(1);
  });

  test("/favorites shows the empty state after the undo window expires", async ({ page }) => {
    await page.goto("/favorites");
    const cards = page.locator("ul > li");

    // Unfavorite the only seeded card without clicking Annuler — wait past
    // the undo window (default 5s sonner toast duration) so the unfavorite
    // persists server-side.
    await expect(cards).toHaveCount(1);
    await cards
      .first()
      .getByRole("button", { name: /Retirer des favoris/ })
      .click();
    await expect(cards).toHaveCount(0);
    await page.waitForTimeout(5_500);

    // Reload to re-fetch from the server — empty state should now render.
    await page.reload();
    await expect(page.getByText("Aucun favori pour l'instant.")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Parcourir les restaurants" }),
    ).toHaveAttribute("href", "/");
  });
});
