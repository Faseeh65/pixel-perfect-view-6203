import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { IndustriesSection, WhySection, QuoteCTA } from "@/components/site/sections";

export const Route = createFileRoute("/industries")({
  head: () => seo({ title: "Industries We Serve | Printzy Custom Packaging", description: "Packaging for food chains, cafes, bakeries, cloud kitchens, retail, e-commerce, corporate gifting and events.", path: "/industries" }),
  component: () => (
    <>
      <IndustriesSection heading="h1" />
      <WhySection />
      <QuoteCTA />
    </>
  ),
});
