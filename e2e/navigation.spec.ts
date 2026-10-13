import { test, expect } from "@playwright/test";

test.describe("Site Navigation & Critical Page Rendering", () => {
  const routes = [
    { path: "/", titleFragment: "Printzy" },
    { path: "/products", titleFragment: "Products" },
    { path: "/industries", titleFragment: "Industries" },
    { path: "/how-it-works", titleFragment: "How It Works" },
    { path: "/gallery", titleFragment: "Gallery" },
    { path: "/about", titleFragment: "About" },
    { path: "/contact", titleFragment: "Contact" },
    { path: "/quote", titleFragment: "Quote" },
    { path: "/privacy", titleFragment: "Privacy" },
    { path: "/terms", titleFragment: "Terms" },
  ];

  for (const route of routes) {
    test(`renders ${route.path} with valid response and header`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);

      // Verify page title
      await expect(page).toHaveTitle(new RegExp(route.titleFragment, "i"));

      // Verify single h1 is present
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // Verify header and footer are visible
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
    });
  }

  test("clicking Get a Quote CTA in hero navigates to /quote", async ({ page }) => {
    await page.goto("/");
    const quoteButton = page.locator("section").first().locator('a[href="/quote"]');
    await quoteButton.click();
    await expect(page).toHaveURL(/\/quote/);
    await expect(page.locator("h1")).toContainText(/Get a Free Quote/i);
  });
});

test.describe("Error Handling & Recovery Flow", () => {
  test("shows custom 404 page for non-existent route and provides home link", async ({ page }) => {
    await page.goto("/non-existent-sample-page-xyz");
    await expect(page.locator("h1")).toContainText("404");
    await expect(page.getByText(/Page not found/i)).toBeVisible();

    // Click Go home link
    const goHomeLink = page.getByRole("link", { name: /Go home/i });
    await expect(goHomeLink).toBeVisible();
    await goHomeLink.click();

    await expect(page).toHaveURL("/");
  });
});
