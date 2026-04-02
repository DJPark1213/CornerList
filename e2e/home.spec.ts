import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads with a search input and search button", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByPlaceholder("Search by name...")).toBeVisible();
    await expect(page.getByRole("button", { name: /search/i })).toBeVisible();
  });

  test("shows the trending DJs section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Trending DJs/i)).toBeVisible();
  });

  test("clicking Search navigates to /search", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /search/i }).click();
    await expect(page).toHaveURL(/\/search/);
  });

  test("typing a name and searching appends q param", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Search by name...").fill("Mike");
    await page.getByRole("button", { name: /search/i }).click();
    await expect(page).toHaveURL(/q=Mike/);
  });

  test("navbar is visible with CornerList brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /CornerList/i })).toBeVisible();
  });

  test("has a link to search DJs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /search/i }).first()).toBeVisible();
  });
});
