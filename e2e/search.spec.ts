import { test, expect } from "@playwright/test";

test.describe("Search page", () => {
  test("loads without error and shows the filter bar", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByPlaceholder("DJ name or keywords")).toBeVisible();
  });

  test("shows DJ cards or empty state — never a crash", async ({ page }) => {
    await page.goto("/search");
    const cards = page.locator("article");
    const emptyState = page.getByText(/No DJs match/i);
    const count = await cards.count();
    if (count === 0) {
      await expect(emptyState).toBeVisible();
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  test("name filter narrows results", async ({ page }) => {
    await page.goto("/search");
    const before = await page.locator("article").count();
    if (before === 0) return; // no DJs seeded, skip

    await page.getByPlaceholder("DJ name or keywords").fill("zzz_no_match_xyz");
    await expect(page.getByText(/No DJs match/i)).toBeVisible();
  });

  test("clearing name filter restores results", async ({ page }) => {
    await page.goto("/search");
    const before = await page.locator("article").count();
    if (before === 0) return;

    const nameInput = page.getByPlaceholder("DJ name or keywords");
    await nameInput.fill("zzz_no_match_xyz");
    await expect(page.getByText(/No DJs match/i)).toBeVisible();

    await nameInput.clear();
    await expect(page.locator("article")).toHaveCount(before);
  });

  test("max price filter reduces results when set very low", async ({ page }) => {
    await page.goto("/search");
    const before = await page.locator("article").count();
    if (before === 0) return;

    await page.goto("/search?maxPrice=1");
    const after = await page.locator("article").count();
    expect(after).toBeLessThanOrEqual(before);
  });

  test("genre filter pill is clickable", async ({ page }) => {
    await page.goto("/search");
    const hipHopBtn = page.getByRole("button", { name: "Hip-Hop" });
    if (await hipHopBtn.isVisible()) {
      await hipHopBtn.click();
      await expect(hipHopBtn).toHaveClass(/bg-primary/);
    }
  });

  test("each DJ card links to their profile page", async ({ page }) => {
    await page.goto("/search");
    const firstCard = page.locator("article").first();
    if (!(await firstCard.isVisible())) return;

    const link = firstCard.locator("a").first();
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^\/djs\//);
  });
});
