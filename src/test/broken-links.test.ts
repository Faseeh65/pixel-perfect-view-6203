import { describe, it, expect } from "vitest";
import { navLinks, site } from "@/data/site";
import { products } from "@/data/products";
import fs from "node:fs";
import path from "node:path";

const REGISTERED_ROUTES = new Set([
  "/",
  "/about",
  "/contact",
  "/gallery",
  "/how-it-works",
  "/industries",
  "/privacy",
  "/products",
  "/quote",
  "/terms",
]);

describe("Link Integrity & Broken Link Verification", () => {
  it("verifies all navigation links match registered valid routes", () => {
    for (const link of navLinks) {
      expect(REGISTERED_ROUTES.has(link.to)).toBe(true);
    }
  });

  it("verifies sitemap.xml URLs map to registered routes without 404s", () => {
    const sitemapPath = path.resolve(__dirname, "../../public/sitemap.xml");
    const sitemapContent = fs.readFileSync(sitemapPath, "utf-8");

    // Extract all <loc> elements
    const locMatches = sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g);
    const urls = Array.from(locMatches, (m) => m[1]);

    expect(urls.length).toBeGreaterThan(0);

    for (const rawUrl of urls) {
      if (!rawUrl) continue;
      const parsed = new URL(rawUrl);
      const pathname = parsed.pathname;
      expect(REGISTERED_ROUTES.has(pathname)).toBe(true);
    }
  });

  it("verifies WhatsApp and phone links in site configuration are well-formed", () => {
    expect(site.whatsapp).toMatch(/^https:\/\/wa\.me\/92\d{10}/);
    expect(site.phoneHref).toMatch(/^tel:\+92\d{10}$/);
    expect(site.email).toMatch(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
  });

  it("verifies all product slugs are unique and valid target parameters", () => {
    const slugs = new Set<string>();
    for (const p of products) {
      expect(slugs.has(p.slug)).toBe(false);
      slugs.add(p.slug);
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
