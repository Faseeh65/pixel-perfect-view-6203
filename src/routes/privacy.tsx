import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PageHero } from "@/components/site/sections";
import { site } from "@/data/site";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seo({
      title: "Privacy Policy | Printzy",
      description: "Learn how Printzy protects and handles your quote request and contact information.",
      path: "/privacy",
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" text="Your privacy is important to us. Here is how we handle your information." />
      <section className="section-pad">
        <div className="container-site max-w-3xl space-y-6 text-foreground">
          <div className="rounded-2xl bg-card p-6 shadow-soft md:p-10 space-y-6">
            <h2 className="text-xl font-bold">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              When you submit a quote request or contact us via WhatsApp, email, or telephone, we collect basic business contact details such as your name, business name, phone number, email address, and order specifications.
            </p>

            <h2 className="text-xl font-bold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use your contact information exclusively to prepare custom packaging quotes, communicate order proofs and updates, process fulfillment, and provide ongoing customer support.
            </p>

            <h2 className="text-xl font-bold">3. Data Sharing & Security</h2>
            <p className="text-muted-foreground">
              Printzy does not sell, rent, or trade customer data to third parties. Information is only shared with verified delivery and logistics partners to fulfill your packaging shipments.
            </p>

            <h2 className="text-xl font-bold">4. Contacting Us</h2>
            <p className="text-muted-foreground">
              If you have any questions regarding your data or wish to update your details, please reach out to us at{" "}
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
