import { test, expect } from "@playwright/test";

test.describe("FAQ page", () => {
  test("loads and shows For Hosts section", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.getByText(/For Hosts/i)).toBeVisible();
  });

  test("loads and shows For DJs section", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.getByText(/For DJs/i)).toBeVisible();
  });

  test("FAQ items are collapsed by default", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.getByText(/Payment is only collected/i)).not.toBeVisible();
  });

  test("clicking a question expands the answer", async ({ page }) => {
    await page.goto("/faq");
    await page.getByText(/How does payment work/i).click();
    await expect(page.getByText(/Payment is only collected/i)).toBeVisible();
  });

  test("clicking an open question collapses it", async ({ page }) => {
    await page.goto("/faq");
    await page.getByText(/How does payment work/i).click();
    await expect(page.getByText(/Payment is only collected/i)).toBeVisible();

    await page.getByText(/How does payment work/i).click();
    await expect(page.getByText(/Payment is only collected/i)).not.toBeVisible();
  });

  test("opening one question does not open others", async ({ page }) => {
    await page.goto("/faq");
    await page.getByText(/How do I book a DJ/i).click();
    await expect(page.getByText(/Payment is only collected/i)).not.toBeVisible();
  });
});
