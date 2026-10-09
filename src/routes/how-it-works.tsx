import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { HowItWorksSection, FAQ, QuoteCTA } from "@/components/site/sections";

export const Route = createFileRoute("/how-it-works")({
  head: () => seo({ title: "How It Works | Printzy Custom Packaging", description: "Share your requirement, get a design and quote, approve a sample, and we print and deliver. Simple and clear.", path: "/how-it-works" }),
  component: () => (
    <>
      <HowItWorksSection heading="h1" />
      <FAQ />
      <QuoteCTA />
    </>
  ),
});
