import { test, expect } from "@playwright/test";

test.describe("Quote Request Critical Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/quote");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      window.open = () => null;
    });
  });

  test("displays the quote request page with all form fields", async ({ page }) => {
    await expect(page.locator("h1")).toContainText(/Get a Free Quote/i);
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="business"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="quantity"]')).toBeVisible();
    await expect(page.locator('select[name="product"]')).toBeVisible();
    await expect(page.locator('textarea[name="details"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Send quote request via WhatsApp/i }),
    ).toBeVisible();
  });

  test("shows validation error when required fields are missing", async ({ page }) => {
    // Attempt to submit empty form
    await page.getByRole("button", { name: /Send quote request via WhatsApp/i }).click();

    // Verify validation error is shown
    const alert = page.locator('p[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/Please enter your name/i);
  });

  test("shows validation error when invalid phone is provided", async ({ page }) => {
    await page.locator('input[name="name"]').fill("Test Buyer");
    await page.locator('input[name="phone"]').fill("123");
    await page.locator('select[name="product"]').selectOption({ index: 1 });

    await page.getByRole("button", { name: /Send quote request via WhatsApp/i }).click();

    const alert = page.locator('p[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/Please enter a valid phone/i);
  });

  test("successfully submits valid quote and displays WhatsApp completion screen", async ({
    page,
  }) => {
    await page.locator('input[name="name"]').fill("Ayesha Siddiqui");
    await page.locator('input[name="business"]').fill("Ayesha's Bakery");
    await page.locator('input[name="phone"]').fill("03399091707");
    await page.locator('input[name="quantity"]').fill("2500");
    await page.locator('select[name="product"]').selectOption({ index: 1 });
    await page.locator('textarea[name="details"]').fill("Custom cake boxes with gold foil logo.");

    await page.getByRole("button", { name: /Send quote request via WhatsApp/i }).click();

    // Verify submission state
    await expect(
      page.getByRole("heading", { name: /Quote Request Opening in WhatsApp/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Request Another Quote/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open WhatsApp/i })).toBeVisible();

    // Test form reset
    await page.getByRole("button", { name: /Request Another Quote/i }).click();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toHaveValue("");
  });
});
