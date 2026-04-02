import { test, expect } from "@playwright/test";

test.describe("DJ Onboarding Wizard", () => {
  test("shows step 1 with required fields", async ({ page }) => {
    await page.goto("/join-dj");
    await expect(page.getByPlaceholder("e.g. DJ Mike Beats")).toBeVisible();
    await expect(page.getByPlaceholder("your@email.com")).toBeVisible();
  });

  test("Next button is disabled until required fields are filled", async ({ page }) => {
    await page.goto("/join-dj");
    const nextBtn = page.getByRole("button", { name: /next/i });
    await expect(nextBtn).toBeDisabled();

    await page.getByPlaceholder("e.g. DJ Mike Beats").fill("DJ Test");
    await page.getByPlaceholder("your@email.com").fill("test@test.com");
    await expect(nextBtn).toBeEnabled();
  });

  test("advances to step 2 on Next", async ({ page }) => {
    await page.goto("/join-dj");
    await page.getByPlaceholder("e.g. DJ Mike Beats").fill("DJ Test");
    await page.getByPlaceholder("your@email.com").fill("test@test.com");
    await page.getByRole("button", { name: /next/i }).click();
    await expect(page.getByText("Genres")).toBeVisible();
  });

  test("Back button returns to previous step", async ({ page }) => {
    await page.goto("/join-dj");
    await page.getByPlaceholder("e.g. DJ Mike Beats").fill("DJ Test");
    await page.getByPlaceholder("your@email.com").fill("test@test.com");
    await page.getByRole("button", { name: /next/i }).click();

    await expect(page.getByText("Genres")).toBeVisible();
    await page.getByRole("button", { name: /back/i }).click();
    await expect(page.getByPlaceholder("e.g. DJ Mike Beats")).toBeVisible();
  });

  test("step 2 Next is disabled until genre and price are set", async ({ page }) => {
    await page.goto("/join-dj");
    await page.getByPlaceholder("e.g. DJ Mike Beats").fill("DJ Test");
    await page.getByPlaceholder("your@email.com").fill("test@test.com");
    await page.getByRole("button", { name: /next/i }).click();

    const nextBtn = page.getByRole("button", { name: /next/i });
    await expect(nextBtn).toBeDisabled();

    await page.getByText("EDM").click();
    await page.getByPlaceholder("e.g. 150").fill("100");
    await expect(nextBtn).toBeEnabled();
  });

  test("advances to step 3 (photo)", async ({ page }) => {
    await page.goto("/join-dj");
    await page.getByPlaceholder("e.g. DJ Mike Beats").fill("DJ Test");
    await page.getByPlaceholder("your@email.com").fill("test@test.com");
    await page.getByRole("button", { name: /next/i }).click();

    await page.getByText("EDM").click();
    await page.getByPlaceholder("e.g. 150").fill("100");
    await page.getByRole("button", { name: /next/i }).click();

    await expect(page.getByText(/Profile picture|photo/i)).toBeVisible();
  });

  test("photo step can be skipped with Next", async ({ page }) => {
    await page.goto("/join-dj");
    await page.getByPlaceholder("e.g. DJ Mike Beats").fill("DJ Test");
    await page.getByPlaceholder("your@email.com").fill("test@test.com");
    await page.getByRole("button", { name: /next/i }).click();
    await page.getByText("EDM").click();
    await page.getByPlaceholder("e.g. 150").fill("100");
    await page.getByRole("button", { name: /next/i }).click();
    await page.getByRole("button", { name: /next/i }).click();

    // Step 4 — Bio & Preview should show the entered name
    await expect(page.getByText("DJ Test")).toBeVisible();
  });

  test("step indicator shows correct step count", async ({ page }) => {
    await page.goto("/join-dj");
    await expect(page.getByText(/step 1/i).or(page.getByText(/1 \/ 4/i)).or(page.getByText(/1 of 4/i))).toBeVisible();
  });
});
