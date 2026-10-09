import { describe, expect, it } from "vitest";
import { site } from "@/data/site";
import { faqs } from "@/data/faqs";
import { testimonials } from "@/data/testimonials";

describe("Site Configuration & Content Integrity", () => {
  it("does not contain placeholder domain or URLs", () => {
    expect(site.url).not.toContain("lovable.app");
    expect(site.url).toContain("printzy");
  });

  it("does not contain [confirm] text in FAQs", () => {
    faqs.forEach((faq) => {
      expect(faq.a).not.toContain("[confirm]");
      expect(faq.q).not.toContain("[confirm]");
    });
  });

  it("does not contain 'Placeholder review' in testimonials", () => {
    testimonials.forEach((t) => {
      expect(t.quote).not.toContain("Placeholder review");
      expect(t.name).not.toContain("Customer Name");
    });
  });
});
