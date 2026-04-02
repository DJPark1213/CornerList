import { test, expect } from "@playwright/test";

// Navigate to a real DJ profile from search rather than hardcoding an ID
async function goToFirstDjProfile(page: import("@playwright/test").Page) {
  await page.goto("/search");
  const firstCard = page.locator("article a").first();
  const visible = await firstCard.isVisible();
  if (!visible) return false;
  await firstCard.click();
  await page.waitForURL(/\/djs\//);
  return true;
}

test.describe("DJ Profile page", () => {
  test("profile page loads with a stage name heading", async ({ page }) => {
    const found = await goToFirstDjProfile(page);
    if (!found) return; // no DJs in DB, skip
    await expect(page.locator("h1")).toBeVisible();
  });

  test("displays About section", async ({ page }) => {
    const found = await goToFirstDjProfile(page);
    if (!found) return;
    await expect(page.getByRole("heading", { name: /About/i })).toBeVisible();
  });

  test("displays Equipment & Availability sections", async ({ page }) => {
    const found = await goToFirstDjProfile(page);
    if (!found) return;
    await expect(page.getByText(/Equipment/i)).toBeVisible();
    await expect(page.getByText(/Availability/i)).toBeVisible();
  });

  test("displays Reviews section", async ({ page }) => {
    const found = await goToFirstDjProfile(page);
    if (!found) return;
    await expect(page.getByRole("heading", { name: /Reviews/i })).toBeVisible();
  });

  test("Request Booking button is visible for unauthenticated user", async ({ page }) => {
    const found = await goToFirstDjProfile(page);
    if (!found) return;
    await expect(page.getByRole("button", { name: /Request Booking/i })).toBeVisible();
  });

  test("clicking Request Booking shows sign-in prompt for unauthenticated user", async ({ page }) => {
    const found = await goToFirstDjProfile(page);
    if (!found) return;
    await page.getByRole("button", { name: /Request Booking/i }).click();
    // Modal should open showing a sign-in option
    await expect(page.getByText(/sign in/i).first()).toBeVisible();
  });

  test("shows price per hour", async ({ page }) => {
    const found = await goToFirstDjProfile(page);
    if (!found) return;
    await expect(page.getByText(/\/hr/)).toBeVisible();
  });

  test("Back to search link navigates to /search", async ({ page }) => {
    const found = await goToFirstDjProfile(page);
    if (!found) return;
    await page.getByRole("link", { name: /Back to search/i }).click();
    await expect(page).toHaveURL(/\/search/);
  });
});
