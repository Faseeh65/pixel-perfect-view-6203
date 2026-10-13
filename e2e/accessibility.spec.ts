import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("WCAG 2.1 AA Accessibility & Keyboard Navigation Suite", () => {
  const routes = [
    { path: "/", name: "Home" },
    { path: "/products", name: "Products" },
    { path: "/industries", name: "Industries" },
    { path: "/how-it-works", name: "How It Works" },
    { path: "/gallery", name: "Gallery" },
    { path: "/about", name: "About" },
    { path: "/contact", name: "Contact" },
    { path: "/quote", name: "Quote" },
    { path: "/privacy", name: "Privacy" },
    { path: "/terms", name: "Terms" },
  ];

  for (const { path, name } of routes) {
    test(`${name} (${path}) passes WCAG 2.1 AA automated axe audits`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.error(
          `Axe violations on ${path}:`,
          JSON.stringify(
            accessibilityScanResults.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              nodes: v.nodes.map((n) => ({ html: n.html, failureSummary: n.failureSummary })),
            })),
            null,
            2,
          ),
        );
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }

  test("Skip to content link is keyboard accessible and focuses main content", async ({ page }) => {
    await page.goto("/");
    // Tab into the page to reach the skip link
    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", { name: /skip to (main )?content/i });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    // Trigger skip link
    await page.keyboard.press("Enter");

    // The main content should now receive focus or URL should end with #main or #main-content
    await expect(page).toHaveURL(/#(main|main-content)$/);
  });

  test("Form inputs have accessible labels and keyboard focusability on /quote", async ({
    page,
  }) => {
    await page.goto("/quote");

    const nameInput = page.getByLabel(/Your name/i);
    await expect(nameInput).toBeVisible();
    await nameInput.focus();
    await expect(nameInput).toBeFocused();

    const phoneInput = page.getByLabel(/Phone \/ WhatsApp/i);
    await expect(phoneInput).toBeVisible();
    await phoneInput.focus();
    await expect(phoneInput).toBeFocused();

    const productSelect = page.getByLabel(/Product/i);
    await expect(productSelect).toBeVisible();
    await productSelect.focus();
    await expect(productSelect).toBeFocused();
  });
});
