import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { Hero, TrustBar, ProductsSection, IndustriesSection, HowItWorksSection, CustomizeSection, WhySection, FeaturedWork, Testimonials, FAQ, QuoteCTA } from "@/components/site/sections";

export const Route = createFileRoute("/")({
  head: () => seo({ title: "Printzy | Custom Printed Packaging for Brands & Food Chains", description: "Custom printed boxes, cups, napkins, paper bags and takeaway packaging. Low MOQ, free design support and nationwide delivery. Get a quote in 24 hours.", path: "/" }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ProductsSection />
      <IndustriesSection />
      <HowItWorksSection />
      <CustomizeSection />
      <WhySection />
      <FeaturedWork />
      <Testimonials />
      <FAQ />
      <QuoteCTA />
    </>
  );
}
