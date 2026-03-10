import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and displays hero content", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Book the")).toBeVisible();
    await expect(page.locator("text=Perfect DJ")).toBeVisible();
  });

  test("has the search bar with all fields", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByPlaceholder("Search by name...")).toBeVisible();
    await expect(page.getByPlaceholder("Max $/hr")).toBeVisible();
    await expect(page.getByLabel("Search")).toBeVisible();
  });

  test("clicking search navigates to /search", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Search").click();
    await expect(page).toHaveURL(/\/search/);
  });

  test("filling search fields and clicking builds query params", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByPlaceholder("Search by name...").fill("Mike");
    await page.getByLabel("Search").click();
    await expect(page).toHaveURL(/q=Mike/);
  });

  test("displays trending DJs section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Trending DJs")).toBeVisible();
  });
});
