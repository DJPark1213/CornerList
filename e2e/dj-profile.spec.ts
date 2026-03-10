import { test, expect } from "@playwright/test";

test.describe("DJ Profile page", () => {
  test("loads a DJ profile with correct details", async ({ page }) => {
    await page.goto("/djs/mike-beats");
    await expect(page.locator("h1")).toContainText("DJ Mike Beats");
    await expect(page.getByText("Hip-Hop", { exact: true })).toBeVisible();
    await expect(page.locator("text=$120/hr")).toBeVisible();
  });

  test("displays About section", async ({ page }) => {
    await page.goto("/djs/mike-beats");
    await expect(page.locator("text=About")).toBeVisible();
    await expect(page.locator("text=High-energy DJ")).toBeVisible();
  });

  test("displays Equipment & Availability sections", async ({ page }) => {
    await page.goto("/djs/mike-beats");
    await expect(page.locator("text=Equipment & Setup")).toBeVisible();
    await expect(page.locator("text=Availability")).toBeVisible();
  });

  test("displays reviews section", async ({ page }) => {
    await page.goto("/djs/mike-beats");
    await expect(
      page.getByRole("heading", { name: /Reviews/ })
    ).toBeVisible();
    await expect(page.locator("text=Sarah T.")).toBeVisible();
  });

  test("opens and closes booking modal", async ({ page }) => {
    await page.goto("/djs/mike-beats");
    await page.getByText("Request Booking").click();
    await expect(page.locator("text=Event date")).toBeVisible();
    await expect(page.locator("text=Send Request")).toBeVisible();

    await page.getByText("✕").click();
    await expect(page.locator("text=Event date")).not.toBeVisible();
  });
});
