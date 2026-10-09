import { describe, expect, it } from "vitest";
import { seo } from "@/lib/seo";
import { site } from "@/data/site";

describe("SEO Meta Generator", () => {
  it("generates correct title, description, and canonical URL", () => {
    const metaObj = seo({
      title: "Test Title",
      description: "Test Description",
      path: "/test",
    });

    const metaArray = metaObj.meta;
    expect(metaArray).toContainEqual({ title: "Test Title" });
    expect(metaArray).toContainEqual({ name: "description", content: "Test Description" });
    expect(metaArray).toContainEqual({ property: "og:url", content: `${site.url}/test` });
    expect(metaArray).toContainEqual({ property: "og:image", content: `${site.url}/og-image.jpg` });

    const linkArray = metaObj.links;
    expect(linkArray).toContainEqual({ rel: "canonical", href: `${site.url}/test` });
  });
});
