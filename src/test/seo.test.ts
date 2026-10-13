import { describe, expect, it } from "vitest";
import { getCanonicalRedirectUrl, seo } from "@/lib/seo";
import { site } from "@/data/site";

describe("SEO Meta Generator", () => {
  it("generates correct title, description, and canonical URL", () => {
    const metaObj = seo({
      title: "Test Title",
      description: "Test Description",
      path: "/about",
    });

    const metaArray = metaObj.meta;
    expect(metaArray).toContainEqual({ title: "Test Title" });
    expect(metaArray).toContainEqual({ name: "description", content: "Test Description" });
    expect(metaArray).toContainEqual({ property: "og:url", content: `${site.url}/about` });
    expect(metaArray).toContainEqual({ property: "og:title", content: "Test Title" });
    expect(metaArray).toContainEqual({ name: "twitter:card", content: "summary_large_image" });
    expect(metaArray).toContainEqual({ name: "twitter:description", content: "Test Description" });
    expect(metaArray).toContainEqual({ property: "og:image", content: `${site.url}/og-image.jpg` });

    const linkArray = metaObj.links;
    expect(linkArray).toContainEqual({ rel: "canonical", href: `${site.url}/about` });
    expect(metaObj.scripts).toHaveLength(1);
    expect(metaObj.scripts[0]?.children).toContain('"@type":"BreadcrumbList"');
  });

  it("supports noindex metadata and additional page structured data", () => {
    const metaObj = seo({
      title: "Private page",
      description: "Not for search results.",
      path: "/quote",
      robots: "noindex, follow",
      structuredData: { "@type": "Product", name: "Custom box" },
    });

    expect(metaObj.meta).toContainEqual({ name: "robots", content: "noindex, follow" });
    expect(metaObj.scripts).toHaveLength(2);
    expect(metaObj.scripts[1]?.children).toContain('"@type":"Product"');
  });
});

describe("Canonical redirects", () => {
  it("redirects legacy domains to the canonical host and preserves path and query", () => {
    const redirect = getCanonicalRedirectUrl(
      new Request("https://printzy.site/quote?product=cups"),
    );

    expect(redirect).toBe("https://printzy.pk/quote?product=cups");
  });

  it("does not redirect canonical HTTPS or local development requests", () => {
    expect(getCanonicalRedirectUrl(new Request("https://printzy.pk/products"))).toBeUndefined();
    expect(getCanonicalRedirectUrl(new Request("http://localhost:5173/products"))).toBeUndefined();
  });
});
