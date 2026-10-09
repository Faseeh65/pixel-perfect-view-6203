import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PageHero } from "@/components/site/sections";
import { site } from "@/data/site";

export const Route = createFileRoute("/terms")({
  head: () =>
    seo({
      title: "Terms of Service | Printzy",
      description: "Terms and conditions for custom packaging orders with Printzy.",
      path: "/terms",
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHero title="Terms of Service" text="Standard terms and conditions governing packaging orders with Printzy." />
      <section className="section-pad">
        <div className="container-site max-w-3xl space-y-6 text-foreground">
          <div className="rounded-2xl bg-card p-6 shadow-soft md:p-10 space-y-6">
            <h2 className="text-xl font-bold">1. Quotes & Proofs</h2>
            <p className="text-muted-foreground">
              All quotes provided by Printzy are valid for 14 days unless stated otherwise. Production begins only after final digital proof approval and deposit confirmation.
            </p>

            <h2 className="text-xl font-bold">2. Print Variations & Tolerances</h2>
            <p className="text-muted-foreground">
              Slight variations in color matching (CMYK/Pantone) and dimensions (±2mm) may occur due to standard printing and manufacturing processes across paper and cardboard substrates.
            </p>

            <h2 className="text-xl font-bold">3. Delivery & Fulfillment</h2>
            <p className="text-muted-foreground">
              Estimated delivery times are provided in good faith. Printzy works with reliable logistics carriers to ship nationwide, but is not responsible for courier delays beyond our reasonable control.
            </p>

            <h2 className="text-xl font-bold">4. Questions & Support</h2>
            <p className="text-muted-foreground">
              For any questions regarding order terms, contact our support team at{" "}
              <a href={`mailto:${site.email}`} className="text-secondary font-medium underline">
                {site.email}
              </a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
