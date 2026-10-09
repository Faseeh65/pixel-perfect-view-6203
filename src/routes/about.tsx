import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PageHero, WhySection, QuoteCTA } from "@/components/site/sections";
import { images } from "@/data/images";

export const Route = createFileRoute("/about")({
  head: () => seo({ title: "About Printzy | Custom Packaging Company", description: "Printzy helps brands and food businesses stand out with custom printed packaging, low minimums and dependable delivery.", path: "/about" }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero title="About Printzy" text="We make packaging that works hard for your brand." />
      <section className="section-pad">
        <div className="container-site grid items-center gap-10 md:grid-cols-2">
          <img src={images.press} alt="Printing press producing packaging sheets" width={1280} height={832} loading="lazy" className="w-full rounded-2xl object-cover shadow-soft" />
          <div className="space-y-4 text-lg">
            <h2>Built for businesses that care about details</h2>
            <p>Printzy designs and prints custom packaging for cafes, restaurants, bakeries, cloud kitchens, retailers and e-commerce brands.</p>
            <p>We keep things simple. You tell us what you need. We send a design and a clear price. Once you approve, we print and deliver.</p>
            <p>Our minimums are low, so smaller brands can look as polished as the big ones.</p>
          </div>
        </div>
      </section>
      <WhySection />
      <QuoteCTA />
    </>
  );
}
