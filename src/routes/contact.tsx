import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { seo } from "@/lib/seo";
import { site } from "@/data/site";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/sections";

export const Route = createFileRoute("/contact")({
  head: () => seo({ title: "Contact Printzy | WhatsApp, Phone & Email", description: "Talk to Printzy about custom packaging. WhatsApp or call 0339 9091707, or email sales.printzy@gmail.com.", path: "/contact" }),
  component: Contact,
});

function Contact() {
  const items = [
    { icon: MessageCircle, title: "WhatsApp", text: "Fastest reply", href: site.whatsapp, label: site.phoneDisplay, ext: true },
    { icon: Phone, title: "Call", text: "During business hours", href: site.phoneHref, label: site.phoneIntl },
    { icon: Mail, title: "Email", text: "For files and detailed briefs", href: `mailto:${site.email}`, label: site.email },
  ];
  return (
    <>
      <PageHero title="Contact Us" text="Choose whichever is easiest. We usually reply within a few hours." />
      <section className="section-pad">
        <div className="container-site grid gap-6 md:grid-cols-3">
          {items.map((i) => (
            <a key={i.title} href={i.href} {...(i.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="rounded-2xl bg-card p-8 card-lift">
              <i.icon aria-hidden className="mb-4 size-8 text-secondary" />
              <h2 className="text-xl">{i.title}</h2>
              <p className="text-sm">{i.text}</p>
              <p className="mt-3 break-all font-display font-semibold text-foreground">{i.label}</p>
            </a>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild size="lg"><Link to="/quote">Get a Free Quote</Link></Button>
        </div>
      </section>
    </>
  );
}
