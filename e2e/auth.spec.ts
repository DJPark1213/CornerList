import { test, expect } from "@playwright/test";

test.describe("Auth guards", () => {
  test("/bookings redirects unauthenticated users to home", async ({ page }) => {
    await page.goto("/bookings");
    await expect(page).toHaveURL("/");
  });

  test("/djs/me redirects unauthenticated users to home", async ({ page }) => {
    await page.goto("/djs/me");
    await expect(page).toHaveURL("/");
  });

  test("/admin redirects unauthenticated users to home", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL("/");
  });
});
