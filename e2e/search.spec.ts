import { test, expect } from "@playwright/test";

test.describe("Search page", () => {
  test("displays all mock DJs with no filters", async ({ page }) => {
    await page.goto("/search");
    const cards = page.locator("article");
    await expect(cards).toHaveCount(6);
  });

  test("filters by name narrows results", async ({ page }) => {
    await page.goto("/search?q=Mike");
    const cards = page.locator("article");
    await expect(cards).toHaveCount(1);
    await expect(page.locator("text=DJ Mike Beats")).toBeVisible();
  });

  test("filters by max price", async ({ page }) => {
    await page.goto("/search?maxPrice=100");
    const cards = page.locator("article");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(6);
  });

  test("shows empty state when no DJs match", async ({ page }) => {
    await page.goto("/search?q=zzzzz_no_match");
    await expect(page.locator("text=No DJs match your filters")).toBeVisible();
  });

  test("inline filter bar updates results in real time", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("article")).toHaveCount(6);

    await page.getByPlaceholder("DJ name or keywords").fill("Emma");
    await expect(page.locator("article")).toHaveCount(1);
    await expect(page.locator("text=DJ Emma Vibe")).toBeVisible();
  });
});
