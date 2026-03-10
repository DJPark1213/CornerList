import { test, expect } from "@playwright/test";

test.describe("DJ Onboarding Wizard", () => {
  test("shows step 1 by default", async ({ page }) => {
    await page.goto("/join-dj");
    await expect(page.locator("text=Join CornerList as a DJ")).toBeVisible();
    await expect(page.getByPlaceholder("e.g. DJ Mike Beats")).toBeVisible();
  });

  test("Next is disabled until required fields are filled", async ({
    page,
  }) => {
    await page.goto("/join-dj");
    const nextBtn = page.getByText("Next");
    await expect(nextBtn).toBeDisabled();

    await page.getByPlaceholder("e.g. DJ Mike Beats").fill("DJ Test");
    await page.getByPlaceholder("your@email.com").fill("test@test.com");
    await expect(nextBtn).toBeEnabled();
  });

  test("completes the full 4-step wizard", async ({ page }) => {
    await page.goto("/join-dj");

    // Step 1: Basics
    await page.getByPlaceholder("e.g. DJ Mike Beats").fill("DJ Playwright");
    await page.getByPlaceholder("your@email.com").fill("pw@test.com");
    await page.getByText("Next").click();

    // Step 2: Style & Rate
    await expect(page.locator("text=Genres")).toBeVisible();
    await page.getByText("EDM").click();
    await page.getByPlaceholder("e.g. 150").fill("200");
    await page.getByText("Next").click();

    // Step 3: Photo (skip)
    await expect(page.locator("text=Profile picture")).toBeVisible();
    await page.getByText("Next").click();

    // Step 4: Bio & Preview
    await expect(page.getByText("Bio", { exact: true })).toBeVisible();
    await page
      .getByPlaceholder(/tell hosts about yourself/i)
      .fill("I love playing EDM sets.");
    await expect(page.locator("text=DJ Playwright")).toBeVisible();
    await page.getByText("Finish").click();

    // Success screen
    await expect(page.locator("text=Welcome to CornerList!")).toBeVisible();
    await expect(page.locator("text=DJ Playwright")).toBeVisible();
    await expect(page.getByText("EDM", { exact: true })).toBeVisible();
  });

  test("Back button navigates to previous step", async ({ page }) => {
    await page.goto("/join-dj");
    await page.getByPlaceholder("e.g. DJ Mike Beats").fill("DJ Test");
    await page.getByPlaceholder("your@email.com").fill("t@t.com");
    await page.getByText("Next").click();

    await expect(page.locator("text=Genres")).toBeVisible();
    await page.getByText("Back").click();
    await expect(page.getByPlaceholder("e.g. DJ Mike Beats")).toBeVisible();
  });
});
